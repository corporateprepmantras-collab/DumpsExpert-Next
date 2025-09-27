import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

let useCartStoreBase = (set, get) => ({
  cartItems: [],
  isLoading: false,
  isLoggedIn: false,
  lastSynced: null,
  totalQuantity: 0,
  syncError: null, // Add this to track sync errors

  // Calculate total quantity
  calculateTotalQuantity: (items) => {
    return items.reduce((total, item) => total + (item.quantity || 1), 0);
  },

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
      set({ isLoading: true, syncError: null });
      
      // Get server cart
      const response = await axios.get("/api/cart");
      const serverItems = response.data.items || [];
      
      // Always prioritize server state over local storage
      set({ 
        cartItems: serverItems,
        lastSynced: new Date(),
        totalQuantity: get().calculateTotalQuantity(serverItems),
        syncError: null
      });
      
      // Force update local storage with server data
      localStorage.setItem('cart-storage', JSON.stringify({
        state: {
          cartItems: serverItems,
          totalQuantity: get().calculateTotalQuantity(serverItems),
          lastSynced: new Date()
        },
        version: 0
      }));
      
      return serverItems;
    } catch (error) {
      console.error("Failed to sync cart with server:", error);
      set({ syncError: "Failed to sync with server" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Add method to force sync and clear conflicts
  forceSyncWithServer: async () => {
    const { isLoggedIn } = get();
    if (!isLoggedIn) return;
    
    try {
      // Clear local storage first
      localStorage.removeItem('cart-storage');
      
      // Fetch fresh data from server
      const response = await axios.get("/api/cart");
      const serverItems = response.data.items || [];
      
      set({
        cartItems: serverItems,
        totalQuantity: get().calculateTotalQuantity(serverItems),
        lastSynced: new Date(),
        syncError: null
      });
      
      return serverItems;
    } catch (error) {
      console.error("Force sync failed:", error);
      throw error;
    }
  },

  addToCart: async (item) => {
    console.log("Adding item to cart:", item);
    const existing = get().cartItems.find(
      (i) => i._id === item._id && i.type === item.type
    );
    
    let updatedItems;
    if (existing) {
      updatedItems = get().cartItems.map((i) =>
        i._id === item._id && i.type === item.type
          ? { ...i, quantity: (i.quantity || 1) + 1 }
          : i
      );
    } else {
      updatedItems = [...get().cartItems, { ...item, quantity: 1 }];
    }
    
    // Update local state first
    set({
      cartItems: updatedItems,
      totalQuantity: get().calculateTotalQuantity(updatedItems)
    });
    
    // Sync with server if logged in
    const { isLoggedIn } = get();
    if (isLoggedIn) {
      try {
        // Send the complete item with quantity
        const itemToSend = existing 
          ? { ...item, quantity: (existing.quantity || 1) + 1 }
          : { ...item, quantity: 1 };
          
        const response = await axios.post("/api/cart/item", itemToSend);
        
        // Update state with server response to ensure sync
        if (response.data && response.data.items) {
          set({ 
            cartItems: response.data.items,
            totalQuantity: get().calculateTotalQuantity(response.data.items)
          });
        }
      } catch (error) {
        console.error("Failed to sync cart item with server:", error);
      }
    }
  },

  removeFromCart: async (id, type) => {
    const { isLoggedIn } = get();
    const originalItems = [...get().cartItems];
    
    // Optimistic UI update
    const updatedItems = originalItems.filter(
      (item) => !(item._id === id && item.type === type)
    );
    
    set({
      cartItems: updatedItems,
      totalQuantity: get().calculateTotalQuantity(updatedItems)
    });
    
    if (!isLoggedIn) return;
    
    try {
      // FIX: Use query parameters in URL instead of params object
      const response = await axios.delete(`/api/cart/item?id=${id}&type=${type}`);
      
      // Update with server response
      if (response.data?.items) {
        set({ 
          cartItems: response.data.items,
          totalQuantity: get().calculateTotalQuantity(response.data.items)
        });
      }
      return response.data?.items || updatedItems;
    } catch (error) {
      console.error("Failed to remove item:", error);
      // Revert on error
      set({
        cartItems: originalItems,
        totalQuantity: get().calculateTotalQuantity(originalItems)
      });
      throw error; // Re-throw to allow error handling in components
    }
  },

  updateQuantity: async (id, type, operation) => {
    const { isLoggedIn } = get();
    const originalItems = [...get().cartItems];
    
    // Calculate new quantity
    const updatedItems = originalItems.map((item) => {
      if (item._id === id && item.type === type) {
        const newQty = operation === "inc"
          ? (item.quantity || 1) + 1
          : Math.max(1, (item.quantity || 1) - 1);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    
    // Optimistic UI update
    set({
      cartItems: updatedItems,
      totalQuantity: get().calculateTotalQuantity(updatedItems)
    });
    
    if (!isLoggedIn) return;
    
    try {
      const response = await axios.patch("/api/cart/item", { 
        productId: id, 
        type, 
        operation
      });
      
      // Update with server response and force local storage update
      if (response.data?.items) {
        const serverItems = response.data.items;
        const newTotalQuantity = get().calculateTotalQuantity(serverItems);
        
        set({ 
          cartItems: serverItems,
          totalQuantity: newTotalQuantity
        });
        
        // Force update local storage
        localStorage.setItem('cart-storage', JSON.stringify({
          state: {
            cartItems: serverItems,
            totalQuantity: newTotalQuantity,
            lastSynced: new Date()
          },
          version: 0
        }));
      }
      return response.data?.items || updatedItems;
    } catch (error) {
      console.error("Failed to update quantity:", error);
      // Revert on error
      set({
        cartItems: originalItems,
        totalQuantity: get().calculateTotalQuantity(originalItems)
      });
      throw error; // Re-throw to allow error handling in components
    }
  },

  // Add a method to clear local storage persistence
  clearLocalStorage: () => {
    localStorage.removeItem("cart-storage");
    set({ 
      cartItems: [],
      totalQuantity: 0,
      lastSynced: null
    });
  },

  clearCart: async () => {
    set({ 
      cartItems: [],
      totalQuantity: 0
    });
    
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
// Enhanced persist configuration
useCartStoreBase = persist(useCartStoreBase, {
  name: "cart-storage",
  partialize: (state) => ({
    cartItems: state.cartItems,
    totalQuantity: state.totalQuantity,
    lastSynced: state.lastSynced
  }),
  // Add merge function to handle conflicts
  merge: (persistedState, currentState) => {
    // If user is logged in, prioritize server state
    if (currentState.isLoggedIn && persistedState.lastSynced) {
      const timeDiff = new Date() - new Date(persistedState.lastSynced);
      // If last sync was more than 5 minutes ago, don't use persisted state
      if (timeDiff > 5 * 60 * 1000) {
        return currentState;
      }
    }
    return { ...currentState, ...persistedState };
  }
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
