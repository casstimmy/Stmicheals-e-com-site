import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Center from "@/components/Center";
import Header from "@/components/Header";
import HotelRoomCard from "@/components/HotelRoomCard";
import HotelDiningCard from "@/components/HotelDiningCard";
import { getPrimaryProductImage, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/productImages";
import { PUBLIC_SITE_KEYS, getPublicSitePath } from "@/lib/publicSite";

export default function HotelHomePage({ site, rooms, dining, featuredRoom, sections }) {
  const previewRooms = (rooms || []).slice(0, 3);
  const previewDining = (dining || []).slice(0, 3);

  return (
    <>
      <Head>
        <title>{`${site.displayName} | St Michael's Business Group`}</title>
        <meta name="description" content={site.heroDescription} />
      </Head>
      <Header siteKey={site.key} />
      <div className="px-4 py-8 sm:px-8 lg:py-10">
        <Center>
          <section className="relative overflow-hidden rounded-[2rem] border border-[rgba(20,109,126,0.12)] bg-[linear-gradient(135deg,_rgba(255,250,243,0.98),_rgba(245,249,250,0.96)_52%,_rgba(221,239,243,0.96)_100%)] px-6 py-8 shadow-[0_28px_70px_rgba(18,52,60,0.1)] md:px-10 md:py-12">
            <div className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-[rgba(247,195,46,0.2)] blur-3xl" />
            <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-[rgba(20,148,182,0.16)] blur-3xl" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <span className="inline-flex rounded-full border border-[rgba(216,172,79,0.3)] bg-[rgba(216,172,79,0.15)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[rgba(109,76,0,0.92)] shadow-sm">
                  {site.heroEyebrow}
                </span>
                <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.02] text-[var(--foreground-strong)] lg:text-6xl">
                  {site.heroTitle}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-[rgba(18,52,60,0.76)] lg:text-lg">
                  {site.heroDescription}
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="theme-card-light rounded-[1.4rem] px-5 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Rooms</p>
                    <p className="mt-2 text-3xl font-bold text-[var(--foreground-strong)]">{sections.roomCount}</p>
                  </div>
                  <div className="theme-card-light rounded-[1.4rem] px-5 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Lounge</p>
                    <p className="mt-2 text-3xl font-bold text-[var(--foreground-strong)]">{sections.diningCount}</p>
                  </div>
                  <div className="theme-card-light rounded-[1.4rem] px-5 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Starting rate</p>
                    <p className="mt-2 text-3xl font-bold text-[var(--foreground-strong)]">₦{sections.startingRate.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={getPublicSitePath(PUBLIC_SITE_KEYS.HOTEL, "/rooms")}
                    className="theme-button-accent inline-flex min-h-[3.6rem] items-center justify-center rounded-[1.1rem] px-6 py-3 font-semibold"
                  >
                    Explore rooms
                  </Link>
                  <Link
                    href={getPublicSitePath(PUBLIC_SITE_KEYS.HOTEL, "/booking")}
                    className="theme-button-secondary inline-flex min-h-[3.6rem] items-center justify-center rounded-[1.1rem] px-6 py-3 font-semibold"
                  >
                    Book a stay
                  </Link>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/70 p-4 shadow-[0_24px_48px_rgba(18,52,60,0.12)]">
                <div className="relative h-[24rem] overflow-hidden rounded-[1.4rem] bg-white sm:h-[28rem]">
                  <Image
                    src={featuredRoom ? getPrimaryProductImage(featuredRoom.images) : PRODUCT_IMAGE_PLACEHOLDER}
                    alt={featuredRoom?.name || site.displayName}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 48vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(18,52,60,0.52)]">Featured stay</p>
                    <p className="mt-1 text-2xl font-bold text-[var(--foreground-strong)]">{featuredRoom?.name || "Signature room"}</p>
                  </div>
                  <Link
                    href={featuredRoom ? getPublicSitePath(PUBLIC_SITE_KEYS.HOTEL, `/rooms/${featuredRoom._id}`) : getPublicSitePath(PUBLIC_SITE_KEYS.HOTEL, "/rooms")}
                    className="theme-card-light inline-flex min-h-[3rem] items-center justify-center rounded-[1rem] px-5 py-3 text-sm font-semibold text-[var(--foreground-strong)] shadow-sm"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </Center>
      </div>

      <div className="px-4 pb-14 sm:px-8">
        <Center>
          <section className="theme-shell-light rounded-[2rem] px-6 py-8 md:px-8 md:py-10">
            <div className="mb-8 flex flex-col gap-4 border-b border-[rgba(20,109,126,0.12)] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="theme-tag inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] shadow-sm">
                  Stay collection
                </span>
                <h2 className="mt-4 text-3xl font-bold text-[var(--foreground-strong)]">Rooms designed for restful stays</h2>
                <p className="mt-2 max-w-2xl theme-muted-page">Browse room types, compare comfort details, and send a direct booking request without going through a cart or stock counter.</p>
              </div>
              <Link href={getPublicSitePath(PUBLIC_SITE_KEYS.HOTEL, "/rooms")} className="theme-card-light inline-flex min-h-[3rem] items-center justify-center rounded-[1rem] px-5 py-3 text-sm font-semibold text-[var(--foreground-strong)] shadow-sm">
                View all rooms
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {previewRooms.map((room) => (
                <HotelRoomCard key={room._id} room={room} featured />
              ))}
            </div>
          </section>
        </Center>
      </div>

      <div className="px-4 pb-14 sm:px-8">
        <Center>
          <section className="theme-shell-light rounded-[2rem] px-6 py-8 md:px-8 md:py-10">
            <div className="mb-8 flex flex-col gap-4 border-b border-[rgba(20,109,126,0.12)] pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="theme-tag inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] shadow-sm">
                  Lounge service
                </span>
                <h2 className="mt-4 text-3xl font-bold text-[var(--foreground-strong)]">Lounge and dining, without ecommerce clutter</h2>
                <p className="mt-2 max-w-2xl theme-muted-page">Showcase plates, drinks, and service windows like a proper hotel lounge menu instead of a stock-managed storefront.</p>
              </div>
              <Link href={getPublicSitePath(PUBLIC_SITE_KEYS.HOTEL, "/lounge")} className="theme-card-light inline-flex min-h-[3rem] items-center justify-center rounded-[1rem] px-5 py-3 text-sm font-semibold text-[var(--foreground-strong)] shadow-sm">
                Visit the lounge page
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {previewDining.map((item) => (
                <HotelDiningCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        </Center>
      </div>

      <div className="px-4 pb-16 sm:px-8">
        <Center>
          <section className="rounded-[2rem] border border-[rgba(20,109,126,0.12)] bg-[linear-gradient(135deg,_rgba(255,252,245,0.98),_rgba(236,246,248,0.96))] px-6 py-8 shadow-[0_24px_56px_rgba(18,52,60,0.08)] md:px-8 md:py-10">
            <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr] lg:items-center">
              <div>
                <span className="theme-tag inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] shadow-sm">
                  Guest experience
                </span>
                <h2 className="mt-4 text-3xl font-bold text-[var(--foreground-strong)]">A calmer hotel-side flow</h2>
                <p className="mt-3 max-w-2xl text-base leading-8 theme-muted-page">The hotel branch now behaves like a hotel and lounge site: rooms are browsed by stay type, lounge offerings are shown as service highlights, and reservation requests go straight to the hotel desk.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Direct booking requests",
                  "Room-first browsing",
                  "Lounge menu presentation",
                  "Arrival coordination support",
                ].map((item) => (
                  <div key={item} className="theme-card-light rounded-[1.25rem] px-4 py-4 text-sm font-semibold text-[var(--foreground-strong)] shadow-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </Center>
      </div>
    </>
  );
}