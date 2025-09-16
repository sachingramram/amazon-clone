import Image from "next/image";
import { dbConnect } from "@/lib/mongoose";
import Product from "@/models/Product";
import type { ProductDoc } from "@/models/Product"; // ← use your model's type
import { notFound } from "next/navigation";
import AddToCart from "./AddToCart";

type Props = { params: { id: string } };

export default async function ProductPage({ params }: Props) {
  await dbConnect();

  // Tell TS what we're expecting back from Mongoose
  const product = (await Product.findById(params.id).lean().exec()) as ProductDoc | null;
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
        {product.description ? (
          <p className="text-sm text-gray-600 mt-2">{product.description}</p>
        ) : null}
        <div className="text-2xl font-bold mt-4">₹{(product.price / 100).toFixed(2)}</div>

        {/* pass a plain object to the client component */}
        <AddToCart product={JSON.parse(JSON.stringify(product))} />
      </div>
    </div>
  );
}
