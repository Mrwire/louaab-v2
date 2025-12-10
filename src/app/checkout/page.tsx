"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/cart-context";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { Clock, Trash2, CheckCircle, ArrowLeft } from "lucide-react";
import DatePicker from "@/components/date-picker";
import { createPublicOrder } from "@/lib/api/orders";
import { formatDateInput } from "@/lib/date";

const durations = [
  { value: "daily", label: "1 jour", multiplier: 1 },
  { value: "weekly", label: "1 semaine", multiplier: 4.8 },
  { value: "monthly", label: "1 mois", multiplier: 15 },
];

const toNumber = (value: any) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getUnitPrice = (item: ReturnType<typeof useCart>["items"][number]) => {
  if (item.duration === "daily") return toNumber(item.toy.rentalPriceDaily);
  if (item.duration === "weekly") return toNumber(item.toy.rentalPriceWeekly);
  if (item.duration === "monthly") return toNumber(item.toy.rentalPriceMonthly);
  return toNumber(item.toy.rentalPriceDaily);
};

export default function CheckoutPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    getTotalDeposit,
    getDeliveryFee,
    getGrandTotal,
    clearCart,
    updateItem,
    orderDuration,
    orderStartDate,
    setOrderDuration,
    setOrderStartDate
  } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryPostalCode, setDeliveryPostalCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    if (orderSubmitted) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [orderSubmitted]);

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

  const durationToDays = (value: string) => {
    switch (value) {
      case "daily":
        return 1;
      case "monthly":
        return 30;
      default:
        return 7;
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
      setSubmissionError(null);
      const orderItems = items.map((item) => {
        const unitPrice = getUnitPrice(item);

        const durationLabel = durations.find((d) => d.value === item.duration)?.label || item.duration;
        const toyKey = String(item.toy.backendId ?? item.toy.id);

        return {
          toyId: toyKey,
          quantity: item.quantity,
          unitPrice,
          rentalDurationDays: durationToDays(item.duration),
          startDate: item.startDate,
          durationLabel,
        };
      });

      const depositAmount = items.reduce((sum, item) => {
        const deposit = item.toy.depositAmount ?? 0;
        return sum + deposit * item.quantity;
      }, 0);

      const payload = {
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        deliveryAddress,
        deliveryCity,
        deliveryPostalCode: deliveryPostalCode || undefined,
        deliveryDate: items[0]?.startDate,
        items: orderItems,
        totalAmount: Number(getTotalPrice().toFixed(2)),
        depositAmount,
        notes: `Commande en ligne - ${customerName}`,
      };

      const createdOrder = await createPublicOrder(payload);

      // Vider le panier
      clearCart();

      // Afficher la confirmation
      setOrderId(createdOrder?.orderNumber || createdOrder?.id || null);
      setOrderSubmitted(true);

    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      setSubmissionError(error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.");
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
            <div className="text-6xl mb-6">ðŸ›’</div>
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


        {submissionError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submissionError}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          {/* Liste des articles */}
          <div className="space-y-6">
            <SectionHeading
              title="Articles sélectionnés"
              description={`${items.length} jouet${items.length > 1 ? 's' : ''} dans votre panier`}
            />

            {items.map((item) => {
              const unitPrice = getUnitPrice(item);
              const itemTotal = unitPrice * item.quantity;
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

                    </div>

                    {/* Bouton supprimer */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
                {submissionError && (
                  <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
                    {submissionError}
                  </div>
                )}
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
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="exemple@louaab.ma"
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

            {/* Global Duration Selector */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-charcoal mb-4">
                ⏱️ Durée de location
              </h3>
              <p className="text-sm text-slate mb-4">
                Choisissez une durée unique pour tous vos jouets
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'weekly', label: '1 semaine' },
                  { value: 'biweekly', label: '2 semaines' },
                  { value: 'monthly', label: '1 mois' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setOrderDuration(option.value as any)}
                    className={`rounded-xl px-4 py-3 text-sm font-medium transition ${orderDuration === option.value
                      ? 'bg-mint text-white shadow-md'
                      : 'bg-gray-100 text-charcoal hover:bg-gray-200'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="mt-4">
                <DatePicker
                  value={orderStartDate}
                  onChange={setOrderStartDate}
                  label="Date de début"
                  min={formatDateInput()}
                  required
                />
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
                <div className="flex justify-between text-sm">
                  <span className="text-slate">Caution (remboursable)</span>
                  <span className="font-medium">{getTotalDeposit().toFixed(0)} MAD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate">Livraison</span>
                  {getDeliveryFee() === 0 ? (
                    <span className="font-medium text-green-600">GRATUITE ✓</span>
                  ) : (
                    <span className="font-medium">{getDeliveryFee()} MAD</span>
                  )}
                </div>
                {getDeliveryFee() > 0 && (
                  <p className="text-xs text-slate bg-yellow-50 rounded-lg px-3 py-2">
                    💡 Ajoutez {(400 - getTotalPrice()).toFixed(0)} MAD pour bénéficier de la livraison gratuite !
                  </p>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total à payer</span>
                    <span className="text-mint">{getGrandTotal().toFixed(0)} MAD</span>
                  </div>
                  <p className="text-xs text-slate mt-1">
                    (dont {getTotalDeposit().toFixed(0)} MAD de caution remboursable)
                  </p>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !customerName || !customerPhone || !orderStartDate}
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
      </div >
    </PageShell >
  );
}
