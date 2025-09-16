import { create } from "zustand";

export type CartItem = {
  _id: string;
  title: string;
  price: number; // minor units
  image?: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (p: Omit<CartItem, "quantity">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: () => number;
};

export const useCart = create<CartState>((set, get) => ({
  items: [],
  add: (p, qty = 1) =>
    set((s) => {
      const idx = s.items.findIndex((x) => x._id === p._id);
      if (idx >= 0) {
        const clone = [...s.items];
        clone[idx] = { ...clone[idx], quantity: clone[idx].quantity + qty };
        return { items: clone };
      }
      return { items: [...s.items, { ...p, quantity: qty }] };
    }),
  remove: (id) => set((s) => ({ items: s.items.filter((x) => x._id !== id) })),
  setQty: (id, qty) =>
    set((s) => ({
      items: s.items.map((x) => (x._id === id ? { ...x, quantity: qty } : x)),
    })),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));
