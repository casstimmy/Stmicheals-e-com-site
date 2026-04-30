import mongoose from "mongoose";
import { Product } from "@/models/Product";
import { attachCategoryNames } from "@/lib/productCategories";
import { mongooseConnect } from "@/lib/mongoose";
import {
  getSeededStorefrontProductById,
  getSeededStorefrontProducts,
  getSeededStorefrontProductsByIds,
} from "./seededStorefront";

const CATALOG_CACHE_TTL_MS = 20_000;

const globalStorefrontState = globalThis;
const cachedCatalogState = globalStorefrontState.__stMichaelsCatalogState ?? {
  products: null,
  expiresAt: 0,
  pending: null,
};

if (!globalStorefrontState.__stMichaelsCatalogState) {
  globalStorefrontState.__stMichaelsCatalogState = cachedCatalogState;
}

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
  if (cachedCatalogState.products && cachedCatalogState.expiresAt > Date.now()) {
    return applyLimit(cachedCatalogState.products, limit);
  }

  if (!cachedCatalogState.pending) {
    cachedCatalogState.pending = Product.find({}, null, { sort: { _id: -1 } })
      .lean()
      .then((products) => (products.length ? attachCategoryNames(products) : []))
      .then((products) => {
        cachedCatalogState.products = products;
        cachedCatalogState.expiresAt = Date.now() + CATALOG_CACHE_TTL_MS;
        return products;
      })
      .finally(() => {
        cachedCatalogState.pending = null;
      });
  }

  const products = await cachedCatalogState.pending;
  return applyLimit(products, limit);
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
    const products = await getDatabaseBackedProducts();
    const product = products.find((candidate) => String(candidate._id) === String(productId));
    if (product) {
      return product;
    }
  }

  if (connection && fallbackToLatest) {
    const products = await getDatabaseBackedProducts();
    if (products.length) {
      return products[0];
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
    const products = await getDatabaseBackedProducts();
    const productsById = new Map(products.map((product) => [String(product._id), product]));
    const matchedProducts = normalizedIds
      .map((id) => productsById.get(String(id)))
      .filter(Boolean);

    if (matchedProducts.length) {
      return matchedProducts;
    }
  }

  return getSeededStorefrontProductsByIds(normalizedIds);
}