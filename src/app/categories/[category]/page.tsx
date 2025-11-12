import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { SectionHeading } from '@/components/section-heading';
import CategoryToysView from '@/components/category-toys-view';
import { getToysByCategory, getAllCategories, getAllToys } from '@/lib/toys-data';

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({
    category: category.toLowerCase(),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const categoryName = decodeURIComponent(category);
  
  return {
    title: `${categoryName} - LOUAAB`,
    description: `Découvrez tous nos jouets de catégorie ${categoryName}. Location de jouets pour enfants au Maroc.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const categoryName = decodeURIComponent(category);
  const toys = await getToysByCategory(categoryName);
  const allCategories = await getAllCategories();
  const allToys = await getAllToys();

  // Function to get emoji for category with flexible matching
  const getCategoryEmoji = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('éducatif')) return '📚';
    if (nameLower.includes('société')) return '🎲';
    if (nameLower.includes('bois')) return '🪵';
    if (nameLower.includes('puzzle')) return '🧩';
    if (nameLower.includes('construction') || nameLower.includes('chantier')) return '🚜';
    if (nameLower.includes('véhicule') || nameLower.includes('voiture') || nameLower.includes('train')) return '🚂';
    if (nameLower.includes('créatif') || nameLower.includes('créat')) return '🎨';
    if (nameLower.includes('extérieur')) return '⚽';
    if (nameLower.includes('adresse')) return '🎯';
    if (nameLower.includes('arcade')) return '🕹️';
    if (nameLower.includes('artistique')) return '🎭';
    if (nameLower.includes('avion') || nameLower.includes('hélicoptère') || nameLower.includes('helocip') || nameLower.includes('drone')) return '🚁';
    if (nameLower.includes('cuisine') || nameLower.includes('dinette')) return '👨‍🍳';
    if (nameLower.includes('déguisement')) return '�';
    if (nameLower.includes('figurine') || nameLower.includes('univers')) return '🦸‍♂️';
    if (nameLower.includes('instrument') || nameLower.includes('musique')) return '🎸';
    if (nameLower.includes('jardin')) return '🌻';
    if (nameLower.includes('ordinateur') || nameLower.includes('tablette')) return '💻';
    if (nameLower.includes('poupée') || nameLower.includes('accessoire')) return '🎀';
    if (nameLower.includes('premier') && nameLower.includes('âge')) return '🍼';
    if (nameLower.includes('sport')) return '🏀';
    if (nameLower.includes('stem') || nameLower.includes('science')) return '🔬';
    if (nameLower.includes('garçon')) return '🚀';
    if (nameLower.includes('fille')) return '🦄';
    if (nameLower.includes('combat')) return '⚔️';
    if (nameLower.includes('compétition')) return '🏆';
    if (nameLower.includes('danse')) return '💃';
    if (nameLower.includes('électronique')) return '🔋';
    if (nameLower.includes('fantasy')) return '�';
    if (nameLower.includes('interaction')) return '🤝';
    if (nameLower.includes('eau')) return '💦';
    if (nameLower.includes('mini') && nameLower.includes('monde')) return '�';
    if (nameLower.includes('robot')) return '🤖';
    if (nameLower.includes('super') || nameLower.includes('héros')) return '🦸';
    if (nameLower.includes('tir')) return '🎱';
    return '🎮';
  };

  const emoji = getCategoryEmoji(categoryName);

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
            <Link href="/categories" className="hover:text-mint">Catégories</Link>
            <span>/</span>
            <span className="text-charcoal capitalize">{categoryName}</span>
          </nav>

          <h1 className="text-4xl font-bold uppercase tracking-[0.1em] text-charcoal">
            {categoryName}
          </h1>
          <p className="mt-3 text-base text-slate">
            {toys.length} jouet{toys.length > 1 ? 's' : ''} dans cette catégorie
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="space-y-8">
          {/* Header with emoji */}
          <div className="mb-6 flex items-center gap-4">
            <div className="text-6xl">{emoji}</div>
            <div>
              <SectionHeading
                title={`${toys.length} résultat${toys.length > 1 ? 's' : ''}`}
                description={`Tous les jouets de la catégorie "${categoryName}"`}
              />
            </div>
          </div>

          <div className="space-y-8">
            {/* Toys Grid/List */}
            {toys.length > 0 ? (
              <CategoryToysView toys={toys} />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl bg-gray-50 py-20">
                <div className="text-6xl">🎮</div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">
                  Aucun jouet dans cette catégorie
                </h3>
                <p className="mt-2 text-gray-600">
                  Essayez une autre catégorie
                </p>
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

