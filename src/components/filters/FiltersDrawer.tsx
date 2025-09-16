"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import FilterSidebar from "./FilterSidebar";

type Facets = {
  brands: string[];
  colors: string[];
  sizes: string[];
  priceMin: number;
  priceMax: number;
};

export default function FiltersDrawer({ facets }: { facets: Facets }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger (mobile only) */}
      <div className="md:hidden flex justify-end">
        <button
          className="btn border"
          onClick={() => setOpen(true)}
          aria-label="Open filters"
        >
          <SlidersHorizontal size={16} />
          <span className="ml-2 text-sm">Filters</span>
        </button>
      </div>

      {/* Drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 shadow-xl
                       overflow-auto animate-slide-in"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="font-semibold">Filters</div>
              <button
                className="p-2 rounded-md hover:bg-gray-100"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
              >
                <X />
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar facets={facets} />
            </div>
          </div>
        </>
      )}
    </>
  );
}
