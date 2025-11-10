// S7 S12 apps/web/app/(app)/supporter/jobs/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { fetchRequests } from "@/lib/api/requests";
import { fetchOrders } from "@/lib/api/orders";

/* ===== 型 ===== */
type JobSummary = {
  id: string;
  title: string;
  person: string;
  remark?: string;
  date: string;
  timeWindow: string;
  duration: string;
  destination?: string;
  meetup?: string;
  note?: string;
};

// type HistoryItem = JobSummary & {
//   status: "completed" | "decline"; // 完了／辞退
// };

/* ===== モック（API接続時に置換） ===== */
// const mockOpen: JobSummary[] = [
//   {
//     id: "00001",
//     title: "買い物代行",
//     person: "○○区　70代 女性",
//     date: "2025年9月25日（木）",
//     timeWindow: "14:00〜16:00 の間で",
//     duration: "2時間",
//     destination: "行き先：スーパー○○店",
//     meetup: "集合場所：自宅"
//   },
//   {
//     id: "00002",
//     title: "掃除・片付け",
//     person: "△△区　80代 男性",
//     date: "2025年9月26日（金）",
//     timeWindow: "10:00〜12:00 の間で",
//     duration: "60分",
//     destination: "場所：居間",
//     meetup: "集合場所：自宅",
//     note: "本棚の整理"
//   }
// ];

// const mockHistory: HistoryItem[] = [
//   {
//     status: "done",
//     id: "00021",
//     title: "外出付き添い",
//     person: "○○1丁目　80代 女性",
//     remark: "耳がかなり遠いです。",
//     date: "2025年9月10日（水）",
//     timeWindow: "13:00〜15:00 の間で",
//     duration: "2時間",
//     destination: "外出先：中央総合病院",
//     meetup: "集合場所：自宅",
//     note: "ながくて二時間です"
//   },
//   {
//     status: "resigned",
//     id: "00022",
//     title: "話し相手",
//     person: "○○3丁目　80代 男性",
//     date: "2025年9月3日（水）",
//     timeWindow: "13:00〜15:00 の間で",
//     duration: "2時間",
//     destination: "外出先：中央総合病院",
//     meetup: "集合場所：自宅",
//     note: "ながくて二時間です"
//   }
// ];

/* ===== ここからページ本体 ===== */
type TabKey = "open" | "history";

export default function JobsPage() {
  const sp = useSearchParams();
  const raw = sp.get("tab");
  const current: TabKey = raw === "history" ? "history" : "open";

  const title = current === "history" ? "引受履歴" : "依頼リスト";

  // --- 状態管理 ---
  const [requests, setRequests] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 日付を「10月12日(日)」形式に変換する関数 ---
  function formatJapaneseDate(isoString: string) {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
      month: "long", // 例: "10月"
      day: "numeric", // 例: "12日"
      weekday: "short" // 例: "(日)"
    };
    return date.toLocaleDateString("ja-JP", options);
  }

  // --- 初回読み込みでAPI呼び出し ---
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        if (current === "open") {
          // ★依頼リスト取得
          const data = await fetchRequests("supporter");
          const formatted: JobSummary[] = data.map((req) => ({
            id: String(req.id),
            title: req.title,
            person: `${req.user.address1}　${req.user.ageGroup}　${req.user.gender ?? ""}`,
            remark: req.user.bio,
            date: formatJapaneseDate(req.scheduledDate),
            timeWindow: `${req.scheduledStartTime ?? ""}〜${req.scheduledEndTime ?? ""}`,
            duration: req.scheduledDurationMinutes ? `${req.scheduledDurationMinutes}分` : "",
            destination: req.workLocation1,
            meetup: req.workLocation2,
            note: req.description
          }));
          setRequests(formatted);
        } else {
          // ★引受履歴取得
          const data = await fetchOrders();
          const formatted: JobSummary[] = data.map((req) => ({
            id: String(req.id),
            title: req.title,
            person: `${req.user.address1}　${req.user.ageGroup}　${req.user.gender ?? ""}`,
            remark: req.user.bio,
            date: formatJapaneseDate(req.scheduledDate),
            timeWindow: `${req.scheduledStartTime ?? ""}〜${req.scheduledEndTime ?? ""}`,
            duration: req.scheduledDurationMinutes ? `${req.scheduledDurationMinutes}分` : "",
            destination: req.workLocation1,
            meetup: req.workLocation2,
            note: req.description
          }));
          setRequests(formatted);
        }
      } catch (err) {
        console.error(err);
        setError("データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [current]);

  return (
    <main className="mx-auto max-w-[420px] p-4">
      {/* タイトル */}
      <h1 className="mb-3 text-lg font-semibold">{title}</h1>

      {/* 右寄せのホームボタン */}
      <div className="mb-4 flex justify-end">
        <Button href="/supporter" variant="s_secondary" size="sm">
          ホームに戻る
        </Button>
      </div>

      {/* --- ローディング表示 --- */}
      {loading && <p className="text-center text-gray-500">読み込み中です...</p>}

      {/* --- エラー表示 --- */}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* ------- 募集中（S7相当） ------- */}
      {!loading && !error && current === "open" && (
        <ul className="space-y-4">
          {requests.map((j) => (
            <li key={j.id}>
              <Link
                href={`/supporter/jobs/${j.id}?view=confirm`}
                className="block rounded-lg border border-amber-300 bg-white p-4 shadow-sm transition hover:shadow"
              >
                <p className="mb-1 text-sm text-gray-500">依頼ID：{j.id}</p>
                <h2 className="mb-2 text-base font-semibold">{j.title}</h2>

                <div className="text-sm leading-6 text-gray-800">
                  <p>{j.person}</p>
                  {j.remark && <p>{j.remark}</p>}
                  <div className="mt-2">
                    <p>{j.date}</p>
                    <p>
                      {j.timeWindow}
                      <span className="ml-2">{j.duration}</span>
                    </p>
                  </div>
                  {j.destination && <p className="mt-2">{j.destination}</p>}
                  {j.meetup && <p>{j.meetup}</p>}
                  {j.note && <p className="mt-2">{j.note}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* ------- 引受履歴（S12相当） ------- */}
      {!loading && !error && current === "history" && (
        <ul className="space-y-4">
          {requests.map((h) => (
            <li key={h.id} className="rounded-lg border border-gray-200 bg-white p-0 shadow-sm">
              {/* ステータスバッジ */}
              <div
                className={`w-max rounded-b px-3 py-1 text-sm font-medium ${
                  h.oderStatus === "completed"
                    ? "border-b border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-b border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {h.oderStatus === "completed" ? "完了" : "辞退"}
              </div>

              {/* 本体カード */}
              <div className="p-4">
                <p className="mb-1 text-sm text-gray-500">依頼ID：{h.id}</p>
                <h2 className="mb-2 text-base font-semibold">{h.title}</h2>

                <div className="text-sm leading-6 text-gray-800">
                  <p>{h.person}</p>
                  {h.remark && <p>{h.remark}</p>}
                  <div className="mt-2">
                    <p>{h.date}</p>
                    <p>
                      {h.timeWindow}
                      <span className="ml-2">{h.duration}</span>
                    </p>
                  </div>
                  {h.destination && <p className="mt-2">{h.destination}</p>}
                  {h.meetup && <p>{h.meetup}</p>}
                  {h.note && <p className="mt-2">{h.note}</p>}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
