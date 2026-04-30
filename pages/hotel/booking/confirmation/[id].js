import Head from "next/head";
import Link from "next/link";
import Center from "@/components/Center";
import Header from "@/components/Header";
import { mongooseConnect } from "@/lib/mongoose";
import HotelBooking from "@/models/HotelBooking";
import { PUBLIC_SITE_KEYS, getPublicSiteConfig, getPublicSitePath } from "@/lib/publicSite";

export default function HotelBookingConfirmationPage({ site, booking }) {
  return (
    <>
      <Head>
        <title>{`Booking Request Received | ${site.displayName}`}</title>
      </Head>
      <Header siteKey={site.key} />
      <Center>
        <div className="min-h-screen px-4 py-8 sm:px-8 sm:py-10">
          <section className="theme-shell-light mx-auto max-w-3xl rounded-[2rem] p-6 text-center md:p-8">
            <span className="theme-tag inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] shadow-sm">
              Reservations desk
            </span>
            <h1 className="mt-4 text-3xl font-bold text-[var(--foreground-strong)] sm:text-4xl">Booking request received</h1>
            <p className="mt-3 text-base leading-8 theme-muted-page">
              We have received your stay request and sent a confirmation to {booking.email}. The hotel team will follow up to confirm availability and final arrival details.
            </p>

            <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
              <div className="theme-card-light rounded-[1.4rem] px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Guest</p>
                <p className="mt-2 text-lg font-bold text-[var(--foreground-strong)]">{booking.guestName}</p>
                <p className="mt-1 text-sm theme-muted-page">{booking.phone}</p>
              </div>
              <div className="theme-card-light rounded-[1.4rem] px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Requested room</p>
                <p className="mt-2 text-lg font-bold text-[var(--foreground-strong)]">{booking.roomName || "Any available room"}</p>
                <p className="mt-1 text-sm theme-muted-page">{booking.nights} night{booking.nights === 1 ? "" : "s"}</p>
              </div>
              <div className="theme-card-light rounded-[1.4rem] px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Stay window</p>
                <p className="mt-2 text-lg font-bold text-[var(--foreground-strong)]">{booking.checkInDate} to {booking.checkOutDate}</p>
              </div>
              <div className="theme-card-light rounded-[1.4rem] px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Guests</p>
                <p className="mt-2 text-lg font-bold text-[var(--foreground-strong)]">{booking.adults} adult{booking.adults === 1 ? "" : "s"}{booking.children ? `, ${booking.children} child${booking.children === 1 ? "" : "ren"}` : ""}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href={getPublicSitePath(PUBLIC_SITE_KEYS.HOTEL, "/rooms")} className="theme-card-light inline-flex min-h-[3rem] items-center justify-center rounded-[1rem] px-5 py-3 text-sm font-semibold text-[var(--foreground-strong)] shadow-sm">
                Browse rooms again
              </Link>
              <Link href={getPublicSitePath(PUBLIC_SITE_KEYS.HOTEL, "/contact")} className="theme-button-accent inline-flex min-h-[3rem] items-center justify-center rounded-[1rem] px-5 py-3 text-sm font-semibold">
                Contact reservations
              </Link>
            </div>
          </section>
        </div>
      </Center>
    </>
  );
}

export async function getServerSideProps(context) {
  try {
    await mongooseConnect();
    const booking = await HotelBooking.findById(context.query.id);

    if (!booking) {
      return { notFound: true };
    }

    return {
      props: {
        site: getPublicSiteConfig(PUBLIC_SITE_KEYS.HOTEL),
        booking: {
          guestName: booking.guestName,
          email: booking.email,
          phone: booking.phone,
          roomName: booking.roomName,
          nights: booking.nights,
          adults: booking.adults,
          children: booking.children,
          checkInDate: booking.checkInDate.toISOString().slice(0, 10),
          checkOutDate: booking.checkOutDate.toISOString().slice(0, 10),
        },
      },
    };
  } catch (error) {
    console.error("Hotel booking confirmation SSR error:", error);
    return { notFound: true };
  }
}