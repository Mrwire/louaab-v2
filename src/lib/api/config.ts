export const PUBLIC_API =
  process.env.NEXT_PUBLIC_API_URL || 'https://louaab.ma/api';

const INTERNAL_API =
  process.env.INTERNAL_API_URL ||
  process.env.API_URL ||
  'http://127.0.0.1:3001/api';

export const API_BASE_URL =
  typeof window === 'undefined' ? INTERNAL_API : PUBLIC_API;
