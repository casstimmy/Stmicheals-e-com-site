import Link from "next/link";
import Center from "./Center";

const primaryLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "All Products" },
  { href: "/categories", label: "Categories" },
  { href: "/cart", label: "Cart" },
  { href: "/account", label: "Account" },
];

const serviceHighlights = [
  "Live stock-aware product cards",
  "Server-validated delivery totals",
  "OTP-based customer account access",
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <Center>
        <div className="site-footer-panel overflow-hidden rounded-[2rem] px-6 py-10 md:px-10 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
            <div>
              <span className="theme-tag inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] shadow-sm">
                Refined storefront system
              </span>
              <h2 className="mt-5 max-w-xl text-3xl font-bold text-[var(--foreground-strong)] md:text-4xl">
                Balanced discovery, cleaner checkout, and stronger customer trust.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 theme-muted-page">
                St Michael&apos;s Store now presents catalog discovery, order management, and payment
                confirmation as one cohesive customer journey instead of isolated pages.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {serviceHighlights.map((highlight) => (
                  <div key={highlight} className="theme-card-light rounded-[1.25rem] px-4 py-4 text-sm font-medium shadow-sm">
                    {highlight}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[rgba(18,52,60,0.52)]">
                Navigate
              </p>
              <div className="mt-5 grid gap-3">
                {primaryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="theme-footer-link rounded-2xl px-4 py-3 text-sm font-medium text-[var(--foreground-strong)]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[rgba(18,52,60,0.52)]">
                Customer confidence
              </p>
              <div className="mt-5 space-y-4">
                <div className="theme-card-light rounded-[1.25rem] px-5 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-[var(--foreground-strong)]">Checkout integrity</p>
                  <p className="mt-2 text-sm leading-7 theme-muted-page">
                    Payment starts only after the order, pricing, shipping, and inventory state are
                    revalidated on the server.
                  </p>
                </div>
                <div className="theme-card-light rounded-[1.25rem] px-5 py-4 shadow-sm">
                  <p className="text-sm font-semibold text-[var(--foreground-strong)]">Account continuity</p>
                  <p className="mt-2 text-sm leading-7 theme-muted-page">
                    Customers can retrieve order history and update delivery details with email-based OTP access.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="theme-divider mt-8 flex flex-col gap-3 border-t pt-5 text-sm text-[rgba(18,52,60,0.58)] md:flex-row md:items-center md:justify-between">
            <p>© {currentYear} St Michael&apos;s Store. Premium groceries and essentials, delivered with clearer digital service.</p>
            <p>Built for responsive browsing, accessible navigation, and verified payment flow continuity.</p>
          </div>
        </div>
      </Center>
    </footer>
  );
}