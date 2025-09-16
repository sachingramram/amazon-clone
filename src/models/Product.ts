import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    image: String,
    price: { type: Number, required: true }, // minor units
    category: String,
    brand: String,
    colors: [String],
    sizes: [String],
    primeEligible: { type: Boolean, default: false },
    discountPercent: { type: Number, default: 0 }, // 0..90
    rating: { rate: Number, count: Number },
  },
  { timestamps: true }
);

export type ProductDoc = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string;
  price: number;
  category?: string;
  brand?: string;
  colors?: string[];
  sizes?: string[];
  primeEligible?: boolean;
  discountPercent?: number;
  rating?: { rate?: number; count?: number };
};

export default models.Product || model("Product", ProductSchema);
