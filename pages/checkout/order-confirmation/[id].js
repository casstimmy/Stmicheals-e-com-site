import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import Header from "@/components/Header";
import Center from "@/components/Center";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem("cart");
  }, []);

  useEffect(() => {
    if (!id) return;

    axios
      .get(`/api/orders/${id}`)
      .then((res) => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Order fetch error:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />
        <Center>
          <p className="text-gray-500 text-center mt-20 text-lg">
            Fetching your order...
          </p>
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
        <div className="max-w-3xl mx-auto my-16 px-6 py-10 bg-white rounded-2xl shadow-lg border border-gray-200">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img
              src="/images/st-micheals-logo.png"
              alt="St Micheal's Logo"
              className="h-20 w-auto"
            />
          </div>

          {/* Thank You Header */}
          <h1 className="text-3xl md:text-4xl font-bold text-green-700 text-center mb-4">
            Thank you for your purchase!
          </h1>
          <p className="text-center text-gray-600 mb-8 text-lg">
            Order <strong>#{order._id}</strong> placed on <em>{orderDate}</em>.
          </p>

          {/* Order Summary */}
          <section className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold border-b border-gray-300 pb-2">
              Customer Details
            </h2>
            <p><span className="font-medium">Name:</span> {order.customer?.name}</p>
            <p><span className="font-medium">Email:</span> {order.customer?.email}</p>
            <p><span className="font-medium">Phone:</span> {order.customer?.phone}</p>
            <p>
              <span className="font-medium">Address:</span>{" "}
              {order.customer?.address}
              {order.customer?.city ? `, ${order.customer.city}` : ""}
            </p>

            {/* Items */}
            <div className="pt-6">
              <h3 className="text-lg font-semibold border-b border-gray-200 pb-2 mb-4">
                Items in Your Order
              </h3>

              {order.items && order.items.length > 0 ? (
                <ul className="space-y-4">
                  {order.items.map(({ _id, quantity, price, productId }) => {
                    const name = productId?.name || "Unnamed Product";
                    const unitPrice = productId?.salePriceIncTax ?? price ?? 0;
                    const totalPrice = unitPrice * quantity;
                    const image = productId?.images?.[0];

                    return (
                      <li
                        key={_id}
                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4"
                      >
                        <div className="flex gap-4">
                          {image && (
                            <img
                              src={image}
                              alt={name}
                              className="w-16 h-16 object-cover rounded border"
                            />
                          )}
                          <div>
                            <p className="font-medium text-lg">{name}</p>
                            <p className="text-sm text-gray-500">
                              {quantity} × ₦{unitPrice.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right font-bold text-gray-800">
                          ₦{totalPrice.toLocaleString()}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No items found in this order.</p>
              )}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <p className="text-lg font-medium">
                Shipping Cost: <span className="text-green-600">{shippingCost}</span>
              </p>
              <p className="text-xl font-bold">
                Total Paid: <span className="text-green-700">{totalAmount}</span>
              </p>
            </div>
          </section>

          {/* Continue Shopping */}
          <div className="mt-8 text-center">
              <Link
                href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 px-6 rounded-md transition-all duration-200"
            >
              Continue Shopping
              </Link>
          </div>
        </div>
      </Center>
    </>
  );
}
