"use client";

import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import ToyCardWithReservation from "@/components/toy-card-with-reservation";
import { ToyData } from "@/lib/toys-data";
import Link from "next/link";
import Image from "next/image";
import CartButton from "@/components/cart-button";
import FavoriteButton from "@/components/favorite-button";

interface CategoryToysViewProps {
  toys: ToyData[];
}

export default function CategoryToysView({ toys }: CategoryToysViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <>
      {/* View Toggle */}
      <div className="flex items-center justify-end gap-2 mb-6">
        <span className="text-sm text-slate mr-2">Vue:</span>
        <button
          onClick={() => setViewMode("grid")}
          className={`rounded-l-xl px-3 py-2 transition ${
            viewMode === "grid"
              ? "bg-mint text-white"
              : "bg-gray-100 text-slate hover:bg-gray-200"
          }`}
          aria-label="Vue grille"
        >
          <LayoutGrid size={18} />
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`rounded-r-xl px-3 py-2 transition ${
            viewMode === "list"
              ? "bg-mint text-white"
              : "bg-gray-100 text-slate hover:bg-gray-200"
          }`}
          aria-label="Vue liste"
        >
          <List size={18} />
        </button>
      </div>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {toys.map((toy, index) => (
            <ToyCardWithReservation key={toy.backendId ?? toy.id} toy={toy} priority={index < 6} />
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {toys.map((toy) => (
            <div
              key={toy.backendId ?? toy.id}
              className="flex gap-4 rounded-2xl border border-mist bg-white p-4 transition hover:shadow-lg"
            >
              {/* Image */}
              <Link
                href={`/jouets/${toy.slug}`}
                className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl"
              >
                <Image
                  src={toy.image}
                  alt={toy.name}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-105"
                  sizes="128px"
                />
              </Link>

              {/* Content */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/jouets/${toy.slug}`}>
                      <h3 className="font-bold text-charcoal text-lg hover:text-mint transition line-clamp-2">
                        {toy.name}
                      </h3>
                    </Link>
                    <FavoriteButton toy={toy} />
                  </div>

                  <p className="mt-1 text-sm text-slate line-clamp-1">
                    {toy.category}
                  </p>

                  {toy.age && (
                    <p className="mt-1 text-xs text-slate">
                      Âge: {toy.age}
                    </p>
                  )}

                  {toy.description && (
                    <p className="mt-2 text-sm text-slate line-clamp-2">
                      {toy.description}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-mint">
                      {toy.price}
                    </span>
                    <span className="text-sm text-slate">/jour</span>
                  </div>
                  <CartButton toy={toy} allowDirectAdd={true} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
