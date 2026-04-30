import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { CartContext } from "@/components/CartContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Header from "@/components/Header";
import Link from "next/link";
import Head from "next/head";
import Center from "@/components/Center";
import axios from "axios";
import { getPrimaryProductImage } from "@/lib/productImages";
import { SUPPORTED_SHIPPING_DESTINATIONS } from "@/lib/shipping";
import { getAvailableInventoryQuantity } from "@/lib/inventory";

export default function CartPage() {
  const { cartProducts, setCartProducts } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [shippingDetails, setShippingDetails] = useState(null);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: SUPPORTED_SHIPPING_DESTINATIONS[0] || "",
  });
  const [shippingCost, setShippingCost] = useState(2000);

  useEffect(() => {
    axios
      .get("/api/account/session")
      .then((response) => {
        if (!response.data?.authenticated) {
          return;
        }

        const accountCustomer = response.data.customer;
        setCustomer((currentValue) => ({
          ...currentValue,
          name: currentValue.name || accountCustomer.name || "",
          email: currentValue.email || accountCustomer.email || "",
          phone: currentValue.phone || accountCustomer.phone || "",
          address: currentValue.address || accountCustomer.address || "",
          city: currentValue.city || accountCustomer.city || currentValue.city,
        }));
      })
      .catch(() => {});
  }, []);

  // Fetch shipping cost when city changes
  useEffect(() => {
    if (customer.city) {
      axios
        .post("/api/shipping-cost", { destination: customer.city })
        .then((res) => {
          setShippingCost(res.data.cost);
          setShippingDetails(res.data);
        })
        .catch(() => {
          setShippingCost(2000);
          setShippingDetails(null);
        });
    }
  }, [customer.city]);

  useEffect(() => {
    const ids = cartProducts.map((p) => p.id);
    if (ids.length > 0) {
      let cancelled = false;

      axios.post("/api/cart", { ids }).then((res) => {
        if (!cancelled) {
          setProducts(res.data.products);
        }
      });

      return () => {
        cancelled = true;
      };
    }
  }, [cartProducts]);

  const displayedProducts = cartProducts.length > 0 ? products : [];
  const subtotal = displayedProducts.reduce((sum, product) => {
    const item = cartProducts.find((cartItem) => cartItem.id === product._id);
    const qty = item?.qty || 1;
    return sum + (product.salePriceIncTax || 0) * qty;
  }, 0);

  const updateQuantity = (productId, change) => {
    setCartProducts((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, qty: Math.max(1, item.qty + change) }
          : item
      )
    );
  };

  const handleCheckout = async () => {
    setCheckoutError("");

    const requiredFields = ["name", "email", "phone", "address", "city"];
    const missing = requiredFields.find((field) => !customer[field]);
    if (missing) {
      setCheckoutError(`Please enter your ${missing}.`);
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      setCheckoutError("Please enter a valid email address.");
      return;
    }

    // Validate phone
    const phoneDigits = customer.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setCheckoutError("Please enter a valid phone number with at least 10 digits.");
      return;
    }

    setIsLoading(true);
    const fullCartProducts = displayedProducts.map((product) => ({
      _id: product._id,
      quantity: cartProducts.find((item) => item.id === product._id)?.qty || 1,
    }));

    try {
      const orderRes = await axios.post("/api/orders", {
        customer,
        cartProducts: fullCartProducts,
      });

      const { orderId } = orderRes.data;

      if (!orderRes.data.success) {
        setCheckoutError("Failed to save your order.");
        setIsLoading(false);
        return;
      }

      const payRes = await axios.post("/api/paystack/initiate", {
        orderId,
      });

      if (payRes.data?.authorizationUrl) {
        window.location.href = payRes.data.authorizationUrl;
      } else {
        setCheckoutError("Failed to initiate payment.");
      }
    } catch (error) {
      setCheckoutError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Your Cart | MyStore</title>
      </Head>

      <Header />
      <Center>
        <div className="min-h-screen py-8 px-4 sm:px-8">
          <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Cart Items */}
            <div className="theme-shell-light md:col-span-2 rounded-2xl p-6 sm:p-8">
              <h1 className="mb-6 border-b border-[rgba(20,109,126,0.12)] pb-4 text-2xl font-extrabold text-[var(--foreground-strong)] sm:text-3xl">
                Shopping Cart
              </h1>

              {displayedProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="mb-6 text-lg theme-muted-page">
                    Your cart is currently empty.
                  </p>
                  <Link
                    href="/"
                    className="theme-button-accent inline-block px-6 py-3 rounded-lg transition"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto mb-8">
                    <table className="min-w-full text-left text-sm text-[var(--foreground)]">
                      <thead>
                        <tr className="bg-[rgba(20,148,182,0.08)] text-xs uppercase tracking-wider text-[rgba(18,52,60,0.62)]">
                          <th className="py-3 px-3 rounded-tl-xl">Product</th>
                          <th className="py-3 px-3 text-center">Quantity</th>
                          <th className="py-3 px-3 text-center">Price</th>
                          <th className="py-3 px-3 text-right rounded-tr-xl">Remove</th>
                        </tr>
                      </thead>
                     <tbody className="rounded-b-xl divide-y divide-[rgba(20,109,126,0.1)]">
  {displayedProducts.map((product, index) => {
    const cartItem = cartProducts.find((item) => item.id === product._id);
    const quantity = cartItem?.qty || 1;
    const imageSrc = getPrimaryProductImage(product?.images);
    const availableQuantity = getAvailableInventoryQuantity(product);

    return (
      <tr
        key={product._id}
        className={`transition duration-200 ${
          index % 2 === 0 ? "bg-white/55" : "bg-[rgba(20,148,182,0.04)]"
        } hover:bg-[rgba(20,148,182,0.08)]`}
      >
        <td className="py-3 px-2 sm:px-3">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
            <Image
              src={imageSrc}
              alt={product.name || "Product"}
              width={50}
              height={50}
              className="rounded-md border border-[rgba(20,109,126,0.14)] object-cover"
            />
            <div>
              <h2 className="text-sm font-medium text-[var(--foreground-strong)] sm:text-base">
                {product.name}
              </h2>
              <p className="text-xs text-[rgba(18,52,60,0.72)] sm:text-sm">
                ₦{(product.salePriceIncTax || 0).toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm theme-muted-page">
                {availableQuantity} available for this reservation window
              </p>
            </div>
          </div>
        </td>

        <td className="py-3 px-2 sm:px-4 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <button
              onClick={() => updateQuantity(product._id, -1)}
              aria-label="Decrease quantity"
              className="theme-button-secondary w-8 h-8 text-lg font-bold rounded-md focus:outline-none"
            >
              −
            </button>
            <span className="text-sm sm:text-base font-semibold min-w-[2rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(product._id, 1)}
              aria-label="Increase quantity"
              className="theme-button-secondary w-8 h-8 text-lg font-bold rounded-md focus:outline-none"
            >
              +
            </button>
          </div>
        </td>

        <td className="py-3 px-2 text-center text-sm font-semibold text-[var(--foreground-strong)] sm:px-3 sm:text-base">
          ₦{((product.salePriceIncTax || 0) * quantity).toLocaleString()}
        </td>

        <td className="py-3 px-2 sm:px-3 text-center sm:text-right">
          <button
            onClick={() =>
              setCartProducts((prev) =>
                prev.filter((item) => item.id !== product._id)
              )
            }
            className="text-lg text-rose-600 transition hover:text-rose-700 sm:text-xl"
            aria-label="Remove item"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </td>
      </tr>
    );
  })}
</tbody>

                    </table>
                  </div>

                  <div className="flex flex-col items-center justify-between gap-4 border-t border-[rgba(20,109,126,0.12)] pt-6 sm:flex-row">
                    <div className="text-lg text-[var(--foreground-strong)] sm:text-xl">
                      Subtotal:{" "}
                      <span className="font-semibold">
                        ₦{subtotal.toLocaleString()}
                      </span>
                    </div>
                    <Link
                      href="/"
                      className="theme-button-secondary inline-block px-6 py-3 rounded-lg transition"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Order Info + Customer Details */}
            <div className="panel-surface rounded-2xl p-6 sm:p-8 space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Order Information
              </h2>

              <div className="space-y-4 text-cyan-50/90 text-sm sm:text-base">
                <div className="flex justify-between border-b border-cyan-200/10 pb-2">
                  <span>Items:</span>
                  <span>{cartProducts.reduce((sum, i) => sum + i.qty, 0)}</span>
                </div>
                <div className="flex justify-between border-b border-cyan-200/10 pb-2">
                  <span>Subtotal:</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-cyan-200/10 pb-2">
                  <span>Shipping:</span>
                  <span>₦{shippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg sm:text-xl font-semibold pt-4">
                  <span>Total:</span>
                  <span>₦{(subtotal + shippingCost).toLocaleString()}</span>
                </div>
              </div>

              {shippingDetails && (
                <div className="theme-card-soft rounded-xl px-4 py-3 text-sm text-cyan-50">
                  Delivery quote for {shippingDetails.destination}: ₦{shippingCost.toLocaleString()}
                  {shippingDetails.isFallback ? " (standard rate applied)" : ""}
                </div>
              )}

              <div className="border-t border-cyan-200/10 pt-6">
                <h3 className="text-lg font-semibold mb-4 text-white">
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="theme-input w-full rounded-md p-2"
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer({ ...customer, name: e.target.value })
                    }
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="theme-input w-full rounded-md p-2"
                    value={customer.email}
                    onChange={(e) =>
                      setCustomer({ ...customer, email: e.target.value })
                    }
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="theme-input w-full rounded-md p-2"
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    className="theme-input w-full rounded-md p-2"
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer({ ...customer, address: e.target.value })
                    }
                  />
                  <label className="block text-sm font-medium text-cyan-50/85">
                    Delivery City
                    <select
                      className="theme-input mt-1 w-full rounded-md p-2"
                      value={customer.city}
                      onChange={(e) =>
                        setCustomer({ ...customer, city: e.target.value })
                      }
                    >
                      {SUPPORTED_SHIPPING_DESTINATIONS.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              {checkoutError && (
                <div className="rounded-lg border border-red-200/30 bg-red-200/10 px-4 py-3 text-sm text-red-100">
                  {checkoutError}
                </div>
              )}

              <div className="theme-card-soft rounded-xl px-4 py-3 text-sm text-cyan-50/85">
                Secure checkout: prices, stock, and delivery totals are revalidated on the server before payment starts.
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading || displayedProducts.length === 0}
                className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                  isLoading || displayedProducts.length === 0
                    ? "bg-white/10 text-cyan-100/45 cursor-not-allowed"
                    : "theme-button-accent"
                }`}
              >
                {isLoading ? "Processing..." : "Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      </Center>
    </>
  );
}
