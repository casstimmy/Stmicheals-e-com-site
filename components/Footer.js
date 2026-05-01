import Link from "next/link";
import { useRouter } from "next/router";
import Center from "./Center";
import { COMPANY_LINKS, POLICY_LINKS, STORE_DETAILS } from "@/lib/storeDetails";
import {
  getPublicSiteLinkLabel,
  getPublicScopedHref,
  getPublicSiteConfig,
  inferPublicSiteFromPath,
  normalizePublicSite,
} from "@/lib/publicSite";

export default function Footer() {
  const router = useRouter();
  const activeSiteKey = normalizePublicSite(inferPublicSiteFromPath(router.pathname));
  const site = getPublicSiteConfig(activeSiteKey);
  const isHotelSite = site.key === "hotel";
  const profileLabel = site.key === "hotel" ? "Hotel profile" : "Store profile";
  const detailsName = site.key === "hotel" ? site.displayName : STORE_DETAILS.businessName;
  const legalName = site.key === "hotel" ? site.displayName : STORE_DETAILS.businessName;
  const serviceHighlights = site.serviceHighlights || [];
  const companyLinks = COMPANY_LINKS.map((link) => ({
    ...link,
    href: getPublicScopedHref(activeSiteKey, link.href),
    label: getPublicSiteLinkLabel(activeSiteKey, link.href, link.label),
  }));
  const policyLinks = POLICY_LINKS.map((link) => ({
    ...link,
    href: getPublicScopedHref(activeSiteKey, link.href),
    label: getPublicSiteLinkLabel(activeSiteKey, link.href, link.label),
  }));
  const primaryLinks = (site.primaryFooterLinks || []).map((link) => ({
    ...link,
    href: link.href === "/" ? "/" : getPublicScopedHref(activeSiteKey, link.href),
  }));
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <Center>
        <div className={`${isHotelSite ? "hotel-footer-panel" : "site-footer-panel"} overflow-hidden rounded-[1.75rem] px-4 py-8 sm:rounded-[2rem] sm:px-6 sm:py-10 md:px-10 md:py-12`}>
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.8fr_0.8fr_1fr]">
            <div>
              <span className={`${isHotelSite ? "hotel-shell-kicker" : "theme-tag"} inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] shadow-sm`}>
                {profileLabel}
              </span>
              <h2 className={`${isHotelSite ? "text-[#fff1dc]" : "text-[var(--foreground-strong)]"} mt-5 max-w-xl text-3xl font-bold md:text-4xl`}>
                {site.displayName}
              </h2>
              <p className={`${isHotelSite ? "hotel-shell-muted" : "theme-muted-page"} mt-4 max-w-2xl text-base leading-8`}>
                {site.key === "hotel"
                  ? "A refined hotel presence with rooms, lounge reservations, and direct guest support gathered into one polished footer."
                  : `Industrial-standard public foundations for the ${site.shortLabel.toLowerCase()} side: clear navigation, policy access, secure checkout, and direct business contact details in one footer.`}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {serviceHighlights.map((highlight) => (
                  <div key={highlight} className={`${isHotelSite ? "hotel-shell-card text-[#fff1dc]" : "theme-card-light"} rounded-[1.25rem] px-4 py-4 text-sm font-medium shadow-sm`}>
                    {highlight}
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 min-[420px]:grid-cols-2 xl:max-w-md">
                {companyLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${isHotelSite ? "hotel-footer-link" : "theme-footer-link text-[var(--foreground-strong)]"} w-full justify-center rounded-2xl px-4 py-3 text-sm font-semibold`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className={`${isHotelSite ? "text-[rgba(245,238,226,0.64)]" : "text-[rgba(18,52,60,0.52)]"} text-sm font-semibold uppercase tracking-[0.24em]`}>
                {site.shortLabel} navigation
              </p>
              <div className="mt-5 grid gap-3 min-[420px]:grid-cols-2 xl:grid-cols-1">
                {primaryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${isHotelSite ? "hotel-footer-link" : "theme-footer-link text-[var(--foreground-strong)]"} w-full justify-between rounded-2xl px-4 py-3 text-sm font-medium`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className={`${isHotelSite ? "text-[rgba(245,238,226,0.64)]" : "text-[rgba(18,52,60,0.52)]"} text-sm font-semibold uppercase tracking-[0.24em]`}>
                Policies
              </p>
              <div className="mt-5 grid gap-3 min-[420px]:grid-cols-2 xl:grid-cols-1">
                {policyLinks.map((policy) => (
                  <Link
                    key={policy.href}
                    href={policy.href}
                    className={`${isHotelSite ? "hotel-footer-link" : "theme-footer-link text-[var(--foreground-strong)]"} w-full justify-between rounded-2xl px-4 py-3 text-sm font-medium`}
                  >
                    {policy.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className={`${isHotelSite ? "text-[rgba(245,238,226,0.64)]" : "text-[rgba(18,52,60,0.52)]"} text-sm font-semibold uppercase tracking-[0.24em]`}>
                Contact & compliance
              </p>
              <div className="mt-5 grid gap-4 min-[460px]:grid-cols-2 xl:grid-cols-1">
                <div className={`${isHotelSite ? "hotel-shell-card" : "theme-card-light"} rounded-[1.25rem] px-5 py-4 shadow-sm`}>
                  <p className={`${isHotelSite ? "text-[#fff1dc]" : "text-[var(--foreground-strong)]"} text-sm font-semibold`}>{site.shortLabel} details</p>
                  <div className={`${isHotelSite ? "hotel-shell-muted" : "theme-muted-page"} mt-3 space-y-2 text-sm leading-7`}>
                    <p>{detailsName}</p>
                    <p>{STORE_DETAILS.country}</p>
                    <p>Location Code: {STORE_DETAILS.locationCode}</p>
                  </div>
                </div>
                <div className={`${isHotelSite ? "hotel-shell-card" : "theme-card-light"} rounded-[1.25rem] px-5 py-4 shadow-sm`}>
                  <p className={`${isHotelSite ? "text-[#fff1dc]" : "text-[var(--foreground-strong)]"} text-sm font-semibold`}>{site.contactPanelTitle || "Reach the team"}</p>
                  <div className="mt-3 space-y-2 text-sm leading-7">
                    <Link
                      href={getPublicScopedHref(activeSiteKey, "/contact")}
                      className={`${isHotelSite ? "hotel-footer-link" : "theme-footer-link text-[var(--foreground-strong)]"} mb-3 w-full justify-center rounded-2xl px-4 py-3 text-sm font-semibold`}
                    >
                      {site.key === "hotel" ? "Contact reservations" : "Open contact page"}
                    </Link>
                    <a className={`${isHotelSite ? "hotel-footer-accent" : "text-[var(--brand-strong)]"} block break-all`} href={`mailto:${STORE_DETAILS.email}`}>
                      {STORE_DETAILS.email}
                    </a>
                    {STORE_DETAILS.phoneNumbers.map((phoneNumber) => (
                      <a
                        key={phoneNumber}
                        className={`${isHotelSite ? "hotel-footer-accent" : "text-[var(--brand-strong)]"} block`}
                        href={`tel:${phoneNumber}`}
                      >
                        {phoneNumber}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${isHotelSite ? "hotel-footer-divider text-[rgba(245,238,226,0.68)]" : "theme-divider text-[rgba(18,52,60,0.58)]"} mt-8 flex flex-col gap-4 border-t pt-5 text-sm md:flex-row md:items-center md:justify-between`}>
            <p className="max-w-xl">© {currentYear} {legalName}. {site.shortLabel} side.</p>
            <div className="flex flex-col gap-1 md:items-end md:text-right">
              <p>Phone: {STORE_DETAILS.phoneNumbers.join(" · ")}</p>
              <a className={`${isHotelSite ? "hotel-footer-accent" : "text-[var(--brand-strong)]"} break-all`} href={`mailto:${STORE_DETAILS.email}`}>
                {STORE_DETAILS.email}
              </a>
            </div>
          </div>
        </div>
      </Center>
    </footer>
  );
}