"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Pagination({ total, perPage }: { total: number; perPage: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const page = Math.max(1, Number(sp.get("page") || 1));
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const setPage = (p: number) => {
    const q = new URLSearchParams(sp.toString());
    q.set("page", String(p));
    router.push(`${pathname}?${q.toString()}`);
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button className="btn border" disabled={page<=1} onClick={()=>setPage(page-1)}>Prev</button>
      <div className="text-sm">Page {page} of {totalPages}</div>
      <button className="btn border" disabled={page>=totalPages} onClick={()=>setPage(page+1)}>Next</button>
    </div>
  );
}
