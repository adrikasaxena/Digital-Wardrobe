import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SharedOutfit() {
  const { shareId } = useParams();
  const [outfit, setOutfit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shareId) return;

    axios
      .get(`http://localhost:3001/api/saved-outfits/share/${shareId}`)
      .then((res) => {
        setOutfit(res.data || null);
        setError("");
      })
      .catch(() => {
        setOutfit(null);
        setError("This shared outfit link is invalid or no longer available.");
      })
      .finally(() => setLoading(false));
  }, [shareId]);

  return (
    <div className="min-h-screen bg-latte px-6 md:px-10 lg:px-14 py-12">
      <h1 className="text-4xl font-serif text-cocoa mb-8">Shared Outfit</h1>

      {loading && <p className="text-cocoa">Loading shared outfit...</p>}
      {!loading && error && <p className="text-red-600">{error}</p>}

      {!loading && outfit && (
        <article className="bg-beige rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl text-cocoa font-medium">{outfit.name || "Saved Outfit"}</h2>
            <span className="text-sm text-cocoa/60">
              {new Date(outfit.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
            {(outfit.pieces || []).map((piece, index) => (
              <div key={`${piece.slot}-${index}`} className="rounded-lg bg-latte p-2">
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
      )}
    </div>
  );
}
