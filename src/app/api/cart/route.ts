import { NextResponse } from "next/server";

export async function GET() {
  // For simplicity, cart is client-side (Zustand). Keep endpoint if you later persist cart.
  return NextResponse.json({ ok: true });
}
