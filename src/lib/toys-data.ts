import { API_BASE_URL } from './api/config';

export interface ToyData {
  id: number;
  backendId?: string;
  sku?: string;
  name: string;
  slug: string;
  image: string;
  thumbnail: string;
  hasImage: boolean;
  category: string;
  age: string;
  ageMin?: number | null;
  ageMax?: number | null;
  price: string;
  rating: string;
  videoUrl: string;
  hasVideo: boolean;
  description: string;
  stock: string | number;
  source: string;
  stockQuantity?: number;
  availableQuantity?: number;
  isVisible?: boolean;
  rentalPriceDaily?: number;
  rentalPriceWeekly?: number;
  rentalPriceMonthly?: number;
  depositAmount?: number;
  promotion?: {
    isActive: boolean;
    type: 'percentage' | 'fixed' | 'text';
    value: string;
    label: string;
    startDate?: string;
    endDate?: string;
  };
}

export interface ToysMapping {
  generatedAt: string;
  totalToys: number;
  toysWithImages: number;
  coveragePercent: number;
  toys: ToyData[];
}

type ApiToyCategory = { name?: string | null };
type ApiToyImage = { url?: string | null };

type ApiToy = {
  id?: number | string;
  slug?: string;
  sku?: string;
  name?: string;
  rentalPriceWeekly?: number | string;
  rentalPriceDaily?: number | string;
  rentalPriceMonthly?: number | string;
  depositAmount?: number | string;
  categories?: ApiToyCategory[];
  ageRange?: string;
  ageMin?: number | string | null;
  ageMax?: number | string | null;
  description?: string;
  images?: ApiToyImage[];
  rating?: number | string;
  stockQuantity?: number | string;
  availableQuantity?: number | string;
  videoUrl?: string;
  isActive?: boolean;
};

type ApiToyListResponse = {
  items?: ApiToy[];
  total?: number;
  page?: number;
  limit?: number;
};

type ApiToyResponse = {
  success?: boolean;
  data?: ApiToy[] | ApiToyListResponse;
};

let cachedData: ToysMapping | null = null;

const PLACEHOLDER_IMAGE = '/toys/placeholders/toy-placeholder.svg';

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const safeNumber = (value: unknown): number | undefined => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
};

const formatAgeLabel = (min?: number | null, max?: number | null) => {
  const formatBound = (val: number) => {
    if (val < 12) return `${val} mois`;
    const years = val / 12;
    return Number.isInteger(years) ? `${years} ans` : `${years.toFixed(1)} ans`;
  };

  if (typeof min === 'number' && typeof max === 'number') {
    if (min === max) return formatBound(min);
    return `${formatBound(min)} - ${formatBound(max)}`;
  }
  if (typeof min === 'number' && max == null) {
    return `${formatBound(min)} +`;
  }
  if (typeof max === 'number') {
    return formatBound(max);
  }
  return '';
};

const toPriceLabel = (weekly?: number, daily?: number) => {
  const chosen = weekly ?? daily;
  if (!chosen || Number.isNaN(chosen)) return '';
  return `${chosen} MAD/semaine`;
};

const buildBackendId = (rawId: unknown, slugCandidate: string | undefined, index: number, prefix: string) => {
  if (typeof rawId === 'string' && rawId.trim()) return rawId;
  if (typeof rawId === 'number' && Number.isFinite(rawId)) return String(rawId);
  if (slugCandidate && slugCandidate.trim()) return slugCandidate;
  return `${prefix}-${index + 1}`;
};

const buildSlug = (rawSlug: string | undefined, name?: string, backendId?: string) => {
  const candidate =
    rawSlug && rawSlug.trim().length > 0
      ? rawSlug
      : name && name.trim().length > 0
        ? slugify(name)
        : backendId || '';

  const normalized = slugify(candidate);
  return normalized || (backendId ? slugify(backendId) : 'jouet');
};

const ensureImageUrl = (images?: ApiToyImage[]) => {
  const primary = images?.find((img) => typeof img?.url === 'string' && img.url.trim().length > 0);
  return primary?.url?.trim() || PLACEHOLDER_IMAGE;
};

