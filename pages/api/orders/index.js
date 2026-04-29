import Customer from "@/models/Customer";
import Order from "@/models/Order";
import { mongooseConnect } from "@/lib/mongoose";
import { buildOrderDraft } from "@/lib/checkout";

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
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
      { $set: orderDraft.customer },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // Create order
    const newOrder = await Order.create({
      customer: existingCustomer._id,
      items: orderDraft.orderItems,
      subtotal: orderDraft.subtotal,
      shippingCost: orderDraft.shippingCost,
      total: orderDraft.total,
      status: "Pending Payment",
      paid: false,
      paymentStatus: "Pending",
    });

    return res.status(201).json({
      success: true,
      orderId: newOrder._id,
      totals: {
        subtotal: orderDraft.subtotal,
        shippingCost: orderDraft.shippingCost,
        total: orderDraft.total,
      },
      shippingQuote: orderDraft.shippingQuote,
      message: "Order successfully created",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      message: "Error creating order",
      error: error.message,
    });
  }
}
