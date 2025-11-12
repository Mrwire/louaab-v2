"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Package,
  Truck,
  CheckCircle,
  Edit,
  Printer,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";

// Mock data - would come from API via params.id
const orderDetail = {
  id: "1",
  orderNumber: "CMD-2024-0123",
  status: "confirmed",
  createdAt: "2024-10-22T10:30:00",
  customer: {
    id: "c1",
    firstName: "Nadia",
    lastName: "Khalil",
    phone: "+212 6 12 34 56 78",
    email: "nadia@example.com",
    whatsapp: "+212 6 12 34 56 78",
    children: [
      { name: "Lina", age: 3 },
      { name: "Adam", age: 5 },
    ],
  },
  subscription: {
    id: "sub1",
    plan: "Maxi Pack",
    status: "active",
  },
  items: [
    {
      id: "1",
      toy: {
        id: "toy1",
        name: "Kit Montessori sensoriel",
        sku: "TOY-001",
        imageUrl: "https://images.unsplash.com/photo-1604882351679-01aabfd9009c?q=80&w=400",
      },
      quantity: 1,
      rentalPrice: 120,
      rentalDurationDays: 30,
      conditionBefore: "Excellent",
      conditionAfter: null,
    },
    {
      id: "2",
      toy: {
        id: "toy2",
        name: "Circuit voitures en bois",
        sku: "TOY-045",
        imageUrl: "https://images.unsplash.com/photo-1566577721828-964bbb061ad1?q=80&w=400",
      },
      quantity: 1,
      rentalPrice: 95,
      rentalDurationDays: 30,
      conditionBefore: "Très bon",
      conditionAfter: null,
    },
    {
      id: "3",
      toy: {
        id: "toy3",
        name: "Jeu de société coopératif",
        sku: "TOY-089",
        imageUrl: "https://images.unsplash.com/photo-1511715280173-1dee18c9d412?q=80&w=400",
      },
      quantity: 1,
      rentalPrice: 70,
      rentalDurationDays: 30,
      conditionBefore: "Excellent",
      conditionAfter: null,
    },
  ],
  totalAmount: 349,
  depositAmount: 150,
  depositPaid: 150,
  depositRefunded: 0,
  deliveryAddress: "12 Rue Mohamed V, Résidence Al Amal, Appt 15",
  deliveryCity: "Casablanca",
  deliveryDate: "2024-10-25",
  deliveryTimeSlot: "14h-17h",
  returnDate: "2024-11-25",
  returnTimeSlot: null,
  notes: "Sonnette ne fonctionne pas, appeler en arrivant",
  internalNotes: "Client VIP - priorité livraison",
  assignedDriver: null,
  deliveries: [
    {
      id: "d1",
      type: "delivery",
      status: "scheduled",
      scheduledDate: "2024-10-25",
      scheduledTimeSlot: "14h-17h",
      recipientName: "Nadia Khalil",
      recipientPhone: "+212 6 12 34 56 78",
    },
  ],
};

const statusConfig = {
  draft: { label: "Brouillon", color: "bg-slate text-white" },
  confirmed: { label: "Confirmée", color: "bg-sky-blue text-white" },
  in_preparation: { label: "En préparation", color: "bg-sunshine-yellow text-charcoal" },
  ready_for_delivery: { label: "Prête à livrer", color: "bg-mint text-white" },
  in_transit: { label: "En transit", color: "bg-peach text-white" },
  delivered: { label: "Livrée", color: "bg-fresh-green text-white" },
  returned: { label: "Retournée", color: "bg-lilac text-white" },
  completed: { label: "Terminée", color: "bg-charcoal text-white" },
  cancelled: { label: "Annulée", color: "bg-coral text-white" },
};

