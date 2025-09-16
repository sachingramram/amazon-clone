import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Amazon Clone",
  icons: {
    icon: "/download.png?v=2", 
  },
  description: "A learning project – Amazon-like store with Next.js, MongoDB, NextAuth, Stripe",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
        {/* Top nav */}
        
        <Header session={session} />
        <main className="flex-1 container-px py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
