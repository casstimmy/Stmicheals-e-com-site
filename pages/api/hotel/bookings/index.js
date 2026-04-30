import { mongooseConnect } from "@/lib/mongoose";
import mongoose from "mongoose";
import { Product } from "@/models/Product";
import HotelBooking from "@/models/HotelBooking";
import { PUBLIC_SITE_KEYS, productMatchesPublicSite } from "@/lib/publicSite";
import { createMailTransport, getMailFromAddress } from "@/lib/mail";
import { STORE_DETAILS } from "@/lib/storeDetails";

const MS_PER_NIGHT = 24 * 60 * 60 * 1000;

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeInteger(value, fallbackValue) {
  const parsedValue = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
}

function toUtcMidnight(value) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return new Date(Date.UTC(parsedDate.getUTCFullYear(), parsedDate.getUTCMonth(), parsedDate.getUTCDate()));
}

function calculateNightCount(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) {
    return 0;
  }

  return Math.round((checkOutDate.getTime() - checkInDate.getTime()) / MS_PER_NIGHT);
}

function validatePayload(payload) {
  const guestName = normalizeString(payload.guestName);
  const email = normalizeString(payload.email).toLowerCase();
  const phone = normalizeString(payload.phone);
  const roomId = normalizeString(payload.roomId);
  const roomName = normalizeString(payload.roomName);
  const preferredArrivalTime = normalizeString(payload.preferredArrivalTime);
  const specialRequests = normalizeString(payload.specialRequests);
  const adults = Math.max(1, normalizeInteger(payload.adults, 1));
  const children = Math.max(0, normalizeInteger(payload.children, 0));
  const checkInDate = toUtcMidnight(payload.checkInDate);
  const checkOutDate = toUtcMidnight(payload.checkOutDate);
  const nights = calculateNightCount(checkInDate, checkOutDate);
  const today = toUtcMidnight(new Date());

  if (!guestName) {
    return { error: "Guest name is required." };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "A valid email address is required." };
  }

  if (!phone || phone.replace(/\D/g, "").length < 10) {
    return { error: "A valid phone number is required." };
  }

  if (!checkInDate || !checkOutDate) {
    return { error: "Check-in and check-out dates are required." };
  }

  if (checkInDate < today) {
    return { error: "Check-in date cannot be in the past." };
  }

  if (nights < 1) {
    return { error: "Check-out date must be after check-in date." };
  }

  return {
    value: {
      guestName,
      email,
      phone,
      roomId,
      roomName,
      preferredArrivalTime,
      specialRequests,
      adults,
      children,
      checkInDate,
      checkOutDate,
      nights,
    },
  };
}

async function sendBookingEmails({ booking }) {
  try {
    const transporter = createMailTransport();
    if (!transporter) {
      return;
    }

    const stayWindow = `${booking.checkInDate.toISOString().slice(0, 10)} to ${booking.checkOutDate.toISOString().slice(0, 10)}`;
    const roomLabel = booking.roomName || "General stay request";
    const requestSummary = [
      `Booking ID: ${booking._id}`,
      `Guest: ${booking.guestName}`,
      `Room: ${roomLabel}`,
      `Stay: ${stayWindow} (${booking.nights} night${booking.nights === 1 ? "" : "s"})`,
      `Guests: ${booking.adults} adult${booking.adults === 1 ? "" : "s"}${booking.children ? `, ${booking.children} child${booking.children === 1 ? "" : "ren"}` : ""}`,
      `Phone: ${booking.phone}`,
      booking.preferredArrivalTime ? `Arrival: ${booking.preferredArrivalTime}` : null,
      booking.specialRequests ? `Notes: ${booking.specialRequests}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await Promise.all([
      transporter.sendMail({
        from: getMailFromAddress("St Michael's Hotel"),
        to: STORE_DETAILS.email,
        subject: `New hotel booking request: ${roomLabel}`,
        text: `A new hotel booking request has been submitted.\n\n${requestSummary}`,
      }),
      transporter.sendMail({
        from: getMailFromAddress("St Michael's Hotel"),
        to: booking.email,
        subject: "Your hotel booking request has been received",
        text: `Hi ${booking.guestName},\n\nWe have received your booking request for ${roomLabel}.\n\n${requestSummary}\n\nOur reservations desk will contact you shortly to confirm availability and finalize your stay.`,
      }),
    ]);
  } catch (error) {
    console.error("Hotel booking email send failed (non-critical):", error.message);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await mongooseConnect();

  const validation = validatePayload(req.body || {});
  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  const payload = validation.value;

  try {
    let roomProduct = null;

    if (payload.roomId && mongoose.isValidObjectId(payload.roomId)) {
      roomProduct = await Product.findById(payload.roomId);

      if (roomProduct && !productMatchesPublicSite(roomProduct, PUBLIC_SITE_KEYS.HOTEL)) {
        return res.status(404).json({ message: "The selected room could not be found." });
      }
    }

    const booking = await HotelBooking.create({
      roomProduct: roomProduct?._id,
      roomName: payload.roomName || roomProduct?.name || "",
      guestName: payload.guestName,
      email: payload.email,
      phone: payload.phone,
      checkInDate: payload.checkInDate,
      checkOutDate: payload.checkOutDate,
      nights: payload.nights,
      adults: payload.adults,
      children: payload.children,
      preferredArrivalTime: payload.preferredArrivalTime,
      specialRequests: payload.specialRequests,
    });

    await sendBookingEmails({ booking });

    return res.status(201).json({
      success: true,
      bookingId: booking._id,
      booking: {
        _id: booking._id,
        roomName: booking.roomName,
        guestName: booking.guestName,
        email: booking.email,
        phone: booking.phone,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        nights: booking.nights,
        adults: booking.adults,
        children: booking.children,
        preferredArrivalTime: booking.preferredArrivalTime,
        specialRequests: booking.specialRequests,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error("Hotel booking request error:", error);
    return res.status(500).json({ message: "We could not submit the booking request right now." });
  }
}