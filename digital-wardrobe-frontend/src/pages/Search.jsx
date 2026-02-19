import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Search() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/products")
      .then((res) => {
        setProducts(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load items.");
        setLoading(false);
      });
  }, []);

  const filteredProducts = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) return products;

    const keywords = trimmedQuery.split(/\s+/).filter(Boolean);
    return products.filter((product) => {
      const name = String(product.name || "").toLowerCase();
      return keywords.every((keyword) => name.includes(keyword));
    });
  }, [products, query]);

  const suggestedProducts = useMemo(() => {
    if (filteredProducts.length === 0) return [];

    const baseCategory = filteredProducts[0]?.category || "Other";
    const filteredIds = new Set(filteredProducts.map((item) => String(item._id)));

    return products
      .filter(
        (item) =>
          (item.category || "Other") === baseCategory &&
          !filteredIds.has(String(item._id))
      )
      .slice(0, 6);
  }, [products, filteredProducts]);

  return (
    <div className="min-h-screen bg-latte px-8 py-12 md:px-12">
      <h1 className="text-4xl font-serif text-cocoa mb-3">Search Items</h1>
      <p className="text-cocoa/75 mb-6">
        Search by item name keywords.
      </p>

      <div className="bg-beige rounded-2xl p-4 md:p-5 mb-8 shadow-sm">
        <label className="block text-sm text-cocoa mb-2" htmlFor="item-search">
          Item Name
        </label>
        <input
          id="item-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try: black dress, denim jacket, white sneakers"
          className="w-full rounded-md border border-cocoa/20 bg-white px-4 py-3 text-cocoa focus:outline-none focus:ring-2 focus:ring-mocha"
        />
      </div>

      {loading && <p className="text-cocoa">Loading items...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <p className="text-cocoa mb-5">
            {filteredProducts.length} item{filteredProducts.length === 1 ? "" : "s"} found
          </p>

          {filteredProducts.length === 0 ? (
            <div className="bg-beige rounded-2xl p-8 text-center text-cocoa">
              <p>No matching items found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <article
                    key={product._id}
                    className="bg-beige rounded-2xl overflow-hidden shadow-sm flex flex-col"
                  >
                    <div className="aspect-[4/5] bg-latte flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img
                          src={`http://localhost:3001/uploads/${product.image}`}
                          alt={product.name}
                          className="h-full w-full object-contain p-6"
                        />
                      ) : (
                        <span className="text-cocoa/40">No Image</span>
                      )}
                    </div>

                    <div className="p-5 flex flex-col gap-2">
                      <p className="text-xs uppercase tracking-[0.15em] text-cocoa/60">
                        {product.category || "Other"}
                      </p>
                      <h2 className="text-xl text-cocoa font-medium">{product.name}</h2>
                      <p className="text-cocoa font-semibold">${product.price}</p>
                      <button
                        type="button"
                        onClick={() => navigate("/shop")}
                        className="mt-2 rounded-xl bg-mocha text-latte px-4 py-2.5 text-sm"
                      >
                        View in Shop
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {suggestedProducts.length > 0 && (
                <section className="mt-10">
                  <h2 className="text-2xl font-serif text-cocoa mb-2">
                    Suggested from Same Category
                  </h2>
                  <p className="text-cocoa/70 text-sm mb-4">
                    Other outfits/items from {filteredProducts[0]?.category || "this category"}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {suggestedProducts.map((product) => (
                      <article
                        key={`suggested-${product._id}`}
                        className="bg-beige rounded-2xl overflow-hidden shadow-sm flex flex-col"
                      >
                        <div className="aspect-[4/5] bg-latte flex items-center justify-center overflow-hidden">
                          {product.image ? (
                            <img
                              src={`http://localhost:3001/uploads/${product.image}`}
                              alt={product.name}
                              className="h-full w-full object-contain p-6"
                            />
                          ) : (
                            <span className="text-cocoa/40">No Image</span>
                          )}
                        </div>

                        <div className="p-5 flex flex-col gap-2">
                          <p className="text-xs uppercase tracking-[0.15em] text-cocoa/60">
                            {product.category || "Other"}
                          </p>
                          <h3 className="text-lg text-cocoa font-medium">{product.name}</h3>
                          <p className="text-cocoa font-semibold">${product.price}</p>
                          <button
                            type="button"
                            onClick={() => navigate("/shop")}
                            className="mt-2 rounded-xl border border-cocoa/20 text-cocoa px-4 py-2.5 text-sm hover:bg-cocoa/10"
                          >
                            View in Shop
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
