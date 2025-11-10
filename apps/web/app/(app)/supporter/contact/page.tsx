// S14 apps/web/app/(app)/supporter/contact/page.tsx
"use client";

import { Button } from "@/components/ui/Button";

export default function SupporterContactPage() {
  return (
    <main className="mx-auto max-w-[420px] p-4">
      <h1 className="mb-3 text-lg font-semibold">お問い合わせ</h1>

      <section className="mb-5 rounded-lg border bg-white p-4 text-sm leading-7 text-gray-800">
        <p className="mb-3">
          依頼内容について連絡がある時は、<strong>利用者に直接お電話</strong>してください。
        </p>
        <p className="mb-3">以下のような場合には、下記の連絡先にお電話ください。</p>
        <ul className="list-disc pl-5">
          <li>操作方法が分からない</li>
          <li>登録情報を変更したい</li>
          <li>その他、システムや運用に関する問い合わせ</li>
        </ul>
      </section>

      <section className="mb-6 rounded-lg border border-amber-100 bg-amber-50 p-4 text-sm leading-7">
        <p className="mb-3 text-center font-medium">問い合わせ先</p>

        <div className="space-y-1">
          <p>〇〇社会福祉協議会</p>
          <p>
            電話番号：{" "}
            <a href="tel:9999999999" className="underline">
              999-9999-9999
            </a>
          </p>
          <p>月〜金曜　〇時〜〇時</p>
          <p>担当：〇〇</p>
        </div>
      </section>

      <div className="flex justify-center">
        <Button href="/supporter" variant="s_secondary" size="sm">
          ホームに戻る
        </Button>
      </div>
    </main>
  );
}
