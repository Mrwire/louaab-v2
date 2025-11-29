"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import ToyCard from "@/components/toy-card";
import { ToyData } from "@/lib/toys-data";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [toys, setToys] = useState<ToyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    async function fetchResults() {
      if (!query) {
        setToys([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setToys(data.results || []);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setToys([]);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/recherche?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <PageShell>
      {/* Header */}
      <section className="border-b border-mist/60 bg-gradient-to-br from-mint/5 to-blue-50 py-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <nav className="flex items-center gap-2 text-sm text-slate mb-4">
            <Link href="/" className="hover:text-mint">Accueil</Link>
            <span>/</span>
            <Link href="/jouets" className="hover:text-mint">Jouets</Link>
            <span>/</span>
            <span className="text-charcoal">Recherche</span>
          </nav>

          <h1 className="text-4xl font-bold uppercase tracking-[0.1em] text-charcoal">
            Recherche
          </h1>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-6 max-w-2xl">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher un jouet..."
                className="flex-1 rounded-full border-2 border-mint/30 px-6 py-3 focus:border-mint focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-mint px-8 py-3 font-semibold text-white transition hover:bg-mint/90"
              >
                Rechercher
              </button>
            </div>
          </form>

          {query && (
            <p className="mt-4 text-slate">
              {loading ? 'Recherche en cours...' : `${toys.length} résultat${toys.length > 1 ? 's' : ''} pour "${query}"`}
            </p>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-mint border-t-transparent" />
          </div>
        ) : toys.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {toys.map((toy) => (
              <ToyCard key={toy.backendId ?? toy.id} toy={toy} />
            ))}
          </div>
        ) : query ? (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-gray-50 py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900">
              Aucun résultat trouvé
            </h3>
            <p className="mt-2 text-gray-600">
              Essayez avec des mots-clés différents
            </p>
            <Link
              href="/jouets"
              className="mt-6 rounded-full bg-mint px-6 py-3 font-semibold text-white transition hover:bg-mint/90"
            >
              Voir tous les jouets
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-gray-50 py-20">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-gray-900">
              Commencez votre recherche
            </h3>
            <p className="mt-2 text-gray-600">
              Entrez un mot-clé pour trouver des jouets
            </p>
          </div>
        )}
      </section>

      {/* Quick Categories */}
      {!query && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-20">
          <h2 className="text-2xl font-bold text-charcoal mb-6">
            Recherches populaires
          </h2>
          <div className="flex flex-wrap gap-3">
            {['drone', 'voiture', 'poupée', 'lego', 'puzzle', 'jeux de société'].map((term) => (
              <Link
                key={term}
                href={`/recherche?q=${encodeURIComponent(term)}`}
                className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate ring-1 ring-gray-200 transition hover:ring-mint hover:text-mint"
              >
                {term}
              </Link>
            ))}
          </div>
        </section>
      )}
    </PageShell>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}


