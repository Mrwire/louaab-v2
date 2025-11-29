import Image from 'next/image';
import Link from 'next/link';

import { PageShell } from '@/components/page-shell';
import { API_BASE_URL } from '@/lib/api/config';
import { getAllToys } from '@/lib/toys-data';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Jouets par age - LOUAAB',
  description: "Trouvez des jouets adaptes a l'age de votre enfant",
};


interface AgeRange {
  id: string;
  label: string;
  slug: string;
  iconType: 'emoji' | 'upload' | 'icon';
  icon: string;
  iconUrl?: string;
  ageMin: number;
  ageMax: number | null;
  displayOrder: number;
  isActive: boolean;
}

type ToyWithAge = {
  age?: string;
  ageMin?: number | null;
  ageMax?: number | null;
};

const toMonths = (value: number) => value * 12;

const formatAgeLabelFromMonths = (minMonths: number, maxMonths: number | null) => {
  const fmt = (m: number) => {
    if (m < 12) return `${m} mois`;
    const years = m / 12;
    return Number.isInteger(years) ? `${years} ans` : `${years.toFixed(1)} ans`;
  };
  if (maxMonths === null) return `${fmt(minMonths)} +`;
  if (maxMonths === minMonths) return fmt(minMonths);
  return `${fmt(minMonths)} - ${fmt(maxMonths)}`;
};

const parseAgeStringToBounds = (age: string): { min: number | null; max: number | null } => {
  const ageLower = age.toLowerCase().trim().replace(/\s+/g, ' ');
  const numbers = ageLower.match(/\d+/g);
  if (!numbers || numbers.length === 0) return { min: null, max: null };

  const firstNum = parseInt(numbers[0], 10);
  const secondNum = numbers.length > 1 ? parseInt(numbers[1], 10) : null;
  const toMonthsIfYears = (val: number) => (ageLower.includes('mois') ? val : toMonths(val));

  if (ageLower.includes('mois')) {
    const min = firstNum;
    const max = secondNum ?? firstNum;
    return { min, max };
  }

  if (ageLower.includes('ans') || ageLower.includes('an') || ageLower.includes('+') || ageLower.includes('-')) {
    if (ageLower.includes('-') && secondNum !== null) {
      return { min: toMonthsIfYears(firstNum), max: toMonthsIfYears(secondNum) };
    }
    if (ageLower.includes('+')) {
      return { min: toMonthsIfYears(firstNum), max: null };
    }
    return { min: toMonthsIfYears(firstNum), max: toMonthsIfYears(secondNum ?? firstNum) };
  }

  if (ageLower.includes('+')) {
    return { min: toMonthsIfYears(firstNum), max: null };
  }

  return { min: null, max: null };
};

const getToyAgeBounds = (toy: ToyWithAge) => {
  if (typeof toy.ageMin === 'number') {
    return {
      min: toy.ageMin,
      max: typeof toy.ageMax === 'number' ? toy.ageMax : toy.ageMin,
    };
  }
  return parseAgeStringToBounds(toy.age || '');
};

const getRangeBoundsInMonths = (range: AgeRange) => {
  const min = typeof range.ageMin === 'number' ? range.ageMin : 0;
  const max = typeof range.ageMax === 'number' ? range.ageMax : Infinity;
  return { min, max };
};

// Mapper un jouet vers une tranche d'?ge
function mapToyToAgeRange(toy: ToyWithAge, ageRanges: AgeRange[]): AgeRange | null {
  if (!ageRanges.length) return null;
  const bounds = getToyAgeBounds(toy);
  if (bounds.min === null) return null;

  const sortedRanges = [...ageRanges].sort((a, b) => {
    const { max: maxA } = getRangeBoundsInMonths(a);
    const { max: maxB } = getRangeBoundsInMonths(b);
    return maxB - maxA;
  });

  return (
    sortedRanges.find((ageRange) => {
      const { min, max } = getRangeBoundsInMonths(ageRange);
      const toyMax = bounds.max ?? bounds.min;
      return bounds.min >= min && toyMax <= max && toyMax >= min;
    }) || null
  );
}

