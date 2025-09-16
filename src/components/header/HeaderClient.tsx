"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import SearchBar from "./SearchBar";
import CartButton from "./CartButton";
import { signIn, signOut } from "next-auth/react";

type UserLite = { name?: string | null; image?: string | null } | null;

export default function HeaderClient({ user }: { user: UserLite }) {
  const [open, setOpen] = useState(false);

  const doSignIn = async () => {
    // close drawer first (mobile), then kick off OAuth
    setOpen(false);
    // if you only use Google:
    await signIn("google");
    // if you have multiple providers, use: await signIn();
  };

  const doSignOut = async () => {
    setOpen(false);
    await signOut();
  };

  return (
    <header className="bg-topbar text-white">
      {/* Top row */}
      <div className="container-px py-3 flex items-center gap-3">
        {/* Hamburger (mobile) */}
        <button
          className="md:hidden -ml-2 p-2 rounded-md hover:bg-white/10"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <Menu />
        </button>

        {/* Logo */}
        <Link href="/" className="text-xl font-bold">
          a<span className="text-accent">mz</span> clone
        </Link>

        {/* Desktop search */}
        <div className="hidden md:block flex-1">
          <SearchBar />
        </div>

        {/* Right side (desktop) */}
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/orders" className="text-sm">Returns &amp; Orders</Link>
          <CartButton />

          {user ? (
            <button
              type="button"
              className="flex items-center gap-2 text-sm hover:opacity-90"
              onClick={doSignOut}
            >
              {user.image && (
                <Image
                  src={user.image}
                  alt="me"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span>Sign out</span>
            </button>
          ) : (
            <button
              type="button"
              className="text-sm hover:opacity-90"
              onClick={doSignIn}
            >
              Sign in
            </button>
          )}
        </nav>

        {/* Cart (mobile quick access) */}
        <div className="md:hidden">
          <CartButton />
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden container-px pb-3">
        <SearchBar />
      </div>

      {/* Secondary nav (desktop only) */}
      <div className="hidden md:block bg-topbar2">
        <div className="container-px py-2 text-sm flex gap-4 overflow-x-auto">
          <Link href="/c/all">All</Link>
          <Link href="/c/best-sellers">Best Sellers</Link>
          <Link href="/c/mobiles">Mobiles</Link>
          <Link href="/c/fashion">Fashion</Link>
          <Link href="/c/electronics">Electronics</Link>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white text-gray-900 z-50 shadow-xl overflow-auto animate-slide-in">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="font-semibold">
                {user?.name ? `Hello, ${user.name.split(" ")[0]}` : "Welcome"}
              </div>
              <button
                className="p-2 rounded-md hover:bg-gray-100"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X />
              </button>
            </div>

            <nav className="p-2">
              <Link href="/c/all" className="block px-3 py-2 rounded-md hover:bg-gray-100" onClick={() => setOpen(false)}>All</Link>
              <Link href="/c/best-sellers" className="block px-3 py-2 rounded-md hover:bg-gray-100" onClick={() => setOpen(false)}>Best Sellers</Link>
              <Link href="/c/mobiles" className="block px-3 py-2 rounded-md hover:bg-gray-100" onClick={() => setOpen(false)}>Mobiles</Link>
              <Link href="/c/fashion" className="block px-3 py-2 rounded-md hover:bg-gray-100" onClick={() => setOpen(false)}>Fashion</Link>
              <Link href="/c/electronics" className="block px-3 py-2 rounded-md hover:bg-gray-100" onClick={() => setOpen(false)}>Electronics</Link>

              <div className="h-px bg-gray-200 my-2" />

              <Link href="/orders" className="block px-3 py-2 rounded-md hover:bg-gray-100" onClick={() => setOpen(false)}>
                Returns &amp; Orders
              </Link>

              {/* Auth actions inside drawer */}
              {user ? (
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                  onClick={doSignOut}
                >
                  Sign out
                </button>
              ) : (
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                  onClick={doSignIn}
                >
                  Sign in
                </button>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}