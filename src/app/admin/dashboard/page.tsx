"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Order } from "@/lib/orders";
import { OrderManager } from "@/lib/orders";
import { PackManager, type Pack } from "@/lib/packs";
import { DashboardMetricsCalculator, type DashboardMetrics } from "@/lib/dashboard-metrics";
import { useNotifications } from "@/components/notification-toast";
import {
  fetchAdminOrders,
  fetchAdminOrderStats,
  updateAdminOrderStatus,
  type AdminOrderStats,
} from "@/lib/api/admin-orders";
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Phone,
  User,
  Package,
  DollarSign,
  Users,
  AlertTriangle,
  Star,
  Timer,
  RefreshCw,
  Truck,
  TrendingUp,
  Mail,
} from "lucide-react";

type DashboardAlert = ReturnType<typeof DashboardMetricsCalculator.getImportantAlerts>[number];
type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  createdAt: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://louaab.ma/api';

const safeString = (value: unknown, fallback = ""): string =>
  typeof value === "string" && value.trim().length > 0 ? value : fallback;

const safeNumber = (value: unknown, fallback = 0): number => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const generatePackId = () => `pack-${Math.random().toString(36).slice(2)}`;

const withTimeout = async <T,>(promise: Promise<T>, ms = 7000, label = 'request'): Promise<T> => {
  let timeoutId: NodeJS.Timeout;
  return new Promise<T>((resolve, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`Timeout ${label}`)), ms);
    promise
      .then((value) => {
        clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};

const mapPackFromApi = (raw: Record<string, unknown>): Pack => {
  const badgeValue = safeString(raw?.badge);

  return {
    id: safeString(raw?.id, generatePackId()),
    name: safeString(raw?.name),
    slug: safeString(raw?.slug),
    description: safeString(raw?.description),
    priceMonthly: safeNumber(raw?.price),
    toyCount: safeNumber(raw?.toyCount),
    durationMonths: Math.max(1, Math.round(safeNumber(raw?.durationDays, 30) / 30)),
    depositAmount: safeNumber(raw?.depositAmount),
    swapIncluded: true,
    swapFrequencyDays: 30,
    citiesAvailable: [],
    isActive: Boolean(raw?.isActive ?? true),
    displayOrder: safeNumber(raw?.displayOrder),
    badge: badgeValue || undefined,
    color: safeString(raw?.color, "mint"),
    icon: safeString(raw?.icon, "🎁"),
    ageRange: "",
    features: (() => {
      const value = raw?.features;
      try {
        if (!value) return [];
        if (Array.isArray(value)) return value as string[];
        if (typeof value === "string") return JSON.parse(value);
        return [];
      } catch {
        return [];
      }
    })(),
  };
};

const fetchPacksSnapshot = async (): Promise<Pack[]> => {
  const response = await fetch(`${API_BASE_URL}/packs`);
  const body = await response.json().catch(() => ({}));

  if (!response.ok || !body?.data || !Array.isArray(body.data)) {
    throw new Error(body?.message || 'Impossible de charger les packs');
  }

  return body.data.map(mapPackFromApi);
};

const STAT_RANGE_OPTIONS = [30, 60, 90, 180];

const mapContactFromApi = (raw: Record<string, any>): ContactMessage => ({
  id: raw?.id ?? `contact-${Math.random().toString(36).slice(2)}`,
  name: raw?.name || "Visiteur",
  email: raw?.email || "N/A",
  message: raw?.message || "",
  status: raw?.status || "new",
  createdAt: raw?.createdAt || new Date().toISOString(),
});

const fetchRecentContacts = async (): Promise<ContactMessage[]> => {
  const response = await fetch(`${API_BASE_URL}/contact`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(body?.data)) {
    throw new Error(body?.message || "Impossible de charger les messages de contact");
  }
  return body.data.slice(0, 5).map(mapContactFromApi);
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<"all" | Order["status"]>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [packsSnapshot, setPacksSnapshot] = useState<Pack[]>([]);
  const [orderStats, setOrderStats] = useState<AdminOrderStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [contactError, setContactError] = useState<string | null>(null);
  const [statsRange, setStatsRange] = useState(90);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const { showSuccess, showWarning, showInfo } = useNotifications();

  const recomputeDashboard = (nextOrders: Order[], packData: Pack[]) => {
    const calculatedMetrics = DashboardMetricsCalculator.calculateMetrics(nextOrders, packData);
    setMetrics(calculatedMetrics);
    setRecentOrders(DashboardMetricsCalculator.getRecentOrders(nextOrders));
    setAlerts(DashboardMetricsCalculator.getImportantAlerts(nextOrders, calculatedMetrics));
  };

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      if (mounted) {
        setIsLoading(true);
      }

      // Load each data source independently - failures don't block others
      const safeLoad = async <T,>(
        fn: () => Promise<T>,
        fallback: T,
        label: string
      ): Promise<T> => {
        try {
          const result = await Promise.race([
            fn(),
            new Promise<T>((_, reject) =>
              setTimeout(() => reject(new Error(`${label} timeout`)), 8000)
            ),
          ]);
          return result;
        } catch (err) {
          console.warn(`Dashboard: ${label} failed:`, err);
          return fallback;
        }
      };

      try {
        // Load all data in parallel, each with its own error handling
        const [ordersData, packsData, statsData, contactData] = await Promise.all([
          safeLoad(fetchAdminOrders, [], 'orders'),
          safeLoad(fetchPacksSnapshot, [], 'packs'),
          safeLoad(() => fetchAdminOrderStats({ rangeDays: statsRange }), null as any, 'stats'),
          safeLoad(fetchRecentContacts, [], 'contacts'),
        ]);

        if (!mounted) return;

        // Set data even if some are empty
        setOrders(ordersData);
        setPacksSnapshot(packsData);
        setOrderStats(statsData);
        setContactMessages(contactData);
        recomputeDashboard(ordersData, packsData);

        // Show warning if no orders loaded (API might be down)
        if (ordersData.length === 0) {
          setError("Aucune commande chargée. L'API est peut-être indisponible.");
        }

        if (!hasWelcomed && ordersData.length > 0) {
          showInfo("Dashboard Admin", `${ordersData.length} commandes chargées.`, 3000);
          setHasWelcomed(true);
        }
      } catch (err) {
        console.error("Dashboard critical error:", err);
        if (mounted) {
          setError("Erreur lors du chargement du dashboard");
        }
      } finally {
        // ALWAYS stop loading - never block
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [statsRange, hasWelcomed]);

  const filteredOrders = orders.filter(order =>
    selectedStatus === "all" || order.status === selectedStatus
  );

  const formatRangeDate = (value?: string) =>
    value ? new Date(value).toLocaleDateString("fr-FR") : "";

  const getContactStatusStyles = (status: string) => {
    switch (status) {
      case "new":
        return "bg-mint/15 text-mint";
      case "in_progress":
        return "bg-yellow-50 text-yellow-700";
      case "resolved":
        return "bg-blue-50 text-blue-700";
      case "closed":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getContactStatusLabel = (status: string) => {
    switch (status) {
      case "new":
        return "Nouveau";
      case "in_progress":
        return "En cours";
      case "resolved":
        return "Résolu";
      case "closed":
        return "Fermé";
      default:
        return status;
    }
  };

  // Loading state removed - dashboard always renders immediately

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    const currentOrder = orders.find(o => o.id === orderId);
    if (!currentOrder) return;

    setUpdatingId(orderId);
    try {
      await updateAdminOrderStatus(orderId, newStatus);
      const nextOrders = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(nextOrders);
      setSelectedOrder(prev =>
        prev && prev.id === orderId ? { ...prev, status: newStatus } : prev
      );
      recomputeDashboard(nextOrders, packsSnapshot);

      if (orderStats) {
        const refreshedStats = await fetchAdminOrderStats({
          rangeDays: orderStats.period.rangeDays,
        });
        setOrderStats(refreshedStats);
      }

      switch (newStatus) {
        case 'confirmed':
          showSuccess(
            "Commande confirmée",
            `La commande ${orderId} de ${currentOrder.customerName} a été confirmée.`,
            4000
          );
          break;
        case 'completed':
          showSuccess(
            "Commande terminée",
            `La commande ${orderId} de ${currentOrder.customerName} a été marquée comme terminée.`,
            4000
          );
          break;
        case 'cancelled':
          showWarning(
            "Commande annulée",
            `La commande ${orderId} de ${currentOrder.customerName} a été annulée.`,
            4000
          );
          break;
      }
    } catch (error) {
      console.error('Impossible de mettre à jour la commande:', error);
      showWarning(
        "Erreur",
        "Impossible de mettre à jour le statut de la commande.",
        4000
      );
    } finally {
      setUpdatingId(null);
    }
  };

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
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-mint transition-colors"
              >
                ← Retour au site
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-charcoal">Dashboard Admin</h1>
                <p className="text-sm text-gray-600">Gérez les commandes et les réservations</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/orders"
                className="flex items-center gap-2 rounded-lg bg-mint/10 px-3 py-2 text-sm font-medium text-mint hover:bg-mint/20 transition"
              >
                <ShoppingCart className="h-4 w-4" />
                Commandes
              </Link>
              <Link
                href="/admin/inventory"
                className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
              >
                <Package className="h-4 w-4" />
                Inventaire
              </Link>
              <Link
                href="/admin/pack-reservations"
                className="flex items-center gap-2 rounded-lg bg-purple-100 px-3 py-2 text-sm font-medium text-purple-700 hover:bg-purple-200 transition"
              >
                <Package className="h-4 w-4" />
                Réservations
              </Link>
              <Link
                href="/admin/packs"
                className="flex items-center gap-2 rounded-lg bg-orange-100 px-3 py-2 text-sm font-medium text-orange-700 hover:bg-orange-200 transition"
              >
                <Package className="h-4 w-4" />
                Gérer Packs
              </Link>
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Métriques réelles du dashboard */}
        {metrics && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Abonnements actifs */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate">Abonnements actifs</p>
                  <p className="text-2xl font-bold text-charcoal">
                    {metrics.activeSubscriptions}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {metrics.subscriptionGrowth > 0 ? '+' : ''}{metrics.subscriptionGrowth}%
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Jouets en circulation */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate">Jouets en circulation</p>
                  <p className="text-2xl font-bold text-charcoal">
                    {metrics.toysInCirculation}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {metrics.toysGrowth > 0 ? '+' : ''}{metrics.toysGrowth}%
                  </p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Livraisons du jour */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate">Livraisons du jour</p>
                  <p className="text-2xl font-bold text-charcoal">
                    {metrics.todaysDeliveries}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {metrics.inProgressDeliveries} en cours
                  </p>
                </div>
                <div className="rounded-full bg-orange-100 p-3">
                  <Truck className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Satisfaction NPS */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate">Satisfaction (NPS)</p>
                  <p className="text-2xl font-bold text-charcoal">
                    {metrics.npsScore}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {metrics.npsImprovement > 0 ? '+' : ''}{metrics.npsImprovement} pts
                  </p>
                </div>
                <div className="rounded-full bg-yellow-100 p-3">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Métriques secondaires */}
        {metrics && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Temps de traitement moyen */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate">Temps de traitement moyen</p>
                  <p className="text-2xl font-bold text-charcoal">
                    {metrics.averageProcessingTime} min
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Temps moyen
                  </p>
                </div>
                <div className="rounded-full bg-purple-100 p-3">
                  <Timer className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Taux de renouvellement */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate">Taux de renouvellement</p>
                  <p className="text-2xl font-bold text-charcoal">
                    {metrics.renewalRate}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Clients fidèles
                  </p>
                </div>
                <div className="rounded-full bg-mint/10 p-3">
                  <RefreshCw className="h-6 w-6 text-mint" />
                </div>
              </div>
            </div>

            {/* Revenu mensuel */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate">Revenu mensuel</p>
                  <p className="text-2xl font-bold text-charcoal">
                    {metrics.monthlyRevenue.toLocaleString()} MAD
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Ce mois-ci
                  </p>
                </div>
                <div className="rounded-full bg-green-100 p-3">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* Commandes en attente */}
            <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate">Commandes en attente</p>
                  <p className="text-2xl font-bold text-charcoal">
                    {orders.filter(o => o.status === 'pending').length}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {orders.filter(o => o.status === 'pending').length > 0
                      ? "⚠️ Action requise"
                      : "✅ À jour"}
                  </p>
                </div>
                <div className="rounded-full bg-yellow-100 p-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {orderStats && (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-charcoal">Période analysée</p>
                <p className="text-xs text-slate">
                  Du {formatRangeDate(orderStats.period.from)} au{" "}
                  {formatRangeDate(orderStats.period.to)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {STAT_RANGE_OPTIONS.map((range) => (
                  <button
                    key={range}
                    onClick={() => setStatsRange(range)}
                    className={`rounded-full px-4 py-1 text-xs font-semibold transition ${statsRange === range
                      ? "bg-mint text-white"
                      : "bg-gray-100 text-slate hover:bg-gray-200"
                      }`}
                  >
                    {range} j
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal">Top jouets loués</h3>
                    <p className="text-xs text-gray-500">Derniers {orderStats.period.rangeDays} jours</p>
                  </div>
                  <Package className="h-5 w-5 text-mint" />
                </div>
                <div className="space-y-3">
                  {orderStats.topToys.length === 0 && (
                    <p className="text-sm text-gray-500">Pas encore de données.</p>
                  )}
                  {orderStats.topToys.map((toy) => (
                    <div key={toy.toyId || toy.toyName} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-charcoal">{toy.toyName}</p>
                        <p className="text-xs text-gray-500">{toy.rentals} locations</p>
                      </div>
                      <p className="text-sm font-semibold text-mint">{toy.revenue.toFixed(0)} MAD</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal">Clients fidèles</h3>
                    <p className="text-xs text-gray-500">Basé sur le volume de commandes</p>
                  </div>
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div className="space-y-3">
                  {orderStats.loyalCustomers.length === 0 && (
                    <p className="text-sm text-gray-500">Aucun client récurrent pour le moment.</p>
                  )}
                  {orderStats.loyalCustomers.map((client) => (
                    <div key={client.customerId || client.customerName} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-charcoal">{client.customerName}</p>
                        <p className="text-xs text-gray-500">{client.orders} commandes</p>
                      </div>
                      <p className="text-sm font-semibold text-mint">{client.revenue.toFixed(0)} MAD</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal">Clients à forte valeur</h3>
                    <p className="text-xs text-gray-500">Top clients par chiffre d&apos;affaires</p>
                  </div>
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="space-y-3">
                  {orderStats.topCustomers.length === 0 && (
                    <p className="text-sm text-gray-500">Aucune donnée disponible.</p>
                  )}
                  {orderStats.topCustomers.map((client) => (
                    <div key={`${client.customerId || client.customerName}-top`} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-charcoal">{client.customerName}</p>
                        <p className="text-xs text-gray-500">{client.orders} commandes</p>
                      </div>
                      <p className="text-sm font-semibold text-mint">{client.revenue.toFixed(0)} MAD</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-charcoal">Tendance revenus</h3>
                    <p className="text-xs text-gray-500">Revenu par mois</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <div className="space-y-3">
                  {orderStats.revenueByMonth.length === 0 && (
                    <p className="text-sm text-gray-500">Pas suffisamment de données.</p>
                  )}
                  {orderStats.revenueByMonth.map((row) => (
                    <div key={row.period} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-charcoal">{row.period}</p>
                        <p className="text-xs text-gray-500">{row.orders} commandes</p>
                      </div>
                      <p className="text-sm font-semibold text-mint">{row.revenue.toFixed(0)} MAD</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Alertes réelles calculées */}
        {alerts.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Alertes & Notifications</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`rounded-lg border p-4 ${alert.type === 'error' ? 'bg-red-50 border-red-200' :
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                      alert.type === 'success' ? 'bg-green-50 border-green-200' :
                        'bg-blue-50 border-blue-200'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {alert.type === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                    {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                    {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {alert.type === 'info' && <Clock className="h-5 w-5 text-blue-600" />}
                    <div>
                      <h4 className={`text-sm font-semibold ${alert.type === 'error' ? 'text-red-800' :
                        alert.type === 'warning' ? 'text-yellow-800' :
                          alert.type === 'success' ? 'text-green-800' :
                            'text-blue-800'
                        }`}>
                        {alert.title}
                      </h4>
                      <p className={`text-sm ${alert.type === 'error' ? 'text-red-700' :
                        alert.type === 'warning' ? 'text-yellow-700' :
                          alert.type === 'success' ? 'text-green-700' :
                            'text-blue-700'
                        }`}>
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-charcoal">Messages de contact</h2>
              <p className="text-xs text-gray-500">Derniers formulaires reçus</p>
            </div>
            <Link
              href="/admin/contact-messages"
              className="text-sm font-semibold text-mint hover:underline"
            >
              Voir tous les messages
            </Link>
          </div>
          {contactError && (
            <div className="mb-3 rounded-lg bg-coral/10 px-3 py-2 text-sm text-coral">
              {contactError}
            </div>
          )}
          {contactMessages.length === 0 && !contactError ? (
            <p className="text-sm text-slate">
              Aucun message récent. Encouragez les visiteurs à utiliser la page contact.
            </p>
          ) : (
            <div className="divide-y divide-mist">
              {contactMessages.map((message) => (
                <div key={message.id} className="flex items-start justify-between gap-4 py-4">
                  <div className="max-w-md">
                    <p className="text-sm font-semibold text-charcoal">{message.name}</p>
                    <p className="text-xs text-slate">{message.email}</p>
                    <p
                      className="mt-2 text-sm text-slate max-w-xs overflow-hidden text-ellipsis"
                      style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                    >
                      {message.message}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getContactStatusStyles(
                        message.status,
                      )}`}
                    >
                      {getContactStatusLabel(message.status)}
                    </span>
                    <p className="mt-2 text-xs text-gray-500">
                      {formatRangeDate(message.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Commandes récentes */}
        {recentOrders.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Commandes récentes</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentOrders.map((order, index) => (
                <div key={`${order.id}-${index}`} className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-full bg-mint/10 p-2">
                        <ShoppingCart className="h-4 w-4 text-mint" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-charcoal text-sm">{order.id}</h4>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status === 'pending' ? 'En attente' :
                        order.status === 'confirmed' ? 'Confirmée' :
                          order.status === 'completed' ? 'Terminée' : 'Annulée'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{order.customerPhone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{order.items.length} article(s)</span>
                      <span className="text-sm font-semibold text-charcoal">{order.totalPrice} MAD</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedStatus === 'all'
                ? 'bg-mint text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedStatus === 'pending'
                ? 'bg-mint text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              En attente
            </button>
            <button
              onClick={() => setSelectedStatus('confirmed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedStatus === 'confirmed'
                ? 'bg-mint text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Confirmées
            </button>
            <button
              onClick={() => setSelectedStatus('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedStatus === 'completed'
                ? 'bg-mint text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              Terminées
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <div key={`${order.id}-${index}`} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-mint/10 p-2">
                    <ShoppingCart className="h-5 w-5 text-mint" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal">{order.id}</h3>
                    <p className="text-sm text-slate">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status === 'pending' ? 'En attente' :
                      order.status === 'confirmed' ? 'Confirmée' :
                        order.status === 'completed' ? 'Terminée' : 'Annulée'}
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
                    disabled={updatingId === order.id}
                    className="flex items-center gap-1 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updatingId === order.id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {updatingId === order.id ? 'En cours...' : 'Confirmer'}
                  </button>
                  <button
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                    disabled={updatingId === order.id}
                    className="flex items-center gap-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updatingId === order.id ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {updatingId === order.id ? 'En cours...' : 'Annuler'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-charcoal">Détails de la commande</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-slate">Client</p>
                    <p className="text-charcoal">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate">Téléphone</p>
                    <p className="text-charcoal">{selectedOrder.customerPhone}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate mb-2">Articles commandés</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="rounded-lg bg-gray-50 p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-charcoal">{item.toyName}</p>
                            <p className="text-sm text-slate">
                              {item.duration} • {item.startDate}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-charcoal">{item.price} MAD</p>
                            <p className="text-sm text-slate">x{item.quantity}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-charcoal">Total</span>
                    <span className="text-lg font-bold text-mint">{selectedOrder.totalPrice} MAD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
