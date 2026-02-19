import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist = [], removeFromWishlist } = useWishlist() || {};
  const { addToCart } = useCart() || {};
  const [selectedSizes, setSelectedSizes] = useState({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) navigate("/login");
  }, [navigate]);

  const handleMoveToCart = (item) => {
    if (!addToCart) return;
    const hasSizes = Array.isArray(item.sizes) && item.sizes.length > 0;
    const pickedSize = selectedSizes[item._id] || null;

    if (hasSizes && !pickedSize) {
      setStatus("Please select a size before adding this wishlist item to cart.");
      return;
    }

    addToCart(item, pickedSize);
    setStatus("Item added to cart.");
  };

  return (
    <div className="min-h-screen bg-latte px-8 py-12 md:px-12">
      <h1 className="text-4xl font-serif text-cocoa mb-8">Your Wishlist</h1>

      {status && <p className="text-sm text-cocoa/80 mb-4">{status}</p>}

      {wishlist.length === 0 ? (
        <div className="bg-beige rounded-2xl p-8 text-center text-cocoa">
          <p className="mb-4">No items in wishlist yet.</p>
          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="rounded-md bg-mocha text-latte px-4 py-2 text-sm"
          >
            Browse Shop
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {wishlist.map((item) => (
            <article
              key={item._id}
              className="bg-beige rounded-2xl overflow-hidden shadow-sm flex flex-col"
            >
              <div className="aspect-[4/5] bg-latte flex items-center justify-center overflow-hidden">
                {item.image ? (
                  <img
                    src={`http://localhost:3001/uploads/${item.image}`}
                    alt={item.name}
                    className="h-full w-full object-contain p-6"
                  />
                ) : (
                  <span className="text-cocoa/40">No Image</span>
                )}
              </div>

              <div className="p-5 flex flex-col gap-3 flex-1">
                <p className="text-xs uppercase tracking-[0.15em] text-cocoa/60">
                  {item.category || "Other"}
                </p>
                <h2 className="text-xl text-cocoa font-medium">{item.name}</h2>
                <p className="text-cocoa font-semibold">${item.price}</p>

                {Array.isArray(item.sizes) && item.sizes.length > 0 && (
                  <select
                    value={selectedSizes[item._id] || ""}
                    onChange={(e) =>
                      setSelectedSizes((prev) => ({ ...prev, [item._id]: e.target.value }))
                    }
                    className="rounded-md border border-cocoa/20 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select size</option>
                    {item.sizes.map((size) => (
                      <option key={`${item._id}-${size}`} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                )}

                <div className="mt-auto grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleMoveToCart(item)}
                    className="rounded-xl bg-mocha text-latte px-4 py-2.5 text-sm"
                  >
                    Add to Cart
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromWishlist(item._id)}
                    className="rounded-xl border border-cocoa/30 text-cocoa px-4 py-2.5 text-sm hover:bg-cocoa/10"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
