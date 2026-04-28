import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";

export default async function handler(req, res) {
  await mongooseConnect();
  const { id } = req.query;

  if (req.method === "POST") {
    const { title, text, rating, customerName, customerId } = req.body;

    if (!title || !text || !rating) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    const review = {
      title,
      text,
      rating,
      customerName,
      customerId,
      createdAt: new Date(),
    };

    product.reviews.push(review);
    await product.save();

    res.status(200).json({ message: "Review added", review });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
