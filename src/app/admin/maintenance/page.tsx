"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthManager } from "@/lib/auth";
import { useNotifications } from "@/components/notification-toast";
import { Settings, ArrowLeft, Power, AlertTriangle, CheckCircle } from "lucide-react";

export default function MaintenancePage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const router = useRouter();
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    // Vérifier ’uthentification
    if (!AuthManager.isAuthenticated()) {
      router.push("/admin/login");
      return;
    }

    // Charger le statut de maintenance
    loadMaintenanceStatus();
  }, [router]);

  const loadMaintenanceStatus = async () => {
    try {
      const response = await fetch("/api/admin/maintenance");
      const data = await response.json();
      if (data.success) {
        setMaintenanceMode(data.maintenanceMode);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du statut:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMaintenanceMode = async () => {
    setIsToggling(true);
    try {
      const response = await fetch("/api/admin/maintenance", {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setMaintenanceMode(data.maintenanceMode);
        showSuccess(
          "Succès",
          data.maintenanceMode
            ? "Mode maintenance activé - Le site est maintenant inaccessible aux visiteurs"
            : "Mode maintenance désactivé - Le site est à nouveau accessible"
        );
      } else {
        showError("Erreur", "Impossible de changer le mode maintenance");
      }
    } catch (error) {
      console.error("Erreur lors du changement du mode maintenance:", error);
      showError("Erreur", "Erreur lors du changement du mode maintenance");
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint mx-auto"></div>
          <p className="mt-4 text-slate">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin")}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-mint transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour au dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-charcoal">Mode Maintenance</h1>
                <p className="text-sm text-gray-600">
                  Gérer ’ccessibilité du site
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
          <div className="text-center mb-8">
            <div
              className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                maintenanceMode ? "bg-coral/20" : "bg-mint/20"
              }`}
            >
              {maintenanceMode ? (
                <Power className="w-12 h-12 text-coral" />
              ) : (
                <CheckCircle className="w-12 h-12 text-mint" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-charcoal mb-2">
              {maintenanceMode ? "Site en Maintenance" : "Site Opérationnel"}
            </h2>
            <p className="text-slate">
              {maintenanceMode
                ? "Les visiteurs ne peuvent pas accéder au site"
                : "Le site est accessible à tous les visiteurs"}
            </p>
          </div>

          <div className="flex justify-center">
            <button
              onClick={toggleMaintenanceMode}
              disabled={isToggling}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                maintenanceMode
                  ? "bg-mint hover:bg-mint/90 text-white"
                  : "bg-coral hover:bg-coral/90 text-white"
              }`}
            >
              {isToggling ? (
                <span className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Chargement...
                </span>
              ) : maintenanceMode ? (
                <span className="flex items-center gap-2">
                  <Power className="w-5 h-5" />
                  Désactiver la Maintenance
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Power className="w-5 h-5" />
                  Activer la Maintenance
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Warning Card */}
        {maintenanceMode && (
          <div className="bg-coral/10 border-2 border-coral/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-coral flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-coral mb-2">
                  Attention : Site Inaccessible
                </h3>
                <ul className="space-y-2 text-sm text-charcoal">
                  <li className="flex items-start gap-2">
                    <span className="text-coral mt-1">•</span>
                    <span>
                      Les visiteurs sont redirigés vers la page de maintenance
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-coral mt-1">•</span>
                    <span>
                      Seuls les administrateurs peuvent accéder au site
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-coral mt-1">•</span>
                    <span>
                      ’ubliez pas de désactiver le mode après les mises à jour
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Info Card */}
        {!maintenanceMode && (
          <div className="bg-mint/10 border-2 border-mint/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-mint flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-mint mb-2">
                  Site Accessible
                </h3>
                <ul className="space-y-2 text-sm text-charcoal">
                  <li className="flex items-start gap-2">
                    <span className="text-mint mt-1">•</span>
                    <span>
                      Tous les visiteurs peuvent accéder au site normalement
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-mint mt-1">•</span>
                    <span>
                      Activez la maintenance avant ’ffectuer des mises à jour importantes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-mint mt-1">•</span>
                    <span>
                      Les administrateurs gardent toujours ’ccès en mode maintenance
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Instructions Card */}
        <div className="mt-6 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-sky-blue" />
            <h3 className="text-lg font-bold text-charcoal">
              Comment utiliser le mode maintenance ?
            </h3>
          </div>
          <div className="space-y-3 text-sm text-slate">
            <p>
              <strong className="text-charcoal">Quand ’tiliser :</strong>{" "}
              Utilisez ce mode lors de mises à jour importantes, corrections de bugs,
              ou maintenance de la base de données.
            </p>
            <p>
              <strong className="text-charcoal">Durée recommandée :</strong>{" "}
              Essayez de minimiser la durée de maintenance pour réduire ’mpact
              sur vos utilisateurs.
            </p>
            <p>
              <strong className="text-charcoal">Communication :</strong>{" "}
              Informez vos utilisateurs à ’vance si possible via vos réseaux sociaux
              ou newsletter.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

