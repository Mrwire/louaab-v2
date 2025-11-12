"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

export default function CartIcon() {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <Link
      href="/checkout"
      className="relative flex items-center justify-center rounded-full bg-[#1897aa]/10 p-3 text-[#1897aa] transition hover:bg-[#1897aa] hover:text-white"
    >
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#e72c37] text-xs font-bold text-white">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </Link>
  );
}
