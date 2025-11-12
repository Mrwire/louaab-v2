"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, Phone, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    // TODO: Implement API call
    console.log("Registration attempt:", formData);

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
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-mint">LOUAAB</h1>
          </Link>
          <p className="mt-2 text-sm text-slate">
            Créez votre compte et commencez à louer
          </p>
        </div>

        {/* Register Card */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-charcoal">Inscription</h2>
            <p className="mt-2 text-sm text-slate">
              Rejoignez LOUAAB et accédez à des centaines de jouets !
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {/* Name Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-semibold text-charcoal"
                  >
                    Prénom
                  </label>
                  <div className="relative mt-2">
                    <User
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate"
                    />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Votre prénom"
                      className="w-full rounded-xl border border-mist bg-soft-white py-3 pl-12 pr-4 text-sm focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-semibold text-charcoal"
                  >
                    Nom
                  </label>
                  <div className="relative mt-2">
                    <User
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate"
                    />
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Votre nom"
                      className="w-full rounded-xl border border-mist bg-soft-white py-3 pl-12 pr-4 text-sm focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20"
                    />
                  </div>
                </div>
              </div>

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
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="votre@email.com"
                    className="w-full rounded-xl border border-mist bg-soft-white py-3 pl-12 pr-4 text-sm focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20"
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-charcoal"
                >
                  Téléphone
                </label>
                <div className="relative mt-2">
                  <Phone
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate"
                  />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+212 6 12 34 56 78"
                    className="w-full rounded-xl border border-mist bg-soft-white py-3 pl-12 pr-4 text-sm focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20"
                  />
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid gap-4 md:grid-cols-2">
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
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
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

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-charcoal"
                  >
                    Confirmer
                  </label>
                  <div className="relative mt-2">
                    <Lock
                      size={20}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate"
                    />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-mist bg-soft-white py-3 pl-12 pr-4 text-sm focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20"
                    />
                  </div>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start gap-3">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="mt-1 h-4 w-4 rounded border-mist text-mint focus:ring-mint"
                />
                <label htmlFor="terms" className="text-sm text-slate">
                  J&apos;accepte les{" "}
                  <Link
                    href="/conditions-generales"
                    className="text-mint hover:underline"
                  >
                    conditions générales
                  </Link>{" "}
                  et la{" "}
                  <Link
                    href="/politique-confidentialite"
                    className="text-mint hover:underline"
                  >
                    politique de confidentialité
                  </Link>
                </label>
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
                    <UserPlus size={18} />
                    Créer mon compte
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

            {/* Social Register */}
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

          {/* Login Link */}
          <div className="border-t border-mist bg-mist/20 px-8 py-6 text-center">
            <p className="text-sm text-slate">
              Vous avez déjà un compte ?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-mint hover:underline"
              >
                Se connecter
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


