import { mongooseConnect } from "@/lib/mongoose";
import { releaseExpiredReservations } from "@/lib/orderLifecycle";
import Order from "@/models/Order";

export default async function handler(req, res) {
  try {
    await mongooseConnect();

    const { id } = req.query;

    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    await releaseExpiredReservations();

    const order = await Order.findById(id)
      .populate("customer")
      .populate("items.productId"); // Ensure this is populated
    // Populate items.productId to get product details if needed

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
}
