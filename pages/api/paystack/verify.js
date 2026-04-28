// pages/api/paystack/verify.js

import { mongooseConnect } from "@/lib/mongoose";
import Order from "@/models/Order";
import { Product } from "@/models/Product";
import axios from "axios";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  await mongooseConnect();

  const { reference } = req.body;

  if (!reference) {
    return res.status(400).json({ error: "Missing reference" });
  }

  try {
    // Verify payment with Paystack
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = response.data?.data;
    if (!data || data.status !== "success") {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    const order = await Order.findOneAndUpdate(
      { _id: data.metadata.orderId },
      {
        paid: true,
        paymentReference: data.reference,
        paymentStatus: data.status,
        status: "Processing",
      },
      { new: true }
    ).populate("customer").populate("items.productId");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Deduct inventory for each ordered item
    for (const item of order.items) {
      if (item.productId) {
        await Product.findByIdAndUpdate(
          item.productId._id || item.productId,
          { $inc: { quantity: -(item.quantity || 1) } }
        );
      }
    }

    // Send confirmation email (non-blocking - don't fail order if email fails)
    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const itemList = order.items.map(
          (item) => `${item.name} (x${item.quantity}) - ₦${item.price}`
        ).join("\n");

        await transporter.sendMail({
          from: `Shop <${process.env.EMAIL_USER}>`,
          to: order.customer.email,
          subject: "Order Confirmation",
          text: `Hi ${order.customer.name},\n\nThank you for your order!\n\nOrder ID: ${order._id}\nReference: ${order.paymentReference}\nTotal: ₦${order.total}\n\nItems:\n${itemList}\n\nWe are processing your order.\n\nThank you for shopping with us.`,
        });
      }
    } catch (emailError) {
      console.error("Email send failed (non-critical):", emailError.message);
    }

    return res.json({ success: true, order });
  } catch (error) {
    console.error("Verify Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
