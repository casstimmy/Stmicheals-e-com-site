import {
  getShippingQuote,
  SUPPORTED_SHIPPING_DESTINATIONS,
} from "@/lib/shipping";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { destination } = req.body;
  if (!destination) {
    return res.status(400).json({ error: "Destination is required" });
  }

  const quote = getShippingQuote(destination);
  res.status(200).json({
    ...quote,
    availableDestinations: SUPPORTED_SHIPPING_DESTINATIONS,
  });
}
