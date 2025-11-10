// U7 apps/web/app/(app)/user/requests/new/grocery/manual/other/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type GroceryDraft = {
  date?: string;
  start?: string;
  end?: string;
  place?: string;
  note?: string; // ← 任意入力
};

const DRAFT_KEY = "groceryDraft";

export default function U7OtherTextInputPage() {
  const router = useRouter();
  const [note, setNote] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  // 既存値ロード
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft: GroceryDraft = JSON.parse(raw);
      if (draft.note) setNote(draft.note);
    } catch {}
  }, []);

  // 保存→次へ（U8: 確認）
  const onNext = () => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      const prev: GroceryDraft = raw ? JSON.parse(raw) : {};
      const next = { ...prev, note: note.trim() };
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } catch {}
    router.push("/user/requests/new/grocery/manual/confirm");
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      {/* ★ 上部固定（背景＝ページ色） */}
      <div className="sticky top-0 z-10 -mx-6 border-b border-[var(--card-border)] bg-[var(--user-bg)] px-6 py-4">
        <StepList current="other" />
      </div>

      {/* 見出し：大きめ */}
      <h2 className="text-2xl font-bold">その他</h2>

      {/* 白枠なし・幅いっぱい */}
      <div className="space-y-4">
        <p className="text-base text-gray-700">
          買い物リストや注意事項などがあれば入力してください
          <br />
          ※入力しなくても次へ進めます
        </p>

        {/* <label htmlFor="note" className="block text-lg font-medium">
          その他メモ（任意）
        </label> */}
        <textarea
          id="note"
          ref={taRef}
          rows={5}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="例）牛乳は低脂肪乳　など"
          className="w-full resize-none rounded-lg border border-gray-300 bg-white p-3 text-lg outline-none focus:border-gray-400"
        />
      </div>

      {/* 通常配置ボタン（固定しない） */}
      <div className="space-y-4 pb-[env(safe-area-inset-bottom)]">
        <Button variant="u_primary" size="block" onClick={onNext}>
          次へ
        </Button>
        <Button variant="u_tertiary" size="block" href="/user/requests/new/grocery/manual/shop">
          前のページにもどる
        </Button>
      </div>
    </div>
  );
}

/* ---- UI parts（縦並び ➜ / □・文字大きめ、背景に馴染む） ---- */
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
