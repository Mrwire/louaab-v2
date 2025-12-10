"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Clock, Plus, Minus, ShoppingCart, TrendingUp, X, Check } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { ToyData, getToyBySlug } from "@/lib/toys-data";
import { formatDateInput } from "@/lib/date";
import PricingSelector, { PricingOption } from "./pricing-selector";
import DatePicker from "./date-picker";

const TOY_PREF_KEY = "louaab-toy-preferences";

interface ToyDetailClientProps {
  toy: ToyData;
}



export default function ToyDetailClient({ toy: initialToy }: ToyDetailClientProps) {
  const { items, addToCart, removeFromCart, updateQuantity } = useCart();
  const [liveToy, setLiveToy] = useState<ToyData | null>(initialToy);
  const toy = liveToy ?? initialToy;
  const [selectedPricingType, setSelectedPricingType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [startDate, setStartDate] = useState(formatDateInput());

  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  // Keep toy data in sync with backend (live refresh)
  useEffect(() => {
    setLiveToy(initialToy);
  }, [initialToy]);

  useEffect(() => {
    let cancelled = false;

    const fetchLatest = async () => {
      try {
        const fresh = await getToyBySlug(initialToy.slug, { noCache: true, revalidateSeconds: 0 });
        if (!cancelled && fresh) {
          setLiveToy(fresh);
          console.debug("Live toy refresh:", fresh.slug, fresh.stockQuantity, fresh.price);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("Impossible de rafraîchir le jouet:", err);
        }
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 5000);

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchLatest();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [initialToy.slug]);

  const toyKey = toy.backendId ?? String(toy.id);
  const cartItemByDuration = items.find(item => item.id === `${toyKey}-${selectedPricingType}`);
  const cartItemFallback = items.find(item => (item.toy.backendId ?? String(item.toy.id)) === toyKey);
  const cartItem = cartItemByDuration ?? cartItemFallback;
  const itemId = cartItem?.id ?? `${toyKey}-${selectedPricingType}`;
  const isInCart = !!cartItem;
  const availableStock = Math.max(
    0,
    Number(
      toy.availableQuantity !== undefined
        ? toy.availableQuantity
        : (toy.stockQuantity ?? toy.stock ?? (cartItem?.toy?.stockQuantity ?? cartItem?.toy?.stock))
    ) || 0
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TOY_PREF_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const prefs = data?.[toyKey];
      if (prefs) {
        if (prefs.duration) {
          setSelectedPricingType(prefs.duration);
        }
        if (prefs.startDate) {
          setStartDate(prefs.startDate);
        }
        if (prefs.quantity) {
          setQuantity(Math.max(1, Number(prefs.quantity) || 1));
        }
      }
    } catch (error) {
      console.warn("Impossible de charger les préférences jouet:", error);
    }
  }, [toyKey]);

  useEffect(() => {
    if (!cartItem) return;
    if (cartItem.duration && cartItem.duration !== selectedPricingType) {
      setSelectedPricingType(cartItem.duration as 'daily' | 'weekly' | 'monthly');
    }
    if (cartItem.startDate) {
      setStartDate(cartItem.startDate);
    }
    if (cartItem.quantity && cartItem.quantity !== quantity) {
      setQuantity(cartItem.quantity);
    }
  }, [cartItem]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TOY_PREF_KEY);
      const prefs = raw ? JSON.parse(raw) : {};
      prefs[toyKey] = {
        duration: selectedPricingType,
        startDate,
        quantity,
      };
      localStorage.setItem(TOY_PREF_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.warn("Impossible d'enregistrer les préférences jouet:", error);
    }
  }, [selectedPricingType, startDate, quantity, toyKey]);

  // Créer les options de prix basées sur les données du jouet (depuis le backend ou valeurs par défaut)
  const dailyPrice = toy.rentalPriceDaily || parseFloat(toy.price?.replace(/[^\d.]/g, '') || '25');
  const weeklyPrice = toy.rentalPriceWeekly || (dailyPrice * 4.8);
  const monthlyPrice = toy.rentalPriceMonthly || (dailyPrice * 15);

  // Calculer les prix originaux et réductions si nécessaire
  const weeklyOriginalPrice = dailyPrice * 7;
  const weeklyDiscount = weeklyOriginalPrice - weeklyPrice;
  const weeklyDiscountPercentage = Math.round((weeklyDiscount / weeklyOriginalPrice) * 100);

  const monthlyOriginalPrice = dailyPrice * 30;
  const monthlyDiscount = monthlyOriginalPrice - monthlyPrice;
  const monthlyDiscountPercentage = Math.round((monthlyDiscount / monthlyOriginalPrice) * 100);

  const pricingOptions: PricingOption[] = [
    {
      type: 'daily',
      label: 'Location Journalière',
      shortLabel: 'Par jour',
      description: 'Parfait pour tester le jouet',
      price: dailyPrice,
      icon: Clock,
      color: 'bg-sky-blue',
      popular: false,
    },
    {
      type: 'weekly',
      label: 'Location Hebdomadaire',
      shortLabel: 'Par semaine',
      description: 'Meilleur rapport qualité/prix',
      price: weeklyPrice,
      originalPrice: weeklyOriginalPrice,
      discount: weeklyDiscount,
      discountPercentage: weeklyDiscountPercentage,
      icon: Calendar,
      color: 'bg-mint',
      popular: true,
    },
    {
      type: 'monthly',
      label: 'Location Mensuelle',
      shortLabel: 'Par mois',
      description: 'Maximum d\'économies pour une longue durée',
      price: monthlyPrice,
      originalPrice: monthlyOriginalPrice,
      discount: monthlyDiscount,
      discountPercentage: monthlyDiscountPercentage,
      icon: TrendingUp,
      color: 'bg-lilac',
      recommended: true,
    },
  ];

  const calculatePrice = () => {
    const selectedOption = pricingOptions.find(opt => opt.type === selectedPricingType);
    if (!selectedOption) return 0;

    let totalPrice = selectedOption.price * quantity;

    // Appliquer la promotion si active
    if (toy.promotion?.isActive) {
      if (toy.promotion.type === 'percentage') {
        const discount = totalPrice * (parseFloat(toy.promotion.value) / 100);
        totalPrice = totalPrice - discount;
      } else if (toy.promotion.type === 'fixed') {
        totalPrice = totalPrice - parseFloat(toy.promotion.value);
      }
    }

    return Math.max(0, totalPrice);
  };

  const getOriginalPrice = () => {
    const selectedOption = pricingOptions.find(opt => opt.type === selectedPricingType);
    if (!selectedOption) return 0;
    return selectedOption.originalPrice ? selectedOption.originalPrice * quantity : selectedOption.price * quantity;
  };

  const handleAddToCart = async () => {
    if (availableStock <= 0) return;
    setIsAdding(true);

    // Ajouter au panier avec les paramètres sélectionnés
    addToCart(toy, selectedPricingType, startDate, quantity);

    // Effet confetti
    const confettiColors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.innerHTML = '✅';
        confetti.style.position = 'fixed';
        confetti.style.left = `${Math.random() * window.innerWidth}px`;
        confetti.style.top = '-50px';
        confetti.style.fontSize = `${Math.random() * 20 + 15}px`;
        confetti.style.opacity = '1';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '9999';
        confetti.style.transition = 'all 2s ease-out';
        document.body.appendChild(confetti);

        setTimeout(() => {
          confetti.style.top = `${window.innerHeight + 50}px`;
          confetti.style.left = `${parseInt(confetti.style.left) + (Math.random() - 0.5) * 200}px`;
          confetti.style.opacity = '0';
          confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        }, 10);

        setTimeout(() => {
          confetti.remove();
        }, 2000);
      }, i * 30);
    }

    // Animation de confirmation
    setTimeout(() => setIsAdding(false), 1000);
  };

  const handleRemoveFromCart = () => {
    removeFromCart(itemId);
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    const capped = availableStock > 0 ? Math.min(availableStock, newQuantity) : 0;
    const safeQuantity = Math.max(1, capped || 1);
    setQuantity(safeQuantity);
    if (isInCart) {
      updateQuantity(itemId, safeQuantity);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sélecteur de prix moderne */}
      <PricingSelector
        pricingOptions={pricingOptions}
        selectedType={selectedPricingType}
        onTypeChange={setSelectedPricingType}
        quantity={quantity}
        onQuantityChange={handleUpdateQuantity}
      />

      {/* Configuration Section */}
      <div className="rounded-2xl bg-gradient-to-br from-mint/5 to-purple-50 p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">
          Configurez votre location
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Date */}
          <DatePicker
            value={startDate}
            onChange={setStartDate}
            label="Date de début"
            min={formatDateInput()}
            required
          />

          {/* Note: Heure de livraison supprimée car causait des bugs de suppression d'articles */}

        </div>
      </div>

      <div className="rounded-2xl border border-mist bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate">
            Total ({quantity} {quantity > 1 ? "articles" : "article"})
          </p>
          <p className="text-xl font-bold text-charcoal">
            {new Intl.NumberFormat("fr-MA", {
              style: "currency",
              currency: "MAD",
              maximumFractionDigits: 0,
            }).format(calculatePrice())}
          </p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {!isInCart ? (
          <button
            onClick={handleAddToCart}
            disabled={isAdding || availableStock <= 0}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-mint px-8 py-4 text-white font-semibold transition-all hover:bg-mint/90 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isAdding ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Ajout en cours...</span>
              </>
            ) : (
              <>
                {availableStock > 0 ? (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    <span>Ajouter au panier</span>
                  </>
                ) : (
                  <span className="text-sm font-semibold">Rupture de stock</span>
                )}
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleRemoveFromCart}
            className="
              flex-1 
              flex 
              items-center 
              justify-center 
              gap-2 
              rounded-xl 
              bg-fresh-green 
              px-8 
              py-4 
              text-white 
              font-semibold 
              transition-all 
              hover:bg-fresh-green/90 
              shadow-lg 
              hover:shadow-xl
              border-2 
              border-fresh-green/20
            "
          >
            <Check className="h-5 w-5" />
            <span>Dans le panier</span>
          </button>
        )}

        <Link
          href="/checkout"
          className="flex items-center justify-center gap-2 rounded-xl border-2 border-mint px-6 py-3 text-sm font-semibold text-mint transition hover:bg-mint/5"
        >
          <ShoppingCart className="h-4 w-4" />
          Voir le panier
        </Link>
      </div>
    </div>
  );
}

