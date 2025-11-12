"use client";

import { useState } from 'react';
import Link from 'next/link';

interface AgesSidebarProps {
  allAges: string[];
  currentAge: string;
}

export default function AgesSidebar({ allAges, currentAge }: AgesSidebarProps) {
  const [showAllAges, setShowAllAges] = useState(false);
  
  // Afficher les 4 premiers âges par défaut
  const visibleAges = showAllAges ? allAges : allAges.slice(0, 4);
  const remainingCount = allAges.length - 4;

  return (
    <aside className="h-fit rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 bg-mint rounded-full"></div>
          <h2 className="text-sm font-semibold text-charcoal">
            Autres âges
          </h2>
        </div>
        
        <ul className="space-y-0.5">
          {visibleAges.map((age) => {
            const isActive = age === currentAge;
            return (
              <li key={age}>
                <Link
                  href={`/ages/${encodeURIComponent(age)}`}
                  className={`block rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-mint text-white font-medium shadow-sm'
                      : 'text-slate hover:bg-mint/10 hover:text-charcoal'
                  }`}
                >
                  {age}
                </Link>
              </li>
            );
          })}
        </ul>
        
        {allAges.length > 4 && (
          <div className="mt-2">
            <button
              onClick={() => setShowAllAges(!showAllAges)}
              className="flex items-center gap-1 text-xs text-mint hover:text-mint/80 transition-colors"
            >
              <span>
                {showAllAges ? 'Voir moins' : `Voir plus (${remainingCount})`}
              </span>
              <svg 
                className={`w-3 h-3 transition-transform duration-200 ${showAllAges ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <Link
        href="/jouets"
        className="block w-full rounded-lg border border-mint px-3 py-2 text-center text-xs font-medium text-mint transition hover:bg-mint hover:text-white mt-4"
      >
        Tous les jouets
      </Link>
    </aside>
  );
}
