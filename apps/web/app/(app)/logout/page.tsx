"use client";

import { useEffect, useMemo, useState } from "react";
// import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/Button";

export default function LogoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(() => searchParams.get("next") ?? "/supporter-login", [searchParams]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // ここで確実にサインアウト（直接 /logout に来た場合も対応）
    (async () => {
      try {
        await signOut(auth);
      } catch (e) {
        // 失敗しても画面は進める（既に未ログインの可能性）
        console.error("signOut failed:", e);
      } finally {
        setDone(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!done) return;
    // 数秒後に自動遷移（アクセシビリティ配慮で3秒）
    const id = setTimeout(() => {
      router.replace(next);
    }, 3000);
    return () => clearTimeout(id);
  }, [done, next, router]);

  return (
    <main className="mx-auto max-w-[360px] p-4">
      <h1 className="mb-4 text-lg font-semibold">ログアウトしました</h1>

      <div className="mb-5 rounded-lg border border-gray-200 bg-white p-4 leading-7">
        <p className="mb-1">ご利用ありがとうございました。</p>
        <p className="text-sm text-gray-600">
          {done ? "3秒後にログイン画面へ移動します。" : "ログアウト処理中です…"}
        </p>
      </div>

      <nav className="flex flex-col items-center gap-4">
        {/* 即時操作できる導線（自動遷移を待ちたくない場合） */}
        <Button href="/supporter-login" variant="s_primary" size="lg" equalWidth>
          ログイン画面へ
        </Button>
        {/* <Button href="/" variant="s_secondary" size="lg" equalWidth>
          トップページへ
        </Button> */}
      </nav>

      <p className="mt-6 text-center text-xs text-gray-500">
        自動で移動しない場合は、上のボタンを押してください。
      </p>
    </main>
  );
}
