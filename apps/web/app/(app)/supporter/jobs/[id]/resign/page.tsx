// S11 apps/web/app/(app)/supporter/jobs/[id]/resign/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateOrderStatus } from "@/lib/api/orders";

export default function ResignConfirmPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const jobId = params.id;
  const detailHref = `/supporter/jobs/${jobId}?view=accepted`;

  async function handleConfirmResign() {
    try {
      setSubmitting(true);
      // ★API接続：受注ステータスを "decline" に更新
      await updateOrderStatus(Number(jobId), "decline");

      // ✅ 成功通知を表示してから遷移
      setNotice("辞退しました");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        router.replace("/supporter");
      }, 1200);
    } catch {
      setNotice("辞退に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-[420px] p-4">
      <h1 className="mb-3 text-lg font-semibold">引受を辞退します</h1>

      {/* 通知バナー（成功時） */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800"
        >
          {notice}
        </div>
      )}

      <section className="mb-6 rounded-lg border bg-white p-4 text-sm leading-6">
        <p className="mb-3">
          一度辞退すると、再度引き受けることができません。辞退してよろしいですか。
        </p>
        <p className="text-red-600">
          必ず利用者へ辞退する旨を電話で連絡をしてから、辞退ボタンを押してください。
        </p>
      </section>

      <div className="flex flex-col items-center gap-3">
        {/* <button
          onClick={handleConfirmResign}
          disabled={submitting || !!notice}
          className="w-56 rounded-lg bg-orange-300 px-4 py-3 font-medium shadow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "処理中…" : "この依頼を辞退する"}
        </button> */}
        <Button
          type="button"
          onClick={handleConfirmResign}
          disabled={submitting || !!notice}
          loading={submitting}
          variant="s_secondary"
          size="lg"
          equalWidth
        >
          この依頼を辞退する
        </Button>

        {/* <Link
          href={`/supporter/jobs/${jobId}?view=accepted`}
          className="w-56 rounded bg-amber-700 px-4 py-2 text-center text-sm font-medium text-white shadow hover:opacity-90"
        >
          依頼詳細に戻る
        </Link> */}
        <Button href={detailHref} variant="s_primary" size="lg" equalWidth>
          依頼詳細に戻る
        </Button>
      </div>
    </main>
  );
}
