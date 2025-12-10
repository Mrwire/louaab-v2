import Image from "next/image";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { API_BASE_URL } from "@/lib/api/config";
import ToyCardWithReservation from "@/components/toy-card-with-reservation";
import { getAllToys } from "@/lib/toys-data";
import type { ToyData } from "@/lib/toys-data";
interface AgeRange {
  id: string;
  label: string;
  slug: string;
  iconType: "emoji" | "upload" | "icon";
  icon: string;
  iconUrl?: string;
  ageMin: number;
  ageMax: number | null;
  displayOrder: number;
  isActive: boolean;
}

type ToyWithAge = ToyData & { ageMin?: number | null; ageMax?: number | null };

const normalizeToSlug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const toMonths = (value: number) => value * 12;

const formatAgeLabelFromBounds = (minMonths: number, maxMonths: number | null) => {
  const fmt = (m: number) => {
    if (m < 12) return `${m} mois`;
    const years = m / 12;
    return Number.isInteger(years) ? `${years} ans` : `${years.toFixed(1)} ans`;
  };
  if (maxMonths === null) return `${fmt(minMonths)} +`;
  if (maxMonths === minMonths) return fmt(minMonths);
  return `${fmt(minMonths)} - ${fmt(maxMonths)}`;
};

const parseAgeBounds = (label: string) => {
  const lower = label.toLowerCase();
  const numbers = lower.match(/\d+/g);
  if (!numbers || numbers.length === 0) {
    return { min: null, max: null };
  }
  const first = parseInt(numbers[0], 10);
  const second = numbers[1] ? parseInt(numbers[1], 10) : null;
  const toMonthsIfYears = (val: number) => (lower.includes('mois') ? val : toMonths(val));

  if (lower.includes('mois')) {
    const min = first;
    const max = second ?? first;
    return { min, max };
  }
  if (lower.includes('+') && !lower.includes('-')) {
    return { min: toMonthsIfYears(first), max: null };
  }
  if (second !== null) {
    return { min: toMonthsIfYears(first), max: toMonthsIfYears(second) };
  }
  return { min: toMonthsIfYears(first), max: toMonthsIfYears(first) };
};

const getToyAgeBounds = (toy: ToyWithAge) => {
  if (typeof toy.ageMin === "number") {
    return {
      min: toy.ageMin,
      max: typeof toy.ageMax === "number" ? toy.ageMax : toy.ageMin,
    };
  }
  return parseAgeBounds(toy.age || "");
};

const getRangeBoundsInMonths = (range: AgeRange) => {
  const min = typeof range.ageMin === 'number' ? range.ageMin : 0;
  const max = typeof range.ageMax === 'number' ? range.ageMax : Infinity;
  return { min, max };
};

const buildFallbackAgeRanges = (toys: ToyWithAge[]): AgeRange[] => {
  const ranges = new Map<string, AgeRange>();
  toys.forEach((toy) => {
    const bounds = getToyAgeBounds(toy);
    if (bounds.min === null) return;

    const label = toy.age && toy.age.trim().length > 0 ? toy.age : formatAgeLabelFromBounds(bounds.min, bounds.max);
    const slug = normalizeToSlug(label);
    if (!slug || ranges.has(slug)) return;

    ranges.set(slug, {
      id: slug,
      label,
      slug,
      iconType: 'emoji',
      icon: '🎯',
      iconUrl: undefined,
      ageMin: bounds.min,
      ageMax: bounds.max,
      displayOrder: ranges.size,
      isActive: true,
    });
  });
  return Array.from(ranges.values());
};

