import { mongooseConnect } from "@/lib/mongoose";
import HotelBooking from "@/models/HotelBooking";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await mongooseConnect();

  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    return res.status(400).json({ message: "Booking id is required." });
  }

  try {
    const booking = await HotelBooking.findById(id).populate("roomProduct");

    if (!booking) {
      return res.status(404).json({ message: "Booking request not found." });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.error("Hotel booking fetch error:", error);
    return res.status(500).json({ message: "We could not load this booking request." });
  }
}