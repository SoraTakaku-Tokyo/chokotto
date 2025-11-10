"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/lib/routes";

const tabs = [
  { href: routes.user.home, label: "利用者" },
  { href: routes.supporter.home, label: "サポーター" },
  { href: routes.supporterSignup.emailPassword, label: "サポーター登録" }
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2 border-b bg-gray-50 p-3">
      {tabs.map((t) => {
        const active = pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`rounded-full border px-3 py-1 text-sm ${
              active ? "bg-black text-white" : "bg-white hover:bg-gray-100"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
      <div className="ml-auto flex gap-2">
        <Link href={routes.home} className="px-3 py-1 text-sm underline">
          Home
        </Link>
        <Link href={routes.qr} className="px-3 py-1 text-sm underline">
          QR
        </Link>
      </div>
    </nav>
  );
}
