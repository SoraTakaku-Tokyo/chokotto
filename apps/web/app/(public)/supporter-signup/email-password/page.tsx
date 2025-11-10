// S1 app/(public)/supporter-signup/email-password/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import StepHeader from "@/components/supporter-signup/StepHeader";
import StepFooter from "@/components/supporter-signup/StepFooter";

export default function SignupEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  // 追加：パスワード表示トグル
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleNext() {
    if (loading) return; // 連打防止
    if (password !== confirm) {
      alert("パスワードが一致しません。");
      return;
    }
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      router.push("/supporter-signup"); // S2 へ
    } catch (err: unknown) {
      console.error(err);
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message)
          : "登録に失敗しました。時間をおいて再度お試しください。";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <StepHeader step={1} title="アカウントを作成" />
      <div className="mt-6 space-y-4 text-lg">
        <div>
          <label htmlFor="email" className="block font-medium">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            className="mt-1 w-full rounded border p-2"
            placeholder="例：sample@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            inputMode="email"
          />
        </div>

        <div>
          <label htmlFor="pw" className="block font-medium">
            パスワード
          </label>
          <div className="relative">
            <input
              id="pw"
              type={showPw ? "text" : "password"}
              className="mt-1 w-full rounded border p-2 pr-16"
              placeholder="6文字以上"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
              aria-label={showPw ? "パスワードを隠す" : "パスワードを表示"}
            >
              {showPw ? "隠す" : "表示"}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="pw2" className="block font-medium">
            パスワード（確認）
          </label>
          <div className="relative">
            <input
              id="pw2"
              type={showConfirm ? "text" : "password"}
              className="mt-1 w-full rounded border p-2 pr-16"
              placeholder="6文字以上"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
              aria-label={showConfirm ? "確認用パスワードを隠す" : "確認用パスワードを表示"}
            >
              {showConfirm ? "隠す" : "表示"}
            </button>
          </div>
        </div>
      </div>

      <StepFooter
        onNext={handleNext}
        nextLabel={loading ? "登録中..." : "次へ進む"}
        showBack={false}
      />
    </>
  );
}
