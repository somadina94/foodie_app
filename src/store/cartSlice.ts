import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type CartLine = {
  mealId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
};

type CartState = { items: CartLine[] };

const initialState: CartState = { items: [] };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(
      state,
      action: PayloadAction<{
        mealId: string;
        name: string;
        price: number;
        imageUrl: string;
        quantity?: number;
      }>,
    ) {
      const q = Math.max(1, action.payload.quantity ?? 1);
      const existing = state.items.find((i) => i.mealId === action.payload.mealId);
      if (existing) {
        existing.quantity += q;
      } else {
        state.items.push({
          mealId: action.payload.mealId,
          name: action.payload.name,
          price: action.payload.price,
          imageUrl: action.payload.imageUrl,
          quantity: q,
        });
      }
    },
    setQuantity(state, action: PayloadAction<{ mealId: string; quantity: number }>) {
      const { mealId, quantity } = action.payload;
      const line = state.items.find((i) => i.mealId === mealId);
      if (!line) return;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.mealId !== mealId);
      } else {
        line.quantity = quantity;
      }
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.mealId !== action.payload);
    },
    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, setQuantity, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

export function selectCartItems(state: { cart: CartState }) {
  return state.cart.items;
}

export function selectCartSubtotal(state: { cart: CartState }) {
  return state.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function selectCartCount(state: { cart: CartState }) {
  return state.cart.items.reduce((n, i) => n + i.quantity, 0);
}
