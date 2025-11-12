"use client";

import { useState } from "react";
import { PageShell } from "@/components/page-shell";

const API_BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || '/api')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');

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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, optIn })
      });
      if (!res.ok) throw new Error('send_failed');
      setSubmitted(true);
    } catch (e) {
      alert("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <section className="bg-white py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 lg:grid-cols-[1.2fr,0.8fr]">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-[0.1em] text-charcoal">
              Un conseil, une question ? Écrivez-nous !
            </h1>
            <p className="mt-3 text-sm text-slate">
              Nous répondons sous 24 h ouvrées et sommes disponibles sur WhatsApp pour toute demande urgente.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
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
                    placeholder="Décrivez votre besoin : jouets pour l'anniversaire, abonnement, questions..."
                    required
                  />
                </div>
                <div className="flex items-center gap-3">
                  <input id="optin" type="checkbox" checked={optIn} onChange={(e) => setOptIn(e.target.checked)} className="h-4 w-4 rounded border-mint text-mint focus:ring-mint" />
                  <label htmlFor="optin" className="text-xs text-slate">Je souhaite recevoir les nouvelles offres LOUAAB.</label>
                </div>
                <button disabled={submitting} className="rounded-full bg-mint px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-gradient-to-r hover:from-mint hover:to-lilac disabled:opacity-50">
                  {submitting ? 'Envoi…' : 'Envoyer le message'}
                </button>
              </form>
            ) : (
              <div className="mt-8 p-6 rounded-2xl bg-mint/10 border border-mint/30 text-charcoal">
                Merci ! Votre message a été envoyé. Nous vous répondrons très vite.
              </div>
            )}
          </div>

          <aside className="space-y-4 rounded-3xl bg-soft-white p-6 shadow-sm shadow-mist/40">
            <h2 className="text-lg font-semibold text-charcoal">Nous contacter</h2>
            <p className="text-sm text-slate">
              Casablanca & Rabat
              <br /> sara@louaab.ma
              <br /> +212 6 65701513
              <br /> WhatsApp : 9h – 19h, 6j/7
            </p>

            <div className="rounded-2xl bg-white p-4 text-sm text-slate shadow-sm shadow-mist/30">
              <p>
                Livraisons planifiées selon vos disponibilités. Retours gratuits à domicile.
              </p>
            </div>

            <iframe
              title="Carte LOUAAB"
              className="h-56 w-full rounded-3xl border-0"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3328.021!2d-7.589843!3d33.573110!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0:0x0!2zMzPCsDM0JzIzLjIiTiA3wrAzNScyMy44Ilc!5e0!3m2!1sfr!2sma!4v1700000000000"
              loading="lazy"
              allowFullScreen
            />

            <div className="flex gap-3 text-xl">
              <a href="https://www.instagram.com/louaab.ma" aria-label="Instagram">IG</a>
              <a href="https://www.facebook.com/louaab.ma" aria-label="Facebook">FB</a>
              <a href="https://wa.me/212665701513" aria-label="WhatsApp">WA</a>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}

