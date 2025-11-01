import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

// ✅ OPTIMIZED: Cart store with better performance
const cartStore = (set, get) => ({
  cartItems: [],
  isLoading: false,
  lastUpdated: null,

  // ✅ OPTIMIZED: Add to cart with validation
  addToCart: (item) => {
    if (!item || !item._id) {
      console.error("❌ Invalid item:", item);
      return false;
    }

    console.log("🛒 Adding to cart:", {
      title: item.title || item.name,
      type: item.type,
      id: item._id,
    });

    const existing = get().cartItems.find(
      (i) => i._id === item._id && i.type === item.type
    );

    if (existing) {
      // ✅ OPTIMIZED: Update existing item
      set({
        cartItems: get().cartItems.map((i) =>
          i._id === item._id && i.type === item.type
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        ),
        lastUpdated: Date.now(),
      });
      console.log("📦 Item quantity updated");
      return true;
    }

    // ✅ OPTIMIZED: Safe number conversion
    const toNum = (val) => {
      if (val === null || val === undefined || val === "") return 0;
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    };

    // ✅ OPTIMIZED: Store only necessary fields (smaller storage)
    const cartItem = {
      _id: item._id,
      productId: item.productId || item._id,
      title: item.title || item.name,
      type: item.type || "regular",
      quantity: 1,

      // ✅ Pricing - All converted to numbers
      price: toNum(item.price),
      priceINR: toNum(item.priceINR),
      priceUSD: toNum(item.priceUSD),
      dumpsPriceInr: toNum(item.dumpsPriceInr),
      dumpsPriceUsd: toNum(item.dumpsPriceUsd),
      examPriceInr: toNum(item.examPriceInr),
      examPriceUsd: toNum(item.examPriceUsd),
      comboPriceInr: toNum(item.comboPriceInr),
      comboPriceUsd: toNum(item.comboPriceUsd),

      // ✅ Product info
      category: item.category,
      sapExamCode: item.sapExamCode,
      imageUrl: item.imageUrl,

      // ✅ Exam details
      numberOfQuestions: item.numberOfQuestions,
      duration: item.duration,
      passingScore: item.passingScore,
    };

    set({
      cartItems: [...get().cartItems, cartItem],
      lastUpdated: Date.now(),
    });

    console.log("✅ Item added to cart");
    return true;
  },

  // ✅ OPTIMIZED: Remove from cart
  removeFromCart: (id, type = "regular") => {
    set({
      cartItems: get().cartItems.filter(
        (item) => !(item._id === id && item.type === type)
      ),
      lastUpdated: Date.now(),
    });
    console.log(`🗑️ Item removed: ${id}`);
  },

  // ✅ OPTIMIZED: Update quantity
  updateQuantity: (id, type, newQuantity) => {
    if (newQuantity < 1) {
      get().removeFromCart(id, type);
      return;
    }

    set({
      cartItems: get().cartItems.map((item) =>
        item._id === id && item.type === type
          ? { ...item, quantity: newQuantity }
          : item
      ),
      lastUpdated: Date.now(),
    });
  },

  // ✅ OPTIMIZED: Clear cart
  clearCart: () => {
    set({ cartItems: [], lastUpdated: Date.now() });
    console.log("🧹 Cart cleared");
  },

  // ✅ OPTIMIZED: Get item price based on type and currency
  getItemPrice: (item, currency = "INR") => {
    if (!item) return 0;

    const type = item.type || "regular";
    const key = `${type}Price${currency === "USD" ? "Usd" : "Inr"}`;

    // ✅ Fallback chain for pricing
    const price =
      item[key] ||
      (currency === "USD" ? item.priceUSD : item.priceINR) ||
      item.price ||
      0;

    return Math.max(0, Number(price) || 0);
  },

  // ✅ OPTIMIZED: Get cart total (memoized calculation)
  getCartTotal: (currency = "INR") => {
    return get().cartItems.reduce((total, item) => {
      const price = get().getItemPrice(item, currency);
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);
  },

  // ✅ OPTIMIZED: Get item count
  getItemCount: () => {
    return get().cartItems.reduce(
      (count, item) => count + (item.quantity || 1),
      0
    );
  },

  // ✅ OPTIMIZED: Get unique product count
  getUniqueItemCount: () => {
    return get().cartItems.length;
  },

  // ✅ OPTIMIZED: Check if item exists
  hasItem: (id, type = "regular") => {
    return get().cartItems.some(
      (item) => item._id === id && item.type === type
    );
  },

  // ✅ OPTIMIZED: Get item from cart
  getItem: (id, type = "regular") => {
    return get().cartItems.find(
      (item) => item._id === id && item.type === type
    );
  },
});

// ✅ OPTIMIZED: Create store with persistence and selectors
const useCartStore = create(
  subscribeWithSelector(
    persist(cartStore, {
      name: "prepmantras-cart",
      version: 6, // Incremented for cleanup

      // ✅ Migration handler
      migrate: (persistedState, version) => {
        if (version < 6) {
          console.log("🔄 Migrating cart to v6");
          return { cartItems: [], lastUpdated: null };
        }
        return persistedState;
      },

      // ✅ Rehydration handler
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("❌ Cart rehydration error:", error);
          // Clear corrupted storage
          if (typeof window !== "undefined") {
            localStorage.removeItem("prepmantras-cart");
          }
        } else if (state?.cartItems?.length > 0) {
          console.log(`✅ Cart loaded: ${state.cartItems.length} items`);
        }
      },
    })
  )
);

// ✅ OPTIMIZED: Selectors for better performance (only re-render what changed)
export const useCartItems = () => useCartStore((state) => state.cartItems);
export const useCartTotal = (currency = "INR") =>
  useCartStore((state) => state.getCartTotal(currency));
export const useItemCount = () => useCartStore((state) => state.getItemCount());
export const useUniqueItemCount = () =>
  useCartStore((state) => state.getUniqueItemCount());
export const useLastUpdated = () => useCartStore((state) => state.lastUpdated);

// ✅ OPTIMIZED: Export action functions for external use
export const addToCart = (item) => useCartStore.getState().addToCart(item);
export const removeFromCart = (id, type) =>
  useCartStore.getState().removeFromCart(id, type);
export const updateQuantity = (id, type, quantity) =>
  useCartStore.getState().updateQuantity(id, type, quantity);
export const clearCart = () => useCartStore.getState().clearCart();
export const getCartTotal = (currency = "INR") =>
  useCartStore.getState().getCartTotal(currency);
export const getItemCount = () => useCartStore.getState().getItemCount();
export const hasItem = (id, type) => useCartStore.getState().hasItem(id, type);
export const getItem = (id, type) => useCartStore.getState().getItem(id, type);

// ✅ OPTIMIZED: Subscribe to cart changes (for external listeners)
export const subscribeToCart = (listener) => {
  return useCartStore.subscribe(
    (state) => state.cartItems,
    (cartItems) => listener(cartItems)
  );
};

// ✅ OPTIMIZED: Subscribe to total changes
export const subscribeToTotal = (currency, listener) => {
  return useCartStore.subscribe(
    (state) => state.getCartTotal(currency),
    (total) => listener(total)
  );
};

export default useCartStore;
