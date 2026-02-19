import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Cart() {
  const cartContext = useCart();
  const navigate = useNavigate();

  // protect route
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) navigate("/login");
  }, [navigate]);

  // hard safety guard
  if (!cartContext) return null;

  const { cart = [], removeFromCart, updateQuantity, updateItemSize } = cartContext;

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <div className="min-h-screen bg-latte px-12 py-16">
      <h1 className="text-4xl font-serif text-cocoa mb-10">
        Your Shopping Cart
      </h1>

      {cart.length === 0 ? (
        <div className="bg-beige p-10 rounded-2xl text-center">
          <p className="text-cocoa mb-6">Your cart is currently empty.</p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-mocha text-latte px-6 py-3 rounded-md text-sm"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* CART ITEMS */}
          <div className="lg:col-span-2 space-y-6">
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
                  className="bg-beige p-6 rounded-2xl flex justify-between items-center gap-4"
                >
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-md bg-latte overflow-hidden shrink-0">
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

                  <div>
                    <h2 className="text-lg font-semibold text-cocoa">
                      {item.name}
                    </h2>
                    {item.selectedSize && (
                      <p className="text-sm text-cocoa/70 mt-1">Size: {item.selectedSize}</p>
                    )}
                    {sizeOptions.length > 0 && (
                      <div className="mt-2">
                        <label className="block text-[11px] text-cocoa/70 mb-1">
                          Adjust size
                        </label>
                        <select
                          value={item.selectedSize || ""}
                          onChange={(e) => {
                            if (!e.target.value) return;
                            updateItemSize(
                              item.cartItemId || `${item._id}__${item.selectedSize || "nosize"}`,
                              e.target.value
                            );
                          }}
                          className={`rounded-md bg-white px-2 py-1 text-xs text-cocoa ${
                            item.selectedSize
                              ? "border border-cocoa/20"
                              : "border border-red-300"
                          }`}
                        >
                          <option value="">Select size</option>
                          {sizeOptions.map((size) => (
                            <option key={`${item._id}-cart-${size}`} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                        {!item.selectedSize && (
                          <p className="text-[11px] text-red-600 mt-1">
                            Please select a size.
                          </p>
                        )}
                      </div>
                    )}

                    {/* quantity controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.cartItemId || `${item._id}__${item.selectedSize || "nosize"}`,
                            item.quantity - 1
                          )
                        }
                        className="px-2 py-1 bg-latte rounded"
                      >
                        −
                      </button>

                      <span className="text-cocoa">{item.quantity}</span>

                      <button
                        onClick={() =>
                          updateQuantity(
                            item.cartItemId || `${item._id}__${item.selectedSize || "nosize"}`,
                            item.quantity + 1
                          )
                        }
                        className="px-2 py-1 bg-latte rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-mocha font-medium">
                    ${Number(item.price || 0) * (item.quantity || 1)}
                  </p>

                  <button
                    onClick={() =>
                      removeFromCart(item.cartItemId || `${item._id}__${item.selectedSize || "nosize"}`)
                    }
                    className="text-sm text-red-600 mt-2 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
              );
            })}
          </div>

          {/* ORDER SUMMARY */}
          <div className="bg-beige p-8 rounded-2xl h-fit">
            <h2 className="text-xl font-semibold text-cocoa mb-6">
              Order Summary
            </h2>

            <div className="flex justify-between text-cocoa mb-4">
              <span>Total Items</span>
              <span>
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            </div>

            <div className="flex justify-between text-cocoa font-medium text-lg mb-8">
              <span>Total</span>
              <span>${total}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-mocha text-latte py-3 rounded-md text-sm"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
