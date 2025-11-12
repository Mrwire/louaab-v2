"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ToyData } from '@/lib/toys-data';

export interface CartItem {
  id: string; // Identifiant unique: toyId-duration
  toy: ToyData;
  duration: string;
  startDate: string;
  quantity: number;
}

export interface CartContextType {
  items: CartItem[];
  addToCart: (toy: ToyData, duration: string, startDate: string) => void;
  removeFromCart: (itemId: string) => void;
  updateItem: (itemId: string, updates: Partial<Pick<CartItem, 'duration' | 'startDate' | 'quantity'>>) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    const savedCart = localStorage.getItem('louaab-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
      }
    }
  }, []);

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('louaab-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (toy: ToyData, duration: string, startDate: string) => {
    setItems(prevItems => {
      // Créer un identifiant unique basé sur le toy.id et la durée
      const itemId = `${toy.id}-${duration}`;
      
      // Chercher un item existant avec le même ID
      const existingItem = prevItems.find(item => item.id === itemId);
      
      if (existingItem) {
        // Incrémenter la quantité de l'item existant
        return prevItems.map(item =>
          item.id === itemId
            ? { ...item, startDate, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Ajouter un nouvel item avec un ID unique
        return [...prevItems, { 
          id: itemId,
          toy, 
          duration, 
          startDate, 
          quantity: 1 
        }];
      }
    });
  };

  const updateItem = (itemId: string, updates: Partial<Pick<CartItem, 'duration' | 'startDate' | 'quantity'>>) => {
    setItems(prevItems => prevItems.map(item => item.id === itemId ? { ...item, ...updates } : item));
  };

  const removeFromCart = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      // Préférer les champs de prix spécifiques si disponibles
      let unitPrice = 0;
      if (item.duration === 'daily' && typeof item.toy.rentalPriceDaily === 'number') {
        unitPrice = item.toy.rentalPriceDaily;
      } else if (item.duration === 'weekly' && typeof item.toy.rentalPriceWeekly === 'number') {
        unitPrice = item.toy.rentalPriceWeekly;
      } else if (item.duration === 'monthly' && typeof item.toy.rentalPriceMonthly === 'number') {
        unitPrice = item.toy.rentalPriceMonthly;
      } else {
        // Fallback: parser le champ string "price"
        unitPrice = parseFloat(item.toy.price?.replace(/[^\d.]/g, '') || '0');
        // Appliquer un multiplicateur si la durée est sémantique
        if (item.duration === 'weekly') unitPrice = unitPrice * 1; // déjà hebdo
        else if (item.duration === 'monthly') unitPrice = unitPrice * (15 / 4.8); // approx depuis hebdo
      }

      const itemTotal = unitPrice * item.quantity;
      return total + itemTotal;
    }, 0);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

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
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
