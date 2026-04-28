import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import mongoose from "mongoose";

export default async function handler(req, res) {
  await mongooseConnect();

  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: "Invalid or missing 'ids' array" });
  }

  try {
    const objectIds = ids.map(id => new mongoose.Types.ObjectId(id));
    const products = await Product.find({ _id: { $in: objectIds } });
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
