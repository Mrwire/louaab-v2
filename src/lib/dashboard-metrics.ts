import { Order } from "./orders";
import { Pack } from "./packs";

export interface DashboardMetrics {
  // Abonnements actifs
  activeSubscriptions: number;
  subscriptionGrowth: number;
  
  // Jouets en circulation
  toysInCirculation: number;
  toysGrowth: number;
  
  // Livraisons du jour
  todaysDeliveries: number;
  inProgressDeliveries: number;
  
  // Satisfaction (NPS)
  npsScore: number;
  npsImprovement: number;
  
  // Temps de traitement moyen
  averageProcessingTime: number;
  
  // Taux de renouvellement
  renewalRate: number;
  
  // Revenu mensuel
  monthlyRevenue: number;
}

export class DashboardMetricsCalculator {
  static calculateMetrics(orders: Order[], packs: Pack[]): DashboardMetrics {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Abonnements actifs (commandes confirmées + terminées)
    const activeSubscriptions = orders.filter(o => 
      o.status === 'confirmed' || o.status === 'completed'
    ).length;
    
    // Croissance des abonnements (comparaison avec le mois dernier)
    const lastMonthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastYear;
    });
    const currentMonthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });
    
    const subscriptionGrowth = lastMonthOrders.length > 0 
      ? Math.round(((currentMonthOrders.length - lastMonthOrders.length) / lastMonthOrders.length) * 100)
      : currentMonthOrders.length > 0 ? 100 : 0;
    
    // Jouets en circulation (total des jouets dans les commandes actives)
    const toysInCirculation = orders
      .filter(o => o.status === 'confirmed' || o.status === 'completed')
      .reduce((total, order) => {
        return total + order.items.reduce((sum, item) => sum + item.quantity, 0);
      }, 0);
    
    // Croissance des jouets
    const lastMonthToys = lastMonthOrders.reduce((total, order) => {
      return total + order.items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);
    const currentMonthToys = currentMonthOrders.reduce((total, order) => {
      return total + order.items.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);
    
    const toysGrowth = lastMonthToys > 0 
      ? Math.round(((currentMonthToys - lastMonthToys) / lastMonthToys) * 100)
      : currentMonthToys > 0 ? 100 : 0;
    
    // Livraisons du jour (commandes créées aujourd'hui)
    const today = new Date().toDateString();
    const todaysDeliveries = orders.filter(o => 
      new Date(o.createdAt).toDateString() === today
    ).length;
    
    // Livraisons en cours (commandes confirmées)
    const inProgressDeliveries = orders.filter(o => o.status === 'confirmed').length;
    
    // NPS Score (basé sur le taux de satisfaction des commandes terminées)
    const completedOrders = orders.filter(o => o.status === 'completed');
    const totalOrders = orders.length;
    const npsScore = totalOrders > 0 ? Math.round((completedOrders.length / totalOrders) * 100) : 0;
    
    // Amélioration NPS (comparaison avec le mois dernier)
    const lastMonthCompleted = lastMonthOrders.filter(o => o.status === 'completed').length;
    const currentMonthCompleted = currentMonthOrders.filter(o => o.status === 'completed').length;
    const lastMonthNPS = lastMonthOrders.length > 0 ? Math.round((lastMonthCompleted / lastMonthOrders.length) * 100) : 0;
    const currentMonthNPS = currentMonthOrders.length > 0 ? Math.round((currentMonthCompleted / currentMonthOrders.length) * 100) : 0;
    const npsImprovement = currentMonthNPS - lastMonthNPS;
    
    // Temps de traitement moyen (simulation basée sur les statuts)
    const processingTimes = orders
      .filter(o => o.status === 'completed')
      .map(order => {
        const created = new Date(order.createdAt);
        const completed = new Date(created.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000); // Simulation
        return (completed.getTime() - created.getTime()) / (1000 * 60); // en minutes
      });
    
    const averageProcessingTime = processingTimes.length > 0 
      ? Math.round((processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length) * 10) / 10
      : 0;
    
    // Taux de renouvellement (commandes répétées par les mêmes clients)
    const customerOrders = orders.reduce((acc, order) => {
      if (!acc[order.customerPhone]) {
        acc[order.customerPhone] = [];
      }
      acc[order.customerPhone].push(order);
      return acc;
    }, {} as Record<string, Order[]>);
    
    const repeatCustomers = Object.values(customerOrders).filter(customerOrders => customerOrders.length > 1).length;
    const totalCustomers = Object.keys(customerOrders).length;
    const renewalRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;
    
    // Revenu mensuel (total des commandes du mois en cours)
    const monthlyRevenue = currentMonthOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    return {
      activeSubscriptions,
      subscriptionGrowth,
      toysInCirculation,
      toysGrowth,
      todaysDeliveries,
      inProgressDeliveries,
      npsScore,
      npsImprovement,
      averageProcessingTime,
      renewalRate,
      monthlyRevenue
    };
  }
  
  // Calculer les commandes récentes (7 derniers jours)
  static getRecentOrders(orders: Order[]): Order[] {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return orders
      .filter(order => new Date(order.createdAt) >= sevenDaysAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5); // Top 5 des plus récentes
  }
  
  // Calculer les alertes importantes
  static getImportantAlerts(orders: Order[], metrics: DashboardMetrics): Array<{
    type: 'warning' | 'info' | 'success' | 'error';
    title: string;
    message: string;
    priority: 'high' | 'medium' | 'low';
  }> {
    const alerts = [];
    
    // Alertes de commandes en attente
    const pendingOrders = orders.filter(o => o.status === 'pending');
    if (pendingOrders.length > 0) {
      alerts.push({
        type: 'warning' as const,
        title: 'Commandes en attente',
        message: `${pendingOrders.length} commande(s) nécessitent votre attention`,
        priority: 'high' as const
      });
    }
    
    // Alertes de performance
    if (metrics.npsScore < 70) {
      alerts.push({
        type: 'error' as const,
        title: 'Satisfaction faible',
        message: `NPS à ${metrics.npsScore}% - Amélioration nécessaire`,
        priority: 'high' as const
      });
    }
    
    // Alertes de croissance
    if (metrics.subscriptionGrowth < 0) {
      alerts.push({
        type: 'warning' as const,
        title: 'Croissance négative',
        message: `Abonnements en baisse de ${Math.abs(metrics.subscriptionGrowth)}%`,
        priority: 'medium' as const
      });
    }
    
    // Alertes positives
    if (metrics.subscriptionGrowth > 20) {
      alerts.push({
        type: 'success' as const,
        title: 'Excellente croissance',
        message: `Abonnements en hausse de ${metrics.subscriptionGrowth}%`,
        priority: 'low' as const
      });
    }
    
    return alerts.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
}
