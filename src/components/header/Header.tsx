// src/components/header/Header.tsx
import type { Session } from "next-auth";
import HeaderClient from "./HeaderClient";

export default function Header({ session }: { session: Session | null }) {
  const user = session?.user
    ? {
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      }
    : null;

  return <HeaderClient user={user} />;
}
