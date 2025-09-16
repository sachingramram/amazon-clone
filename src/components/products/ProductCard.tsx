"use client";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/store/useCart";
import RatingStars from "@/components/filters/RatingStars";

export default function ProductCard({ p }: { p: any }) {
  const add = useCart((s) => s.add);

  const priceMajor = (p.price / 100).toFixed(2);

  return (
    <div className="card p-4 flex flex-col">
      {p.image && (
        <Link href={`/product/${p._id}`}>
          <Image src={p.image} alt={p.title} width={400} height={400} className="w-full h-48 object-contain" />
        </Link>
      )}

      <div className="mt-3 text-xs text-gray-500">{p.brand}</div>
      <Link href={`/product/${p._id}`} className="font-medium hover:underline line-clamp-2">
        {p.title}
      </Link>

      <div className="mt-1 text-sm text-gray-600 flex items-center gap-2">
        <RatingStars value={p?.rating?.rate || 0} />
        <span>({p?.rating?.count || 0})</span>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-lg font-semibold">₹{priceMajor}</div>
        {p.discountPercent ? (
          <span className="badge bg-green-100 text-green-700">{p.discountPercent}% off</span>
        ) : null}
        {p.primeEligible ? (
          <span className="badge">Prime</span>
        ) : null}
      </div>

      <button
        onClick={() => add({ _id: p._id, title: p.title, price: p.price, image: p.image })}
        className="btn-primary mt-auto"
      >
        Add to Cart
      </button>
    </div>
  );
}
