import Link from 'next/link';
import { PageShell } from '@/components/page-shell';
import { SectionHeading } from '@/components/section-heading';
import ToyCardWithReservation from '@/components/toy-card-with-reservation';
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

  const categoryLower = categoryName.toLowerCase();
  
  // Mapping avec recherche insensible à la casse et flexible
  let emoji = '🎮';
  if (categoryLower.includes('éducatif')) emoji = '📚';
  else if (categoryLower.includes('société')) emoji = '🎲';
  else if (categoryLower.includes('bois')) emoji = '🪵';
  else if (categoryLower.includes('puzzle')) emoji = '🧩';
  else if (categoryLower.includes('construction') || categoryLower.includes('chantier')) emoji = '🚜';
  else if (categoryLower.includes('véhicule') || categoryLower.includes('voiture') || categoryLower.includes('train')) emoji = '🚂';
  else if (categoryLower.includes('créatif') || categoryLower.includes('créat')) emoji = '🎨';
  else if (categoryLower.includes('extérieur')) emoji = '⚽';
  else if (categoryLower.includes('adresse')) emoji = '🎯';
  else if (categoryLower.includes('arcade')) emoji = '🕹️';
  else if (categoryLower.includes('artistique')) emoji = '🎭';
  else if (categoryLower.includes('avion') || categoryLower.includes('hélicoptère') || categoryLower.includes('helocip') || categoryLower.includes('drone')) emoji = '🚁';
  else if (categoryLower.includes('cuisine') || categoryLower.includes('dinette')) emoji = '👨‍🍳';
  else if (categoryLower.includes('déguisement')) emoji = '🎭';
  else if (categoryLower.includes('figurine') || categoryLower.includes('univers')) emoji = '🦸‍♂️';
  else if (categoryLower.includes('instrument') || categoryLower.includes('musique')) emoji = '🎸';
  else if (categoryLower.includes('jardin')) emoji = '🌻';
  else if (categoryLower.includes('ordinateur') || categoryLower.includes('tablette')) emoji = '💻';
  else if (categoryLower.includes('poupée') || categoryLower.includes('accessoire')) emoji = '🎀';
  else if (categoryLower.includes('premier') || categoryLower.includes('âge')) emoji = '🍼';
  else if (categoryLower.includes('sport')) emoji = '🏀';
  else if (categoryLower.includes('stem') || categoryLower.includes('science')) emoji = '🔬';
  else if (categoryLower.includes('garçon')) emoji = '🚀';
  else if (categoryLower.includes('fille')) emoji = '🦄';
  else if (categoryLower.includes('combat')) emoji = '⚔️';
  else if (categoryLower.includes('compétition')) emoji = '🏆';
  else if (categoryLower.includes('danse')) emoji = '💃';
  else if (categoryLower.includes('électronique')) emoji = '🔋';
  else if (categoryLower.includes('fantasy')) emoji = '🐉';
  else if (categoryLower.includes('interaction')) emoji = '🤝';
  else if (categoryLower.includes('eau')) emoji = '💦';
  else if (categoryLower.includes('mini') && categoryLower.includes('monde')) emoji = '🏰';
  else if (categoryLower.includes('robot')) emoji = '🤖';
  else if (categoryLower.includes('super') || categoryLower.includes('héros')) emoji = '🦸';
  else if (categoryLower.includes('tir')) emoji = '🎱';

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

          <div className="flex items-center gap-4">
            <div className="text-6xl">{emoji}</div>
            <div>
              <h1 className="text-4xl font-bold uppercase tracking-[0.1em] text-charcoal">
                {categoryName}
              </h1>
              <p className="mt-3 text-base text-slate">
                {toys.length} jouet{toys.length > 1 ? 's' : ''} dans cette catégorie
              </p>
            </div>
          </div>
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
            {/* Toys Grid */}
            {toys.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {toys.map((toy, index) => (
                  <ToyCardWithReservation key={toy.backendId ?? toy.id} toy={toy} priority={index < 6} />
                ))}
              </div>
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
