"use client";

import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { motion } from "framer-motion";
import { ChevronDown, Search, MessageCircle } from "lucide-react";
import Link from "next/link";

const faqCategories = [
  {
    title: "🧸 Qu’est-ce que LOUAAB ?",
    icon: "🧸",
    questions: [
      {
        question: "🧸 Qu’est-ce que LOUAAB ?",
        answer: `LOUAAB est le premier service marocain de location de jouets pour enfants, à la fois simple, flexible et éco-responsable.
Nous permettons aux parents d’offrir à leurs enfants de nouveaux jeux chaque mois, sans encombrer la maison ni gaspiller.`,
      },
      {
        question: "💡 Pourquoi louer plutôt qu’acheter ?",
        answer: `Parce que les enfants se lassent vite de leurs jouets !
Avec Louaab, vous pouvez renouveler régulièrement leur univers de jeu, économiser de l’argent et adopter un geste plus durable.
Et si un jouet devient leur préféré… vous pouvez même le garder pour toujours ❤`,
      },
    ],
  },
  {
    title: "⚙ Fonctionnement",
    icon: "⚙️",
    questions: [
      {
        question: "🎯 Comment fonctionne la location ?",
        answer: `Choisissez vos jouets sur le site, ajoutez-les à votre panier, et recevez-les directement à la maison.
Chaque jouet est soigneusement nettoyé, désinfecté et livré prêt à jouer !`,
      },
      {
        question: "📅 Y a-t-il un engagement minimum ?",
        answer: `Aucun ! Louaab fonctionne sans abonnement fixe ni durée imposée.
Vous gardez les jouets aussi longtemps que vous le souhaitez et pouvez mettre votre location en pause à tout moment.`,
      },
      {
        question: "🔁 À quelle fréquence puis-je échanger mes jouets ?",
        answer: `Autant de fois que vous le souhaitez !
Les échanges se font facilement via WhatsApp ou directement sur le site, avec livraison et reprise gratuites à Casablanca et Rabat à partir de 300 Dhs.`,
      },
      {
        question: "🧾 Que se passe-t-il si un jouet est abîmé ?",
        answer: `Pas de panique 😊 Les petites traces d’usure sont normales.
En cas de casse importante, notre équipe vous contactera pour évaluer une éventuelle participation au remplacement, au cas par cas.`,
      },
    ],
  },
  {
    title: "🎁 Jouets & Catalogue",
    icon: "🎁",
    questions: [
      {
        question: "👶 Quels types de jouets proposez-vous ?",
        answer: `Nous proposons des jouets éducatifs, d’éveil, de motricité, de construction, des jeux de société, et même des jeux pour les plus grands.
Chaque jouet est sélectionné pour sa qualité, sa sécurité et son intérêt pédagogique.`,
      },
      {
        question: "🌈 Les jouets conviennent à quel âge ?",
        answer: "Le catalogue couvre une large tranche d’âge, de 6 mois à « 10 ans, »\navec des filtres pratiques pour trouver le jouet parfait selon l’âge et les intérêts de votre enfant.",
      },
      {
        question: "📸 Les photos sont-elles des images réelles des jouets ?",
        answer:
          "Oui ! Toutes les photos du site représentent les jouets réels disponibles à la location, pour que vous sachiez exactement ce que vous recevrez.",
      },
      {
        question: "Puis-je louer des jouets pour une fête d’anniversaire ou un événement ?",
        answer: `Bien sûr ! Nous proposons des packs spéciaux pour les anniversaires, les écoles et les événements.
Contactez-nous sur WhatsApp pour créer un pack personnalisé selon l’âge et le nombre d’enfants.`,
      },
      {
        question: "✨ Les jouets sont-ils bien nettoyés ?",
        answer:
          "Absolument. Chaque jouet est désinfecté en profondeur après chaque location, selon un protocole strict et des produits adaptés aux enfants.",
      },
    ],
  },
  {
    title: "🧼 Sécurité & Hygiène",
    icon: "🧼",
    questions: [
      {
        question: "Les jouets sont-ils propres et sûrs ?",
        answer: `Absolument ! La sécurité et l’hygiène sont au cœur de notre engagement.
Tous nos jouets sont vérifiés, nettoyés et désinfectés après chaque location, avec des produits adaptés aux enfants et respectueux de l’environnement.`,
      },
      {
        question: "Comment nettoyez-vous les jouets ?",
        answer:
          "Chaque jouet passe par un protocole rigoureux en plusieurs étapes :\n\t1.\tVérification de l’état général\n\t2.\tLavage à la main ou vapeur selon le matériau\n\t3.\tDésinfection complète avec produits certifiés non toxiques\n\t4.\tSéchage et contrôle final avant emballage",
      },
    ],
  },
  {
    title: "💰 Tarifs & Paiement",
    icon: "💰",
    questions: [
      {
        question: "Est-ce vraiment économique ?",
        answer: `Oui ! Louer avec Louaab, c’est offrir à votre enfant une rotation constante de jouets pour une fraction du prix d’achat.
Vous économisez tout en offrant plus de variété et en limitant le gaspillage.`,
      },
      {
        question: "Y a-t-il des frais d’adhésion ou d’inscription ?",
        answer: "Non, aucun frais caché. Vous payez uniquement la location des jouets que vous choisissez.",
      },
      {
        question: "Qu’est-ce que la caution et pourquoi est-elle nécessaire ?",
        answer: `Une petite caution peut être demandée selon la valeur du jouet.
Elle est bien sûr remboursée intégralement au retour du jouet en bon état.
Cela nous permet de maintenir la qualité du service et des jouets proposés.`,
      },
      {
        question: "Proposez-vous des promotions ou des réductions ?",
        answer: `Oui ! Nous proposons régulièrement des offres spéciales, remises saisonnières et packs avantageux.
Suivez-nous sur Instagram ou abonnez-vous à notre newsletter pour ne rien manquer 🎉`,
      },
    ],
  },
  {
    title: "🚚 Livraison & Retour",
    icon: "🚚",
    questions: [
      {
        question: "Comment se passe la livraison et la collecte ?",
        answer: `Nous livrons et récupérons vos jouets directement à domicile.
La livraison et le retour sont gratuits à partir de 300 Dhs à Casablanca et Rabat.
Vous choisissez le créneau horaire qui vous convient, et notre équipe s’occupe du reste.`,
      },
      {
        question: "Que se passe-t-il si un jouet est endommagé ?",
        answer: `Pas d’inquiétude 😊
Les petites marques d’usure sont normales. Si un jouet est sérieusement abîmé, nous vous contactons pour évaluer ensemble une solution juste et simple.`,
      },
      {
        question: "Et si mon enfant ne veut pas rendre un jouet ?",
        answer: `C’est souvent le signe qu’il l’adore ❤
Bonne nouvelle : vous pouvez racheter le jouet à prix préférentiel et le garder définitivement.`,
      },
    ],
  },
  {
    title: "📱 Commande & Contact",
    icon: "📱",
    questions: [
      {
        question: "Puis-je louer directement via le site web ?",
        answer:
          "Oui, tout se passe en ligne ! Vous pouvez choisir vos jouets, les ajouter au panier et planifier la livraison en quelques clics.",
      },
      {
        question: "Puis-je vous contacter sur WhatsApp ?",
        answer: `Bien sûr ! C’est le moyen le plus simple et le plus rapide pour poser une question ou demander un échange.
👉 Cliquez sur le bouton WhatsApp en bas de la page, notre équipe vous répond rapidement.`,
      },
    ],
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);

  const toggleAccordion = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setExpandedIndex(expandedIndex === key ? null : key);
  };

  // Filter questions based on search
  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <PageShell>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-mint/10 via-soft-white to-lilac/10 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-charcoal md:text-6xl"
          >
            Questions Fréquentes
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-slate"
          >
            Toutes les réponses à vos questions sur LOUAAB, la location de
            jouets, la livraison et bien plus.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-10 max-w-2xl"
          >
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate"
              />
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border-2 border-mist bg-white py-4 pl-12 pr-4 text-base shadow-lg focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        {filteredCategories.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
            <p className="text-lg text-slate">
              Aucune question ne correspond à votre recherche.
            </p>
            <p className="mt-2 text-sm text-slate">
              Essayez avec d'autres mots-clés ou contactez-nous directement.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredCategories.map((category, categoryIndex) => (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-4xl">{category.icon}</span>
                  <h2 className="text-2xl font-bold text-charcoal">
                    {category.title}
                  </h2>
                </div>

                <div className="space-y-3">
                  {category.questions.map((item, questionIndex) => {
                    const key = `${categoryIndex}-${questionIndex}`;
                    const isExpanded = expandedIndex === key;

                    return (
                      <div
                        key={questionIndex}
                        className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
                      >
                        <button
                          onClick={() =>
                            toggleAccordion(categoryIndex, questionIndex)
                          }
                          className="flex w-full items-center justify-between p-6 text-left"
                        >
                          <span className="pr-4 text-lg font-semibold text-charcoal">
                            {item.question}
                          </span>
                          <ChevronDown
                            size={24}
                            className={`flex-shrink-0 text-mint transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="border-t border-mist px-6 pb-6"
                          >
                            <p className="pt-4 text-slate leading-relaxed whitespace-pre-line">
                              {item.answer}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Contact CTA */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl bg-gradient-to-r from-mint/20 to-fresh-green/20 p-8 text-center md:p-12"
        >
          <MessageCircle size={48} className="mx-auto text-mint" />
          <h2 className="mt-6 text-3xl font-bold text-charcoal">
            Vous ne trouvez pas la réponse ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate">
            Notre équipe est là pour vous aider ! Contactez-nous sur WhatsApp ou
            par email, nous vous répondons rapidement.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="https://wa.me/212665701513"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-fresh-green px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-fresh-green/30 transition hover:shadow-xl hover:shadow-fresh-green/40"
            >
              <MessageCircle size={18} />
              WhatsApp
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border-2 border-mint bg-white px-8 py-4 text-sm font-bold uppercase tracking-wide text-mint transition hover:bg-mint hover:text-white"
            >
              📧 Nous écrire
            </Link>
          </div>
        </motion.div>
      </section>
    </PageShell>
  );
}

