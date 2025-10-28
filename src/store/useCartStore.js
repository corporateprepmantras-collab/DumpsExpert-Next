import { create } from "zustand";
import { persist } from "zustand/middleware";

// Store definition
const cartStore = (set, get) => ({
  cartItems: [],

  addToCart: (item) => {
    console.log("Adding to cart - Full item:", item);

    const existing = get().cartItems.find(
      (i) => i._id === item._id && i.type === item.type
    );

    if (existing) {
      set({
        cartItems: get().cartItems.map((i) =>
          i._id === item._id && i.type === item.type
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      });
    } else {
      // Store the complete product object with ALL fields
      const completeItem = {
        // Core identifiers
        _id: item._id,
        productId: item.productId || item._id,
        courseId: item._id,

        // Names
        title: item.title,
        name: item.name || item.title,

        // ALL Pricing fields - CRITICAL for cart calculations
        // Priority: combo prices first, then dumps prices
        price: item.price || item.comboPriceInr || item.dumpsPriceInr || 0,
        priceINR: item.priceINR || item.comboPriceInr || item.dumpsPriceInr,
        priceUSD: item.priceUSD || item.comboPriceUsd || item.dumpsPriceUsd,
        
        // Dumps pricing
        dumpsPriceInr: item.dumpsPriceInr,
        dumpsPriceUsd: item.dumpsPriceUsd,
        dumpsMrpInr: item.dumpsMrpInr,
        dumpsMrpUsd: item.dumpsMrpUsd,
        
        // Combo pricing (PDF + Online Exam)
        comboPriceInr: item.comboPriceInr,
        comboPriceUsd: item.comboPriceUsd,
        comboMrpInr: item.comboMrpInr,
        comboMrpUsd: item.comboMrpUsd,

        // Product details
        category: item.category,
        sapExamCode: item.sapExamCode,
        code: item.code || item.sapExamCode,
        sku: item.sku,
        slug: item.slug,

        // URLs and media - CRITICAL for order access
        imageUrl: item.imageUrl,
        samplePdfUrl: item.samplePdfUrl,
        mainPdfUrl: item.mainPdfUrl,

        // Exam details
        duration: item.duration,
        eachQuestionMark: item.eachQuestionMark,
        numberOfQuestions: item.numberOfQuestions,
        passingScore: item.passingScore,

        // Instructions
        mainInstructions: item.mainInstructions,
        sampleInstructions: item.sampleInstructions,

        // Descriptions
        Description: item.Description,
        longDescription: item.longDescription,

        // Status and meta
        status: item.status,
        action: item.action,
        type: item.type || "exam",

        // SEO fields
        metaTitle: item.metaTitle,
        metaKeywords: item.metaKeywords,
        metaDescription: item.metaDescription,
        schema: item.schema,

        // Quantity
        quantity: 1,

        // Preserve any additional fields that might exist
        ...Object.keys(item).reduce((acc, key) => {
          if (!acc.hasOwnProperty(key)) {
            acc[key] = item[key];
          }
          return acc;
        }, {}),
      };

      console.log("✅ Stored complete item in cart:", completeItem);
      console.log("💰 Pricing check:");
      console.log("  - Combo INR:", completeItem.comboPriceInr);
      console.log("  - Combo USD:", completeItem.comboPriceUsd);
      console.log("  - Dumps INR:", completeItem.dumpsPriceInr);
      console.log("  - Dumps USD:", completeItem.dumpsPriceUsd);

      set({
        cartItems: [...get().cartItems, completeItem],
      });
    }
  },

  removeFromCart: (id, type) => {
    set({
      cartItems: get().cartItems.filter(
        (item) => !(item._id === id && item.type === type)
      ),
    });
  },

  updateQuantity: (id, type, operation) => {
    set({
      cartItems: get().cartItems.map((item) => {
        if (item._id === id && item.type === type) {
          const updatedQty =
            operation === "inc"
              ? item.quantity + 1
              : Math.max(1, item.quantity - 1);
          return { ...item, quantity: updatedQty };
        }
        return item;
      }),
    });
  },

  clearCart: () => set({ cartItems: [] }),

  // Helper to get cart total in specific currency
  getCartTotal: (currency = "INR") => {
    return get().cartItems.reduce((acc, item) => {
      // Priority: combo prices first, then dumps prices
      const price =
        currency === "USD"
          ? Number(item.comboPriceUsd || item.dumpsPriceUsd || item.priceUSD || item.price) || 0
          : Number(item.comboPriceInr || item.dumpsPriceInr || item.priceINR || item.price) || 0;
      return acc + price * (item.quantity || 1);
    }, 0);
  },

  // Get item count
  getItemCount: () => {
    return get().cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  },
});

// Create store with persistence
const useCartStore = create(
  persist(cartStore, {
    name: "cart-storage",
    version: 2, // Increment version to trigger migration
    migrate: (persistedState, version) => {
      // If old version or no version, clear the cart to avoid issues
      if (version < 2) {
        console.log("🔄 Migrating cart store to version 2 - clearing old data");
        return {
          cartItems: [],
        };
      }
      return persistedState;
    },
    // Handle parse errors gracefully
    onRehydrateStorage: () => (state, error) => {
      if (error) {
        console.error("❌ Error rehydrating cart store:", error);
        // Clear localStorage if there's an error
        if (typeof window !== "undefined") {
          localStorage.removeItem("cart-storage");
        }
      } else {
        console.log("✅ Cart store rehydrated successfully");
        if (state?.cartItems?.length > 0) {
          console.log(`📦 Cart has ${state.cartItems.length} items`);
        }
      }
    },
  })
);

// Selector: total price in specific currency
export const getCartTotal = (currency = "INR") => {
  const state = useCartStore.getState();
  return state.cartItems.reduce((acc, item) => {
    // Priority: combo prices first, then dumps prices
    const price =
      currency === "USD"
        ? Number(item.comboPriceUsd || item.dumpsPriceUsd || item.priceUSD || item.price) || 0
        : Number(item.comboPriceInr || item.dumpsPriceInr || item.priceINR || item.price) || 0;
    return acc + price * (item.quantity || 1);
  }, 0);
};

// Selector: get item count
export const getCartItemCount = () => {
  const state = useCartStore.getState();
  return state.cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
};

export default useCartStore;