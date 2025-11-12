"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/cart-context";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { OrderManager, Order } from "@/lib/orders";
import { Calendar, Clock, Trash2, CheckCircle, ArrowLeft } from "lucide-react";
import DatePicker from "@/components/date-picker";

const durations = [
  { value: "daily", label: "1 jour", multiplier: 1 },
  { value: "weekly", label: "1 semaine", multiplier: 4.8 },
  { value: "monthly", label: "1 mois", multiplier: 15 },
];

export default function CheckoutPage() {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart, updateItem } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryPostalCode, setDeliveryPostalCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleUpdateItem = (itemId: string, field: string, value: string) => {
    const item = items.find(item => item.id === itemId);
    if (!item) return;

    if (field === 'quantity') {
      updateQuantity(itemId, parseInt(value));
    } else {
      // Mettre à jour l'item en place (duration, startDate)
      if (typeof updateItem === 'function') {
        updateItem(itemId, { [field]: value } as any);
      } else {
        // Fallback: remove and re-add isn't ideal; just log
        console.warn('updateItem not available in cart context');
      }
    }
  };

  const handleSubmit = async () => {
    if (!customerName || !customerPhone || !deliveryAddress || !deliveryCity) {
      alert("Veuillez remplir toutes les informations obligatoires");
      return;
    }

    if (items.length === 0) {
      alert("Votre panier est vide");
      return;
    }

    setIsSubmitting(true);

    try {
      // Créer la commande
      const orderId = OrderManager.generateOrderId();
      const orderItems = items.map(item => {
        // Calcul basé sur les champs de prix spécifiques si présents
        let unitPrice = 0;
        if (item.duration === 'daily' && typeof item.toy.rentalPriceDaily === 'number') {
          unitPrice = item.toy.rentalPriceDaily;
        } else if (item.duration === 'weekly' && typeof item.toy.rentalPriceWeekly === 'number') {
          unitPrice = item.toy.rentalPriceWeekly;
        } else if (item.duration === 'monthly' && typeof item.toy.rentalPriceMonthly === 'number') {
          unitPrice = item.toy.rentalPriceMonthly;
        } else {
          // Fallback: parser la chaîne "price" (souvent hebdomadaire)
          unitPrice = parseFloat(item.toy.price?.replace(/[^\d.]/g, '') || '0');
          if (item.duration === 'monthly') unitPrice = unitPrice * (15 / 4.8);
        }

        const itemTotal = unitPrice * item.quantity;
        const durationLabel = durations.find(d => d.value === item.duration)?.label || item.duration;
        
        return {
          toyName: item.toy.name,
          duration: durationLabel,
          startDate: item.startDate,
          quantity: item.quantity,
          price: itemTotal
        };
      });

      const order: Order = {
        id: orderId,
        customerName,
        customerPhone,
        deliveryAddress: `${deliveryAddress}, ${deliveryPostalCode} ${deliveryCity}`,
        items: orderItems,
        totalPrice: getTotalPrice(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        notes: `Commande créée le ${new Date().toLocaleDateString('fr-FR')}`
      };

      // Sauvegarder la commande
      OrderManager.saveOrder(order);
      
      // Vider le panier
      clearCart();
      
      // Afficher la confirmation
      setOrderId(orderId);
      setOrderSubmitted(true);
      
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSubmitted) {
    return (
      <PageShell>
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-charcoal mb-4">
              Commande confirmée !
            </h1>
            <p className="text-slate mb-6">
              Votre commande <span className="font-semibold text-mint">{orderId}</span> a été enregistrée avec succès.
            </p>
            <div className="rounded-xl bg-gradient-to-r from-mint/5 to-purple-50 p-6 mb-8">
              <h2 className="text-lg font-semibold text-charcoal mb-4">
                Prochaines étapes
              </h2>
              <div className="space-y-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mint text-white text-sm font-semibold">1</div>
                  <p className="text-slate">Votre commande sera traitée par notre équipe</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mint text-white text-sm font-semibold">2</div>
                  <p className="text-slate">Un de nos agents vous contactera dans les 24h</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mint text-white text-sm font-semibold">3</div>
                  <p className="text-slate">Nous confirmerons la disponibilité et les détails</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/jouets"
                className="inline-flex items-center gap-2 rounded-full bg-mint px-6 py-3 font-semibold text-white transition hover:bg-mint/90"
              >
                Continuer mes achats
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border-2 border-mint px-6 py-3 font-semibold text-mint transition hover:bg-mint/5"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </PageShell>
    );
  }

  if (items.length === 0) {
    return (
      <PageShell>
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-3xl font-bold text-charcoal mb-4">
              Votre panier est vide
            </h1>
            <p className="text-slate mb-8">
              Découvrez nos jouets et ajoutez-les à votre panier pour commencer votre réservation.
            </p>
            <Link
              href="/jouets"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-mint to-purple-500 px-8 py-4 font-semibold text-white transition hover:from-mint/90 hover:to-purple-500/90"
            >
              Voir tous les jouets
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/jouets"
            className="inline-flex items-center gap-2 text-slate hover:text-mint transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux jouets
          </Link>
          <h1 className="text-3xl font-bold text-charcoal">
            Finaliser votre réservation
          </h1>
          <p className="text-slate mt-2">
            Vérifiez vos sélections et confirmez votre réservation
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          {/* Liste des articles */}
          <div className="space-y-6">
            <SectionHeading
              title="Articles sélectionnés"
              description={`${items.length} jouet${items.length > 1 ? 's' : ''} dans votre panier`}
            />

            {items.map((item) => {
              const basePrice = parseFloat(item.toy.price?.replace(/[^\d.]/g, '') || '0');
              
              // Convertir la durée en multiplicateur
              let durationMultiplier = 1;
              if (item.duration === 'daily') {
                durationMultiplier = 1;
              } else if (item.duration === 'weekly') {
                durationMultiplier = 4.8;
              } else if (item.duration === 'monthly') {
                durationMultiplier = 15;
              } else {
                const parsed = parseFloat(item.duration);
                if (!isNaN(parsed)) {
                  durationMultiplier = parsed;
                }
              }
              
              const itemTotal = basePrice * durationMultiplier * item.quantity;
              const durationLabel = durations.find(d => d.value === item.duration)?.label || item.duration;

              return (
                <div key={item.id} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={item.toy.image}
                        alt={item.toy.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Détails */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-charcoal mb-2">
                        {item.toy.name}
                      </h3>
                      <p className="text-sm text-slate mb-3">
                        {item.toy.category}
                      </p>

                      {/* Configuration */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Durée */}
                        <div>
                          <label className="block text-xs font-medium text-slate mb-1">
                            Durée
                          </label>
                          <select
                            value={item.duration}
                            onChange={(e) => handleUpdateItem(item.id, 'duration', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                          >
                            {durations.map((duration) => (
                              <option key={duration.value} value={duration.value}>
                                {duration.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Date */}
                        <div>
                          <DatePicker
                            value={item.startDate}
                            onChange={(date) => handleUpdateItem(item.id, 'startDate', date)}
                            label="Date"
                            min={new Date().toISOString().split('T')[0]}
                            required
                            className="text-xs"
                          />
                        </div>
                      </div>

                      {/* Quantité et prix */}
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-mint">
                            {itemTotal.toFixed(0)} MAD
                          </div>
                          <div className="text-xs text-slate">
                            {durationLabel}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bouton supprimer */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Résumé et informations client */}
          <div className="space-y-6">
            {/* Informations client */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-charcoal mb-4">
                Vos informations
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Sara Benali"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-charcoal transition focus:border-mint focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Ex: 06 12 34 56 78"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-charcoal transition focus:border-mint focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate mb-2">
                    Adresse de livraison <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Ex: 12 Rue Mohammed V, Apt 5"
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-charcoal transition focus:border-mint focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">
                      Ville <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      placeholder="Ex: Casablanca"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-charcoal transition focus:border-mint focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate mb-2">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={deliveryPostalCode}
                      onChange={(e) => setDeliveryPostalCode(e.target.value)}
                      placeholder="Ex: 20000"
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 text-charcoal transition focus:border-mint focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Résumé de commande */}
            <div className="rounded-2xl bg-gradient-to-r from-mint/10 to-purple-500/10 p-6">
              <h3 className="text-lg font-semibold text-charcoal mb-4">
                Résumé de votre commande
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate">Articles ({items.length})</span>
                  <span className="font-medium">{getTotalPrice().toFixed(0)} MAD</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-mint">{getTotalPrice().toFixed(0)} MAD</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !customerName || !customerPhone}
                className="w-full mt-6 rounded-xl bg-mint px-6 py-4 font-semibold text-white transition hover:bg-mint/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Traitement en cours...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Confirmer la commande
                  </div>
                )}
              </button>

              <p className="text-xs text-slate text-center mt-4">
                ✅ Votre commande sera traitée par notre équipe
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
