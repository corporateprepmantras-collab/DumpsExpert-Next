import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

let useCartStoreBase = (set, get) => ({
  cartItems: [],
  isLoading: false,
  isLoggedIn: false,
  lastSynced: null,
  totalQuantity: 0, // Added to track total quantity

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
      set({ isLoading: true });
      
      // Get server cart
      const response = await axios.get("/api/cart");
      const serverItems = response.data.items || [];
      
      // Merge with local cart if needed
      const localItems = get().cartItems;
      
      if (localItems.length > 0 && (get().lastSynced === null)) {
        // First sync after login - push local items to server
        await axios.post("/api/cart", { items: localItems });
        set({ 
          cartItems: localItems,
          lastSynced: new Date(),
          totalQuantity: get().calculateTotalQuantity(localItems)
        });
      } else {
        // Regular sync - use server items
        set({ 
          cartItems: serverItems,
          lastSynced: new Date(),
          totalQuantity: get().calculateTotalQuantity(serverItems)
        });
      }
    } catch (error) {
      console.error("Failed to sync cart with server:", error);
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
    // Store original items for rollback if needed
    const originalItems = [...get().cartItems];
    
    // Update local state first
    const updatedItems = get().cartItems.filter(
      (item) => !(item._id === id && item.type === type)
    );
    
    set({
      cartItems: updatedItems,
      totalQuantity: get().calculateTotalQuantity(updatedItems)
    });
    
    // Sync with server if logged in
    const { isLoggedIn } = get();
    if (isLoggedIn) {
      try {
        console.log(`Removing item: id=${id}, type=${type}`);
        const response = await axios.delete(`/api/cart/item?id=${id}&type=${type}`);
        
        // Update state with server response to ensure sync
        if (response.data && response.data.items) {
          set({ 
            cartItems: response.data.items,
            totalQuantity: get().calculateTotalQuantity(response.data.items)
          });
        }
      } catch (error) {
        console.error("Failed to remove cart item from server:", error);
        // Rollback to original state if server sync fails
        set({
          cartItems: originalItems,
          totalQuantity: get().calculateTotalQuantity(originalItems)
        });
        // You could also show a notification to the user here
      }
    }
  },

  updateQuantity: async (id, type, operation) => {
    // Store original items for rollback if needed
    const originalItems = [...get().cartItems];
    
    // Update local state first
    const updatedItems = get().cartItems.map((item) => {
      if (item._id === id && item.type === type) {
        const updatedQty =
          operation === "inc"
            ? (item.quantity || 1) + 1
            : Math.max(1, (item.quantity || 1) - 1);
        return { ...item, quantity: updatedQty };
      }
      return item;
    });
    
    set({
      cartItems: updatedItems,
      totalQuantity: get().calculateTotalQuantity(updatedItems)
    });
    
    // Sync with server if logged in
    const { isLoggedIn } = get();
    if (isLoggedIn) {
      try {
        console.log(`Updating quantity: id=${id}, type=${type}, operation=${operation}`);
        const response = await axios.patch("/api/cart/item", { productId: id, type, operation });
        
        // Update state with server response to ensure sync
        if (response.data && response.data.items) {
          set({ 
            cartItems: response.data.items,
            totalQuantity: get().calculateTotalQuantity(response.data.items)
          });
        }
      } catch (error) {
        console.error("Failed to update cart item on server:", error);
        // Rollback to original state if server sync fails
        set({
          cartItems: originalItems,
          totalQuantity: get().calculateTotalQuantity(originalItems)
        });
        // You could also show a notification to the user here
      }
    }
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
