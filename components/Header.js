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
    <header className="sticky top-0 z-40 border-b border-white/60 bg-[rgba(245,249,249,0.86)] backdrop-blur-xl">
      <div className="border-b border-slate-200/70 bg-[linear-gradient(90deg,_#12383c,_#1b5a5e)] text-[0.72rem] uppercase tracking-[0.24em] text-slate-100">
        <Center>
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2">
            <span>Trusted grocery delivery across major Nigerian cities</span>
            <Link href="/products" className="inline-flex items-center gap-2 font-semibold text-white/90 transition hover:text-white">
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
              <span className="block text-xl font-bold text-slate-900">
                St. Michael&apos;s Store
              </span>
              <span className="block text-xs font-medium uppercase tracking-[0.26em] text-slate-500">
                Premium essentials marketplace
              </span>
            </div>
          </Link>

          {/* Hamburger Icon */}
          <button
            className="md:hidden text-slate-700"
            onClick={() => setNavOpen(!navOpen)}
            aria-expanded={navOpen}
            aria-label={navOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            <FontAwesomeIcon icon={navOpen ? faTimes : faBars} size="lg" />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-3 font-medium text-slate-700">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 transition ${
                  isActiveRoute(link.href)
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                    : "hover:bg-white hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/cart"
              id="cart-icon"
              className="inline-flex items-center gap-2 rounded-full bg-[#12383c] px-4 py-2 text-white transition hover:bg-[#0d2b2d]"
            >
              <FontAwesomeIcon icon={faCartShopping} />
              <span>Cart</span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
                {cartCount || 0}
              </span>
            </Link>
          </nav>
        </div>

        {/* Mobile Nav */}
        {navOpen && (
          <nav className="mt-4 grid gap-3 md:hidden text-slate-700 font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setNavOpen(false)}
                className={`rounded-2xl px-4 py-3 transition ${
                  isActiveRoute(link.href)
                    ? "bg-slate-900 text-white"
                    : "bg-white/80 hover:bg-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/cart"
              id="cart-icon"
              onClick={() => setNavOpen(false)}
              className="flex items-center justify-between rounded-2xl bg-[#12383c] px-4 py-3 text-white transition hover:bg-[#0d2b2d]"
            >
              <span className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCartShopping} />
                Cart
              </span>
              <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">
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
