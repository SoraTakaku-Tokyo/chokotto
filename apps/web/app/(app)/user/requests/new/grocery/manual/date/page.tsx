// U4-1 apps/web/app/(app)/user/requests/new/grocery/manual/date/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type GroceryDraft = {
  date?: string; // YYYY-MM-DD
  start?: string;
  end?: string;
  place?: string;
  note?: string;
};

const DRAFT_KEY = "groceryDraft";

export default function U4DateTextInputPage() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [error, setError] = useState<string>("");
  const dateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft: GroceryDraft = JSON.parse(raw);
        if (draft.date) setDate(draft.date);
      }
    } catch {}
  }, []);

  const onNext = () => {
    if (!date) {
      setError("日付を選択してください");
      dateRef.current?.focus();
      dateRef.current?.reportValidity?.();
      return;
    }
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      const prev = raw ? JSON.parse(raw) : {};
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...prev, date }));
    } catch {}
    router.push("/user/requests/new/grocery/manual/time"); // U5へ
  };

  const openDatePicker = () => {
    const el = dateRef.current;
    el?.showPicker?.();
    el?.focus();
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      {/* 上部固定（縦並びステップ：文字大きめ） */}
      <div className="sticky top-0 z-10 -mx-6 border-b border-[var(--card-border)] bg-[var(--user-bg)] px-6 py-4">
        <StepList current="date" />
      </div>

      <h2 className="text-2xl font-bold">日にちは？</h2>

      {/* 説明＋入力（白枠なし・幅いっぱい） */}
      <div className="space-y-3">
        <p className="text-base text-gray-700">
          ご希望を教えてください。
          {/* 直接入力もしくは「カレンダーから選ぶ」こともできます。 */}
        </p>

        {/* <label className="block text-lg font-medium">日にち</label> */}
        <input
          ref={dateRef}
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setError("");
          }}
          className="date-white-icon w-full rounded-lg border border-gray-300 bg-white p-3 text-lg outline-none focus:border-gray-400"
          required
          aria-invalid={!!error}
          aria-describedby={error ? "date-error" : undefined}
        />

        {error && (
          <p
            id="date-error"
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {error}
          </p>
        )}

        <div className="pt-1">
          <Button variant="u_secondary" size="block" onClick={openDatePicker}>
            カレンダーから選ぶ
          </Button>
        </div>
      </div>

      {/* ▼ ボタン：カレンダーから選ぶ との間を拡げ、相互の間隔を統一 */}
      <div className="mt-6 space-y-4 pb-[env(safe-area-inset-bottom)]">
        <Button variant="u_primary" size="block" onClick={onNext}>
          次へ
        </Button>
        <Button variant="u_tertiary" size="block" href="/user/requests/new/grocery">
          前のページにもどる
        </Button>
      </div>

      {/* アイコン調整（ここを切り替え） */}
      <style jsx>{`
        /* 白にして目立たなくする（デフォルト） */
        .date-white-icon::-webkit-calendar-picker-indicator {
          filter: invert(1) brightness(2); /* 白寄り */
          opacity: 1;
        }
        /* 完全に隠したい場合は、入力に date-hide-icon を付け替え */
        .date-hide-icon::-webkit-calendar-picker-indicator {
          opacity: 0;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

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
