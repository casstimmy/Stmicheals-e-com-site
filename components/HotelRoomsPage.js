import Head from "next/head";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import Center from "@/components/Center";
import Header from "@/components/Header";
import HotelRoomCard from "@/components/HotelRoomCard";
import { PUBLIC_SITE_KEYS, getPublicSitePath } from "@/lib/publicSite";

export default function HotelRoomsPage({ site, rooms }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredRooms = useMemo(
    () =>
      (rooms || []).filter((room) => {
        const haystack = [room.name, room.description, room.categoryName, room.category]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return !normalizedQuery || haystack.includes(normalizedQuery);
      }),
    [normalizedQuery, rooms]
  );

  return (
    <>
      <Head>
        <title>{`Rooms & Suites | ${site.displayName}`}</title>
      </Head>
      <Header siteKey={site.key} />
      <Center>
        <div className="min-h-screen px-4 py-8 sm:px-8 sm:py-10">
          <section className="theme-shell-light rounded-[2rem] p-6 md:p-8">
            <div className="flex flex-col gap-6 border-b border-[rgba(20,109,126,0.12)] pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="theme-tag inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] shadow-sm">
                  {site.listingEyebrow}
                </span>
                <h1 className="mt-4 text-3xl font-bold text-[var(--foreground-strong)] sm:text-4xl">Rooms & Suites</h1>
                <p className="mt-2 max-w-2xl theme-muted-page">{site.listingDescription}</p>
              </div>
              <Link href={getPublicSitePath(PUBLIC_SITE_KEYS.HOTEL, "/booking")} className="theme-button-accent inline-flex min-h-[3rem] items-center justify-center rounded-[1rem] px-5 py-3 text-sm font-semibold">
                Book a stay
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1.4fr_0.6fr]">
              <div className="theme-card-light rounded-[1.5rem] p-4 shadow-sm">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search room types, stay styles, or amenities"
                  className="theme-input-light w-full rounded-2xl px-4 py-3 outline-none"
                />
              </div>
              <div className="theme-card-light rounded-[1.5rem] px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Available room types</p>
                <p className="mt-2 text-3xl font-bold text-[var(--foreground-strong)]">{filteredRooms.length}</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-3">
              {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => <HotelRoomCard key={room._id} room={room} />)
              ) : (
                <div className="col-span-full rounded-[1.5rem] border border-dashed border-[rgba(20,109,126,0.18)] px-6 py-12 text-center">
                  <p className="theme-muted-page">No room types match the current search.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </Center>
    </>
  );
}