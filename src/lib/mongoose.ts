// src/lib/mongoose.ts
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI!;
if (!uri) throw new Error("MONGODB_URI missing");

let cached = (global as any)._mongoose as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

if (!cached) {
  cached = (global as any)._mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    // Optional: helpful settings in dev
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(uri, {
      // dbName ko URI path me set kiya hua hai, yaha repeat nahi karna
      // serverSelectionTimeoutMS: 10000,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
