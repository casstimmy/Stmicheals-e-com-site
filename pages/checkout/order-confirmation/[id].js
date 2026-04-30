import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import Header from "@/components/Header";
import Center from "@/components/Center";
import { getPrimaryProductImage } from "@/lib/productImages";
import { CartContext } from "@/components/CartContext";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const { id, reference, trxref } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationError, setVerificationError] = useState("");
  const verificationStartedRef = useRef(false);
  const { clearCart } = useContext(CartContext);

  useEffect(() => {
    if (!router.isReady || !id) {
      return;
    }

    let cancelled = false;

    async function finalizeOrder() {
      setLoading(true);
      setVerificationError("");

      try {
        const paymentReference =
          typeof reference === "string" && reference.trim()
            ? reference.trim()
            : typeof trxref === "string" && trxref.trim()
              ? trxref.trim()
              : "";

        if (paymentReference && !verificationStartedRef.current) {
          verificationStartedRef.current = true;
          await axios.post("/api/paystack/verify", { reference: paymentReference });
          clearCart();
        }

        const response = await axios.get(`/api/orders/${id}`);
        if (!cancelled) {
          setOrder(response.data);
          if (response.data?.paid) {
            clearCart();
          }
        }
      } catch (error) {
        console.error("Order finalization error:", error);
        if (!cancelled) {
          setVerificationError(
            error.response?.data?.error ||
              error.response?.data?.message ||
              "We could not confirm this payment yet."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    finalizeOrder();

    return () => {
      cancelled = true;
    };
  }, [clearCart, id, reference, router.isReady, trxref]);

  if (loading) {
    return (
      <>
        <Head>
          <title>Confirming Order | St Michael&apos;s Store</title>
        </Head>
        <Header />
        <Center>
          <div className="theme-shell-light mx-auto my-16 max-w-xl rounded-[2rem] px-6 py-10 text-center">
            <h1 className="text-2xl font-bold text-[var(--foreground-strong)]">Confirming your order</h1>
            <p className="mt-3 theme-muted-page">We are validating payment and loading your final order details.</p>
          </div>
        </Center>
      </>
    );
  }

  if (verificationError && !order) {
    return (
      <>
        <Head>
          <title>Payment Pending | St Michael&apos;s Store</title>
        </Head>
        <Header />
        <Center>
          <div className="max-w-xl mx-auto my-16 rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-red-800">Payment confirmation pending</h1>
            <p className="mt-3 text-red-700">{verificationError}</p>
            <p className="mt-3 text-sm text-red-600">
              If payment was completed, your order will remain available once verification succeeds.
            </p>
          </div>
        </Center>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Head>
          <title>Order Not Found | St Michael&apos;s Store</title>
        </Head>
        <Header />
        <Center>
          <div className="theme-shell-light mx-auto my-16 max-w-xl rounded-[2rem] px-6 py-10 text-center">
            <h1 className="text-2xl font-bold text-[var(--foreground-strong)]">Order not found</h1>
            <p className="mt-3 theme-muted-page">We could not locate that order record. Return to the storefront and try again from your recent orders.</p>
          </div>
        </Center>
      </>
    );
  }

  const shippingCost = (order.shippingCost).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  const totalAmount = (order.subtotal + order.shippingCost).toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
  });

  const orderDate = new Date(order.createdAt).toLocaleString();
  const itemCount = order.items?.length || 0;
  const paymentStatusLabel = order.paid ? "Confirmed" : order.paymentStatus || "Pending";

  return (
    <>
      <Head>
        <title>Order Confirmation | St Michael&apos;s Store</title>
      </Head>
      <Header />
      <Center>
        <div className="theme-shell-light mx-auto my-16 max-w-3xl rounded-2xl px-6 py-10">
          {verificationError && (
            <div className="mb-6 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {verificationError}
            </div>
          )}

          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/images/st-micheals-logo.png"
              alt="St Micheal's Logo"
              width={80}
              height={80}
              className="size-20"
            />
          </div>

          {/* Thank You Header */}
          <h1 className="mb-4 text-center text-3xl font-bold text-[var(--foreground-strong)] md:text-4xl">
            Thank you for your purchase!
          </h1>
          <p className="mb-8 text-center text-lg theme-muted-page">
            Order <strong>#{order._id}</strong> placed on <em>{orderDate}</em>.
          </p>

          <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
            <span className={`rounded-full px-4 py-2 text-sm font-semibold ${
              order.paid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}>
              Payment: {paymentStatusLabel}
            </span>
            <span className="theme-card-light rounded-full px-4 py-2 text-sm font-semibold text-[var(--foreground-strong)]">
              Fulfillment: {order.status}
            </span>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="theme-card-light rounded-[1.5rem] px-5 py-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Payment status</p>
              <p className="mt-2 text-3xl font-bold text-[var(--foreground-strong)]">{paymentStatusLabel}</p>
            </div>
            <div className="theme-card-light rounded-[1.5rem] px-5 py-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Fulfillment</p>
              <p className="mt-2 text-3xl font-bold text-[var(--foreground-strong)]">{order.status}</p>
            </div>
            <div className="theme-card-light rounded-[1.5rem] px-5 py-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-[rgba(18,52,60,0.52)]">Items in order</p>
              <p className="mt-2 text-3xl font-bold text-[var(--foreground-strong)]">{itemCount}</p>
            </div>
          </div>

          <section className="theme-card-light space-y-4 rounded-[1.5rem] p-6 shadow-sm">
            <h2 className="border-b border-[rgba(20,109,126,0.12)] pb-2 text-xl font-semibold text-[var(--foreground-strong)]">
              Customer Details
            </h2>
            <div className="grid gap-3 text-sm theme-muted-page">
              <p><span className="font-medium text-[var(--foreground-strong)]">Name:</span> {order.customerSnapshot?.name || order.customer?.name}</p>
              <p><span className="font-medium text-[var(--foreground-strong)]">Email:</span> {order.customerSnapshot?.email || order.customer?.email}</p>
              <p><span className="font-medium text-[var(--foreground-strong)]">Phone:</span> {order.customerSnapshot?.phone || order.customer?.phone}</p>
              <p>
                <span className="font-medium text-[var(--foreground-strong)]">Address:</span>{" "}
                {order.customerSnapshot?.address || order.customer?.address}
                {(order.customerSnapshot?.city || order.customer?.city) ? `, ${order.customerSnapshot?.city || order.customer?.city}` : ""}
              </p>
            </div>

            <div className="pt-6">
              <h3 className="mb-4 border-b border-[rgba(20,109,126,0.12)] pb-2 text-lg font-semibold text-[var(--foreground-strong)]">
                Items in Your Order
              </h3>

              {order.items && order.items.length > 0 ? (
                <ul className="space-y-4">
                  {order.items.map(({ _id, quantity, price, productId }) => {
                    const name = productId?.name || "Unnamed Product";
                    const unitPrice = productId?.salePriceIncTax ?? price ?? 0;
                    const totalPrice = unitPrice * quantity;
                    const image = getPrimaryProductImage(productId?.images);

                    return (
                      <li
                        key={_id}
                        className="flex flex-col justify-between gap-4 rounded-[1.25rem] border border-[rgba(20,109,126,0.12)] bg-white/75 p-4 md:flex-row md:items-center"
                      >
                        <div className="flex gap-4">
                          <Image
                            src={image}
                            alt={name}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded border border-[rgba(20,109,126,0.12)] object-cover"
                          />
                          <div>
                            <p className="text-lg font-medium text-[var(--foreground-strong)]">{name}</p>
                            <p className="text-sm theme-muted-page">
                              {quantity} × ₦{unitPrice.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right font-bold text-[var(--foreground-strong)]">
                          ₦{totalPrice.toLocaleString()}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm theme-muted-page">No items found in this order.</p>
              )}
            </div>

            <div className="space-y-2 border-t border-[rgba(20,109,126,0.12)] pt-4">
              <p className="text-lg font-medium text-[var(--foreground-strong)]">
                Shipping Cost: <span className="text-[var(--accent)]">{shippingCost}</span>
              </p>
              <p className="text-xl font-bold text-[var(--foreground-strong)]">
                Total Paid: <span className="text-[var(--accent)]">{totalAmount}</span>
              </p>
            </div>
          </section>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="theme-button-primary inline-block rounded-md px-6 py-3 text-lg font-semibold transition-all duration-200"
            >
              Continue Shopping
            </Link>
            <Link
              href="/account"
              className="theme-card-light inline-block rounded-md px-6 py-3 text-lg font-semibold text-[var(--foreground-strong)] shadow-sm"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </Center>
    </>
  );
}
