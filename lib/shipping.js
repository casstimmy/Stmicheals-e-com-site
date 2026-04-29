import haversine from "haversine-distance";

export const STORE_LOCATION = { lat: 6.5244, lon: 3.3792 };
export const BASE_SHIPPING_COST = 2000;
export const SHIPPING_RATE_PER_KM = 100;

export const SHIPPING_DESTINATIONS = {
  lagos: { label: "Lagos", lat: 6.5244, lon: 3.3792 },
  abuja: { label: "Abuja", lat: 9.0579, lon: 7.4951 },
  ibadan: { label: "Ibadan", lat: 7.3775, lon: 3.947 },
  portharcourt: { label: "Port Harcourt", lat: 4.8156, lon: 7.0498 },
};

export const SUPPORTED_SHIPPING_DESTINATIONS = Object.values(
  SHIPPING_DESTINATIONS
).map((destination) => destination.label);

function normalizeDestination(destination) {
  return typeof destination === "string"
    ? destination.toLowerCase().replace(/[^a-z]/g, "")
    : "";
}

export function getShippingQuote(destination) {
  const normalizedDestination = normalizeDestination(destination);
  const customerLocation = SHIPPING_DESTINATIONS[normalizedDestination];

  if (!customerLocation) {
    return {
      cost: BASE_SHIPPING_COST,
      baseCost: BASE_SHIPPING_COST,
      perKmCost: SHIPPING_RATE_PER_KM,
      distanceInKm: 0,
      destination:
        typeof destination === "string" && destination.trim()
          ? destination.trim()
          : "Unspecified destination",
      isFallback: true,
    };
  }

  const distanceInMeters = haversine(STORE_LOCATION, customerLocation);
  const distanceInKm = distanceInMeters / 1000;
  const cost = BASE_SHIPPING_COST + Math.ceil(distanceInKm * SHIPPING_RATE_PER_KM);

  return {
    cost,
    baseCost: BASE_SHIPPING_COST,
    perKmCost: SHIPPING_RATE_PER_KM,
    distanceInKm,
    destination: customerLocation.label,
    isFallback: false,
  };
}