// Fonction pour charger les tranches d'ages depuis le backend
async function getAgeRanges(): Promise<AgeRange[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/age-ranges`, {
      cache: "no-store",
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return result.data.filter((ar: AgeRange) => ar.isActive);
      }
    }
  } catch (error) {
    console.error("Erreur lors du chargement des tranches d'ages:", error);
  }

  // Fallback: donnees par defaut
  return [
    { id: '1', label: '0-12 mois', slug: '0-12-mois', iconType: 'emoji' as const, icon: '👶', ageMin: 0, ageMax: 12, displayOrder: 0, isActive: true },
    { id: '2', label: '12-24 mois', slug: '12-24-mois', iconType: 'emoji' as const, icon: '🍼', ageMin: 12, ageMax: 24, displayOrder: 1, isActive: true },
    { id: '3', label: '2-3 ans', slug: '2-3-ans', iconType: 'emoji' as const, icon: '🧸', ageMin: 24, ageMax: 36, displayOrder: 2, isActive: true },
    { id: '4', label: '3-5 ans', slug: '3-5-ans', iconType: 'emoji' as const, icon: '🎈', ageMin: 36, ageMax: 60, displayOrder: 3, isActive: true },
    { id: '5', label: '5-8 ans', slug: '5-8-ans', iconType: 'emoji' as const, icon: '🎮', ageMin: 60, ageMax: 96, displayOrder: 4, isActive: true },
    { id: '6', label: '8+ ans', slug: '8-ans', iconType: 'emoji' as const, icon: '🎯', ageMin: 96, ageMax: null, displayOrder: 5, isActive: true },
  ];
}

export default async function AgesPage() {
  const toys = await getAllToys({ noCache: true });
  const ageRanges = await getAgeRanges();

  // Grouper les jouets par tranche d'age
  const agesWithCount = ageRanges
    .map((ageRange) => {
      const count = toys.filter((toy) => mapToyToAgeRange(toy, ageRanges)?.id === ageRange.id).length;

      return {
        ...ageRange,
        count,
      };
    })
    .filter((age) => age.count > 0 || age.isActive); // Garder toutes les tranches actives, meme avec 0 jouet

  return (
    <PageShell>
      {/* Header */}
      <section className="border-b border-mist/60 bg-gradient-to-br from-purple-50 to-pink-50 py-16">
        <div className="mx-auto w-full max-w-6xl px-4 text-center">
          <nav className="flex items-center justify-center gap-2 text-sm text-slate mb-4">
            <Link href="/" className="hover:text-mint">Accueil</Link>
            <span>/</span>
            <Link href="/jouets" className="hover:text-mint">Jouets</Link>
            <span>/</span>
            <span className="text-charcoal">Ages</span>
          </nav>

          <h1 className="text-4xl font-bold uppercase tracking-[0.1em] text-charcoal">
            Jouets par age
          </h1>
          <p className="mt-3 text-base text-slate">
            Trouvez le jouet parfait adapte a l'age de votre enfant
          </p>
        </div>
      </section>

      {/* Ages Grid */}
      <section className="mx-auto w-full max-w-6xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {agesWithCount.map((age) => (
            <Link
              key={age.id}
              href={`/ages/${age.slug}`}
              className="group flex flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100 transition hover:shadow-lg hover:ring-purple-500"
            >
              {/* Icone */}
              <div className="text-5xl mb-4">
                {age.iconType === 'emoji' ? (
                  age.icon
                ) : age.iconType === 'upload' && age.iconUrl ? (
                  <Image
                    src={age.iconUrl}
                    alt={age.label}
                    width={64}
                    height={64}
                    className="mx-auto rounded-lg object-cover"
                  />
                ) : (
                  <span>{age.icon || 'ð¯'}</span>
                )}
              </div>

              <h3 className="font-bold text-charcoal group-hover:text-purple-600 text-lg">
                {age.label}
              </h3>
              <p className="mt-2 text-sm text-slate">
                {age.count} jouet{age.count > 1 ? 's' : ''}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
