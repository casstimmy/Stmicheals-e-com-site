import Order from "@/models/Order";
import { Product } from "@/models/Product";
import { getAvailableInventoryQuantity } from "@/lib/inventory";
import { sendOrderPlacedEmail, sendOrderProcessingEmail } from "@/lib/orderStatusEmail";

// 24 hours — enough time for warehouse staff to confirm and process orders before expiry
export const RESERVATION_WINDOW_MINUTES = 1440;

class OrderLifecycleError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "OrderLifecycleError";
    this.statusCode = statusCode;
  }
}

function resolveProductId(item) {
  return item?.productId?._id || item?.productId;
}

async function reserveInventoryForOrderItems(orderItems) {
  const reservedItems = [];

  try {
    for (const item of orderItems) {
      const quantity = Number(item.quantity || 0);
      const productId = resolveProductId(item);

      const reservedProduct = await Product.findOneAndUpdate(
        {
          _id: productId,
          $expr: {
            $gte: [
              {
                $subtract: ["$quantity", { $ifNull: ["$reservedQuantity", 0] }],
              },
              quantity,
            ],
          },
        },
        { $inc: { reservedQuantity: quantity } },
        { new: true }
      );

      if (!reservedProduct) {
        throw new OrderLifecycleError(
          `Inventory changed before checkout could complete for ${item.name}. Please review your cart and try again.`,
          409
        );
      }

      reservedItems.push({ productId, quantity });
    }
  } catch (error) {
    for (const reservedItem of reservedItems) {
      await Product.findByIdAndUpdate(reservedItem.productId, {
        $inc: { reservedQuantity: -(reservedItem.quantity || 0) },
      });
    }

    throw error;
  }
}

async function releaseReservedInventory(order) {
  for (const item of order.items || []) {
    const productId = resolveProductId(item);
    if (!productId) {
      continue;
    }

    await Product.findByIdAndUpdate(productId, {
      $inc: { reservedQuantity: -(item.quantity || 0) },
    });
  }
}

export async function createReservedOrder({ customer, customerId, orderDraft }) {
  const reservationExpiresAt = new Date(
    Date.now() + RESERVATION_WINDOW_MINUTES * 60 * 1000
  );

  const shippingDetails = {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    city: customer.city,
  };

  await reserveInventoryForOrderItems(orderDraft.orderItems);

  try {
    const createdOrder = await Order.create({
      customer: customerId,
      siteKey: orderDraft.siteKey,
      locationId: orderDraft.locationId || null,
      locationName: orderDraft.locationName || "",
      customerSnapshot: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        type: customer.type || "ONLINE",
      },
      shippingDetails,
      items: orderDraft.orderItems,
      cartProducts: orderDraft.orderItems,
      subtotal: orderDraft.subtotal,
      shippingCost: orderDraft.shippingCost,
      total: orderDraft.total,
      status: "Inventory Reserved",
      paid: false,
      paymentStatus: "Pending",
      paymentChannel: "manual-entry",
      reservationStatus: "active",
      reservationExpiresAt,
    });

    await sendOrderPlacedEmail(createdOrder);

    return createdOrder;
  } catch (error) {
    for (const item of orderDraft.orderItems) {
      const productId = resolveProductId(item);
      if (!productId) {
        continue;
      }

      await Product.findByIdAndUpdate(productId, {
        $inc: { reservedQuantity: -(item.quantity || 0) },
      });
    }

    throw error;
  }
}

export async function releaseOrderReservation(
  orderId,
  {
    status = "Reservation Expired",
    paymentStatus = "Expired",
    cancellationReason = "Reservation expired before payment completion.",
  } = {}
) {
  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      paid: false,
      reservationStatus: "active",
    },
    {
      $set: {
        reservationStatus: "releasing",
      },
    },
    { new: true }
  );

  if (!order) {
    return Order.findById(orderId).populate("customer").populate("items.productId");
  }

  await releaseReservedInventory(order);

  return Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        reservationStatus: "released",
        reservationReleasedAt: new Date(),
        status,
        paymentStatus,
        cancellationReason,
      },
    },
    { new: true }
  )
    .populate("customer")
    .populate("items.productId");
}

export async function releaseExpiredReservations() {
  const expiredOrders = await Order.find({
    paid: false,
    reservationStatus: "active",
    reservationExpiresAt: { $lte: new Date() },
  }).select("_id");

  for (const order of expiredOrders) {
    await releaseOrderReservation(order._id);
  }

  return expiredOrders.length;
}

export async function finalizeOrderPayment({
  orderId,
  reference,
  amountInKobo,
  paymentStatus = "success",
  paymentChannel = "paystack",
}) {
  const existingOrder = await Order.findById(orderId)
    .populate("customer")
    .populate("items.productId");

  if (!existingOrder) {
    throw new OrderLifecycleError("Order not found", 404);
  }

  const expectedAmount = Math.round((existingOrder.total || 0) * 100);
  if (amountInKobo && expectedAmount !== amountInKobo) {
    throw new OrderLifecycleError("Payment amount mismatch", 400);
  }

  if (existingOrder.paid) {
    return { order: existingOrder, alreadyProcessed: true };
  }

  // Guard: if admin already delivered and decremented inventory, skip the deduction here
  // to prevent double-processing. Still mark as paid so the order record is correct.
  const skipInventoryDeduction = existingOrder.inventoryFinalizedBy === "admin";

  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      paid: false,
      reservationStatus: "active",
    },
    {
      $set: {
        paid: true,
        paymentReference: reference,
        paymentStatus: "Paid",
        paymentChannel,
        status: "Processing",
        reservationStatus: "finalizing",
        finalizedAt: new Date(),
      },
    },
    { new: true }
  )
    .populate("customer")
    .populate("items.productId");

  if (!order) {
    const refreshedOrder = await Order.findById(orderId)
      .populate("customer")
      .populate("items.productId");

    if (refreshedOrder?.paid) {
      return { order: refreshedOrder, alreadyProcessed: true };
    }

    throw new OrderLifecycleError(
      "This order reservation is no longer active. Please contact support for payment review.",
      409
    );
  }

  for (const item of order.items) {
    const productId = resolveProductId(item);
    if (!productId) {
      continue;
    }

    if (!skipInventoryDeduction) {
      await Product.findByIdAndUpdate(productId, {
        $inc: {
          quantity: -(item.quantity || 0),
          reservedQuantity: -(item.quantity || 0),
        },
      });
    } else {
      // Inventory already decremented by admin — only release the reservation hold
      await Product.updateOne(
        { _id: productId },
        [{ $set: { reservedQuantity: { $max: [0, { $subtract: ["$reservedQuantity", item.quantity || 0] }] } } }]
      );
    }
  }

  const finalizedOrder = await Order.findByIdAndUpdate(
    orderId,
    {
      $set: {
        paymentReference: reference,
        paymentStatus: paymentStatus === "success" ? "Paid" : paymentStatus,
        paymentChannel,
        ...(!skipInventoryDeduction && { inventoryFinalizedBy: "paystack" }),
        status: "Processing",
        reservationStatus: "finalized",
        reservationReleasedAt: new Date(),
        finalizedAt: new Date(),
      },
    },
    { new: true }
  )
    .populate("customer")
    .populate("items.productId");

  await sendOrderProcessingEmail(finalizedOrder);

  return {
    order: finalizedOrder,
    alreadyProcessed: false,
  };
}