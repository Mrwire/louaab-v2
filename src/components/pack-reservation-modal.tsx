"use client";

import { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, CheckCircle } from 'lucide-react';
import { usePackReservations } from '@/contexts/pack-reservations';
import DatePicker from './date-picker';

interface PackReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  pack: {
    name: string;
    price: string;
    description: string;
    features: string[];
  };
}

export default function PackReservationModal({ isOpen, onClose, pack }: PackReservationModalProps) {
  const { addReservation } = usePackReservations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    startDate: '',
    endDate: '',
    duration: '1 semaine',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerPhone || !formData.startDate) {
      alert('Veuillez remplir au moins le nom, le téléphone et la date de début');
      return;
    }

    setIsSubmitting(true);

    try {
      addReservation({
        packName: pack.name,
        packPrice: pack.price,
        packDescription: pack.description,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        startDate: formData.startDate,
        endDate: formData.endDate,
        duration: formData.duration,
        status: 'pending',
        notes: formData.notes
      });

      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
        setFormData({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          startDate: '',
          endDate: '',
          duration: '1 semaine',
          notes: ''
        });
      }, 2000);

    } catch (error) {
      console.error('Erreur lors de la réservation:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        startDate: '',
        endDate: '',
        duration: '1 semaine',
        notes: ''
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-charcoal">Réserver le pack {pack.name}</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-charcoal mb-2">Réservation confirmée !</h3>
            <p className="text-slate">
              Votre demande de réservation pour le pack <strong>{pack.name}</strong> a été enregistrée.
            </p>
            <p className="text-sm text-slate mt-2">
              Notre équipe vous contactera dans les 24h pour finaliser votre réservation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pack Info */}
            <div className="rounded-xl bg-gray-50 p-4">
              <h3 className="font-semibold text-charcoal mb-2">{pack.name}</h3>
              <p className="text-sm text-slate mb-2">{pack.description}</p>
              <div className="text-lg font-bold text-mint">{pack.price}</div>
            </div>

            {/* Customer Info */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint pl-10"
                    placeholder="Ex: Sara Dupont"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint pl-10"
                    placeholder="Ex: +212 6 XX XX XX XX"
                  />
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (optionnel)
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint pl-10"
                  placeholder="Ex: sara@email.com"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            {/* Dates */}
            <div className="grid gap-4 sm:grid-cols-2">
              <DatePicker
                value={formData.startDate}
                onChange={(date) => setFormData({...formData, startDate: date})}
                label="Date de début"
                min={new Date().toISOString().split('T')[0]}
                required
              />

              <DatePicker
                value={formData.endDate}
                onChange={(date) => setFormData({...formData, endDate: date})}
                label="Date de fin"
                min={formData.startDate || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durée
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
              >
                <option value="1 semaine">1 semaine</option>
                <option value="2 semaines">2 semaines</option>
                <option value="1 mois">1 mois</option>
                <option value="2 mois">2 mois</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optionnel)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                placeholder="Informations supplémentaires..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-mint px-4 py-3 font-medium text-white hover:bg-mint/90 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Traitement...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Confirmer la réservation
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
