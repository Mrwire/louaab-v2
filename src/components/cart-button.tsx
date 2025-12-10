"use client";

import { useState } from "react";
import { ShoppingCart, Plus, Minus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { useToyStock } from "@/contexts/stock-context";
import { ToyData } from "@/lib/toys-data";
import { formatDateInput } from "@/lib/date";

interface CartButtonProps {
  toy: ToyData;
  className?: string;
  allowDirectAdd?: boolean; // Nouvelle prop pour permettre l'ajout direct
}

export default function CartButton({ toy, className = "", allowDirectAdd = false }: CartButtonProps) {
  const router = useRouter();
  const { items, addToCart, removeFromCart, updateQuantity } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  // Durée par défaut pour l'ajout rapide
  const defaultDuration = "weekly";
  const toyKey = toy.backendId ?? String(toy.id);
  const itemId = `${toyKey}-${defaultDuration}`;

  // Real-time stock from WebSocket (fallback to static stock)
  const { stockQuantity: wsStock } = useToyStock(toyKey);
  const availableStock = Math.max(
    0,
    wsStock !== undefined ? wsStock : Number(
      toy.stockQuantity ??
      (toy as any).availableQuantity ??
      toy.stock ??
      0
    )
  );

  const cartItem = items.find(item => item.id === itemId);
  const isInCart = !!cartItem;

  const handleClick = () => {
    if (availableStock <= 0) return;
    // Si l'ajout direct n'est pas autorisé, rediriger vers la page de détail
    if (!allowDirectAdd) {
      router.push(`/jouets/${toy.slug}`);
      return;
    }

    // Sinon, ajouter directement avec les valeurs par défaut
    setIsAdding(true);

    // Valeurs par défaut pour l'ajout rapide
    const defaultDate = formatDateInput();

    addToCart(toy, defaultDuration, defaultDate);

    // Effet confetti simple
    const confettiCount = 20;
    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.innerHTML = '✅';
        confetti.style.position = 'fixed';
        confetti.style.left = `${Math.random() * window.innerWidth}px`;
        confetti.style.top = '-50px';
        confetti.style.fontSize = `${Math.random() * 15 + 12}px`;
        confetti.style.opacity = '1';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        confetti.style.transition = 'all 1.5s ease-out';
        document.body.appendChild(confetti);

        setTimeout(() => {
          confetti.style.top = `${window.innerHeight + 50}px`;
          confetti.style.left = `${parseInt(confetti.style.left) + (Math.random() - 0.5) * 150}px`;
          confetti.style.opacity = '0';
          confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        }, 10);

        setTimeout(() => {
          confetti.remove();
        }, 1500);
      }, i * 30);
    }

    // Animation de confirmation
    setTimeout(() => setIsAdding(false), 1000);
  };

  const handleRemoveFromCart = () => {
    removeFromCart(itemId);
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    updateQuantity(itemId, newQuantity);
  };

  if (!isInCart) {
    return (
      <button
        onClick={handleClick}
        disabled={isAdding || availableStock <= 0}
        className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium transition disabled:opacity-50 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95 ${className}`}
        style={{
          background: 'linear-gradient(to right, #1897aa, #0d74b1)',
          color: '#ffffff'
        }}
        title={availableStock > 0 ? (allowDirectAdd ? "Ajouter au panier" : "Configurer la location") : "Rupture de stock"}
      >
        {isAdding ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: '#ffffff', borderTopColor: 'transparent' }}></div>
        ) : (
          availableStock > 0 ? (
            <ShoppingCart className="h-4 w-4" style={{ color: '#ffffff' }} />
          ) : (
            <span className="text-xs font-semibold" style={{ color: '#ffffff' }}>Rupture</span>
          )
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleRemoveFromCart}
      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium transition shadow-md ${className}`}
      style={{
        background: 'linear-gradient(to right, #1897aa, #0d74b1)',
        color: '#ffffff',
        opacity: 0.8
      }}
      title="Dans le panier"
    >
      <span className="text-base" style={{ color: '#ffffff' }}>✅</span>
    </button>
  );
}
