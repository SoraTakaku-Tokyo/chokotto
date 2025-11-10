// app/(public)/supporter-login/page.tsx
"use client";

import React, { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/lib/auth/authContext";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

type FirebaseKnownCode =
  | "auth/invalid-credential"
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/too-many-requests"
  | "auth/invalid-email";

interface CustomFirebaseError {
  code?: string;
  message?: string;
}

function toFriendlyMessage(err: unknown): string {
  const e = err as CustomFirebaseError | undefined;
  const code = e?.code as FirebaseKnownCode | undefined;

  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "メールアドレスまたはパスワードが間違っています。";
    case "auth/too-many-requests":
      return "試行回数が多すぎます。しばらく時間をおいて再度お試しください。";
    case "auth/invalid-email":
      return "メールアドレスの形式が正しくありません。";
    default:
      return "ログイン中にエラーが発生しました。時間をおいて再度お試しください。";
  }
}

export default function SupporterLoginPage() {
  const router = useRouter();
  const { auth, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 既にログイン済みならサポータートップへ
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/supporter");
    }
  }, [user, isLoading, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const mail = email.trim();
      await signInWithEmailAndPassword(auth, mail, password);
      // 成功後の画面遷移は useEffect に任せる
    } catch (err: unknown) {
      console.error("ログインエラー:", err);
      setError(toFriendlyMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-[var(--public-bg, #f5f7f8)] flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        {/* <h1 className="mb-6 text-center text-2xl font-extrabold text-gray-800">
          サポーター ログイン
        </h1> */}
        <div className="flex items-center justify-center py-10">
          <Image src="/logo.png" alt="ちょこっと" width={240} height={72} priority />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-left text-sm font-medium text-gray-700"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 p-3 text-base focus:border-teal-500 focus:ring-teal-500"
              placeholder="example@supporter.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-left text-sm font-medium text-gray-700"
            >
              パスワード
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3 pr-12 text-base focus:border-teal-500 focus:ring-teal-500"
                placeholder="パスワードを入力"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                aria-label={showPw ? "パスワードを隠す" : "パスワードを表示"}
              >
                {showPw ? "隠す" : "表示"}
              </button>
            </div>
          </div>

          {error && (
            <p
              className="rounded-md border border-red-200 bg-red-50 p-2 text-left text-sm text-red-700"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </p>
          )}

          {/* ログイン & 新規登録への導線 */}
          <div className="space-y-3">
            <Button type="submit" className="w-full" variant="s_primary" disabled={isLoading}>
              {isLoading ? "処理中..." : "ログイン"}
            </Button>

            {/* 新規登録へ：S1のURLに遷移 */}
            <Link href="/supporter-signup/email-password" className="block">
              <Button type="button" className="w-full" variant="s_secondary">
                はじめての方（新規登録）
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
