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
      
      // Always use server items as source of truth
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
      throw error; // Re-throw to allow error handling in components
    } finally {
      set({ isLoading: false });
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
      const response = await axios.delete(`/api/cart/item`, {
        params: { id, type }
      });
      
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
        operation,
        quantity: updatedItems.find(i => i._id === id && i.type === type)?.quantity
      });
      
      // Update with server response
      if (response.data?.items) {
        set({ 
          cartItems: response.data.items,
          totalQuantity: get().calculateTotalQuantity(response.data.items)
        });
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
useCartStoreBase = persist(useCartStoreBase, {
  name: "cart-storage",
  partialize: (state) => ({
    // Only persist these fields
    cartItems: state.cartItems,
    totalQuantity: state.totalQuantity,
    lastSynced: state.lastSynced
  }),
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
