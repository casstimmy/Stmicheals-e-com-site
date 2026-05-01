import { mongooseConnect } from "@/lib/mongoose";
import HotelTableReservation from "@/models/HotelTableReservation";
import { createMailTransport, getMailFromAddress } from "@/lib/mail";
import {
  buildHotelManageBookingsUrl,
  buildHotelReservationConfirmationUrl,
  createHotelReservationAccessToken,
} from "@/lib/hotelReservationAccess";
import { STORE_DETAILS } from "@/lib/storeDetails";

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

function validatePayload(payload) {
  const guestName = normalizeString(payload.guestName);
  const email = normalizeString(payload.email).toLowerCase();
  const phone = normalizeString(payload.phone);
  const reservationTime = normalizeString(payload.reservationTime);
  const areaPreference = normalizeString(payload.areaPreference);
  const occasion = normalizeString(payload.occasion);
  const specialRequests = normalizeString(payload.specialRequests);
  const partySize = Math.max(1, normalizeInteger(payload.partySize, 2));
  const reservationDate = toUtcMidnight(payload.reservationDate);
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

  if (!reservationDate) {
    return { error: "Reservation date is required." };
  }

  if (reservationDate < today) {
    return { error: "Reservation date cannot be in the past." };
  }

  if (!reservationTime) {
    return { error: "Reservation time is required." };
  }

  return {
    value: {
      guestName,
      email,
      phone,
      reservationDate,
      reservationTime,
      partySize,
      areaPreference,
      occasion,
      specialRequests,
    },
  };
}

async function sendTableReservationEmails({ reservation, accessToken, req }) {
  try {
    const transporter = createMailTransport();
    if (!transporter) {
      return;
    }

    const confirmationUrl = buildHotelReservationConfirmationUrl({
      req,
      reservationId: reservation._id,
      kind: "table",
      token: accessToken,
    });
    const manageUrl = buildHotelManageBookingsUrl(req);
    const summary = [
      `Reservation ID: ${reservation._id}`,
      `Guest: ${reservation.guestName}`,
      `Date: ${reservation.reservationDate.toISOString().slice(0, 10)}`,
      `Time: ${reservation.reservationTime}`,
      `Party size: ${reservation.partySize}`,
      `Phone: ${reservation.phone}`,
      reservation.areaPreference ? `Area: ${reservation.areaPreference}` : null,
      reservation.occasion ? `Occasion: ${reservation.occasion}` : null,
      reservation.specialRequests ? `Notes: ${reservation.specialRequests}` : null,
      confirmationUrl ? `Confirmation link: ${confirmationUrl}` : null,
      manageUrl ? `Manage reservation: ${manageUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    await Promise.all([
      transporter.sendMail({
        from: getMailFromAddress("St Michael's Hotel"),
        to: STORE_DETAILS.email,
        subject: `New lounge table reservation for ${reservation.guestName}`,
        text: `A new lounge table reservation has been submitted.\n\n${summary}`,
      }),
      transporter.sendMail({
        from: getMailFromAddress("St Michael's Hotel"),
        to: reservation.email,
        subject: "Your lounge table reservation request has been received",
        text: `Hi ${reservation.guestName},\n\nWe have received your lounge table reservation request.\n\n${summary}\n\nOur team will follow up shortly to confirm your table details.`,
      }),
    ]);
  } catch (error) {
    console.error("Hotel table reservation email send failed (non-critical):", error.message);
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

  try {
    const reservation = await HotelTableReservation.create(validation.value);
    const accessToken = createHotelReservationAccessToken({
      reservationId: reservation._id,
      email: reservation.email,
      kind: "table",
      createdAt: reservation.createdAt,
    });
    await sendTableReservationEmails({ reservation, accessToken, req });

    return res.status(201).json({
      success: true,
      reservationId: reservation._id,
      accessToken,
      reservation: {
        _id: reservation._id,
        guestName: reservation.guestName,
        email: reservation.email,
        phone: reservation.phone,
        reservationDate: reservation.reservationDate,
        reservationTime: reservation.reservationTime,
        partySize: reservation.partySize,
        areaPreference: reservation.areaPreference,
        occasion: reservation.occasion,
        specialRequests: reservation.specialRequests,
        status: reservation.status,
      },
    });
  } catch (error) {
    console.error("Hotel table reservation request error:", error);
    return res.status(500).json({ message: "We could not submit the table reservation right now." });
  }
}