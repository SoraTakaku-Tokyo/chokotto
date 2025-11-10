// apps/web/app/RouteThemeBodyClass.tsx

"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const USER_PREFIXES = ["/user"];
const SUPPORTER_PREFIXES = ["/supporter", "/supporter-login", "/supporter-signup"];

export default function RouteThemeBodyClass() {
  const pathname = usePathname();

  useEffect(() => {
    const body = document.body;
    const removeAll = () => body.classList.remove("theme-user", "theme-supporter", "user"); // 旧 "user" も念のため

    removeAll();

    if (USER_PREFIXES.some((p) => pathname.startsWith(p))) {
      body.classList.add("theme-user");
    } else if (SUPPORTER_PREFIXES.some((p) => pathname.startsWith(p))) {
      body.classList.add("theme-supporter");
    }
    return removeAll;
  }, [pathname]);

  return null;
}
