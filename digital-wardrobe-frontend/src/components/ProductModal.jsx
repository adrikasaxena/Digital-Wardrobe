import { useState } from "react";
import SizeChart from "./SizeChart";

export default function ProductModal({ product, onClose, onAdd }) {
  const [selectedSize, setSelectedSize] = useState(
    Array.isArray(product?.sizes) && product.sizes.length > 0 ? product.sizes[0] : ""
  );
  if (!product) return null;

  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
  const canAdd = product.inStock !== false && (!hasSizes || Boolean(selectedSize));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-beige max-w-lg w-full rounded-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-xl"
        >
          ✕
        </button>

        <img
          src={`http://localhost:3001/uploads/${product.image}`}
          alt={product.name}
          className="w-full h-72 object-contain mb-6"
        />

        <h2 className="text-2xl font-semibold text-cocoa">
          {product.name}
        </h2>

        <p className="text-cocoa mt-2">
          {product.description || "No description available."}
        </p>

        <div className="mt-3">
          <p className="text-sm text-cocoa mb-1">Sizes</p>
          {hasSizes ? (
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full p-2 rounded-md border border-cocoa/20 bg-white focus:outline-none"
            >
              {product.sizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-cocoa/70">N/A</p>
          )}
        </div>
        {hasSizes && (
          <details className="mt-3 rounded-lg border border-cocoa/15 bg-latte/60 p-2">
            <summary className="cursor-pointer text-sm text-cocoa font-medium">
              View size chart
            </summary>
            <div className="mt-2">
              <SizeChart compact />
            </div>
          </details>
        )}

        <p className="mt-1 text-sm text-cocoa">
          Status: {product.inStock !== false ? "In stock" : "Out of stock"}
        </p>

        <p className="text-lg font-medium text-cocoa mt-4">
          ${product.price}
        </p>

        <button
          onClick={() => onAdd(product, selectedSize || null)}
          className="mt-6 bg-mocha text-latte px-6 py-3 rounded-md w-full"
          disabled={!canAdd}
        >
          {product.inStock !== false ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}
