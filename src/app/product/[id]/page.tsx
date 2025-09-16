import Image from "next/image";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/mongoose";
import Product from "@/models/Product";
import type { ProductDoc } from "@/models/Product";
import AddToCart from "./AddToCart";

type ProductPageProps = {
  params: Promise<{ id: string }>; // Next 15: params/searchParams are Promises
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  await dbConnect();

  const product = (await Product.findById(id).lean().exec()) as ProductDoc | null;
  if (!product) return notFound();

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white p-4 rounded-lg">
        {product.image && (
          <Image
            src={product.image}
            alt={product.title}
            width={600}
            height={600}
            className="w-full h-auto object-contain"
          />
        )}
      </div>

      <div>
        <h1 className="text-2xl font-semibold">{product.title}</h1>

        {product.description && (
          <p className="text-sm text-gray-600 mt-2">{product.description}</p>
        )}

        <div className="text-2xl font-bold mt-4">
          ₹{(product.price / 100).toFixed(2)}
        </div>

        {/* pass a plain object across the server/client boundary */}
        <AddToCart product={JSON.parse(JSON.stringify(product))} />
      </div>
    </div>
  );
}