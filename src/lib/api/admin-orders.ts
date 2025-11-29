import type { Order, OrderItem } from '@/lib/orders';
import { API_BASE_URL } from './config';

const normalizeImageUrl = (url?: string) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  const base = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
};

const ADMIN_ORDERS_ENDPOINT = `${API_BASE_URL}/admin/ui/orders`;

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

export interface AdminOrderStats {
  period: {
    from: string;
    to: string;
    rangeDays: number;
  };
  totals: {
    orders: number;
    revenue: number;
    deposit: number;
  };
  statusBreakdown: Record<string, number>;
  topToys: Array<{
    toyId: string | null;
    toyName: string;
    rentals: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    customerId: string | null;
    customerName: string;
    orders: number;
    revenue: number;
  }>;
  loyalCustomers: Array<{
    customerId: string | null;
    customerName: string;
    orders: number;
    revenue: number;
  }>;
  revenueByMonth: Array<{
    period: string;
    orders: number;
    revenue: number;
  }>;
}

export type AdminOrderFilters = {
  limit?: number;
  page?: number;
  status?: Order['status'] | 'all';
  customerId?: string;
  from?: string;
  to?: string;
  city?: string;
};

type RawOrderCustomer = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  name?: string;
};

type RawOrderItem = {
  toy?: {
    name?: string;
    stockQuantity?: number;
    availableQuantity?: number;
    image?: string;
    imageUrl?: string;
    thumbnail?: string;
    images?: Array<{ url?: string }>;
  } | null;
  toyName?: string;
  rentalDurationDays?: number | string | null;
  createdAt?: string;
  rentalStartDate?: string;
  startDate?: string;
  quantity?: number | string | null;
  rentalPrice?: number | string | null;
  price?: number | string | null;
  imageUrl?: string;
};

type RawOrder = {
  id?: string;
  orderNumber?: string;
  customer?: RawOrderCustomer | null;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  items?: RawOrderItem[];
  totalAmount?: number | string | null;
  totalPrice?: number | string | null;
  status?: string;
  createdAt?: string;
  notes?: string;
};

const mapOrderStatus = (status?: string): Order['status'] => {
  if (!status) return 'pending';
  switch (status.toLowerCase()) {
    case 'draft':
      return 'pending';
    case 'confirmed':
    case 'preparing':
    case 'shipping':
      return 'confirmed';
    case 'delivered':
      return 'delivered';
    case 'returned':
      return 'returned';
    case 'completed':
      return 'completed';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'pending';
  }
};

const formatDurationFromDays = (days?: number): string => {
  if (!days || Number.isNaN(days)) return '1 mois';
  const months = Math.max(1, Math.round(days / 30));
  return months > 1 ? `${months} mois` : '1 mois';
};

const mapOrderItems = (rawItems?: RawOrderItem[]): OrderItem[] => {
  if (!Array.isArray(rawItems)) return [];
  return rawItems.map((item) => ({
    toyName: item?.toy?.name || item?.toyName || 'Jouet',
    duration: formatDurationFromDays(Number(item?.rentalDurationDays ?? 0)),
    startDate: item?.createdAt || item?.rentalStartDate || item?.startDate || new Date().toISOString(),
    quantity: Number(item?.quantity ?? 1),
    price: Number(item?.rentalPrice ?? item?.price ?? 0),
    stockQuantity: Number(item?.toy?.stockQuantity ?? 0),
    availableQuantity: Number(item?.toy?.availableQuantity ?? item?.toy?.stockQuantity ?? 0),
    imageUrl: normalizeImageUrl(
      item?.toy?.images?.[0]?.url ||
        item?.toy?.imageUrl ||
        item?.toy?.thumbnail ||
        item?.toy?.image ||
        item?.imageUrl ||
        undefined,
    ),
  }));
};

const getCustomerName = (rawCustomer?: RawOrderCustomer | null, fallback?: string) => {
  if (!rawCustomer) return fallback || 'Client';
  const names = [rawCustomer.firstName, rawCustomer.lastName].filter(Boolean);
  const name = names.join(' ').trim();
  return name || rawCustomer.name || fallback || 'Client';
};

