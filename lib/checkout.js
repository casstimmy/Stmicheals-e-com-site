import mongoose from "mongoose";
import { Product } from "@/models/Product";
import { normalizeProductImages } from "@/lib/productImages";
import { getShippingQuote } from "@/lib/shipping";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function normalizeQuantity(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 1;
  }

  return Math.max(1, Math.floor(parsed));
}

function resolveCartProductId(item) {
  if (!item || typeof item !== "object") {
    return "";
  }

  const candidate = item._id || item.productId || item.id;
  return typeof candidate === "string" ? candidate.trim() : "";
}

export function normalizeCustomer(customer = {}) {
  return {
    name: cleanText(customer.name),
    email: cleanText(customer.email).toLowerCase(),
    phone: cleanText(customer.phone),
    address: cleanText(customer.address),
    city: cleanText(customer.city),
  };
}

export function validateCustomer(customer) {
  const errors = [];

  if (!customer.name) errors.push("Full name is required.");
  if (!customer.email) errors.push("Email address is required.");
  if (customer.email && !EMAIL_REGEX.test(customer.email)) {
    errors.push("Enter a valid email address.");
  }

  const phoneDigits = customer.phone.replace(/\D/g, "");
  if (!customer.phone) errors.push("Phone number is required.");
  if (customer.phone && phoneDigits.length < 10) {
    errors.push("Enter a valid phone number with at least 10 digits.");
  }

  if (!customer.address) errors.push("Street address is required.");
  if (!customer.city) errors.push("Delivery city is required.");

  return errors;
}

export async function buildOrderDraft({ customer, cartProducts }) {
  const normalizedCustomer = normalizeCustomer(customer);
  const customerErrors = validateCustomer(normalizedCustomer);
  if (customerErrors.length) {
    return { errors: customerErrors };
  }

  if (!Array.isArray(cartProducts) || cartProducts.length === 0) {
    return { errors: ["Your cart is empty."] };
  }

  const requestedQuantities = new Map();
  const invalidProductIds = [];

  for (const item of cartProducts) {
    const productId = resolveCartProductId(item);
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      invalidProductIds.push(productId || "unknown");
      continue;
    }

    const quantity = normalizeQuantity(item.quantity || item.qty || 1);
    requestedQuantities.set(productId, (requestedQuantities.get(productId) || 0) + quantity);
  }

  if (!requestedQuantities.size) {
    return { errors: ["Your cart does not contain valid products."] };
  }

  if (invalidProductIds.length) {
    return { errors: ["One or more items in your cart are invalid. Please refresh your cart and try again."] };
  }

  const productIds = [...requestedQuantities.keys()].map(
    (productId) => new mongoose.Types.ObjectId(productId)
  );

  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productsById = new Map(products.map((product) => [String(product._id), product]));
  const orderItems = [];
  const itemErrors = [];

  for (const [productId, quantity] of requestedQuantities.entries()) {
    const product = productsById.get(productId);
    if (!product) {
      itemErrors.push("One or more products in your cart are no longer available.");
      continue;
    }

    const availableQuantity = Number.isFinite(product.quantity) ? product.quantity : 0;
    if (availableQuantity <= 0) {
      itemErrors.push(`${product.name} is out of stock.`);
      continue;
    }

    if (availableQuantity < quantity) {
      itemErrors.push(`Only ${availableQuantity} unit(s) of ${product.name} are available.`);
      continue;
    }

    const imageSnapshots = normalizeProductImages(product.images).map((image) => image.full);

    orderItems.push({
      productId: product._id,
      quantity,
      price: product.salePriceIncTax || 0,
      name: product.name,
      category: product.category || "N/A",
      description: product.description || "",
      images: imageSnapshots,
    });
  }

  if (itemErrors.length) {
    return { errors: itemErrors };
  }

  const subtotal = orderItems.reduce(
    (runningTotal, item) => runningTotal + item.price * item.quantity,
    0
  );
  const shippingQuote = getShippingQuote(normalizedCustomer.city);
  const shippingCost = shippingQuote.cost;
  const total = subtotal + shippingCost;

  return {
    customer: normalizedCustomer,
    orderItems,
    subtotal,
    shippingCost,
    total,
    shippingQuote,
  };
}