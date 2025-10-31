import { create } from "zustand";
import { persist } from "zustand/middleware";

// Store definition
const cartStore = (set, get) => ({
  cartItems: [],

  addToCart: (item) => {
    console.log("🛒 Adding to cart - Full item:", item);

    const existing = get().cartItems.find(
      (i) => i._id === item._id && i.type === item.type
    );

    if (existing) {
      console.log("📦 Item already exists, incrementing quantity");
      set({
        cartItems: get().cartItems.map((i) =>
          i._id === item._id && i.type === item.type
            ? { ...i, quantity: i.quantity + 1 }
            : i
        ),
      });
    } else {
      // Helper to safely convert to number
      const toNum = (val) => {
        if (val === null || val === undefined || val === "") return 0;
        const num = Number(val);
        return isNaN(num) ? 0 : num;
      };

      // Store the complete product object with ALL fields
      const completeItem = {
        // Core identifiers
        _id: item._id,
        productId: item.productId || item._id,
        courseId: item._id,

        // Names
        title: item.title,
        name: item.name || item.title,

        // ALL Pricing fields - Store as numbers with safe conversion
        price: toNum(item.price),
        priceINR: toNum(item.priceINR),
        priceUSD: toNum(item.priceUSD),

        // Dumps pricing (Regular PDF)
        dumpsPriceInr: toNum(item.dumpsPriceInr),
        dumpsPriceUsd: toNum(item.dumpsPriceUsd),
        dumpsMrpInr: toNum(item.dumpsMrpInr),
        dumpsMrpUsd: toNum(item.dumpsMrpUsd),

        // Combo pricing (PDF + Online Exam)
        comboPriceInr: toNum(item.comboPriceInr),
        comboPriceUsd: toNum(item.comboPriceUsd),
        comboMrpInr: toNum(item.comboMrpInr),
        comboMrpUsd: toNum(item.comboMrpUsd),

        // Exam pricing (Online Exam Only) - CRITICAL
        examPriceInr: toNum(item.examPriceInr),
        examPriceUsd: toNum(item.examPriceUsd),
        examMrpInr: toNum(item.examMrpInr),
        examMrpUsd: toNum(item.examMrpUsd),

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

      // UPDATED VALIDATION: Check the correct price fields based on type
      if (completeItem.type === "online") {
        // For online type, check if EITHER examPriceInr OR examPriceUsd OR priceINR OR priceUSD has value
        const hasValidPrice = 
          completeItem.examPriceInr > 0 || 
          completeItem.examPriceUsd > 0 ||
          completeItem.priceINR > 0 ||
          completeItem.priceUSD > 0;
        
        if (!hasValidPrice) {
          console.error("⚠️ WARNING: Online exam added with 0 price!");
          console.error("Debug info:", {
            examPriceInr: completeItem.examPriceInr,
            examPriceUsd: completeItem.examPriceUsd,
            priceINR: completeItem.priceINR,
            priceUSD: completeItem.priceUSD,
          });
        } else {
          console.log("✅ Online exam has valid pricing:", {
            examPriceInr: completeItem.examPriceInr,
            examPriceUsd: completeItem.examPriceUsd,
            priceINR: completeItem.priceINR,
            priceUSD: completeItem.priceUSD,
          });
        }
      }

      set({
        cartItems: [...get().cartItems, completeItem],
      });
    }
  },

  removeFromCart: (id, type) => {
    console.log(`🗑️ Removing item from cart: ${id} (${type})`);
    set({
      cartItems: get().cartItems.filter(
        (item) => !(item._id === id && item.type === type)
      ),
    });
  },

  updateQuantity: (id, type, operation) => {
    console.log(`📊 Updating quantity for ${id} (${type}): ${operation}`);
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

  clearCart: () => {
    console.log("🧹 Clearing cart");
    set({ cartItems: [] });
  },

  // Helper to get the correct price based on item type and currency
  getItemPrice: (item, currency = "INR") => {
    const type = item.type || "regular";

    console.log(`💰 Getting price for ${item.title || item.name}:`, {
      type,
      currency,
      examPriceInr: item.examPriceInr,
      examPriceUsd: item.examPriceUsd,
      priceINR: item.priceINR,
      priceUSD: item.priceUSD,
    });

    if (currency === "USD") {
      switch (type) {
        case "combo":
          return Number(item.comboPriceUsd) || Number(item.priceUSD) || 0;
        case "online":
          const usdPrice =
            Number(item.examPriceUsd) || Number(item.priceUSD) || 0;
          console.log(`  → Online USD price: ${usdPrice}`);
          return usdPrice;
        case "regular":
        default:
          return Number(item.dumpsPriceUsd) || Number(item.priceUSD) || 0;
      }
    } else {
      switch (type) {
        case "combo":
          return Number(item.comboPriceInr) || Number(item.priceINR) || 0;
        case "online":
          const inrPrice =
            Number(item.examPriceInr) || Number(item.priceINR) || 0;
          console.log(`  → Online INR price: ${inrPrice}`);
          return inrPrice;
        case "regular":
        default:
          return Number(item.dumpsPriceInr) || Number(item.priceINR) || 0;
      }
    }
  },

  // Get cart total in specific currency
  getCartTotal: (currency = "INR") => {
    const state = get();
    const total = state.cartItems.reduce((acc, item) => {
      const price = state.getItemPrice(item, currency);
      return acc + price * (item.quantity || 1);
    }, 0);

    console.log(`💵 Cart total (${currency}): ${total}`);
    return total;
  },

  // Get item count
  getItemCount: () => {
    const count = get().cartItems.reduce(
      (acc, item) => acc + (item.quantity || 1),
      0
    );
    return count;
  },
});

// Create store with persistence
const useCartStore = create(
  persist(cartStore, {
    name: "cart-storage",
    version: 5, // Increment version for updated validation
    migrate: (persistedState, version) => {
      if (version < 5) {
        console.log("🔄 Migrating cart store to version 5 - clearing old data");
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
          state.cartItems.forEach((item) => {
            console.log(`  - ${item.title} (${item.type}):`, {
              examPriceInr: item.examPriceInr,
              examPriceUsd: item.examPriceUsd,
              priceINR: item.priceINR,
              priceUSD: item.priceUSD,
            });
          });
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