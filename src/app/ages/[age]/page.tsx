import Link from 'next/link';
import Image from 'next/image';
import { PageShell } from '@/components/page-shell';
import { getAllToys } from '@/lib/toys-data';

// URL du backend API - relative par défaut côté client
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

// Mappe une chaîne d'âge (ex: "3-6 ans", "12+ ans") vers une tranche DB
function mapAgeToAgeRange(age: string, ageRanges: AgeRange[]): AgeRange | null {
  if (!age) return null;

  const ageLower = age.toLowerCase().trim().replace(/\s+/g, ' ');
  const numbers = ageLower.match(/\d+/g);
  if (!numbers || numbers.length === 0) return null;

  const firstNum = parseInt(numbers[0]);
  const secondNum = numbers.length > 1 ? parseInt(numbers[1]) : null;

  let ageMinMonths: number | null = null;
  let ageMaxMonths: number | null = null;

  if (ageLower.includes('mois')) {
    ageMinMonths = firstNum;
    ageMaxMonths = secondNum || firstNum;
  } else if (ageLower.includes('ans') || ageLower.includes('an')) {
    if (ageLower.includes('-') && secondNum) {
      ageMinMonths = firstNum * 12;
      ageMaxMonths = secondNum * 12;
    } else if (ageLower.includes('+')) {
      ageMinMonths = firstNum * 12;
      ageMaxMonths = null;
    } else {
      ageMinMonths = firstNum * 12;
      ageMaxMonths = firstNum * 12;
    }
  } else if (ageLower.includes('+')) {
    ageMinMonths = firstNum * 12;
    ageMaxMonths = null;
  }

  if (ageMinMonths === null) return null;

  const sortedRanges = [...ageRanges].sort((a, b) => (b.ageMax || 999) - (a.ageMax || 999));
  for (const ageRange of sortedRanges) {
    const rangeMin = ageRange.ageMin;
    const rangeMax = ageRange.ageMax || 999;

    if (ageMaxMonths !== null) {
      if (ageMinMonths <= rangeMax && ageMaxMonths >= rangeMin) {
        return ageRange;
      }
    } else {
      if (ageMinMonths >= rangeMin) {
        return ageRange;
      }
    }
  }

  return null;
}

async function getAgeRanges(): Promise<AgeRange[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/age-ranges`, {
      next: { revalidate: 60 },
    });
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return result.data.filter((ar: AgeRange) => ar.isActive);
      }
    }
  } catch (e) {}
  return [];
}

interface Params { params: { age: string } }

export default async function AgeDetailPage({ params }: Params) {
  const slug = params.age;
  const [toys, ageRanges] = await Promise.all([getAllToys(), getAgeRanges()]);
  const currentAge = ageRanges.find(a => a.slug === slug) || null;

  const toysForAge = currentAge
    ? toys.filter(toy => {
        const mapped = mapAgeToAgeRange(toy.age, ageRanges);
        return mapped && mapped.id === currentAge.id;
      })
    : [];

  return (
    <PageShell>
      <section className="border-b border-mist/60 bg-gradient-to-br from-purple-50 to-pink-50 py-12">
        <div className="mx-auto w-full max-w-6xl px-4">
          <nav className="flex items-center gap-2 text-sm text-slate mb-4">
            <Link href="/" className="hover:text-mint">Accueil</Link>
            <span>/</span>
            <Link href="/ages" className="hover:text-mint">Âges</Link>
            <span>/</span>
            <span className="text-charcoal">{currentAge?.label || 'Âge'}</span>
          </nav>
          <h1 className="text-3xl font-bold text-charcoal">
            {currentAge?.label || 'Âge'}
          </h1>
          {currentAge && (
            <div className="mt-2 text-5xl">
              {currentAge.iconType === 'emoji' ? (
                currentAge.icon
              ) : currentAge.iconType === 'upload' && currentAge.iconUrl ? (
                <Image src={currentAge.iconUrl} alt={currentAge.label} width={64} height={64} />
              ) : (
                <span>{currentAge.icon}</span>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        {toysForAge.length === 0 ? (
          <div className="text-center text-slate">Aucun jouet pour cette tranche d'âge.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {toysForAge.map(toy => (
              <Link key={toy.id} href={`/jouets/${toy.slug}`} className="rounded-xl border p-4 bg-white hover:shadow">
                <div className="aspect-square w-full rounded-lg bg-gray-100 overflow-hidden mb-3">
                  {/* image simple via img pour limiter la dépendance */}
                  <img src={toy.thumbnail || toy.image} alt={toy.name} className="w-full h-full object-cover" />
                </div>
                <div className="font-semibold text-charcoal">{toy.name}</div>
                <div className="text-sm text-slate">{toy.category}</div>
                <div className="text-mint font-bold mt-1">{toy.price}</div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

