import { API_BASE_URL, PUBLIC_API } from './api/config';

export interface ApiToyImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ApiToyCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ApiToy {
  id: string;
  sku?: string;
  slug?: string;
  name: string;
  description?: string;
  fullDescription?: string;
  videoUrl?: string;
  purchasePrice?: number;
  rentalPriceDaily?: number;
  rentalPriceWeekly?: number;
  rentalPriceMonthly?: number;
  depositAmount?: number;
  ageMin?: number;
  ageMax?: number;
  ageRange?: string; // Sometimes returned by API?
  playerCountMin?: number;
  playerCountMax?: number;
  genderTarget?: string;
  status?: string;
  condition?: string;
  stockQuantity?: number;
  availableQuantity?: number;
  internalRating?: number;
  rating?: number; // Mapped from internalRating or separate?
  vendor?: string;
  purchaseDate?: string;
  location?: string;
  minRentalQuantity?: number;
  timesRented?: number;
  lastCleaned?: string;
  nextMaintenance?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  categories?: ApiToyCategory[];
  images?: ApiToyImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiToyListResponse {
  items: ApiToy[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Define ToyData interface directly here since src/types/toy.ts is missing/unreliable
export interface ToyData {
  id: number | string;
  backendId?: string;
  name: string;
  slug: string;
  image: string;
  thumbnail: string;
  hasImage: boolean;
  category?: string;
  age?: string;
  ageMin?: number | null;
  ageMax?: number | null;
  price?: string;
  rating?: string;
  videoUrl?: string;
  hasVideo: boolean;
  description?: string;
  stock?: string;
  stockQuantity?: number;
  availableQuantity?: number;
  source: 'backend' | string;
  rentalPriceDaily?: number;
  rentalPriceWeekly?: number;
  rentalPriceMonthly?: number;
  depositAmount?: number;
  promotion?: {
    isActive: boolean;
    type: 'percentage' | 'fixed';
    value: number;
    label?: string;
  };
  isVisible: boolean;
}

export interface ToysMapping {
  generatedAt: string;
  totalToys: number;
  toysWithImages: number;
  coveragePercent: number;
  toys: ToyData[];
}

type ApiToyResponse = {
  success?: boolean;
  data?: ApiToy[] | ApiToyListResponse;
};

const PLACEHOLDER_IMAGE = '/toys/placeholders/toy-placeholder.svg';

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
  return `${chosen} MAD/semaine`; // Or just return the number as string if that's what UI expects? 
  // UI expects "60 MAD/semaine" format based on previous code.
};

const ensureImageUrl = (images?: ApiToyImage[]) => {
  const primary = images?.find((img) => typeof img?.url === 'string' && img.url.trim().length > 0);
  if (!primary?.url) return PLACEHOLDER_IMAGE;

  const url = primary.url.trim();
  if (url.startsWith('http')) return url;

  // Always use PUBLIC_API for images so they are accessible by the browser
  const baseUrl = PUBLIC_API.replace(/\/api\/?$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;

  return `${baseUrl}${path}`;
};

const mapBackendToy = (toy: ApiToy): ToyData => {
  const imageUrl = ensureImageUrl(toy.images);
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

  const stockQuantity = safeNumber(toy.stockQuantity);
  const availableQuantity = safeNumber(toy.availableQuantity);
  // Pour l'affichage dispo, on privilégie la quantité disponible; à défaut on prend le stock physique
  const stock = typeof availableQuantity === 'number' ? availableQuantity : (stockQuantity ?? 0);
  const depositAmount = safeNumber(toy.depositAmount) ?? 0;

  // Price label logic - usually weekly price is shown
  const priceLabel = weeklyPrice ? `${weeklyPrice}` : (dailyPrice ? `${dailyPrice}` : '');

  return {
    id: toy.id,
    backendId: String(toy.id),
    name: toy.name || '',
    // CRITICAL: Use backend slug directly. Do NOT re-slugify.
    slug: toy.slug || String(toy.id),
    image: imageUrl,
    thumbnail: imageUrl,
    hasImage: imageUrl !== PLACEHOLDER_IMAGE,
    category: categories,
    age: ageLabel,
    ageMin: ageMin ?? null,
    ageMax: ageMax ?? null,
    price: priceLabel, // UI expects string price
    rating: String(toy.rating ?? 4),
    videoUrl: toy.videoUrl || '',
    hasVideo: Boolean(toy.videoUrl),
    description: toy.description || '',
    stock: String(stock),
    stockQuantity: stockQuantity ?? 0,
    availableQuantity: availableQuantity ?? 0,
    source: 'backend',
    rentalPriceDaily: dailyPrice,
    rentalPriceWeekly: weeklyPrice,
    rentalPriceMonthly: monthlyPrice,
    depositAmount,
    promotion: undefined,
    isVisible: toy.isActive !== false,
  };
};

interface GetAllToysOptions {
  noCache?: boolean;
  revalidateSeconds?: number;
}

const buildApiUrl = (path: string) => {
  if (API_BASE_URL.startsWith('http')) return `${API_BASE_URL}${path}`;
  if (typeof window !== 'undefined') return `${API_BASE_URL}${path}`;
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  return `${origin}${API_BASE_URL}${path}`;
};

export async function getAllToys(options: GetAllToysOptions = {}): Promise<ToyData[]> {
  const { noCache = true, revalidateSeconds = 0 } = options;

  try {
    const fetchOptions: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (noCache || typeof window !== 'undefined') {
      fetchOptions.cache = 'no-store';
    } else {
      fetchOptions.next = {
        revalidate: revalidateSeconds,
        tags: ['toys']
      };
    }

    const response = await fetch(buildApiUrl('/toys?limit=1000'), fetchOptions);

    if (response.ok) {
      const result = (await response.json()) as ApiToyResponse;
      if (result.success && result.data) {
        const payload = Array.isArray(result.data)
          ? result.data
          : Array.isArray((result.data as ApiToyListResponse).items)
            ? (result.data as ApiToyListResponse).items!
            : [];

        if (payload.length) {
          // Map directly. No local merge. No dedupe (backend should handle unique slugs).
          return payload.map(mapBackendToy);
        }
      }
    }
  } catch (error) {
    console.error('Warning: Failed to fetch from backend:', error);
  }

  return [];
}

/**
 * Get toy by slug with fresh data by default (no cache).
 */
export async function getToyBySlug(
  slug: string,
  options: GetAllToysOptions = { noCache: true, revalidateSeconds: 0 },
): Promise<ToyData | null> {
  const toys = await getAllToys({ noCache: true, ...options });
  return toys.find((toy) => toy.slug.toLowerCase() === slug.toLowerCase()) || null;
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

function parseRating(rating?: string): number {
  if (!rating) return 0;
  const match = rating.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}
