"use client";

import { useState } from "react";
import { PageShell } from "@/components/page-shell";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://louaab.ma/api";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, optIn }),
      });
      if (!res.ok) throw new Error("send_failed");
      setSubmitted(true);
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      alert("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  const infoCards = [
    {
      title: "WhatsApp",
      description: "Réponse rapide 9h-19h",
      action: { label: "Écrire sur WhatsApp", href: "https://wa.me/212665701513" },
    },
    {
      title: "Email",
      description: "louaab.ma@gmail.com",
      action: { label: "Envoyer un email", href: "mailto:louaab.ma@gmail.com" },
    },
    {
      title: "Horaires",
      description: "Lun - Sam : 9h à 19h",
      extra: "Dimanche : laissez un message",
    },
    {
      title: "Zones de livraison",
      description: "Casablanca & Rabat",
      extra: "Livraison/retour gratuits dès 300 MAD",
    },
  ];

  return (
    <PageShell>
      <section className="bg-white py-14">
        <div className="mx-auto w-full max-w-6xl px-4">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-mint">Contact</p>
            <h1 className="mt-3 text-3xl font-bold text-charcoal md:text-4xl">
              Une question ? Un conseil ? Nous sommes là pour vous aider.
            </h1>
            <p className="mt-3 text-sm text-slate max-w-2xl mx-auto">
              Formulaire, WhatsApp ou email : on vous répond vite pour toute demande (jouets, abonnement, devis, événements).
            </p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1.05fr,0.95fr]">
            <aside className="rounded-3xl bg-soft-white p-6 shadow-sm shadow-mint/30">
              <h2 className="text-lg font-semibold text-charcoal">Envoyer un message</h2>
              <p className="mt-2 text-sm text-slate">
                Besoin d’un devis ou d’un conseil personnalisé ? Laissez-nous un message, nous vous répondons au plus vite.
              </p>

              {!submitted ? (
                <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-charcoal">Nom et prénom</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="rounded-2xl border border-mist px-4 py-3 text-sm text-charcoal focus:border-mint focus:outline-none"
                      placeholder="Ex : Sara El Fassi"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-charcoal">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="rounded-2xl border border-mist px-4 py-3 text-sm text-charcoal focus:border-mint focus:outline-none"
                      placeholder="vous@exemple.ma"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-charcoal">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[160px] rounded-2xl border border-mist px-4 py-3 text-sm text-charcoal focus:border-mint focus:outline-none"
                      placeholder="Décrivez votre besoin : anniversaire, abonnement, questions..."
                      required
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      id="optin"
                      type="checkbox"
                      checked={optIn}
                      onChange={(e) => setOptIn(e.target.checked)}
                      className="h-4 w-4 rounded border-mint text-mint focus:ring-mint"
                    />
                    <label htmlFor="optin" className="text-xs text-slate">
                      Je souhaite recevoir les nouvelles offres Louaab.
                    </label>
                  </div>
                  <button
                    disabled={submitting}
                    className="rounded-full bg-mint px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-gradient-to-r hover:from-mint hover:to-lilac disabled:opacity-50"
                  >
                    {submitting ? "Envoi..." : "Envoyer le message"}
                  </button>
                </form>
              ) : (
                <div className="mt-8 rounded-2xl border border-mint/30 bg-mint/10 p-6 text-charcoal">
                  Merci ! Votre message a été envoyé. Nous vous répondrons très vite.
                </div>
              )}
            </aside>

            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {infoCards.map((card) => (
                  <div key={card.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate">{card.title}</p>
                    <p className="mt-2 text-base font-semibold text-charcoal">{card.description}</p>
                    {card.extra && <p className="text-sm text-slate mt-1">{card.extra}</p>}
                    {card.action && (
                      <a
                        href={card.action.href}
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-mint hover:text-mint/80"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {card.action.label}
                      </a>
                    )}
                  </div>
                ))}
              </div>

              <div className="rounded-3xl overflow-hidden border border-gray-100">
                <iframe
                  title="Carte LOUAAB"
                  className="h-56 w-full border-0"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3328.021!2d-7.589843!3d33.573110!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2zMzPCsDM0JzIzLjIiTiA3wrAzNScyMy44Ilc!5e0!3m2!1sfr!2sma!4v1700000000000"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
