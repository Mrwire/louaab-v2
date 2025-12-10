"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Search } from "lucide-react";
import CartIcon from "./cart-icon";
import FavoritesDropdown from "./favorites-dropdown";
import HeaderSearch from "./header-search";
import { useRef } from "react";
import MobileSearchModal from "./mobile-search-modal";

const NAV_LINKS = [
  { href: "/jouets", label: "Jouets" },
  { href: "/ages", label: "Âges" },
  { href: "/categories", label: "Catégories" },
  { href: "/nos-packs", label: "Nos packs" },
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement | null>(null);

  // Détecter si on est sur desktop
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // Fermer la recherche si clic à l'extérieur
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!searchActive) return;
      const target = e.target as Node;
      if (searchWrapRef.current && !searchWrapRef.current.contains(target)) {
        setSearchActive(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [searchActive]);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">

        {/* Header Principal */}
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Section Gauche: Logo + Burger */}
          <div className="flex shrink-0 items-center gap-3">
            {/* Menu Burger - Mobile uniquement - CACHÉ sur desktop avec JavaScript */}
            {!isDesktop && (
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-mist text-charcoal transition-colors hover:border-mint hover:bg-mint/10"
                aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}

            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <Image
                src="/logo.png"
                alt="LOUAAB - On loue, on joue"
                width={180}
                height={60}
                className="h-auto w-32 lg:w-40"
                priority
              />
            </Link>
          </div>

          {/* Section Centre: Navigation Desktop ou Recherche Inline */}
          {isDesktop && !searchActive && (
            <nav
              className="flex flex-1 items-center justify-center gap-2 px-4"
              aria-label="Navigation principale"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-slate rounded-lg transition-colors hover:bg-mint/10 hover:text-charcoal whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
          {isDesktop && searchActive && (
            <div ref={searchWrapRef} className="flex-1 px-4">
              <div className="mx-auto w-full max-w-xl transition-all duration-200 ease-out">
                <HeaderSearch />
              </div>
            </div>
          )}

          {/* Section Droite: Recherche + Actions */}
          <div className="flex shrink-0 items-center gap-2">

            {/* Bouton Recherche - Tous les écrans */}
            <button
              type="button"
              onClick={() => {
                if (isDesktop) {
                  setSearchActive((s) => !s);
                } else {
                  setMobileSearchOpen(true);
                }
              }}
              className={`flex h-10 w-10 items-center justify-center rounded-xl border text-charcoal transition-all duration-200 ${searchActive ? 'border-mint bg-mint/15 shadow-sm' : 'border-mist hover:border-mint hover:bg-mint/10'}`}
              aria-label="Rechercher"
              aria-expanded={searchActive}
            >
              {searchActive ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* Favoris */}
            <FavoritesDropdown />

            {/* Panier */}
            <CartIcon />
          </div>
        </div>

        {/* Menu Mobile - Slide Down */}
        {mobileOpen && (
          <div className="lg:hidden bg-white">
            <nav className="flex flex-col px-4 py-4 gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 text-sm font-medium text-charcoal rounded-xl bg-soft-white transition-colors hover:bg-mint/10"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Mobile Search Modal */}
      <MobileSearchModal
        isOpen={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
      />
    </header>
  );
}
