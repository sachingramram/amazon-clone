import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Product from "@/models/Product";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  // optional: return current user's orders
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ orders: [] });
  }
  await dbConnect();
  const orders = await Order.find({ userId: (session.user as any).id })
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = session?.user ? (session.user as any).id : "guest";

  const body = await req.json();
  const {
    items, // [{ _id, title, price, image, quantity }]
    shipping, // { name,email,address1,city,state,postalCode,country }
    payment,  // { cardNumber, exp, cvc } (dummy)
  } = body as any;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Empty cart" }, { status: 400 });
  }

  await dbConnect();

  // Recompute pricing on server (use DB prices for security)
  const ids = items.map((i: any) => i._id);
  const dbProducts = await Product.find({ _id: { $in: ids } }).lean();

  const lineItems = items.map((i: any) => {
    const dbp = dbProducts.find((p: any) => String(p._id) === String(i._id));
    const unit = dbp?.price ?? i.price ?? 0;
    return {
      productId: String(i._id),
      title: dbp?.title ?? i.title,
      price: unit,
      quantity: Number(i.quantity || 1),
      image: dbp?.image ?? i.image,
    };
  });

  const amount = lineItems.reduce((s: number, li: any) => s + li.price * li.quantity, 0);

  // Fake last4
  const raw = String(payment?.cardNumber || "");
  const last4 = raw.slice(-4) || "0000";

  const created = await Order.create({
    userId,
    items: lineItems,
    amount,
    currency: "INR",
    status: "paid",
    shipping: {
      name: shipping?.name || "",
      email: shipping?.email || "",
      address1: shipping?.address1 || "",
      city: shipping?.city || "",
      state: shipping?.state || "",
      postalCode: shipping?.postalCode || "",
      country: shipping?.country || "",
    },
    payment: {
      method: "card",
      last4,
    },
  });

  return NextResponse.json({ ok: true, orderId: String(created._id) }, { status: 201 });
}
