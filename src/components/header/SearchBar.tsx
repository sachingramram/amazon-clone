"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SearchBar() {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const current = sp.get("q") || "";
    setQ(current);
  }, [sp, pathname]);

  const go = () => {
    const query = q.trim();
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
  };

  return (
    <div className="w-full md:flex-1 md:max-w-2xl md:mx-4">
      <div className="flex items-center bg-white rounded-md overflow-hidden">
        <input
          ref={inputRef}
          className="input border-0 flex-1 py-3 md:py-2 text-black md:text-sm"
          placeholder="Search products, brands, categories…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") go(); }}
          autoComplete="off"
          aria-label="Search"
        />
        <button className="px-4 py-3 md:px-3 md:py-2 bg-accent" onClick={go} aria-label="Search button">
          <Search size={18} />
        </button>
      </div>
    </div>
  );
}