const sanitizePhone = (phone?: string) => {
  if (!phone) return 'N/A';
  const digits = phone.replace(/[^\d+]/g, '').trim();
  return digits || phone;
};

const mapOrderFromApi = (raw: RawOrder): Order => ({
  id: raw?.id || raw?.orderNumber || '',
  orderNumber: raw?.orderNumber,
  customerName: getCustomerName(raw?.customer, raw?.customerName),
  customerPhone: sanitizePhone(raw?.customer?.phone || raw?.customerPhone),
  deliveryAddress: raw?.deliveryAddress || raw?.customer?.address,
  items: mapOrderItems(raw?.items),
  totalPrice: Number(raw?.totalAmount ?? raw?.totalPrice ?? 0),
  status: mapOrderStatus(raw?.status),
  createdAt: raw?.createdAt || new Date().toISOString(),
  notes: raw?.notes || undefined,
});

const buildQueryString = (params?: AdminOrderFilters) => {
  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params?.customerId) searchParams.set('customerId', params.customerId);
  if (params?.city) searchParams.set('city', params.city);
  if (params?.from) searchParams.set('from', params.from);
  if (params?.to) searchParams.set('to', params.to);

  const limit = Number(params?.limit ?? 50);
  if (Number.isFinite(limit) && limit > 0) {
    searchParams.set('limit', String(limit));
  }

  const page = Number(params?.page ?? 1);
  if (Number.isFinite(page) && page > 0) {
    searchParams.set('page', String(page));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

const parseResponse = async <T>(response: Response, fallbackError: string): Promise<T> => {
  const payload = (await response.json().catch(() => null)) as ApiResponse<unknown> | null;

  if (!response.ok) {
    throw new Error(payload?.message || fallbackError);
  }

  if (payload && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    const data = (payload as { data: unknown }).data;
    if (Array.isArray(data)) {
      return data as T;
    }
    if (data && typeof data === 'object' && Array.isArray((data as { items?: unknown }).items)) {
      return ((data as { items: unknown[] }).items as unknown) as T;
    }
    return data as T;
  }

  if (payload) {
    return (payload as unknown) as T;
  }

  throw new Error(fallbackError);
};

export const fetchAdminOrders = async (filters?: AdminOrderFilters): Promise<Order[]> => {
  const query = buildQueryString(filters);
  const response = await fetch(`${ADMIN_ORDERS_ENDPOINT}${query}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    credentials: 'include',
  });

  const orders = await parseResponse<RawOrder[]>(response, 'Impossible de charger les commandes');
  return Array.isArray(orders) ? orders.map(mapOrderFromApi) : [];
};

export const fetchAdminOrderStats = async (params?: { limit?: number; rangeDays?: number; from?: string; to?: string }): Promise<AdminOrderStats> => {
  const searchParams = new URLSearchParams();
  if (params?.rangeDays) searchParams.set('rangeDays', String(params.rangeDays));
  if (params?.from) searchParams.set('from', params.from);
  if (params?.to) searchParams.set('to', params.to);

  const query = searchParams.toString();
  const response = await fetch(`${ADMIN_ORDERS_ENDPOINT}/stats${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    credentials: 'include',
  });

  return parseResponse<AdminOrderStats>(response, 'Impossible de charger les statistiques commandes');
};

export const updateAdminOrderStatus = async (orderId: string, status: Order['status']): Promise<Order> => {
  if (!orderId) {
    throw new Error('Identifiant de commande manquant');
  }

  const response = await fetch(`${ADMIN_ORDERS_ENDPOINT}/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  const updated = await parseResponse<RawOrder>(response, 'Impossible de mettre a jour le statut de la commande');
  return mapOrderFromApi(updated);
};

export const resetAdminOrder = async (orderId: string): Promise<Order> => {
  if (!orderId) {
    throw new Error('Identifiant de commande manquant');
  }
  const response = await fetch(`${ADMIN_ORDERS_ENDPOINT}/${orderId}/reset`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  const updated = await parseResponse<RawOrder>(response, 'Impossible de réinitialiser la commande');
  return mapOrderFromApi(updated);
};
