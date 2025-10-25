import { create } from "zustand";
import { persist } from "zustand/middleware";

let useCartStoreBase = (set, get) => ({
  cartItems: [],

  addToCart: (item) => {
    console.log("Incoming Item:", item);
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
      set({
        cartItems: [...get().cartItems, { ...item, quantity: 1 }],
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

// Wrap state in persist
useCartStoreBase = persist(useCartStoreBase, {
  name: "cart-storage",
});

const useCartStore = create(useCartStoreBase);

// Selector: Total Price
export const getCartTotal = () =>
  useCartStore
    .getState()
    .cartItems.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
      0
    );

// Selector: Has in cart
export const hasInCart = (id, type) => {
  return !!useCartStore
    .getState()
    .cartItems.find((item) => item._id === id && item.type === type);
};

export default useCartStore;
