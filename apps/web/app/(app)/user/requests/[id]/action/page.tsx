// apps/web/app/(app)/user/requests/[id]/action/page.tsx
"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { updateOrderStatus } from "@/lib/api/orders";
type Step = "confirm" | "result";
type ActType = "cancel" | "change_supporter";

export default function UserRequestAction() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();

  const stepFromUrl: Step = search.get("step") === "result" ? "result" : "confirm";
  const type: ActType = search.get("type") === "change_supporter" ? "change_supporter" : "cancel";

  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(stepFromUrl === "result");

  const titles: Record<ActType, string> = {
    cancel: "この依頼をキャンセルしますか？",
    change_supporter: "サポーターの変更を希望しますか？"
  };

  const resultText: Record<ActType, string> = {
    cancel: "キャンセルが完了しました。",
    change_supporter: "サポーター変更の希望を受け付けました。"
  };

  async function doAction() {
    try {
      setRunning(true);

      // ボタンの種類で分岐
      if (type === "cancel") {
        console.log("依頼キャンセルを実行");
        await updateOrderStatus(Number(id), "canceled"); // ← ここを統一
      } else {
        console.log("サポーター変更依頼を実行");
        await updateOrderStatus(Number(id), "refusal"); // ← サポーター解除扱い
      }

      // 成功したら結果表示
      setDone(true);

      // 3秒後にトップへ戻る
      setTimeout(() => {
        forceNavigate("/user");
      }, 3000);
    } catch (err) {
      console.error("依頼処理中にエラー:", err);
      alert("処理に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setRunning(false);
    }
  }

  /** どんな環境でもトップへ飛ばすための多段フォールバック */
  function forceNavigate(path: string) {
    const abs = new URL(path, window.location.origin).toString();
    try {
      // A) top ウィンドウで遷移（iframe 対策）
      if (window.top && window.top !== window) {
        // @　ts-ignore
        window.top.location.href = abs;
        console.log("navigate: top.href");
        return;
      }
    } catch {}

    try {
      // B) 現在のウィンドウで確実に置換遷移
      window.location.replace(abs);
      console.log("navigate: location.replace");
      return;
    } catch {}

    try {
      // C) href 代入（ポピュラーな経路）
      window.location.href = abs;
      console.log("navigate: location.href");
      return;
    } catch {}

    try {
      // D) 最終手段：アンカー疑似クリック
      const a = document.createElement("a");
      a.href = abs;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      console.log("navigate: anchor click");
    } catch {}
  }

  const showResult = done; // URL or ローカル遷移のどちらでも結果を出す

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-xl font-semibold text-[var(--user-fg)]">
        {showResult ? "処理が完了しました" : titles[type]}
      </h1>

      {/* 内容カード */}
      <section className="rounded-lg border border-[var(--card-border)] bg-white p-4 shadow-sm">
        {showResult ? (
          <>
            <p className="mb-2 text-gray-900">{resultText[type]}</p>
            <p className="text-sm text-gray-700">自動でトップに戻ります…</p>
          </>
        ) : (
          <p className="mb-2 text-gray-900">
            {type === "cancel" &&
              "キャンセル後は、この依頼が一覧から削除されます。よろしいですか？"}
            {type === "change_supporter" &&
              "依頼は一覧に残ります。他のサポーターさんを募集します。"}
          </p>
        )}
      </section>

      {/* アクション群 */}
      {showResult ? (
        <nav className="flex w-full flex-col items-stretch gap-4">
          <Button href="/user" variant="u_primary" size="block">
            すぐにトップへ戻る
          </Button>
        </nav>
      ) : (
        <nav className="flex w-full flex-col items-stretch gap-4">
          <Button
            onClick={doAction}
            variant="u_primary"
            size="block"
            disabled={running}
            aria-busy={running || undefined}
          >
            {running ? "処理中..." : "はい、実行します"}
          </Button>
          <Button
            href={`/user/requests/${id}`}
            variant="u_secondary"
            size="block"
            disabled={running}
          >
            いいえ、戻ります
          </Button>
        </nav>
      )}
    </main>
  );
}
