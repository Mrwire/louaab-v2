"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ToyData } from "@/lib/toys-data";

export interface CartItem {
  id: string; // Identifiant unique: toyId-duration
  toy: ToyData;
  duration: string;
  startDate: string;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (toy: ToyData, duration: string, startDate: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<Pick<CartItem, "duration" | "startDate" | "quantity">>) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const toNumber = (value: any) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("louaab-cart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Erreur lors du chargement du panier:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("louaab-cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (toy: ToyData, duration: string, startDate: string, quantity: number = 1) => {
    setItems((prevItems) => {
      const toyKey = toy.backendId ?? String(toy.id);
      const itemId = `${toyKey}-${duration}`;

      const existingItem = prevItems.find((item) => item.id === itemId);

      if (existingItem) {
        return prevItems.map((item) =>
          item.id === itemId ? { ...item, startDate, quantity: item.quantity + quantity } : item,
        );
      } else {
        return [
          ...prevItems,
          {
            id: itemId,
            toy,
            duration,
            startDate,
            quantity: Math.max(1, quantity),
          },
        ];
      }
    });
  };

  const updateItem = (
    itemId: string,
    updates: Partial<Pick<CartItem, "duration" | "startDate" | "quantity">>,
  ) => {
    setItems((prevItems) => prevItems.map((item) => (item.id === itemId ? { ...item, ...updates } : item)));
  };

  const removeFromCart = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems((prevItems) => prevItems.map((item) => (item.id === itemId ? { ...item, quantity } : item)));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getUnitPrice = (item: CartItem) => {
    if (item.duration === "daily") return toNumber(item.toy.rentalPriceDaily);
    if (item.duration === "weekly") return toNumber(item.toy.rentalPriceWeekly);
    if (item.duration === "monthly") return toNumber(item.toy.rentalPriceMonthly);
    return toNumber(item.toy.rentalPriceDaily);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + getUnitPrice(item) * item.quantity, 0);
  };

  const getTotalItems = () => items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
