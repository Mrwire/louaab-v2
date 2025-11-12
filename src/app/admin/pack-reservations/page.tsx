"use client";

import { useState, useEffect } from "react";
import { usePackReservations, PackReservation } from "@/contexts/pack-reservations";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Phone, 
  Calendar,
  User,
  Mail,
  Search,
  Filter,
  MessageCircle,
  PhoneCall
} from "lucide-react";

export default function PackReservationsPage() {
  const { 
    reservations, 
    updateReservationStatus, 
    getReservationsByStatus, 
    getTotalReservations,
    getPendingReservations 
  } = usePackReservations();
  
  const [selectedReservation, setSelectedReservation] = useState<PackReservation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return 'Inconnu';
    }
  };

  const filteredAndSortedReservations = reservations
    .filter(reservation => {
      const matchesSearch = 
        reservation.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.customerPhone.includes(searchQuery) ||
        reservation.packName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reservation.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || reservation.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "pack_name": return a.packName.localeCompare(b.packName);
        default: return 0;
      }
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a 
                href="/admin/dashboard" 
                className="text-sm text-gray-600 hover:text-mint transition-colors"
              >
                ← Dashboard
              </a>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-charcoal">Réservations de Packs</h1>
                <p className="text-sm text-gray-600">Gérez toutes les réservations de packs</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {reservations.length} réservations • {getPendingReservations().length} en attente
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate">Réservations en attente</p>
                <p className="text-2xl font-bold text-charcoal">
                  {getReservationsByStatus('pending').length}
                </p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate">Réservations confirmées</p>
                <p className="text-2xl font-bold text-charcoal">
                  {getReservationsByStatus('confirmed').length}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate">Réservations terminées</p>
                <p className="text-2xl font-bold text-charcoal">
                  {getReservationsByStatus('completed').length}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate">Total réservations</p>
                <p className="text-2xl font-bold text-charcoal">
                  {getTotalReservations()}
                </p>
              </div>
              <div className="rounded-full bg-mint/10 p-3">
                <Package className="h-6 w-6 text-mint" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Client, téléphone, pack..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmées</option>
                <option value="completed">Terminées</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
              >
                <option value="newest">Plus récentes</option>
                <option value="oldest">Plus anciennes</option>
                <option value="pack_name">Nom du pack</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterStatus("all");
                  setSortBy("newest");
                }}
                className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        <div className="space-y-4">
          {filteredAndSortedReservations.map((reservation) => (
            <div key={reservation.id} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-mint/10 p-3">
                    <Package className="h-5 w-5 text-mint" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal">{reservation.packName}</h3>
                    <p className="text-sm text-slate">{formatDate(reservation.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border ${getStatusColor(reservation.status)}`}>
                    {getStatusIcon(reservation.status)}
                    {getStatusLabel(reservation.status)}
                  </span>
                  <button
                    onClick={() => setSelectedReservation(reservation)}
                    className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1 text-sm text-gray-600 hover:bg-gray-200"
                  >
                    <Eye className="h-4 w-4" />
                    Voir
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-slate">Client</p>
                    <p className="text-sm font-medium text-charcoal">{reservation.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-slate">Téléphone</p>
                    <p className="text-sm font-medium text-charcoal">{reservation.customerPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-slate">Période</p>
                    <p className="text-sm font-medium text-charcoal">{reservation.startDate} - {reservation.endDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-slate">Durée</p>
                    <p className="text-sm font-medium text-charcoal">{reservation.duration}</p>
                  </div>
                </div>
              </div>

              {reservation.status === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                    className="flex items-center gap-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirmer
                  </button>
                  <button
                    onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                    className="flex items-center gap-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                  >
                    <XCircle className="h-4 w-4" />
                    Annuler
                  </button>
                  <button
                    onClick={() => window.open(`https://wa.me/${reservation.customerPhone.replace(/[^\d]/g, '')}`, '_blank')}
                    className="flex items-center gap-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </button>
                </div>
              )}

              {reservation.status === 'confirmed' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => updateReservationStatus(reservation.id, 'completed')}
                    className="flex items-center gap-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Marquer terminée
                  </button>
                  <button
                    onClick={() => window.open(`https://wa.me/${reservation.customerPhone.replace(/[^\d]/g, '')}`, '_blank')}
                    className="flex items-center gap-1 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAndSortedReservations.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune réservation trouvée</h3>
            <p className="mt-2 text-gray-600">
              {searchQuery || filterStatus !== "all"
                ? "Essayez de modifier vos filtres"
                : "Les réservations de packs apparaîtront ici"
              }
            </p>
          </div>
        )}
      </div>

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-charcoal">Détails de la réservation</h2>
              <button
                onClick={() => setSelectedReservation(null)}
                className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Client Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-charcoal">Informations client</h3>
                <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Nom</p>
                      <p className="font-medium text-charcoal">{selectedReservation.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-medium text-charcoal">{selectedReservation.customerPhone}</p>
                    </div>
                  </div>
                  {selectedReservation.customerEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-charcoal">{selectedReservation.customerEmail}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Date de réservation</p>
                      <p className="font-medium text-charcoal">{formatDate(selectedReservation.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => window.open(`https://wa.me/${selectedReservation.customerPhone.replace(/[^\d]/g, '')}`, '_blank')}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-3 text-white hover:bg-green-600"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contacter sur WhatsApp
                  </button>
                  <button
                    onClick={() => window.open(`tel:${selectedReservation.customerPhone}`, '_self')}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-3 text-white hover:bg-blue-600"
                  >
                    <PhoneCall className="h-4 w-4" />
                    Appeler
                  </button>
                </div>
              </div>

              {/* Pack Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-charcoal">Détails du pack</h3>
                <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Pack</p>
                    <p className="font-medium text-charcoal">{selectedReservation.packName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Prix</p>
                    <p className="font-medium text-charcoal">{selectedReservation.packPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="font-medium text-charcoal">{selectedReservation.packDescription}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Période</p>
                    <p className="font-medium text-charcoal">
                      {selectedReservation.startDate} - {selectedReservation.endDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Durée</p>
                    <p className="font-medium text-charcoal">{selectedReservation.duration}</p>
                  </div>
                  {selectedReservation.notes && (
                    <div>
                      <p className="text-sm text-gray-600">Notes</p>
                      <p className="font-medium text-charcoal">{selectedReservation.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Actions */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Statut actuel:</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium border ${getStatusColor(selectedReservation.status)}`}>
                    {getStatusIcon(selectedReservation.status)}
                    {getStatusLabel(selectedReservation.status)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {selectedReservation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          updateReservationStatus(selectedReservation.id, 'confirmed');
                          setSelectedReservation({...selectedReservation, status: 'confirmed'});
                        }}
                        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => {
                          updateReservationStatus(selectedReservation.id, 'cancelled');
                          setSelectedReservation({...selectedReservation, status: 'cancelled'});
                        }}
                        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                      >
                        Annuler
                      </button>
                    </>
                  )}
                  {selectedReservation.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        updateReservationStatus(selectedReservation.id, 'completed');
                        setSelectedReservation({...selectedReservation, status: 'completed'});
                      }}
                      className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                    >
                      Marquer terminée
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
