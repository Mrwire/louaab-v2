"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Package,
  Calendar,
  Clock,
  Heart,
  Settings,
  LogOut,
  User,
  MapPin,
  Phone,
  Mail,
  Truck,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Gift,
  CreditCard,
} from "lucide-react";

// Mock data - would come from API
const userData = {
  id: "user-1",
  firstName: "Nadia",
  lastName: "Khalil",
  email: "nadia@example.com",
  phone: "+212 6 12 34 56 78",
  address: "12 Rue Mohamed V, Résidence Al Amal, Appt 15",
  city: "Casablanca",
  memberSince: "2024-01-15",
  children: [
    { name: "Lina", age: 3, birthDate: "2021-03-15" },
    { name: "Adam", age: 5, birthDate: "2019-08-20" },
  ],
};

const subscription = {
  id: "sub-1",
  plan: {
    name: "Maxi Pack",
    toyCount: 5,
    priceMonthly: 349,
  },
  status: "active",
  startDate: "2024-01-15",
  nextBillingDate: "2024-11-15",
  autoRenew: true,
};

const currentOrder = {
  id: "order-1",
  orderNumber: "CMD-2024-0123",
  status: "delivered",
  deliveryDate: "2024-10-20",
  returnDate: "2024-11-20",
  items: [
    {
      id: "1",
      toy: {
        name: "Kit Montessori sensoriel",
        imageUrl: "https://images.unsplash.com/photo-1604882351679-01aabfd9009c?q=80&w=400",
      },
    },
    {
      id: "2",
      toy: {
        name: "Circuit voitures en bois",
        imageUrl: "https://images.unsplash.com/photo-1566577721828-964bbb061ad1?q=80&w=400",
      },
    },
    {
      id: "3",
      toy: {
        name: "Jeu de société coopératif",
        imageUrl: "https://images.unsplash.com/photo-1511715280173-1dee18c9d412?q=80&w=400",
      },
    },
  ],
};

const favorites = [
  {
    id: "fav-1",
    name: "Toboggan pour enfants",
    imageUrl: "https://images.unsplash.com/photo-1578926374373-81c379c2c6f5?q=80&w=400",
    price: 150,
  },
  {
    id: "fav-2",
    name: "Puzzle Animaux",
    imageUrl: "https://images.unsplash.com/photo-1596461404969-a838e51241b0?q=80&w=400",
    price: 50,
  },
];

const orderHistory = [
  {
    id: "order-2",
    orderNumber: "CMD-2024-0098",
    date: "2024-09-15",
    status: "completed",
    totalAmount: 349,
  },
  {
    id: "order-3",
    orderNumber: "CMD-2024-0075",
    date: "2024-08-10",
    status: "completed",
    totalAmount: 349,
  },
];

