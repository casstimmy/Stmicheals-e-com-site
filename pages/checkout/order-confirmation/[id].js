import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
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
  }, [id, reference, router.isReady, trxref]);

  if (loading) {
    return (
      <>
        <Header />
        <Center>
          <p className="text-gray-500 text-center mt-20 text-lg">
            Confirming your order...
          </p>
        </Center>
      </>
    );
  }

  if (verificationError && !order) {
    return (
      <>
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
        <Header />
        <Center>
          <p className="text-red-600 text-center mt-20 text-lg">
            Order not found.
          </p>
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

  return (
    <>
      <Header />
      <Center>
        <div className="panel-surface max-w-3xl mx-auto my-16 px-6 py-10 rounded-2xl">
          {verificationError && (
            <div className="mb-6 rounded-xl border border-amber-200/30 bg-amber-200/10 px-4 py-3 text-sm text-amber-100">
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
              className="h-20 w-auto"
            />
          </div>

          {/* Thank You Header */}
          <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            Thank you for your purchase!
          </h1>
          <p className="text-center theme-muted mb-8 text-lg">
            Order <strong>#{order._id}</strong> placed on <em>{orderDate}</em>.
          </p>

          <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
            <span className={`rounded-full px-4 py-2 text-sm font-semibold ${
              order.paid ? "bg-emerald-200/15 text-emerald-100" : "bg-amber-200/15 text-amber-100"
            }`}>
              Payment: {order.paid ? "Confirmed" : order.paymentStatus || "Pending"}
            </span>
            <span className="theme-card-soft rounded-full px-4 py-2 text-sm font-semibold text-cyan-50">
              Fulfillment: {order.status}
            </span>
          </div>

          {/* Order Summary */}
          <section className="theme-card-soft rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold border-b border-cyan-200/10 pb-2 text-white">
              Customer Details
            </h2>
            <p><span className="font-medium">Name:</span> {order.customerSnapshot?.name || order.customer?.name}</p>
            <p><span className="font-medium">Email:</span> {order.customerSnapshot?.email || order.customer?.email}</p>
            <p><span className="font-medium">Phone:</span> {order.customerSnapshot?.phone || order.customer?.phone}</p>
            <p>
              <span className="font-medium">Address:</span>{" "}
              {order.customerSnapshot?.address || order.customer?.address}
              {(order.customerSnapshot?.city || order.customer?.city) ? `, ${order.customerSnapshot?.city || order.customer?.city}` : ""}
            </p>

            {/* Items */}
            <div className="pt-6">
              <h3 className="text-lg font-semibold border-b border-cyan-200/10 pb-2 mb-4 text-white">
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
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-200/10 pb-4"
                      >
                        <div className="flex gap-4">
                          <Image
                            src={image}
                            alt={name}
                            width={64}
                            height={64}
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <div>
                            <p className="font-medium text-lg text-white">{name}</p>
                            <p className="text-sm theme-muted">
                              {quantity} × ₦{unitPrice.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right font-bold text-white">
                          ₦{totalPrice.toLocaleString()}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm theme-muted">No items found in this order.</p>
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-cyan-200/10 pt-4 space-y-2">
              <p className="text-lg font-medium">
                Shipping Cost: <span className="text-[var(--accent)]">{shippingCost}</span>
              </p>
              <p className="text-xl font-bold text-white">
                Total Paid: <span className="text-[var(--accent)]">{totalAmount}</span>
              </p>
            </div>
          </section>

          {/* Continue Shopping */}
          <div className="mt-8 text-center">
              <Link
                href="/"
              className="theme-button-accent inline-block text-lg font-semibold py-3 px-6 rounded-md transition-all duration-200"
            >
              Continue Shopping
              </Link>
          </div>
        </div>
      </Center>
    </>
  );
}
