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
    <header className="sticky top-0 z-40 border-b border-cyan-200/10 bg-[rgba(4,48,60,0.76)] backdrop-blur-xl">
      <div className="border-b border-cyan-200/10 bg-[linear-gradient(90deg,_rgba(10,122,146,0.98),_rgba(8,98,120,0.96))] text-[0.72rem] uppercase tracking-[0.24em] text-cyan-50">
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
            <div className="p-2 rounded-md bg-[linear-gradient(to_bottom,_#002a2d,_#0b3e3e)] shadow-lg shadow-teal-950/20">
              <Image
                src="/images/st-micheals-logo.png"
                alt="St. Michael's Logo"
                width={40}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="block text-xl font-bold text-white">
                St. Michael&apos;s Store
              </span>
              <span className="block text-xs font-medium uppercase tracking-[0.26em] text-cyan-100/70">
                Premium essentials marketplace
              </span>
            </div>
          </Link>

          {/* Hamburger Icon */}
          <button
            className="md:hidden text-white"
            onClick={() => setNavOpen(!navOpen)}
            aria-expanded={navOpen}
            aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            <FontAwesomeIcon icon={navOpen ? faTimes : faBars} size="lg" />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-3 font-medium text-cyan-50">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 transition ${
                  isActiveRoute(link.href)
                    ? "theme-button-accent shadow-lg"
                    : "hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/cart"
              id="cart-icon"
              className="theme-button-accent inline-flex items-center gap-2 rounded-full px-4 py-2 transition"
            >
              <FontAwesomeIcon icon={faCartShopping} />
              <span>Cart</span>
              <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs font-semibold">
                {cartCount || 0}
              </span>
            </Link>
          </nav>
        </div>

        {/* Mobile Nav */}
        {navOpen && (
          <nav className="mt-4 grid gap-3 md:hidden text-cyan-50 font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setNavOpen(false)}
                className={`rounded-2xl px-4 py-3 transition ${
                  isActiveRoute(link.href)
                    ? "theme-button-accent"
                    : "bg-white/10 hover:bg-white/15"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/cart"
              id="cart-icon"
              onClick={() => setNavOpen(false)}
              className="theme-button-accent flex items-center justify-between rounded-2xl px-4 py-3 transition"
            >
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCartShopping} />
                Cart
              </span>
              <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs font-semibold">
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
