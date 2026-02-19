import { useEffect, useState } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useLocation, useNavigate } from "react-router-dom";
import CartSidebar from "../components/CartSideBar";
import ProductModal from "../components/ProductModal";
import SizeChart from "../components/SizeChart";
import { useWishlist } from "../context/WishlistContext";

export default function Shop() {
  const getInitialBuilderState = () => {
    if (typeof window === "undefined") {
      return {
        showBuilder: false,
        slots: {
          top: null,
          outerwear: null,
          bottom: null,
          dress: null,
          accessories: null,
          accessories2: null,
          shoes: null,
        },
        editOutfitId: null,
        editOutfitName: "",
      };
    }

    const params = new URLSearchParams(window.location.search);
    const shouldOpenBuilder =
      params.get("builder") === "1" || params.get("editOutfit") === "1";

    const emptySlots = {
      top: null,
      outerwear: null,
      bottom: null,
      dress: null,
      accessories: null,
      accessories2: null,
      shoes: null,
    };

    if (params.get("editOutfit") !== "1") {
      return {
        showBuilder: shouldOpenBuilder,
        slots: emptySlots,
        editOutfitId: null,
        editOutfitName: "",
      };
    }

    const raw = localStorage.getItem("editing_saved_outfit");
    if (!raw) {
      return {
        showBuilder: true,
        slots: emptySlots,
        editOutfitId: null,
        editOutfitName: "",
      };
    }

    try {
      const outfit = JSON.parse(raw);
      const nextSlots = { ...emptySlots };
      (outfit?.pieces || []).forEach((piece) => {
        if (!piece?.slot || !(piece.slot in nextSlots)) return;
        nextSlots[piece.slot] = {
          _id: piece.itemId || piece._id || `${piece.slot}-${piece.name}`,
          name: piece.name,
          image: piece.image,
          price: Number(piece.price || 0),
          sourceType: piece.sourceType || "product",
          inStock: true,
        };
      });

      localStorage.removeItem("editing_saved_outfit");
      return {
        showBuilder: true,
        slots: nextSlots,
        editOutfitId: outfit?._id || null,
        editOutfitName: outfit?.name || "",
      };
    } catch {
      localStorage.removeItem("editing_saved_outfit");
      return {
        showBuilder: true,
        slots: emptySlots,
        editOutfitId: null,
        editOutfitName: "",
      };
    }
  };

  const [initialBuilderState] = useState(() => getInitialBuilderState());
  const [products, setProducts] = useState([]);
  const [userItems, setUserItems] = useState([]);
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedColor, setSelectedColor] = useState("all");
  const [showOutfitBuilder, setShowOutfitBuilder] = useState(
    initialBuilderState.showBuilder
  );
  const [hasTriedOutfitBuilder, setHasTriedOutfitBuilder] = useState(
    initialBuilderState.showBuilder
  );
  const [showBuilderPrompt, setShowBuilderPrompt] = useState(false);
  const [uploadingItem, setUploadingItem] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadInputKey, setUploadInputKey] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState({});
  const [itemUploadForm, setItemUploadForm] = useState({
    name: "",
    category: "Personal",
    imageFile: null,
  });
  const [saveOutfitName, setSaveOutfitName] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [editingOutfitId, setEditingOutfitId] = useState(
    initialBuilderState.editOutfitId
  );
  const [outfitSlots, setOutfitSlots] = useState(initialBuilderState.slots);
  const [demoRotationIndex, setDemoRotationIndex] = useState(0);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const currentUserId = currentUser?._id || currentUser?.id;

  useEffect(() => {
    if (initialBuilderState.editOutfitName) {
      setSaveOutfitName(initialBuilderState.editOutfitName);
    }
  }, [initialBuilderState.editOutfitName]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromQuery = params.get("category");
    if (!categoryFromQuery) return;
    setActiveCategory(categoryFromQuery);
  }, [location.search]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/api/products")
      .then((res) => {
        setProducts(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load products.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    axios
      .get(`http://localhost:3001/api/wardrobe/items/user/${currentUserId}`)
      .then((res) => setUserItems(res.data || []))
      .catch(() => setUserItems([]));
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;

    axios
      .get(`http://localhost:3001/api/saved-outfits/user/${currentUserId}`)
      .then((res) => setSavedOutfits(res.data || []))
      .catch(() => setSavedOutfits([]));
  }, [currentUserId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setDemoRotationIndex((prev) => prev + 1);
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (hasTriedOutfitBuilder) {
      setShowBuilderPrompt(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setShowBuilderPrompt(true);
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [hasTriedOutfitBuilder]);

  const handleAddToCart = (item, explicitSize = null) => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
      return;
    }

    const hasSizes = Array.isArray(item.sizes) && item.sizes.length > 0;
    const chosenSize =
      explicitSize ||
      selectedSizes[item._id] ||
      (Array.isArray(item.sizes) && item.sizes.length > 0 ? item.sizes[0] : null);
    if (hasSizes && !chosenSize) {
      setSaveStatus("Please select a size before adding this item to cart.");
      return;
    }

    addToCart(item, chosenSize);
    setShowCart(false);
    navigate("/cart");
  };

  const handleToggleWishlist = (item) => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
      return;
    }
    if (!toggleWishlist) return;
    toggleWishlist(item);
  };

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category || "Other")),
    "User Uploads",
  ];

  const colorKeywords = [
    "black",
    "white",
    "red",
    "blue",
    "green",
    "yellow",
    "brown",
    "beige",
    "cream",
    "pink",
    "purple",
    "orange",
    "grey",
    "gray",
    "maroon",
    "leopard",
  ];

  const detectItemColor = (item) => {
    const haystack = `${item?.name || ""} ${item?.category || ""}`.toLowerCase();
    const detected = colorKeywords.find((color) => haystack.includes(color));
    if (detected === "gray") return "grey";
    return detected || "other";
  };

  const availableColors = Array.from(
    new Set(
      [...products, ...userItems]
        .map((item) => detectItemColor(item))
        .filter((color) => color !== "other")
    )
  ).sort((a, b) => a.localeCompare(b));

  const visibleItems =
    activeCategory === "User Uploads"
      ? userItems
          .map((item) => ({ ...item, sourceType: "userItem" }))
          .filter((item) =>
            selectedColor === "all" ? true : detectItemColor(item) === selectedColor
          )
      : products
          .filter((product) =>
            activeCategory === "All"
              ? true
              : (product.category || "Other") === activeCategory
          )
          .filter((product) =>
            selectedColor === "all" ? true : detectItemColor(product) === selectedColor
          )
          .filter((product) => {
            const price = Number(product.price || 0);
            const min = priceMin === "" ? null : Number(priceMin);
            const max = priceMax === "" ? null : Number(priceMax);

            if (Number.isFinite(min) && price < min) return false;
            if (Number.isFinite(max) && price > max) return false;
            return true;
          })
          .map((product) => ({ ...product, sourceType: "product" }))
          .sort((a, b) => {
            if (sortBy === "price-low") return Number(a.price || 0) - Number(b.price || 0);
            if (sortBy === "price-high") return Number(b.price || 0) - Number(a.price || 0);
            if (sortBy === "name")
              return (a.name || "").localeCompare(b.name || "");
            return 0;
          });

  const slotConfig = [
    {
      key: "top",
      label: "Top",
      hint: "Drop a top",
    },
    {
      key: "outerwear",
      label: "Outerwear",
      hint: "Drop a jacket or coat",
    },
    {
      key: "bottom",
      label: "Bottom",
      hint: "Drop pants or skirt",
    },
    {
      key: "dress",
      label: "Dress",
      hint: "Drop a dress",
    },
    {
      key: "accessories",
      label: "Accessory 1",
      hint: "Drop bag, glasses, jewelry",
    },
    {
      key: "accessories2",
      label: "Accessory 2",
      hint: "Drop another accessory",
    },
    {
      key: "shoes",
      label: "Shoes",
      hint: "Drop footwear",
    },
  ];

  const getProductImageUrl = (product) =>
    `http://localhost:3001/uploads/${product.image}`;

  const handleDragStart = (event, item, sourceType = "product") => {
    const payload = JSON.stringify({ id: String(item._id), sourceType });
    event.dataTransfer.setData("text/plain", payload);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDropToSlot = (event, slotKey) => {
    event.preventDefault();
    setHasTriedOutfitBuilder(true);
    setShowBuilderPrompt(false);
    const payload = event.dataTransfer.getData("text/plain");
    if (!payload) return;

    let parsed = null;
    try {
      parsed = JSON.parse(payload);
    } catch {
      parsed = { id: payload, sourceType: "product" };
    }

    const sourceType = parsed?.sourceType === "userItem" ? "userItem" : "product";
    const sourceList = sourceType === "userItem" ? userItems : products;
    const pickedItem = sourceList.find((item) => String(item._id) === String(parsed?.id));
    if (!pickedItem) return;

    setOutfitSlots((prev) => ({
      ...prev,
      [slotKey]: { ...pickedItem, sourceType },
    }));
  };

  const clearOutfit = () => {
    setOutfitSlots({
      top: null,
      outerwear: null,
      bottom: null,
      dress: null,
      accessories: null,
      accessories2: null,
      shoes: null,
    });
  };
  const hasDress = Boolean(outfitSlots.dress);
  const hasTopAndBottom = Boolean(outfitSlots.top) && Boolean(outfitSlots.bottom);
  const selectedOutfitItems = Object.values(outfitSlots)
    .filter(Boolean)
    .filter(
      (item, index, arr) =>
        arr.findIndex(
          (p) => String(p._id) === String(item._id) && p.sourceType === item.sourceType
        ) === index
    );
  const productGridClass =
    showOutfitBuilder && showCart
      ? "grid-cols-1"
      : showOutfitBuilder || showCart
        ? "grid-cols-1 md:grid-cols-2"
        : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
  const demoTopRotation = [
    "http://localhost:3001/uploads/redBlouseTop.png",
    "http://localhost:3001/uploads/blackCorset.png",
    "http://localhost:3001/uploads/leopardPrint.png",
    "http://localhost:3001/uploads/yellowBrasil.png",
  ];
  const demoBottomRotation = [
    "http://localhost:3001/uploads/whitePants.png",
    "http://localhost:3001/uploads/blueJeans.png",
    "http://localhost:3001/uploads/leatherPantsBlack.png",
    "http://localhost:3001/uploads/brownPants.png",
  ];
  const demoFootwearRotation = [
    "http://localhost:3001/uploads/cLMaroon.png",
    "http://localhost:3001/uploads/yslHells.png",
    "http://localhost:3001/uploads/cLLeopard.png",
    "http://localhost:3001/uploads/blackUggs.png",
  ];
  const demoImageSet = [
    demoTopRotation[demoRotationIndex % demoTopRotation.length],
    demoBottomRotation[demoRotationIndex % demoBottomRotation.length],
    demoFootwearRotation[demoRotationIndex % demoFootwearRotation.length],
  ];

  const addOutfitToCart = () => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
      return;
    }

    selectedOutfitItems.forEach((item) => addToCart(item));
    setShowCart(false);
    navigate("/cart");
  };

  const classifyOutfitSlot = (item) => {
    const haystack = `${item?.category || ""} ${item?.name || ""}`.toLowerCase();

    if (/(dress|gown|jumpsuit)/.test(haystack)) return "dress";
    if (/(shoe|heel|sneaker|boot|ugg|loafer|sand(al)?)/.test(haystack)) return "shoes";
    if (/(jacket|coat|blazer|cardigan|hoodie|outerwear)/.test(haystack)) return "outerwear";
    if (/(pant|trouser|jean|skirt|short|bottom)/.test(haystack)) return "bottom";
    if (/(top|blouse|shirt|tee|t-shirt|tank|corset|sweater)/.test(haystack)) return "top";
    if (/(bag|belt|scarf|hat|cap|glass|watch|jewel|accessor)/.test(haystack))
      return "accessories";

    return null;
  };

  const recommendOutfit = () => {
    const productCandidates = products
      .filter((item) => Boolean(item?.image) && item?.inStock !== false)
      .map((item) => ({ ...item, sourceType: "product" }));
    const userCandidates = userItems
      .filter((item) => Boolean(item?.image))
      .map((item) => ({ ...item, sourceType: "userItem", inStock: true }));
    const candidates = [...productCandidates, ...userCandidates];

    if (candidates.length === 0) {
      setSaveStatus("No items available yet for recommendation.");
      return;
    }

    const pools = {
      top: [],
      bottom: [],
      dress: [],
      shoes: [],
      outerwear: [],
      accessories: [],
    };

    candidates.forEach((item) => {
      const slot = classifyOutfitSlot(item);
      if (slot && pools[slot]) pools[slot].push(item);
    });

    const nextSlots = {
      top: null,
      outerwear: null,
      bottom: null,
      dress: null,
      accessories: null,
      accessories2: null,
      shoes: null,
    };
    const usedIds = new Set();
    const pickUnique = (list) => {
      const available = list.filter(
        (item) => !usedIds.has(`${item.sourceType}:${item._id}`)
      );
      if (!available.length) return null;
      const picked = available[Math.floor(Math.random() * available.length)];
      usedIds.add(`${picked.sourceType}:${picked._id}`);
      return picked;
    };

    const canUseTopBottom = pools.top.length > 0 && pools.bottom.length > 0;
    if (canUseTopBottom) {
      nextSlots.top = pickUnique(pools.top);
      nextSlots.bottom = pickUnique(pools.bottom);
    } else if (pools.dress.length > 0) {
      nextSlots.dress = pickUnique(pools.dress);
    } else {
      setSaveStatus("Need at least top+bottom or a dress to recommend an outfit.");
      return;
    }

    if (pools.shoes.length > 0) nextSlots.shoes = pickUnique(pools.shoes);
    if (pools.outerwear.length > 0 && Math.random() < 0.55) {
      nextSlots.outerwear = pickUnique(pools.outerwear);
    }
    if (pools.accessories.length > 0) {
      nextSlots.accessories = pickUnique(pools.accessories);
    }
    if (pools.accessories.length > 1 && Math.random() < 0.65) {
      nextSlots.accessories2 = pickUnique(pools.accessories);
    }

    setOutfitSlots(nextSlots);
    setShowOutfitBuilder(true);
    setHasTriedOutfitBuilder(true);
    setShowBuilderPrompt(false);
    setSaveStatus("Recommended outfit is ready. Tweak it or save it.");
  };

  const handleToggleBuilder = () => {
    setShowOutfitBuilder((prev) => {
      const next = !prev;
      if (next) {
        setHasTriedOutfitBuilder(true);
        setShowBuilderPrompt(false);
      }
      return next;
    });
  };

  const uploadPersonalItem = async (event) => {
    event.preventDefault();
    setUploadStatus("");

    if (!currentUserId) {
      navigate("/login");
      return;
    }

    if (!itemUploadForm.name.trim()) {
      setUploadStatus("Please enter an item name.");
      return;
    }

    if (!itemUploadForm.imageFile) {
      setUploadStatus("Please choose an image to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("user", currentUserId);
    formData.append("name", itemUploadForm.name.trim());
    formData.append("category", itemUploadForm.category || "Personal");
    formData.append("image", itemUploadForm.imageFile);

    try {
      setUploadingItem(true);
      const res = await axios.post("http://localhost:3001/api/wardrobe/items", formData);
      setUserItems((prev) => [res.data, ...prev]);
      setItemUploadForm({ name: "", category: "Personal", imageFile: null });
      setUploadInputKey((prev) => prev + 1);
      setUploadStatus("Item uploaded successfully.");
      setActiveCategory("User Uploads");
    } catch {
      setUploadStatus("Upload failed. Check backend is running and try again.");
    } finally {
      setUploadingItem(false);
    }
  };

  const buildOutfitPiecesPayload = () =>
    Object.entries(outfitSlots)
      .filter(([, value]) => Boolean(value))
      .map(([slot, value]) => ({
        slot,
        sourceType: value.sourceType || "product",
        itemId: value._id,
        name: value.name,
        image: value.image,
        price: Number(value.price || 0),
      }));

  const saveCurrentOutfit = async (mode = "new") => {
    if (!currentUserId) {
      navigate("/login");
      return;
    }

    if (selectedOutfitItems.length === 0) return;

    const pieces = buildOutfitPiecesPayload();

    try {
      setSaveStatus("");
      if (mode === "update" && editingOutfitId) {
        const res = await axios.put(
          `http://localhost:3001/api/saved-outfits/${editingOutfitId}`,
          {
            name: saveOutfitName.trim() || "Saved Outfit",
            pieces,
          }
        );
        setSavedOutfits((prev) =>
          prev.map((item) => (item._id === editingOutfitId ? res.data : item))
        );
        setSaveStatus("Outfit updated.");
      } else {
        const res = await axios.post("http://localhost:3001/api/saved-outfits", {
          user: currentUserId,
          name: saveOutfitName.trim() || "Saved Outfit",
          pieces,
        });
        setSavedOutfits((prev) => [res.data, ...prev]);
        setSaveStatus("Outfit saved as a new outfit.");
        if (!editingOutfitId) {
          setEditingOutfitId(res.data?._id || null);
        }
      }
      setSaveOutfitName("");
    } catch {
      setSaveStatus("Failed to save outfit changes.");
    }
  };

  return (
    <>
      <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />

      <ProductModal
        key={selectedProduct?._id || "no-product"}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAdd={handleAddToCart}
      />

      <div
        className={`bg-latte min-h-screen px-6 py-12 md:px-10 lg:px-14 transition-all duration-300 ${
          showCart ? "lg:pr-[26rem]" : ""
        }`}
      >
        <section className="rounded-3xl bg-beige p-8 md:p-10 shadow-sm mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-cocoa/60 mb-3">
            New season
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-cocoa mb-4">
            Shop the Collection
          </h1>
          <p className="text-cocoa/80 max-w-2xl">
            Discover statement staples and everyday essentials, then filter by
            category to build your perfect wardrobe.
          </p>
        </section>

        {loading && <p className="text-center text-cocoa">Loading products...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            <aside className="h-fit bg-beige rounded-2xl p-5 shadow-sm">
              <p className="text-sm uppercase tracking-[0.18em] text-cocoa/60 mb-4">
                Categories
              </p>
              <div className="space-y-2">
                {categories.map((category) => {
                  const active = activeCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveCategory(category)}
                      className={`w-full text-left rounded-xl px-4 py-2.5 transition ${
                        active
                          ? "bg-mocha text-latte"
                          : "bg-latte text-cocoa hover:bg-cocoa/10"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-cocoa/15 space-y-3">
                <p className="text-sm uppercase tracking-[0.14em] text-cocoa/60">
                  Filters
                </p>
                <div>
                  <label className="block text-xs text-cocoa/75 mb-1">Color</label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full rounded-md border border-cocoa/20 bg-white px-3 py-2 text-sm text-cocoa"
                  >
                    <option value="all">All colors</option>
                    {availableColors.map((color) => (
                      <option key={color} value={color}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-cocoa/75 mb-1">Price Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      placeholder="Min"
                      disabled={activeCategory === "User Uploads"}
                      className="rounded-md border border-cocoa/20 bg-white px-2 py-2 text-sm text-cocoa disabled:bg-gray-100"
                    />
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      placeholder="Max"
                      disabled={activeCategory === "User Uploads"}
                      className="rounded-md border border-cocoa/20 bg-white px-2 py-2 text-sm text-cocoa disabled:bg-gray-100"
                    />
                  </div>
                  {activeCategory === "User Uploads" && (
                    <p className="mt-1 text-[11px] text-cocoa/60">
                      Price filter applies to store products.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedColor("all");
                    setPriceMin("");
                    setPriceMax("");
                  }}
                  className="w-full rounded-md border border-cocoa/25 px-3 py-2 text-xs text-cocoa hover:bg-cocoa/10"
                >
                  Clear Filters
                </button>
              </div>
            </aside>

            <main>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
                <p className="text-cocoa">
                  Showing {visibleItems.length} items
                </p>
                <div className="flex flex-wrap gap-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="rounded-xl bg-beige border border-cocoa/20 px-4 py-2.5 text-cocoa focus:outline-none"
                  >
                    <option value="featured">Sort: Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A-Z</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleToggleBuilder}
                    className="rounded-xl bg-mocha text-latte px-4 py-2.5 text-sm"
                  >
                    {showOutfitBuilder ? "Hide Builder" : "Open Builder"}
                  </button>
                  <a
                    href="#size-chart"
                    className="rounded-xl border border-cocoa/20 bg-beige px-4 py-2.5 text-sm text-cocoa hover:bg-cocoa/10"
                  >
                    View Size Chart
                  </a>
                </div>
              </div>

              <div
                className={`grid gap-6 ${
                  showOutfitBuilder ? "xl:grid-cols-[minmax(0,1fr)_430px]" : ""
                }`}
              >
                <div>
                  {activeCategory === "User Uploads" && (
                    <section className="bg-beige rounded-2xl p-4 mb-6 shadow-sm">
                      <h3 className="text-lg text-cocoa font-medium mb-2">
                        Upload Your Outfit Piece
                      </h3>
                      <p className="text-sm text-cocoa/75 mb-3">
                        Add your own clothing item image here. It will be saved under your User Uploads.
                      </p>
                      <form onSubmit={uploadPersonalItem} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Item name"
                          value={itemUploadForm.name}
                          onChange={(e) =>
                            setItemUploadForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="rounded-md border border-cocoa/20 px-3 py-2 text-sm"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Category (optional)"
                          value={itemUploadForm.category}
                          onChange={(e) =>
                            setItemUploadForm((prev) => ({ ...prev, category: e.target.value }))
                          }
                          className="rounded-md border border-cocoa/20 px-3 py-2 text-sm"
                        />
                        <input
                          key={`upload-input-main-${uploadInputKey}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setItemUploadForm((prev) => ({
                              ...prev,
                              imageFile: e.target.files?.[0] || null,
                            }))
                          }
                          className="rounded-md border border-cocoa/20 px-3 py-2 text-sm bg-white"
                          required
                        />
                        <button
                          type="submit"
                          disabled={uploadingItem}
                          className="md:col-span-3 rounded-md bg-mocha text-latte px-4 py-2 text-sm disabled:bg-gray-400"
                        >
                          {uploadingItem ? "Uploading..." : "Upload Item"}
                        </button>
                      </form>
                      {uploadStatus && (
                        <p className="text-xs text-cocoa/75 mt-2">{uploadStatus}</p>
                      )}
                    </section>
                  )}

                  {visibleItems.length === 0 ? (
                    <div className="bg-beige rounded-2xl p-10 text-center text-cocoa">
                      {activeCategory === "User Uploads"
                        ? "No uploaded items yet. Upload your clothing in the Outfit Builder panel."
                        : "No products found in this category."}
                    </div>
                  ) : (
                    <div className={`grid ${productGridClass} gap-6`}>
                      {visibleItems.map((product) => (
                        <article
                          key={product._id}
                          className="bg-beige rounded-2xl overflow-hidden shadow-sm flex flex-col transition duration-300 hover:-translate-y-1 hover:shadow-md"
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            draggable
                            onDragStart={(event) =>
                              handleDragStart(event, product, product.sourceType || "product")
                            }
                            onClick={() => setSelectedProduct(product)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setSelectedProduct(product);
                              }
                            }}
                            className="aspect-[4/5] bg-latte flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
                            title="Drag this image to the Outfit Builder"
                          >
                            {product.image ? (
                              <img
                                src={`http://localhost:3001/uploads/${product.image}`}
                                alt={product.name}
                                className="h-full w-full object-contain p-6 transition duration-300 hover:scale-105 pointer-events-none"
                              />
                            ) : (
                              <span className="text-cocoa/40">No Image</span>
                            )}
                          </div>

                          <div className="p-5 flex flex-col gap-3 flex-1">
                            <p className="text-xs uppercase tracking-[0.15em] text-cocoa/60">
                              {product.sourceType === "userItem"
                                ? "User Uploads"
                                : product.category || "Other"}
                            </p>
                            <h2 className="text-xl text-cocoa font-medium">
                              {product.name}
                            </h2>
                            {product.sourceType === "userItem" ? (
                              <p className="text-cocoa/70 text-sm mt-auto">
                                Your personal wardrobe item
                              </p>
                            ) : (
                              <>
                                <p className="text-cocoa font-semibold">${product.price}</p>
                                {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                                  <div className="space-y-1">
                                    <select
                                      value={selectedSizes[product._id] || ""}
                                      onChange={(e) =>
                                        setSelectedSizes((prev) => ({
                                          ...prev,
                                          [product._id]: e.target.value,
                                        }))
                                      }
                                      className="rounded-md border border-cocoa/20 bg-white px-3 py-2 text-sm w-full"
                                    >
                                      <option value="">Select size</option>
                                      {product.sizes.map((size) => (
                                        <option key={`${product._id}-${size}`} value={size}>
                                          {size}
                                        </option>
                                      ))}
                                    </select>
                                    <a
                                      href="#size-chart"
                                      className="inline-block text-xs text-cocoa/70 underline hover:text-cocoa"
                                    >
                                      Need help with size?
                                    </a>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleAddToCart(
                                      product,
                                      selectedSizes[product._id] || null
                                    )
                                  }
                                  disabled={product.inStock === false}
                                  className={`mt-auto rounded-xl px-4 py-2.5 text-sm transition ${
                                    product.inStock !== false
                                      ? "bg-mocha text-latte hover:opacity-90"
                                      : "bg-gray-400 text-gray-100 cursor-not-allowed"
                                  }`}
                                >
                                  {product.inStock !== false ? "Add to Cart" : "Out of Stock"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleWishlist(product)}
                                  className="rounded-xl border border-cocoa/25 text-cocoa px-4 py-2.5 text-sm hover:bg-cocoa/10"
                                >
                                  {isInWishlist?.(product._id)
                                    ? "Remove from Wishlist"
                                    : "Add to Wishlist"}
                                </button>
                              </>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>

                {showOutfitBuilder && (
                  <section className="bg-beige rounded-2xl p-5 md:p-6 shadow-sm h-fit xl:sticky xl:top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
                    <h2 className="text-2xl font-serif text-cocoa">Outfit Builder</h2>
                    <p className="text-cocoa/80 text-sm mb-4">
                      Drop items into sections to build the outfit normally.
                    </p>

                    <div className="rounded-2xl bg-latte p-4 border border-cocoa/10 mb-4">
                      <h3 className="text-lg text-cocoa font-medium mb-2">Your Wardrobe Uploads</h3>
                      <form onSubmit={uploadPersonalItem} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="Item name"
                          value={itemUploadForm.name}
                          onChange={(e) =>
                            setItemUploadForm((prev) => ({ ...prev, name: e.target.value }))
                          }
                          className="rounded-md border border-cocoa/20 px-3 py-2 text-sm"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Category (optional)"
                          value={itemUploadForm.category}
                          onChange={(e) =>
                            setItemUploadForm((prev) => ({ ...prev, category: e.target.value }))
                          }
                          className="rounded-md border border-cocoa/20 px-3 py-2 text-sm"
                        />
                        <input
                          type="file"
                          key={`upload-input-builder-${uploadInputKey}`}
                          accept="image/*"
                          onChange={(e) =>
                            setItemUploadForm((prev) => ({
                              ...prev,
                              imageFile: e.target.files?.[0] || null,
                            }))
                          }
                          className="rounded-md border border-cocoa/20 px-3 py-2 text-sm bg-white"
                          required
                        />
                        <button
                          type="submit"
                          disabled={uploadingItem}
                          className="md:col-span-3 rounded-md bg-mocha text-latte px-4 py-2 text-sm disabled:bg-gray-400"
                        >
                          {uploadingItem ? "Uploading..." : "Upload Item"}
                        </button>
                      </form>
                      {uploadStatus && (
                        <p className="text-xs text-cocoa/75 mb-3">{uploadStatus}</p>
                      )}
                      <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                        {userItems.map((item) => (
                          <div
                            key={`user-item-${item._id}`}
                            draggable
                            onDragStart={(event) => handleDragStart(event, item, "userItem")}
                            className="rounded-lg bg-beige p-1.5 border border-cocoa/15 cursor-grab active:cursor-grabbing"
                          >
                            <div className="h-16 rounded-md bg-latte overflow-hidden mb-1">
                              {item.image ? (
                                <img
                                  src={getProductImageUrl(item)}
                                  alt={item.name}
                                  className="h-full w-full object-contain"
                                />
                              ) : null}
                            </div>
                            <p className="text-[11px] text-cocoa truncate">{item.name}</p>
                          </div>
                        ))}
                        {userItems.length === 0 && (
                          <p className="col-span-3 text-xs text-cocoa/60">
                            Upload your own clothing items and drag them into the builder.
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-cocoa/20">
                        <h4 className="text-sm uppercase tracking-[0.1em] text-cocoa/70 mb-2">
                          Saved Outfits
                        </h4>
                        {savedOutfits.length === 0 ? (
                          <p className="text-xs text-cocoa/60">
                            Saved outfits will appear here after you click Save Outfit.
                          </p>
                        ) : (
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {savedOutfits.map((outfit) => (
                              <div
                                key={outfit._id}
                                className="rounded-lg bg-beige border border-cocoa/15 p-2"
                              >
                                <p className="text-xs font-medium text-cocoa mb-1 truncate">
                                  {outfit.name || "Saved Outfit"}
                                </p>
                                <div className="flex gap-1.5 overflow-x-auto pb-1">
                                  {(outfit.pieces || []).slice(0, 5).map((piece, index) => (
                                    <div
                                      key={`${outfit._id}-${piece.slot}-${index}`}
                                      className="h-12 w-12 rounded bg-latte overflow-hidden shrink-0"
                                      title={piece.name}
                                    >
                                      {piece.image ? (
                                        <img
                                          src={`http://localhost:3001/uploads/${piece.image}`}
                                          alt={piece.name}
                                          className="h-full w-full object-contain"
                                        />
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-latte p-4 border border-cocoa/10 mb-4">
                      <div className="grid grid-cols-[1.3fr_1fr] gap-3 mb-3">
                        <div className="space-y-3">
                          {!hasDress && (
                            <>
                              {["top", "bottom"].map((slotKey) => {
                                const slot = slotConfig.find((item) => item.key === slotKey);
                                const selected = outfitSlots[slotKey];
                                if (!slot) return null;

                                return (
                                  <div
                                    key={slot.key}
                                    onDragOver={(event) => {
                                      event.preventDefault();
                                      event.dataTransfer.dropEffect = "move";
                                    }}
                                    onDrop={(event) => handleDropToSlot(event, slot.key)}
                                    className="rounded-xl border border-dashed border-cocoa/30 bg-beige/95 p-2 shadow-sm h-40"
                                  >
                                    <p className="text-[10px] uppercase tracking-[0.1em] text-cocoa/70 mb-2">
                                      {slot.label}
                                    </p>
                                    {selected ? (
                                      <div className="h-[calc(100%-1.25rem)] w-full relative">
                                        {selected.image ? (
                                          <img
                                            src={getProductImageUrl(selected)}
                                            alt={selected.name}
                                            className="h-full w-full object-contain"
                                          />
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center text-xs text-cocoa/60">
                                            No Image
                                          </div>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setOutfitSlots((prev) => ({ ...prev, [slot.key]: null }))
                                          }
                                          className="absolute right-1 top-1 text-[10px] text-red-600 bg-beige/90 px-1.5 py-0.5 rounded"
                                        >
                                          x
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="h-[calc(100%-1.25rem)] flex items-center justify-center text-center text-[11px] text-cocoa/65 leading-tight">
                                        {slot.hint}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </>
                          )}

                          {hasTopAndBottom && (
                            <div
                              onDragOver={(event) => {
                                event.preventDefault();
                                event.dataTransfer.dropEffect = "move";
                              }}
                              onDrop={(event) => handleDropToSlot(event, "shoes")}
                              className="rounded-xl border border-dashed border-cocoa/30 bg-beige/95 p-2 shadow-sm h-32"
                            >
                              <p className="text-[10px] uppercase tracking-[0.1em] text-cocoa/70 mb-2">
                                Shoes
                              </p>
                              {outfitSlots.shoes ? (
                                <div className="h-[calc(100%-1.25rem)] w-full relative">
                                  {outfitSlots.shoes.image ? (
                                    <img
                                      src={getProductImageUrl(outfitSlots.shoes)}
                                      alt={outfitSlots.shoes.name}
                                      className="h-full w-full object-contain"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-xs text-cocoa/60">
                                      No Image
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setOutfitSlots((prev) => ({ ...prev, shoes: null }))
                                    }
                                    className="absolute right-1 top-1 text-[10px] text-red-600 bg-beige/90 px-1.5 py-0.5 rounded"
                                  >
                                    x
                                  </button>
                                </div>
                              ) : (
                                <div className="h-[calc(100%-1.25rem)] flex items-center justify-center text-center text-[11px] text-cocoa/65 leading-tight">
                                  Drop footwear
                                </div>
                              )}
                            </div>
                          )}

                          <div
                            onDragOver={(event) => {
                              event.preventDefault();
                              event.dataTransfer.dropEffect = "move";
                            }}
                            onDrop={(event) => handleDropToSlot(event, "dress")}
                            className={`rounded-xl border border-dashed border-cocoa/30 bg-beige/95 p-2 shadow-sm ${
                              hasDress ? "h-[20.5rem]" : "h-28"
                            }`}
                          >
                            <p className="text-[10px] uppercase tracking-[0.1em] text-cocoa/70 mb-2">
                              Dress
                            </p>
                            {outfitSlots.dress ? (
                              <div className="h-[calc(100%-1.25rem)] w-full relative">
                                {outfitSlots.dress.image ? (
                                  <img
                                    src={getProductImageUrl(outfitSlots.dress)}
                                    alt={outfitSlots.dress.name}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-xs text-cocoa/60">
                                    No Image
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setOutfitSlots((prev) => ({ ...prev, dress: null }))
                                  }
                                  className="absolute right-1 top-1 text-[10px] text-red-600 bg-beige/90 px-1.5 py-0.5 rounded"
                                >
                                  x
                                </button>
                              </div>
                            ) : (
                              <div className="h-[calc(100%-1.25rem)] flex items-center justify-center text-center text-[11px] text-cocoa/65 leading-tight">
                                Drop a dress here. When used, Top and Bottom are optional.
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          {["outerwear", "accessories", "accessories2"].map((slotKey) => {
                            const slot = slotConfig.find((item) => item.key === slotKey);
                            const selected = outfitSlots[slotKey];
                            if (!slot) return null;

                            return (
                              <div
                                key={slot.key}
                                onDragOver={(event) => {
                                  event.preventDefault();
                                  event.dataTransfer.dropEffect = "move";
                                }}
                                onDrop={(event) => handleDropToSlot(event, slot.key)}
                                className="rounded-xl border border-dashed border-cocoa/30 bg-beige/95 p-2 shadow-sm h-40"
                              >
                                <p className="text-[10px] uppercase tracking-[0.1em] text-cocoa/70 mb-2">
                                  {slot.label}
                                </p>
                                {selected ? (
                                  <div className="h-[calc(100%-1.25rem)] w-full relative">
                                    {selected.image ? (
                                      <img
                                        src={getProductImageUrl(selected)}
                                        alt={selected.name}
                                        className="h-full w-full object-contain"
                                      />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center text-xs text-cocoa/60">
                                        No Image
                                      </div>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOutfitSlots((prev) => ({ ...prev, [slot.key]: null }))
                                      }
                                      className="absolute right-1 top-1 text-[10px] text-red-600 bg-beige/90 px-1.5 py-0.5 rounded"
                                    >
                                      x
                                    </button>
                                  </div>
                                ) : (
                                  <div className="h-[calc(100%-1.25rem)] flex items-center justify-center text-center text-[11px] text-cocoa/65 leading-tight">
                                    {slot.hint}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {!hasTopAndBottom && (
                        <div
                          onDragOver={(event) => {
                            event.preventDefault();
                            event.dataTransfer.dropEffect = "move";
                          }}
                          onDrop={(event) => handleDropToSlot(event, "shoes")}
                          className="rounded-xl border border-dashed border-cocoa/30 bg-beige/95 p-2 shadow-sm h-32"
                        >
                          <p className="text-[10px] uppercase tracking-[0.1em] text-cocoa/70 mb-2">
                            Shoes
                          </p>
                          {outfitSlots.shoes ? (
                            <div className="h-[calc(100%-1.25rem)] w-full relative">
                              {outfitSlots.shoes.image ? (
                                <img
                                  src={getProductImageUrl(outfitSlots.shoes)}
                                  alt={outfitSlots.shoes.name}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs text-cocoa/60">
                                  No Image
                                </div>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  setOutfitSlots((prev) => ({ ...prev, shoes: null }))
                                }
                                className="absolute right-1 top-1 text-[10px] text-red-600 bg-beige/90 px-1.5 py-0.5 rounded"
                              >
                                x
                              </button>
                            </div>
                          ) : (
                            <div className="h-[calc(100%-1.25rem)] flex items-center justify-center text-center text-[11px] text-cocoa/65 leading-tight">
                              Drop footwear
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl bg-latte p-4 border border-cocoa/10">
                      <h3 className="text-lg text-cocoa font-medium mb-3">Current Outfit</h3>
                      {editingOutfitId && (
                        <p className="text-xs text-cocoa/65 mb-2">
                          Editing existing saved outfit. Choose whether to update this one or save as a new copy.
                        </p>
                      )}
                      <input
                        type="text"
                        value={saveOutfitName}
                        onChange={(e) => setSaveOutfitName(e.target.value)}
                        placeholder="Outfit name (optional)"
                        className="w-full mb-3 rounded-md border border-cocoa/20 px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={recommendOutfit}
                        className="mb-3 w-full rounded-lg bg-mocha text-latte px-4 py-2 text-sm hover:opacity-90"
                      >
                        Recommend Outfit
                      </button>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        {slotConfig.map((slot) => (
                          <div
                            key={slot.key}
                            className="rounded-lg bg-beige px-2 py-2"
                          >
                            <p className="text-[11px] uppercase tracking-[0.1em] text-cocoa/60 mb-1">
                              {slot.label}
                            </p>
                            <div className="h-20 rounded-md bg-latte flex items-center justify-center overflow-hidden">
                              {outfitSlots[slot.key]?.image ? (
                                <img
                                  src={getProductImageUrl(outfitSlots[slot.key])}
                                  alt={outfitSlots[slot.key]?.name || slot.label}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <span className="text-[10px] text-cocoa/45">Empty</span>
                              )}
                            </div>
                            {outfitSlots[slot.key] && (
                              <button
                                type="button"
                                onClick={() => handleAddToCart(outfitSlots[slot.key])}
                                className="mt-1 w-full rounded-md border border-mocha/40 text-mocha text-xs py-1.5 hover:bg-mocha hover:text-latte transition"
                              >
                                Add
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => saveCurrentOutfit("new")}
                          disabled={selectedOutfitItems.length === 0}
                          className="flex-1 rounded-lg border border-mocha/40 text-mocha px-4 py-2 text-sm disabled:opacity-60"
                        >
                          Save as New
                        </button>
                        {editingOutfitId && (
                          <button
                            type="button"
                            onClick={() => saveCurrentOutfit("update")}
                            disabled={selectedOutfitItems.length === 0}
                            className="flex-1 rounded-lg border border-cocoa/30 text-cocoa px-4 py-2 text-sm disabled:opacity-60"
                          >
                            Update Existing
                          </button>
                        )}
                        {!editingOutfitId && (
                          <button
                            type="button"
                            onClick={() => saveCurrentOutfit("update")}
                            disabled
                            className="flex-1 rounded-lg border border-cocoa/20 text-cocoa/40 px-4 py-2 text-sm cursor-not-allowed"
                          >
                            Update Existing
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingOutfitId(null);
                            setSaveStatus("Switched to new outfit mode.");
                          }}
                          className="rounded-lg border border-cocoa/30 px-4 py-2 text-sm text-cocoa hover:bg-beige"
                        >
                          New Mode
                        </button>
                        <button
                          type="button"
                          onClick={addOutfitToCart}
                          disabled={selectedOutfitItems.length === 0}
                          className="flex-1 rounded-lg bg-mocha text-latte px-4 py-2 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Add Entire Outfit
                        </button>
                        <button
                          type="button"
                          onClick={clearOutfit}
                          className="rounded-lg border border-cocoa/30 px-4 py-2 text-sm text-cocoa hover:bg-beige"
                        >
                          Clear
                        </button>
                      </div>
                      {saveStatus && <p className="text-xs text-cocoa/70 mt-2">{saveStatus}</p>}
                    </div>
                  </section>
                )}
              </div>

              <div className="mt-8">
                <SizeChart id="size-chart" />
              </div>
            </main>
          </div>
        )}
      </div>

      {showBuilderPrompt && !showOutfitBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa/65 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-5xl rounded-[2rem] bg-beige p-5 md:p-8 shadow-2xl border border-cocoa/15">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
              <section className="rounded-2xl bg-gradient-to-br from-mocha to-cocoa text-latte p-5 md:p-6">
                <p className="text-[11px] uppercase tracking-[0.18em] text-latte/80 mb-3">
                  Style Upgrade
                </p>
                <h3 className="text-3xl md:text-4xl font-serif leading-tight mb-3">
                  Create complete outfits before you buy
                </h3>
                <p className="text-latte/85 mb-5 text-sm md:text-base">
                  See tops, bottoms, shoes, and accessories come together in one look.
                  Build faster and shop smarter.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
                  <div className="rounded-xl bg-latte/10 border border-latte/20 px-3 py-2">
                    <p className="text-lg font-semibold">4+ pieces</p>
                    <p className="text-[11px] text-latte/75">styled together</p>
                  </div>
                  <div className="rounded-xl bg-latte/10 border border-latte/20 px-3 py-2">
                    <p className="text-lg font-semibold">1 click</p>
                    <p className="text-[11px] text-latte/75">add whole look</p>
                  </div>
                  <div className="rounded-xl bg-latte/10 border border-latte/20 px-3 py-2">
                    <p className="text-lg font-semibold">Less guesswork</p>
                    <p className="text-[11px] text-latte/75">better outfit match</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOutfitBuilder(true);
                      setHasTriedOutfitBuilder(true);
                      setShowBuilderPrompt(false);
                    }}
                    className="rounded-xl bg-latte text-cocoa px-5 py-2.5 text-sm font-semibold hover:opacity-90"
                  >
                    Try Outfit Builder
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBuilderPrompt(false)}
                    className="rounded-xl border border-latte/45 text-latte px-5 py-2.5 text-sm"
                  >
                    Not Now
                  </button>
                </div>
              </section>

              <section className="p-1 md:p-2">
                <div className="builder-demo-canvas relative h-[29rem] md:h-[33rem] overflow-hidden">
                  <div className="builder-preview-core absolute left-1/2 top-1/2 w-[19rem] max-w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-cocoa/25 bg-beige p-5 shadow-sm relative">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-cocoa/60 mb-2 text-center">
                      Outfit Preview
                    </p>
                    <div className="relative w-full aspect-[9/16] rounded-xl bg-latte border border-dashed border-cocoa/30 px-3">
                    </div>
                    <div className="preview-drop-layer absolute left-1/2 top-1/2 h-[22rem] w-[6.6rem] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <img
                        src={demoImageSet[0]}
                        alt="Outfit demo image one"
                        className="builder-piece piece-one absolute left-0 top-0 h-[96px] w-[106px] object-cover"
                      />
                      <img
                        src={demoImageSet[1]}
                        alt="Outfit demo image two"
                        className="builder-piece piece-two absolute left-0 top-0 h-[208px] w-[106px] object-cover"
                      />
                      <img
                        src={demoImageSet[2]}
                        alt="Outfit demo image three"
                        className="builder-piece piece-three absolute left-0 top-0 h-[64px] w-[106px] object-contain"
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes builderImageDrop {
          0%, 14% {
            transform: translate(var(--sx), var(--sy)) rotate(var(--sr)) scale(1);
            opacity: 0.96;
          }
          44%, 78% {
            transform: translate(var(--tx), var(--ty)) rotate(var(--tr)) scale(1);
            opacity: 0.92;
          }
          88%, 100% {
            transform: translate(var(--tx), var(--ty)) rotate(var(--tr)) scale(1);
            opacity: 1;
          }
        }
        @keyframes builderPreviewGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(92, 68, 52, 0.09); }
          50% { box-shadow: 0 0 0 10px rgba(92, 68, 52, 0.16); }
        }
        .builder-preview-core {
          animation: builderPreviewGlow 3.5s ease-in-out infinite;
        }
        .builder-piece {
          will-change: transform, opacity;
          animation: builderImageDrop 3.5s cubic-bezier(0.35, 0.02, 0.2, 1) 1 forwards;
          transition: opacity 0.35s ease-in-out;
        }
        .piece-one {
          --sx: 0px;
          --sy: 0px;
          --sr: 0deg;
          --tx: 0px;
          --ty: 0px;
          --tr: 0deg;
          animation-delay: 0s;
        }
        .piece-two {
          --sx: 0px;
          --sy: 0px;
          --sr: 0deg;
          --tx: 0px;
          --ty: 102px;
          --tr: 0deg;
          animation-delay: 0.2s;
        }
        .piece-three {
          --sx: 0px;
          --sy: 0px;
          --sr: 0deg;
          --tx: 0px;
          --ty: 316px;
          --tr: 0deg;
          animation-delay: 0.4s;
        }
        @media (prefers-reduced-motion: reduce) {
          .builder-piece,
          .builder-preview-core {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
