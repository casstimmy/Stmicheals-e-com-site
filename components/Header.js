import Link from "next/link";
import Image from "next/image";
import Center from "./Center";
import { useContext, useState } from "react";
import { CartContext } from "./CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCartShopping,
  faBars,
  faTimes,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";

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

  const isActiveRoute = (href) => {
    if (href === "/") {
      return router.pathname === href;
    }

    return router.pathname.startsWith(href);
  };

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
        <div className="px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo */}
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
              <span className="block truncate text-base font-bold text-[var(--foreground-strong)] sm:text-xl">
                St. Michael&apos;s Store
              </span>
              <span className="hidden text-xs font-medium uppercase tracking-[0.26em] text-[rgba(18,52,60,0.62)] sm:block lg:block">
                Premium essentials marketplace
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/cart"
              data-cart-icon
              className="theme-button-primary inline-flex min-h-[2.85rem] items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold shadow-sm"
              aria-label="View cart"
            >
              <FontAwesomeIcon icon={faCartShopping} className="text-sm" />
              <span>Cart</span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">
                {cartCount || 0}
              </span>
            </Link>

            {/* Hamburger Icon */}
            <button
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(20,109,126,0.14)] bg-white/70 text-[var(--foreground-strong)] shadow-sm"
              onClick={() => setNavOpen(!navOpen)}
              aria-expanded={navOpen}
              aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              <FontAwesomeIcon icon={navOpen ? faTimes : faBars} size="lg" />
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-3 font-medium text-[var(--foreground-strong)]">
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

        {/* Mobile Nav */}
        {navOpen && (
          <nav className="mt-4 grid gap-2 rounded-[1.5rem] border border-[rgba(20,109,126,0.12)] bg-[rgba(255,253,248,0.94)] p-3 shadow-[0_20px_40px_rgba(18,52,60,0.08)] md:hidden font-medium text-[var(--foreground-strong)]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setNavOpen(false)}
                className={`rounded-2xl px-4 py-3 transition ${
                  isActiveRoute(link.href)
                    ? "theme-button-accent"
                    : "bg-[rgba(20,148,182,0.08)] hover:bg-[rgba(20,148,182,0.14)]"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/cart"
              onClick={() => setNavOpen(false)}
              className="theme-button-primary flex items-center justify-between rounded-2xl px-4 py-3 transition"
            >
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCartShopping} />
                Cart
              </span>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">
                {cartCount || 0}
              </span>
            </Link>
          </nav>
        )}
        </div>
      </Center>
    </header>
  );
}
