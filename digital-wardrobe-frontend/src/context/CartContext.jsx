import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

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

const getCartKey = (userId) => (userId ? `cart_${userId}` : null);

const getStoredCart = (userId) => {
  const key = getCartKey(userId);
  if (!key) return [];

  const stored = safeParse(localStorage.getItem(key), []);
  if (!Array.isArray(stored)) return [];

  return stored.map((item) => {
    const normalizedSize = item.selectedSize || "nosize";
    const cartItemId = item.cartItemId || `${item._id}__${normalizedSize}`;
    return { ...item, cartItemId };
  });
};

export function CartProvider({ children }) {
  const [session, setSession] = useState(() => {
    const initialUserId = getUserId();
    return {
      userId: initialUserId,
      cart: getStoredCart(initialUserId),
    };
  });

  const persistCart = (userId, nextCart) => {
    const key = getCartKey(userId);
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(nextCart));
  };

  const syncSession = () => {
    const nextUserId = getUserId();
    setSession((prev) => {
      if (prev.userId === nextUserId) return prev;
      return {
        userId: nextUserId,
        cart: getStoredCart(nextUserId),
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

  /* ---------------- ACTIONS ---------------- */

  const addToCart = (product, selectedSize = null) => {
    setSession((prev) => {
      if (!prev.userId) return prev;

      const normalizedSize = selectedSize || product.selectedSize || "nosize";
      const cartItemId = `${product._id}__${normalizedSize}`;
      const existing = prev.cart.find((p) => p.cartItemId === cartItemId);
      let nextCart = [];

      if (existing) {
        nextCart = prev.cart.map((p) =>
          p.cartItemId === cartItemId
            ? { ...p, quantity: (p.quantity || 1) + 1 }
            : p
        );
      } else {
        nextCart = [
          ...prev.cart,
          {
            ...product,
            selectedSize: normalizedSize === "nosize" ? null : normalizedSize,
            cartItemId,
            quantity: 1,
          },
        ];
      }

      persistCart(prev.userId, nextCart);
      return { ...prev, cart: nextCart };
    });
  };

  const removeFromCart = (cartItemId) => {
    setSession((prev) => {
      if (!prev.userId) return prev;
      const nextCart = prev.cart.filter(
        (item) => (item.cartItemId || `${item._id}__${item.selectedSize || "nosize"}`) !== cartItemId
      );
      persistCart(prev.userId, nextCart);
      return { ...prev, cart: nextCart };
    });
  };

  const updateQuantity = (cartItemId, quantity) => {
    setSession((prev) => {
      if (!prev.userId) return prev;
      const nextCart =
        quantity <= 0
          ? prev.cart.filter(
              (item) =>
                (item.cartItemId || `${item._id}__${item.selectedSize || "nosize"}`) !== cartItemId
            )
          : prev.cart.map((item) =>
              (item.cartItemId || `${item._id}__${item.selectedSize || "nosize"}`) === cartItemId
                ? { ...item, quantity }
                : item
            );

      persistCart(prev.userId, nextCart);
      return { ...prev, cart: nextCart };
    });
  };

  const updateItemSize = (cartItemId, nextSize) => {
    setSession((prev) => {
      if (!prev.userId) return prev;
      const normalizedNextSize = nextSize || "nosize";
      const currentItem = prev.cart.find(
        (item) =>
          (item.cartItemId || `${item._id}__${item.selectedSize || "nosize"}`) === cartItemId
      );
      if (!currentItem) return prev;

      const nextCartItemId = `${currentItem._id}__${normalizedNextSize}`;
      const existingTarget = prev.cart.find(
        (item) =>
          (item.cartItemId || `${item._id}__${item.selectedSize || "nosize"}`) === nextCartItemId
      );

      let nextCart = [];
      if (existingTarget && nextCartItemId !== cartItemId) {
        nextCart = prev.cart
          .filter(
            (item) =>
              (item.cartItemId || `${item._id}__${item.selectedSize || "nosize"}`) !== cartItemId
          )
          .map((item) => {
            const itemId = item.cartItemId || `${item._id}__${item.selectedSize || "nosize"}`;
            if (itemId !== nextCartItemId) return item;
            return {
              ...item,
              quantity: Number(item.quantity || 1) + Number(currentItem.quantity || 1),
              selectedSize: normalizedNextSize === "nosize" ? null : normalizedNextSize,
              cartItemId: nextCartItemId,
            };
          });
      } else {
        nextCart = prev.cart.map((item) => {
          const itemId = item.cartItemId || `${item._id}__${item.selectedSize || "nosize"}`;
          if (itemId !== cartItemId) return item;
          return {
            ...item,
            selectedSize: normalizedNextSize === "nosize" ? null : normalizedNextSize,
            cartItemId: nextCartItemId,
          };
        });
      }

      persistCart(prev.userId, nextCart);
      return { ...prev, cart: nextCart };
    });
  };

  const clearCart = () => {
    setSession((prev) => {
      if (!prev.userId) return prev;
      localStorage.removeItem(getCartKey(prev.userId));
      return { ...prev, cart: [] };
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart: session.cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemSize,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);
