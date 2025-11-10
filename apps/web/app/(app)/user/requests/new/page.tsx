// U2 apps/web/(app)/user/requests/new/page.tsx
"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/routes";

export default function RequestMenuPage() {
  const [toast, setToast] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setToast(msg);
    timerRef.current = window.setTimeout(() => setToast(null), 1800);
  }, []);

  const onDummyClick = () => showToast("このメニューは準備中です");

  return (
    <section className="mx-auto max-w-xs space-y-6 md:max-w-sm">
      <h2 className="text-xl font-bold">どのメニューを依頼しますか</h2>

      {/* 有効：買い物代行（遷移あり） */}
      <div className="space-y-6">
        <Button variant="u_primary" size="block" href="/user/requests/new/grocery">
          買い物代行
        </Button>

        {/* “活性っぽい”ダミー（遷移なし・トースト表示） */}
        <Button variant="u_primary" size="block" onClick={onDummyClick}>
          外出付き添い
        </Button>
        <Button variant="u_primary" size="block" onClick={onDummyClick}>
          室内軽作業（15分まで）
        </Button>
        <Button variant="u_primary" size="block" onClick={onDummyClick}>
          屋外軽作業（30分まで）
        </Button>
        <Button variant="u_primary" size="block" onClick={onDummyClick}>
          掃除・片付け（1時間まで）
        </Button>
        <Button variant="u_primary" size="block" onClick={onDummyClick}>
          話し相手（2時間まで）
        </Button>
      </div>

      {/* 戻る */}
      <Button variant="u_tertiary" size="block" href={routes.user.home ?? "/user"}>
        前のページにもどる
      </Button>

      {/* トースト */}
      {toast && <Toast message={toast} />}
    </section>
  );
}

/** シンプルなトースト（流用） */
function Toast({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 z-50 inline-flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center whitespace-nowrap rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg"
    >
      {message}
    </div>
  );
}
