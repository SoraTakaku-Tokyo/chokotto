// S10 apps/web/app/(app)/supporter/jobs/[id]/report/page.tsx
"use client";

import { Button } from "@/components/ui/Button";

export default function ReportDonePage() {
  // API接続後：実際はこのページに到達する前にPOST完了している想定
  return (
    <main className="mx-auto max-w-[420px] p-4">
      <h1 className="mb-3 text-lg font-semibold">お疲れさまでした！</h1>

      <section className="mb-6 rounded-lg border bg-white p-4 text-sm leading-6">
        <p>完了報告を受け取りました。</p>
        <p>ぜひまた他の依頼も引き受けてみてくださいね。</p>
      </section>

      <div className="flex justify-center">
        <Button href="/supporter" variant="s_secondary" size="lg" equalWidth>
          ホームに戻る
        </Button>
      </div>
    </main>
  );
}
