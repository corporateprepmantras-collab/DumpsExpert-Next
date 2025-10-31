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

        // ALL Pricing fields - Store as numbers
        price: Number(item.price) || 0,
        priceINR: Number(item.priceINR) || 0,
        priceUSD: Number(item.priceUSD) || 0,

        // Dumps pricing (Regular PDF)
        dumpsPriceInr: Number(item.dumpsPriceInr) || 0,
        dumpsPriceUsd: Number(item.dumpsPriceUsd) || 0,
        dumpsMrpInr: Number(item.dumpsMrpInr) || 0,
        dumpsMrpUsd: Number(item.dumpsMrpUsd) || 0,

        // Combo pricing (PDF + Online Exam)
        comboPriceInr: Number(item.comboPriceInr) || 0,
        comboPriceUsd: Number(item.comboPriceUsd) || 0,
        comboMrpInr: Number(item.comboMrpInr) || 0,
        comboMrpUsd: Number(item.comboMrpUsd) || 0,

        // Exam pricing (Online Exam Only)
        examPriceInr: Number(item.examPriceInr) || 0,
        examPriceUsd: Number(item.examPriceUsd) || 0,
        examMrpInr: Number(item.examMrpInr) || 0,
        examMrpUsd: Number(item.examMrpUsd) || 0,

        // Product details
        category: item.category,
        sapExamCode: item.sapExamCode,
        code: item.code || item.sapExamCode,
        sku: item.sku,
        slug: item.slug,

        // URLs and media
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
        type: item.type || "regular",

        // SEO fields
        metaTitle: item.metaTitle,
        metaKeywords: item.metaKeywords,
        metaDescription: item.metaDescription,
        schema: item.schema,

        // Quantity
        quantity: 1,

        // Preserve any additional fields
        ...Object.keys(item).reduce((acc, key) => {
          if (!acc.hasOwnProperty(key)) {
            acc[key] = item[key];
          }
          return acc;
        }, {}),
      };

      console.log("✅ Stored complete item in cart:", completeItem);
      console.log("💰 Pricing check:");
      console.log("  - Type:", completeItem.type);
      console.log("  - Price INR:", completeItem.priceINR);
      console.log("  - Price USD:", completeItem.priceUSD);
      console.log("  - Dumps INR:", completeItem.dumpsPriceInr);
      console.log("  - Dumps USD:", completeItem.dumpsPriceUsd);
      console.log("  - Exam INR:", completeItem.examPriceInr);
      console.log("  - Exam USD:", completeItem.examPriceUsd);
      console.log("  - Combo INR:", completeItem.comboPriceInr);
      console.log("  - Combo USD:", completeItem.comboPriceUsd);

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

  // Helper to get the correct price based on item type and currency
  getItemPrice: (item, currency = "INR") => {
    const type = item.type || "regular";
    
    if (currency === "USD") {
      switch (type) {
        case "combo":
          return Number(item.comboPriceUsd) || Number(item.priceUSD) || 0;
        case "online":
          return Number(item.examPriceUsd) || Number(item.priceUSD) || 0;
        case "regular":
        default:
          return Number(item.dumpsPriceUsd) || Number(item.priceUSD) || 0;
      }
    } else {
      switch (type) {
        case "combo":
          return Number(item.comboPriceInr) || Number(item.priceINR) || 0;
        case "online":
          return Number(item.examPriceInr) || Number(item.priceINR) || 0;
        case "regular":
        default:
          return Number(item.dumpsPriceInr) || Number(item.priceINR) || 0;
      }
    }
  },

  // Get cart total in specific currency
  getCartTotal: (currency = "INR") => {
    const state = get();
    return state.cartItems.reduce((acc, item) => {
      const price = state.getItemPrice(item, currency);
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
    version: 3, // Increment version for new pricing structure
    migrate: (persistedState, version) => {
      if (version < 3) {
        console.log("🔄 Migrating cart store to version 3 - clearing old data");
        return {
          cartItems: [],
        };
      }
      return persistedState;
    },
    onRehydrateStorage: () => (state, error) => {
      if (error) {
        console.error("❌ Error rehydrating cart store:", error);
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

// Export selector functions
export const getCartTotal = (currency = "INR") => {
  const state = useCartStore.getState();
  return state.getCartTotal(currency);
};

export const getCartItemCount = () => {
  const state = useCartStore.getState();
  return state.getItemCount();
};

export default useCartStore;