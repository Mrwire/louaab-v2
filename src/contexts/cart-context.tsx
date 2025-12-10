"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ToyData } from "@/lib/toys-data";

export type DurationType = "weekly" | "biweekly" | "monthly";

export interface CartItem {
  id: string; // Identifiant unique: toyId-duration
  toy: ToyData;
  duration: string;
  startDate: string;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  orderDuration: DurationType;
  orderStartDate: string;
  setOrderDuration: (duration: DurationType) => void;
  setOrderStartDate: (date: string) => void;
  addToCart: (toy: ToyData, duration: string, startDate: string, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<Pick<CartItem, "duration" | "startDate" | "quantity">>) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalDeposit: () => number;
  getDeliveryFee: () => number;
  getGrandTotal: () => number;
  getTotalItems: () => number;
}

const DELIVERY_FEE = 25; // 25 DHS
const FREE_DELIVERY_THRESHOLD = 400; // Free delivery if total >= 400 DHS

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
  const [orderDuration, setOrderDuration] = useState<DurationType>("weekly");
  const [orderStartDate, setOrderStartDate] = useState<string>("");

  useEffect(() => {
    const savedCart = localStorage.getItem("louaab-cart");
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setItems(parsed.items || []);
        setOrderDuration(parsed.orderDuration || "weekly");
        setOrderStartDate(parsed.orderStartDate || "");
      } catch (error) {
        console.error("Erreur lors du chargement du panier:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("louaab-cart", JSON.stringify({
      items,
      orderDuration,
      orderStartDate,
    }));
  }, [items, orderDuration, orderStartDate]);

  const addToCart = (toy: ToyData, duration: string, startDate: string, quantity: number = 1) => {
    const availableStock = Number(toy.availableQuantity ?? toy.stockQuantity ?? toy.stock ?? 0);
    if (availableStock <= 0) return;

    setItems((prevItems) => {
      const toyKey = toy.backendId ?? String(toy.id);
      const itemId = `${toyKey}-${orderDuration}`; // Use order-level duration

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
            duration: orderDuration, // Use order-level duration
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
    setOrderDuration("weekly");
    setOrderStartDate("");
  };

  // Get unit price based on ORDER-level duration (not item-level)
  const getItemPrice = (item: CartItem) => {
    if (orderDuration === "weekly") return toNumber(item.toy.rentalPriceWeekly);
    if (orderDuration === "biweekly") return toNumber(item.toy.rentalPriceWeekly) * 2 * 0.9; // 10% discount for 2 weeks
    if (orderDuration === "monthly") return toNumber(item.toy.rentalPriceMonthly);
    return toNumber(item.toy.rentalPriceWeekly);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + getItemPrice(item) * item.quantity, 0);
  };

  // Calculate total deposit (caution) for all items
  const getTotalDeposit = () => {
    return items.reduce((total, item) => {
      const deposit = toNumber(item.toy.depositAmount ?? 0);
      return total + deposit * item.quantity;
    }, 0);
  };

  // Delivery fee: 25 DHS if subtotal < 400 DHS, else FREE
  const getDeliveryFee = () => {
    const subtotal = getTotalPrice();
    return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  };

  // Grand total = Location + Caution + Livraison
  const getGrandTotal = () => {
    return getTotalPrice() + getTotalDeposit() + getDeliveryFee();
  };

  const getTotalItems = () => items.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        orderDuration,
        orderStartDate,
        setOrderDuration,
        setOrderStartDate,
        addToCart,
        removeFromCart,
        updateItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalDeposit,
        getDeliveryFee,
        getGrandTotal,
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

