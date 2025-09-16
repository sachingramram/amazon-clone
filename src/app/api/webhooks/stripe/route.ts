import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { dbConnect } from "@/lib/mongoose";
import Order from "@/models/Order";

export const runtime = "nodejs"; // ensure Node runtime
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const raw = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  await dbConnect();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const sessionId = session.id;
    const paymentIntentId = session.payment_intent;

    await Order.findOneAndUpdate(
      { stripeSessionId: sessionId },
      { status: "paid", stripePaymentIntentId: paymentIntentId }
    );
  }

  if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
    const session = event.data.object as any;
    await Order.findOneAndUpdate(
      { stripeSessionId: session.id },
      { status: "failed" }
    );
  }

  return NextResponse.json({ received: true });
}
