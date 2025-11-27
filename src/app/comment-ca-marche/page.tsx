"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PageShell } from "@/components/page-shell";
import {
  Search,
  Repeat,
  Heart,
  ShoppingCart,
  Package,
  Sparkles,
  DollarSign,
  Leaf,
  Home,
  Grid,
  Wrench,
  Shield,
} from "lucide-react";

const steps = [
  {
    number: "1",
    title: "🧸 1. Choisissez vos jouets préférés",
    description: `Parcourez notre catalogue régulièrement mis à jour et trouvez les jouets qui feront briller les yeux de vos enfants !
Filtrez par âge, catégorie ou pack clé en main pour gagner du temps.`,
    icon: <Search size={48} className="text-mint" />,
    color: "from-mint/20 to-mint/10",
    features: [
      "✔ Catalogue enrichi chaque semaine",
      "✔ Photos réelles des jouets",
      "✔ Avis et notes des parents",
    ],
  },
  {
    number: "2",
    title: "🔄 2. Flexibilité totale",
    description: `Aucun engagement, aucune contrainte ! Gardez les jouets aussi longtemps que vous le souhaitez, ou faites une pause à tout moment.
Chez Louaab, c’est vous qui décidez du rythme du jeu.`,
    icon: <Repeat size={48} className="text-peach" />,
    color: "from-peach/20 to-peach/10",
    features: [
      "✔ Sans abonnement obligatoire",
      "✔ Échanges illimités",
      "✔ Pause ou annulation simples",
    ],
  },
  {
    number: "3",
    title: "📦 3. Échangez dès que vous voulez",
    description: `Un jouet ne plaît plus ? Aucun souci ! Faites une demande d’échange via le site ou WhatsApp.
Nous récupérons les anciens jouets et livrons les nouveaux en même temps.`,
    icon: <Package size={48} className="text-sky-blue" />,
    color: "from-sky-blue/20 to-sky-blue/10",
    features: [
      "✔ Livraison et retour gratuits (Casa & Rabat)",
      "✔ Créneaux flexibles",
      "✔ Suivi en temps réel",
    ],
  },
  {
    number: "4",
    title: "❤ 4. Ou gardez-le pour toujours",
    description:
      "Coup de cœur ? Vous pouvez racheter le jouet à un prix avantageux et le garder définitivement.",
    icon: <Heart size={48} className="text-coral" />,
    color: "from-coral/20 to-coral/10",
    features: [
      "✔ Option d’achat à tout moment",
      "✔ Déduction du prix déjà payé",
      "✔ Transfert immédiat de propriété",
    ],
  },
];

const categories = [
  { name: "Jeux éducatifs", emoji: "🧠", href: "/categories/jeux-educatifs" },
  { name: "Jeux de société", emoji: "🎲", href: "/categories/jeux-societe" },
  { name: "Jouets en bois", emoji: "🪵", href: "/categories/jouets-bois" },
  { name: "Puzzles", emoji: "🧩", href: "/categories/puzzles" },
  { name: "Construction", emoji: "🏗️", href: "/categories/construction" },
  { name: "Véhicules", emoji: "🚗", href: "/categories/vehicules" },
  { name: "Créatif", emoji: "🎨", href: "/categories/creatif" },
  { name: "Extérieur", emoji: "⚽", href: "/categories/exterieur" },
];

const ageGroups = [
  { label: "0-12 mois", emoji: "👶", href: "/ages/0-12-mois" },
  { label: "12-24 mois", emoji: "🍼", href: "/ages/12-24-mois" },
  { label: "2-3 ans", emoji: "🧸", href: "/ages/2-3-ans" },
  { label: "3-5 ans", emoji: "🎈", href: "/ages/3-5-ans" },
  { label: "5-8 ans", emoji: "🎮", href: "/ages/5-8-ans" },
  { label: "8+ ans", emoji: "🎯", href: "/ages/8-plus" },
];

