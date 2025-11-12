import Link from 'next/link';
import Image from 'next/image';
import { PageShell } from '@/components/page-shell';
import { getAllToys } from '@/lib/toys-data';

export const metadata = {
  title: 'Jouets par âge - LOUAAB',
  description: 'Trouvez des jouets adaptés à l\'âge de votre enfant',
};

// URL du backend API - utiliser une URL relative pour éviter Mixed Content
const API_BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || '/api')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');

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

/**
 * Fonction pour mapper un âge de la base de données vers une tranche d'âge
 */
function mapAgeToAgeRange(age: string, ageRanges: AgeRange[]): AgeRange | null {
  if (!age) return null;
  
  const ageLower = age.toLowerCase().trim().replace(/\s+/g, ' ');
  
  // Extraire les nombres de l'âge
  const numbers = ageLower.match(/\d+/g);
  if (!numbers || numbers.length === 0) return null;
  
  const firstNum = parseInt(numbers[0]);
  const secondNum = numbers.length > 1 ? parseInt(numbers[1]) : null;
  
  // Convertir en mois pour la comparaison
  let ageMinMonths: number | null = null;
  let ageMaxMonths: number | null = null;
  
  if (ageLower.includes('mois')) {
    ageMinMonths = firstNum;
    ageMaxMonths = secondNum || firstNum;
  } else if (ageLower.includes('ans') || ageLower.includes('an')) {
    if (ageLower.includes('-') && secondNum) {
      // Plage comme "2-3 ans"
      ageMinMonths = firstNum * 12;
      ageMaxMonths = secondNum * 12;
    } else if (ageLower.includes('+')) {
      // Comme "3+ ans"
      ageMinMonths = firstNum * 12;
      ageMaxMonths = null; // Pas de limite supérieure
    } else {
      // Âge unique comme "3 ans"
      ageMinMonths = firstNum * 12;
      ageMaxMonths = firstNum * 12;
    }
  } else if (ageLower.includes('+')) {
    // Comme "3+"
    ageMinMonths = firstNum * 12;
    ageMaxMonths = null;
  }
  
  if (ageMinMonths === null) return null;
  
  // Trier les tranches d'âges par ordre décroissant pour trouver la meilleure correspondance
  const sortedRanges = [...ageRanges].sort((a, b) => (b.ageMax || 999) - (a.ageMax || 999));
  
  // Trouver la tranche d'âge correspondante
  for (const ageRange of sortedRanges) {
    // Vérifier si l'âge du jouet chevauche avec cette tranche
    const rangeMin = ageRange.ageMin;
    const rangeMax = ageRange.ageMax || 999;
    
    // Si le jouet a une plage d'âge
    if (ageMaxMonths !== null) {
      // Vérifier si les plages se chevauchent
      if (ageMinMonths <= rangeMax && ageMaxMonths >= rangeMin) {
        return ageRange;
      }
    } else {
      // Si le jouet n'a pas de limite supérieure (X+)
      if (ageMinMonths >= rangeMin) {
        return ageRange;
      }
    }
  }
  
  return null;
}

// Fonction pour charger les tranches d'âges depuis le backend
async function getAgeRanges(): Promise<AgeRange[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/age-ranges`, {
      next: { revalidate: 60 }, // Cache pendant 60 secondes
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return result.data.filter((ar: AgeRange) => ar.isActive);
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement des tranches d\'âges:', error);
  }
  
  // Fallback: données par défaut
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
  const toys = await getAllToys();
  const ageRanges = await getAgeRanges();

  // Grouper les jouets par tranche d'âge
  const agesWithCount = ageRanges.map(ageRange => {
    const count = toys.filter(toy => {
      const mappedRange = mapAgeToAgeRange(toy.age, ageRanges);
      return mappedRange && mappedRange.id === ageRange.id;
    }).length;
    
    return {
      ...ageRange,
      count,
    };
  }).filter(age => age.count > 0 || age.isActive); // Garder toutes les tranches actives, même avec 0 jouet

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
            <span className="text-charcoal">Âges</span>
          </nav>

          <h1 className="text-4xl font-bold uppercase tracking-[0.1em] text-charcoal">
            Jouets par âge
          </h1>
          <p className="mt-3 text-base text-slate">
            Trouvez le jouet parfait adapté à l&apos;âge de votre enfant
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
              {/* Icône */}
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
                  <span>{age.icon || '🎯'}</span>
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

