import ProductGrid from "@/components/products/ProductGrid";
import FilterSidebar from "@/components/filters/FilterSidebar";
import FiltersDrawer from "@/components/filters/FiltersDrawer";
import SortBar from "@/components/filters/SortBar";
import Pagination from "@/components/ui/Pagination";
import { dbConnect } from "@/lib/mongoose";
import Product from "@/models/Product";

type Props = {
  params: { category: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export const dynamic = "force-dynamic";

const sortMap: Record<string, any> = {
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  rating: { "rating.rate": -1 },
  newest: { createdAt: -1 },
  best: { "rating.count": -1, "rating.rate": -1 },
};

export default async function CategoryPage({ params, searchParams }: Props) {
  await dbConnect();

  const cat = (params.category || "all").toLowerCase();

  const perPage = 24;
  const page = Math.max(1, Number(searchParams.page || 1));
  const skip = (page - 1) * perPage;

  // Build filters from query
  const filters: any = {};
  if (cat !== "all" && cat !== "best-sellers") {
    filters.category = new RegExp(`^${cat}$`, "i");
  }

  // Helpers
  const asList = (key: string) =>
    (typeof searchParams[key] === "string" ? (searchParams[key] as string) : "")
      .split(",")
      .filter(Boolean);

  // Multi-selects
  const brands = asList("brand");
  if (brands.length) filters.brand = { $in: brands };

  const colors = asList("color");
  if (colors.length) filters.colors = { $in: colors };

  const sizes = asList("size");
  if (sizes.length) filters.sizes = { $in: sizes };

  // Scalars
  const rating = Number(searchParams.rating || 0);
  if (rating) filters["rating.rate"] = { $gte: rating };

  const prime = searchParams.prime === "1";
  if (prime) filters.primeEligible = true;

  const deals = Number(searchParams.deals || 0);
  if (deals) filters.discountPercent = { $gte: deals };

  // Price (Rupees → minor units)
  const min = Number(searchParams.min || 0);
  const max = Number(searchParams.max || 0);
  if (min || max) {
    filters.price = {};
    if (min) filters.price.$gte = min * 100;
    if (max) filters.price.$lte = max * 100;
  }

  // Sorting (special-case best-sellers default)
  const sortKey =
    typeof searchParams.sort === "string"
      ? searchParams.sort
      : cat === "best-sellers"
      ? "best"
      : "relevance";
  const sort = sortMap[sortKey] || { createdAt: -1 };

  // Query + Count
  const [products, total] = await Promise.all([
    Product.find(filters).sort(sort).skip(skip).limit(perPage).lean(),
    Product.countDocuments(filters),
  ]);

  // Facets based on category (broad like Amazon)
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
        {/* LEFT: Filters (drawer on mobile + static on desktop) */}
        <div className="col-span-12 md:col-span-3 space-y-4">
          <FiltersDrawer facets={facets} />
          <div className="hidden md:block">
            <FilterSidebar facets={facets} />
          </div>
        </div>

        {/* RIGHT: Results */}
        <div className="col-span-12 md:col-span-9 space-y-3">
          <SortBar total={total} />
          <ProductGrid products={JSON.parse(JSON.stringify(products))} />
          <Pagination total={total} perPage={perPage} />
        </div>
      </div>
    </div>
  );
}
