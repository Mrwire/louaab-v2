"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AuthManager } from "@/lib/auth";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  DollarSign,
  Settings,
  Menu,
  X,
  Bell,
  LogOut,
  Edit,
  Calendar,
  Power,
  Baby,
  Tags,
  RefreshCw,
  Truck,
  Mail,
} from "lucide-react";
import AdminDropdown from "@/components/admin-dropdown";
import { NotificationContainer } from "@/components/notification-toast";
import { fetchAdminOrders } from "@/lib/api/admin-orders";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://louaab.ma/api";

type QuickNotification = {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "order" | "contact";
};

const pingSound =
  "data:audio/wav;base64,UklGRuQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YcQAAACAgICAf3+/v7+/v79/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+/f39/f3+/v7+/v7+";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Inventaire", href: "/admin/inventory" },
  { icon: ShoppingCart, label: "Commandes", href: "/admin/orders" },
  { icon: Truck, label: "Restitutions", href: "/admin/returns" },
  { icon: Mail, label: "Messages contact", href: "/admin/contact-messages" },
  { icon: Power, label: "Maintenance", href: "/admin/maintenance" },
  { icon: Settings, label: "Param?tres", href: "/admin/settings" },
];

const packSubItems = [
  {
    icon: Edit,
    label: "Gérer les Packs",
    href: "/admin/packs",
    description: "Modifier les packs et leurs prix"
  },
  {
    icon: Calendar,
    label: "Réservations",
    href: "/admin/pack-reservations",
    description: "Gérer les réservations de packs"
  },
];