const mapBackendToy = (toy: ApiToy, index: number): ToyData => {
  const backendId = buildBackendId(toy.id, toy.slug || toy.sku, index, 'backend-toy');
  const numericId = typeof toy.id === 'number' && Number.isFinite(toy.id) ? Number(toy.id) : index + 1;
  const slug = buildSlug(toy.slug || toy.sku, toy.name, backendId);
  const dailyPrice = safeNumber(toy.rentalPriceDaily);
  const weeklyPrice = safeNumber(toy.rentalPriceWeekly);
  const monthlyPrice = safeNumber(toy.rentalPriceMonthly);
  const ageMin = safeNumber(toy.ageMin);
  const ageMax = safeNumber(toy.ageMax);
  const ageLabel = toy.ageRange || formatAgeLabel(ageMin, ageMax);

  const categories = Array.isArray(toy.categories)
    ? toy.categories
      .map((cat) => cat?.name)
      .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
      .join(', ')
    : '';

  const imageUrl = ensureImageUrl(toy.images);
  const priceLabel = toPriceLabel(weeklyPrice, dailyPrice);
  const stockQuantity = safeNumber(toy.stockQuantity);
  const availableQuantity = safeNumber(toy.availableQuantity);
  const stock = Math.max(stockQuantity ?? 0, availableQuantity ?? 0);
  const depositAmount = safeNumber(toy.depositAmount) ?? 0;

  return {
    id: numericId,
    backendId,
    name: toy.name || '',
    slug,
    image: imageUrl,
    thumbnail: imageUrl,
    hasImage: imageUrl !== PLACEHOLDER_IMAGE,
    category: categories,
    age: ageLabel,
    ageMin: ageMin ?? null,
    ageMax: ageMax ?? null,
    price: priceLabel,
    rating: String(toy.rating ?? 4),
    videoUrl: toy.videoUrl || '',
    hasVideo: Boolean(toy.videoUrl),
    description: toy.description || '',
    stock: String(stock ?? 0),
    stockQuantity: stockQuantity ?? stock ?? 0,
    availableQuantity: availableQuantity ?? stock ?? 0,
    source: 'backend',
    rentalPriceDaily: dailyPrice,
    rentalPriceWeekly: weeklyPrice,
    rentalPriceMonthly: monthlyPrice,
    depositAmount,
    promotion: undefined,
    isVisible: toy.isActive !== false,
  };
};

const mapLocalToy = (toy: ToyData, index: number): ToyData => {
  const backendId = toy.backendId ?? buildBackendId(toy.id, toy.slug, index, 'local-toy');
  const numericId = typeof toy.id === 'number' ? toy.id : index + 1;
  const image = toy.image || PLACEHOLDER_IMAGE;
  const thumbnail = toy.thumbnail || image;

  return {
    ...toy,
    id: numericId,
    backendId,
    slug: toy.slug || buildSlug(undefined, toy.name, backendId),
    image,
    thumbnail,
    hasImage: Boolean(image || thumbnail),
    source: toy.source || 'local',
  };
};

const buildToyKey = (toy: ToyData) => {
  // Prioritize slug and name for deduplication to handle cases where
  // the same toy exists multiple times in the DB with different IDs
  if (toy.slug) return slugify(toy.slug);
  if (toy.name) return slugify(toy.name);
  if (toy.backendId) return String(toy.backendId).toLowerCase();
  return String(toy.id);
};

const getStockValue = (toy: ToyData) => {
  const raw = toy.stockQuantity ?? toy.availableQuantity ?? toy.stock;
  const numeric = Number(raw);
  if (Number.isFinite(numeric)) return numeric;
  const parsed = parseInt(String(raw ?? 0), 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const dedupeToys = (items: ToyData[]): ToyData[] => {
  const map = new Map<string, ToyData>();

  for (const item of items) {
    const key = buildToyKey(item);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, item);
      continue;
    }

    const existingStock = getStockValue(existing);
    const newStock = getStockValue(item);
    const preferNew =
      newStock > existingStock ||
      (newStock === existingStock && item.source === 'backend' && existing.source !== 'backend');

    if (preferNew) {
      map.set(key, item);
    }
  }

  return Array.from(map.values());
};

/**
 * Load toys data from the mapping JSON file
 */
export async function loadToysData(): Promise<ToysMapping> {
  if (cachedData) {
    return cachedData;
  }

  try {
    if (typeof window === 'undefined') {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'public', 'toys', 'toys-mapping.json');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const cleanContent = fileContent.replace(/^\uFEFF/, '').trim();
      cachedData = JSON.parse(cleanContent);
      return cachedData!;
    }

    const response = await fetch('/toys/toys-mapping.json');
    if (!response.ok) {
      throw new Error('Failed to load toys data');
    }

    cachedData = await response.json();
    return cachedData!;
  } catch (error) {
    console.error('Error loading toys data:', error);
    return {
      generatedAt: new Date().toISOString(),
      totalToys: 0,
      toysWithImages: 0,
      coveragePercent: 0,
      toys: [],
    };
  }
}

interface GetAllToysOptions {
  noCache?: boolean;
  revalidateSeconds?: number;
}

