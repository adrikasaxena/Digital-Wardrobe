import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function CartSidebar({ isOpen, onClose }) {
  const cartContext = useCart();
  const navigate = useNavigate();
  if (!cartContext) return null;

  const { cart, removeFromCart, updateQuantity } = cartContext;

  if (!isOpen) return null;
  if (!Array.isArray(cart)) return null;

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="fixed inset-0 bg-black/25 z-40"
        aria-label="Close cart sidebar"
      />

      <aside className="fixed right-0 top-0 h-full w-full max-w-sm bg-beige shadow-xl z-50 p-6 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif text-cocoa">Your Cart</h2>
          <button
            onClick={onClose}
            className="text-cocoa text-sm underline"
          >
            Close
          </button>
        </div>

        {cart.length === 0 ? (
          <p className="text-cocoa">Your cart is empty.</p>
        ) : (
          <div className="space-y-4 overflow-y-auto pr-1">
            {cart.map((item) => {
              const qty = item.quantity || 1;
              const cartLineId =
                item.cartItemId || `${item._id}__${item.selectedSize || "nosize"}`;

              return (
                <div
                  key={cartLineId}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="text-cocoa font-medium">{item.name}</p>
                    {item.selectedSize && (
                      <p className="text-xs text-cocoa/70">Size: {item.selectedSize}</p>
                    )}
                    <p className="text-sm text-cocoa/70">
                      ${item.price} × {qty}
                    </p>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateQuantity(cartLineId, qty - 1)
                        }
                        disabled={qty <= 1}
                        className="px-2 bg-latte rounded disabled:opacity-50"
                      >
                        −
                      </button>

                      <button
                        onClick={() =>
                          updateQuantity(cartLineId, qty + 1)
                        }
                        className="px-2 bg-latte rounded"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(cartLineId)}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-auto pt-5 border-t border-cocoa/20 space-y-3">
          <div className="flex items-center justify-between text-cocoa">
            <span>Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/checkout");
            }}
            disabled={cart.length === 0}
            className="w-full bg-mocha text-latte py-3 rounded-md text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Go to Checkout
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/cart");
            }}
            className="w-full border border-mocha text-mocha py-3 rounded-md text-sm hover:bg-mocha hover:text-latte transition"
          >
            View Full Cart
          </button>
        </div>
      </aside>
    </>
  );
}
