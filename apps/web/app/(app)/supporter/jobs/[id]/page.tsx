// S8 S9 apps/web/app/(app)/supporter/jobs/[id]/page.tsx
"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { fetchSupporterRequestDetail } from "@/lib/api/supporter/requests";
import { createOrder } from "@/lib/api/supporter/orders";
import { updateOrderStatus } from "@/lib/api/orders";
// import { useParams } from "next/navigation";

type JobDetail = {
  id: string;
  title: string;
  date: string;
  timeWindow: string;
  duration: string;
  meetup?: string;
  areaLine: string;
  whoLine?: string;
  shortNote?: string;
  fullPerson?: string;
  address?: string;
  phoneNumber?: string;
  userImageUrl?: string;
  longNote?: string;
  workLocation1?: string;
};

export default function JobPage({ params }: { params: { id: string } }) {
  const sp = useSearchParams();
  const view = (sp.get("view") ?? "confirm") as "confirm" | "accepted" | "report";

  // ▼ 追加：カード枠のトーン決定
  const cardBorder = view === "report" ? "border-emerald-300" : "border-amber-300";

  const router = useRouter();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const pageTitle = useMemo(() => (view === "confirm" ? "依頼詳細" : "引受依頼詳細"), [view]);
  const resignHref = `/supporter/jobs/${params.id}/resign`;

  // 追加：flash検知 → バナー表示 → URLからflash削除（履歴は置換）
  const flash = sp.get("flash");
  useEffect(() => {
    if (flash === "accepted") {
      setNotice("この依頼を引き受けました！");
      // URLから flash を除去（再描画されても notice は state に残る）
      router.replace(`/supporter/jobs/${params.id}?view=accepted`, { scroll: false });
    }
  }, [flash, params.id, router]);

  useEffect(() => {
    // APIから取得
    async function fetchJob() {
      setLoading(true);
      setError(null);
      try {
        // lib/api/supporter/requests.ts 経由でAPIを呼び出す
        const data = await fetchSupporterRequestDetail(Number(params.id));

        const dateObj = new Date(data.scheduledDate);
        const weekDays = ["日", "月", "火", "水", "木", "金", "土"];
        const week = weekDays[dateObj.getDay()];

        // ----------------------------------------
        // ★ 依頼情報（フロントで常に使う部分）
        // ----------------------------------------
        const baseInfo = {
          id: String(data.id),
          title: data.title,
          date: `${dateObj.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
          })}(${week})`,
          timeWindow: `${data.scheduledStartTime}〜${data.scheduledEndTime}`,
          longNote: data.description ?? "",
          workLocation1: data.workLocation1 ?? "",
          duration: ""
        };

        // ----------------------------------------
        // ★ 利用者情報（open / 引受済 で出し分け）
        //   - data.user：サーバーの整形済み user 情報
        // ----------------------------------------
        const requestUser = data.user ?? {};

        // 名前情報が送られてきている ⇒ 自分が引き受けている
        let isAccepted = false;

        if (requestUser.familyName) {
          isAccepted = true;
        }

        const jobDetail: JobDetail = {
          ...baseInfo,

          // open 状態
          meetup: data.workLocation2 ?? "",
          areaLine: requestUser.address1 ?? "",
          whoLine: `${requestUser.ageGroup ?? ""} ${requestUser.gender ?? ""}`,
          shortNote: requestUser.bio ?? "",

          // 引受済の場合だけ個人情報
          fullPerson: isAccepted
            ? `${requestUser.familyName ?? ""} ${requestUser.firstName ?? ""} さん（${requestUser.familyNameKana ?? ""} ${requestUser.firstNameKana ?? ""}）`
            : undefined,

          address: isAccepted
            ? [requestUser.address1, requestUser.address2].filter(Boolean).join(" ")
            : undefined,

          phoneNumber: isAccepted ? (requestUser.phoneNumber ?? "") : undefined,

          userImageUrl: isAccepted ? requestUser.profileImageUrl || "/user.png" : undefined
        };

        setJob(jobDetail);
      } catch (err) {
        console.error("Error fetching job detail:", err);
        setError("依頼が見つかりませんでした。");
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [params.id, view]);

  // S8: 引き受ける
  async function handleAccept() {
    try {
      setSubmitting(true);

      // API接続：受注新規登録
      await createOrder(Number(job!.id));

      router.replace(`/supporter/jobs/${job!.id}?view=accepted&flash=accepted`);
    } catch {
      setError("引き受け処理でエラーが発生しました。");
    } finally {
      setSubmitting(false);
    }
  }

  // S9: 電話しました → 通知 → confirmedへ
  async function handleCalled() {
    console.log("☎️ handleCalled 発火しました");
    try {
      setSubmitting(true);

      // API接続：受注ステータスを "confirmed" に更新
      await updateOrderStatus(Number(job!.id), "confirmed");

      setNotice("電話報告を確認しました\n「ホームに戻る」ボタンでお戻りください");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        router.replace(`/supporter/jobs/${job!.id}?view=confirmed`);
      }, 1200);
    } catch {
      setError("更新に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setSubmitting(false);
    }
  }

  // S9: 完了報告する → 通知 → S10へ
  async function handleReport() {
    try {
      setSubmitting(true);

      // ★API接続：受注ステータスを "completed" に更新
      await updateOrderStatus(Number(job!.id), "completed");

      setNotice("完了報告を送信しました");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        router.replace(`/supporter/jobs/${job!.id}/report`);
      }, 1200);
    } catch {
      setError("完了報告の送信に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-[420px] p-4">
      <h1 className="mb-3 text-lg font-semibold">{pageTitle}</h1>

      {/* 通知バナー */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800"
        >
          <p className="whitespace-pre-line">{notice}</p>
        </div>
      )}

      {/* ヘルプ文 */}
      {view === "confirm" && (
        <p className="mb-3 text-sm text-gray-800">この依頼を引き受けますか？</p>
      )}
      {view === "accepted" && (
        <div className="mb-3 text-sm leading-6 text-gray-800">
          {/* <p>この依頼を引き受けました！</p> */}
          <p>利用者にお電話し、詳細を確認してください。</p>
          <p>お電話をした後は、「電話しました」ボタンを押してください。</p>
          <p>2回お電話しても繋がらない場合は、依頼を辞退しても構いません。</p>
        </div>
      )}
      {view === "report" && (
        <p className="mb-3 text-sm text-emerald-700">
          依頼完了後は、「完了報告をする」ボタンを押してください。
        </p>
      )}
      {/* 読み込み／エラー */}
      {loading && <p className="text-gray-600">読み込み中…</p>}
      {error && (
        <p className="mb-3 text-red-600">
          {error}{" "}
          <Button href="/supporter" variant="s_secondary" size="lg" equalWidth>
            ホームに戻る
          </Button>
        </p>
      )}

      {/* カード（viewで表示内容を切替） */}
      {job && !loading && (
        <section className={`mb-5 rounded-lg border ${cardBorder} bg-white p-4 shadow-sm`}>
          <p className="mb-1 text-sm text-gray-500">依頼ID：{job.id}</p>
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-base font-semibold">{job.title}</h2>
          </div>

          {/* S8: 簡略 */}
          {view === "confirm" && (
            <div className="text-sm leading-6 text-gray-800">
              <p>
                {job.areaLine}
                {job.whoLine ? ` ${job.whoLine}` : ""}
              </p>
              {job.shortNote && <p>{job.shortNote}</p>}
              <div className="mt-2">
                <p>{job.date}</p>
                <p>
                  {job.timeWindow}
                  <span className="ml-2">{job.duration}</span>
                </p>
              </div>
              {job.meetup && <p>集合場所：{job.meetup}</p>}
              {job.workLocation1 && <p>場所：{job.workLocation1}</p>}
              {job.longNote && <p className="mt-2">メモ：{job.longNote}</p>}
            </div>
          )}

          {/* S9: 詳細 */}
          {view !== "confirm" && (
            <div className="text-sm leading-6 text-gray-800">
              {job.fullPerson ? (
                <p>{job.fullPerson}</p>
              ) : (
                <p>
                  {job.areaLine}
                  {job.whoLine ? ` ${job.whoLine}` : ""}
                </p>
              )}
              {job.address && <p>住所：{job.address}</p>}
              {job.phoneNumber && <p>電話：{job.phoneNumber}</p>}
              {job.shortNote && <p>{job.shortNote}</p>}
              {job.userImageUrl && (
                <div className="my-2">
                  <Image
                    src={job.userImageUrl}
                    alt="利用者の写真"
                    width={112}
                    height={112}
                    className="h-28 w-28 rounded object-cover"
                  />
                </div>
              )}
              <div className="mt-2">
                <p>{job.date}</p>
                <p>
                  {job.timeWindow}
                  <span className="ml-2">{job.duration}</span>
                </p>
              </div>
              {job.meetup && <p>集合場所：{job.meetup}</p>}
              {job.workLocation1 && <p>場所：{job.workLocation1}</p>}
              {job.longNote && <p className="mt-2">メモ：{job.longNote}</p>}
            </div>
          )}
        </section>
      )}

      {/* アクション */}
      <div className="flex flex-col items-center gap-3">
        {view === "confirm" && (
          <Button
            onClick={handleAccept}
            disabled={!job || submitting || !!notice}
            loading={submitting}
            variant="s_primary"
            size="lg"
            equalWidth
          >
            依頼を引き受ける
          </Button>
        )}

        {view === "accepted" && (
          <>
            <Button
              onClick={handleCalled}
              /*disabled={!job || !!notice}*/
              disabled={!job}
              loading={submitting}
              variant="s_primary"
              size="lg"
              equalWidth
              type="button"
            >
              電話しました
            </Button>
            <Button href={resignHref} variant="s_secondary" size="lg" equalWidth>
              この依頼を辞退する
            </Button>
          </>
        )}

        {view === "report" && (
          <>
            <Button
              onClick={handleReport}
              disabled={!job || !!notice}
              loading={submitting}
              variant="s_primary"
              size="lg"
              equalWidth
              type="button"
            >
              完了報告をする
            </Button>

            <Button href={resignHref} variant="s_secondary" size="lg" equalWidth>
              この依頼を辞退する
            </Button>
          </>
        )}

        <div className="flex justify-center">
          <Button href="/supporter" variant="s_secondary" size="lg" equalWidth>
            ホームに戻る
          </Button>
        </div>
      </div>
    </main>
  );
}
