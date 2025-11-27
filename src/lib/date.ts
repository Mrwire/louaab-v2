export function formatDateInput(date: Date | string = new Date()): string {
  const base = typeof date === 'string' ? parseDateInput(date) : new Date(date);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, '0');
  const day = String(base.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateInput(value?: string): Date {
  if (!value) return new Date();

  const parts = value.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);
    if ([year, month, day].every((n) => Number.isFinite(n))) {
      return new Date(year, month - 1, day);
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}
