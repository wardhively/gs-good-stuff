"use client";

import { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  variety_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  photo_url?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (variety_id: string) => void;
  updateQuantity: (variety_id: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch(e) {}
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find(i => i.variety_id === item.variety_id);
      if (existing) {
        return prev.map(i => i.variety_id === item.variety_id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (variety_id: string) => setItems(prev => prev.filter(i => i.variety_id !== variety_id));
  
  const updateQuantity = (variety_id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(variety_id);
      return;
    }
    setItems(prev => prev.map(i => i.variety_id === variety_id ? { ...i, quantity: qty } : i));
  };
  
  const clearCart = () => setItems([]);

  const cartTotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error("useCart must be used within a CartProvider");
  return context;
}
