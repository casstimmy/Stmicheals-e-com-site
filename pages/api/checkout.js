import { mongooseConnect } from "@/lib/mongoose";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import { buildOrderDraft } from "@/lib/checkout";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  await mongooseConnect();

  try {
    const orderDraft = await buildOrderDraft({
      customer: req.body.customer,
      cartProducts: req.body.items || req.body.cartProducts,
    });

    if (orderDraft.errors?.length) {
      return res.status(400).json({
        message: orderDraft.errors[0],
        errors: orderDraft.errors,
      });
    }

    const existing = await Customer.findOneAndUpdate(
      { email: orderDraft.customer.email },
      { $set: orderDraft.customer },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    const order = await Order.create({
      customer: existing._id,
      items: orderDraft.orderItems,
      subtotal: orderDraft.subtotal,
      shippingCost: orderDraft.shippingCost,
      total: orderDraft.total,
      status: "Pending Payment",
      paid: false,
      paymentStatus: "Pending",
    });

    return res.status(200).json({
      message: "Order placed",
      orderId: order._id,
      totals: {
        subtotal: orderDraft.subtotal,
        shippingCost: orderDraft.shippingCost,
        total: orderDraft.total,
      },
    });
  } catch (err) {
    console.error("Checkout Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
