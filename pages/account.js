import Head from "next/head";
import Center from "@/components/Center";
import Header from "@/components/Header";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setSearched(true);
    setErrorMessage("");
    try {
      const res = await axios.get(`/api/orders/by-email?email=${encodeURIComponent(email)}`);
      setOrders(res.data || []);
    } catch (error) {
      setOrders([]);
      setErrorMessage(
        error.response?.data?.message || "We could not retrieve orders for that email right now."
      );
    } finally {
      setLoading(false);
    }
  };

  const paidOrders = orders.filter((order) => order.paid).length;
  const pendingOrders = orders.length - paidOrders;
  const totalSpend = orders.reduce((runningTotal, order) => runningTotal + (order.total || 0), 0);

  return (
    <>
      <Head>
        <title>My Account | St Michael&apos;s Store</title>
      </Head>
      <Header />
      <Center>
        <div className="min-h-screen py-8 px-4 sm:px-8">
          <div className="panel-surface max-w-4xl mx-auto rounded-[2rem] p-8">
            <div className="border-b border-slate-200 pb-6">
              <span className="inline-flex rounded-full bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 shadow-sm">
                Guest order lookup
              </span>
              <h1 className="mt-4 text-3xl font-extrabold text-gray-800 mb-3">
              My Account
            </h1>
              <p className="max-w-2xl text-gray-600">
                Enter your checkout email to retrieve order history, payment status, and fulfillment progress.
              </p>
            </div>

            <form onSubmit={handleSearch} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="rounded-2xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition font-medium"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </form>

            <p className="mt-3 text-sm text-slate-500">
              This is a convenience lookup for customers who checked out without an account.
            </p>

            {orders.length > 0 && (
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.5rem] bg-white/75 p-5 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Orders found</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{orders.length}</p>
                </div>
                <div className="rounded-[1.5rem] bg-white/75 p-5 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Paid orders</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{paidOrders}</p>
                </div>
                <div className="rounded-[1.5rem] bg-white/75 p-5 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Total spend</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">₦{totalSpend.toLocaleString()}</p>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {searched && orders.length === 0 && !loading && (
              <p className="text-gray-500 text-center py-8">
                No orders found for this email.
              </p>
            )}

            {orders.length > 0 && (
              <div className="mt-8 space-y-4">
                <h2 className="text-xl font-bold text-gray-700">
                  Your Orders ({orders.length})
                </h2>
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="rounded-[1.5rem] border border-gray-200 bg-white/80 p-5 hover:shadow-md transition"
                  >
                    <div className="mb-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-medium text-gray-800 text-lg">
                          Order #{order._id.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            order.paid
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.paid ? "Paid" : "Pending"}
                        </span>
                        <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          {order.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-[1fr_auto] md:items-end">
                      <div>
                        <p>
                          {order.items?.length || 0} items &middot; ₦{order.total?.toLocaleString()}
                        </p>
                        <p className="mt-1 text-gray-500">
                          {order.items?.slice(0, 2).map((item) => item.name).join(", ")}
                          {order.items?.length > 2 ? " and more" : ""}
                        </p>
                      </div>
                      <Link
                        href={`/checkout/order-confirmation/${order._id}`}
                        className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        View order
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Center>
    </>
  );
}
