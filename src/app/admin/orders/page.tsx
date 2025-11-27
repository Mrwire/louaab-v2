"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  fetchAdminOrderStats,
  fetchAdminOrders,
  resetAdminOrder,
  updateAdminOrderStatus,
  type AdminOrderStats,
} from "@/lib/api/admin-orders";
import type { Order } from "@/lib/orders";
import { OrderManager } from "@/lib/orders";
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Package,
  Phone,
  RefreshCw,
  Search,
  Shield,
  ShoppingCart,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import Image from "next/image";

type StatusKey = Order["status"];

const statusLabels: Record<StatusKey, string> = {
  pending: "En attente",
  confirmed: "Confirmée",
  delivered: "Livrée",
  returned: "Restituée",
  completed: "Terminée",
  cancelled: "Annulée",
};

const statusColors: Record<StatusKey, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  delivered: "bg-indigo-100 text-indigo-800 border-indigo-200",
  returned: "bg-emerald-100 text-emerald-800 border-emerald-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const statusIcon = (status: StatusKey) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "confirmed":
      return <CheckCircle className="h-4 w-4" />;
    case "delivered":
      return <Truck className="h-4 w-4" />;
    case "returned":
      return <Shield className="h-4 w-4" />;
    case "completed":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<AdminOrderStats | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusKey | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price_high" | "price_low">("newest");

  const isLocalOrder = (order?: Order | null) => !order?.id || order.id.startsWith("local");

  useEffect(() => {
    void loadOrders();
  }, []);

  const loadOrders = async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    setError(null);
    silent ? setIsRefreshing(true) : setLoading(true);

    try {
      const [ordersData, statsData] = await Promise.all([fetchAdminOrders(), fetchAdminOrderStats()]);
      setOrders(ordersData);
      setStats(statsData);
    } catch (err) {
      console.error("Erreur lors du chargement des commandes:", err);
      const cached = OrderManager.getAllOrders();
      if (cached.length) {
        setOrders(cached);
        setError("API indisponible, affichage des commandes locales");
      } else {
        setError(err instanceof Error ? err.message : "Impossible de charger les commandes");
      }
    } finally {
      silent ? setIsRefreshing(false) : setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: StatusKey) => {
    setUpdatingId(orderId);
    setError(null);
    try {
      let target = orders.find((o) => o.id === orderId);
      if (isLocalOrder(target)) {
        await loadOrders({ silent: true });
        target = orders.find((o) => o.id === orderId);
        if (isLocalOrder(target)) {
          setError('Commande locale : cliquez sur "Actualiser" pour récupérer l’ID backend avant mise à jour.');
          return;
        }
      }
      const updatedOrder = await updateAdminOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      setSelectedOrder((prev) => (prev && prev.id === orderId ? updatedOrder : prev));
      await loadOrders({ silent: true });
    } catch (err) {
      console.error("Impossible de mettre à jour la commande:", err);
      setError(err instanceof Error ? err.message : "Impossible de mettre à jour le statut de la commande");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmAndSendToReturns = async (orderId: string) => {
    // Confirme (décrémente stock) puis passe en livré pour apparaître dans /returns
    await updateOrderStatus(orderId, "confirmed");
    await updateOrderStatus(orderId, "delivered");
  };

  const resetOrder = async (orderId: string) => {
    setUpdatingId(orderId);
    setError(null);
    try {
      const updatedOrder = await resetAdminOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      setSelectedOrder((prev) => (prev && prev.id === orderId ? updatedOrder : prev));
    } catch (err) {
      console.error("Impossible de réinitialiser la commande:", err);
      setError(err instanceof Error ? err.message : "Impossible de réinitialiser la commande");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAndSortedOrders = orders
    .filter((order) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        order.customerName.toLowerCase().includes(q) ||
        (order.customerPhone || "").toLowerCase().includes(q) ||
        (order.id || "").toLowerCase().includes(q) ||
        (order.orderNumber || "").toLowerCase().includes(q);
      const matchesStatus = filterStatus === "all" || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price_high":
          return b.totalPrice - a.totalPrice;
        case "price_low":
          return a.totalPrice - b.totalPrice;
        default:
          return 0;
      }
    });

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const statusCount = (status: StatusKey) =>
    stats?.statusBreakdown?.[status] ?? orders.filter((o) => o.status === status).length;

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
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-semibold text-slate">Tableau de bord</p>
              <h1 className="text-2xl font-bold text-charcoal">Commandes</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadOrders({ silent: true })}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Actualiser
              </button>
            </div>
          </div>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total commandes" value={orders.length} icon={<ShoppingCart className="h-5 w-5" />} />
            <StatCard title="En attente" value={statusCount("pending")} icon={<Clock className="h-5 w-5" />} />
            <StatCard title="Confirmées" value={statusCount("confirmed")} icon={<CheckCircle className="h-5 w-5" />} />
            <StatCard title="Terminées" value={statusCount("completed")} icon={<Shield className="h-5 w-5" />} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
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
                onChange={(e) => setFilterStatus(e.target.value as StatusKey | "all")}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-mint focus:border-mint"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmées</option>
                <option value="delivered">Livrées</option>
                <option value="returned">Restituées</option>
                <option value="completed">Terminées</option>
                <option value="cancelled">Annulées</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trier par</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
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

        <div className="space-y-4">
          {filteredAndSortedOrders.map((order) => (
            <div key={order.id} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-mint/10 p-3">
                    <ShoppingCart className="h-5 w-5 text-mint" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal">{order.orderNumber || order.id}</h3>
                    <p className="text-sm text-slate">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border ${statusColors[order.status]}`}
                  >
                    {statusIcon(order.status)}
                    {statusLabels[order.status]}
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
                <InfoRow icon={<User className="h-4 w-4 text-gray-400" />} label="Client" value={order.customerName} />
                <InfoRow icon={<Phone className="h-4 w-4 text-gray-400" />} label="Téléphone" value={order.customerPhone} />
                <InfoRow icon={<Package className="h-4 w-4 text-gray-400" />} label="Articles" value={`${order.items.length}`} />
                <InfoRow icon={<DollarSign className="h-4 w-4 text-gray-400" />} label="Total" value={`${order.totalPrice} MAD`} />
              </div>

              {order.items.length > 0 && (
                <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate mb-2">Articles</p>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="min-w-[170px] rounded-lg bg-white border border-gray-100 p-3 flex gap-3 shadow-sm"
                      >
                        {item.imageUrl ? (
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                            <Image src={item.imageUrl} alt={item.toyName} fill className="object-cover" sizes="48px" />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-slate">
                            -
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-charcoal line-clamp-1">{item.toyName}</p>
                          <p className="text-xs text-slate">
                            Quantité {item.quantity} · Stock {item.availableQuantity ?? item.stockQuantity ?? "?"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <OrderActions
                order={order}
                updatingId={updatingId}
                onUpdate={updateOrderStatus}
                onConfirmAndDeliver={confirmAndSendToReturns}
                onReset={resetOrder}
              />
            </div>
          ))}
        </div>

        {filteredAndSortedOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucune commande trouvée</h3>
            <p className="mt-2 text-gray-600">
              {searchQuery || filterStatus !== "all"
                ? "Essayez de modifier vos filtres"
                : "Les commandes apparaîtront ici une fois passées"}
            </p>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase font-semibold text-slate">Commande</p>
                <h2 className="text-2xl font-bold text-charcoal">{selectedOrder.orderNumber || selectedOrder.id}</h2>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-charcoal">Informations client</h3>
                <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                  <InfoRow icon={<User className="h-5 w-5 text-gray-400" />} label="Nom" value={selectedOrder.customerName} />
                  <InfoRow icon={<Phone className="h-5 w-5 text-gray-400" />} label="Téléphone" value={selectedOrder.customerPhone} />
                  <InfoRow icon={<Calendar className="h-5 w-5 text-gray-400" />} label="Date de commande" value={formatDate(selectedOrder.createdAt)} />
                  {selectedOrder.deliveryAddress && (
                    <InfoRow icon={<Truck className="h-5 w-5 text-gray-400" />} label="Adresse" value={selectedOrder.deliveryAddress} />
                  )}
                  {selectedOrder.notes && (
                    <InfoRow icon={<Package className="h-5 w-5 text-gray-400" />} label="Notes" value={selectedOrder.notes} />
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-charcoal">Articles commandés</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="rounded-lg bg-gray-50 p-4 flex gap-3">
                      {item.imageUrl ? (
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-white border border-gray-100">
                          <Image src={item.imageUrl} alt={item.toyName} fill className="object-cover" sizes="64px" />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-xs text-slate">
                          -
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-charcoal">{item.toyName}</h4>
                          <span className="font-semibold text-mint">{item.price} MAD</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>Quantité: {item.quantity}</div>
                          <div>Durée: {item.duration}</div>
                          <div>Date: {item.startDate}</div>
                          <div>
                            Stock dispo: <span className="font-semibold text-charcoal">{item.availableQuantity ?? item.stockQuantity ?? "N/A"}</span>
                            {item.stockQuantity !== undefined && (
                              <span className="ml-1 text-xs text-slate">/ {item.stockQuantity}</span>
                            )}
                          </div>
                        </div>
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

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Statut actuel:</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium border ${statusColors[selectedOrder.status]}`}
                  >
                    {statusIcon(selectedOrder.status)}
                    {statusLabels[selectedOrder.status]}
                  </span>
                </div>
        <OrderActions
          order={selectedOrder}
          updatingId={updatingId}
          onUpdate={updateOrderStatus}
          onConfirmAndDeliver={confirmAndSendToReturns}
          onReset={resetOrder}
          compact
        />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type StatCardProps = { title: string; value: number; icon: ReactNode };
function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm flex items-center gap-3">
      <div className="rounded-lg bg-mint/10 p-2 text-mint">{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate">{title}</p>
        <p className="text-xl font-bold text-charcoal">{value}</p>
      </div>
    </div>
  );
}

type InfoRowProps = { icon: ReactNode; label: string; value?: string | number | null };
function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <p className="text-xs text-slate">{label}</p>
        <p className="text-sm font-medium text-charcoal">{value ?? "-"}</p>
      </div>
    </div>
  );
}

