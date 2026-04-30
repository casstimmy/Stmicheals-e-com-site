import Head from "next/head";
import Center from "@/components/Center";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

export default function AccountPage() {
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", name: "" });
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });
  const [customer, setCustomer] = useState(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [submittingAction, setSubmittingAction] = useState("");
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [debugOtp, setDebugOtp] = useState("");

  const loadSession = async () => {
    setSessionLoading(true);
    try {
      const response = await axios.get("/api/account/session");
      if (response.data?.authenticated) {
        setIsAuthenticated(true);
        setCustomer(response.data.customer);
        setOrders(response.data.orders || []);
        setProfileForm({
          name: response.data.customer.name || "",
          phone: response.data.customer.phone || "",
          address: response.data.customer.address || "",
          city: response.data.customer.city || "",
        });
      } else {
        setIsAuthenticated(false);
        setCustomer(null);
        setOrders([]);
      }
    } catch {
      setIsAuthenticated(false);
      setCustomer(null);
      setOrders([]);
    } finally {
      setSessionLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!loginForm.email) return;

    setSubmittingAction("request-otp");
    setErrorMessage("");
    setInfoMessage("");

    try {
      const response = await axios.post("/api/account/request-otp", loginForm);
      setOtpRequested(true);
      setInfoMessage(response.data.message || "Your sign-in code is on the way.");
      setDebugOtp(response.data.debugOtp || "");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "We could not send a sign-in code right now."
      );
    } finally {
      setSubmittingAction("");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !otpCode) return;

    setSubmittingAction("verify-otp");
    setErrorMessage("");
    setInfoMessage("");

    try {
      await axios.post("/api/account/verify-otp", {
        email: loginForm.email,
        code: otpCode,
      });
      setOtpCode("");
      setOtpRequested(false);
      setDebugOtp("");
      setInfoMessage("You are now signed in.");
      await loadSession();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "The sign-in code is invalid or expired."
      );
    } finally {
      setSubmittingAction("");
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSubmittingAction("save-profile");
    setErrorMessage("");
    setInfoMessage("");

    try {
      const response = await axios.put("/api/account/profile", profileForm);
      setCustomer(response.data.customer);
      setProfileForm({
        name: response.data.customer.name || "",
        phone: response.data.customer.phone || "",
        address: response.data.customer.address || "",
        city: response.data.customer.city || "",
      });
      setInfoMessage("Your account details have been updated.");
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "We could not update your profile right now."
      );
    } finally {
      setSubmittingAction("");
    }
  };

  const handleLogout = async () => {
    setSubmittingAction("logout");
    setErrorMessage("");
    setInfoMessage("");

    try {
      await axios.post("/api/account/logout");
      setIsAuthenticated(false);
      setCustomer(null);
      setOrders([]);
      setLoginForm({ email: "", name: "" });
      setProfileForm({ name: "", phone: "", address: "", city: "" });
      setOtpCode("");
      setOtpRequested(false);
      setDebugOtp("");
      setInfoMessage("You have been signed out.");
    } catch {
      setErrorMessage("We could not sign you out right now.");
    } finally {
      setSubmittingAction("");
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
            <div className="border-b border-cyan-200/10 pb-6">
              <span className="theme-tag inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] shadow-sm">
                Passwordless customer account
              </span>
              <h1 className="mt-4 text-3xl font-extrabold text-white mb-3">
                My Account
              </h1>
              <p className="max-w-2xl theme-muted">
                Sign in with a one-time code to manage your online customer profile and review orders securely.
              </p>
            </div>

            {sessionLoading ? (
              <div className="py-16 text-center theme-muted">Loading your account...</div>
            ) : !isAuthenticated ? (
              <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.75rem] bg-[linear-gradient(135deg,_rgba(18,56,60,0.96),_rgba(17,104,128,0.92))] p-8 text-white shadow-xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100/80">
                    Secure customer access
                  </p>
                  <h2 className="mt-4 text-3xl font-bold text-white">
                    One code. Full visibility into your orders.
                  </h2>
                  <p className="mt-4 max-w-xl text-cyan-50/85">
                    Use the same email you checkout with. We will send a one-time passcode so only you can view order history and update delivery details.
                  </p>

                  <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/70">Lookup</p>
                      <p className="mt-2 text-2xl font-bold">OTP-secured</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/70">Customer type</p>
                      <p className="mt-2 text-2xl font-bold">ONLINE</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                      <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/70">Access</p>
                      <p className="mt-2 text-2xl font-bold">No password</p>
                    </div>
                  </div>
                </div>

                <div className="theme-card-soft rounded-[1.75rem] p-6 shadow-lg">
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">Request a sign-in code</h2>
                    <p className="text-sm theme-muted">
                      New and returning customers can use email OTP sign-in.
                    </p>

                    <input
                      type="text"
                      placeholder="Full name"
                      value={loginForm.name}
                      onChange={(event) =>
                        setLoginForm((currentValue) => ({
                          ...currentValue,
                          name: event.target.value,
                        }))
                      }
                      className="theme-input w-full rounded-2xl px-4 py-3"
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm((currentValue) => ({
                          ...currentValue,
                          email: event.target.value,
                        }))
                      }
                      className="theme-input w-full rounded-2xl px-4 py-3"
                      required
                    />
                    <button
                      type="submit"
                      disabled={submittingAction === "request-otp"}
                      className="theme-button-accent w-full rounded-2xl px-6 py-3 transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submittingAction === "request-otp" ? "Sending code..." : "Send sign-in code"}
                    </button>
                  </form>

                  {otpRequested && (
                    <form onSubmit={handleVerifyOtp} className="mt-6 space-y-4 border-t border-cyan-200/10 pt-6">
                      <h3 className="text-xl font-bold text-white">Verify your code</h3>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={otpCode}
                        onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, ""))}
                        className="theme-input w-full rounded-2xl px-4 py-3 tracking-[0.4em]"
                        required
                      />
                      <button
                        type="submit"
                        disabled={submittingAction === "verify-otp"}
                        className="theme-button-primary w-full rounded-2xl px-6 py-3 transition disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submittingAction === "verify-otp" ? "Verifying..." : "Verify and sign in"}
                      </button>
                    </form>
                  )}

                  {debugOtp && (
                    <p className="mt-4 rounded-xl border border-amber-200/30 bg-amber-200/10 px-4 py-3 text-sm text-amber-100">
                      Development code: <span className="font-semibold tracking-[0.25em]">{debugOtp}</span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="mt-8 flex flex-col gap-4 rounded-[1.75rem] bg-[linear-gradient(135deg,_rgba(18,56,60,0.96),_rgba(17,104,128,0.92))] p-8 text-white shadow-xl lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/80">Signed in</p>
                    <h2 className="mt-3 text-3xl font-bold">Welcome back, {customer?.name || customer?.email}</h2>
                    <p className="mt-3 text-cyan-50/85">
                      Customer type: {customer?.type || "ONLINE"} · {customer?.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={submittingAction === "logout"}
                    className="theme-button-accent rounded-full px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submittingAction === "logout" ? "Signing out..." : "Sign out"}
                  </button>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-4">
                  <div className="theme-card-soft rounded-[1.5rem] p-5 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/70">Orders found</p>
                    <p className="mt-2 text-3xl font-bold text-white">{orders.length}</p>
                  </div>
                  <div className="theme-card-soft rounded-[1.5rem] p-5 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/70">Paid orders</p>
                    <p className="mt-2 text-3xl font-bold text-white">{paidOrders}</p>
                  </div>
                  <div className="theme-card-soft rounded-[1.5rem] p-5 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/70">Pending orders</p>
                    <p className="mt-2 text-3xl font-bold text-white">{pendingOrders}</p>
                  </div>
                  <div className="theme-card-soft rounded-[1.5rem] p-5 shadow-sm">
                    <p className="text-sm uppercase tracking-[0.22em] text-cyan-100/70">Total spend</p>
                    <p className="mt-2 text-3xl font-bold text-[var(--accent)]">₦{totalSpend.toLocaleString()}</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                  <form onSubmit={handleProfileSave} className="theme-card-soft rounded-[1.75rem] p-6 shadow-sm">
                    <h2 className="text-2xl font-bold text-white">Customer profile</h2>
                    <p className="mt-2 text-sm theme-muted">
                      Keep your online account details current for faster checkout.
                    </p>

                    <div className="mt-6 space-y-4">
                      <input
                        type="text"
                        placeholder="Full name"
                        value={profileForm.name}
                        onChange={(event) =>
                          setProfileForm((currentValue) => ({
                            ...currentValue,
                            name: event.target.value,
                          }))
                        }
                          className="theme-input w-full rounded-2xl px-4 py-3"
                      />
                      <input
                        type="email"
                        value={customer?.email || ""}
                        readOnly
                          className="w-full rounded-2xl border border-cyan-200/10 bg-black/10 px-4 py-3 text-cyan-100/55"
                      />
                      <input
                        type="tel"
                        placeholder="Phone number"
                        value={profileForm.phone}
                        onChange={(event) =>
                          setProfileForm((currentValue) => ({
                            ...currentValue,
                            phone: event.target.value,
                          }))
                        }
                        className="theme-input w-full rounded-2xl px-4 py-3"
                      />
                      <input
                        type="text"
                        placeholder="Street address"
                        value={profileForm.address}
                        onChange={(event) =>
                          setProfileForm((currentValue) => ({
                            ...currentValue,
                            address: event.target.value,
                          }))
                        }
                        className="theme-input w-full rounded-2xl px-4 py-3"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={profileForm.city}
                        onChange={(event) =>
                          setProfileForm((currentValue) => ({
                            ...currentValue,
                            city: event.target.value,
                          }))
                        }
                        className="theme-input w-full rounded-2xl px-4 py-3"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingAction === "save-profile"}
                      className="theme-button-accent mt-6 w-full rounded-2xl px-6 py-3 transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submittingAction === "save-profile" ? "Saving..." : "Save profile"}
                    </button>
                  </form>

                  <div className="theme-card-soft rounded-[1.75rem] p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white">Your orders</h2>
                        <p className="mt-2 text-sm theme-muted">
                          Payment status, fulfillment progress, and order recap in one view.
                        </p>
                      </div>
                    </div>

                    {orders.length === 0 ? (
                      <p className="mt-8 rounded-2xl border border-dashed border-cyan-200/20 bg-black/10 px-4 py-8 text-center theme-muted">
                        No orders have been linked to this account yet.
                      </p>
                    ) : (
                      <div className="mt-6 space-y-4">
                        {orders.map((order) => (
                          <div
                            key={order._id}
                            className="rounded-[1.5rem] border border-cyan-200/10 bg-black/10 p-5 hover:shadow-md transition"
                          >
                            <div className="mb-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="font-medium text-white text-lg">
                                  Order #{order._id.slice(-8)}
                                </p>
                                <p className="text-sm theme-muted">
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2 md:justify-end">
                                <span
                                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                                    order.paid
                                      ? "bg-emerald-200/15 text-emerald-100"
                                      : "bg-amber-200/15 text-amber-100"
                                  }`}
                                >
                                  {order.paid ? "Paid" : order.paymentStatus || "Pending"}
                                </span>
                                <span className="theme-card-soft inline-block rounded-full px-3 py-1 text-xs font-medium text-cyan-50">
                                  {order.status}
                                </span>
                              </div>
                            </div>

                            <div className="grid gap-2 text-sm theme-muted md:grid-cols-[1fr_auto] md:items-end">
                              <div>
                                <p>
                                  {order.items?.length || 0} items &middot; ₦{order.total?.toLocaleString()}
                                </p>
                                <p className="mt-1 text-cyan-100/55">
                                  {order.items?.slice(0, 2).map((item) => item.name).join(", ")}
                                  {order.items?.length > 2 ? " and more" : ""}
                                </p>
                              </div>
                              <Link
                                href={`/checkout/order-confirmation/${order._id}`}
                                className="theme-button-accent inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition"
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
              </>
            )}

            {errorMessage && (
              <div className="mt-6 rounded-xl border border-red-200/30 bg-red-200/10 px-4 py-3 text-sm text-red-100">
                {errorMessage}
              </div>
            )}

            {infoMessage && (
              <div className="mt-6 rounded-xl border border-emerald-200/30 bg-emerald-200/10 px-4 py-3 text-sm text-emerald-100">
                {infoMessage}
              </div>
            )}
          </div>
        </div>
      </Center>
    </>
  );
}
