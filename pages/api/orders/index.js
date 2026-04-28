import mongoose from "mongoose";
import Customer from "@/models/Customer";
import Order from "@/models/Order";
import { Product} from "@/models/Product"; // ✅ default import
import { mongooseConnect } from "@/lib/mongoose";

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { customer, cartProducts, subtotal, shippingCost, total } = req.body;

    // Validate required fields
    if (!customer || !cartProducts || !subtotal || !shippingCost || !total) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Validate phone (basic: at least 10 digits)
    const phoneDigits = (customer.phone || "").replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // Check if customer exists or create a new one
    let existingCustomer = await Customer.findOne({ email: customer.email });
    if (!existingCustomer) {
      existingCustomer = await Customer.create(customer);
    }

    // Extract product IDs from cart items
    const productIds = cartProducts
      .map((item) => item._id || item.productId)
      .filter(Boolean);

    // Fetch fresh product data
    const productsFromDb = await Product.find({
      _id: { $in: productIds },
    });

    // Map each cart item with database data
    const orderItems = cartProducts.map((cartItem) => {
      const prod = productsFromDb.find(
        (p) => p._id.toString() === (cartItem._id || cartItem.productId)
      );

      return {
        productId: prod ? prod._id : new mongoose.Types.ObjectId(cartItem._id || cartItem.productId),
        quantity: cartItem.quantity || 1,
        price: prod ? prod.salePriceIncTax : cartItem.salePriceIncTax || 0,
        name: prod ? prod.name : cartItem.name || "Unnamed Product",
        category: prod ? prod.category : cartItem.category || "N/A",
        description: prod ? prod.description : cartItem.description || "",
        images: prod ? prod.images : cartItem.images || [],
      };
    });

    // Create order
    const newOrder = await Order.create({
      customer: existingCustomer._id,
      items: orderItems,
      subtotal,
      shippingCost,
      total,
      status: "Pending",
      paid: false,
      paymentStatus: "Pending",
    });

    return res.status(201).json({
      success: true,
      orderId: newOrder._id,
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
