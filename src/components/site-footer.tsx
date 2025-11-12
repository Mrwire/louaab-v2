"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, Clock, Facebook, Instagram, MessageCircle } from "lucide-react";

const footerLinks = {
  "Navigation": [
    { href: "/jouets", label: "Jouets" },
    { href: "/ages", label: "Âges" },
    { href: "/categories", label: "Catégories" },
    { href: "/nos-packs", label: "Nos packs" },
  ],
  "Service": [
    { href: "/comment-ca-marche", label: "Comment ça marche" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ],
  "Légal": [
    { href: "/mentions-legales", label: "Mentions légales" },
    { href: "/politique-confidentialite", label: "Confidentialité" },
    { href: "/conditions-location", label: "CGV" },
  ],
};

const socialLinks = [
  { icon: Facebook, href: "https://facebook.com/louaab", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com/louaab", label: "Instagram" },
  { icon: MessageCircle, href: "https://wa.me/212665701513", label: "WhatsApp" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-mist/40 bg-soft-white">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
        {/* Main Footer Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          {/* Brand Column - Takes 5 columns on large screens */}
          <div className="space-y-6 lg:col-span-5">
            <Link href="/" className="inline-block">
              <Image
                src="/logo.png"
                alt="LOUAAB"
                width={160}
                height={53}
                className="h-auto w-32"
              />
            </Link>
            
            <p className="text-sm leading-relaxed text-slate">
              🎈 On loue, on joue ! Le premier service marocain de location de jouets pour tous les âges.
            </p>

            {/* Newsletter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                Newsletter
              </h4>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Votre email"
                  className="flex-1 rounded-xl border border-mist bg-white px-4 py-2.5 text-sm transition focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-mint px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-fresh-green"
                >
                  OK
                </button>
              </form>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-mist text-slate transition hover:border-mint hover:bg-mint hover:text-white"
                  aria-label={label}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns - Each takes 2-3 columns */}
          <div className="grid grid-cols-2 gap-8 md:col-span-1 lg:col-span-7 lg:grid-cols-3">
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section} className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal">
                  {section}
                </h4>
                <ul className="space-y-2.5">
                  {links.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-slate transition hover:text-charcoal"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-10 grid gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mint/10">
              <Mail size={18} className="text-mint" />
            </div>
            <div>
              <p className="font-semibold text-charcoal">Email</p>
              <a href="mailto:sara@louaab.ma" className="text-slate transition hover:text-mint">
                sara@louaab.ma
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-peach/10">
              <Phone size={18} className="text-coral" />
            </div>
            <div>
              <p className="font-semibold text-charcoal">Téléphone</p>
              <a href="tel:+212665701513" className="text-slate transition hover:text-mint">
                +212 6 65701513
              </a>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-blue/10">
              <Clock size={18} className="text-sky-blue" />
            </div>
            <div>
              <p className="font-semibold text-charcoal">Horaires</p>
              <p className="text-slate">Lun–Sam : 9h – 19h</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-mist pt-8 text-xs text-slate md:flex-row">
          <p>
            © {new Date().getFullYear()} <span className="font-semibold text-charcoal">LOUAAB</span> – On loue, on joue !
          </p>
          
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate/60">
              Paiement sécurisé
            </span>
            <div className="flex gap-1.5">
              {["💳", "🏦", "📱"].map((icon, i) => (
                <span
                  key={i}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-mist/60 bg-white text-sm"
                >
                  {icon}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Made in Morocco */}
        <div className="mt-4 text-center">
          <p className="text-xs text-slate/60">
            🇲🇦 Fabriqué avec amour au Maroc
          </p>
        </div>
      </div>
    </footer>
  );
}
