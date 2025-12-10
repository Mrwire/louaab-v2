"use client";

import { useEffect, useState } from "react";
import { ToyData, getToyBySlug } from "@/lib/toys-data";

type Props = {
  toy: ToyData;
};

export default function ToyAvailabilityLive({ toy: initialToy }: Props) {
  const [liveToy, setLiveToy] = useState<ToyData>(initialToy);

  useEffect(() => {
    let cancelled = false;

    const fetchLatest = async () => {
      try {
        const fresh = await getToyBySlug(initialToy.slug, { noCache: true, revalidateSeconds: 0 });
        if (!cancelled && fresh) {
          setLiveToy(fresh);
        }
      } catch {
        // silencieux
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [initialToy.slug]);

  const available =
    typeof liveToy.availableQuantity === "number"
      ? liveToy.availableQuantity
      : typeof liveToy.stockQuantity === "number"
        ? liveToy.stockQuantity
        : Number(liveToy.stock ?? 0);

  const inStock = Number.isFinite(available) && available > 0;

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate">Disponibilité</div>
      <div className={`mt-2 font-bold ${inStock ? "text-green-600" : "text-red-600"}`}>
        {inStock ? "En stock" : "Rupture de stock"}
        <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-slate">
          {Math.max(0, Math.floor(Number.isFinite(available) ? available : 0))}
        </span>
      </div>
    </div>
  );
}