export default function AdminOrderDetailPage() {
  const [currentStatus, setCurrentStatus] = useState(orderDetail.status);
  const [showStatusModal, setShowStatusModal] = useState(false);

  return (
    <div className="min-h-screen bg-mist/30 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-sm text-slate hover:text-mint"
          >
            <ArrowLeft size={16} />
            Retour aux commandes
          </Link>

          <div className="mt-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-charcoal">
                Commande {orderDetail.orderNumber}
              </h1>
              <p className="mt-2 text-slate">
                Créée le{" "}
                {new Date(orderDetail.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 rounded-xl border border-mist bg-white px-4 py-2 text-sm font-semibold text-charcoal transition hover:border-mint hover:bg-mint/10">
                <Printer size={18} />
                Imprimer
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-mist bg-white px-4 py-2 text-sm font-semibold text-charcoal transition hover:border-mint hover:bg-mint/10">
                <MessageCircle size={18} />
                Contacter
              </button>
              <button
                onClick={() => setShowStatusModal(true)}
                className="flex items-center gap-2 rounded-xl bg-mint px-6 py-2 text-sm font-semibold text-white transition hover:bg-fresh-green"
              >
                <Edit size={18} />
                Changer statut
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Status Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-charcoal">Statut actuel</h2>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                    statusConfig[currentStatus as keyof typeof statusConfig].color
                  }`}
                >
                  <CheckCircle size={16} />
                  {statusConfig[currentStatus as keyof typeof statusConfig].label}
                </span>
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="text-sm text-mint hover:underline"
                >
                  Modifier le statut
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-slate">
                  <span>Confirmée</span>
                  <span>Préparation</span>
                  <span>Livrée</span>
                  <span>Retournée</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist">
                  <div
                    className="h-full bg-gradient-to-r from-mint to-fresh-green transition-all"
                    style={{ width: "25%" }}
                  />
                </div>
              </div>
            </div>

            {/* Items Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-charcoal">
                  Articles ({orderDetail.items.length})
                </h2>
              </div>

              <div className="mt-6 space-y-4">
                {orderDetail.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-xl border border-mist p-4"
                  >
                    <img
                      src={item.toy.imageUrl}
                      alt={item.toy.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-charcoal">
                        {item.toy.name}
                      </p>
                      <p className="mt-1 text-xs text-slate">
                        SKU: {item.toy.sku} • Quantité: {item.quantity}
                      </p>
                      <p className="mt-1 text-xs text-slate">
                        Condition: {item.conditionBefore}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-charcoal">
                        {item.rentalPrice} MAD
                      </p>
                      <p className="mt-1 text-xs text-slate">
                        {item.rentalDurationDays} jours
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="mt-6 space-y-3 border-t border-mist pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate">Sous-total</span>
                  <span className="font-semibold text-charcoal">
                    {orderDetail.totalAmount} MAD
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate">Caution payée</span>
                  <span className="font-semibold text-charcoal">
                    {orderDetail.depositPaid} MAD
                  </span>
                </div>
                <div className="flex justify-between border-t border-mist pt-3 text-base">
                  <span className="font-bold text-charcoal">Total</span>
                  <span className="font-bold text-mint">
                    {orderDetail.totalAmount + orderDetail.depositPaid} MAD
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-charcoal">
                Informations de livraison
              </h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="mt-1 text-mint" />
                  <div>
                    <p className="text-sm font-semibold text-charcoal">Adresse</p>
                    <p className="mt-1 text-sm text-slate">
                      {orderDetail.deliveryAddress}
                    </p>
                    <p className="text-sm text-slate">{orderDetail.deliveryCity}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar size={20} className="mt-1 text-mint" />
                  <div>
                    <p className="text-sm font-semibold text-charcoal">
                      Date de livraison
                    </p>
                    <p className="mt-1 text-sm text-slate">
                      {new Date(orderDetail.deliveryDate).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock size={20} className="mt-1 text-mint" />
                  <div>
                    <p className="text-sm font-semibold text-charcoal">
                      Créneau horaire
                    </p>
                    <p className="mt-1 text-sm text-slate">
                      {orderDetail.deliveryTimeSlot}
                    </p>
                  </div>
                </div>

                {orderDetail.returnDate && (
                  <div className="flex items-start gap-3">
                    <Package size={20} className="mt-1 text-mint" />
                    <div>
                      <p className="text-sm font-semibold text-charcoal">
                        Date de retour prévue
                      </p>
                      <p className="mt-1 text-sm text-slate">
                        {new Date(orderDetail.returnDate).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {orderDetail.notes && (
                <div className="mt-6 rounded-xl bg-sunshine-yellow/10 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={18} className="mt-0.5 text-sunshine-yellow" />
                    <div>
                      <p className="text-sm font-semibold text-charcoal">
                        Note du client
                      </p>
                      <p className="mt-1 text-sm text-slate">{orderDetail.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Internal Notes */}
            {orderDetail.internalNotes && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-charcoal">Notes internes</h2>
                <p className="mt-4 text-sm text-slate">{orderDetail.internalNotes}</p>
                <button className="mt-4 text-sm text-mint hover:underline">
                  Modifier les notes
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-charcoal">Client</h2>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mint/20">
                    <User size={24} className="text-mint" />
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">
                      {orderDetail.customer.firstName} {orderDetail.customer.lastName}
                    </p>
                    <Link
                      href={`/admin/customers/${orderDetail.customer.id}`}
                      className="text-xs text-mint hover:underline"
                    >
                      Voir le profil
                    </Link>
                  </div>
                </div>

                <div className="space-y-2 border-t border-mist pt-4">
                  <div className="flex items-center gap-2 text-sm text-slate">
                    <Phone size={16} className="text-mint" />
                    {orderDetail.customer.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate">
                    <Mail size={16} className="text-mint" />
                    {orderDetail.customer.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate">
                    <MessageCircle size={16} className="text-fresh-green" />
                    <a
                      href={`https://wa.me/${orderDetail.customer.whatsapp.replace(/\s/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fresh-green hover:underline"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>

                {orderDetail.customer.children.length > 0 && (
                  <div className="border-t border-mist pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate">
                      Enfants
                    </p>
                    <div className="mt-2 space-y-1">
                      {orderDetail.customer.children.map((child, index) => (
                        <p key={index} className="text-sm text-charcoal">
                          {child.name}, {child.age} ans
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Subscription Card */}
            {orderDetail.subscription && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-charcoal">Abonnement</h2>

                <div className="mt-4">
                  <p className="font-semibold text-charcoal">
                    {orderDetail.subscription.plan}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-fresh-green/20 px-3 py-1 text-xs font-semibold text-fresh-green">
                    Actif
                  </span>
                  <Link
                    href={`/admin/subscriptions/${orderDetail.subscription.id}`}
                    className="mt-4 block text-sm text-mint hover:underline"
                  >
                    Voir l&apos;abonnement
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="rounded-2xl bg-gradient-to-br from-mint/10 to-sky-blue/10 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-charcoal">
                Actions rapides
              </h3>
              <div className="mt-4 space-y-2">
                <button className="w-full rounded-xl bg-white px-4 py-3 text-left text-sm font-semibold text-charcoal shadow-sm transition hover:shadow-md">
                  Assigner un livreur
                </button>
                <button className="w-full rounded-xl bg-white px-4 py-3 text-left text-sm font-semibold text-charcoal shadow-sm transition hover:shadow-md">
                  Modifier la date
                </button>
                <button className="w-full rounded-xl bg-white px-4 py-3 text-left text-sm font-semibold text-charcoal shadow-sm transition hover:shadow-md">
                  Envoyer une notification
                </button>
                <button className="w-full rounded-xl bg-coral px-4 py-3 text-left text-sm font-semibold text-white shadow-sm transition hover:bg-coral/90">
                  Annuler la commande
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


