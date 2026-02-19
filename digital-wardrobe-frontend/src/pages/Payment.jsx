import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RotatingImageBox from "../components/RotatingImageBox";
import axios from "axios";
import { useCart } from "../context/CartContext";

export default function Payment() {
  const navigate = useNavigate();
  const { cart = [], clearCart } = useCart() || {};
  const [paymentMethod, setPaymentMethod] = useState("card");

  const [form, setForm] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    paypalEmail: "",
  });
  const [appleAuthorized, setAppleAuthorized] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length < 3) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const isValidExpiry = (value) => {
    if (!/^\d{2}\/\d{2}$/.test(value)) return false;

    const [monthStr, yearStr] = value.split("/");
    const month = Number(monthStr);
    const year = Number(`20${yearStr}`);
    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return year > currentYear || (year === currentYear && month >= currentMonth);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "expiry") {
      setForm({ ...form, expiry: formatExpiry(value) });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const isCardFormComplete =
    form.cardName.trim() &&
    form.cardNumber.trim() &&
    isValidExpiry(form.expiry) &&
    form.cvv.trim();

  const isFormComplete =
    paymentMethod === "card"
      ? isCardFormComplete
      : paymentMethod === "paypal"
        ? form.paypalEmail.trim()
        : appleAuthorized;
  const hasMissingSizes = cart.some(
    (item) =>
      Array.isArray(item.sizes) &&
      item.sizes.length > 0 &&
      !item.selectedSize
  );

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!isFormComplete) return;
    if (paymentMethod === "card" && !isValidExpiry(form.expiry)) {
      setError("Expiry must be a valid future date in MM/YY format.");
      return;
    }

    const storedUserRaw = localStorage.getItem("user");
    if (!storedUserRaw) {
      navigate("/login");
      return;
    }

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }
    if (hasMissingSizes) {
      setError("Please go back and select sizes for all size-based items before placing the order.");
      return;
    }

    let user = null;
    try {
      user = JSON.parse(storedUserRaw);
    } catch {
      setError("Session data is invalid. Please log in again.");
      navigate("/login");
      return;
    }

    const userId = user?._id || user?.id;
    if (!userId) {
      setError("Could not identify your account. Please log in again.");
      navigate("/login");
      return;
    }

    const orderPayload = {
      user: userId,
      paymentMethod,
      items: cart.map((item) => ({
        productId: item._id,
        name: item.name,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        size: item.selectedSize || null,
      })),
      totalAmount: cart.reduce(
        (sum, item) =>
          sum + Number(item.price || 0) * Number(item.quantity || 1),
        0
      ),
    };

    try {
      setSubmitting(true);
      setError("");
      const res = await axios.post("http://localhost:3001/api/orders", orderPayload);
      const createdOrder = res?.data || {};
      const invoice = {
        invoiceNumber: `INV-${String(createdOrder?._id || Date.now())
          .slice(-8)
          .toUpperCase()}`,
        orderId: createdOrder?._id || "",
        createdAt: createdOrder?.createdAt || new Date().toISOString(),
        paymentMethod,
        customerName: user?.name || "Customer",
        customerEmail: user?.email || "",
        items: orderPayload.items,
        totalAmount: Number(orderPayload.totalAmount || 0),
      };

      sessionStorage.setItem("latestInvoice", JSON.stringify(invoice));
      if (clearCart) clearCart();
      navigate("/order-confirmation", { state: { invoice } });
    } catch (err) {
      if (err?.response) {
        const backendPayload = err.response.data;
        const backendMessage =
          typeof backendPayload === "string"
            ? backendPayload
            : backendPayload?.message || backendPayload?.error;
        const status = err.response.status;
        setError(
          backendMessage || `Order request failed (HTTP ${status}).`
        );
      } else if (err?.message === "Network Error" || err?.request) {
        setError("Cannot reach backend at http://localhost:3001.");
      } else {
        setError(err?.message || "Failed to place order. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-latte px-12 py-16">
      <h1 className="text-4xl font-serif text-cocoa mb-12">
        Secure Payment
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        
        {/* LEFT SIDE — ROTATING CLOTHING PREVIEW */}
        <div className="flex justify-center">
          <RotatingImageBox />
        </div>

        {/* RIGHT SIDE — PAYMENT FORM */}
        <form
          onSubmit={placeOrder}
          className="bg-beige max-w-xl p-8 rounded-2xl shadow-sm space-y-6"
        >
          <div>
            <p className="block text-sm text-cocoa mb-2">Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`rounded-md border px-3 py-2 text-sm ${
                  paymentMethod === "card"
                    ? "bg-mocha text-latte border-mocha"
                    : "border-cocoa/20 text-cocoa"
                }`}
              >
                Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("paypal")}
                className={`rounded-md border px-3 py-2 text-sm ${
                  paymentMethod === "paypal"
                    ? "bg-mocha text-latte border-mocha"
                    : "border-cocoa/20 text-cocoa"
                }`}
              >
                PayPal
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("applepay")}
                className={`rounded-md border px-3 py-2 text-sm ${
                  paymentMethod === "applepay"
                    ? "bg-mocha text-latte border-mocha"
                    : "border-cocoa/20 text-cocoa"
                }`}
              >
                Apple Pay
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          {hasMissingSizes && (
            <p className="text-sm text-red-600">
              Missing sizes in cart. Go to checkout and set sizes for all required items.
            </p>
          )}

          {paymentMethod === "card" && (
            <>
              <div>
                <label className="block text-sm text-cocoa mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  name="cardName"
                  value={form.cardName}
                  onChange={handleChange}
                  placeholder="Name on card"
                  className="w-full p-3 rounded-md border border-cocoa/20 focus:outline-none focus:ring-2 focus:ring-mocha"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-cocoa mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  name="cardNumber"
                  value={form.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className="w-full p-3 rounded-md border border-cocoa/20 focus:outline-none focus:ring-2 focus:ring-mocha"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-cocoa mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    name="expiry"
                    value={form.expiry}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    maxLength="5"
                    pattern="^(0[1-9]|1[0-2])\/\d{2}$"
                    inputMode="numeric"
                    title="Use MM/YY (for example, 08/27)"
                    className="w-full p-3 rounded-md border border-cocoa/20 focus:outline-none focus:ring-2 focus:ring-mocha"
                    required
                  />
                  {form.expiry && !isValidExpiry(form.expiry) && (
                    <p className="text-xs text-red-600 mt-1">
                      Enter a valid non-expired date in MM/YY.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-cocoa mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    name="cvv"
                    value={form.cvv}
                    onChange={handleChange}
                    placeholder="***"
                    maxLength="3"
                    className="w-full p-3 rounded-md border border-cocoa/20 focus:outline-none focus:ring-2 focus:ring-mocha"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {paymentMethod === "paypal" && (
            <div>
              <label className="block text-sm text-cocoa mb-1">
                PayPal Email
              </label>
              <input
                type="email"
                name="paypalEmail"
                value={form.paypalEmail}
                onChange={handleChange}
                placeholder="paypal@email.com"
                className="w-full p-3 rounded-md border border-cocoa/20 focus:outline-none focus:ring-2 focus:ring-mocha"
                required
              />
              <p className="text-xs text-cocoa/70 mt-2">
                Simulation: this does not connect to real PayPal.
              </p>
            </div>
          )}

          {paymentMethod === "applepay" && (
            <div className="bg-latte rounded-xl p-4">
              <p className="text-sm text-cocoa mb-3">
                Apple Pay simulation requires one-step wallet authorization.
              </p>
              <button
                type="button"
                onClick={() => setAppleAuthorized(true)}
                className={`px-4 py-2 rounded-md text-sm ${
                  appleAuthorized
                    ? "bg-green-600 text-white"
                    : "bg-black text-white"
                }`}
              >
                {appleAuthorized ? "Authorized" : "Authorize Apple Pay"}
              </button>
            </div>
          )}

          {/* PLACE ORDER */}
          <button
            type="submit"
            disabled={!isFormComplete || submitting || hasMissingSizes}
            className={`w-full py-3 rounded-md text-sm tracking-wide transition
              ${
                isFormComplete && !submitting
                  ? "bg-mocha text-latte hover:opacity-90"
                  : "bg-gray-400 text-gray-100 cursor-not-allowed"
              }`}
          >
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>
    </div>
  );
}