type OrderActionsProps = {
  order: Order;
  updatingId: string | null;
  onUpdate: (id: string, status: StatusKey) => Promise<void>;
  onConfirmAndDeliver?: (id: string) => Promise<void>;
  onReset?: (id: string) => Promise<void>;
  compact?: boolean;
  disabled?: boolean;
};
function OrderActions({ order, updatingId, onUpdate, onReset, onConfirmAndDeliver, compact, disabled }: OrderActionsProps) {
  const busy = updatingId === order.id;

  const btnClass =
    "flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60";

  const resetButton = onReset ? (
    <button
      onClick={() => onReset(order.id)}
      disabled={busy}
      className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
    >
      <RefreshCw className="h-4 w-4" />
      Reset
    </button>
  ) : null;

  const stackClass = `mt-4 flex gap-2 flex-wrap ${compact ? "" : ""}`;

  if (order.status === "pending") {
    return (
      <div className={stackClass}>
        <button
          onClick={() => (onConfirmAndDeliver ? onConfirmAndDeliver(order.id) : onUpdate(order.id, "confirmed"))}
          disabled={busy || disabled}
          className={`${btnClass} bg-blue-500 hover:bg-blue-600`}
        >
          {busy ? <Spinner /> : <CheckCircle className="h-4 w-4" />}
          {busy ? "En cours..." : "Confirmer"}
        </button>
        <button
          onClick={() => onUpdate(order.id, "cancelled")}
          disabled={busy || disabled}
          className={`${btnClass} bg-red-500 hover:bg-red-600`}
        >
          {busy ? <Spinner /> : <XCircle className="h-4 w-4" />}
          {busy ? "En cours..." : "Annuler"}
        </button>
        {resetButton}
      </div>
    );
  }

  if (order.status === "delivered") {
    return (
      <div className={stackClass}>
        <button
          onClick={() => onUpdate(order.id, "returned")}
          disabled={busy || disabled}
          className={`${btnClass} bg-emerald-600 hover:bg-emerald-700`}
        >
          {busy ? <Spinner /> : <Shield className="h-4 w-4" />}
          {busy ? "En cours..." : "Marquer restituée"}
        </button>
        {resetButton}
      </div>
    );
  }

  if (order.status === "returned") {
    return (
      <div className={stackClass}>
        <button
          onClick={() => onUpdate(order.id, "completed")}
          disabled={busy || disabled}
          className={`${btnClass} bg-mint hover:bg-mint/90`}
        >
          {busy ? <Spinner /> : <CheckCircle className="h-4 w-4" />}
          {busy ? "En cours..." : "Clôturer"}
        </button>
        {resetButton}
      </div>
    );
  }

  return resetButton ? <div className={stackClass}>{resetButton}</div> : null;
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />;
}

type ActionButtonProps = { onClick: () => void; icon: ReactNode; label: string; tone?: "primary" | "secondary" };
function ActionButton({ onClick, icon, label, tone = "primary" }: ActionButtonProps) {
  const base = tone === "primary" ? "bg-[#1897aa] hover:bg-[#0d74b1]" : "bg-[#0d74b1] hover:bg-[#1897aa]";
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-white ${base}`}
    >
      {icon}
      {label}
    </button>
  );
}
