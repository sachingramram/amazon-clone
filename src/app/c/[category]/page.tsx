import ProductGrid from "@/components/products/ProductGrid";
import FilterSidebar from "@/components/filters/FilterSidebar";
import FiltersDrawer from "@/components/filters/FiltersDrawer";
import SortBar from "@/components/filters/SortBar";
import Pagination from "@/components/ui/Pagination";
import { dbConnect } from "@/lib/mongoose";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

type SortSpec = Record<string, 1 | -1>;

const sortMap: Record<string, SortSpec> = {
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  rating: { "rating.rate": -1 },
  newest: { createdAt: -1 },
  best: { "rating.count": -1, "rating.rate": -1 },
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  const sp = await searchParams;

  await dbConnect();

  const cat = (category || "all").toLowerCase();
  const perPage = 24;
  const page = Math.max(1, Number(sp.page || 1));
  const skip = (page - 1) * perPage;

  // ---- Filters from query ----
  const filters: Record<string, unknown> = {};
  if (cat !== "all" && cat !== "best-sellers") {
    filters.category = new RegExp(`^${cat}$`, "i");
  }

  const asList = (key: string) =>
    (typeof sp[key] === "string" ? (sp[key] as string) : "")
      .split(",")
      .filter(Boolean);

  const brands = asList("brand");
  if (brands.length) filters.brand = { $in: brands };

  const colors = asList("color");
  if (colors.length) filters.colors = { $in: colors };

  const sizes = asList("size");
  if (sizes.length) filters.sizes = { $in: sizes };

  const rating = Number(sp.rating || 0);
  if (rating) filters["rating.rate"] = { $gte: rating };

  const prime = sp.prime === "1";
  if (prime) filters.primeEligible = true;

  const deals = Number(sp.deals || 0);
  if (deals) filters.discountPercent = { $gte: deals };

  const min = Number(sp.min || 0);
  const max = Number(sp.max || 0);
  if (min || max) {
    const p: Record<string, number> = {};
    if (min) p.$gte = min * 100;
    if (max) p.$lte = max * 100;
    filters.price = p;
  }

  const sortKey =
    typeof sp.sort === "string"
      ? sp.sort
      : cat === "best-sellers"
      ? "best"
      : "relevance";
  const sort: SortSpec = sortMap[sortKey] || { createdAt: -1 };

  // ---- Query + Count ----
  const [products, total] = await Promise.all([
    Product.find(filters).sort(sort).skip(skip).limit(perPage).lean(),
    Product.countDocuments(filters),
  ]);

  // ---- Facets (broad, by category) ----
  const baseMatch =
    cat === "all" || cat === "best-sellers"
      ? {}
      : { category: new RegExp(`^${cat}$`, "i") };

  const [brandsFacet, colorsFacet, sizesFacet, minmax] = await Promise.all([
    Product.distinct("brand", baseMatch),
    Product.distinct("colors", baseMatch),
    Product.distinct("sizes", baseMatch),
    Product.aggregate([
      { $match: Object.keys(baseMatch).length ? baseMatch : {} },
      { $group: { _id: null, minPrice: { $min: "$price" }, maxPrice: { $max: "$price" } } },
    ]),
  ]);

  const facets = {
    brands: (brandsFacet as string[]).filter(Boolean).sort().slice(0, 50),
    colors: ((colorsFacet as string[]).filter(Boolean) as string[]).slice(0, 50),
    sizes: ((sizesFacet as string[]).filter(Boolean) as string[]).slice(0, 20),
    priceMin: minmax[0]?.minPrice ?? 0,
    priceMax: minmax[0]?.maxPrice ?? 0,
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-topbar text-white p-4">
        {cat === "all"
          ? "All Products"
          : cat === "best-sellers"
          ? "Best Sellers"
          : cat[0].toUpperCase() + cat.slice(1)}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT */}
        <div className="col-span-12 md:col-span-3 space-y-4">
          <FiltersDrawer facets={facets} />
          <div className="hidden md:block">
            <FilterSidebar facets={facets} />
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-span-12 md:col-span-9 space-y-3">
          <SortBar total={total} />
          <ProductGrid products={JSON.parse(JSON.stringify(products))} />
          <Pagination total={total} perPage={perPage} />
        </div>
      </div>
    </div>
  );
}
