"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { PageShell } from "@/components/page-shell";
import { ChevronDown, Sparkles, Shield, Package, Heart, Recycle, Users } from "lucide-react";
import FeaturedToysSection from "@/components/featured-toys-section";
import { ToyData } from "@/lib/toys-data";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.8, 
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number]
    } 
  },
};

interface HomePageProps {
  featuredToys: ToyData[];
}

export default function HomePage({ featuredToys }: HomePageProps) {
  const { scrollYProgress } = useScroll();

  return (
    <PageShell>
      {/* Hero Section with Video Background */}
      <section className="relative flex min-h-[100vh] items-center justify-center overflow-hidden bg-charcoal">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{ zIndex: 0 }}
        >
          <source src="/video/child_playing_toy.mp4" type="video/mp4" />
          Votre navigateur ne supporte pas la vidéo.
        </video>

        {/* Dark Overlay */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-charcoal/75 via-charcoal/65 to-transparent"
          style={{ zIndex: 1 }}
        />

        {/* Hero Content */}
        <motion.div
          className="relative z-10 mx-auto w-full max-w-6xl px-4 py-20 text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.h1
            className="text-5xl font-bold uppercase leading-tight tracking-[0.15em] text-white drop-shadow-2xl md:text-7xl lg:text-8xl"
            variants={item}
          >
            <span className="block text-6xl md:text-8xl lg:text-9xl">🎈</span>
            <span className="block mt-4">On loue,</span>
            <span className="text-mint">
              on joue !
            </span>
          </motion.h1>

          <motion.p
            className="mx-auto mt-8 max-w-3xl text-lg font-medium text-gray-100 drop-shadow-lg md:text-xl"
            variants={item}
          >
            <strong>LOUAAB</strong> est le premier service marocain de location de jouets et jeux de société pour enfants, adolescents et adultes.
            <br className="hidden md:block" />
            Découvrez, jouez, échangez… sans jamais vous encombrer !
          </motion.p>

          <motion.div variants={item} className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/jouets"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-white px-10 py-5 text-base font-bold uppercase tracking-wide text-mint shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-mint/40"
            >
              <span className="relative z-10 flex items-center gap-3">
                🎁 Découvrir nos jouets
                <ChevronDown size={20} className="rotate-[-90deg] transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 -z-0 bg-gradient-to-r from-mint/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
            <Link
              href="/comment-ca-marche"
              className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border-2 border-white/40 bg-white/20 px-10 py-5 text-base font-bold uppercase tracking-wide text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/60 hover:bg-white/30 hover:shadow-xl"
            >
              <span className="relative z-10 flex items-center gap-3">
                💡 Comment ça marche ?
              </span>
              <span className="absolute inset-0 -z-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 1, repeat: Infinity, repeatType: "reverse" }}
          >
            <ChevronDown size={32} className="text-white/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Toys */}
      <FeaturedToysSection toys={featuredToys} />

      {/* Why LOUAAB Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-mint/10 via-soft-white to-peach/10 py-24">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 lg:grid-cols-2">
          <motion.article
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-4xl font-bold text-charcoal">
              🧸 Pourquoi LOUAAB ?
            </h2>
            <h3 className="text-2xl font-semibold text-mint">
              Louer, c'est moins cher que d'acheter !
            </h3>
            <p className="text-base leading-relaxed text-slate">
              Les enfants se lassent vite des jouets, et les adultes manquent souvent de place.
              Avec LOUAAB, profitez de centaines de jouets et jeux adaptés à tous les âges :
            </p>
            <ul className="space-y-4">
              {[
                { emoji: "🧠", text: "Jeux éducatifs et Montessori" },
                { emoji: "🎲", text: "Jeux de société pour petits et grands" },
                { emoji: "🚗", text: "Jouets d'extérieur et de motricité" },
                { emoji: "🧩", text: "Jeux de construction, puzzles et plus encore" },
              ].map((benefit, i) => (
                <motion.li
                  key={benefit.text}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <span className="text-2xl">{benefit.emoji}</span>
                  <span className="text-slate pt-1">{benefit.text}</span>
                </motion.li>
              ))}
            </ul>
            <p className="text-lg font-semibold text-charcoal">
              Louez, amusez-vous, puis échangez pour de nouvelles découvertes.
              <br />
              <span className="text-mint">Simple, moins cher et éco-responsable ♻️</span>
            </p>
          </motion.article>

          <motion.article
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-4xl font-bold text-charcoal">
              🔁 Comment ça marche ?
            </h2>
            <h3 className="text-2xl font-semibold text-mint">
              Un concept simple en 3 étapes
            </h3>
            <div className="space-y-6">
              {[
                { step: "1️⃣", title: "Choisissez vos jouets préférés", description: "parmi notre catalogue" },
                { step: "2️⃣", title: "Recevez-les chez vous", description: "livraison et retour gratuits dans Casablanca et Rabat à partir de 300dhs" },
                { step: "3️⃣", title: "Profitez et échangez", description: "dès que vos enfants ont envie de nouveauté" },
              ].map((step, i) => (
                <motion.div
                  key={step.step}
                  className="flex gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.6 }}
                >
                  <div className="text-4xl">
                    {step.step}
                  </div>
                  <div>
                    <h4 className="font-bold text-charcoal">{step.title}</h4>
                    <p className="mt-1 text-sm text-slate">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-sm text-slate italic">
              Tous nos jouets sont soigneusement désinfectés, vérifiés et emballés avant chaque location.
            </p>
            <Link
              href="/comment-ca-marche"
              className="inline-flex items-center gap-2 text-mint hover:text-lilac font-semibold"
            >
              En savoir plus
              <ChevronDown size={16} className="rotate-[-90deg]" />
            </Link>
          </motion.article>
        </div>
      </section>

      {/* Nos valeurs Section */}
      <section className="bg-white py-24">
        <div className="mx-auto w-full max-w-7xl px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-charcoal mb-4">
              💚 Nos valeurs
            </h2>
            <h3 className="text-2xl font-semibold text-mint">
              Jouer autrement, c'est notre mission
            </h3>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-slate">
              LOUAAB est né d'une idée simple : rendre le jeu accessible à tous tout en réduisant le gaspillage.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Recycle,
                title: "L'économie circulaire",
                description: "un jouet qui sert plusieurs familles vit plus longtemps",
                color: "from-mint/20 to-green-100"
              },
              {
                icon: Users,
                title: "Le partage",
                description: "apprendre à consommer autrement, dès le plus jeune âge",
                color: "from-lilac/20 to-purple-100"
              },
              {
                icon: Sparkles,
                title: "La qualité",
                description: "chaque jouet est testé, nettoyé et validé avant chaque location",
                color: "from-peach/20 to-yellow-100"
              },
            ].map((value, i) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  className="rounded-3xl bg-gradient-to-br p-8 text-center shadow-sm"
                  style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2, duration: 0.6 }}
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                    <Icon size={32} className="text-mint" />
                  </div>
                  <h4 className="mb-2 text-xl font-bold text-charcoal">{value.title}</h4>
                  <p className="text-slate">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-gradient-to-br from-blue-50 to-mint/10 py-24">
        <div className="mx-auto w-full max-w-5xl px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-charcoal mb-4">
              📦 Sécurité et entretien
            </h2>
            <h3 className="text-2xl font-semibold text-mint">
              Des jouets propres, sûrs et prêts à jouer
            </h3>
          </motion.div>

          <motion.div
            className="grid gap-6 md:grid-cols-3"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={container}
          >
            {[
              { emoji: "🧴", text: "Nettoyé avec des produits non toxiques" },
              { emoji: "🔍", text: "Inspecté et réparé si nécessaire" },
              { emoji: "📦", text: "Emballé individuellement" },
            ].map((item, i) => (
              <motion.div
                key={item.text}
                className="rounded-2xl bg-white p-6 text-center shadow-sm"
              >
                <div className="text-5xl mb-3">{item.emoji}</div>
                <p className="text-slate font-medium">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            className="mt-8 text-center text-sm text-slate italic"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
          >
            Nous assurons une sécurité maximale pour vos enfants, conformément aux normes CE.
          </motion.p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-24">
        <div className="mx-auto w-full max-w-7xl px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-charcoal mb-4">
              🗣️ Ils ont testé, ils adorent ❤️
            </h2>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                quote: "Mes enfants redécouvrent le plaisir de jouer sans que la maison déborde !",
                author: "Nadia",
                location: "Casablanca"
              },
              {
                quote: "Je trouve ça génial pour éviter d'acheter sans cesse. C'est économique et écolo.",
                author: "Karim",
                location: "Rabat"
              },
              {
                quote: "On loue même des jeux de société pour nos soirées entre amis !",
                author: "Siham",
                location: "Bouskoura"
              },
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.author}
                className="rounded-3xl bg-gradient-to-br from-mint/10 to-lilac/10 p-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
              >
                <p className="text-lg text-charcoal italic mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mint text-white font-bold text-xl">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">{testimonial.author}</p>
                    <p className="text-sm text-slate">{testimonial.location}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20"
        style={{
          background: '#0f73b1'
        }}
      >
        <motion.div
          className="mx-auto w-full max-w-4xl px-4 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold uppercase tracking-[0.1em]" style={{ color: '#ffffff' }}>
            Prêt à commencer ?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg" style={{ color: '#ffffff', opacity: 0.9 }}>
            Rejoignez les familles marocaines qui ont choisi LOUAAB pour des moments de jeu inoubliables
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/jouets"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-bold uppercase tracking-wide shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
              style={{ backgroundColor: '#ffffff', color: '#1897aa' }}
            >
              Voir les jouets
              <ChevronDown size={20} className="rotate-[-90deg]" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border-2 px-8 py-4 font-bold uppercase tracking-wide transition-all"
              style={{ 
                borderColor: '#ffffff', 
                color: '#ffffff',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              💬 Nous contacter
            </Link>
          </div>
        </motion.div>
      </section>
    </PageShell>
  );
}
