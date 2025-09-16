import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import Order from "@/models/Order";
import Image from "next/image";

type OrdersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const sp = await searchParams;

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return <div className="card p-6">Please sign in to view your orders.</div>;
  }

  await dbConnect();
  const orders = await Order.find({ userId: (session.user as any).id })
    .sort({ createdAt: -1 })
    .lean();

  const success = sp.success === "1";
  const orderId = typeof sp.orderId === "string" ? sp.orderId : undefined;

  return (
    <div className="space-y-4">
      {success && (
        <div className="card p-4 bg-green-50 border-green-200">
          <div className="font-semibold text-green-700">Payment successful</div>
          <div className="text-sm text-green-700">
            Your order {orderId ? <b>#{orderId}</b> : null} has been placed.
          </div>
        </div>
      )}

      <h1 className="text-xl font-semibold">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="card p-4">No orders yet.</div>
      ) : (
        orders.map((o: any) => (
          <div key={o._id} className="card p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium">Order #{String(o._id)}</div>
              <div className="badge">{o.status}</div>
            </div>

            <div className="text-xs text-gray-600">
              Placed on {new Date(o.createdAt).toLocaleString()} • Total ₹
              {(o.amount / 100).toFixed(2)} • {o.payment?.method?.toUpperCase()} • ****
              {o.payment?.last4 || "0000"}
            </div>

            <div className="space-y-2">
              {o.items.map((i: any, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  {i.image && (
                    <Image
                      src={i.image}
                      alt={i.title}
                      width={56}
                      height={56}
                      className="rounded-md object-contain"
                    />
                  )}
                  <div className="flex-1">
                    <div className="text-sm">{i.title}</div>
                    <div className="text-xs text-gray-600">Qty: {i.quantity}</div>
                  </div>
                  <div className="text-sm font-medium">
                    ₹{((i.price * i.quantity) / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}