import haversine from "haversine-distance";

const STORE_LOCATION = { lat: 6.5244, lon: 3.3792 }; // Example: Lagos

export default async function handler(req, res) {
  const { destination } = req.body;

  // Mock mapping for demo (replace with actual geocoding later)
  const cityCoordinates = {
    Lagos: { lat: 6.5244, lon: 3.3792 },
    Abuja: { lat: 9.0579, lon: 7.4951 },
    Ibadan: { lat: 7.3775, lon: 3.947 },
    PortHarcourt: { lat: 4.8156, lon: 7.0498 },
  };

  const customerLocation = cityCoordinates[destination];

  if (!customerLocation) {
    return res.status(400).json({ error: "Unknown destination" });
  }

  const distanceInMeters = haversine(STORE_LOCATION, customerLocation);
  const distanceInKm = distanceInMeters / 1000;

  // Pricing rule: ₦2000 base + ₦100/km
  const cost = 2000 + Math.ceil(distanceInKm * 100);
  console.log("Shipping cost calculation:", {
    distanceInKm,
    baseCost: 2000,
    perKmCost: 100,
    totalCost: cost,
  });

  res.json({ cost });
}