const contentSubItems = [
  {
    icon: Baby,
    label: "Tranches d'âge",
    href: "/admin/ages",
    description: "Gérer les tranches d'âge"
  },
  {
    icon: Tags,
    label: "Catégories",
    href: "/admin/categories",
    description: "Gérer les catégories de jouets"
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [notifications, setNotifications] = useState<QuickNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<{ count: number; name: string }>({ count: 0, name: "" });
  const lastOrderTimestampRef = useRef<number | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const isPacksSectionActive = pathname === "/admin/packs" || pathname === "/admin/pack-reservations";
  const isContentSectionActive = pathname === "/admin/ages" || pathname === "/admin/categories";

  const formatNotificationTime = useCallback((value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString("fr-MA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  const playNewOrderSound = () => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(pingSound);
      }
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => { });
    } catch (error) {
      console.warn("Impossible de jouer le son:", error);
    }
  };

  const showBrowserNotification = (title: string, body: string) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      new Notification(title, { body });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body });
        }
      });
    }
  };

  const checkNewOrders = useCallback(async () => {
    try {
      const orders = await fetchAdminOrders().catch(() => []);
      if (!Array.isArray(orders) || orders.length === 0) return;
      const newest = orders.reduce((max, o) => {
        const ts = new Date(o.createdAt || o.updatedAt || Date.now()).getTime();
        return Math.max(max, ts);
      }, 0);

      if (!newest) return;
      if (lastOrderTimestampRef.current === null) {
        lastOrderTimestampRef.current = newest;
        return;
      }

      if (newest > lastOrderTimestampRef.current) {
        const newOnes = orders.filter((o) => {
          const ts = new Date(o.createdAt || o.updatedAt || Date.now()).getTime();
          return ts > (lastOrderTimestampRef.current as number);
        });
        const count = newOnes.length || 1;
        const latestName = newOnes[0]?.customerName || "Nouvelle commande";
        lastOrderTimestampRef.current = newest;
        setNewOrderAlert({ count, name: latestName });
        playNewOrderSound();
        showBrowserNotification("Nouvelle commande", `${count} nouvelle(s) commande(s) - ${latestName}`);
        setTimeout(() => setNewOrderAlert({ count: 0, name: "" }), 8000);
      }
    } catch (error) {
      console.warn("Polling commandes échoué:", error);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setNotificationsLoading(true);
      setNotificationsError(null);

      const [ordersData, contactsRes] = await Promise.all([
        fetchAdminOrders().catch(() => []),
        fetch(`${API_BASE_URL}/contact`, { credentials: "include" }),
      ]);

      const nextNotifications: QuickNotification[] = [];

      if (Array.isArray(ordersData)) {
        ordersData.slice(0, 3).forEach((order: any) => {
          nextNotifications.push({
            id: order?.id || order?.orderNumber || `order-${Math.random().toString(36).slice(2)}`,
            title: `Commande ${order?.customerName || "client"}`,
            message: `Statut : ${(order?.status || "pending").toString()} • ${order?.items?.length || 0} article(s)`,
            time: order?.createdAt || new Date().toISOString(),
            type: "order",
          });
        });
      }

      if (contactsRes.ok) {
        const contactsPayload = await contactsRes.json().catch(() => ({}));
        const contactItems = Array.isArray(contactsPayload?.data) ? contactsPayload.data.slice(0, 3) : [];
        contactItems.forEach((message: any) => {
          nextNotifications.push({
            id: message?.id || `contact-${Math.random().toString(36).slice(2)}`,
            title: `Message de ${message?.name || "visiteur"}`,
            message: (message?.message || "").slice(0, 80) + ((message?.message || "").length > 80 ? "…" : ""),
            time: message?.createdAt || new Date().toISOString(),
            type: "contact",
          });
        });
      }

      nextNotifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setNotifications(nextNotifications.slice(0, 6));
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
      setNotificationsError("Impossible de charger les notifications");
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    // Poll commandes pour détecter de nouvelles entrées
    if (!isAuthenticated || pathname === "/admin/login") return;

    checkNewOrders();
    pollIntervalRef.current = setInterval(checkNewOrders, 20000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isAuthenticated, pathname, checkNewOrders]);

  useEffect(() => {
    // Vérifier l'authentification
    const checkAuth = () => {
      const authStatus = AuthManager.isAuthenticated();
      setIsAuthenticated(authStatus);
      setIsLoading(false);

      // Si pas authentifié et pas sur la page de login, rediriger
      if (!authStatus && pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  useEffect(() => {
    if (!showNotificationsPanel) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        !target.closest?.("#admin-notifications-panel") &&
        !target.closest?.("#admin-notifications-button")
      ) {
        setShowNotificationsPanel(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotificationsPanel]);

  const handleLogout = () => {
    AuthManager.logout();
    router.push('/admin/login');
  };

  const handleNotificationsToggle = () => {
    setShowNotificationsPanel((prev) => {
      const next = !prev;
      if (!prev) {
        loadNotifications();
      }
      return next;
    });
  };

  // Auth loading screen removed - layout renders immediately

  // Si pas authentifié, ne pas afficher le layout
  if (!isAuthenticated && pathname !== '/admin/login') {
    return null;
  }

  // Si sur la page de login, afficher seulement le contenu
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-mist/20">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-mist px-6">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                <Image
                  src="https://louaab.ma/logo.png"
                  alt="Logo LOUAAB"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${isActive
                          ? "bg-[#1897aa] text-white shadow-lg shadow-[#1897aa]/30"
                          : "text-slate hover:bg-[#1897aa]/10 hover:text-charcoal"
                        }`}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}

              {/* Packs Dropdown */}
              <li>
                <AdminDropdown
                  icon={DollarSign}
                  label="Tarifs & Packs"
                  items={packSubItems}
                  isActive={isPacksSectionActive}
                  onItemClick={() => setSidebarOpen(false)}
                />
              </li>

              {/* Content Management Dropdown */}
              <li>
                <AdminDropdown
                  icon={Tags}
                  label="Contenu"
                  items={contentSubItems}
                  isActive={isContentSectionActive}
                  onItemClick={() => setSidebarOpen(false)}
                />
              </li>
            </ul>
          </nav>

          {/* User Profile */}
          <div className="border-t border-mist p-4">
            <div className="flex items-center gap-3 rounded-xl bg-mist/30 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-mint text-white">
                <span className="text-sm font-semibold">SA</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-charcoal">Sara</p>
                <p className="text-xs text-slate">Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate hover:text-coral transition-colors"
                title="Se déconnecter"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-mist bg-white px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            {newOrderAlert.count > 0 && (
              <div className="hidden lg:flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 border border-emerald-200 shadow-sm">
                <span className="text-xs font-semibold">Nouvelle commande</span>
                <span className="text-sm font-bold">
                  {newOrderAlert.count} × {newOrderAlert.name}
                </span>
              </div>
            )}
            {/* Notifications */}
            <div className="relative">
              <button
                id="admin-notifications-button"
                onClick={handleNotificationsToggle}
                className="relative rounded-xl border border-mist p-2 transition hover:border-mint hover:bg-mint/10"
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute right-1 top-1 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-coral"></span>
                  </span>
                )}
              </button>

              {showNotificationsPanel && (
                <div
                  id="admin-notifications-panel"
                  className="absolute right-0 top-12 w-80 rounded-2xl border border-gray-100 bg-white shadow-2xl p-4 z-50"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-charcoal">Notifications</p>
                      <p className="text-xs text-slate">Dernières activités</p>
                    </div>
                    <button
                      onClick={loadNotifications}
                      className="rounded-full border border-gray-200 p-1 text-slate hover:text-charcoal hover:border-mint transition"
                      title="Rafraîchir"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                  {notificationsLoading && (
                    <p className="text-xs text-slate py-4 text-center">Chargement...</p>
                  )}
                  {!notificationsLoading && notificationsError && (
                    <p className="text-xs text-coral py-4 text-center">{notificationsError}</p>
                  )}
                  {!notificationsLoading && !notificationsError && notifications.length === 0 && (
                    <p className="text-xs text-slate py-4 text-center">
                      Aucune notification récente.
                    </p>
                  )}
                  {!notificationsLoading && !notificationsError && notifications.length > 0 && (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <button
                          key={notification.id}
                          type="button"
                          onClick={() => {
                            setShowNotificationsPanel(false);
                            const target =
                              notification.type === "order"
                                ? `/admin/orders?highlight=${encodeURIComponent(notification.id)}`
                                : "/admin/contact-messages";
                            router.push(target);
                          }}
                          className="rounded-xl border border-gray-100 p-3 bg-mist/10 text-left hover:border-mint transition"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-charcoal">
                              {notification.title}
                            </span>
                            <span className="text-[11px] text-gray-500">
                              {formatNotificationTime(notification.time)}
                            </span>
                          </div>
                          <p className="text-xs text-slate mt-1">{notification.message}</p>
                          <span className="mt-2 inline-flex rounded-full bg-mint/10 px-2 py-0.5 text-[11px] font-medium text-mint">
                            {notification.type === "order" ? "Commande" : "Contact"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-charcoal/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Container pour les notifications */}
      <NotificationContainer />
    </div>
  );
}

