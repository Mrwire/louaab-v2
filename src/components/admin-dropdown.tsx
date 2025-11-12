"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LucideIcon } from "lucide-react";

interface DropdownItem {
  icon: LucideIcon;
  label: string;
  href: string;
  description: string;
}

interface AdminDropdownProps {
  icon: LucideIcon;
  label: string;
  items: DropdownItem[];
  isActive: boolean;
  onItemClick?: () => void;
}

export default function AdminDropdown({
  icon: Icon,
  label,
  items,
  isActive,
  onItemClick,
}: AdminDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Détecter l'item actif basé sur l'URL
  useEffect(() => {
    const currentItem = items.find(item => item.href === pathname);
    setActiveItem(currentItem ? pathname : null);
  }, [pathname, items]);

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fermer le dropdown quand on change de page
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleItemClick = () => {
    setIsOpen(false);
    onItemClick?.();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
          isActive
            ? "bg-mint text-white shadow-lg shadow-mint/30"
            : "text-slate hover:bg-mint/10 hover:text-charcoal"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} />
          <span>{label}</span>
        </div>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 ml-4 space-y-1 rounded-lg bg-white border border-mist/50 shadow-lg p-2 animate-in slide-in-from-top-2 duration-200">
          {items.map((item) => {
            const ItemIcon = item.icon;
            const isItemActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                  isItemActive
                    ? "bg-mint text-white shadow-md"
                    : "text-slate hover:bg-mist/50 hover:text-charcoal"
                }`}
                onClick={handleItemClick}
              >
                <ItemIcon size={16} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{item.label}</div>
                  <div className="text-xs opacity-75 truncate">{item.description}</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
