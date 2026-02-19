import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart = [], updateItemSize, removeFromCart } = useCart() || {};

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    payment: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isFormComplete = Object.values(form).every(
    (value) => value.trim() !== ""
  );
  const totalItems = cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );
  const missingSizedItems = cart.filter(
    (item) =>
      Array.isArray(item.sizes) &&
      item.sizes.length > 0 &&
      !item.selectedSize
  );
  const hasMissingSizes = missingSizedItems.length > 0;

  const continueToPayment = (e) => {
    e.preventDefault();
    if (!isFormComplete || cart.length === 0 || hasMissingSizes) return;

    navigate("/payment");
  };

  return (
    <div className="min-h-screen bg-latte px-12 py-16">
      <h1 className="text-4xl font-serif text-cocoa mb-12">
        Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-10 items-start">
        <div className="bg-beige p-6 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-serif text-cocoa mb-4">Items in this checkout</h2>

          {cart.length === 0 ? (
            <div>
              <p className="text-cocoa mb-4">Your cart is empty.</p>
              <button
                type="button"
                onClick={() => navigate("/shop")}
                className="rounded-md bg-mocha text-latte px-4 py-2.5 text-sm"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {hasMissingSizes && (
                <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2">
                  <p className="text-sm text-red-700">
                    Select a size for all size-based items before continuing to payment.
                  </p>
                </div>
              )}
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {cart.map((item) => {
                  const availableSizes = Array.isArray(item.sizes)
                    ? item.sizes
                    : typeof item.sizes === "string"
                      ? item.sizes
                          .split(",")
                          .map((size) => size.trim())
                          .filter(Boolean)
                      : [];
                  const itemText = `${item?.name || ""} ${item?.category || ""}`.toLowerCase();
                  const looksLikeShoes = /(shoe|heel|boot|sneaker|ugg|loafer|sand(al)?)/.test(
                    itemText
                  );
                  const looksLikeSizeBased = /(top|blouse|shirt|tee|tank|corset|sweater|bottom|pant|jean|trouser|skirt|dress|shoe|heel|boot|sneaker|ugg|loafer|sand(al)?)/.test(
                    itemText
                  );
                  const fallbackSizes = looksLikeShoes
                    ? ["6", "7", "8", "9", "10", "11", "12"]
                    : ["XS", "S", "M", "L", "XL", "XXL"];
                  const sizeOptions =
                    availableSizes.length > 0
                      ? availableSizes
                      : looksLikeSizeBased
                        ? fallbackSizes
                        : [];
                  if (item.selectedSize && !sizeOptions.includes(item.selectedSize)) {
                    sizeOptions.unshift(item.selectedSize);
                  }

                  return (
                    <div
                      key={item.cartItemId || `${item._id}__${item.selectedSize || "nosize"}`}
                      className="flex items-center gap-3 border-b border-cocoa/15 pb-3"
                    >
                    <div className="h-16 w-16 rounded-md bg-latte overflow-hidden shrink-0">
                      {item.image ? (
                        <img
                          src={`http://localhost:3001/uploads/${item.image}`}
                          alt={item.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-cocoa/45">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-cocoa font-medium leading-tight">{item.name}</p>
                      {sizeOptions.length > 0 && (
                        <select
                          value={item.selectedSize || ""}
                          onChange={(e) => {
                            if (!e.target.value || !updateItemSize) return;
                            updateItemSize(
                              item.cartItemId || `${item._id}__${item.selectedSize || "nosize"}`,
                              e.target.value
                            );
                          }}
                          className={`mt-1 rounded-md bg-white px-2 py-1 text-xs text-cocoa ${
                            item.selectedSize
                              ? "border border-cocoa/20"
                              : "border border-red-300"
                          }`}
                        >
                          <option value="">Select size</option>
                          {sizeOptions.map((size) => (
                            <option key={`${item._id}-checkout-${size}`} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      )}
                      <p className="text-sm text-cocoa/70">
                        ${Number(item.price || 0)} x {Number(item.quantity || 1)}
                      </p>
                    </div>
                    <p className="text-sm text-cocoa font-medium">
                      $
                      {(
                        Number(item.price || 0) * Number(item.quantity || 1)
                      ).toFixed(2)}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart &&
                        removeFromCart(
                          item.cartItemId || `${item._id}__${item.selectedSize || "nosize"}`
                        )
                      }
                      className="mt-1 text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-cocoa/20 space-y-1">
                <div className="flex justify-between text-cocoa">
                  <span>Total Items</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex justify-between text-cocoa font-semibold">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <form
          onSubmit={continueToPayment}
          className="bg-beige max-w-2xl p-8 rounded-2xl shadow-sm space-y-6"
        >
          {/* FULL NAME */}
          <div>
            <label className="block text-sm text-cocoa mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-cocoa/20 focus:outline-none focus:ring-2 focus:ring-mocha"
              placeholder="Your full name"
              required
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="block text-sm text-cocoa mb-1">
              Street Address
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-cocoa/20 focus:outline-none focus:ring-2 focus:ring-mocha"
              placeholder="123 Main Street"
              required
            />
          </div>

          {/* CITY + STATE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-cocoa mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-cocoa/20 focus:outline-none focus:ring-2 focus:ring-mocha"
                placeholder="City"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-cocoa mb-1">
                State
              </label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-cocoa/20 bg-white focus:outline-none focus:ring-2 focus:ring-mocha"
                required
              >
                <option value="">Select state</option>
                <option value="AN">Andaman and Nicobar Islands</option>
                <option value="AP">Andhra Pradesh</option>
                <option value="AR">Arunachal Pradesh</option>
                <option value="AS">Assam</option>
                <option value="BR">Bihar</option>
                <option value="CH">Chandigarh</option>
                <option value="CT">Chhattisgarh</option>
                <option value="DN">Dadra and Nagar Haveli and Daman and Diu</option>
                <option value="DL">Delhi</option>
                <option value="GA">Goa</option>
                <option value="GJ">Gujarat</option>
                <option value="HR">Haryana</option>
                <option value="HP">Himachal Pradesh</option>
                <option value="JK">Jammu and Kashmir</option>
                <option value="JH">Jharkhand</option>
                <option value="KA">Karnataka</option>
                <option value="KL">Kerala</option>
                <option value="LA">Ladakh</option>
                <option value="LD">Lakshadweep</option>
                <option value="MP">Madhya Pradesh</option>
                <option value="MH">Maharashtra</option>
                <option value="MN">Manipur</option>
                <option value="ML">Meghalaya</option>
                <option value="MZ">Mizoram</option>
                <option value="NL">Nagaland</option>
                <option value="OD">Odisha</option>
                <option value="PY">Puducherry</option>
                <option value="PB">Punjab</option>
                <option value="RJ">Rajasthan</option>
                <option value="SK">Sikkim</option>
                <option value="TN">Tamil Nadu</option>
                <option value="TG">Telangana</option>
                <option value="TR">Tripura</option>
                <option value="UP">Uttar Pradesh</option>
                <option value="UT">Uttarakhand</option>
                <option value="WB">West Bengal</option>
              </select>
            </div>
          </div>

          {/* ZIP */}
          <div>
            <label className="block text-sm text-cocoa mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              name="zip"
              value={form.zip}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-cocoa/20 focus:outline-none focus:ring-2 focus:ring-mocha"
              placeholder="ZIP Code"
              required
            />
          </div>

          {/* PAYMENT METHOD */}
          <div>
            <label className="block text-sm text-cocoa mb-1">
              Payment Method
            </label>
            <select
              name="payment"
              value={form.payment}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-cocoa/20 bg-white focus:outline-none focus:ring-2 focus:ring-mocha"
              required
            >
              <option value="">Select payment method</option>
              <option value="card">Credit / Debit Card</option>
              <option value="paypal">PayPal</option>
              <option value="applepay">Apple Pay</option>
            </select>
          </div>

          {/* CONTINUE */}
          <button
            type="submit"
            disabled={!isFormComplete || cart.length === 0 || hasMissingSizes}
            className={`w-full py-3 rounded-md text-sm tracking-wide transition
              ${
                isFormComplete && cart.length > 0
                  ? "bg-mocha text-latte hover:opacity-90"
                  : "bg-gray-400 text-gray-100 cursor-not-allowed"
              }`}
          >
            Continue to Payment
          </button>
        </form>
      </div>
    </div>
  );
}
