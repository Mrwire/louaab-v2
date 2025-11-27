import { API_BASE_URL } from './config';

export type CartDuration = 'daily' | 'weekly' | 'monthly';

export type PublicOrderItemPayload = {
  toyId: string;
  quantity: number;
  unitPrice: number;
  rentalDurationDays: number;
  startDate?: string;
  durationLabel?: string;
};

export type CreatePublicOrderPayload = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPostalCode?: string;
  deliveryDate?: string;
  deliveryTimeSlot?: string;
  notes?: string;
  items: PublicOrderItemPayload[];
  totalAmount: number;
  depositAmount?: number;
};

export async function createPublicOrder(payload: CreatePublicOrderPayload) {
  const response = await fetch(`${API_BASE_URL}/public/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.message || 'Impossible de finaliser la commande';
    throw new Error(message);
  }

  return body?.data;
}
