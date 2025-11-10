// S6 apps/web/app/(app)/supporter/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { fetchOrders } from "@/lib/api/orders";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

/** 本人確認状態（S6はここでボタンの活性/非活性を制御） */
type VerifyStatus = "unverified" | "pending" | "verified";

/** お知らせの種類（電話して／完了報告して） */
type NoticeType = "call_needed" | "report_needed";

/** お知らせカード1枚分 */
type Notice = {
  kind: NoticeType;
  job: {
    id: string;
    title: string;
    date: string;
    time: string;
    place: string;
    note?: string;
  };
};

export default function SupporterHome() {
  const router = useRouter();
  const sp = useSearchParams();

  // ← ここを可変にして、着地時に "pending" を立てる
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("verified");
  const [notices, setNotices] = useState<Notice[]>([]);
  const isPending = verifyStatus === "pending";

  // justSignedUp=1 で来たら本人確認中（パターン4）を一度だけ表示し、URLをクリーンに戻す
  useEffect(() => {
    if (sp.get("justSignedUp") === "1") {
      setVerifyStatus("pending");
      // URL からクエリを除去（履歴を汚さない）
      router.replace("/supporter", { scroll: true });
    }
    // sp は参照が変わることがあるため toString で依存
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp?.toString(), router]);

  const verified = verifyStatus === "verified";

  // --- 日付を「10月12日(日)」形式に変換する関数 ---
  function formatJapaneseDate(isoString: string) {
    const date = new Date(isoString);
    const options: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
      weekday: "short"
    };
    return date.toLocaleDateString("ja-JP", options);
  }

  // API接続で引受履歴を取得（verified のときだけでもOKだが、そのままでも可）
  useEffect(() => {
    async function loadOrders() {
      try {
        const orders = await fetchOrders();
        const filtered = orders.filter((req) => ["matched", "confirmed"].includes(req.status));

        const notices: Notice[] = filtered.map((req) => ({
          kind: req.status === "matched" ? "call_needed" : "report_needed",
          job: {
            id: String(req.id),
            title: req.title,
            date: formatJapaneseDate(req.scheduledDate),
            time: `${req.scheduledStartTime ?? ""}〜${req.scheduledEndTime ?? ""}`,
            place: req.workLocation1,
            note: req.description
          }
        }));

        setNotices(notices);
      } catch (err) {
        console.error("引受履歴の取得に失敗しました:", err);
      }
    }

    loadOrders();
  }, []);

  return (
    <main className="mx-auto max-w-[360px] p-4">
      <div className="flex items-center justify-center py-10">
        <Image src="/logo.png" alt="ちょこっと" width={240} height={72} priority />
      </div>

      {/* 本人確認中メッセージ（パターン4） */}
      {verifyStatus === "pending" && (
        <div className="mb-5 rounded-lg border border-gray-300 bg-white p-4 text-sm leading-6">
          <p className="mb-2">本人確認中です。</p>
          <p className="text-gray-700">確認が終わるまで依頼リストはご利用いただけません。</p>
        </div>
      )}

      {/* お知らせカード（複数枚想定／パターン2・3） */}
      {verified && notices.length > 0 && (
        <ul className="mb-5 space-y-3 whitespace-pre-line">
          {notices.map((n, i) => {
            const href =
              n.kind === "call_needed"
                ? `/supporter/jobs/${n.job.id}?view=accepted`
                : `/supporter/jobs/${n.job.id}?view=report`;

            const isCall = n.kind === "call_needed";
            const cardBorder = isCall ? "border-amber-300" : "border-emerald-300";
            const headerColor = isCall ? "text-amber-700" : "text-emerald-700";

            return (
              <li key={`${n.job.id}-${i}`}>
                <Link
                  href={href}
                  className={`block rounded-lg border ${cardBorder} bg-white p-4 shadow-sm`}
                >
                  <p className={`mb-2 font-bold ${headerColor}`}>
                    {isCall
                      ? "電話をしてください\n詳細確認・報告はこちらから"
                      : "完了報告をしてください\n詳細確認・報告はこちらから"}
                  </p>
                  <dl className="text-sm leading-6 text-gray-800">
                    <div>
                      <dt className="inline">依頼ID：</dt>
                      <dd className="inline">{n.job.id}</dd>
                    </div>
                    <div>
                      <dt className="inline">内容：</dt>
                      <dd className="inline">{n.job.title}</dd>
                    </div>
                    <div>
                      <dt className="inline">日程：</dt>
                      <dd className="inline">{n.job.date}</dd>
                    </div>
                    <div>
                      <dt className="inline">時間：</dt>
                      <dd className="inline">{n.job.time}</dd>
                    </div>
                    <div>
                      <dt className="inline">場所：</dt>
                      <dd className="inline">{n.job.place}</dd>
                    </div>
                    {n.job.note && (
                      <div>
                        <dt className="inline">メモ：</dt>
                        <dd className="inline">{n.job.note}</dd>
                      </div>
                    )}
                  </dl>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* ボタン群（必要に応じて pending のとき disable も可能） */}
      <nav className="flex flex-col items-center gap-5">
        {isPending ? (
          <Button
            variant="s_primary"
            size="lg"
            equalWidth
            disabled
            aria-disabled
            tabIndex={-1}
            className="cursor-not-allowed opacity-60"
          >
            依頼リストを見る
          </Button>
        ) : (
          <Button href="/supporter/jobs?tab=open" variant="s_primary" size="lg" equalWidth>
            依頼リストを見る
          </Button>
        )}
        <Button href="/supporter/profile" variant="s_primary" size="lg" equalWidth>
          登録情報の確認
        </Button>
        <Button href="supporter/contact" variant="s_primary" size="lg" equalWidth>
          問い合わせる
        </Button>
        <Button href="/logout" variant="s_secondary" size="lg" equalWidth>
          ログアウト
        </Button>
      </nav>
    </main>
  );
}
