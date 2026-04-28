import { mongooseConnect } from "@/lib/mongoose";
import Order from "@/models/Order";
import Customer from "@/models/Customer";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await mongooseConnect();

  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(200).json([]);
    }

    const orders = await Order.find({ customer: customer._id })
      .sort({ createdAt: -1 })
      .populate("items.productId");

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders by email:", error);
    return res.status(500).json({ message: "Server Error" });
  }
}
