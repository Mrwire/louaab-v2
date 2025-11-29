"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import ToyCard from "./toy-card";
import { ToyData } from "@/lib/toys-data";

interface FeaturedToysSectionProps {
  toys: ToyData[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

export default function FeaturedToysSection({ toys }: FeaturedToysSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-mint/5 via-white to-blue-50 py-20">
      <div className="mx-auto w-full max-w-6xl px-4">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl font-bold uppercase tracking-[0.15em] text-charcoal">
            Jouets vedettes
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate">
            Découvrez notre sélection des meilleurs jouets, choisis avec soin pour éveiller l&apos;imagination de vos enfants
          </p>
        </motion.div>

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {toys.map((toy) => (
            <motion.div key={toy.backendId ?? toy.id} variants={item}>
              <ToyCard toy={toy} priority />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Link
            href="/jouets"
            className="inline-flex items-center gap-2 rounded-full bg-mint px-8 py-4 font-semibold uppercase tracking-wide text-white shadow-lg shadow-mint/30 transition hover:bg-mint/90 hover:shadow-xl"
          >
            Voir tous les jouets
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-mint/10 blur-3xl" />
      <div className="absolute -left-20 bottom-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
    </section>
  );
}


