// U3 apps/web/app/(app)/user/requests/new/grocery/page.tsx
"use client";

import { Button } from "@/components/ui/Button";

export default function GroceryInputOptionPage() {
  return (
    <section className="mx-auto max-w-xs space-y-6 md:max-w-sm">
      <h2 className="text-xl font-bold">依頼票の作成方法を選んでください。</h2>

      {/* 音声で答える → /user/chat */}
      <Button variant="u_primary" size="block" href="/user/chat">
        <span className="inline-flex items-center justify-center gap-2">
          <MicIcon />
          音声で答える
        </span>
      </Button>

      {/* 自分で入力する → /user/requests/new/grocery/manual/date */}
      <Button variant="u_secondary" size="block" href="/user/requests/new/grocery/manual/date">
        自分で入力する
      </Button>

      {/* 戻る */}
      <Button variant="u_tertiary" size="block" href="/user">
        前のページにもどる
      </Button>
    </section>
  );
}

function MicIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21H9v2h6v-2h-2v-3.08A7 7 0 0 0 19 11h-2Z" />
    </svg>
  );
}
