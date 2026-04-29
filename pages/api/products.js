import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { ObjectId } from "mongodb";
import { attachCategoryNames } from "@/lib/productCategories";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();

  if (method === "GET") {
    if (req.query?.id) {
      try {
        const product = await Product.findOne({ _id: req.query.id }).lean();
        const resolvedProduct = await attachCategoryNames(product);
        return res.json(resolvedProduct);
      } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch this product" });
      }
    } else {
      try {
        const products = await Product.find().lean();
        const resolvedProducts = await attachCategoryNames(products);
        return res.json(resolvedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ success: false, message: "Failed to fetch products" });
      }
    }
  } 
  else if (method === "POST") {
    // Fetch multiple products by array of ids
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids)) {
        return res.status(400).json({ success: false, message: "Invalid 'ids' array" });
      }
      // Convert to ObjectId array safely
      const objectIds = ids.map(id => new ObjectId(id));
      const products = await Product.find({ _id: { $in: objectIds } }).lean();
      const resolvedProducts = await attachCategoryNames(products);
      return res.json({ products: resolvedProducts });
    } catch (error) {
      console.error("Error fetching multiple products:", error);
      return res.status(500).json({ success: false, message: "Failed to fetch products" });
    }
  }

  return res.status(405).json({ success: false, message: "Method not allowed" });
}
