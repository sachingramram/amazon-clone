"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/store/useCart";
import { useMemo } from "react";

export default function CartButton() {
  const items = useCart((s) => s.items);
  const count = useMemo(() => items.reduce((a, b) => a + b.quantity, 0), [items]);

  return (
    <Link href="/cart" className="relative inline-flex" aria-label={`Cart (${count} items)`}>
      <ShoppingCart />
      {count > 0 && (
        <span
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 text-white text-xs
                     flex items-center justify-center"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
