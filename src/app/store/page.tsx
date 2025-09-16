import ProductGrid from "@/components/products/ProductGrid";
import { dbConnect } from "@/lib/mongoose";
import Product from "@/models/Product";

export default async function HomePage() {
  await dbConnect();
  const products = await Product.find().limit(24).lean();
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-topbar text-white p-4">Free delivery on your first order • Shop smart</div>
      <ProductGrid products={JSON.parse(JSON.stringify(products))} />
    </div>
  );
}
