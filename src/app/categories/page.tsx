import Link from 'next/link';
import Image from 'next/image';
import { PageShell } from '@/components/page-shell';
import { getAllToys } from '@/lib/toys-data';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Toutes les catégories - LOUAAB',
  description: 'Explorez toutes nos catégories de jouets disponibles à la location',
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://louaab.ma/api';

interface Category {
  id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description?: string;
  iconType: 'emoji' | 'upload' | 'icon';
  icon: string;
  iconUrl?: string;
  parent?: Category | null;
  parentId?: string | null;
  displayOrder: number;
  isActive: boolean;
}

async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories`, { cache: 'no-store' });
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return result.data
          .filter((cat: Category) => cat.isActive)
          .sort((a: Category, b: Category) => a.displayOrder - b.displayOrder);
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error);
  }

  return [
    { id: '1', name: 'Jeux éducatifs', slug: 'jeux-educatifs', iconType: 'emoji', icon: '🎯', description: 'Jouets éducatifs et Montessori', displayOrder: 0, isActive: true },
    { id: '2', name: 'Jeux de société', slug: 'jeux-de-societe', iconType: 'emoji', icon: '🎲', description: 'Jeux de société pour petits et grands', displayOrder: 1, isActive: true },
    { id: '3', name: 'Jeux d\'adresse', slug: 'jeux-adresse', iconType: 'emoji', icon: '🏹', description: 'Jeux nécessitant adresse et précision', displayOrder: 2, isActive: true },
    { id: '4', name: 'Véhicules', slug: 'vehicules', iconType: 'emoji', icon: '🚗', description: 'Voitures, motos, avions et autres véhicules', displayOrder: 3, isActive: true },
    { id: '5', name: 'Jeux créatifs', slug: 'jeux-creatifs', iconType: 'emoji', icon: '🎨', description: 'Activités créatives et artistiques', displayOrder: 4, isActive: true },
    { id: '6', name: 'Arcade', slug: 'arcade', iconType: 'emoji', icon: '🕹️', description: 'Jeux d\'arcade électroniques', displayOrder: 5, isActive: true },
    { id: '7', name: 'Jeux de tirs', slug: 'jeux-tirs', iconType: 'emoji', icon: '🎯', description: 'Jeux de tir et de combat', displayOrder: 6, isActive: true },
    { id: '8', name: 'Compétition', slug: 'competition', iconType: 'emoji', icon: '🏆', description: 'Jeux de compétition et de défi', displayOrder: 7, isActive: true },
  ];
}

export default async function CategoriesPage() {
  const toys = await getAllToys({ noCache: true, revalidateSeconds: 0 });
  const categories = await getCategories();

  const categoriesWithCount = categories
    .map((category) => {
      const count = toys.filter((toy) => {
        if (!toy.category) return false;
        const toyCategories = Array.isArray(toy.category)
          ? toy.category
          : typeof toy.category === 'string'
          ? [toy.category]
          : [];

        return toyCategories.some(
          (toyCat) => toyCat.toLowerCase().trim() === category.name.toLowerCase().trim(),
        );
      }).length;

      return { ...category, count };
    })
    .filter((cat) => cat.count > 0 || cat.isActive);

  return (
    <PageShell>
      <section className="border-b border-mist/60 bg-gradient-to-br from-mint/5 to-blue-50 py-16">
        <div className="mx-auto w-full max-w-6xl px-4 text-center">
          <nav className="mb-4 flex items-center justify-center gap-2 text-sm text-slate">
            <Link href="/" className="hover:text-mint">Accueil</Link>
            <span>/</span>
            <Link href="/jouets" className="hover:text-mint">Jouets</Link>
            <span>/</span>
            <span className="text-charcoal">Catégories</span>
          </nav>

          <h1 className="text-4xl font-bold uppercase tracking-[0.1em] text-charcoal">
            Toutes les catégories
          </h1>
          <p className="mt-3 text-base text-slate">
            {categoriesWithCount.length} catégories de jouets disponibles
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categoriesWithCount.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100 transition hover:shadow-lg hover:ring-mint"
            >
              <div className="mb-4 text-5xl">
                {category.iconType === 'emoji' ? (
                  category.icon
                ) : category.iconType === 'upload' && category.iconUrl ? (
                  <Image
                    src={category.iconUrl}
                    alt={category.name}
                    width={64}
                    height={64}
                    className="mx-auto rounded-lg object-cover"
                  />
                ) : (
                  <span>{category.icon || '🎯'}</span>
                )}
              </div>

              <h3 className="font-bold text-charcoal group-hover:text-mint">{category.name}</h3>
              <p className="mt-2 text-sm text-slate">
                {category.count} jouet{category.count > 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
