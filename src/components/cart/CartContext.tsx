"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { CartItem } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[];
}

/**
 * Every state change in the cart is expressed as one of these action objects.
 * The reducer function handles each action type to produce the next state.
 */
type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { productId: string; variantId?: string } }
  | { type: "UPDATE_QUANTITY"; payload: { productId: string; variantId?: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "HYDRATE"; payload: CartItem[] }; // Restores cart from localStorage on first load

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Checks whether two cart items refer to the same product+variant combination.
 * A cart can have the same product in multiple rows if the variants differ
 * (e.g., same shoe in size 37 and size 38 are two separate line items).
 */
function isSameCartItem(
  item: CartItem,
  productId: string,
  variantId?: string
): boolean {
  return item.productId === productId && item.variantId === variantId;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

/**
 * Pure function that handles all cart state transitions.
 * Each case returns a new state object — nothing is mutated in place.
 */
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE": {
      // Restore cart state from persisted localStorage data
      return { items: action.payload };
    }

    case "ADD_ITEM": {
      const { productId, variantId, quantity } = action.payload;
      const existingItem = state.items.find((item) =>
        isSameCartItem(item, productId, variantId)
      );

      if (existingItem) {
        // Item already in cart — increase its quantity
        return {
          items: state.items.map((item) =>
            isSameCartItem(item, productId, variantId)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }

      // New item — append to the end of the cart
      return { items: [...state.items, action.payload] };
    }

    case "REMOVE_ITEM": {
      const { productId, variantId } = action.payload;
      return {
        items: state.items.filter(
          (item) => !isSameCartItem(item, productId, variantId)
        ),
      };
    }

    case "UPDATE_QUANTITY": {
      const { productId, variantId, quantity } = action.payload;

      // Treat a quantity of 0 or less as a remove action
      if (quantity <= 0) {
        return {
          items: state.items.filter(
            (item) => !isSameCartItem(item, productId, variantId)
          ),
        };
      }

      return {
        items: state.items.map((item) =>
          isSameCartItem(item, productId, variantId)
            ? { ...item, quantity }
            : item
        ),
      };
    }

    case "CLEAR_CART": {
      return { items: [] };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

/** The shape of the value exposed to all components that consume the CartContext */
interface CartContextValue {
  /** All line items currently in the cart */
  items: CartItem[];
  /** Total number of individual units across all line items */
  itemCount: number;
  /** Total price of all items before delivery charge */
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** localStorage key used to persist the cart between browser sessions */
const CART_STORAGE_KEY = "devwonder_cart";

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * Wraps the app and makes cart state available to all child components.
 * Persists cart items to localStorage automatically on every change.
 * Restores cart from localStorage when the app first loads.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // On first render, restore the cart from localStorage (client-side only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const restoredItems = JSON.parse(stored) as CartItem[];
        dispatch({ type: "HYDRATE", payload: restoredItems });
      }
    } catch {
      // If parsing fails (e.g., corrupted data), start with an empty cart
    }
  }, []);

  // Persist the cart to localStorage whenever the items array changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  // Wrap each dispatch call in a stable useCallback so child components
  // don't re-render unnecessarily when the parent CartProvider re-renders
  const addItem = useCallback((item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item });
  }, []);

  const removeItem = useCallback((productId: string, variantId?: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { productId, variantId } });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string) => {
      dispatch({ type: "UPDATE_QUANTITY", payload: { productId, variantId, quantity } });
    },
    []
  );

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR_CART" });
  }, []);

  // Derived values computed from state — no need to store these separately
  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Convenience hook for consuming cart state and actions in any client component.
 * Must be used inside a <CartProvider>.
 *
 * @example
 * const { items, addItem, subtotal } = useCart();
 */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a <CartProvider>");
  return ctx;
}
