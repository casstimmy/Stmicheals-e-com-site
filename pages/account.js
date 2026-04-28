import Head from "next/head";
import Center from "@/components/Center";
import Header from "@/components/Header";
import { useState } from "react";
import axios from "axios";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await axios.get(`/api/orders/by-email?email=${encodeURIComponent(email)}`);
      setOrders(res.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>My Account | St Michael&apos;s Store</title>
      </Head>
      <Header />
      <Center>
        <div className="min-h-screen py-8 px-4 sm:px-8 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">
              My Account
            </h1>
            <p className="text-gray-600 mb-6">
              Enter your email to view your order history.
            </p>
            <form onSubmit={handleSearch} className="flex gap-3 mb-8">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </form>

            {searched && orders.length === 0 && !loading && (
              <p className="text-gray-500 text-center py-8">
                No orders found for this email.
              </p>
            )}

            {orders.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-700">
                  Your Orders ({orders.length})
                </h2>
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-800">
                          Order #{order._id.slice(-8)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            order.paid
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.paid ? "Paid" : "Pending"}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.items?.length || 0} items &middot; ₦
                      {order.total?.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {order.status}
                    </p>
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
