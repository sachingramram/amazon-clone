"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

type Facets = {
  brands: string[];
  colors: string[];
  sizes: string[];
  priceMin: number; // minor units
  priceMax: number; // minor units
};

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card p-0 overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 select-none"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="font-medium">{title}</span>
        <ChevronDown
          size={18}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({ facets }: { facets: Facets }) {
  const router = useRouter();
  const sp = useSearchParams();
  const pathname = usePathname();

  const selectedBrands = useMemo(
    () => new Set((sp.get("brand") || "").split(",").filter(Boolean)),
    [sp]
  );
  const selectedColors = useMemo(
    () => new Set((sp.get("color") || "").split(",").filter(Boolean)),
    [sp]
  );
  const selectedSizes = useMemo(
    () => new Set((sp.get("size") || "").split(",").filter(Boolean)),
    [sp]
  );

  const rating = sp.get("rating") || ""; // 4,3,2
  const prime = sp.get("prime") === "1";
  const deals = sp.get("deals") || ""; // 10,25,50

  const [min, setMin] = useState(sp.get("min") || "");
  const [max, setMax] = useState(sp.get("max") || "");

  const update = (key: string, value?: string | null) => {
    const q = new URLSearchParams(sp.toString());
    if (!value) q.delete(key);
    else q.set(key, value);
    q.delete("page");
    router.push(`${pathname}?${q.toString()}`);
  };

  const toggleMulti = (key: "brand" | "color" | "size", val: string) => {
    const q = new URLSearchParams(sp.toString());
    const current = new Set((sp.get(key) || "").split(",").filter(Boolean));
    if (current.has(val)) current.delete(val);
    else current.add(val);
    if (current.size) q.set(key, Array.from(current).join(","));
    else q.delete(key);
    q.delete("page");
    router.push(`${pathname}?${q.toString()}`);
  };

  const clearAll = () => {
    const q = new URLSearchParams(sp.toString());
    ["brand", "color", "size", "rating", "prime", "deals", "min", "max", "page"].forEach((k) =>
      q.delete(k)
    );
    router.push(`${pathname}?${q.toString()}`);
  };

  return (
    <aside className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Filters</div>
        <button className="text-xs text-blue-600" onClick={clearAll}>
          Clear all
        </button>
      </div>

      {/* Price */}
      <Section title="Price" defaultOpen>
        <div className="flex items-center gap-2">
          <input
            className="input w-24"
            placeholder="Min"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            inputMode="numeric"
          />
          <span>—</span>
          <input
            className="input w-24"
            placeholder="Max"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            inputMode="numeric"
          />
          <button
            className="btn border"
            onClick={() => (update("min", min || null), update("max", max || null))}
          >
            Go
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-3 text-sm">
          {[500, 1000, 2000, 5000, 10000].map((p) => (
            <button
              key={p}
              className="px-3 py-1 rounded-full bg-gray-100"
              onClick={() => {
                update("min", "");
                update("max", String(p));
              }}
            >
              Up to ₹{p}
            </button>
          ))}
        </div>
      </Section>

      {/* Brand */}
      <Section title="Brand" defaultOpen={false}>
        <div className="space-y-1 max-h-56 overflow-auto pr-1">
          {facets.brands.slice(0, 50).map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={selectedBrands.has(b)}
                onChange={() => toggleMulti("brand", b)}
              />
              <span>{b}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Customer Review */}
      <Section title="Avg. Customer Review" defaultOpen={false}>
        {[4, 3, 2].map((n) => (
          <label key={n} className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="rating"
              checked={rating === String(n)}
              onChange={() => update("rating", String(n))}
            />
            <span>{"★".repeat(n)}
              {"☆".repeat(5 - n)} &nbsp; & Up
            </span>
          </label>
        ))}
        <button className="text-xs text-blue-600 mt-2" onClick={() => update("rating", null)}>
          Clear
        </button>
      </Section>

      {/* Prime */}
      <Section title="Prime" defaultOpen={false}>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prime}
            onChange={() => update("prime", prime ? null : "1")}
          />
          <span className="font-medium">Prime eligible</span>
        </label>
      </Section>

      {/* Deals / Discount */}
      <Section title="Deals & Discounts" defaultOpen={false}>
        {["50", "25", "10"].map((d) => (
          <label key={d} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="deals"
              checked={deals === d}
              onChange={() => update("deals", d)}
            />
            <span>{d}% off or more</span>
          </label>
        ))}
        <button className="text-xs text-blue-600 mt-2" onClick={() => update("deals", null)}>
          Clear
        </button>
      </Section>

      {/* Colors */}
      {facets.colors.length ? (
        <Section title="Color" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {facets.colors.slice(0, 32).map((c) => (
              <button
                key={c}
                className={`px-3 py-1 rounded-full border text-sm ${
                  selectedColors.has(c) ? "bg-accent" : "bg-white"
                }`}
                onClick={() => toggleMulti("color", c)}
              >
                {c}
              </button>
            ))}
          </div>
        </Section>
      ) : null}

      {/* Sizes */}
      {facets.sizes.length ? (
        <Section title="Size" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {facets.sizes.map((s) => (
              <button
                key={s}
                className={`px-3 py-1 rounded-md border text-sm ${
                  selectedSizes.has(s) ? "bg-accent" : "bg-white"
                }`}
                onClick={() => toggleMulti("size", s)}
              >
                {s}
              </button>
            ))}
          </div>
        </Section>
      ) : null}
    </aside>
  );
}
