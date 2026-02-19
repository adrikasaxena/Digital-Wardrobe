import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";

export default function SavedOutfits() {
  const navigate = useNavigate();
  const { addToCart } = useCart() || {};
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOutfit, setActiveOutfit] = useState(null);
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const userId = storedUser?._id || storedUser?.id;

    if (!userId) {
      navigate("/login");
      return;
    }

    axios
      .get(`http://localhost:3001/api/saved-outfits/user/${userId}`)
      .then((res) => setOutfits(res.data || []))
      .catch(() => setOutfits([]))
      .finally(() => setLoading(false));
  }, [navigate]);

  const getPieceBySlot = (outfit, slot) =>
    (outfit?.pieces || []).find((piece) => piece.slot === slot);

  const addSavedOutfitToCart = (outfit) => {
    if (!addToCart) return;
    const uniqueItems = (outfit?.pieces || []).filter(
      (piece, index, arr) =>
        arr.findIndex(
          (p) => String(p.itemId) === String(piece.itemId) && p.sourceType === piece.sourceType
        ) === index
    );

    uniqueItems.forEach((piece) => {
      addToCart({
        _id: String(piece.itemId),
        name: piece.name,
        image: piece.image,
        price: Number(piece.price || 0),
        inStock: true,
      });
    });
  };

  const shareOutfit = async (outfit) => {
    if (!outfit?.shareId) {
      setShareStatus("Share link unavailable for this outfit.");
      return;
    }

    const shareUrl = `${window.location.origin}/shared-outfit/${outfit.shareId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: outfit.name || "Shared Outfit",
          text: "Check out this outfit I created!",
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
      setShareStatus("Outfit link shared/copied.");
    } catch {
      setShareStatus("Could not share link. Try again.");
    }
  };

  const editOutfit = (outfit) => {
    localStorage.setItem("editing_saved_outfit", JSON.stringify(outfit));
    navigate("/shop?builder=1&editOutfit=1");
  };

  const deleteOutfit = async (outfitId) => {
    if (!outfitId) return;
    const confirmed = window.confirm("Delete this saved outfit?");
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:3001/api/saved-outfits/${outfitId}`);
      setOutfits((prev) => prev.filter((item) => item._id !== outfitId));
      if (activeOutfit?._id === outfitId) {
        setActiveOutfit(null);
      }
      setShareStatus("Outfit deleted.");
    } catch {
      setShareStatus("Failed to delete outfit.");
    }
  };

  return (
    <div className="min-h-screen bg-latte px-6 md:px-10 lg:px-14 py-12">
      <h1 className="text-4xl font-serif text-cocoa mb-8">Saved Outfits</h1>

      {loading && <p className="text-cocoa">Loading outfits...</p>}

      {!loading && outfits.length === 0 && (
        <div className="bg-beige rounded-2xl p-8 text-cocoa">
          No saved outfits yet. Build one in the shop and save it.
        </div>
      )}

      <div className="space-y-6">
        {outfits.map((outfit) => (
          <article key={outfit._id} className="bg-beige rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-cocoa font-medium">{outfit.name || "Saved Outfit"}</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-cocoa/60">
                  {new Date(outfit.createdAt).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={() => shareOutfit(outfit)}
                  className="rounded-md border border-cocoa/30 text-cocoa px-3 py-1.5 text-sm hover:bg-cocoa/10 transition"
                >
                  Share Link
                </button>
                <button
                  type="button"
                  onClick={() => editOutfit(outfit)}
                  className="rounded-md border border-mocha/40 text-mocha px-3 py-1.5 text-sm hover:bg-mocha hover:text-latte transition"
                >
                  Edit Outfit
                </button>
                <button
                  type="button"
                  onClick={() => addSavedOutfitToCart(outfit)}
                  className="rounded-md border border-mocha/40 text-mocha px-3 py-1.5 text-sm hover:bg-mocha hover:text-latte transition"
                >
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => deleteOutfit(outfit._id)}
                  className="rounded-md border border-red-300 text-red-700 px-3 py-1.5 text-sm hover:bg-red-50 transition"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setActiveOutfit(outfit)}
                  className="rounded-md bg-mocha text-latte px-3 py-1.5 text-sm"
                >
                  Show Outfit
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
              {(outfit.pieces || []).map((piece, index) => (
                <div key={`${outfit._id}-${piece.slot}-${index}`} className="rounded-lg bg-latte p-2">
                  <p className="text-[10px] uppercase tracking-[0.1em] text-cocoa/60 mb-1">
                    {piece.slot}
                  </p>
                  <div className="h-24 rounded-md overflow-hidden bg-beige">
                    {piece.image ? (
                      <img
                        src={`http://localhost:3001/uploads/${piece.image}`}
                        alt={piece.name}
                        className="h-full w-full object-contain"
                      />
                    ) : null}
                  </div>
                  <p className="text-xs text-cocoa mt-1 truncate">{piece.name}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>

      {activeOutfit && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            onClick={() => setActiveOutfit(null)}
            className="absolute inset-0 bg-black/40"
            aria-label="Close outfit preview"
          />

          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 bg-beige rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-serif text-cocoa">
                {activeOutfit.name || "Saved Outfit"}
              </h2>
              <button
                type="button"
                onClick={() => setActiveOutfit(null)}
                className="text-cocoa text-sm underline"
              >
                Close
              </button>
            </div>

            <div className="rounded-2xl bg-latte p-4 border border-cocoa/10">
              {(() => {
                return (
                  <>
              <div className="grid grid-cols-[1.3fr_1fr] gap-3 mb-3">
                <div className="space-y-3">
                  {["top", "bottom", "dress"]
                    .map((slot) => ({ slot, piece: getPieceBySlot(activeOutfit, slot) }))
                    .filter((entry) => Boolean(entry.piece))
                    .map(({ slot, piece }) => {
                      const hClass = slot === "dress" ? "aspect-video" : "h-36";
                      return (
                        <div
                          key={slot}
                          className={`rounded-xl border border-cocoa/20 bg-beige/95 p-2 shadow-sm ${hClass}`}
                        >
                          <p className="text-[10px] uppercase tracking-[0.1em] text-cocoa/70 mb-2">
                            {slot}
                          </p>
                          <div className="h-[calc(100%-1.25rem)] w-full">
                            <img
                              src={`http://localhost:3001/uploads/${piece.image}`}
                              alt={piece.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        </div>
                      );
                    })}

                  {getPieceBySlot(activeOutfit, "shoes") && (
                    <div className="rounded-xl border border-cocoa/20 bg-beige/95 p-2 shadow-sm h-32">
                      <p className="text-[10px] uppercase tracking-[0.1em] text-cocoa/70 mb-2">
                        shoes
                      </p>
                      <div className="h-[calc(100%-1.25rem)] w-full">
                        <img
                          src={`http://localhost:3001/uploads/${getPieceBySlot(activeOutfit, "shoes").image}`}
                          alt={getPieceBySlot(activeOutfit, "shoes").name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {["outerwear", "accessories", "accessories2"]
                    .map((slot) => ({ slot, piece: getPieceBySlot(activeOutfit, slot) }))
                    .filter((entry) => Boolean(entry.piece))
                    .map(({ slot, piece }) => (
                      <div
                        key={slot}
                        className="rounded-xl border border-cocoa/20 bg-beige/95 p-2 shadow-sm h-36"
                      >
                        <p className="text-[10px] uppercase tracking-[0.1em] text-cocoa/70 mb-2">
                          {slot}
                        </p>
                        <div className="h-[calc(100%-1.25rem)] w-full">
                          <img
                            src={`http://localhost:3001/uploads/${piece.image}`}
                            alt={piece.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
                  </>
                );
              })()}

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => shareOutfit(activeOutfit)}
                  className="rounded-md border border-cocoa/30 text-cocoa px-4 py-2 text-sm mr-2 hover:bg-cocoa/10 transition"
                >
                  Share Link
                </button>
                <button
                  type="button"
                  onClick={() => editOutfit(activeOutfit)}
                  className="rounded-md border border-mocha/40 text-mocha px-4 py-2 text-sm mr-2 hover:bg-mocha hover:text-latte transition"
                >
                  Edit Outfit
                </button>
                <button
                  type="button"
                  onClick={() => addSavedOutfitToCart(activeOutfit)}
                  className="rounded-md bg-mocha text-latte px-4 py-2 text-sm"
                >
                  Add Outfit to Cart
                </button>
                <button
                  type="button"
                  onClick={() => deleteOutfit(activeOutfit?._id)}
                  className="rounded-md border border-red-300 text-red-700 px-4 py-2 text-sm ml-2 hover:bg-red-50 transition"
                >
                  Delete Outfit
                </button>
              </div>
              {shareStatus && (
                <p className="text-xs text-cocoa/70 mt-2 text-right">{shareStatus}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
