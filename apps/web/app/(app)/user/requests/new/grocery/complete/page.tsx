// U8C apps/web/app/(app)/user/requests/new/grocery/complete/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GroceryCompletePage() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => {
      router.replace("/user?flash=requested");
    }, 3000);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main className="mx-auto max-w-[420px] space-y-3 p-6 text-center">
      <h2 className="text-2xl font-bold text-emerald-700">依頼が完了しました</h2>
      <p className="text-base text-gray-700">ありがとうございました。</p>
      <p className="text-base text-gray-700">数秒後にトップ画面へ自動で移動します…</p>
    </main>
  );
}
