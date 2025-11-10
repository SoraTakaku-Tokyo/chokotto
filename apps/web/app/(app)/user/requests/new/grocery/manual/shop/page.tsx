// U6 apps/web/app/(app)/user/requests/new/grocery/manual/shop/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type GroceryDraft = {
  date?: string;
  start?: string;
  end?: string;
  place?: string; // ← 入力（任意）
  note?: string;
};

const DRAFT_KEY = "groceryDraft";

export default function U6ShopTextInputPage() {
  const router = useRouter();
  const [place, setPlace] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  // 既存値ロード
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft: GroceryDraft = JSON.parse(raw);
      if (draft.place) setPlace(draft.place);
    } catch {}
  }, []);

  // 保存→次へ（U7: その他） ※必須チェックなし
  const onNext = () => {
    const trimmed = place.trim();

    // 任意項目に変更
    // if (!trimmed) {
    //  setError("買い物先を入力してください");
    //  taRef.current?.focus();
    //  return;
    // }

    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      const prev: GroceryDraft = raw ? JSON.parse(raw) : {};
      const next: GroceryDraft = { ...prev };

      if (trimmed) {
        next.place = trimmed; // 入力あり → 保存
      } else {
        delete next.place; // 入力なし → 保存しない（既存があれば消す）
      }

      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } catch {}
    router.push("/user/requests/new/grocery/manual/other");
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      {/* ★ 上部固定（縦並びステップ：文字大きめ） */}
      <div className="sticky top-0 z-10 -mx-6 border-b border-[var(--card-border)] bg-[var(--user-bg)] px-6 py-4">
        <StepList current="shop" />
      </div>

      {/* 見出し：サイズアップ */}
      <h2 className="text-2xl font-bold">買い物先は？</h2>

      {/* 説明＋入力：白枠なし・幅いっぱい */}
      <div className="space-y-4">
        <p className="text-base text-gray-700">
          ご希望を教えてください。
          <span className="opacity-80">
            <br />
            （例：イオン◯◯店）
            <br />
            ※入力しなくても次へ進めます
          </span>
        </p>

        <textarea
          id="place"
          ref={taRef}
          rows={4}
          value={place}
          onChange={(e) => setPlace(e.target.value)}
          placeholder="店名やエリアを入力（任意）"
          className="w-full resize-none rounded-lg border border-gray-300 bg-white p-3 text-lg outline-none focus:border-gray-400"
        />
      </div>

      {/* 通常配置ボタン（固定解除） */}
      <div className="pb=[env(safe-area-inset-bottom)] space-y-4">
        {/* disabled は使わず、押した時に保存のみ */}
        <Button variant="u_primary" size="block" onClick={onNext}>
          次へ
        </Button>
        <Button variant="u_tertiary" size="block" href="/user/requests/new/grocery/manual/time">
          前のページにもどる
        </Button>
      </div>
    </div>
  );
}

/* ---- UI parts（U4/U5と同等：縦並び ➜ / □・文字大きめ） ---- */
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
