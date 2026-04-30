import mongoose from "mongoose";
import { Product } from "@/models/Product";
import { attachCategoryNames } from "@/lib/productCategories";
import { mongooseConnect } from "@/lib/mongoose";
import {
  getSeededStorefrontProductById,
  getSeededStorefrontProducts,
  getSeededStorefrontProductsByIds,
} from "./seededStorefront";

function sortProductsByNewest(products) {
  return [...products].sort(
    (leftProduct, rightProduct) =>
      new Date(rightProduct.createdAt || 0) - new Date(leftProduct.createdAt || 0)
  );
}

function applyLimit(products, limit) {
  if (!Number.isFinite(limit) || limit <= 0) {
    return products;
  }

  return products.slice(0, limit);
}

async function getDatabaseBackedProducts(limit) {
  const products = await Product.find({}, null, {
    sort: { _id: -1 },
    limit: Number.isFinite(limit) && limit > 0 ? limit : 0,
  }).lean();

  return products.length ? attachCategoryNames(products) : [];
}

export async function getStorefrontProducts(options = {}) {
  const { limit } = options;
  const connection = await mongooseConnect({ allowFailure: true });

  if (connection) {
    const databaseProducts = await getDatabaseBackedProducts(limit);
    if (databaseProducts.length) {
      return databaseProducts;
    }
  }

  return applyLimit(sortProductsByNewest(getSeededStorefrontProducts()), limit);
}

export async function getStorefrontProductById(productId, options = {}) {
  const { fallbackToLatest = false } = options;
  const connection = await mongooseConnect({ allowFailure: true });

  if (connection && productId) {
    try {
      const product = await Product.findById(productId).lean();
      if (product) {
        return attachCategoryNames(product);
      }
    } catch {
      // Fall through to latest-product or seeded fallback resolution.
    }
  }

  if (connection && fallbackToLatest) {
    const latestDatabaseProduct = await Product.findOne({}, null, { sort: { _id: -1 } }).lean();
    if (latestDatabaseProduct) {
      return attachCategoryNames(latestDatabaseProduct);
    }
  }

  if (productId) {
    const seededProduct = getSeededStorefrontProductById(productId);
    if (seededProduct) {
      return seededProduct;
    }
  }

  if (fallbackToLatest) {
    return getSeededStorefrontProducts()[0] || null;
  }

  return null;
}

export async function getStorefrontProductsByIds(ids = []) {
  const normalizedIds = Array.isArray(ids) ? ids : [];
  const connection = await mongooseConnect({ allowFailure: true });

  if (connection) {
    const objectIds = normalizedIds
      .filter((id) => mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (objectIds.length) {
      const products = await Product.find({ _id: { $in: objectIds } }).lean();
      if (products.length) {
        return attachCategoryNames(products);
      }
    }
  }

  return getSeededStorefrontProductsByIds(normalizedIds);
}