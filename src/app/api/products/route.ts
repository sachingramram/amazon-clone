import { dbConnect } from "@/lib/mongoose";
import Product from "@/models/Product";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  const products = await Product.find().lean();
  return NextResponse.json(products);
}

// (Optionally add POST for seeding products)
export async function POST(req: Request) {
  await dbConnect();
  const body = await req.json();
  const created = await Product.create(body);
  return NextResponse.json(created, { status: 201 });
}
