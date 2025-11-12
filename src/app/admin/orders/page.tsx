"use client";

import { useState, useEffect } from "react";
import { OrderManager, Order } from "@/lib/orders";
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Phone, 
  Calendar,
  User,
  Package,
  DollarSign,
  Search,
  Filter,
  MoreVertical,
  MessageCircle,
  PhoneCall,
  Mail,
  MapPin,
  Truck,
  AlertTriangle
} from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    try {
      const allOrders = OrderManager.getAllOrders();
      setOrders(allOrders);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      setLoading(false);
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    OrderManager.updateOrderStatus(orderId, newStatus);
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

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

  const filteredAndSortedOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerPhone.includes(searchQuery) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === "all" || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price_high": return b.totalPrice - a.totalPrice;
        case "price_low": return a.totalPrice - b.totalPrice;
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

  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + order.totalPrice, 0);
  };

  const getPendingOrdersCount = () => {
    return orders.filter(order => order.status === 'pending').length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-mint border-t-transparent"></div>
          <p className="mt-4 text-slate">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-xl font-bold text-charcoal">Gestion des Commandes</h1>
                <p className="text-sm text-gray-600">Gérez toutes les commandes clients</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {orders.length} commandes • {getPendingOrdersCount()} en attente
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
                <p className="text-sm font-medium text-slate">Commandes en attente</p>
                <p className="text-2xl font-bold text-charcoal">
                  {orders.filter(o => o.status === 'pending').length}
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
                <p className="text-sm font-medium text-slate">Commandes confirmées</p>
                <p className="text-2xl font-bold text-charcoal">
                  {orders.filter(o => o.status === 'confirmed').length}
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
                <p className="text-sm font-medium text-slate">Commandes terminées</p>
                <p className="text-2xl font-bold text-charcoal">
                  {orders.filter(o => o.status === 'completed').length}
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
                <p className="text-sm font-medium text-slate">Chiffre d'affaires</p>
                <p className="text-2xl font-bold text-charcoal">
                  {getTotalRevenue().toFixed(0)} MAD
                </p>
              </div>
              <div className="rounded-full bg-mint/10 p-3">
                <DollarSign className="h-6 w-6 text-mint" />
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
                  placeholder="Client, téléphone, ID..."
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
                <option value="price_high">Prix élevé</option>
                <option value="price_low">Prix bas</option>
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

        {/* Orders List */}
        <div className="space-y-4">
          {filteredAndSortedOrders.map((order) => (
            <div key={order.id} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-mint/10 p-3">
                    <ShoppingCart className="h-5 w-5 text-mint" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal">{order.id}</h3>
                    <p className="text-sm text-slate">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </span>
                  <button
                    onClick={() => setSelectedOrder(order)}
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
                    <p className="text-sm font-medium text-charcoal">{order.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-slate">Téléphone</p>
                    <p className="text-sm font-medium text-charcoal">{order.customerPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-slate">Articles</p>
                    <p className="text-sm font-medium text-charcoal">{order.items.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-slate">Total</p>
                    <p className="text-sm font-medium text-charcoal">{order.totalPrice} MAD</p>
                  </div>
                </div>
              </div>

              {order.status === 'pending' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => updateOrderStatus(order.id, 'confirmed')}
                    className="flex items-center gap-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Confirmer
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    className="flex items-center gap-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                  >
                    <XCircle className="h-4 w-4" />
                    Annuler
                  </button>
                  <button
                    onClick={() => window.open(`https://wa.me/${order.customerPhone.replace(/[^\d]/g, '')}`, '_blank')}
                    className="flex items-center gap-1 rounded-lg bg-[#1897aa] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d74b1]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </button>
                </div>
              )}

              {order.status === 'confirmed' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    className="flex items-center gap-1 rounded-lg bg-[#1897aa] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d74b1]"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Marquer terminée
                  </button>
                  <button
                    onClick={() => window.open(`https://wa.me/${order.customerPhone.replace(/[^\d]/g, '')}`, '_blank')}
                    className="flex items-center gap-1 rounded-lg bg-[#1897aa] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d74b1]"
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
        {filteredAndSortedOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune commande trouvée</h3>
            <p className="mt-2 text-gray-600">
              {searchQuery || filterStatus !== "all"
                ? "Essayez de modifier vos filtres"
                : "Les commandes apparaîtront ici une fois passées"
              }
            </p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-charcoal">Détails de la commande</h2>
              <button
                onClick={() => setSelectedOrder(null)}
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
                      <p className="font-medium text-charcoal">{selectedOrder.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Téléphone</p>
                      <p className="font-medium text-charcoal">{selectedOrder.customerPhone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Date de commande</p>
                      <p className="font-medium text-charcoal">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => window.open(`https://wa.me/${selectedOrder.customerPhone.replace(/[^\d]/g, '')}`, '_blank')}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#1897aa] px-4 py-3 text-white hover:bg-[#0d74b1]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contacter sur WhatsApp
                  </button>
                  <button
                    onClick={() => window.open(`tel:${selectedOrder.customerPhone}`, '_self')}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#0d74b1] px-4 py-3 text-white hover:bg-[#1897aa]"
                  >
                    <PhoneCall className="h-4 w-4" />
                    Appeler
                  </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-charcoal">Articles commandés</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="rounded-lg bg-gray-50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-charcoal">{item.toyName}</h4>
                        <span className="font-semibold text-mint">{item.price} MAD</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>Quantité: {item.quantity}</div>
                        <div>Durée: {item.duration}</div>
                        <div>Date: {item.startDate}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-charcoal">Total</span>
                    <span className="text-2xl font-bold text-mint">{selectedOrder.totalPrice} MAD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Actions */}
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Statut actuel:</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium border ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div className="flex gap-2">
                  {selectedOrder.status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'confirmed');
                          setSelectedOrder({...selectedOrder, status: 'confirmed'});
                        }}
                        className="rounded-lg bg-[#1897aa] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d74b1]"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, 'cancelled');
                          setSelectedOrder({...selectedOrder, status: 'cancelled'});
                        }}
                        className="rounded-lg bg-[#e72c37] px-4 py-2 text-sm font-medium text-white hover:bg-[#e72c37]/90"
                      >
                        Annuler
                      </button>
                    </>
                  )}
                  {selectedOrder.status === 'confirmed' && (
                    <button
                      onClick={() => {
                        updateOrderStatus(selectedOrder.id, 'completed');
                        setSelectedOrder({...selectedOrder, status: 'completed'});
                      }}
                      className="rounded-lg bg-[#1897aa] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d74b1]"
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