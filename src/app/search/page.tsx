import ProductGrid from "@/components/products/ProductGrid";
import FilterSidebar from "@/components/filters/FilterSidebar";
import FiltersDrawer from "@/components/filters/FiltersDrawer";
import SortBar from "@/components/filters/SortBar";
import Pagination from "@/components/ui/Pagination";
import { dbConnect } from "@/lib/mongoose";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

const sortMap: Record<string, any> = {
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  rating: { "rating.rate": -1 },
  newest: { createdAt: -1 },
  best: { "rating.count": -1, "rating.rate": -1 },
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default async function SearchPage({ searchParams }: Props) {
  await dbConnect();

  const perPage = 24;
  const page = Math.max(1, Number(searchParams.page || 1));
  const skip = (page - 1) * perPage;

  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const filters: any = {};

  if (q) {
    const rx = new RegExp(escapeRegExp(q), "i");
    filters.$or = [{ title: rx }, { brand: rx }, { description: rx }, { category: rx }];
  }

  const asList = (key: string) =>
    (typeof searchParams[key] === "string" ? (searchParams[key] as string) : "")
      .split(",")
      .filter(Boolean);

  const brands = asList("brand");
  if (brands.length) filters.brand = { $in: brands };

  const colors = asList("color");
  if (colors.length) filters.colors = { $in: colors };

  const sizes = asList("size");
  if (sizes.length) filters.sizes = { $in: sizes };

  const rating = Number(searchParams.rating || 0);
  if (rating) filters["rating.rate"] = { $gte: rating };

  const prime = searchParams.prime === "1";
  if (prime) filters.primeEligible = true;

  const deals = Number(searchParams.deals || 0);
  if (deals) filters.discountPercent = { $gte: deals };

  const min = Number(searchParams.min || 0);
  const max = Number(searchParams.max || 0);
  if (min || max) {
    filters.price = {};
    if (min) filters.price.$gte = min * 100;
    if (max) filters.price.$lte = max * 100;
  }

  const sortKey = typeof searchParams.sort === "string" ? searchParams.sort : "relevance";
  const sort = sortMap[sortKey] || { createdAt: -1 };

  // Query + Count
  const [products, total] = await Promise.all([
    Product.find(filters).sort(sort).skip(skip).limit(perPage).lean(),
    Product.countDocuments(filters),
  ]);

  // Facets based on just the text query (broad)
  const baseQ: any = q
    ? {
        $or: [
          { title: new RegExp(escapeRegExp(q), "i") },
          { brand: new RegExp(escapeRegExp(q), "i") },
          { description: new RegExp(escapeRegExp(q), "i") },
          { category: new RegExp(escapeRegExp(q), "i") },
        ],
      }
    : {};

  const [brandsFacet, colorsFacet, sizesFacet, minmax] = await Promise.all([
    Product.distinct("brand", baseQ),
    Product.distinct("colors", baseQ),
    Product.distinct("sizes", baseQ),
    Product.aggregate([
      { $match: Object.keys(baseQ).length ? baseQ : {} },
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
        {q ? (
          <>
            Search results for: <b>{q}</b>
          </>
        ) : (
          "All Products"
        )}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT: Filters */}
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
