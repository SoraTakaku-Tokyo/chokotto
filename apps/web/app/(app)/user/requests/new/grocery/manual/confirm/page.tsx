// U8 apps/web/app/(app)/user/requests/new/grocery/manual/confirm/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { createRequest } from "@/lib/api/requests"; // ★ 追加

type GroceryDraft = {
  date?: string; // YYYY-MM-DD
  start?: string; // HH:MM
  end?: string; // HH:MM
  place?: string;
  note?: string;
};

const DRAFT_KEY = "groceryDraft";

export default function U8ConfirmRequestPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<GroceryDraft | null>(null);
  const [warn, setWarn] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ドラフト読込
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      setDraft(raw ? (JSON.parse(raw) as GroceryDraft) : {});
    } catch {
      setDraft({});
    }
  }, []);

  // 必須チェック
  const missing = useMemo(() => {
    if (!draft) return ["date", "start", "end", "place"];
    const m: string[] = [];
    if (!draft.date) m.push("date");
    if (!draft.start) m.push("start");
    if (!draft.end) m.push("end");
    // if (!draft.place) m.push("place");
    return m;
  }, [draft]);

  // 送信（APIレイヤー経由）
  const handleSubmit = async () => {
    if (!draft) return;
    if (missing.length > 0) {
      setWarn(`必須項目が未入力です：${humanizeMissing(missing)}。修正してください。`);
      return;
    }
    setWarn(null);
    setLoading(true);

    try {
      await createRequest({
        description: (draft.note ?? "").trim() || undefined,
        scheduledDate: draft.date!, // 例: "2025-10-24"
        scheduledStartTime: draft.start!, // 例: "09:00"
        scheduledEndTime: draft.end!, // 例: "12:00"
        location1: draft.place! // 例: "イオン◯◯店"
      });

      // 成功：ドラフト破棄 → 完了ページへ（完了ページで1.2秒後に /user?flash=requested へ）
      sessionStorage.removeItem(DRAFT_KEY);
      router.push("/user/requests/new/grocery/complete");
    } catch {
      setWarn("送信に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setLoading(false);
    }
  };

  if (!draft) return null;

  return (
    <div className="mx-auto max-w-md space-y-6">
      {/* stickyヘッダー（背景＝ページ色） */}
      <div className="sticky top-0 z-10 -mx-6 border-b border-[var(--card-border)] bg-[var(--user-bg)] px-6 py-4">
        <StepList current="other" />
      </div>

      <h2 className="text-2xl font-bold">入力お疲れ様でした！</h2>
      <p className="text-base text-gray-700">
        内容をご確認の上、「この内容で依頼する」ボタンを押してください。
      </p>

      {/* サマリー */}
      <div className="space-y-2 rounded-2xl border border-[var(--card-border)] bg-white p-4 shadow-sm">
        <h3 className="font-semibold">買い物代行</h3>
        <SummaryRow label="日にち">{draft.date ? formatJPDate(draft.date) : "未入力"}</SummaryRow>
        <SummaryRow label="時間">
          {draft.start && draft.end ? `${draft.start}〜${draft.end}の間` : "未入力"}
        </SummaryRow>
        <SummaryRow label="買い物先">{(draft.place ?? "").trim() || "指定なし"}</SummaryRow>
        <SummaryRow label="その他">{(draft.note ?? "").trim() || "指定なし"}</SummaryRow>
      </div>

      {/* 警告 */}
      {warn && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {warn}
        </p>
      )}

      {/* アクション */}
      <div className="space-y-4 pb-[env(safe-area-inset-bottom)]">
        <Button variant="u_primary" size="block" onClick={handleSubmit} loading={loading}>
          この内容で依頼する
        </Button>
        <Button variant="u_tertiary" size="block" href="/user/requests/new/grocery/manual/date">
          修正する
        </Button>
        <a
          href="/user/requests/new/grocery"
          className="block text-center text-sm text-gray-600 underline"
        >
          入力方法の選択に戻る
        </a>
      </div>
    </div>
  );
}

/* --- helpers / StepList --- */
function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="text-base">
      <span className="text-gray-500">{label}：</span>
      <span className="ml-1">{children}</span>
    </div>
  );
}
function formatJPDate(yyyy_mm_dd: string) {
  const [y, m, d] = yyyy_mm_dd.split("-").map((n) => parseInt(n, 10));
  const dt = new Date(y, m - 1, d);
  const youbi = "日月火水木金土".charAt(dt.getDay());
  return `${y}年${m}月${d}日（${youbi}）`;
}
function humanizeMissing(keys: string[]) {
  const map: Record<string, string> = {
    date: "日にち",
    start: "開始時間",
    end: "終了時間",
    place: "買い物先"
  };
  return keys.map((k) => map[k] ?? k).join("、");
}
function StepList({ current }: { current: "date" | "time" | "shop" | "other" }) {
  const steps = [
    { key: "date", label: "日にち" },
    { key: "time", label: "時間" },
    { key: "shop", label: "買い物先" },
    { key: "other", label: "その他" }
  ] as const;
  return (
    <div className="rounded-none bg-transparent p-0">
      <ul className="space-y-1 py-1 text-base" aria-label="進行状況">
        {steps.map((s) => {
          const isCurrent = s.key === current;
          return (
            <li key={s.key} className="flex items-center gap-2">
              <span className="w-4 text-center" aria-hidden="true">
                {isCurrent ? "➜" : "□"}
              </span>
              <span
                className={isCurrent ? "font-semibold" : ""}
                aria-current={isCurrent ? "step" : undefined}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
