import "../globals.css";
import { ReactNode } from "react";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const metadata = {
    icons: {
    icon: "/public/image.png?v=2", // ya "/icon.png?v=2"
  },
  title: "Amazon Clone",
  description: "A learning project – Amazon-like store",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <Header session={session} />
        <main className="flex-1 container-px py-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
