import { create } from "zustand";
import { persist } from "zustand/middleware";

let useCartStoreBase = (set, get) => ({
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
      // ✅ Store the complete product object with ALL fields
      const completeItem = {
        _id: item._id,
        title: item.title,
        name: item.name || item.title,

        // Pricing
        price: item.price,
        priceINR: item.priceINR || item.dumpsPriceInr,
        priceUSD: item.priceUSD || item.dumpsPriceUsd,
        dumpsPriceInr: item.dumpsPriceInr,
        dumpsPriceUsd: item.dumpsPriceUsd,
        dumpsMrpInr: item.dumpsMrpInr,
        dumpsMrpUsd: item.dumpsMrpUsd,
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

        // SEO
        metaTitle: item.metaTitle,
        metaKeywords: item.metaKeywords,
        metaDescription: item.metaDescription,
        schema: item.schema,

        // Additional fields
        productId: item.productId || item._id,
        type: item.type || "exam",
        quantity: 1,

        // Store any other fields that might exist
        ...item,

        // Ensure quantity is set correctly
        quantity: 1,
      };

      console.log("Stored complete item in cart:", completeItem);

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
});

// Persist cart data in local storage
useCartStoreBase = persist(useCartStoreBase, {
  name: "cart-storage",
});

const useCartStore = create(useCartStoreBase);

// Selector: total price
export const getCartTotal = () =>
  useCartStore
    .getState()
    .cartItems.reduce(
      (acc, item) =>
        acc + (item.priceINR || item.price || 0) * (item.quantity || 1),
      0
    );

export default useCartStore;
