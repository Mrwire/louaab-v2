"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn, User } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // TODO: Implement API call
    console.log("Login attempt:", { email, password });

    setTimeout(() => {
      setLoading(false);
      // Redirect to dashboard
      window.location.href = "/mon-compte";
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-mint/10 via-soft-white to-peach/10 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-mint">LOUAAB</h1>
          </Link>
          <p className="mt-2 text-sm text-slate">
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Login Card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-charcoal">Connexion</h2>
            <p className="mt-2 text-sm text-slate">
              Bienvenue ! Entrez vos informations pour continuer.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-charcoal"
                >
                  Email
                </label>
                <div className="relative mt-2">
                  <Mail
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate"
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="votre@email.com"
                    className="w-full rounded-xl border border-mist bg-soft-white py-3 pl-12 pr-4 text-sm focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-charcoal"
                >
                  Mot de passe
                </label>
                <div className="relative mt-2">
                  <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-mist bg-soft-white py-3 pl-12 pr-12 text-sm focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate hover:text-charcoal"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-mint hover:underline"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-mint to-fresh-green py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-mint/30 transition hover:shadow-xl hover:shadow-mint/40 disabled:opacity-50"
              >
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <LogIn size={18} />
                    Se connecter
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-mist"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-slate">ou</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <button className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-mist bg-white py-3 text-sm font-semibold text-charcoal transition hover:border-mint hover:bg-mint/5">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuer avec Google
              </button>

              <button className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-mist bg-white py-3 text-sm font-semibold text-charcoal transition hover:border-mint hover:bg-mint/5">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Continuer avec Facebook
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="border-t border-mist bg-mist/20 px-8 py-6 text-center">
            <p className="text-sm text-slate">
              Vous n&apos;avez pas de compte ?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-mint hover:underline"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-slate hover:text-charcoal transition"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </motion.div>
    </div>
  );
}


