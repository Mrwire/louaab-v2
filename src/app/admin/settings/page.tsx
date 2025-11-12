"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthManager, AdminUser } from "@/lib/auth";
import { useNotifications } from "@/components/notification-toast";
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  Shield,
  User,
  Calendar,
  Clock,
  ArrowLeft,
  Settings
} from "lucide-react";

export default function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adminInfo, setAdminInfo] = useState<AdminUser | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isMaintenanceLoading, setIsMaintenanceLoading] = useState(false);
  const router = useRouter();
  const { showSuccess, showError, showWarning } = useNotifications();

  useEffect(() => {
    // Vérifier l'authentification
    if (!AuthManager.isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    // Charger les informations admin
    const admin = AuthManager.getAdminInfo();
    setAdminInfo(admin);

    // Load maintenance mode status
    fetch("/api/admin/maintenance")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMaintenanceMode(data.maintenanceMode);
        }
      })
      .catch((err) => console.error("Failed to load maintenance status:", err));
  }, [router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validation des mots de passe
      if (newPassword !== confirmPassword) {
        showError("Erreur", "Les nouveaux mots de passe ne correspondent pas");
        setIsLoading(false);
        return;
      }

      const passwordValidation = AuthManager.validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        showError("Erreur", "Le mot de passe ne respecte pas les critères de sécurité");
        passwordValidation.errors.forEach(error => showWarning("Attention", error));
        setIsLoading(false);
        return;
      }

      const success = await AuthManager.changePassword(currentPassword, newPassword);
      
      if (success) {
        showSuccess("Succès", "Mot de passe modifié avec succès !");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showError("Erreur", "Mot de passe actuel incorrect");
      }
    } catch (error) {
      showError("Erreur", "Erreur lors du changement de mot de passe");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    return {
      score,
      level: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong',
      color: score < 2 ? 'text-coral' : score < 4 ? 'text-sunshine-yellow' : 'text-mint'
    };
  };

  const toggleMaintenanceMode = async () => {
    setIsMaintenanceLoading(true);
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
            ? "Mode maintenance activé"
            : "Mode maintenance désactivé"
        );
      } else {
        showError("Erreur", "Impossible de changer le mode maintenance");
      }
    } catch (error) {
      showError("Erreur", "Erreur lors du changement du mode maintenance");
    } finally {
      setIsMaintenanceLoading(false);
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  if (!adminInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-mint transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour au dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-charcoal">Paramètres Admin</h1>
                <p className="text-sm text-gray-600">Gestion de la sécurité et des accès</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Maintenance Mode Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${maintenanceMode ? 'bg-coral/20' : 'bg-mint/20'} rounded-xl flex items-center justify-center`}>
                  <Settings className={`w-6 h-6 ${maintenanceMode ? 'text-coral' : 'text-mint'}`} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-charcoal">Mode Maintenance</h2>
                  <p className="text-sm text-slate">
                    {maintenanceMode 
                      ? "Le site est actuellement en maintenance" 
                      : "Le site est accessible aux visiteurs"}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleMaintenanceMode}
                disabled={isMaintenanceLoading}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  maintenanceMode
                    ? "bg-mint hover:bg-mint/90 text-white"
                    : "bg-coral hover:bg-coral/90 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isMaintenanceLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Chargement...
                  </span>
                ) : maintenanceMode ? (
                  "Désactiver"
                ) : (
                  "Activer"
                )}
              </button>
            </div>
            {maintenanceMode && (
              <div className="mt-4 p-4 bg-coral/10 rounded-xl">
                <p className="text-sm text-coral font-medium">
                  ⚠️ Attention : Les visiteurs ne peuvent pas accéder au site. Seuls les administrateurs ont accès.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Admin Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-mint/20 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-mint" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-charcoal">Informations Admin</h2>
                  <p className="text-sm text-slate">Compte administrateur</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate" />
                  <div>
                    <p className="text-sm font-medium text-charcoal">Nom d'utilisateur</p>
                    <p className="text-sm text-slate">{adminInfo.username}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate" />
                  <div>
                    <p className="text-sm font-medium text-charcoal">Compte créé</p>
                    <p className="text-sm text-slate">
                      {new Date(adminInfo.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>

                {adminInfo.lastLogin && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate" />
                    <div>
                      <p className="text-sm font-medium text-charcoal">Dernière connexion</p>
                      <p className="text-sm text-slate">
                        {new Date(adminInfo.lastLogin).toLocaleDateString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-slate" />
                  <div>
                    <p className="text-sm font-medium text-charcoal">Statut</p>
                    <span className="inline-flex items-center gap-1 text-sm text-mint">
                      <CheckCircle className="w-4 h-4" />
                      Actif
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Password Change Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-sky-blue/20 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-sky-blue" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-charcoal">Changer le mot de passe</h2>
                  <p className="text-sm text-slate">Mettez à jour votre mot de passe pour plus de sécurité</p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-charcoal mb-2">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate" />
                    </div>
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="block w-full pl-10 pr-12 py-3 border border-mist rounded-xl focus:ring-2 focus:ring-mint focus:border-mint transition-colors"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-slate hover:text-charcoal transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate hover:text-charcoal transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-charcoal mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate" />
                    </div>
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-10 pr-12 py-3 border border-mist rounded-xl focus:ring-2 focus:ring-mint focus:border-mint transition-colors"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-slate hover:text-charcoal transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate hover:text-charcoal transition-colors" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate">Force du mot de passe:</span>
                        <span className={`text-xs font-medium ${passwordStrength.color}`}>
                          {passwordStrength.level === 'weak' ? 'Faible' : 
                           passwordStrength.level === 'medium' ? 'Moyen' : 'Fort'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full ${
                              level <= passwordStrength.score
                                ? passwordStrength.level === 'weak' ? 'bg-coral' :
                                  passwordStrength.level === 'medium' ? 'bg-sunshine-yellow' : 'bg-mint'
                                : 'bg-mist'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-charcoal mb-2">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-10 pr-12 py-3 border border-mist rounded-xl focus:ring-2 focus:ring-mint focus:border-mint transition-colors"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-slate hover:text-charcoal transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate hover:text-charcoal transition-colors" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {confirmPassword && (
                    <div className="mt-2 flex items-center gap-2">
                      {newPassword === confirmPassword ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-mint" />
                          <span className="text-xs text-mint">Les mots de passe correspondent</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-coral" />
                          <span className="text-xs text-coral">Les mots de passe ne correspondent pas</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="w-full bg-mint text-white py-3 px-4 rounded-xl font-medium hover:bg-mint/90 focus:ring-2 focus:ring-mint focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Modification...
                    </div>
                  ) : (
                    "Modifier le mot de passe"
                  )}
                </button>
              </form>

              {/* Security Requirements */}
              <div className="mt-6 p-4 bg-sky-blue/10 rounded-xl border border-sky-blue/20">
                <h3 className="text-sm font-medium text-charcoal mb-3">Critères de sécurité</h3>
                <ul className="text-xs text-slate space-y-1">
                  <li>• Au moins 8 caractères</li>
                  <li>• Une majuscule et une minuscule</li>
                  <li>• Au moins un chiffre</li>
                  <li>• Au moins un caractère spécial</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
