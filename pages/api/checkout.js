import mongoose from "mongoose";
import { mongooseConnect } from "@/lib/mongoose";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import { Product } from "@/models/Product";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  await mongooseConnect();

  const { customer, items, subtotal, shippingCost } = req.body;

  if (!customer || items.length === 0) {
    return res.status(400).json({ message: "Missing data" });
  }

  try {
    // Save or find existing customer by phone
    let existing = await Customer.findOne({ phone: customer.phone });
    if (!existing) {
      existing = await Customer.create(customer);
    }

    // Enrich items with product name
const detailedItems = await Promise.all(
  items.map(async (item) => {
    let product = null;
    if (mongoose.Types.ObjectId.isValid(item.productId)) {
      try {
         product = await Product.findById(item.productId);
        if (!product) {
          console.warn("No product found with ID:", item.productId);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      }
    } else {
      console.warn("Invalid productId format:", item.productId);
    }

    return {
      productId: item.productId,
      name: product?.name || "Unknown Product",
      quantity: item.quantity,
      price: item.price,
    };
  })
);



    // Save the order
    const order = await Order.create({
      customer: existing._id,
      items: detailedItems,
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
    });

    return res.status(200).json({ message: "Order placed", orderId: order._id });
  } catch (err) {
    console.error("Checkout Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
