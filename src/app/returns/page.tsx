import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import Order from "@/models/Order";

export default async function ReturnsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return <div className="card p-6">Please sign in to view returns.</div>;

  await dbConnect();
  const orders = await Order.find({ userId: (session.user as any).id }).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Returns & Orders</h1>
      {orders.length === 0 ? (
        <div className="card p-4">No orders yet.</div>
      ) : (
        orders.map((o: any) => (
          <div key={o._id} className="card p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">Order #{String(o._id)}</div>
              <div className="text-xs text-gray-600">Placed {new Date(o.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="badge">{o.status}</div>
          </div>
        ))
      )}
    </div>
  );
}
