import Link from "next/link";
import Center from "./Center";
import { useContext, useState } from "react";
import { CartContext } from "./CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function Header() {
  const { cartProducts } = useContext(CartContext);
  const [navOpen, setNavOpen] = useState(false);

  return (
    <Center>
      <header className="bg-white shadow-md py-4 px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-[linear-gradient(to_bottom,_#002a2d,_#0b3e3e)]">
              <img
                src="/images/st-micheals-logo.png"
                alt="St. Michael's Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <span className="text-xl font-bold text-gray-800 hidden sm:inline">
              St. Michael's Store
            </span>
          </Link>

          {/* Hamburger Icon */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setNavOpen(!navOpen)}
          >
            <FontAwesomeIcon icon={navOpen ? faTimes : faBars} size="lg" />
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6 items-center font-medium text-gray-700">
            <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            <Link href="/products" className="hover:text-blue-600 transition">All Products</Link>
            <Link href="/categories" className="hover:text-blue-600 transition">Categories</Link>
            <Link href="/account" className="hover:text-blue-600 transition">Account</Link>
            <Link
              href="/cart"
              id="cart-icon"
              className="flex items-center gap-1 hover:text-blue-600 transition"
            >
              <FontAwesomeIcon icon={faCartShopping} />
              <span>({cartProducts?.length || 0})</span>
            </Link>
          </nav>
        </div>

        {/* Mobile Nav */}
        {navOpen && (
          <nav className="flex flex-col mt-4 space-y-4 md:hidden text-gray-700 font-medium">
            <Link href="/" className="hover:text-blue-600 transition">Home</Link>
            <Link href="/products" className="hover:text-blue-600 transition">All Products</Link>
            <Link href="/categories" className="hover:text-blue-600 transition">Categories</Link>
            <Link href="/account" className="hover:text-blue-600 transition">Account</Link>
            <Link
              href="/cart"
              id="cart-icon"
              className="flex items-center gap-2 hover:text-blue-600 transition"
            >
              <FontAwesomeIcon icon={faCartShopping} />
              <span>({cartProducts?.length || 0})</span>
            </Link>
          </nav>
        )}
      </header>
    </Center>
  );
}
