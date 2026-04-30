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
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2">
            <span>Trusted grocery delivery across major Nigerian cities</span>
            <Link href="/products" className="inline-flex items-center gap-2 font-semibold text-white/90 transition hover:text-[var(--accent)]">
              Explore the catalog
              <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
            </Link>
          </div>
        </Center>
      </div>

      <Center>
        <div className="px-6 py-4">
          <div className="flex justify-between items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-2xl border border-[rgba(20,109,126,0.12)] bg-[linear-gradient(180deg,_rgba(255,255,255,0.98),_rgba(239,247,248,0.96))] p-2 shadow-[0_12px_28px_rgba(18,52,60,0.08)]">
              <Image
                src="/images/st-micheals-logo.png"
                alt="St. Michael's Logo"
                width={40}
                height={40}
                className="size-10 object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="block text-xl font-bold text-[var(--foreground-strong)]">
                St. Michael&apos;s Store
              </span>
              <span className="block text-xs font-medium uppercase tracking-[0.26em] text-[rgba(18,52,60,0.62)]">
                Premium essentials marketplace
              </span>
            </div>
          </Link>

          {/* Hamburger Icon */}
          <button
            className="md:hidden rounded-full border border-[rgba(20,109,126,0.14)] bg-white/70 px-3 py-2 text-[var(--foreground-strong)] shadow-sm"
            onClick={() => setNavOpen(!navOpen)}
            aria-expanded={navOpen}
            aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            <FontAwesomeIcon icon={navOpen ? faTimes : faBars} size="lg" />
          </button>

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
              id="cart-icon"
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
          <nav className="mt-4 grid gap-3 rounded-[1.5rem] border border-[rgba(20,109,126,0.12)] bg-[rgba(255,253,248,0.94)] p-3 shadow-[0_20px_40px_rgba(18,52,60,0.08)] md:hidden font-medium text-[var(--foreground-strong)]">
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
              id="cart-icon"
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
