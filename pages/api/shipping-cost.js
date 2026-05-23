import {
  getShippingQuote,
  SUPPORTED_SHIPPING_DESTINATIONS,
} from "@/lib/shipping";
import { mongooseConnect } from "@/lib/mongoose";
import Store from "@/models/Store";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { destination } = req.body;
  if (!destination) {
    return res.status(400).json({ error: "Destination is required" });
  }

  await mongooseConnect();
  const store = await Store.findOne({})
    .select("shippingBaseCost shippingRatePerKm shippingFallbackCost")
    .lean();

  const quote = getShippingQuote(destination, store || {});
  res.status(200).json({
    ...quote,
    availableDestinations: SUPPORTED_SHIPPING_DESTINATIONS,
  });
}
