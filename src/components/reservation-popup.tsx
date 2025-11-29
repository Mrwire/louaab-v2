"use client";

import { useState } from "react";
import { X, Calendar, Clock, MessageCircle, Check } from "lucide-react";
import DatePicker from "./date-picker";
import { formatDateInput } from "@/lib/date";

interface ReservationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  toyName: string;
  toyPrice: string;
}

export default function ReservationPopup({ isOpen, onClose, toyName, toyPrice }: ReservationPopupProps) {
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const durations = [
    { value: "1", label: "1 semaine", price: "1x" },
    { value: "2", label: "2 semaines", price: "1.5x" },
    { value: "4", label: "1 mois", price: "2x" },
    { value: "8", label: "2 mois", price: "3x" },
  ];

  const timeSlots = [
    "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  const handleSubmit = async () => {
    if (!selectedDuration || !selectedDate || !customerName || !customerPhone) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    setIsSubmitting(true);

    // Calculer le prix selon la durée
    const basePrice = parseFloat(toyPrice.replace(/[^\d.]/g, '') || '0');
    const durationMultiplier = parseFloat(selectedDuration);
    const totalPrice = basePrice * durationMultiplier;

    // Créer le message WhatsApp
    const message = `🎈 *Réservation LOUAAB*

*Jouet:* ${toyName}
*Durée:* ${durations.find(d => d.value === selectedDuration)?.label}
*Date:* ${selectedDate}
*Prix total:* ${totalPrice.toFixed(0)} MAD

*Informations client:*
• Nom: ${customerName}
• Téléphone: ${customerPhone}

Merci de confirmer cette réservation ! 🚀`;

    // Encoder le message pour WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/212665701513?text=${encodedMessage}`;

    // Ouvrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mint/20">
              <MessageCircle className="h-5 w-5 text-mint" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-charcoal">Réserver ce jouet</h3>
              <p className="text-sm text-slate">{toyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Durée */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-charcoal">
              <Clock className="mr-2 inline h-4 w-4" />
              Durée de location
            </label>
            <div className="grid grid-cols-2 gap-2">
              {durations.map((duration) => (
                <button
                  key={duration.value}
                  onClick={() => setSelectedDuration(duration.value)}
                  className={`rounded-xl border-2 p-3 text-center transition ${
                    selectedDuration === duration.value
                      ? 'border-mint bg-mint/10 text-mint'
                      : 'border-gray-200 text-slate hover:border-mint/50'
                  }`}
                >
                  <div className="font-semibold">{duration.label}</div>
                  <div className="text-xs text-slate">{duration.price}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            label="Date de début"
            min={formatDateInput()}
            required
          />

          {/* Note: Heure de récupération supprimée car causait des bugs */}

          {/* Informations client */}
          <div className="space-y-3">
            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">
                Votre nom complet
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex: Sara Benali"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-charcoal transition focus:border-mint focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-charcoal">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Ex: 06 12 34 56 78"
                className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-charcoal transition focus:border-mint focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border-2 border-gray-200 px-4 py-3 font-semibold text-slate transition hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-gradient-to-r from-mint to-purple-500 px-4 py-3 font-semibold text-white transition hover:from-mint/90 hover:to-purple-500/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Envoi...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Envoyer sur WhatsApp
              </div>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-4 rounded-xl bg-mint/10 p-3 text-center">
          <p className="text-xs text-slate">
            💬 Vous serez redirigé vers WhatsApp pour finaliser votre réservation
          </p>
        </div>
      </div>
    </div>
  );
}
