"use client";
import Image from "next/image";
import { useCart } from "@/store/useCart";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { items, setQty, remove, total, clear } = useCart();
  const router = useRouter();

  const goCheckout = () => {
    if (!items.length) return;
    router.push("/checkout");
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        {items.length === 0 ? (
          <div className="card p-6">Your cart is empty.</div>
        ) : (
          items.map((i) => (
            <div key={i._id} className="card p-4 flex items-center gap-4">
              {i.image ? <Image src={i.image} alt={i.title} width={80} height={80} /> : null}
              <div className="flex-1">
                <div className="font-medium">{i.title}</div>
                <div className="text-gray-600">₹{(i.price/100).toFixed(2)}</div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number" className="input w-20"
                    value={i.quantity}
                    min={1}
                    onChange={(e) => setQty(i._id, Number(e.target.value))}
                  />
                  <button onClick={() => remove(i._id)} className="text-red-600">Remove</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="card p-6 h-fit">
        <div className="text-lg">Subtotal ({items.reduce((a,b)=>a+b.quantity,0)} items): <b>₹{(total()/100).toFixed(2)}</b></div>
        <button onClick={goCheckout} disabled={!items.length} className="btn-primary mt-4 w-full">Proceed to Checkout</button>
        <button onClick={clear} disabled={!items.length} className="btn mt-2 w-full border">Clear Cart</button>
      </div>
    </div>
  );
}
