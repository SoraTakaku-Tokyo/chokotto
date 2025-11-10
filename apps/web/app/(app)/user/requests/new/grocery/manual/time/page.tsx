// U5 apps/web/app/(app)/user/requests/new/grocery/manual/time/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

/* --- helpers --- */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  return h * 60 + m;
}
function toHHMM(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

/* --- types / const --- */
type GroceryDraft = {
  date?: string;
  start?: string; // HH:MM
  end?: string; // HH:MM
  place?: string;
  note?: string;
};

const DRAFT_KEY = "groceryDraft";

// 営業時間・刻み
const BUSINESS_START = "09:00";
const BUSINESS_END = "18:00";
const STEP_MIN = 30; // 分

type PickerTarget = "start" | "end" | null;

export default function U5TimeTextInputPage() {
  const router = useRouter();
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPicker, setShowPicker] = useState<PickerTarget>(null);

  const pickerContainerRef = useRef<HTMLDivElement>(null);

  // 09:00〜18:00 を 30分刻みで生成（両端含む）
  const timeOptions = useMemo<string[]>(() => {
    const res: string[] = [];
    const startMin = toMinutes(BUSINESS_START);
    const endMin = toMinutes(BUSINESS_END);
    for (let m = startMin; m <= endMin; m += STEP_MIN) res.push(toHHMM(m));
    return res;
  }, []);

  // 初期値（ドラフト優先／なければ 09:00〜18:00）
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft: GroceryDraft = JSON.parse(raw);
        setStart(draft.start && timeOptions.includes(draft.start) ? draft.start : BUSINESS_START);
        setEnd(draft.end && timeOptions.includes(draft.end) ? draft.end : BUSINESS_END);
      } else {
        setStart(BUSINESS_START);
        setEnd(BUSINESS_END);
      }
    } catch {
      setStart(BUSINESS_START);
      setEnd(BUSINESS_END);
    }
  }, [timeOptions]);

  // 範囲OK（開始 < 終了）
  const isRangeOk = useMemo(() => {
    if (!start || !end) return false;
    return toMinutes(start) < toMinutes(end);
  }, [start, end]);

  // モーダルを開いたら現在選択位置へスクロール
  useEffect(() => {
    if (!showPicker) return;
    const targetValue = showPicker === "start" ? start : end;
    const el = pickerContainerRef.current;
    if (!el) return;
    const btn = targetValue
      ? el.querySelector<HTMLButtonElement>(`button[data-value="${targetValue}"]`)
      : null;
    if (btn) {
      setTimeout(() => {
        btn.scrollIntoView({ block: "center" });
        btn.focus();
      }, 0);
    }
  }, [showPicker, start, end]);

  const onChoose = (val: string) => {
    if (showPicker === "start") {
      setStart(val);
      // 終了が開始以下なら次スロットへ自動調整
      if (!end || toMinutes(end) <= toMinutes(val)) {
        const nextIdx = timeOptions.findIndex((t) => t === val) + 1;
        if (nextIdx < timeOptions.length) setEnd(timeOptions[nextIdx]);
      }
    } else if (showPicker === "end") {
      setEnd(val);
      // 開始が終了以上なら前スロットへ自動調整
      if (!start || toMinutes(start) >= toMinutes(val)) {
        const idx = timeOptions.findIndex((t) => t === val) - 1;
        if (idx >= 0) setStart(timeOptions[idx]);
      }
    }
    setError("");
    setShowPicker(null);
  };

  const onNext = () => {
    if (!start || !end) {
      setError("時間を選択してください");
      return;
    }
    if (!isRangeOk) {
      setError("開始は終了より早い時刻にしてください");
      return;
    }
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      const prev: GroceryDraft = raw ? JSON.parse(raw) : {};
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...prev, start, end }));
    } catch {}
    router.push("/user/requests/new/grocery/manual/shop");
  };

  return (
    <div className="mx-auto min-w-0 max-w-md space-y-6 overflow-x-hidden">
      <div className="sticky top-0 z-10 border-b border-[var(--card-border)] bg-[var(--user-bg)] py-4">
        <StepList current="time" />
      </div>

      <h2 className="text-2xl font-bold">時間は？</h2>

      <div className="space-y-4">
        <p className="text-base text-gray-700">
          ご希望を教えてください。
          <br />
          <span className="text-sm text-gray-500">（09:00〜18:00 の間、30分単位で指定）</span>
        </p>

        {/* 現在の選択を表示 */}
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-center gap-x-1 gap-y-2">
          <div className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 md:text-lg">
            {start || "— —"}
          </div>
          <span className="px-0.5 text-sm leading-none text-gray-600">〜</span>
          <div className="rounded-lg border border-gray-300 bg-white px-3 py-3 text-base text-gray-900 md:text-lg">
            {end || "— —"}
          </div>
          <span className="shrink-0 whitespace-nowrap px-0.5 text-sm leading-none text-gray-600">
            の間
          </span>
        </div>

        {/* 2行ボタン（開始／終了のピッカーを開く） */}
        <div className="grid min-w-0 grid-cols-2 gap-3">
          <Button
            variant="u_secondary"
            size="block_tight"
            onClick={() => setShowPicker("start")}
            className="leading-snug"
          >
            <span className="whitespace-nowrap">開始時間を</span>
            <br aria-hidden />
            <span>選ぶ</span>
          </Button>
          <Button
            variant="u_secondary"
            size="block_tight"
            onClick={() => setShowPicker("end")}
            className="leading-snug"
          >
            <span className="whitespace-nowrap">終了時間を</span>
            <br aria-hidden />
            <span>選ぶ</span>
          </Button>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {error}
          </p>
        )}
      </div>

      <div className="space-y-4 pb-[env(safe-area-inset-bottom)]">
        <Button variant="u_primary" size="block" onClick={onNext}>
          次へ
        </Button>
        <Button variant="u_tertiary" size="block" href="/user/requests/new/grocery/manual/date">
          前のページにもどる
        </Button>
      </div>

      {/* ==== モーダルピッカー ==== */}
      {showPicker && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={showPicker === "start" ? "開始時間を選択" : "終了時間を選択"}
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          onClick={() => setShowPicker(null)}
        >
          {/* 背景 */}
          <div className="absolute inset-0 bg-black/30" />

          {/* パネル */}
          <div
            className="relative z-10 max-h-[80vh] w-full max-w-md overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-lg font-semibold">
                {showPicker === "start" ? "開始時間を選択" : "終了時間を選択"}
              </h3>
              <button
                onClick={() => setShowPicker(null)}
                className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
              >
                閉じる
              </button>
            </div>

            <PickerList
              ref={pickerContainerRef}
              values={
                showPicker === "start"
                  ? timeOptions.filter((t) => toMinutes(t) < toMinutes(end || BUSINESS_END))
                  : timeOptions.filter((t) => toMinutes(t) > toMinutes(start || BUSINESS_START))
              }
              selected={showPicker === "start" ? start : end}
              onChoose={onChoose}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- sub components ---- */
const PickerList = forwardRef<
  HTMLDivElement,
  {
    values: string[];
    selected?: string;
    onChoose: (val: string) => void;
  }
>(({ values, selected, onChoose }, ref) => {
  return (
    <div
      ref={ref}
      className="max-h-[60vh] overflow-y-auto px-2 py-2"
      role="listbox"
      aria-label="時間候補"
    >
      {values.map((t) => {
        const isSelected = selected === t;
        return (
          <button
            key={t}
            data-value={t}
            role="option"
            aria-selected={isSelected}
            onClick={() => onChoose(t)}
            className={[
              "mb-2 w-full rounded-lg border px-4 py-3 text-left text-base",
              isSelected
                ? "bg-[var(--user-tertiary-bg)]/10 border-[var(--user-tertiary-ring)]"
                : "border-gray-200 hover:border-[var(--user-tertiary-ring)] hover:bg-gray-50"
            ].join(" ")}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
});
PickerList.displayName = "PickerList";

/* ---- UI parts ---- */
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