export default function MonComptePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "favorites" | "settings">("overview");

  const daysUntilReturn = Math.ceil(
    (new Date(currentOrder.returnDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-mist/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-mint to-fresh-green px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl font-bold text-mint shadow-lg">
                {userData.firstName[0]}{userData.lastName[0]}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Bonjour, {userData.firstName} !
                </h1>
                <p className="mt-1 text-white/90">
                  Membre depuis {new Date(userData.memberSince).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                </p>
              </div>
            </div>

            <Link
              href="/auth/login"
              className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30"
            >
              <LogOut size={18} />
              Déconnexion
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-mist bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-8">
            {[
              { key: "overview", label: "Vue d'ensemble", icon: Package },
              { key: "orders", label: "Mes commandes", icon: Calendar },
              { key: "favorites", label: "Favoris", icon: Heart },
              { key: "settings", label: "Paramètres", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 border-b-2 py-4 text-sm font-semibold transition ${
                  activeTab === tab.key
                    ? "border-mint text-mint"
                    : "border-transparent text-slate hover:text-charcoal"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {activeTab === "overview" && (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Current Subscription */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-charcoal">Mon abonnement</h2>
                  <span className="rounded-full bg-fresh-green/20 px-3 py-1 text-xs font-semibold text-fresh-green">
                    Actif
                  </span>
                </div>

                <div className="mt-6 rounded-xl bg-gradient-to-br from-mint/10 to-sky-blue/10 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-charcoal">
                        {subscription.plan.name}
                      </p>
                      <p className="mt-1 text-sm text-slate">
                        {subscription.plan.toyCount} jouets par mois
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-mint">
                        {subscription.plan.priceMonthly} MAD
                      </p>
                      <p className="mt-1 text-xs text-slate">par mois</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-mist pt-4">
                    <div className="flex items-center gap-2 text-sm text-slate">
                      <Calendar size={16} />
                      Prochain paiement:{" "}
                      {new Date(subscription.nextBillingDate).toLocaleDateString("fr-FR")}
                    </div>
                    <Link
                      href="/mon-compte/subscription"
                      className="text-sm font-semibold text-mint hover:underline"
                    >
                      Gérer →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Current Toys */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-charcoal">
                      Mes jouets actuels
                    </h2>
                    <p className="mt-1 text-sm text-slate">
                      À retourner dans {daysUntilReturn} jours
                    </p>
                  </div>
                  <Link
                    href="/jouets"
                    className="rounded-xl bg-mint px-4 py-2 text-sm font-semibold text-white transition hover:bg-fresh-green"
                  >
                    Demander un échange
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {currentOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="overflow-hidden rounded-xl border border-mist"
                    >
                      <div className="relative aspect-square">
                        <Image
                          src={item.toy.imageUrl}
                          alt={item.toy.name}
                          fill
                          sizes="300px"
                          className="object-cover"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-semibold text-charcoal">
                          {item.toy.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl bg-sunshine-yellow/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-sunshine-yellow" />
                    <div>
                      <p className="text-sm font-semibold text-charcoal">
                        Retour prévu le{" "}
                        {new Date(currentOrder.returnDate).toLocaleDateString("fr-FR")}
                      </p>
                      <p className="mt-1 text-xs text-slate">
                        Nous viendrons récupérer les jouets lors de la prochaine livraison ou à cette date si aucun échange n'est demandé.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order History */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-charcoal">
                  Historique des commandes
                </h2>

                <div className="mt-6 space-y-4">
                  {orderHistory.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between rounded-xl border border-mist p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-fresh-green/20">
                          <CheckCircle size={24} className="text-fresh-green" />
                        </div>
                        <div>
                          <p className="font-semibold text-charcoal">
                            {order.orderNumber}
                          </p>
                          <p className="mt-1 text-sm text-slate">
                            {new Date(order.date).toLocaleDateString("fr-FR")} • {order.totalAmount} MAD
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/mon-compte/orders/${order.id}`}
                        className="text-sm font-semibold text-mint hover:underline"
                      >
                        Détails →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="font-bold text-charcoal">Mon profil</h3>

                <div className="mt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <User size={18} className="mt-1 text-mint" />
                    <div>
                      <p className="text-sm font-semibold text-charcoal">
                        {userData.firstName} {userData.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail size={18} className="mt-1 text-mint" />
                    <div>
                      <p className="text-sm text-slate">{userData.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone size={18} className="mt-1 text-mint" />
                    <div>
                      <p className="text-sm text-slate">{userData.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-1 text-mint" />
                    <div>
                      <p className="text-sm text-slate">{userData.address}</p>
                      <p className="text-sm text-slate">{userData.city}</p>
                    </div>
                  </div>
                </div>

                <Link
                  href="/mon-compte/settings"
                  className="mt-6 block text-center text-sm font-semibold text-mint hover:underline"
                >
                  Modifier mon profil
                </Link>
              </div>

              {/* Children Card */}
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="font-bold text-charcoal">Mes enfants</h3>

                <div className="mt-6 space-y-3">
                  {userData.children.map((child, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl bg-mist/30 p-3"
                    >
                      <div>
                        <p className="font-semibold text-charcoal">{child.name}</p>
                        <p className="mt-1 text-xs text-slate">{child.age} ans</p>
                      </div>
                      <span className="text-2xl">
                        {child.age < 3 ? "👶" : child.age < 6 ? "🧒" : "🧑"}
                      </span>
                    </div>
                  ))}
                </div>

                <button className="mt-4 w-full rounded-xl border-2 border-dashed border-mist py-3 text-sm font-semibold text-slate transition hover:border-mint hover:text-mint">
                  + Ajouter un enfant
                </button>
              </div>

              {/* Quick Actions */}
              <div className="rounded-2xl bg-gradient-to-br from-peach/20 to-lilac/20 p-6">
                <h3 className="font-bold text-charcoal">Actions rapides</h3>

                <div className="mt-4 space-y-2">
                  <Link
                    href="/jouets"
                    className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-sm font-semibold text-charcoal shadow-sm transition hover:shadow-md"
                  >
                    <Package size={18} className="text-mint" />
                    Parcourir le catalogue
                  </Link>
                  <Link
                    href="/nos-packs"
                    className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-sm font-semibold text-charcoal shadow-sm transition hover:shadow-md"
                  >
                    <Gift size={18} className="text-peach" />
                    Changer de pack
                  </Link>
                  <Link
                    href="/contact"
                    className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-sm font-semibold text-charcoal shadow-sm transition hover:shadow-md"
                  >
                    <Mail size={18} className="text-sky-blue" />
                    Nous contacter
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs content would go here */}
        {activeTab !== "overview" && (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-lg text-slate">
              Contenu de l'onglet "{activeTab}" à venir
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