export async function getAllToys(options: GetAllToysOptions = {}): Promise<ToyData[]> {
  const { noCache = false, revalidateSeconds = 60 } = options;

  try {
    const fetchOptions: RequestInit & { next?: { revalidate?: number } } = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (noCache) {
      fetchOptions.cache = 'no-store';
    } else {
      fetchOptions.next = { revalidate: revalidateSeconds };
    }

    const response = await fetch(`${API_BASE_URL}/toys?limit=500`, fetchOptions);

    if (response.ok) {
      const result = (await response.json()) as ApiToyResponse;
      if (result.success && result.data) {
        const payload = Array.isArray(result.data)
          ? result.data
          : Array.isArray((result.data as ApiToyListResponse).items)
            ? (result.data as ApiToyListResponse).items!
            : [];

        if (payload.length) {
          const mapped = payload.map((toy, index) => mapBackendToy(toy, index));
          const deduped = dedupeToys(mapped);
          return deduped.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
        }
      }
    }
  } catch (error) {
    console.warn('Erreur lors du chargement depuis le backend, utilisation des donnees locales:', error);
  }

  const data = await loadToysData();
  const mapped = data.toys.map((toy, index) => mapLocalToy(toy, index));
  const deduped = dedupeToys(mapped);
  return deduped.sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
}

/**
 * Get toy by slug
 */
export async function getToyBySlug(slug: string): Promise<ToyData | null> {
  const normalized = slugify(slug);
  const toys = await getAllToys();
  return toys.find((toy) => slugify(toy.slug) === normalized) || null;
}

/**
 * Get toys by category
 */
export async function getToysByCategory(category: string): Promise<ToyData[]> {
  const toys = await getAllToys();
  const normalized = category.toLowerCase();

  return toys.filter((toy) =>
    toy.category
      ?.toLowerCase()
      .split(',')
      .some((cat) => cat.trim().includes(normalized)),
  );
}

/**
 * Get toys by age range
 */
export async function getToysByAge(ageRange: string): Promise<ToyData[]> {
  const toys = await getAllToys();
  const normalized = ageRange.toLowerCase();
  return toys.filter((toy) => (toy.age || '').toLowerCase().includes(normalized));
}

/**
 * Search toys by name
 */
export async function searchToys(query: string): Promise<ToyData[]> {
  const toys = await getAllToys();
  const lowerQuery = query.toLowerCase();

  return toys.filter(
    (toy) =>
      toy.name.toLowerCase().includes(lowerQuery) ||
      toy.description?.toLowerCase().includes(lowerQuery) ||
      toy.category?.toLowerCase().includes(lowerQuery),
  );
}

/**
 * Get toys with images only
 */
export async function getToysWithImages(): Promise<ToyData[]> {
  const toys = await getAllToys();
  return toys.filter((toy) => toy.hasImage);
}

/**
 * Get random toys
 */
export async function getRandomToys(count: number = 6): Promise<ToyData[]> {
  const toys = await getAllToys();
  const shuffled = [...toys].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Get featured toys (toys with images and high ratings)
 */
export async function getFeaturedToys(count: number = 8): Promise<ToyData[]> {
  const toys = await getAllToys();

  const featured = toys
    .filter((toy) => {
      const inStock = toy.stock && parseInt(String(toy.stock)) > 0;
      return toy.hasImage && toy.rating && inStock;
    })
    .sort((a, b) => {
      const ratingA = parseRating(a.rating);
      const ratingB = parseRating(b.rating);
      return ratingB - ratingA;
    })
    .slice(0, count);

  return featured;
}

/**
 * Parse rating string to number
 */
function parseRating(rating: string): number {
  if (!rating) return 0;

  const match = rating.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Get all unique categories
 */
export async function getAllCategories(): Promise<string[]> {
  const toys = await getAllToys();
  const categories = new Set<string>();

  toys.forEach((toy) => {
    if (toy.category) {
      toy.category.split(',').forEach((cat) => {
        const trimmed = cat.trim();
        if (trimmed) {
          categories.add(trimmed);
        }
      });
    }
  });

  return Array.from(categories).sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }));
}

/**
 * Get all unique age ranges
 */
export async function getAllAgeRanges(): Promise<string[]> {
  const toys = await getAllToys();
  const ages = new Set<string>();

  toys.forEach((toy) => {
    if (toy.age) {
      ages.add(toy.age);
    }
  });

  return Array.from(ages).sort();
}

/**
 * Get statistics about the toys collection
 */
export async function getToysStats() {
  const toys = await getAllToys();

  return {
    total: toys.length,
    withImages: toys.filter((toy) => toy.hasImage).length,
    withoutImages: toys.filter((toy) => !toy.hasImage).length,
    coveragePercent: toys.length ? Math.round((toys.filter((t) => t.hasImage).length / toys.length) * 100) : 0,
    categories: await getAllCategories(),
    ageRanges: await getAllAgeRanges(),
    lastUpdated: cachedData?.generatedAt ?? new Date().toISOString(),
  };
}
