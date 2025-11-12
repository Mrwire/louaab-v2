"use client";

import { useState } from "react";
import { PageShell } from "@/components/page-shell";
import { motion } from "framer-motion";
import { ChevronDown, Search, MessageCircle } from "lucide-react";
import Link from "next/link";

const faqCategories = [
  {
    title: "À propos de LOUAAB",
    icon: "🎈",
    questions: [
      {
        question: "Qu'est-ce qu'une entreprise de location de jouets ?",
        answer:
          "LOUAAB est le premier service marocain de location de jouets et jeux de société. Nous proposons des centaines de jouets adaptés aux enfants, adolescents et adultes. Vous choisissez, on livre, vous jouez, et quand vous en avez assez, on vient échanger ! C'est simple, économique et écologique.",
      },
      {
        question: "Pourquoi louer plutôt qu'acheter ?",
        answer:
          "Louer coûte beaucoup moins cher que d'acheter constamment de nouveaux jouets. De plus, les enfants se lassent vite : avec LOUAAB, ils découvrent toujours de nouveaux jeux sans encombrer la maison. C'est aussi un geste pour la planète en participant à l'économie circulaire.",
      },
    ],
  },
  {
    title: "Fonctionnement",
    icon: "⚙️",
    questions: [
      {
        question: "Comment fonctionne la location ?",
        answer:
          "C'est très simple ! Vous choisissez un pack mensuel (Mini, Maxi ou Mega) adapté à vos besoins. Nous livrons les jouets chez vous gratuitement (à Casa et Rabat à partir de 300 MAD). Vous gardez les jouets aussi longtemps que vous voulez, puis demandez un échange quand vos enfants veulent de la nouveauté.",
      },
      {
        question: "Y a-t-il un engagement minimum ?",
        answer:
          "Non ! LOUAAB fonctionne sans engagement. Vous pouvez mettre en pause ou annuler votre abonnement à tout moment. Notre objectif est votre satisfaction, pas de vous enfermer dans un contrat.",
      },
      {
        question: "À quelle fréquence puis-je échanger mes jouets ?",
        answer:
          "Vous pouvez échanger vos jouets autant de fois que vous le souhaitez ! Il n'y a pas de limite mensuelle. Dès que vos enfants s'en lassent, demandez un échange via le site ou WhatsApp.",
      },
    ],
  },
  {
    title: "Jouets & Catalogue",
    icon: "🎁",
    questions: [
      {
        question: "Quels types de jouets proposez-vous ?",
        answer:
          "Notre catalogue comprend plus de 500 jouets : jeux Montessori, jeux éducatifs, jouets en bois, jeux de société pour toute la famille, puzzles, jeux de construction, véhicules, jouets d'extérieur, et bien plus. Nous ajoutons régulièrement de nouveaux jouets.",
      },
      {
        question: "Les jouets conviennent à quel âge ?",
        answer:
          "Nos jouets sont adaptés de 0 à 8 ans principalement, mais nous avons également des jeux de société pour adolescents et adultes. Chaque jouet est étiqueté avec l'âge recommandé pour vous aider à choisir.",
      },
      {
        question: "Les photos sont-elles des images réelles des jouets ?",
        answer:
          "Oui ! Nous prenons en photo tous nos jouets pour que vous voyiez exactement ce que vous allez recevoir. Nous indiquons aussi l'état (excellent, très bon, bon) pour une transparence totale.",
      },
      {
        question: "Puis-je louer des jouets pour une fête d'anniversaire ou un événement ?",
        answer:
          "Absolument ! Contactez-nous sur WhatsApp ou par email, nous pouvons créer un pack personnalisé pour votre événement avec livraison et collecte aux dates de votre choix.",
      },
    ],
  },
  {
    title: "Sécurité & Hygiène",
    icon: "✨",
    questions: [
      {
        question: "Les jouets sont-ils propres et sûrs ?",
        answer:
          "Oui, absolument ! Chaque jouet est soigneusement nettoyé avec des produits non toxiques, désinfecté, inspecté et réparé si nécessaire avant chaque location. Tous nos jouets sont conformes aux normes CE européennes.",
      },
      {
        question: "Comment nettoyez-vous les jouets ?",
        answer:
          "Nous utilisons un protocole strict : nettoyage avec des produits non toxiques, désinfection, vérification de toutes les pièces, réparation si nécessaire, puis emballage individuel. Chaque jouet est traité comme si c'était pour nos propres enfants.",
      },
    ],
  },
  {
    title: "Tarifs & Paiement",
    icon: "💰",
    questions: [
      {
        question: "Est-ce vraiment économique ?",
        answer:
          "Oui ! Par exemple, le Maxi Pack coûte 349 MAD/mois pour 5 jouets, soit 70 MAD par jouet. Si vous achetiez ces mêmes jouets, vous dépenseriez facilement plus de 2000 MAD, et ils finiraient par prendre la poussière. Avec LOUAAB, vous économisez et vos enfants ne s'ennuient jamais.",
      },
      {
        question: "Y a-t-il des frais d'adhésion ou d'inscription ?",
        answer:
          "Non, aucun frais d'adhésion. Vous payez simplement votre pack mensuel et une caution remboursable (qui vous est rendue en fin d'abonnement si les jouets sont en bon état).",
      },
      {
        question: "Qu'est-ce que la caution et pourquoi est-elle nécessaire ?",
        answer:
          "La caution est un montant remboursable qui couvre d'éventuels dommages ou pertes. Elle est de 100 à 250 MAD selon votre pack. Si vous retournez les jouets en bon état, la caution vous est intégralement remboursée. C'est une garantie pour nous et pour vous.",
      },
      {
        question: "Proposez-vous des promotions ou des réductions ?",
        answer:
          "Oui ! Nous avons régulièrement des offres spéciales, notamment pour les nouveaux membres, les parrainages, et certaines périodes de l'année. Abonnez-vous à notre newsletter pour ne rien manquer.",
      },
    ],
  },
  {
    title: "Livraison & Retour",
    icon: "🚚",
    questions: [
      {
        question: "Comment se passe la livraison et la collecte ?",
        answer:
          "Nous livrons gratuitement à Casablanca et Rabat (à partir de 300 MAD de commande). Vous choisissez un créneau horaire qui vous arrange. Lors d'un échange, nous récupérons les anciens jouets et livrons les nouveaux en même temps.",
      },
      {
        question: "Que se passe-t-il si un jouet est endommagé ?",
        answer:
          "Pas de panique ! L'usure normale est tout à fait acceptable. Si un jouet est cassé accidentellement, contactez-nous. Selon les dégâts, soit on le répare, soit on déduira une petite participation de votre caution. Nous restons toujours raisonnables et compréhensifs.",
      },
      {
        question: "Et si mon enfant ne veut pas rendre un jouet ?",
        answer:
          "Ça arrive ! Si votre enfant adore un jouet et ne veut plus s'en séparer, vous pouvez l'acheter à un prix avantageux. Contactez-nous pour connaître le prix de rachat.",
      },
    ],
  },
  {
    title: "Commande & Contact",
    icon: "📱",
    questions: [
      {
        question: "Puis-je louer directement via le site web ?",
        answer:
          "Oui ! Parcourez notre catalogue en ligne, ajoutez les jouets à votre panier, et finalisez votre commande. Vous pouvez aussi nous contacter sur WhatsApp si vous préférez un accompagnement personnalisé.",
      },
      {
        question: "Puis-je vous contacter sur WhatsApp ?",
        answer:
          "Bien sûr ! WhatsApp est notre canal de communication principal. Envoyez-nous un message au +212 6 65701513, nous vous répondons rapidement pour vous aider à choisir, commander ou échanger vos jouets.",
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
                            <p className="pt-4 text-slate leading-relaxed">
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
