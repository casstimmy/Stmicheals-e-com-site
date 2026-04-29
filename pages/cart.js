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

export default function CartPage() {
  const { cartProducts, setCartProducts } = useContext(CartContext);
  const [products, setProducts] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
  });
  const [shippingCost, setShippingCost] = useState(2000);

  // Fetch shipping cost when city changes
  useEffect(() => {
    if (customer.city) {
      axios.post("/api/shipping-cost", { destination: customer.city })
        .then((res) => setShippingCost(res.data.cost))
        .catch(() => setShippingCost(2000)); // fallback
    }
  }, [customer.city]);

  useEffect(() => {
    const ids = cartProducts.map((p) => p.id);
    if (ids.length > 0) {
      axios.post("/api/cart", { ids }).then((res) => {
        setProducts(res.data.products);
      });
    } else {
      setProducts([]);
      setSubtotal(0);
    }
  }, [cartProducts]);

  useEffect(() => {
    const total = products.reduce((sum, product) => {
      const item = cartProducts.find((i) => i.id === product._id);
      const qty = item?.qty || 1;
      return sum + (product.salePriceIncTax || 0) * qty;
    }, 0);
    setSubtotal(total);
  }, [products, cartProducts]);

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
    const requiredFields = ["name", "email", "phone", "address", "city"];
    const missing = requiredFields.find((field) => !customer[field]);
    if (missing) {
      alert(`Please enter your ${missing}`);
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      alert("Please enter a valid email address");
      return;
    }

    // Validate phone
    const phoneDigits = customer.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      alert("Please enter a valid phone number (at least 10 digits)");
      return;
    }

    setIsLoading(true);
    const totalAmount = subtotal + shippingCost;
    const fullCartProducts = products.map((product) => ({
      _id: product._id,
      title: product.name,
      price: product.salePriceIncTax || 0,
      quantity: cartProducts.find((item) => item.id === product._id)?.qty || 1,
    }));

    try {
      const orderRes = await axios.post("/api/orders", {
        customer,
        cartProducts: fullCartProducts,
        subtotal,
        shippingCost,
        total: totalAmount,
      });

      const { orderId } = orderRes.data;

      if (!orderRes.data.success) {
        alert("Failed to save order.");
        setIsLoading(false);
        return;
      }

      const amountInKobo = Math.round(totalAmount * 100);
      if (amountInKobo <= 0) {
        alert("Total amount must be greater than zero.");
        setIsLoading(false);
        return;
      }

      const payRes = await axios.post("/api/paystack/initiate", {
        email: customer.email,
        amount: amountInKobo,
        customer,
        cartProducts,
        orderId,
      });

      if (payRes.data?.authorizationUrl) {
        window.location.href = payRes.data.authorizationUrl;
      } else {
        alert("Failed to initiate payment.");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
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
        <div className="min-h-screen py-8 px-4 sm:px-8 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Cart Items */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">
                Shopping Cart
              </h1>

              {products.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-500 text-lg mb-6">
                    Your cart is currently empty.
                  </p>
                  <Link
                    href="/"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto mb-8">
                    <table className="min-w-full text-sm text-left text-gray-600">
                      <thead>
                        <tr className="bg-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                          <th className="py-3 px-3 rounded-tl-xl">Product</th>
                          <th className="py-3 px-3 text-center">Quantity</th>
                          <th className="py-3 px-3 text-center">Price</th>
                          <th className="py-3 px-3 text-right rounded-tr-xl">Remove</th>
                        </tr>
                      </thead>
                     <tbody className="bg-white shadow-md rounded-b-xl divide-y divide-gray-100">
  {products.map((product, index) => {
    const cartItem = cartProducts.find((item) => item.id === product._id);
    const quantity = cartItem?.qty || 1;
    const imageSrc = getPrimaryProductImage(product?.images);

    return (
      <tr
        key={product._id}
        className={`transition duration-200 ${
          index % 2 === 0 ? "bg-white" : "bg-gray-50"
        } hover:bg-gray-100`}
      >
        <td className="py-3 px-2 sm:px-3">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-center sm:text-left">
            <Image
              src={imageSrc}
              alt={product.name || "Product"}
              width={50}
              height={50}
              className="rounded-md object-cover border border-gray-200"
            />
            <div>
              <h2 className="text-sm sm:text-base font-medium text-gray-900">
                {product.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                ₦{(product.salePriceIncTax || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </td>

        <td className="py-3 px-2 sm:px-4 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
            <button
              onClick={() => updateQuantity(product._id, -1)}
              aria-label="Decrease quantity"
              className="w-8 h-8 text-lg font-bold bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              −
            </button>
            <span className="text-sm sm:text-base font-semibold min-w-[2rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(product._id, 1)}
              aria-label="Increase quantity"
              className="w-8 h-8 text-lg font-bold bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              +
            </button>
          </div>
        </td>

        <td className="py-3 px-2 sm:px-3 text-center font-semibold text-gray-800 text-sm sm:text-base">
          ₦{((product.salePriceIncTax || 0) * quantity).toLocaleString()}
        </td>

        <td className="py-3 px-2 sm:px-3 text-center sm:text-right">
          <button
            onClick={() =>
              setCartProducts((prev) =>
                prev.filter((item) => item.id !== product._id)
              )
            }
            className="text-red-600 hover:text-red-800 text-lg sm:text-xl"
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

                  <div className="flex flex-col sm:flex-row justify-between items-center border-t pt-6 gap-4">
                    <div className="text-lg sm:text-xl text-gray-800">
                      Subtotal:{" "}
                      <span className="font-semibold">
                        ₦{subtotal.toLocaleString()}
                      </span>
                    </div>
                    <Link
                      href="/"
                      className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Order Info + Customer Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Order Information
              </h2>

              <div className="space-y-4 text-gray-700 text-sm sm:text-base">
                <div className="flex justify-between border-b pb-2">
                  <span>Items:</span>
                  <span>{cartProducts.reduce((sum, i) => sum + i.qty, 0)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Subtotal:</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Shipping:</span>
                  <span>₦{shippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg sm:text-xl font-semibold pt-4">
                  <span>Total:</span>
                  <span>₦{(subtotal + shippingCost).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Customer Information
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full border rounded-md p-2"
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer({ ...customer, name: e.target.value })
                    }
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full border rounded-md p-2"
                    value={customer.email}
                    onChange={(e) =>
                      setCustomer({ ...customer, email: e.target.value })
                    }
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    className="w-full border rounded-md p-2"
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Street Address"
                    className="w-full border rounded-md p-2"
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer({ ...customer, address: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="City"
                    className="w-full border rounded-md p-2"
                    value={customer.city}
                    onChange={(e) =>
                      setCustomer({ ...customer, city: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isLoading || products.length === 0}
                className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                  isLoading || products.length === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
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
