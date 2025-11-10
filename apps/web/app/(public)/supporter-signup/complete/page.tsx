// app/(public)/supporter-signup/complete/page.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function SignupCompletePage() {
  const router = useRouter();

  // 数秒表示後に「justSignedUp=1」を付けてトップへ遷移
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/supporter?justSignedUp=1");
    }, 5000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="mx-auto max-w-[420px] p-6">
      <div className="space-y-5 rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-lg leading-relaxed text-emerald-900 shadow-sm">
        <p className="font-semibold">登録申請を受け付けました。</p>
      </div>
      <p>ご登録ありがとうございます。内容を確認のうえ、本人確認を進めます。</p>
      <p>完了までは、一部機能がご利用いただけません。</p>
      <p className="text-base text-emerald-800">数秒後にトップ画面へ自動で移動します…</p>

      <div className="mt-10 flex justify-center">
        {/* 手動遷移でも同じクエリを付ける */}
        <Button
          href="/supporter?justSignedUp=1"
          variant="s_primary"
          size="lg"
          equalWidth
          className="max-w-xs"
        >
          トップ画面へ
        </Button>
      </div>
    </main>
  );
}
