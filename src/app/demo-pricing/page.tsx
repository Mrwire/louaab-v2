"use client";

import { useState } from "react";
import PricingDemo from "@/components/pricing-demo";

const sampleToys = [
  {
    id: "1",
    name: "Puzzle Montessori 3D",
    rentalPriceDaily: 25,
    rentalPriceWeekly: 120,
    rentalPriceMonthly: 400,
    promotion: {
      isActive: false,
      type: 'percentage' as const,
      value: '10',
      label: 'Première location'
    }
  },
  {
    id: "2",
    name: "Lego Technic Voiture",
    rentalPriceDaily: 35,
    rentalPriceWeekly: 180,
    rentalPriceMonthly: 600,
    promotion: {
      isActive: true,
      type: 'percentage' as const,
      value: '15',
      label: 'Offre spéciale'
    }
  },
  {
    id: "3",
    name: "Kit de Construction Magnétique",
    rentalPriceDaily: 30,
    rentalPriceWeekly: 150,
    rentalPriceMonthly: 500,
    promotion: {
      isActive: false,
      type: 'fixed' as const,
      value: '20',
      label: 'Réduction fixe'
    }
  },
];

export default function DemoPricingPage() {
  const [selectedToy, setSelectedToy] = useState(sampleToys[0]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-charcoal mb-4">
            Démonstration du Système de Prix
          </h1>
          <p className="text-lg text-slate max-w-2xl mx-auto">
            Testez notre nouveau système de calcul de prix intelligent avec des règles 
            de remise automatiques et une interface moderne.
          </p>
        </div>

        {/* Sélecteur de jouet */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-charcoal mb-4">Choisissez un jouet à tester :</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {sampleToys.map((toy) => (
              <button
                key={toy.id}
                onClick={() => setSelectedToy(toy)}
                className={`p-4 rounded-xl border-2 transition ${
                  selectedToy.id === toy.id
                    ? 'border-mint bg-mint/5'
                    : 'border-gray-200 bg-white hover:border-mint/30'
                }`}
              >
                <h3 className="font-semibold text-charcoal mb-2">{toy.name}</h3>
                <div className="space-y-1 text-sm text-slate">
                  <div>Jour: {toy.rentalPriceDaily} MAD</div>
                  <div>Semaine: {toy.rentalPriceWeekly} MAD</div>
                  <div>Mois: {toy.rentalPriceMonthly} MAD</div>
                </div>
                {toy.promotion.isActive && (
                  <div className="mt-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full inline-block">
                    {toy.promotion.label}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Démonstration du système de prix */}
        <PricingDemo toy={selectedToy} />

        {/* Informations sur le système */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-charcoal mb-6">Fonctionnalités du Système de Prix</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-mint/10 rounded-lg flex items-center justify-center">
                  <span className="text-mint font-bold">1</span>
                </div>
                <h3 className="font-semibold text-charcoal">Calcul Intelligent</h3>
              </div>
              <p className="text-sm text-slate">
                Le système calcule automatiquement les prix selon la durée, la quantité et le type de client.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-lilac/10 rounded-lg flex items-center justify-center">
                  <span className="text-lilac font-bold">2</span>
                </div>
                <h3 className="font-semibold text-charcoal">Règles de Prix</h3>
              </div>
              <p className="text-sm text-slate">
                Appliquez des remises automatiques selon la fidélité, la quantité ou des critères saisonniers.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-peach/10 rounded-lg flex items-center justify-center">
                  <span className="text-peach font-bold">3</span>
                </div>
                <h3 className="font-semibold text-charcoal">Interface Moderne</h3>
              </div>
              <p className="text-sm text-slate">
                Une UX intuitive pour sélectionner facilement la durée et voir les économies en temps réel.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-blue/10 rounded-lg flex items-center justify-center">
                  <span className="text-sky-blue font-bold">4</span>
                </div>
                <h3 className="font-semibold text-charcoal">Gestion Admin</h3>
              </div>
              <p className="text-sm text-slate">
                Interface d'administration complète pour gérer les prix et règles de tous les jouets.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-fresh-green/10 rounded-lg flex items-center justify-center">
                  <span className="text-fresh-green font-bold">5</span>
                </div>
                <h3 className="font-semibold text-charcoal">Historique des Prix</h3>
              </div>
              <p className="text-sm text-slate">
                Suivez tous les changements de prix avec un historique détaillé et des raisons de modification.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-coral/10 rounded-lg flex items-center justify-center">
                  <span className="text-coral font-bold">6</span>
                </div>
                <h3 className="font-semibold text-charcoal">Recommandations</h3>
              </div>
              <p className="text-sm text-slate">
                Le système recommande automatiquement la meilleure option selon les besoins du client.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="/admin/pricing"
            className="inline-flex items-center gap-2 bg-mint text-white px-6 py-3 rounded-xl font-semibold hover:bg-mint/90 transition"
          >
            Accéder à la Gestion des Prix
          </a>
        </div>
      </div>
    </div>
  );
}
