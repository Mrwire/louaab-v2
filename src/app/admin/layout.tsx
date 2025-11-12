"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  Search,
  Edit,
  Calendar,
  Power,
  Baby,
  Tags,
} from "lucide-react";
import AdminDropdown from "@/components/admin-dropdown";
import { NotificationContainer } from "@/components/notification-toast";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Package, label: "Inventaire", href: "/admin/inventory" },
  { icon: ShoppingCart, label: "Commandes", href: "/admin/orders" },
  { icon: Power, label: "Maintenance", href: "/admin/maintenance" },
  { icon: Settings, label: "Paramètres", href: "/admin/settings" },
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
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const isPacksSectionActive = pathname === "/admin/packs" || pathname === "/admin/pack-reservations";
  const isContentSectionActive = pathname === "/admin/ages" || pathname === "/admin/categories";

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

  const handleLogout = () => {
    AuthManager.logout();
    router.push('/admin/login');
  };

  // Afficher le loader pendant la vérification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint mx-auto"></div>
          <p className="mt-4 text-slate">Vérification de l&apos;authentification...</p>
        </div>
      </div>
    );
  }

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
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-xl transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-mist px-6">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-mint to-fresh-green">
                <Package size={20} className="text-white" />
              </div>
              <span className="text-lg font-bold text-charcoal">LOUAAB</span>
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
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive
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

            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate"
              />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-64 rounded-xl border border-mist bg-mist/20 py-2 pl-10 pr-4 text-sm focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative rounded-xl border border-mist p-2 transition hover:border-mint hover:bg-mint/10">
              <Bell size={20} />
              <span className="absolute right-1 top-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-coral opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-coral"></span>
              </span>
            </button>

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