async function fetchAgeRanges(): Promise<AgeRange[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/age-ranges`, {
      cache: "no-store",
    });
    if (response.ok) {
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data.filter((range: AgeRange) => range.isActive);
      }
    }
  } catch (error) {
    console.warn("Impossible de charger les tranches d'âge:", error);
  }
  return [];
}

const mapToyToAgeRange = (toy: ToyWithAge, ageRanges: AgeRange[]): AgeRange | null => {
  if (!ageRanges.length) return null;
  const bounds = getToyAgeBounds(toy);
  if (bounds.min === null) return null;

  if (toy.age) {
    const direct = ageRanges.find((range) => normalizeToSlug(range.slug || range.label) === normalizeToSlug(toy.age || ""));
    if (direct) return direct;
  }

  return (
    ageRanges.find((range) => {
      const { min, max } = getRangeBoundsInMonths(range);
      const toyMax = bounds.max ?? bounds.min;
      return bounds.min >= min && toyMax <= max && toyMax >= min;
    }) || null
  );
};

export async function generateStaticParams() {
  const [toys, remoteRanges] = await Promise.all([getAllToys({ noCache: true }), fetchAgeRanges()]);
  const ranges = remoteRanges.length ? remoteRanges : buildFallbackAgeRanges(toys);
  return ranges.map((range) => ({ age: range.slug || normalizeToSlug(range.label) }));
}

export async function generateMetadata({ params }: { params: { age: string } }) {
  const [toys, remoteRanges] = await Promise.all([getAllToys({ noCache: true }), fetchAgeRanges()]);
  const ranges = remoteRanges.length ? remoteRanges : buildFallbackAgeRanges(toys);
  const current =
    ranges.find((range) => range.slug === params.age) ||
    ranges.find((range) => normalizeToSlug(range.label) === params.age);
  const ageLabel = current?.label ?? params.age.replace(/-/g, " ");
  return {
    title: `${ageLabel} - LOUAAB`,
    description: `Découvrez nos jouets adaptés pour la tranche d'âge ${ageLabel}.`,
  };
}

export default async function AgeDetailPage({ params }: { params: { age: string } }) {
  const slug = params.age;
  const [toys, remoteRanges] = await Promise.all([getAllToys({ noCache: true }), fetchAgeRanges()]);
  const ageRanges = remoteRanges.length ? remoteRanges : buildFallbackAgeRanges(toys);
  const currentAge =
    ageRanges.find((range) => range.slug === slug) ||
    ageRanges.find((range) => normalizeToSlug(range.label) === slug) ||
    null;

  // Helper to check overlap
  const checkOverlap = (toy: ToyWithAge, range: AgeRange) => {
    const toyBounds = getToyAgeBounds(toy);
    if (toyBounds.min === null) return false;

    const rangeBounds = getRangeBoundsInMonths(range);

    const toyMin = toyBounds.min;
    const toyMax = toyBounds.max ?? Infinity; // Open-ended toy age (e.g. 8+)
    const rangeMin = rangeBounds.min;
    const rangeMax = rangeBounds.max === Infinity ? Infinity : rangeBounds.max; // Open-ended category

    // Overlap condition: start1 < end2 && start2 < end1
    return toyMin < rangeMax && rangeMin < toyMax;
  };

  const toysForAge = currentAge
    ? toys.filter((toy) => checkOverlap(toy as ToyWithAge, currentAge))
    : toys.filter((toy) => normalizeToSlug(toy.age || "") === slug);

  return (
    <PageShell>
      <section className="border-b border-mist/60 bg-gradient-to-br from-purple-50 to-pink-50 py-12">
        <div className="mx-auto w-full max-w-6xl px-4">
          <nav className="flex items-center gap-2 text-sm text-slate mb-4">
            <Link href="/" className="hover:text-mint">
              Accueil
            </Link>
            <span>/</span>
            <Link href="/ages" className="hover:text-mint">
              Âges
            </Link>
            <span>/</span>
            <span className="text-charcoal">{currentAge?.label || slug.replace(/-/g, " ")}</span>
          </nav>
          <h1 className="text-3xl font-bold text-charcoal">{currentAge?.label || slug.replace(/-/g, " ")}</h1>
          {currentAge && (
            <div className="mt-2 text-5xl">
              {currentAge.iconType === "emoji" ? (
                currentAge.icon
              ) : currentAge.iconType === "upload" && currentAge.iconUrl ? (
                <Image src={currentAge.iconUrl} alt={currentAge.label} width={64} height={64} />
              ) : (
                <span>{currentAge.icon || "🎯"}</span>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        {toysForAge.length === 0 ? (
          <div className="text-center text-slate">Aucun jouet pour cette tranche d'âge.</div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-charcoal">Jouets disponibles</h2>
              <span className="text-sm text-slate">{toysForAge.length} jouet{toysForAge.length > 1 ? "s" : ""}</span>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {toysForAge.map((toy, index) => (
                <ToyCardWithReservation key={`${toy.backendId || toy.id}-${index}`} toy={toy} priority={index < 4} />
              ))}
            </div>
          </div>
        )}
      </section>
    </PageShell>
  );
}
export const dynamic = "force-dynamic";
