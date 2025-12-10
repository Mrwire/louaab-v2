"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PageShell } from "@/components/page-shell";
import { getAllToys, ToyData } from "@/lib/toys-data";
import { formatDateInput } from "@/lib/date";
import ToyCardWithReservation from "@/components/toy-card-with-reservation";
import SearchBar from "@/components/search-bar";
import { useFavorites } from "@/contexts/favorites-context";
import { useCart } from "@/contexts/cart-context";
import { triggerConfetti } from "@/lib/confetti";
import {
  Search,
  SlidersHorizontal,
  Grid3x3,
  List,
  Heart,
  ShoppingCart,
  X,
} from "lucide-react";

const categories = [
  "Tous",
  "Jeux éducatifs",
  "Jeux de société",
  "Jeux d'adresse",
  "Véhicules",
  "Jeux créatifs",
  "Arcade",
];

const ageRanges = [
  { label: "Tous", value: "all" },
  { label: "0-12 mois", value: "0-1" },
  { label: "1-3 ans", value: "1-3" },
  { label: "3-6 ans", value: "3-6" },
  { label: "6-12 ans", value: "6-12" },
  { label: "12+ ans", value: "12+" },
];

type JouetsClientProps = {
  initialToys: ToyData[];
};

export default function JouetsClient({ initialToys }: JouetsClientProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [selectedAge, setSelectedAge] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("recent");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [priceRangeLocked, setPriceRangeLocked] = useState(false);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [toys, setToys] = useState<ToyData[]>(initialToys ?? []);
  const [loading, setLoading] = useState(!initialToys?.length);
  const [showSearchBar, setShowSearchBar] = useState(false);

  const handleToggleFavorite = (e: React.MouseEvent, toyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const wasNotFavorite = !isFavorite(toyId);
    toggleFavorite(toyId);

    if (wasNotFavorite) {
      triggerConfetti();
    }
  };

  const handleAddToCart = (e: React.MouseEvent, toy: ToyData) => {
    e.preventDefault();
    e.stopPropagation();

    const defaultDuration = "weekly";
    const defaultDate = formatDateInput();

    addToCart(toy, defaultDuration, defaultDate);
    triggerConfetti();
  };

  const getNumericPrice = (priceLabel?: string) => {
    if (!priceLabel) return 0;
    const normalized = priceLabel.replace(/[^\d.,]/g, "").replace(",", ".");
    const price = parseFloat(normalized);
    return Number.isFinite(price) ? price : 0;
  };

  useEffect(() => {
    let stop = false;
    const controller = new AbortController();

    const loadData = async () => {
      try {
        const data = await getAllToys({ noCache: true, revalidateSeconds: 0 });
        if (!stop) {
          setToys(data);
          setLoading(false);
          console.debug("Catalogue rafraîchi:", data.length, "jouets");
        }
      } catch (error) {
        console.warn("Erreur lors du chargement des jouets:", error);
        setLoading(false);
      }
    };

    // Initial fetch if no initial data
    if (!initialToys?.length) {
      loadData();
    }

    // Poll every 5s for live updates
    const interval = setInterval(loadData, 5000);

    // Refresh when tab becomes visible again
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop = true;
      controller.abort();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [initialToys?.length]);

  const computedMaxPrice = useMemo(() => {
    if (!toys.length) return 2000;
    const highestPrice = Math.max(...toys.map((toy) => getNumericPrice(toy.price)), 0);
    return Math.max(200, Math.ceil(highestPrice / 50) * 50);
  }, [toys]);

  useEffect(() => {
    setMaxPrice(computedMaxPrice);
    if (!priceRangeLocked) {
      setPriceRange([0, computedMaxPrice]);
    }
  }, [computedMaxPrice, priceRangeLocked]);

  const filteredToys = toys.filter((toy) => {
    const matchesCategory =
      selectedCategory === "Tous" || toy.category?.includes(selectedCategory);
    const matchesSearch =
      toy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      toy.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      toy.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Fix: Proper age range matching
    let matchesAge = selectedAge === "all";
    if (!matchesAge && toy.age) {
      const toyAge = toy.age.toLowerCase();
      if (selectedAge === "0-1") {
        matchesAge = toyAge.includes("mois") || toyAge.includes("0-1") || toyAge.includes("0-12");
      } else if (selectedAge === "1-3") {
        matchesAge = toyAge.includes("1-3") || toyAge.includes("1-2") || toyAge.includes("2-3");
      } else if (selectedAge === "3-6") {
        matchesAge = toyAge.includes("3-6") || toyAge.includes("3-4") || toyAge.includes("4-5") || toyAge.includes("5-6") || toyAge.includes("3-5");
      } else if (selectedAge === "6-12") {
        matchesAge = toyAge.includes("6-12") || toyAge.includes("6-8") || toyAge.includes("8-10") || toyAge.includes("10-12") || toyAge.includes("6-10");
      } else if (selectedAge === "12+") {
        matchesAge = toyAge.includes("12+") || toyAge.includes("12 ans") || toyAge.includes("tous");
      }
    }

    const toyPrice = getNumericPrice(toy.price);
    const matchesPrice = toyPrice >= priceRange[0] && toyPrice <= priceRange[1];
    return matchesCategory && matchesSearch && matchesAge && matchesPrice;
  });

  const sortedToys = [...filteredToys].sort((a, b) => {
    const aPrice = getNumericPrice(a.price);
    const bPrice = getNumericPrice(b.price);
    const imageBoost = Number(b.hasImage) - Number(a.hasImage);
    if (imageBoost !== 0) return imageBoost;

    switch (sortBy) {
      case "price-asc":
        return aPrice - bPrice;
      case "price-desc":
        return bPrice - aPrice;
      case "popular":
        return (
          parseInt(b.rating?.match(/(\d+)/)?.[0] || "0") -
          parseInt(a.rating?.match(/(\d+)/)?.[0] || "0")
        );
      case "recent":
      default:
        return 0;
    }
  });

  return (
    <PageShell>
      {/* Hero Header */}
      <section className="bg-gradient-to-br from-mint/10 via-peach/10 to-lilac/10 py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-charcoal md:text-5xl">
              🎁 Catalogue de Jouets
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate">
              Découvrez notre sélection de plus de 500 jouets responsables,
              nettoyés et prêts à louer
            </p>

            <div className="mx-auto mt-8 max-w-2xl">
              <SearchBar
                toys={toys}
                onSearchChange={setSearchQuery}
                placeholder="Rechercher un jouet..."
                className="w-full"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-6 py-3 text-sm font-semibold transition ${selectedCategory === category
                  ? "bg-mint text-white shadow-lg shadow-mint/30"
                  : "bg-white text-slate hover:bg-mint/10"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="lg:w-64 block">
            <div className="sticky top-20 space-y-6">
              <div className="flex items-center justify-between lg:hidden">
                <h3 className="text-lg font-bold text-charcoal">Filtres</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="rounded-full p-2 hover:bg-mist"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-charcoal">
                  Âge
                </h3>
                <div className="space-y-2">
                  {ageRanges.map((age) => (
                    <label
                      key={age.value}
                      className="flex cursor-pointer items-center gap-3"
                    >
                      <input
                        type="radio"
                        name="age"
                        value={age.value}
                        checked={selectedAge === age.value}
                        onChange={() => setSelectedAge(age.value)}
                        className="h-4 w-4 text-mint focus:ring-mint"
                      />
                      <span className="text-sm text-slate">{age.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-charcoal">
                  Prix (MAD/mois)
                </h3>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => {
                      setPriceRange([priceRange[0], parseInt(e.target.value)]);
                      setPriceRangeLocked(true);
                    }}
                    className="w-full accent-mint"
                  />
                  <div className="flex items-center justify-between text-sm text-slate">
                    <span>{priceRange[0]} MAD</span>
                    <span>{priceRange[1]} MAD</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory("Tous");
                  setSelectedAge("all");
                  setPriceRange([0, maxPrice]);
                  setPriceRangeLocked(false);
                  setSearchQuery("");
                  setSortBy("recent");
                }}
                className="w-full rounded-xl border border-mist py-3 text-sm font-medium text-charcoal transition hover:border-mint hover:bg-mint/10"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate">
                <span className="font-semibold text-charcoal">
                  {filteredToys.length}
                </span>{" "}
                jouet{filteredToys.length > 1 ? "s" : ""} trouvé
                {filteredToys.length > 1 ? "s" : ""}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSearchBar(!showSearchBar)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-mist text-charcoal transition hover:border-mint hover:bg-mint/10"
                  aria-label="Rechercher"
                >
                  <Search size={18} />
                </button>

                {/* Filter button removed as it was not functional */}

                <div className="flex rounded-xl border border-mist bg-white">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`rounded-l-xl px-3 py-2 transition ${viewMode === "grid"
                        ? "bg-mint text-white"
                        : "text-slate hover:bg-mist"
                      }`}
                  >
                    <Grid3x3 size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`rounded-r-xl px-3 py-2 transition ${viewMode === "list"
                        ? "bg-mint text-white"
                        : "text-slate hover:bg-mist"
                      }`}
                  >
                    <List size={18} />
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-xl border border-mist px-4 py-2 text-sm font-medium text-charcoal focus:border-mint focus:outline-none focus:ring-2 focus:ring-mint/20"
                >
                  <option value="recent">Plus récents</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="popular">Plus populaires</option>
                </select>
              </div>
            </div>

            {/* Secondary search bar removed - using main search bar only */}

            <div
              className={
                viewMode === "grid"
                  ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  : "space-y-6"
              }
            >
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-mint border-t-transparent"></div>
                    <p className="mt-4 text-slate">Chargement des jouets...</p>
                  </div>
                </div>
              ) : viewMode === "grid" ? (
                sortedToys.map((toy) => (
                  <ToyCardWithReservation key={toy.backendId ?? toy.id} toy={toy} />
                ))
              ) : (
                sortedToys.map((toy) => {
                  const toyKey = String(toy.backendId ?? toy.id);
                  return (
                    <div
                      key={toy.backendId ?? toy.id}
                      className="group flex gap-4 rounded-2xl border border-mist bg-white p-4 shadow-sm transition hover:shadow-md"
                    >
                      <Link
                        href={`/jouets/${toy.slug}`}
                        className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl"
                      >
                        <Image
                          src={toy.image}
                          alt={toy.name}
                          fill
                          className="object-cover transition duration-300 group-hover:scale-105"
                          sizes="128px"
                        />
                      </Link>

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <Link href={`/jouets/${toy.slug}`}>
                              <h3 className="font-bold text-charcoal text-lg hover:text-mint transition line-clamp-2">
                                {toy.name}
                              </h3>
                            </Link>
                            <button
                              onClick={(e) => handleToggleFavorite(e, toyKey)}
                              className={`flex-shrink-0 transition-all duration-300 ${isFavorite(toyKey)
                                  ? "text-red-500 scale-110"
                                  : "text-slate/40 hover:text-red-500 hover:scale-110"
                                }`}
                              title={
                                isFavorite(toyKey)
                                  ? "Retirer des favoris"
                                  : "Ajouter aux favoris"
                              }
                            >
                              <Heart
                                className={`h-5 w-5 transition-all ${isFavorite(toyKey) ? "fill-red-500 text-red-500" : ""
                                  }`}
                              />
                            </button>
                          </div>

                          <p className="mt-1 text-sm text-slate line-clamp-1">
                            {toy.category}
                          </p>

                          {toy.age && (
                            <p className="mt-1 text-xs text-slate">Âge: {toy.age}</p>
                          )}

                          {toy.description && (
                            <p className="mt-2 text-sm text-slate line-clamp-2">
                              {toy.description}
                            </p>
                          )}
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4 border-t border-gray-100 pt-3">
                          <div className="flex flex-col">
                            {toy.price ? (
                              <>
                                <span className="text-2xl font-bold text-mint">
                                  {toy.price}
                                </span>
                                <span className="text-xs text-slate">
                                  Location mensuelle
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-medium text-slate">
                                Prix sur demande
                              </span>
                            )}
                          </div>

                          {(() => {
                            const isOutOfStock = !toy.stock || parseInt(toy.stock.toString()) <= 0;
                            return (
                              <button
                                onClick={(e) => !isOutOfStock && handleAddToCart(e, toy)}
                                disabled={isOutOfStock}
                                className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 font-semibold shadow-lg transition-all duration-300 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl'}`}
                                style={{
                                  background: isOutOfStock ? '#9ca3af' : 'linear-gradient(to right, #1897aa, #0d74b1)',
                                  color: '#ffffff',
                                }}
                                title={isOutOfStock ? 'Rupture de stock' : 'Configurer la location'}
                              >
                                <ShoppingCart
                                  className="h-5 w-5 transition-transform duration-300 group-hover:scale-110"
                                  style={{ color: '#ffffff' }}
                                />
                                <span className="hidden sm:inline" style={{ color: '#ffffff' }}>
                                  {isOutOfStock ? 'Indisponible' : 'Réserver'}
                                </span>
                                <span className="absolute inset-0 -z-0 bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                              </button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {filteredToys.length === 0 && (
              <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mist/50">
                  <Search size={32} className="text-slate" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-charcoal">Aucun jouet trouvé</h3>
                <p className="mt-2 text-slate">
                  Essayez d&apos;ajuster vos filtres ou votre recherche
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
