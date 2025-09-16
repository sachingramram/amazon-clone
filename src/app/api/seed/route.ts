import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import Product from "@/models/Product";

export const dynamic = "force-dynamic";

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
function r(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rid(len = 6) { return Math.random().toString(36).slice(2, 2 + len); }

const CATEGORIES = ["electronics","mobiles","fashion","home","appliances","beauty","grocery","toys","books","sports"];
const BRANDS = ["Apple","Samsung","Sony","OnePlus","JBL","boAt","HP","Dell","Lenovo","Canon","Nikon","ASUS","Logitech","Xiaomi","Realme","Puma","Nike","Adidas","Philips","Panasonic"];
const COLORS = ["Black","White","Blue","Red","Green","Grey","Silver","Gold","Purple"];
const SIZES  = ["XS","S","M","L","XL","XXL"];
const ADJ = ["Premium","Smart","Ultra","Pro","Lite","Max","Eco","Classic","Wireless","Compact","Portable","Turbo","Swift","Aero","Prime"];
const NOUN = ["Headphones","Earbuds","Speaker","Laptop","Keyboard","Mouse","Monitor","Camera","Smartwatch","Backpack","Sneakers","Jacket","Cookware","Blender","Vacuum","Chair","Lamp","Notebook","Novel","Tripod","Power Bank","Charger","SSD","Router","Phone","T-Shirt","Hoodie"];

const UNSPLASH = [
  "https://images.unsplash.com/photo-1511367461989-f85a21fda167",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
  "https://images.unsplash.com/photo-1512496015851-a90fb38ba796",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4",
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353",
  "https://images.unsplash.com/photo-1518770660439-4636190af475",
  "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77",
  
];

const img = "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const qCount = Number(url.searchParams.get("count"));
  let body: any = {};
  try { body = await req.json(); } catch {}

  const count = Math.min(300, Number(body?.count ?? qCount ?? 120));
  const drop = Boolean(body?.drop ?? (url.searchParams.get("drop") === "true"));

  await dbConnect();
  if (drop) await Product.deleteMany({});

  const docs = Array.from({ length: count }).map(() => {
    const title = `${pick(ADJ)} ${pick(NOUN)}`;
    const slug  = `${slugify(title)}-${rid(6)}`;
    const category = pick(CATEGORIES);
    const brand = pick(BRANDS);
    const colors = Array.from(new Set(Array.from({ length: r(1,3) }, () => pick(COLORS))));
    const sizes  = category === "fashion" ? Array.from(new Set(Array.from({ length: r(1,3) }, () => pick(SIZES)))) : [];
    const priceMajor = r(199, 59999); // ₹199 – ₹59,999
    const primeEligible = Math.random() < 0.6;
    const discountPercent = [0,0,10,15,20,25,30,40,50][r(0,8)];
    const rate = Math.round((Math.random() * 1.5 + 3.5) * 10) / 10; // 3.5–5.0
    const countRatings = r(25, 8000);

    return {
      title,
      slug,
      description: `Buy ${title} by ${brand} in ${category}. Available colors: ${colors.join(", ")}.`,
      image: img,
      price: priceMajor * 100,
      category,
      brand,
      colors,
      sizes,
      primeEligible,
      discountPercent,
      rating: { rate, count: countRatings },
    };
  });

  const created = await Product.insertMany(docs, { ordered: false });
  return NextResponse.json({ inserted: created.length }, { status: 201 });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const count = Math.min(300, Number(url.searchParams.get("count") ?? 120));
  const drop = url.searchParams.get("drop") === "true";
  return POST(new Request(url.toString(), {
    method: "POST",
    body: JSON.stringify({ count, drop }),
    headers: { "content-type": "application/json" },
  }));
}
