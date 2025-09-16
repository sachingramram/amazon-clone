"use client";
import { useCart } from "@/store/useCart";
import { useState } from "react";

export default function AddToCart({ product }: { product: any }) {
  const add = useCart((s) => s.add);
  const [ok, setOk] = useState(false);

  const onAdd = () => {
    add({ _id: product._id, title: product.title, price: product.price, image: product.image });
    setOk(true);
    setTimeout(() => setOk(false), 1000);
  };

  return (
    <button onClick={onAdd} className="btn-primary mt-6">
      {ok ? "Added ✓" : "Add to Cart"}
    </button>
  );
}
