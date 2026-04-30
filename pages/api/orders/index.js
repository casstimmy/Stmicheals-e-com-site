import Customer from "@/models/Customer";
import { mongooseConnect } from "@/lib/mongoose";
import { buildOrderDraft } from "@/lib/checkout";
import {
  createReservedOrder,
  releaseExpiredReservations,
  RESERVATION_WINDOW_MINUTES,
} from "@/lib/orderLifecycle";

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await releaseExpiredReservations();

    const { customer, cartProducts } = req.body;
    const orderDraft = await buildOrderDraft({ customer, cartProducts });

    if (orderDraft.errors?.length) {
      return res.status(400).json({
        message: orderDraft.errors[0],
        errors: orderDraft.errors,
      });
    }

    const existingCustomer = await Customer.findOneAndUpdate(
      { email: orderDraft.customer.email },
      { $set: { ...orderDraft.customer, type: "ONLINE" } },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const newOrder = await createReservedOrder({
      customer: existingCustomer,
      customerId: existingCustomer._id,
      orderDraft,
    });

    return res.status(201).json({
      success: true,
      orderId: newOrder._id,
      totals: {
        subtotal: orderDraft.subtotal,
        shippingCost: orderDraft.shippingCost,
        total: orderDraft.total,
      },
      reservation: {
        expiresAt: newOrder.reservationExpiresAt,
        windowMinutes: RESERVATION_WINDOW_MINUTES,
      },
      shippingQuote: orderDraft.shippingQuote,
      message: "Order successfully created",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(error.statusCode || 500).json({
      message: "Error creating order",
      error: error.message,
    });
  }
}
