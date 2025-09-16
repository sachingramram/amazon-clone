// src/app/api/diag/db/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";

export async function GET() {
  try {
    await dbConnect();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
