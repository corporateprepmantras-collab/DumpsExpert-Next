import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

let useCartStoreBase = (set, get) => ({
  cartItems: [],
  isLoading: false,
  isLoggedIn: false,
  lastSynced: null,

  // Set login status
  setLoginStatus: (status) => {
    set({ isLoggedIn: status });
    if (status) {
      get().syncWithServer();
    }
  },

  // Sync cart with server
  syncWithServer: async () => {
    const { isLoggedIn } = get();
    if (!isLoggedIn) return;

    try {
      set({ isLoading: true });
      
      // Get server cart
      const response = await axios.get("/api/cart");
      const serverItems = response.data.items || [];
      
      // Merge with local cart if needed
      const localItems = get().cartItems;
      
      if (localItems.length > 0 && (get().lastSynced === null)) {
        // First sync after login - push local items to server
        await axios.post("/api/cart", { items: localItems });
        set({ lastSynced: new Date() });
      } else {
        // Regular sync - use server items
        set({ 
          cartItems: serverItems,
          lastSynced: new Date()
        });
      }
    } catch (error) {
      console.error("Failed to sync cart with server:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (item) => {
    console.log("Incoming Item:", item);
    
    // Check if user is logged in
    const { isLoggedIn } = get();
    if (!isLoggedIn) {
      // Return false to indicate login required
      return { success: false, message: "Please login or create an account to add items to cart" };
    }
    
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
    
    // Sync with server if logged in
    try {
      await axios.post("/api/cart/item", item);
    } catch (error) {
      console.error("Failed to sync cart item with server:", error);
    }
    
    return { success: true };
  },

  removeFromCart: async (id, type) => {
    set({
      cartItems: get().cartItems.filter(
        (item) => !(item._id === id && item.type === type)
      ),
    });
    
    // Sync with server if logged in
    const { isLoggedIn } = get();
    if (isLoggedIn) {
      try {
        await axios.delete(`/api/cart/item?id=${id}&type=${type}`);
      } catch (error) {
        console.error("Failed to remove cart item from server:", error);
      }
    }
  },

  updateQuantity: async (id, type, operation) => {
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
    
    // Sync with server if logged in
    const { isLoggedIn } = get();
    if (isLoggedIn) {
      try {
        await axios.patch("/api/cart/item", { productId: id, type, operation });
      } catch (error) {
        console.error("Failed to update cart item on server:", error);
      }
    }
  },

  clearCart: async () => {
    set({ cartItems: [] });
    
    // Sync with server if logged in
    const { isLoggedIn } = get();
    if (isLoggedIn) {
      try {
        await axios.post("/api/cart", { items: [] });
      } catch (error) {
        console.error("Failed to clear cart on server:", error);
      }
    }
  },
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
