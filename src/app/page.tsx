import ProductGrid from "@/components/products/ProductGrid";
import FiltersDrawer from "@/components/filters/FiltersDrawer";
import FilterSidebar from "@/components/filters/FilterSidebar";
import SortBar from "@/components/filters/SortBar";
import Pagination from "@/components/ui/Pagination";
import { dbConnect } from "@/lib/mongoose";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

export default async function Home() {
  await dbConnect();

  const perPage = 24;
  const [products, total] = await Promise.all([
    Product.find({}).sort({ createdAt: -1 }).limit(perPage).lean(),
    Product.countDocuments({}),
  ]);

  const [brandsFacet, colorsFacet, sizesFacet, minmax] = await Promise.all([
    Product.distinct("brand", {}),
    Product.distinct("colors", {}),
    Product.distinct("sizes", {}),
    Product.aggregate([{ $group: { _id: null, minPrice: { $min: "$price" }, maxPrice: { $max: "$price" } } }]),
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
      <div className="rounded-lg bg-topbar text-white p-4">All Products</div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-3 space-y-4">
          <FiltersDrawer facets={facets} />
          <div className="hidden md:block">
            <FilterSidebar facets={facets} />
          </div>
        </div>

        <div className="col-span-12 md:col-span-9 space-y-3">
          <SortBar total={total} />
          <ProductGrid products={JSON.parse(JSON.stringify(products))} />
          <Pagination total={total} perPage={perPage} />
        </div>
      </div>
    </div>
  );
}