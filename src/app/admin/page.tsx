"use client";

import { useState, useEffect } from "react";
import { OrderManager, Order } from "@/lib/orders";
import { PackManager } from "@/lib/packs";
import { DashboardMetricsCalculator, DashboardMetrics } from "@/lib/dashboard-metrics";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
} from "lucide-react";

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    // Initialiser les données d'exemple si nécessaire
    OrderManager.initializeSampleData();
    
    // Charger les données
    const allOrders = OrderManager.getAllOrders();
    const allPacks = PackManager.getAllPacks();
    
    setOrders(allOrders);
    setPacks(allPacks);
    
    // Calculer les métriques
    const calculatedMetrics = DashboardMetricsCalculator.calculateMetrics(allOrders, allPacks);
    setMetrics(calculatedMetrics);
    
    // Récupérer les commandes récentes
    const recent = DashboardMetricsCalculator.getRecentOrders(allOrders);
    setRecentOrders(recent);
    
    // Calculer les alertes
    const calculatedAlerts = DashboardMetricsCalculator.getImportantAlerts(allOrders, calculatedMetrics);
    setAlerts(calculatedAlerts);
  }, []);

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Fonction pour obtenir le nom du pack depuis les items
  const getPackName = (order: Order) => {
    if (order.items.length > 0) {
      return order.items[0].toyName;
    }
    return "Pack personnalisé";
  };

  // Fonction pour mapper les statuts
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      pending: { label: "En attente", color: "bg-sunshine-yellow/20 text-sunshine-yellow border-sunshine-yellow/30" },
      confirmed: { label: "Confirmé", color: "bg-sky-blue/20 text-sky-blue border-sky-blue/30" },
      completed: { label: "Terminé", color: "bg-mint/20 text-mint border-mint/30" },
      cancelled: { label: "Annulé", color: "bg-coral/20 text-coral border-coral/30" }
    };
    return statusMap[status] || { label: status, color: "bg-gray/20 text-gray border-gray/30" };
  };

  // Fonction pour obtenir l'icône d'alerte
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return '🔴';
      case 'warning': return '🟡';
      case 'success': return '🟢';
      default: return '🔵';
    }
  };

  // Créer les KPIs dynamiques
  const kpis = metrics ? [
    {
      label: "Abonnements actifs",
      value: metrics.activeSubscriptions.toString(),
      change: `${metrics.subscriptionGrowth > 0 ? '+' : ''}${metrics.subscriptionGrowth}%`,
      trend: metrics.subscriptionGrowth > 0 ? "up" : metrics.subscriptionGrowth < 0 ? "down" : "neutral",
      icon: Users,
      color: "mint",
    },
    {
      label: "Jouets en circulation",
      value: metrics.toysInCirculation.toString(),
      change: `${metrics.toysGrowth > 0 ? '+' : ''}${metrics.toysGrowth}%`,
      trend: metrics.toysGrowth > 0 ? "up" : metrics.toysGrowth < 0 ? "down" : "neutral",
      icon: Package,
      color: "peach",
    },
    {
      label: "Livraisons du jour",
      value: metrics.todaysDeliveries.toString(),
      change: `${metrics.inProgressDeliveries} en cours`,
      trend: "neutral",
      icon: Truck,
      color: "sky-blue",
    },
    {
      label: "Satisfaction (NPS)",
      value: metrics.npsScore.toString(),
      change: `${metrics.npsImprovement > 0 ? '+' : ''}${metrics.npsImprovement} pts`,
      trend: metrics.npsImprovement > 0 ? "up" : metrics.npsImprovement < 0 ? "down" : "neutral",
      icon: TrendingUp,
      color: "lilac",
    },
  ] : [];

  if (!metrics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint mx-auto"></div>
          <p className="mt-4 text-slate">Chargement des données...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-charcoal">Dashboard</h1>
        <p className="mt-2 text-slate">Vue d'ensemble de votre activité</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate">{kpi.label}</p>
                  <p className="mt-2 text-3xl font-bold text-charcoal">
                    {kpi.value}
                  </p>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      kpi.trend === "up"
                        ? "text-fresh-green"
                        : kpi.trend === "down"
                        ? "text-coral"
                        : "text-slate"
                    }`}
                  >
                    {kpi.change}
                  </p>
                </div>
                <div
                  className={`rounded-xl bg-${kpi.color}/10 p-3`}
                  style={{
                    backgroundColor:
                      kpi.color === "mint"
                        ? "#97E3C020"
                        : kpi.color === "peach"
                        ? "#FFCDB220"
                        : kpi.color === "sky-blue"
                        ? "#B8E4FF20"
                        : "#D8C8FF20",
                  }}
                >
                  <Icon size={24} className="text-charcoal" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Alerts */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-charcoal">Alertes</h2>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-coral/20 text-xs font-bold text-coral">
                {alerts.length}
              </span>
            </div>

            <div className="space-y-3">
              {alerts.length > 0 ? alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`rounded-xl border-l-4 p-4 ${
                    alert.type === "error"
                      ? "border-coral bg-coral/5"
                      : alert.type === "warning"
                      ? "border-sunshine-yellow bg-sunshine-yellow/5"
                      : alert.type === "success"
                      ? "border-mint bg-mint/5"
                      : "border-sky-blue bg-sky-blue/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      size={18}
                      className={
                        alert.type === "error"
                          ? "text-coral"
                          : alert.type === "warning"
                          ? "text-sunshine-yellow"
                          : alert.type === "success"
                          ? "text-mint"
                          : "text-sky-blue"
                      }
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-charcoal">
                        {alert.title}
                      </p>
                      <p className="text-xs text-slate mt-1">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <CheckCircle size={32} className="text-mint mx-auto mb-2" />
                  <p className="text-sm text-slate">Aucune alerte pour le moment</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-charcoal">
                Commandes récentes
              </h2>
              <button className="text-sm font-medium text-mint hover:underline">
                Voir tout →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-mist text-left">
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate">
                      Numéro
                    </th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate">
                      Client
                    </th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate">
                      Pack
                    </th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate">
                      Statut
                    </th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-slate">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mist">
                  {recentOrders.length > 0 ? recentOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    return (
                      <tr key={order.id} className="transition hover:bg-mist/20">
                        <td className="py-4 text-sm font-medium text-charcoal">
                          {order.id}
                        </td>
                        <td className="py-4 text-sm text-slate">
                          {order.customerName}
                        </td>
                        <td className="py-4 text-sm text-slate">{getPackName(order)}</td>
                        <td className="py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-slate">{formatDate(order.createdAt)}</td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate">
                        Aucune commande récente
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-mint/10 p-3">
              <Clock size={24} className="text-mint" />
            </div>
            <div>
              <p className="text-sm text-slate">Temps de traitement moyen</p>
              <p className="text-2xl font-bold text-charcoal">{metrics.averageProcessingTime.toFixed(1)} min</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-fresh-green/10 p-3">
              <CheckCircle size={24} className="text-fresh-green" />
            </div>
            <div>
              <p className="text-sm text-slate">Taux de renouvellement</p>
              <p className="text-2xl font-bold text-charcoal">{metrics.renewalRate}%</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-peach/10 p-3">
              <ShoppingCart size={24} className="text-coral" />
            </div>
            <div>
              <p className="text-sm text-slate">Revenu mensuel</p>
              <p className="text-2xl font-bold text-charcoal">{metrics.monthlyRevenue.toLocaleString('fr-FR')} MAD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



