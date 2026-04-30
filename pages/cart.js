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
import { useRouter } from "next/router";
import {
  getPublicSiteConfig,
  getPublicScopedHref,
  inferPublicSiteFromPath,
  normalizePublicSite,
} from "@/lib/publicSite";

export default function CartPage() {
  const router = useRouter();
  const siteKey = normalizePublicSite(inferPublicSiteFromPath(router.pathname));
  const site = getPublicSiteConfig(siteKey);
  const { cartProducts, removeProductFromCart, updateProductQuantity } = useContext(CartContext);
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

      axios.post("/api/cart", { ids, siteKey }).then((res) => {
        if (!cancelled) {
          setProducts(res.data.products);
        }
      });

      return () => {
        cancelled = true;
      };
    }
  }, [cartProducts, siteKey]);

  const displayedProducts = cartProducts.length > 0 ? products : [];
  const cartLines = displayedProducts.map((product) => {
    const cartItem = cartProducts.find((item) => item.id === product._id);
    const quantity = cartItem?.qty || 1;
    const availableQuantity = getAvailableInventoryQuantity(product);

    return {
      product,
      quantity,
      imageSrc: getPrimaryProductImage(product?.images),
      availableQuantity,
      isSoldOut: availableQuantity === 0,
      exceedsStock: availableQuantity > 0 && quantity > availableQuantity,
    };
  });
  const subtotal = cartLines.reduce(
    (sum, line) => sum + (line.product.salePriceIncTax || 0) * line.quantity,
    0
  );
  const totalItems = cartProducts.reduce((sum, item) => sum + item.qty, 0);
  const hasInventoryIssues = cartLines.some((line) => line.isSoldOut || line.exceedsStock);
  const inventoryAlertText = cartLines
    .filter((line) => line.isSoldOut || line.exceedsStock)
    .map((line) =>
      line.isSoldOut
        ? `${line.product.name} is currently unavailable.`
        : `${line.product.name} exceeds available stock. Reduce to ${line.availableQuantity}.`
    )
    .join(" ");

  const handleQuantityChange = (productId, nextQuantity, availableQuantity) => {
    if (availableQuantity === 0) {
      return;
    }

    const clampedQuantity = Math.max(1, Math.min(nextQuantity, availableQuantity));
    updateProductQuantity(productId, clampedQuantity, { maxQuantity: availableQuantity });
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
        siteKey,
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
        <title>{`Your Cart | ${site.displayName}`}</title>
      </Head>

      <Header siteKey={siteKey} />
      <Center>
        <div className="min-h-screen px-3 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 md:grid-cols-3 md:gap-8">
            {/* Cart Items */}
            <div className="theme-shell-light rounded-[1.75rem] p-4 sm:rounded-2xl sm:p-8 md:col-span-2">
              <h1 className="mb-6 border-b border-[rgba(20,109,126,0.12)] pb-4 text-2xl font-extrabold text-[var(--foreground-strong)] sm:text-3xl">
                Shopping Cart
              </h1>

              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    label: "1. Review basket",
                    detail: "Check stock-aware quantities before payment.",
                  },
                  {
                    label: "2. Confirm delivery",
                    detail: "Shipping costs update instantly by destination.",
                  },
                  {
                    label: "3. Start payment",
                    detail: "Order totals are revalidated on the server.",
                  },
                ].map((step) => (
                  <div key={step.label} className="theme-card-light rounded-[1.5rem] px-4 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">{step.label}</p>
                    <p className="mt-2 text-sm leading-7 theme-muted-page">{step.detail}</p>
                  </div>
                ))}
              </div>

              {displayedProducts.length === 0 ? (
                <div className="text-center py-16">
                  <p className="mb-6 text-lg theme-muted-page">
                    Your cart is currently empty.
                  </p>
                  <Link
                    href={getPublicScopedHref(siteKey, "/")}
                    className="theme-button-accent inline-block px-6 py-3 rounded-lg transition"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <>
                  {hasInventoryIssues && (
                    <div className="mb-6 rounded-[1.5rem] border border-amber-200/80 bg-amber-50 px-5 py-4 text-sm text-amber-800">
                      Resolve stock alerts before payment can begin. {inventoryAlertText}
                    </div>
                  )}

                  <div className="mb-6 space-y-4 sm:hidden">
                    {cartLines.map((line) => (
                      <div key={line.product._id} className="theme-card-light rounded-[1.35rem] p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <Image
                            src={line.imageSrc}
                            alt={line.product.name || "Product"}
                            width={72}
                            height={72}
                            className="h-[4.5rem] w-[4.5rem] rounded-xl border border-[rgba(20,109,126,0.14)] object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h2 className="line-clamp-2 text-sm font-semibold text-[var(--foreground-strong)]">
                                  {line.product.name}
                                </h2>
                                <p className="mt-1 text-sm text-[rgba(18,52,60,0.72)]">
                                  ₦{(line.product.salePriceIncTax || 0).toLocaleString()} each
                                </p>
                              </div>
                              <button
                                onClick={() => removeProductFromCart(line.product._id)}
                                className="text-lg text-rose-600 transition hover:text-rose-700"
                                aria-label="Remove item"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>

                            <p
                              className={`mt-2 text-xs leading-6 ${
                                line.isSoldOut
                                  ? "text-rose-600"
                                  : line.exceedsStock
                                    ? "text-amber-700"
                                    : "theme-muted-page"
                              }`}
                            >
                              {line.isSoldOut
                                ? "Currently unavailable. Remove before checkout."
                                : line.exceedsStock
                                  ? `Reduce quantity to ${line.availableQuantity} to continue.`
                                  : `${line.availableQuantity} available for this reservation window`}
                            </p>

                            <div className="mt-4 flex items-end justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      line.product._id,
                                      line.quantity - 1,
                                      line.availableQuantity
                                    )
                                  }
                                  aria-label="Decrease quantity"
                                  disabled={line.quantity <= 1 || line.isSoldOut}
                                  className="theme-button-secondary inline-flex h-9 w-9 items-center justify-center rounded-xl text-lg font-bold disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  −
                                </button>
                                <span className="min-w-[2rem] text-center text-sm font-semibold text-[var(--foreground-strong)]">
                                  {line.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      line.product._id,
                                      line.quantity + 1,
                                      line.availableQuantity
                                    )
                                  }
                                  aria-label="Increase quantity"
                                  disabled={line.isSoldOut || line.quantity >= line.availableQuantity}
                                  className="theme-button-secondary inline-flex h-9 w-9 items-center justify-center rounded-xl text-lg font-bold disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  +
                                </button>
                              </div>

                              <div className="text-right">
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[rgba(18,52,60,0.46)]">
                                  Line total
                                </p>
                                <p className="mt-1 text-sm font-semibold text-[var(--foreground-strong)]">
                                  ₦{((line.product.salePriceIncTax || 0) * line.quantity).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-8 hidden overflow-x-auto sm:block">
                    <table className="min-w-full text-left text-sm text-[var(--foreground)]">
                      <thead>
                        <tr className="bg-[rgba(20,148,182,0.08)] text-xs uppercase tracking-wider text-[rgba(18,52,60,0.62)]">
                          <th className="py-3 px-3 rounded-tl-xl">Product</th>
                          <th className="py-3 px-3 text-center">Quantity</th>
                          <th className="py-3 px-3 text-center">Price</th>
                          <th className="py-3 px-3 text-right rounded-tr-xl">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(20,109,126,0.1)] rounded-b-xl">
                        {cartLines.map((line, index) => (
                          <tr
                            key={line.product._id}
                            className={`transition duration-200 ${
                              index % 2 === 0 ? "bg-white/55" : "bg-[rgba(20,148,182,0.04)]"
                            } hover:bg-[rgba(20,148,182,0.08)]`}
                          >
                            <td className="px-2 py-3 sm:px-3">
                              <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:gap-4 sm:text-left">
                                <Image
                                  src={line.imageSrc}
                                  alt={line.product.name || "Product"}
                                  width={50}
                                  height={50}
                                  className="rounded-md border border-[rgba(20,109,126,0.14)] object-cover"
                                />
                                <div>
                                  <h2 className="text-sm font-medium text-[var(--foreground-strong)] sm:text-base">
                                    {line.product.name}
                                  </h2>
                                  <p className="text-xs text-[rgba(18,52,60,0.72)] sm:text-sm">
                                    ₦{(line.product.salePriceIncTax || 0).toLocaleString()}
                                  </p>
                                  <p
                                    className={`text-xs sm:text-sm ${
                                      line.isSoldOut
                                        ? "text-rose-600"
                                        : line.exceedsStock
                                          ? "text-amber-700"
                                          : "theme-muted-page"
                                    }`}
                                  >
                                    {line.isSoldOut
                                      ? "Currently unavailable. Remove before checkout."
                                      : line.exceedsStock
                                        ? `Reduce quantity to ${line.availableQuantity} to continue.`
                                        : `${line.availableQuantity} available for this reservation window`}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-2 py-3 text-center sm:px-4">
                              <div className="flex flex-col items-center justify-center gap-1 sm:flex-row sm:gap-2">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      line.product._id,
                                      line.quantity - 1,
                                      line.availableQuantity
                                    )
                                  }
                                  aria-label="Decrease quantity"
                                  disabled={line.quantity <= 1 || line.isSoldOut}
                                  className="theme-button-secondary h-8 w-8 rounded-md text-lg font-bold focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  −
                                </button>
                                <span className="min-w-[2rem] text-center text-sm font-semibold sm:text-base">
                                  {line.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      line.product._id,
                                      line.quantity + 1,
                                      line.availableQuantity
                                    )
                                  }
                                  aria-label="Increase quantity"
                                  disabled={line.isSoldOut || line.quantity >= line.availableQuantity}
                                  className="theme-button-secondary h-8 w-8 rounded-md text-lg font-bold focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            <td className="px-2 py-3 text-center text-sm font-semibold text-[var(--foreground-strong)] sm:px-3 sm:text-base">
                              ₦{((line.product.salePriceIncTax || 0) * line.quantity).toLocaleString()}
                            </td>

                            <td className="px-2 py-3 text-center sm:px-3 sm:text-right">
                              <button
                                onClick={() => removeProductFromCart(line.product._id)}
                                className="text-lg text-rose-600 transition hover:text-rose-700 sm:text-xl"
                                aria-label="Remove item"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </td>
                          </tr>
                        ))}
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
                      href={getPublicScopedHref(siteKey, "/")}
                      className="theme-button-secondary inline-block w-full rounded-lg px-6 py-3 text-center transition sm:w-auto"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Order Info + Customer Details */}
            <div className="panel-surface space-y-5 rounded-[1.75rem] p-5 sm:space-y-6 sm:rounded-2xl sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Order Information
              </h2>

              <div className="space-y-4 text-cyan-50/90 text-sm sm:text-base">
                <div className="flex justify-between border-b border-cyan-200/10 pb-2">
                  <span>Items:</span>
                  <span>{totalItems}</span>
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
                    className="theme-input w-full rounded-xl px-4 py-3"
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer({ ...customer, name: e.target.value })
                    }
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="theme-input w-full rounded-xl px-4 py-3"
                    value={customer.email}
                    onChange={(e) =>
                      setCustomer({ ...customer, email: e.target.value })
                    }
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="theme-input w-full rounded-xl px-4 py-3"
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    className="theme-input w-full rounded-xl px-4 py-3"
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer({ ...customer, address: e.target.value })
                    }
                  />
                  <label className="block text-sm font-medium text-cyan-50/85">
                    Delivery City
                    <select
                      className="theme-input mt-1 w-full rounded-xl px-4 py-3"
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
                Signed-in customers also get profile details prefilled automatically.
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading || displayedProducts.length === 0 || hasInventoryIssues}
                className={`w-full min-h-[3.35rem] rounded-xl py-3 font-semibold text-white transition ${
                  isLoading || displayedProducts.length === 0 || hasInventoryIssues
                    ? "bg-white/10 text-cyan-100/45 cursor-not-allowed"
                    : "theme-button-accent"
                }`}
              >
                {isLoading
                  ? "Processing..."
                  : hasInventoryIssues
                    ? "Resolve stock alerts to continue"
                    : "Proceed to Payment"}
              </button>
            </div>
          </div>
        </div>
      </Center>
    </>
  );
}
