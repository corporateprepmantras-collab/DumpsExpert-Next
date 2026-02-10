import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";

// ✅ OPTIMIZED: Cart store WITHOUT quantity - one item per type only
const cartStore = (set, get) => ({
  cartItems: [],
  isLoading: false,
  lastUpdated: null,

  // ✅ OPTIMIZED: Add to cart - prevents duplicates
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

    // ✅ Check if item already exists (same product + same type)
    const existing = get().cartItems.find(
      (i) => i._id === item._id && i.type === item.type,
    );

    if (existing) {
      console.log("ℹ️ Item already in cart, not adding duplicate");
      return false; // Don't add duplicate
    }

    // ✅ OPTIMIZED: Safe number conversion with logging
    const toNum = (val, fieldName = "") => {
      if (val === null || val === undefined || val === "") return 0;
      const num = Number(val);
      const result = isNaN(num) ? 0 : num;
      if (fieldName && result === 0 && val !== 0) {
        console.log(`⚠️ ${fieldName} conversion resulted in 0:`, val);
      }
      return result;
    };

    // Log incoming item prices for debugging
    console.log("📊 Item prices:", {
      title: item.title,
      type: item.type,
      dumpsPriceInr: item.dumpsPriceInr,
      dumpsPriceUsd: item.dumpsPriceUsd,
      priceINR: item.priceINR,
      priceUSD: item.priceUSD,
      price: item.price,
    });

    // ✅ OPTIMIZED: Store only necessary fields (NO quantity field)
    const cartItem = {
      _id: item._id,
      productId: item.productId || item._id,
      title: item.title || item.name,
      name: item.name || item.title,
      type: item.type || "regular",

      // ✅ Pricing - All converted to numbers
      price: toNum(item.price),
      priceINR: toNum(item.priceINR),
      priceUSD: toNum(item.priceUSD),
      dumpsPriceInr: toNum(item.dumpsPriceInr),
      dumpsPriceUsd: toNum(item.dumpsPriceUsd),
      dumpsMrpInr: toNum(item.dumpsMrpInr),
      dumpsMrpUsd: toNum(item.dumpsMrpUsd),
      examPriceInr: toNum(item.examPriceInr),
      examPriceUsd: toNum(item.examPriceUsd),
      examMrpInr: toNum(item.examMrpInr),
      examMrpUsd: toNum(item.examMrpUsd),
      comboPriceInr: toNum(item.comboPriceInr),
      comboPriceUsd: toNum(item.comboPriceUsd),
      comboMrpInr: toNum(item.comboMrpInr),
      comboMrpUsd: toNum(item.comboMrpUsd),

      // ✅ Product info
      category: item.category,
      sapExamCode: item.sapExamCode,
      code: item.code || item.sapExamCode,
      imageUrl: item.imageUrl,
      slug: item.slug,
      sku: item.sku,

      // ✅ Exam details
      numberOfQuestions: item.numberOfQuestions,
      duration: item.duration,
      passingScore: item.passingScore,

      // ✅ PDF URLs
      mainPdfUrl: item.mainPdfUrl || "",
      samplePdfUrl: item.samplePdfUrl || "",

      // ✅ Instructions & Descriptions
      mainInstructions: item.mainInstructions || "",
      sampleInstructions: item.sampleInstructions || "",
      Description: item.Description || "",
      longDescription: item.longDescription || "",

      // ✅ Meta & Status
      status: item.status || "active",
      action: item.action || "",
      metaTitle: item.metaTitle || "",
      metaKeywords: item.metaKeywords || "",
      metaDescription: item.metaDescription || "",
      schema: item.schema || "",
      courseId: item.courseId || item._id,
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
        (item) => !(item._id === id && item.type === type),
      ),
      lastUpdated: Date.now(),
    });
    console.log(`🗑️ Item removed: ${id} (${type})`);
  },

  // ✅ REMOVED: No updateQuantity function needed

  // ✅ OPTIMIZED: Clear cart
  clearCart: () => {
    set({ cartItems: [], lastUpdated: Date.now() });
    console.log("🧹 Cart cleared");
  },

  // ✅ OPTIMIZED: Get item price based on type and currency
  getItemPrice: (item, currency = "INR") => {
    if (!item) return 0;

    const type = item.type || "regular";
    const toNum = (val) => {
      if (val === null || val === undefined || val === "") return 0;
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    };

    if (currency === "USD") {
      switch (type) {
        case "combo":
          return (
            toNum(item.comboPriceUsd) ||
            toNum(item.priceUSD) ||
            toNum(item.price) ||
            0
          );
        case "online":
          return (
            toNum(item.examPriceUsd) ||
            toNum(item.priceUSD) ||
            toNum(item.price) ||
            0
          );
        case "regular":
        default:
          return (
            toNum(item.dumpsPriceUsd) ||
            toNum(item.priceUSD) ||
            toNum(item.price) ||
            0
          );
      }
    } else {
      switch (type) {
        case "combo":
          return (
            toNum(item.comboPriceInr) ||
            toNum(item.priceINR) ||
            toNum(item.price) ||
            0
          );
        case "online":
          return (
            toNum(item.examPriceInr) ||
            toNum(item.priceINR) ||
            toNum(item.price) ||
            0
          );
        case "regular":
        default:
          return (
            toNum(item.dumpsPriceInr) ||
            toNum(item.priceINR) ||
            toNum(item.price) ||
            0
          );
      }
    }
  },

  // ✅ OPTIMIZED: Get cart total (NO quantity multiplication)
  getCartTotal: (currency = "INR") => {
    return get().cartItems.reduce((total, item) => {
      const price = get().getItemPrice(item, currency);
      return total + price; // No quantity multiplication
    }, 0);
  },

  // ✅ OPTIMIZED: Get item count (just count of items)
  getItemCount: () => {
    return get().cartItems.length; // No quantity sum
  },

  // ✅ OPTIMIZED: Get unique product count (same as item count now)
  getUniqueItemCount: () => {
    return get().cartItems.length;
  },

  // ✅ OPTIMIZED: Check if item exists
  hasItem: (id, type = "regular") => {
    return get().cartItems.some(
      (item) => item._id === id && item.type === type,
    );
  },

  // ✅ OPTIMIZED: Get item from cart
  getItem: (id, type = "regular") => {
    return get().cartItems.find(
      (item) => item._id === id && item.type === type,
    );
  },
});

// ✅ OPTIMIZED: Create store with persistence and selectors
const useCartStore = create(
  subscribeWithSelector(
    persist(cartStore, {
      name: "prepmantras-cart",
      version: 7, // Incremented for no-quantity system

      // ✅ Migration handler - clear old cart with quantity system
      migrate: (persistedState, version) => {
        if (version < 7) {
          console.log("🔄 Migrating cart to v7 (no-quantity system)");
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
    }),
  ),
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
    (cartItems) => listener(cartItems),
  );
};

// ✅ OPTIMIZED: Subscribe to total changes
export const subscribeToTotal = (currency, listener) => {
  return useCartStore.subscribe(
    (state) => state.getCartTotal(currency),
    (total) => listener(total),
  );
};

// ✅ Export useCartStore as both named and default export
export { useCartStore };
export default useCartStore;
