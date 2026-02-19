import { createContext, useContext, useEffect, useState } from "react";

const WishlistContext = createContext();

const safeParse = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getUserId = () => {
  const storedUser = safeParse(localStorage.getItem("user"), null);
  return storedUser?._id || storedUser?.id || null;
};

const getWishlistKey = (userId) => (userId ? `wishlist_${userId}` : null);

const getStoredWishlist = (userId) => {
  const key = getWishlistKey(userId);
  if (!key) return [];
  const stored = safeParse(localStorage.getItem(key), []);
  return Array.isArray(stored) ? stored : [];
};

export function WishlistProvider({ children }) {
  const [session, setSession] = useState(() => {
    const initialUserId = getUserId();
    return {
      userId: initialUserId,
      wishlist: getStoredWishlist(initialUserId),
    };
  });

  const persistWishlist = (userId, nextWishlist) => {
    const key = getWishlistKey(userId);
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(nextWishlist));
  };

  const syncSession = () => {
    const nextUserId = getUserId();
    setSession((prev) => {
      if (prev.userId === nextUserId) return prev;
      return {
        userId: nextUserId,
        wishlist: getStoredWishlist(nextUserId),
      };
    });
  };

  useEffect(() => {
    window.addEventListener("storage", syncSession);
    window.addEventListener("auth-changed", syncSession);
    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("auth-changed", syncSession);
    };
  }, []);

  const addToWishlist = (item) => {
    setSession((prev) => {
      if (!prev.userId) return prev;
      const exists = prev.wishlist.some(
        (wishlistItem) => String(wishlistItem._id) === String(item._id)
      );
      if (exists) return prev;
      const nextWishlist = [...prev.wishlist, item];
      persistWishlist(prev.userId, nextWishlist);
      return { ...prev, wishlist: nextWishlist };
    });
  };

  const removeFromWishlist = (itemId) => {
    setSession((prev) => {
      if (!prev.userId) return prev;
      const nextWishlist = prev.wishlist.filter(
        (item) => String(item._id) !== String(itemId)
      );
      persistWishlist(prev.userId, nextWishlist);
      return { ...prev, wishlist: nextWishlist };
    });
  };

  const toggleWishlist = (item) => {
    setSession((prev) => {
      if (!prev.userId) return prev;
      const exists = prev.wishlist.some(
        (wishlistItem) => String(wishlistItem._id) === String(item._id)
      );
      const nextWishlist = exists
        ? prev.wishlist.filter((wishlistItem) => String(wishlistItem._id) !== String(item._id))
        : [...prev.wishlist, item];
      persistWishlist(prev.userId, nextWishlist);
      return { ...prev, wishlist: nextWishlist };
    });
  };

  const isInWishlist = (itemId) =>
    session.wishlist.some((item) => String(item._id) === String(itemId));

  return (
    <WishlistContext.Provider
      value={{
        wishlist: session.wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = () => useContext(WishlistContext);
