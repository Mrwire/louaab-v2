"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthManager } from "@/lib/auth";
import { useNotifications } from "@/components/notification-toast";
import { Eye, EyeOff, Lock, User, Shield } from "lucide-react";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { showSuccess, showError } = useNotifications();

  useEffect(() => {
    // Initialiser l'admin par défaut
    AuthManager.initializeDefaultAdmin();
    
    // Vérifier si déjà connecté
    if (AuthManager.isAuthenticated()) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isValid = await AuthManager.authenticate(username, password);
      
      if (isValid) {
        showSuccess("Succès", "Connexion réussie !");
        router.push('/admin/dashboard');
      } else {
        showError("Erreur", "Nom d'utilisateur ou mot de passe incorrect");
      }
    } catch (error) {
      console.error('Erreur de connexion administrateur:', error);
      showError("Erreur", "Erreur lors de la connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint/10 via-white to-sky-blue/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-mint/20 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-mint" />
          </div>
          <h1 className="text-3xl font-bold text-charcoal mb-2">Admin Louaab</h1>
          <p className="text-slate">Accès sécurisé au tableau de bord</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-charcoal mb-2">
                Nom d&apos;utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-mist rounded-xl focus:ring-2 focus:ring-mint focus:border-mint transition-colors"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-charcoal mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-mist rounded-xl focus:ring-2 focus:ring-mint focus:border-mint transition-colors"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate hover:text-charcoal transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate hover:text-charcoal transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-mint text-white py-3 px-4 rounded-xl font-medium hover:bg-mint/90 focus:ring-2 focus:ring-mint focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Connexion...
                </div>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-sky-blue/10 rounded-xl border border-sky-blue/20">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-sky-blue mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-charcoal mb-1">Sécurité</p>
                <p className="text-xs text-slate">
                  Cette interface est protégée. Toutes les connexions sont chiffrées et surveillées.
                </p>
              </div>
            </div>
          </div>

          {/* Default Credentials Notice */}
          <div className="mt-4 p-4 bg-sunshine-yellow/10 rounded-xl border border-sunshine-yellow/20">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-sunshine-yellow rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                <span className="text-xs font-bold text-white">!</span>
              </div>
              <div>
                <p className="text-sm font-medium text-charcoal mb-1">Mot de passe temporaire</p>
                <p className="text-xs text-slate">
                  Utilisez le mot de passe temporaire fourni. Changez-le immédiatement dans les paramètres.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-slate">
            © 2024 Louaab. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}
