import Link from "next/link";
import { useRouter } from "next/router";
import Center from "./Center";
import { COMPANY_LINKS, POLICY_LINKS, STORE_DETAILS } from "@/lib/storeDetails";
import {
  getPublicScopedHref,
  getPublicSiteConfig,
  inferPublicSiteFromPath,
  normalizePublicSite,
} from "@/lib/publicSite";

export default function Footer() {
  const router = useRouter();
  const activeSiteKey = normalizePublicSite(inferPublicSiteFromPath(router.pathname));
  const site = getPublicSiteConfig(activeSiteKey);
  const serviceHighlights = site.serviceHighlights || [];
  const companyLinks = COMPANY_LINKS.map((link) => ({
    ...link,
    href: getPublicScopedHref(activeSiteKey, link.href),
  }));
  const policyLinks = POLICY_LINKS.map((link) => ({
    ...link,
    href: getPublicScopedHref(activeSiteKey, link.href),
  }));
  const primaryLinks = (site.primaryFooterLinks || []).map((link) => ({
    ...link,
    href: link.href === "/" ? "/" : getPublicScopedHref(activeSiteKey, link.href),
  }));
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <Center>
        <div className="site-footer-panel overflow-hidden rounded-[1.75rem] px-4 py-8 sm:rounded-[2rem] sm:px-6 sm:py-10 md:px-10 md:py-12">
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.8fr_0.8fr_1fr]">
            <div>
              <span className="theme-tag inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] shadow-sm">
                Business profile
              </span>
              <h2 className="mt-5 max-w-xl text-3xl font-bold text-[var(--foreground-strong)] md:text-4xl">
                {site.displayName}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 theme-muted-page">
                {site.key === "hotel"
                  ? "A refined hotel-side foundation with room browsing, lounge presentation, direct reservation requests, and business contact details in one footer."
                  : `Industrial-standard public foundations for the ${site.shortLabel.toLowerCase()} side: clear navigation, policy access, secure checkout, and direct business contact details in one footer.`}
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {serviceHighlights.map((highlight) => (
                  <div key={highlight} className="theme-card-light rounded-[1.25rem] px-4 py-4 text-sm font-medium shadow-sm">
                    {highlight}
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 min-[420px]:grid-cols-2 xl:max-w-md">
                {companyLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="theme-footer-link w-full justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--foreground-strong)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[rgba(18,52,60,0.52)]">
                {site.shortLabel} navigation
              </p>
              <div className="mt-5 grid gap-3 min-[420px]:grid-cols-2 xl:grid-cols-1">
                {primaryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="theme-footer-link w-full justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[var(--foreground-strong)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[rgba(18,52,60,0.52)]">
                Policies
              </p>
              <div className="mt-5 grid gap-3 min-[420px]:grid-cols-2 xl:grid-cols-1">
                {policyLinks.map((policy) => (
                  <Link
                    key={policy.href}
                    href={policy.href}
                    className="theme-footer-link w-full justify-between rounded-2xl px-4 py-3 text-sm font-medium text-[var(--foreground-strong)]"
                  >
                    {policy.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[rgba(18,52,60,0.52)]">
                Contact & compliance
              </p>
              <div className="mt-5 grid gap-4 min-[460px]:grid-cols-2 xl:grid-cols-1">
                <div className="theme-card-light rounded-[1.25rem] px-5 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-[var(--foreground-strong)]">{site.shortLabel} details</p>
                  <div className="mt-3 space-y-2 text-sm leading-7 theme-muted-page">
                    <p>{STORE_DETAILS.displayName}</p>
                    <p>{STORE_DETAILS.country}</p>
                    <p>Location Code: {STORE_DETAILS.locationCode}</p>
                  </div>
                </div>
                <div className="theme-card-light rounded-[1.25rem] px-5 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-[var(--foreground-strong)]">{site.contactPanelTitle || "Reach the team"}</p>
                  <div className="mt-3 space-y-2 text-sm leading-7">
                    <Link
                      href={getPublicScopedHref(activeSiteKey, "/contact")}
                      className="theme-footer-link mb-3 w-full justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--foreground-strong)]"
                    >
                      {site.key === "hotel" ? "Contact reservations" : "Open contact page"}
                    </Link>
                    <a className="block break-all text-[var(--brand-strong)]" href={`mailto:${STORE_DETAILS.email}`}>
                      {STORE_DETAILS.email}
                    </a>
                    {STORE_DETAILS.phoneNumbers.map((phoneNumber) => (
                      <a
                        key={phoneNumber}
                        className="block text-[var(--brand-strong)]"
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

          <div className="theme-divider mt-8 flex flex-col gap-4 border-t pt-5 text-sm text-[rgba(18,52,60,0.58)] md:flex-row md:items-center md:justify-between">
            <p className="max-w-xl">© {currentYear} {STORE_DETAILS.businessName}. {site.shortLabel} side.</p>
            <div className="flex flex-col gap-1 md:items-end md:text-right">
              <p>Phone: {STORE_DETAILS.phoneNumbers.join(" · ")}</p>
              <a className="break-all text-[var(--brand-strong)]" href={`mailto:${STORE_DETAILS.email}`}>
                {STORE_DETAILS.email}
              </a>
            </div>
          </div>
        </div>
      </Center>
    </footer>
  );
}