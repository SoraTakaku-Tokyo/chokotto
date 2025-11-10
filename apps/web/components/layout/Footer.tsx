"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type FooterProps = { hidden?: boolean };

export default function Footer({ hidden }: FooterProps) {
  const pathname = usePathname();
  if (hidden) return null;

  // 利用者/サポーターでトップを出し分け。その他ルートは非リンク（画像のみ）
  const homeHref = pathname?.startsWith("/user")
    ? "/user"
    : pathname?.startsWith("/supporter")
      ? "/supporter"
      : null;

  return (
    <footer className={`app-footer w-full border-t-0 bg-inherit`}>
      {/* "justify-start"→左 / "justify-center"→中央 / "justify-end"→右 */}
      <div className="mx-auto flex w-full max-w-none items-center justify-start px-4 py-5 md:px-6">
        {homeHref ? (
          <Link href={homeHref} className="inline-flex items-center gap-2 py-1.5">
            <Image
              src="/logo.png"
              alt="アプリロゴ"
              width={200}
              height={60}
              className="h-9 w-auto md:h-10"
              priority
              sizes="(min-width: 768px) 160px, 144px"
            />
            <span className="sr-only">ホームへ</span>
          </Link>
        ) : (
          <div className="inline-flex items-center gap-2 py-1.5" aria-label="アプリロゴ">
            <Image
              src="/logo.png"
              alt=""
              width={200}
              height={60}
              className="h-9 w-auto md:h-10"
              priority
              sizes="(min-width: 768px) 160px, 144px"
            />
          </div>
        )}
        {/* 右側に要素を置くなら ml-auto を付ける */}
        {/* <nav className="ml-auto">…</nav> */}
      </div>

      <div className="h-[env(safe-area-inset-bottom)]" />
    </footer>
  );
}
