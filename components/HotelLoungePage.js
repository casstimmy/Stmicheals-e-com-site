import Head from "next/head";
import { useDeferredValue, useMemo, useState } from "react";
import Center from "@/components/Center";
import Header from "@/components/Header";
import HotelDiningCard from "@/components/HotelDiningCard";

export default function HotelLoungePage({ site, dining }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredItems = useMemo(
    () =>
      (dining || []).filter((item) => {
        const haystack = [item.name, item.description, item.categoryName, item.category]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return !normalizedQuery || haystack.includes(normalizedQuery);
      }),
    [dining, normalizedQuery]
  );

  return (
    <>
      <Head>
        <title>{`Lounge & Dining | ${site.displayName}`}</title>
      </Head>
      <Header siteKey={site.key} />
      <Center>
        <div className="min-h-screen px-4 py-8 sm:px-8 sm:py-10">
          <section className="theme-shell-light rounded-[2rem] p-6 md:p-8">
            <div className="border-b border-[rgba(20,109,126,0.12)] pb-6">
              <span className="theme-tag inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] shadow-sm">
                {site.categoryEyebrow}
              </span>
              <h1 className="mt-4 text-3xl font-bold text-[var(--foreground-strong)] sm:text-4xl">Lounge & Dining</h1>
              <p className="mt-2 max-w-2xl theme-muted-page">{site.categoryDescription}</p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1.4fr_0.6fr]">
              <div className="theme-card-light rounded-[1.5rem] p-4 shadow-sm">
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search lounge dishes, breakfast service, or drinks"
                  className="theme-input-light w-full rounded-2xl px-4 py-3 outline-none"
                />
              </div>
              <div className="theme-card-light rounded-[1.5rem] px-5 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Menu highlights</p>
                <p className="mt-2 text-3xl font-bold text-[var(--foreground-strong)]">{filteredItems.length}</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-3">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => <HotelDiningCard key={item._id} item={item} />)
              ) : (
                <div className="col-span-full rounded-[1.5rem] border border-dashed border-[rgba(20,109,126,0.18)] px-6 py-12 text-center">
                  <p className="theme-muted-page">No lounge items match the current search.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </Center>
    </>
  );
}