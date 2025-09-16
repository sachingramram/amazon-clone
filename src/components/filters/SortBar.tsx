"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SortBar({ total }: { total: number }) {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();
  const sort = sp.get("sort") || "relevance";

  const change = (v: string) => {
    const q = new URLSearchParams(sp.toString());
    if (v === "relevance") q.delete("sort"); else q.set("sort", v);
    q.delete("page");
    router.push(`${pathname}?${q.toString()}`);
  };

  return (
    <div className="card p-3 flex items-center justify-between">
      <div className="text-sm text-gray-600">{total} results</div>
      <select className="input w-48" value={sort} onChange={(e)=>change(e.target.value)}>
        <option value="relevance">Sort by: Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating">Avg. Customer Review</option>
        <option value="newest">Newest Arrivals</option>
        <option value="best">Best Sellers</option>
      </select>
    </div>
  );
}
