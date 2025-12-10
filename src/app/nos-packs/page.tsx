"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PageShell } from "@/components/page-shell";
import PackReservationModal from "@/components/pack-reservation-modal";
import { Pack, PackManager } from "@/lib/packs";

// URL du backend API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://louaab.ma/api';
import {
  Check,
  Sparkles,
  Shield,
  Heart,
  Leaf,
  Package,
  Clock,
  Gift,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

const whyLouaab = [
  {
    icon: <Sparkles size={32} className="text-mint" />,
    title: "Stimulant",
    description:
      "Variété infinie pour éveiller la curiosité de vos enfants. Chaque mois, de nouvelles découvertes !",
  },
  {
    icon: <Leaf size={32} className="text-fresh-green" />,
    title: "Écologique",
    description:
      "Un jouet loué = moins de déchets, plus de partage. Participez à l'économie circulaire.",
  },
  {
    icon: <Heart size={32} className="text-coral" />,
    title: "Apaisant",
    description:
      "Fini l'encombrement ! Votre maison reste rangée tout en offrant le meilleur à vos enfants.",
  },
  {
    icon: <Package size={32} className="text-sky-blue" />,
    title: "Économique",
    description:
      "Louez pour moins cher qu'acheter. Profitez de centaines de jouets sans vous ruiner.",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Choisissez votre pack",
    description:
      "Sélectionnez le pack qui correspond à vos besoins et à l'âge de vos enfants.",
    icon: "🎯",
  },
  {
    step: "2",
    title: "Recevez vos jouets",
    description:
      "Livraison gratuite à votre porte. Les jouets sont nettoyés et prêts à jouer.",
    icon: "🚚",
  },
  {
    step: "3",
    title: "Échangez quand vous voulez",
    description:
      "Vos enfants s'en lassent ? Demandez un échange, nous récupérons et livrons de nouveaux jouets.",
    icon: "🔄",
  },
];

const boxContents = [
  "Des jouets adaptés à l'âge de vos enfants",
  "Nettoyés et désinfectés avec des produits non toxiques",
  "Emballés individuellement dans des pochettes propres",
  "Une fiche explicative pour chaque jouet",
  "Un formulaire de retour pré-rempli",
  "Tous conformes aux normes CE",
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const mapPackFromApi = (b: any): Pack => ({
  id: b.id,
  name: b.name,
  slug: b.slug,
  description: b.description || "",
  priceMonthly: Number(b.price || 0),
  toyCount: Number(b.toyCount || 0),
  durationMonths: Math.max(1, Math.round((b.durationDays || 30) / 30)),
  depositAmount: 0,
  swapIncluded: true,
  swapFrequencyDays: 30,
  citiesAvailable: [],
  isActive: !!b.isActive,
  displayOrder: Number(b.displayOrder || 0),
  badge: undefined,
  color: "mint",
  icon: b.icon || "�YZ?",
  ageRange: "",
  features: (() => {
    try {
      const f =
        typeof b.features === "string"
          ? JSON.parse(b.features)
          : b.features || [];
      return Array.isArray(f) ? f : [];
    } catch {
      return [];
    }
  })(),
});

export default function NosPacksPage() {
  const [subscriptionPlans, setSubscriptionPlans] = useState<Pack[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadPacks = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;
      silent ? setIsRefreshing(true) : setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/packs/all`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        const body = await res.json().catch(() => ({}));

        if (!res.ok || !Array.isArray(body?.data)) {
          throw new Error(body?.message || "Impossible de charger les packs");
        }

        const packs: Pack[] = body.data.map(mapPackFromApi);
        setSubscriptionPlans(packs);
        setSelectedPlan((prev) => {
          if (prev && packs.some((pack) => pack.id === prev)) {
            return prev;
          }
          return packs[0]?.id || "";
        });
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        console.error("Erreur lors du chargement des packs:", err);
        const fallback = PackManager.getAllPacks();
        if (fallback.length > 0) {
          setSubscriptionPlans(fallback);
          setSelectedPlan((prev) => {
            if (prev && fallback.some((pack) => pack.id === prev)) {
              return prev;
            }
            return fallback[0]?.id || "";
          });
        } else {
          setSubscriptionPlans([]);
          setSelectedPlan("");
        }
        setLastUpdated(null);
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les packs depuis l'API",
        );
      } finally {
        silent ? setIsRefreshing(false) : setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadPacks();
    const handleVisibility = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        loadPacks({ silent: true });
      }
    };
    window.addEventListener("focus", handleVisibility);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleVisibility);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loadPacks]);

  return (
    <PageShell>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-mint/10 via-soft-white to-peach/10 py-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <motion.span
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-mint/20 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-mint"
          >
            <Gift size={16} />
            Sans engagement
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-5xl font-bold text-charcoal md:text-6xl"
          >
            Des jouets qui grandissent avec vos enfants
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate"
          >
            Choisissez votre pack mensuel et profitez de centaines de jouets
            éducatifs, sans encombrer votre maison et sans vous ruiner.
          </motion.p>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-charcoal">
            Nos packs les plus demandés
          </p>
        </div>

        {subscriptionPlans.length === 0 ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            {isLoading ? (
              <p className="text-slate">Chargement des packs...</p>
            ) : (
              <p className="text-slate">
                Aucun pack n&apos;est disponible pour le moment.
              </p>
            )}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            className="grid gap-8 md:grid-cols-3"
          >
            {subscriptionPlans.map((plan) => (
              <motion.div
                key={plan.id}
                variants={item}
                className={`relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl transition hover:-translate-y-2 ${plan.badge ? "ring-4 ring-mint" : "shadow-mist/30"
                  }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute left-0 right-0 top-0 bg-gradient-to-r from-mint to-fresh-green py-2 text-center text-sm font-bold uppercase tracking-wide text-white">
                    ⭐ {plan.badge}
                  </div>
                )}

                <div className={plan.badge ? "mt-8" : ""}>
                  {/* Icon */}
                  <div className="text-6xl">{plan.icon}</div>

                  {/* Plan Name */}
                  <h3 className="mt-6 text-2xl font-bold text-charcoal">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate">{plan.description}</p>

                  {/* Price */}
                  <div className="mt-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-charcoal">
                        {plan.priceMonthly}
                      </span>
                      <span className="text-lg text-slate">MAD/mois</span>
                    </div>
                    <p className="mt-2 text-sm text-slate">
                      Soit{" "}
                      {Math.round(plan.priceMonthly / plan.toyCount)} MAD par
                      jouet
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-sm text-slate"
                      >
                        <Check size={18} className="mt-0.5 flex-shrink-0 text-mint" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => {
                      setSelectedPack(plan);
                      setIsReservationModalOpen(true);
                    }}
                    className={`mt-8 w-full rounded-xl py-4 text-sm font-bold uppercase tracking-wide transition ${plan.badge
                        ? "bg-gradient-to-r from-mint to-fresh-green text-charcoal shadow-lg shadow-mint/30 hover:shadow-xl hover:shadow-mint/40 hover:text-white"
                        : "bg-charcoal text-white hover:bg-slate"
                      }`}
                  >
                    Choisir ce pack
                    <ArrowRight className="ml-2 inline" size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Trust Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center text-sm text-slate"
        >
          🔒 Paiement sécurisé • ✅ Sans engagement • 🚚 Livraison gratuite
          Casa & Rabat (à partir de 300 MAD)
        </motion.div>
      </section>

      {/* Gift Offer */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-3xl bg-gradient-to-r from-peach/20 to-lilac/20 p-8 text-center md:p-12"
        >
          <div className="text-6xl">🎁</div>
          <h2 className="mt-6 text-3xl font-bold text-charcoal">
            Offrez LOUAAB en cadeau !
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate">
            Un abonnement LOUAAB est le cadeau idéal pour une naissance, un
            anniversaire ou simplement pour faire plaisir. Contactez-nous pour
            une carte cadeau personnalisée.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-coral px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-coral/30 transition hover:shadow-xl hover:shadow-coral/40"
          >
            <MessageCircle size={18} />
            Demander une carte cadeau
          </Link>
        </motion.div>
      </section>

      {/* Why LOUAAB */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-bold text-charcoal md:text-4xl"
        >
          Pourquoi c&apos;est si chouette ?
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {whyLouaab.map((item, index) => (
            <motion.div
              key={index}
              className="rounded-2xl bg-white p-6 text-center shadow-lg shadow-mist/20"
            >
              <div className="flex justify-center">{item.icon}</div>
              <h3 className="mt-4 text-xl font-bold text-charcoal">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-slate">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-bold text-charcoal md:text-4xl"
        >
          Comment ça marche ?
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-12 grid gap-8 md:grid-cols-3"
        >
          {howItWorks.map((step, index) => (
            <motion.div
              key={index}
              variants={item}
              className="relative rounded-2xl bg-gradient-to-br from-mint/10 to-sky-blue/10 p-8 text-center"
            >
              <div className="absolute -top-4 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-mint text-2xl font-bold text-white shadow-lg">
                {step.step}
              </div>
              <div className="mt-6 text-5xl">{step.icon}</div>
              <h3 className="mt-6 text-xl font-bold text-charcoal">
                {step.title}
              </h3>
              <p className="mt-3 text-sm text-slate">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* What's in the Box */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-3xl bg-white p-8 shadow-xl shadow-mist/20 md:p-12"
        >
          <div className="text-center">
            <Shield size={48} className="mx-auto text-mint" />
            <h2 className="mt-6 text-3xl font-bold text-charcoal">
              Ce qu&apos;il y a dans une box LOUAAB
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {boxContents.map((content, index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-xl bg-mist/30 p-4"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-mint">
                  <Check size={20} className="text-white" />
                </div>
                <p className="text-sm font-medium text-charcoal">{content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FAQ Teaser */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-r from-mint/20 to-sky-blue/20 p-8 text-center md:p-12"
        >
          <h2 className="text-3xl font-bold text-charcoal">
            Vous avez des questions ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate">
            Consultez notre FAQ pour tout savoir sur la location de jouets, la
            livraison, les échanges et plus encore.
          </p>
          <Link
            href="/faq"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-charcoal px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-slate"
          >
            Consulter la FAQ
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Pack Reservation Modal */}
      {selectedPack && (
        <PackReservationModal
          isOpen={isReservationModalOpen}
          onClose={() => {
            setIsReservationModalOpen(false);
            setSelectedPack(null);
          }}
          pack={{
            name: selectedPack.name,
            price: `${selectedPack.priceMonthly} MAD/mois`,
            description: selectedPack.description,
            features: selectedPack.features,
            durationLabel:
              selectedPack.durationMonths > 1
                ? `${selectedPack.durationMonths} mois`
                : "1 mois",
            durationDays: selectedPack.durationMonths * 30,
          }}
        />
      )}
    </PageShell>
  );
}

