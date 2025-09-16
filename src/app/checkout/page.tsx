"use client";

import { useCart } from "@/store/useCart";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clear } = useCart();

  const [form, setForm] = useState({
    name: "",
    email: "",
    address1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    cardNumber: "",
    exp: "",
    cvc: "",
  });
  const [loading, setLoading] = useState(false);
  const amount = useMemo(() => total(), [total]);

  const onPay = async () => {
    if (!items.length) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items,
          shipping: {
            name: form.name,
            email: form.email,
            address1: form.address1,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
          },
          payment: {
            cardNumber: form.cardNumber,
            exp: form.exp,
            cvc: form.cvc,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Payment failed");
      clear();
      router.replace(`/orders?success=1&orderId=${data.orderId}`);
    } catch (e: any) {
      alert(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return <div className="card p-6">Your cart is empty.</div>;
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-3">Contact</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="input" placeholder="Full name" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})}/>
            <input className="input" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})}/>
          </div>
        </div>

        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-3">Shipping Address</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="input sm:col-span-2" placeholder="Address line" value={form.address1} onChange={(e)=>setForm({...form, address1:e.target.value})}/>
            <input className="input" placeholder="City" value={form.city} onChange={(e)=>setForm({...form, city:e.target.value})}/>
            <input className="input" placeholder="State" value={form.state} onChange={(e)=>setForm({...form, state:e.target.value})}/>
            <input className="input" placeholder="Postal code" value={form.postalCode} onChange={(e)=>setForm({...form, postalCode:e.target.value})}/>
            <input className="input" placeholder="Country" value={form.country} onChange={(e)=>setForm({...form, country:e.target.value})}/>
          </div>
        </div>

        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-3">Payment</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            <input className="input sm:col-span-2" placeholder="Card number (dummy)" value={form.cardNumber} onChange={(e)=>setForm({...form, cardNumber:e.target.value})}/>
            <input className="input" placeholder="MM/YY" value={form.exp} onChange={(e)=>setForm({...form, exp:e.target.value})}/>
            <input className="input" placeholder="CVC" value={form.cvc} onChange={(e)=>setForm({...form, cvc:e.target.value})}/>
          </div>
          <button onClick={onPay} disabled={loading} className="btn-primary mt-4">
            {loading ? "Processing..." : `Pay ₹${(amount/100).toFixed(2)}`}
          </button>
          <p className="text-xs text-gray-500 mt-2">This is a demo checkout. No real payment is processed.</p>
        </div>
      </div>

      {/* Summary */}
      <div className="card p-4 h-fit">
        <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
        <div className="space-y-3">
          {items.map((i)=>(
            <div key={i._id} className="flex items-center gap-3">
              {i.image && <Image src={i.image} alt={i.title} width={56} height={56} className="rounded-md object-contain" />}
              <div className="flex-1">
                <div className="text-sm line-clamp-2">{i.title}</div>
                <div className="text-xs text-gray-600">Qty: {i.quantity}</div>
              </div>
              <div className="text-sm font-medium">₹{((i.price*i.quantity)/100).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-3 flex justify-between">
          <span>Subtotal</span>
          <span>₹{(amount/100).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
