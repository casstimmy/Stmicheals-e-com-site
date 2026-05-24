import { getShippingQuote, SUPPORTED_SHIPPING_DESTINATIONS } from "@/lib/shipping";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { destination } = req.body || {};
  if (typeof destination !== "string" || !destination.trim()) {
    return res.status(400).json({ error: "destination is required" });
  }

  const quote = getShippingQuote(destination);

  return res.status(200).json({
    success: true,
    availableDestinations: SUPPORTED_SHIPPING_DESTINATIONS,
    ...quote,
  });
}
