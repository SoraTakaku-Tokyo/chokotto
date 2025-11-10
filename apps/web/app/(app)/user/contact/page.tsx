// apps/web/app/(app)/user/contact/page.tsx

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useRouter, useSearchParams } from "next/navigation";

export default function UserContactPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "";

  const handleBack = () => {
    // 安全のため /user 配下のみ許可（オープンリダイレクト防止）
    if (redirectTo && redirectTo.startsWith("/user/")) {
      router.push(redirectTo);
      return;
    }
    // ブラウザ履歴があれば戻る、なければホーム
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/user");
    }
  };
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--user-fg)]">お問い合わせ</h2>

      {/* 説明カード */}
      <div className="rounded-2xl border border-[var(--card-border)] bg-white p-6 text-[1.125rem] leading-relaxed shadow-md md:text-[1.25rem]">
        <p className="mb-4 text-[var(--user-fg)]">
          依頼内容について連絡がある時は、<strong>サポーターさんに直接お電話</strong>してください。
        </p>
        <p className="mb-4 text-[var(--user-fg)]">
          以下のような場合には、下記の連絡先にお電話ください。
        </p>
        <ul className="ml-5 list-disc space-y-2 text-[var(--user-fg)]">
          <li>操作方法が分からない</li>
          <li>登録情報を変更したい</li>
          <li>その他、システムや運用に関する問い合わせ</li>
        </ul>
      </div>

      {/* 連絡先カード（背景を淡い黄色系に） */}
      <div className="rounded-2xl border border-[var(--card-border)] bg-[#FFF9EB] p-6 shadow-md">
        <h3 className="mb-4 text-center text-xl font-semibold text-[var(--user-fg)]">
          問い合わせ先
        </h3>

        <div className="space-y-4 text-[var(--user-fg)]">
          <p>○○社会福祉協議会</p>

          <p>
            電話番号：{" "}
            <Link href="tel:09999999999" className="font-semibold underline underline-offset-2">
              999-9999-9999
            </Link>
          </p>

          <p>月〜金曜　○時〜○時</p>
          <p>担当：○○</p>
        </div>
      </div>

      {/* 戻るボタン */}
      <div className="pt-2 text-center">
        <Button variant="u_tertiary" size="lg" equalWidth onClick={handleBack}>
          前の画面に戻る
        </Button>
      </div>
    </section>
  );
}