const benefits = [
  {
    icon: <DollarSign size={40} className="text-mint" />,
    title: "Plus pour votre argent",
    description:
      "Accès à des centaines de jouets pour une fraction du coût d'achat. Économisez jusqu'à 70% par rapport à l'achat.",
  },
  {
    icon: <Leaf size={40} className="text-fresh-green" />,
    title: "Bon pour la planète",
    description:
      "Participez à l'économie circulaire. Un jouet loué = moins de déchets plastiques et moins de surconsommation.",
  },
  {
    icon: <Home size={40} className="text-peach" />,
    title: "Moins de désordre",
    description:
      "Fini la maison envahie de jouets ! Gardez seulement ce dont vos enfants ont besoin, échangez le reste.",
  },
  {
    icon: <Grid size={40} className="text-sky-blue" />,
    title: "Vaste choix",
    description:
      "Plus de 500 jouets constamment renouvelés. De quoi occuper vos enfants pendant des années !",
  },
  {
    icon: <Wrench size={40} className="text-lilac" />,
    title: "Sans tracas",
    description:
      "Nous nous occupons de tout : nettoyage, réparation, livraison, retour. Vous n'avez qu'à jouer.",
  },
  {
    icon: <Shield size={40} className="text-coral" />,
    title: "Tout est pris en charge",
    description:
      "Assurance incluse, caution remboursable, support client réactif. Louez en toute tranquillité.",
  },
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

export default function CommentCaMarchePage() {
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
            <Sparkles size={16} />
            Simple et efficace
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-5xl font-bold text-charcoal md:text-6xl"
          >
            Comment ça marche ?
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate"
          >
            La location de jouets avec LOUAAB est simple, flexible et sans
            engagement. Découvrez comment offrir à vos enfants une variété
            infinie de jeux, sans encombrer votre maison ni vider votre
            portefeuille.
          </motion.p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="space-y-16">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${step.color} p-8 shadow-xl md:p-12`}
            >
              <div className="grid gap-8 md:grid-cols-2 md:items-center">
                <div className={index % 2 === 0 ? "" : "md:order-2"}>
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl font-bold text-mint shadow-lg">
                    {step.number}
                  </div>
                  <h2 className="mt-6 text-3xl font-bold text-charcoal">
                    {step.title}
                  </h2>
                  <p className="mt-4 text-lg leading-relaxed text-slate">
                    {step.description}
                  </p>

                  <ul className="mt-6 space-y-2">
                    {step.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-charcoal"
                      >
                        <Sparkles size={16} className="text-mint" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`flex justify-center ${
                    index % 2 === 0 ? "" : "md:order-1"
                  }`}
                >
                  <div className="flex h-64 w-64 items-center justify-center rounded-full bg-white/50 shadow-2xl backdrop-blur-sm">
                    {step.icon}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Browse by Age */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-bold text-charcoal md:text-4xl"
        >
          Parcourir par âge
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-6"
        >
          {ageGroups.map((age, index) => (
            <motion.div key={index} variants={item}>
              <Link
                href={age.href}
                className="block rounded-2xl bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-4xl">{age.emoji}</div>
                <p className="mt-3 text-sm font-semibold text-charcoal">
                  {age.label}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Browse by Category */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-bold text-charcoal md:text-4xl"
        >
          Parcourir par catégorie
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="mt-10 grid gap-4 md:grid-cols-4"
        >
          {categories.map((category, index) => (
            <motion.div key={index} variants={item}>
              <Link
                href={category.href}
                className="block rounded-2xl bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="text-5xl">{category.emoji}</div>
                <p className="mt-4 text-base font-semibold text-charcoal">
                  {category.name}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Why Choose Us */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-3xl font-bold text-charcoal md:text-4xl"
        >
          Pourquoi nous choisir ?
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={item}
              className="rounded-2xl bg-white p-8 shadow-sm transition hover:shadow-lg"
            >
              <div className="flex justify-center">{benefit.icon}</div>
              <h3 className="mt-6 text-center text-xl font-bold text-charcoal">
                {benefit.title}
              </h3>
              <p className="mt-3 text-center text-sm text-slate">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-mint via-sky-blue to-fresh-green p-8 text-center md:p-12"
        >
          <div className="pointer-events-none absolute inset-0 opacity-25 mix-blend-screen bg-[url('/file.svg')] bg-cover bg-center" />
          <div className="pointer-events-none absolute -top-12 -right-16 h-48 w-48 rounded-full bg-white/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-20 h-64 w-64 rounded-full bg-emerald-400/30 blur-[120px]" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Louer des jouets, c’est simple, flexible et éco-responsable 🌿 — rejoignez la famille Louaab dès aujourd’hui !
            </h2>
            <div className="mt-8 flex justify-center">
              <Link
                href="/jouets"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-mint shadow-lg transition hover:shadow-xl"
              >
                <ShoppingCart size={18} />
                Découvrir les jouets
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </PageShell>
  );
}
