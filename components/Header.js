import Link from "next/link";
import Image from "next/image";
import Center from "./Center";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "./CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faBars,
  faTimes,
  faArrowRight,
  faEnvelope,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { COMPANY_LINKS, STORE_DETAILS } from "@/lib/storeDetails";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "All Products" },
  { href: "/categories", label: "Categories" },
  { href: "/account", label: "Account" },
];

export default function Header() {
  const { cartCount } = useContext(CartContext);
  const [navOpen, setNavOpen] = useState(false);
  const router = useRouter();
  const cartIsActive = router.pathname.startsWith("/cart");

  useEffect(() => {
    const closeMobileNav = () => {
      setNavOpen(false);
    };

    router.events.on("routeChangeStart", closeMobileNav);

    return () => {
      router.events.off("routeChangeStart", closeMobileNav);
    };
  }, [router.events]);

  useEffect(() => {
    if (!navOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setNavOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleChange = (event) => {
      if (event.matches) {
        setNavOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const isActiveRoute = (href) => {
    if (href === "/") {
      return router.pathname === href;
    }

    return router.pathname.startsWith(href);
  };

  const mobileSupportLinks = [
    {
      href: `mailto:${STORE_DETAILS.email}`,
      label: "Email the store",
      value: STORE_DETAILS.email,
      icon: faEnvelope,
    },
    {
      href: `tel:${STORE_DETAILS.phoneNumbers[0]}`,
      label: "Call the store",
      value: STORE_DETAILS.phoneNumbers[0],
      icon: faPhone,
    },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(20,109,126,0.14)] bg-[rgba(255,250,243,0.86)] shadow-[0_16px_42px_rgba(18,52,60,0.08)] backdrop-blur-xl">
      <div className="border-b border-[rgba(111,220,243,0.14)] bg-[linear-gradient(90deg,_rgba(17,124,146,0.96),_rgba(22,148,174,0.92))] text-[0.72rem] uppercase tracking-[0.24em] text-cyan-50">
        <Center>
          <div className="flex flex-col items-start justify-between gap-2 px-4 py-2 sm:flex-row sm:items-center sm:gap-3 sm:px-6">
            <span className="text-[0.62rem] tracking-[0.18em] sm:text-[0.72rem] sm:tracking-[0.24em]">
              <span className="sm:hidden">Trusted delivery across major Nigerian cities</span>
              <span className="hidden sm:inline">Trusted grocery delivery across major Nigerian cities</span>
            </span>
            <Link href="/products" className="inline-flex items-center gap-2 font-semibold text-white/90 transition hover:text-[var(--accent)]">
              <span className="sm:hidden">Explore catalog</span>
              <span className="hidden sm:inline">Explore the catalog</span>
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
          </div>
        </Center>
      </div>

      <Center>
        <div className="relative px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <Link href="/" className="flex min-w-0 flex-1 items-center gap-3">
              <div className="rounded-2xl border border-[rgba(20,109,126,0.12)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(239,247,248,0.96))] p-2 shadow-[0_12px_28px_rgba(18,52,60,0.08)]">
                <Image
                  src="/images/st-micheals-logo.png"
                  alt="St. Michael's Logo"
                  width={40}
                  height={40}
                  className="size-9 object-contain sm:size-10"
                />
              </div>
              <div className="min-w-0">
                <span className="block truncate text-[0.98rem] font-bold text-[var(--foreground-strong)] sm:text-xl">
                  St. Michael&apos;s Food & Drinks Warehouse
                </span>
                <span className="block truncate text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[rgba(18,52,60,0.56)] sm:text-xs sm:tracking-[0.26em]">
                  Essentials marketplace
                </span>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-2 md:hidden">
              <Link
                href="/cart"
                data-cart-icon
                className={`inline-flex h-11 min-w-[3rem] items-center justify-center rounded-full px-3 py-2 text-sm font-semibold shadow-sm transition ${
                  cartIsActive
                    ? "theme-button-accent"
                    : "theme-button-primary"
                }`}
                aria-label="View cart"
              >
                <span className="relative inline-flex items-center justify-center">
                  <FontAwesomeIcon icon={faCartShopping} className="text-sm" />
                  <span className="absolute -right-3 -top-3 rounded-full bg-[var(--foreground-strong)] px-1.5 py-[1px] text-[0.62rem] font-semibold text-white shadow-sm">
                    {cartCount || 0}
                  </span>
                </span>
              </Link>

              <button
                type="button"
                className={`inline-flex min-h-[2.85rem] items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold shadow-sm transition ${
                  navOpen
                    ? "border-[rgba(186,132,24,0.28)] bg-[rgba(255,236,197,0.92)] text-[var(--foreground-strong)]"
                    : "border-[rgba(20,109,126,0.14)] bg-white/78 text-[var(--foreground-strong)]"
                }`}
                onClick={() => setNavOpen((currentValue) => !currentValue)}
                aria-controls="mobile-site-nav"
                aria-expanded={navOpen}
                aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
              >
                <FontAwesomeIcon icon={navOpen ? faTimes : faBars} className="text-sm" />
                <span>{navOpen ? "Close" : "Menu"}</span>
              </button>
            </div>

            <nav className="hidden items-center gap-3 font-medium text-[var(--foreground-strong)] md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 transition ${
                    isActiveRoute(link.href)
                      ? "theme-button-accent shadow-lg"
                      : "hover:bg-[rgba(20,148,182,0.12)] hover:text-[var(--brand-strong)]"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/cart"
                data-cart-icon
                className="theme-button-primary inline-flex items-center gap-2 rounded-full px-4 py-2 transition shadow-lg"
              >
                <FontAwesomeIcon icon={faCartShopping} />
                <span>Cart</span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">
                  {cartCount || 0}
                </span>
              </Link>
            </nav>
          </div>

          {navOpen && (
            <div className="absolute inset-x-0 top-full z-50 pt-3 md:hidden">
              <nav
                id="mobile-site-nav"
                className="overflow-hidden rounded-[1.75rem] border border-[rgba(20,109,126,0.12)] bg-[rgba(255,253,248,0.98)] shadow-[0_24px_52px_rgba(18,52,60,0.12)] backdrop-blur-xl"
              >
                <div className="grid gap-4 p-4">
                  <div className="theme-card-light rounded-[1.4rem] p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(18,52,60,0.52)]">
                          Browse the store
                        </p>
                        <p className="mt-2 text-sm leading-7 theme-muted-page">
                          Jump to the main storefront pages with larger touch targets and clearer grouping.
                        </p>
                      </div>
                      <span className="rounded-full bg-[rgba(20,148,182,0.12)] px-3 py-1 text-xs font-semibold text-[var(--brand-strong)]">
                        {cartCount || 0} in cart
                      </span>
                    </div>

                    <Link
                      href="/cart"
                      onClick={() => setNavOpen(false)}
                      className={`mt-4 flex items-center justify-between rounded-[1.2rem] px-4 py-3 text-sm font-semibold transition ${
                        cartIsActive ? "theme-button-accent" : "theme-button-primary"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCartShopping} />
                        Review cart
                      </span>
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">
                        {cartCount || 0}
                      </span>
                    </Link>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setNavOpen(false)}
                          className={`rounded-[1.15rem] px-4 py-3 text-sm font-semibold transition ${
                            isActiveRoute(link.href)
                              ? "theme-button-accent"
                              : "bg-[rgba(20,148,182,0.08)] text-[var(--foreground-strong)] hover:bg-[rgba(20,148,182,0.14)]"
                          }`}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 min-[460px]:grid-cols-[0.95fr_1.05fr]">
                    <div className="theme-card-light rounded-[1.4rem] p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(18,52,60,0.52)]">
                        Company pages
                      </p>
                      <div className="mt-3 grid gap-3">
                        {COMPANY_LINKS.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setNavOpen(false)}
                            className={`rounded-[1.15rem] px-4 py-3 text-sm font-semibold transition ${
                              isActiveRoute(link.href)
                                ? "theme-button-accent"
                                : "theme-footer-link text-[var(--foreground-strong)]"
                            }`}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="theme-card-light rounded-[1.4rem] p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[rgba(18,52,60,0.52)]">
                        Need help fast?
                      </p>
                      <div className="mt-3 space-y-3">
                        {mobileSupportLinks.map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            className="theme-footer-link flex items-start gap-3 rounded-[1.15rem] px-4 py-3 text-[var(--foreground-strong)]"
                          >
                            <span className="inline-flex size-9 items-center justify-center rounded-full bg-[rgba(20,148,182,0.12)] text-[var(--brand-strong)]">
                              <FontAwesomeIcon icon={link.icon} />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-[rgba(18,52,60,0.5)]">
                                {link.label}
                              </span>
                              <span className="mt-1 block break-all text-sm font-semibold">
                                {link.value}
                              </span>
                            </span>
                          </a>
                        ))}

                        <div className="rounded-[1.15rem] border border-[rgba(20,109,126,0.12)] bg-[rgba(247,251,251,0.92)] px-4 py-3 text-sm leading-7 text-[rgba(18,52,60,0.74)]">
                          <p className="font-semibold text-[var(--foreground-strong)]">Nigeria service coverage</p>
                          <p className="mt-1">Location Code: {STORE_DETAILS.locationCode}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          )}
        </div>
      </Center>
    </header>
  );
}
