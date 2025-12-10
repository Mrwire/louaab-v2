import Link from "next/link";
import Image from "next/image";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import CategoryToysView from "@/components/category-toys-view";
import { getToysByCategory } from "@/lib/toys-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://louaab.ma/api";

interface CategoryEntity {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconType: "emoji" | "upload" | "icon";
  icon: string;
  iconUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

const FALLBACK_CATEGORIES: CategoryEntity[] = [
  { id: "1", name: "Jeux éducatifs", slug: "jeux-educatifs", iconType: "emoji", icon: "🎯", displayOrder: 0, isActive: true },
  { id: "2", name: "Jeux de société", slug: "jeux-de-societe", iconType: "emoji", icon: "🎲", displayOrder: 1, isActive: true },
  { id: "3", name: "Jeux d'adresse", slug: "jeux-adresse", iconType: "emoji", icon: "🏹", displayOrder: 2, isActive: true },
];

const normalizeToSlug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

async function fetchCategories(): Promise<CategoryEntity[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, { cache: "no-store" });
    const body = await response.json().catch(() => ({}));
    if (response.ok && Array.isArray(body?.data)) {
      return body.data as CategoryEntity[];
    }
  } catch (error) {
    console.warn("Impossible de charger les catégories:", error);
  }
  return FALLBACK_CATEGORIES;
}

export async function generateMetadata({ params }: { params: { category: string } }) {
  const categories = await fetchCategories();
  const current =
    categories.find((cat) => cat.slug === params.category) ||
    categories.find((cat) => normalizeToSlug(cat.name) === params.category);
  const name = current?.name ?? decodeURIComponent(params.category).replace(/-/g, " ");

  return {
    title: `${name} - LOUAAB`,
    description: `Découvrez tous nos jouets de catégorie ${name}. Location de jouets pour enfants au Maroc.`,
  };
}

const getCategoryEmoji = (name: string): string => {
  const nameLower = name.toLowerCase();
  if (nameLower.includes("éducatif")) return "🎯";
  if (nameLower.includes("société")) return "🎲";
  if (nameLower.includes("bois")) return "🪵";
  if (nameLower.includes("puzzle")) return "🧩";
  if (nameLower.includes("construction")) return "🏗️";
  if (nameLower.includes("véhicule") || nameLower.includes("voiture") || nameLower.includes("train")) return "🚗";
  if (nameLower.includes("créatif")) return "🎨";
  if (nameLower.includes("extérieur")) return "🌳";
  if (nameLower.includes("adresse")) return "🏹";
  if (nameLower.includes("arcade")) return "🕹️";
  if (nameLower.includes("artistique")) return "🎭";
  if (nameLower.includes("avion") || nameLower.includes("hélico") || nameLower.includes("drone")) return "✈️";
  if (nameLower.includes("cuisine") || nameLower.includes("dinette")) return "🍳";
  if (nameLower.includes("déguisement")) return "🎭";
  if (nameLower.includes("instrument") || nameLower.includes("musique")) return "🎸";
  if (nameLower.includes("ordinateur") || nameLower.includes("tablette")) return "💻";
  if (nameLower.includes("poupée")) return "🩷";
  if (nameLower.includes("sport")) return "🏀";
  if (nameLower.includes("stem") || nameLower.includes("science")) return "🧪";
  if (nameLower.includes("robot")) return "🤖";
  if (nameLower.includes("super") || nameLower.includes("héros")) return "🦸";
  if (nameLower.includes("tir")) return "🎯";
  return "🎁";
};

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const categories = await fetchCategories();
  const slug = params.category;
  const currentCategory =
    categories.find((cat) => cat.slug === slug) ||
    categories.find((cat) => normalizeToSlug(cat.name) === slug) ||
    null;

  const categoryName = currentCategory?.name ?? decodeURIComponent(slug).replace(/-/g, " ");
  const toys = await getToysByCategory(currentCategory?.name ?? categoryName);

  const emojiFallback = getCategoryEmoji(categoryName);

  return (
    <PageShell>
      <section className="border-b border-mist/60 bg-gradient-to-br from-mint/5 to-blue-50 py-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <nav className="mb-4 flex items-center gap-2 text-sm text-slate">
            <Link href="/" className="hover:text-mint">Accueil</Link>
            <span>/</span>
            <Link href="/jouets" className="hover:text-mint">Jouets</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-mint">Catégories</Link>
            <span>/</span>
            <span className="text-charcoal capitalize">{categoryName}</span>
          </nav>

          <h1 className="text-4xl font-bold uppercase tracking-[0.1em] text-charcoal">{categoryName}</h1>
          <p className="mt-3 text-base text-slate">
            {toys.length} jouet{toys.length > 1 ? "s" : ""} dans cette catégorie
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="space-y-8">
          <div className="mb-6 flex items-center gap-4">
            <div className="text-6xl">
              {currentCategory ? (
                currentCategory.iconType === "emoji" ? (
                  currentCategory.icon || emojiFallback
                ) : currentCategory.iconType === "upload" && currentCategory.iconUrl ? (
                  <Image src={currentCategory.iconUrl} alt={categoryName} width={72} height={72} className="rounded-xl" />
                ) : (
                  currentCategory.icon || emojiFallback
                )
              ) : (
                emojiFallback
              )}
            </div>
            <div>
              <SectionHeading
                title={`${toys.length} résultat${toys.length > 1 ? "s" : ""}`}
                description={`Tous les jouets de la catégorie "${categoryName}"`}
              />
            </div>
          </div>

          <div className="space-y-8">
            {toys.length > 0 ? (
              <CategoryToysView toys={toys} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl bg-gray-50 py-20">
                <div className="text-6xl">😔</div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">Aucun jouet dans cette catégorie</h3>
                <p className="mt-2 text-gray-600">Essayez une autre catégorie</p>
                <Link
                  href="/jouets"
                  className="mt-6 rounded-full bg-mint px-6 py-3 font-semibold text-white transition hover:bg-mint/90"
                >
                  Voir tous les jouets
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
