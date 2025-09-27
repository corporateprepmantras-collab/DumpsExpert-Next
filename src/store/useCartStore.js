import { create } from "zustand";
import axios from "axios";

const useCartStore = create((set, get) => ({
  cartItems: [],
  isLoading: false,
  isLoggedIn: false,
  lastSynced: null,
  totalQuantity: 0,
  syncError: null,

  // Calculate total quantity
  calculateTotalQuantity: (items) => {
    return items.reduce((total, item) => total + (item.quantity || 1), 0);
  },

  // Set login status
  setLoginStatus: (status) => {
    set({ isLoggedIn: status });
    if (status) {
      get().syncWithServer();
    } else {
      // Clear cart when logged out
      set({ 
        cartItems: [], 
        totalQuantity: 0, 
        lastSynced: null 
      });
    }
  },

  // Sync cart with server (server is source of truth)
  syncWithServer: async () => {
    const { isLoggedIn } = get();
    if (!isLoggedIn) {
      set({ cartItems: [], totalQuantity: 0 });
      return;
    }

    try {
      set({ isLoading: true, syncError: null });
      
      const response = await axios.get("/api/cart");
      const serverItems = response.data.items || [];
      
      set({ 
        cartItems: serverItems,
        lastSynced: new Date(),
        totalQuantity: get().calculateTotalQuantity(serverItems),
        syncError: null
      });
      
      return serverItems;
    } catch (error) {
      console.error("Failed to sync cart with server:", error);
      set({ syncError: "Failed to sync with server" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (item) => {
    const { isLoggedIn } = get();
    if (!isLoggedIn) {
      console.warn("User not logged in, cannot add to cart");
      return;
    }

    try {
      set({ isLoading: true });
      
      const response = await axios.post("/api/cart/item", item);
      
      if (response.data && response.data.items) {
        set({ 
          cartItems: response.data.items,
          totalQuantity: get().calculateTotalQuantity(response.data.items),
          lastSynced: new Date()
        });
      }
      
      return response.data.items;
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      set({ syncError: "Failed to add item" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  removeFromCart: async (id, type) => {
    const { isLoggedIn } = get();
    if (!isLoggedIn) {
      console.warn("User not logged in, cannot remove from cart");
      return;
    }

    try {
      set({ isLoading: true });
      
      // Use the item's _id for deletion (not productId)
      const response = await axios.delete(`/api/cart/item?id=${id}&type=${type}`);
      
      if (response.data && response.data.items !== undefined) {
        set({ 
          cartItems: response.data.items,
          totalQuantity: get().calculateTotalQuantity(response.data.items),
          lastSynced: new Date()
        });
      }
      
      return response.data.items;
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      set({ syncError: "Failed to remove item" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (id, type, operation) => {
    const { isLoggedIn } = get();
    if (!isLoggedIn) {
      console.warn("User not logged in, cannot update quantity");
      return;
    }
  
    try {
      set({ isLoading: true });
      
      // Find the item in current cart to get the correct productId
      const currentItems = get().cartItems;
      const item = currentItems.find(item => item._id === id && item.type === type);
      
      if (!item) {
        console.error("Item not found in local cart");
        throw new Error("Item not found in local cart");
      }
      
      // Use the actual productId from the item, not the _id
      const response = await axios.patch("/api/cart/item", { 
        productId: item.productId || item._id, // Use productId if available, fallback to _id
        type, 
        operation 
      });
      
      if (response.data && response.data.items) {
        set({ 
          cartItems: response.data.items,
          totalQuantity: get().calculateTotalQuantity(response.data.items),
          lastSynced: new Date()
        });
      }
      
      return response.data.items;
    } catch (error) {
      console.error("Failed to update quantity:", error);
      set({ syncError: "Failed to update quantity" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    const { isLoggedIn } = get();
    if (!isLoggedIn) return;

    try {
      set({ isLoading: true });
      
      await axios.post("/api/cart", { items: [] });
      
      set({ 
        cartItems: [],
        totalQuantity: 0,
        lastSynced: new Date()
      });
    } catch (error) {
      console.error("Failed to clear cart:", error);
      set({ syncError: "Failed to clear cart" });
    } finally {
      set({ isLoading: false });
    }
  },

  // Force refresh from server
  refreshCart: async () => {
    return get().syncWithServer();
  }
}));

// Selector: Total Price
export const getCartTotal = () =>
  useCartStore
    .getState()
    .cartItems.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 1),
      0
    );

// Selector: Total Quantity
export const getCartQuantity = () => {
  const items = useCartStore.getState().cartItems;
  return items.reduce((total, item) => total + (item.quantity || 1), 0);
};

// Selector: Has in cart
export const hasInCart = (id, type) => {
  return !!useCartStore
    .getState()
    .cartItems.find((item) => item._id === id && item.type === type);
};

export default useCartStore;
