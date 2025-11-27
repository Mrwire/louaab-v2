"use client";

import { useMemo, useState } from "react";
import { X, Calendar, CheckCircle, Loader2 } from "lucide-react";
import { usePackReservations } from "@/contexts/pack-reservations";
import DatePicker from "./date-picker";

interface PackReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pack: {
    name: string;
    price: string;
    description: string;
    features: string[];
    durationLabel?: string;
    durationDays?: number;
  };
}

const formatDateLabel = (value: string) => {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function PackReservationModal({
  isOpen,
  onClose,
  pack,
}: PackReservationModalProps) {
  const { addReservation } = usePackReservations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const isButtonDisabled =
    isSubmitting || !startDate || !customerName.trim() || !customerPhone.trim();

  const todayIso = useMemo(
    () => new Date().toISOString().split("T")[0],
    []
  );

  const computedEndDate = useMemo(() => {
    if (!startDate || !pack.durationDays) return "";
    const end = new Date(`${startDate}T00:00:00`);
    end.setDate(end.getDate() + pack.durationDays);
    return end.toISOString().split("T")[0];
  }, [startDate, pack.durationDays]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!startDate || !customerName.trim() || !customerPhone.trim()) {
      alert("Merci de renseigner le nom, le téléphone et la date de début.");
      return;
    }

    setIsSubmitting(true);
    try {
      addReservation({
        packName: pack.name,
        packPrice: pack.price,
        packDescription: pack.description,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        startDate,
        endDate: computedEndDate,
        duration: pack.durationLabel || "Pack LOUAAB",
        status: "pending",
        notes,
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setStartDate("");
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setNotes("");
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la réservation:", error);
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setStartDate("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setNotes("");
    setIsSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-mint">
              Réservation de pack
            </p>
            <h2 className="text-2xl font-bold text-charcoal">
              {pack.name}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg bg-gray-100 p-2 text-gray-600 transition hover:bg-gray-200 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-10 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">
              Réservation confirmée !
            </h3>
            <p className="text-slate">
              Votre demande pour le <strong>{pack.name}</strong> a bien été
              enregistrée. Notre équipe vous contactera sous 24h.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate">
                    Pack sélectionné
                  </p>
                  <h3 className="text-xl font-bold text-charcoal">
                    {pack.name}
                  </h3>
                  <p className="text-sm text-slate">{pack.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate">Tarif</p>
                  <p className="text-2xl font-bold text-mint">{pack.price}</p>
                  {pack.durationLabel && (
                    <p className="text-xs text-slate">
                      Durée : {pack.durationLabel}
                    </p>
                  )}
                </div>
              </div>
              {pack.features?.length > 0 && (
                <ul className="mt-4 grid gap-2 text-sm text-charcoal md:grid-cols-2">
                  {pack.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-slate"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-mist/80 p-4 space-y-4">
                <p className="text-sm font-semibold text-gray-700">
                  Coordonnées
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      placeholder="Ex: Sara Dupont"
                      required
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-mint focus:ring-mint"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      placeholder="Ex: +212 6 XX XX XX XX"
                      required
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-mint focus:ring-mint"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(event) => setCustomerEmail(event.target.value)}
                      placeholder="Ex: sara@email.com"
                      className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-mint focus:ring-mint"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-mist/80 p-4">
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Calendar className="h-4 w-4 text-mint" />
                  Date de début *
                </label>
                <DatePicker
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  label="Sélectionner une date"
                  min={todayIso}
                  required
                />
                {pack.durationLabel && (
                  <p className="mt-3 text-sm text-slate">
                    Ce pack couvre <strong>{pack.durationLabel}</strong>
                    {computedEndDate &&
                      ` – retour prévu le ${formatDateLabel(computedEndDate)}.`}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Notes (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-mint focus:ring-mint"
                  placeholder="Informations complémentaires, remarques..."
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isButtonDisabled}
              className={`
                flex w-full items-center justify-center gap-3 
                rounded-2xl px-6 py-3 text-sm font-bold uppercase tracking-wide 
                text-white shadow-xl transition-all duration-200 
                focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                ${isButtonDisabled ? "cursor-not-allowed opacity-70 bg-gray-300 text-gray-600" : "hover:scale-[1.01]"}
              `}
              style={
                isButtonDisabled
                  ? undefined
                  : {
                      background:
                        "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #0f766e 100%)",
                    }
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Confirmer la réservation"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
