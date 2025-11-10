// U12 apps/web/app/(app)/user/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";

type UserProfile = {
  sei: string; // 例: "イノウエ"
  mei: string; // 例: "セツコ"
  seiKana?: string;
  meiKana?: string;
  birth?: string; // 例: "昭和18年5月5日"
  postal?: string; // 例: "999-9999"
  addr1?: string; // 例: "〇〇県〇〇市〇〇1丁目"
  addr2?: string; // 例: "〇-〇"
  tel?: string; // 例: "999-999-9999"
  email?: string;
  emergencyAddr?: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyTel?: string;
  noteForSupporter?: string; // 例: "耳がかなり遠いです。"
  faceImageUrl?: string; // 例: "/user.png"
  // 公開用の要約テキスト（API側で組み立て済みでもOK）
  publicPreview?: string; // 例: "〇〇1丁目、80代、女性 耳がかなり遠いです。"
};

export default function UserProfilePage() {
  const [data, setData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/user/profile", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as { ok: boolean; profile?: UserProfile; error?: string };
        if (!json.ok || !json.profile) throw new Error(json.error || "failed");
        if (!cancelled) setData(json.profile);
      } catch {
        if (!cancelled) setError("登録情報の取得に失敗しました。時間をおいて再度お試しください。");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-md space-y-6">
      {/* stickyヘッダー（背景＝ページ色） */}
      <div className="sticky top-0 z-10 -mx-6 border-b border-[var(--card-border)] bg-[var(--user-bg)] px-6 py-4">
        <h1 className="text-xl font-bold">あなたの登録情報</h1>
      </div>

      {loading && (
        <div className="rounded-2xl border border-[var(--card-border)] bg-white p-5 shadow-sm">
          <p className="text-gray-700">読み込み中…</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700 shadow-sm">
          <p className="mb-3">{error}</p>
          <Button variant="u_secondary" size="block" onClick={() => location.reload()}>
            再読み込み
          </Button>
        </div>
      )}

      {data && (
        <>
          {/* 基本情報カード */}
          <section className="rounded-2xl border border-[var(--card-border)] bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">登録情報</h2>

            <dl className="space-y-2 text-base">
              <Row label="セイ">{data.sei}</Row>
              <Row label="メイ">{data.mei}</Row>
              {data.seiKana && <Row label="姓">{data.seiKana}</Row>}
              {data.meiKana && <Row label="名">{data.meiKana}</Row>}
              {data.birth && <Row label="生年月日">{data.birth}</Row>}
              {data.postal && <Row label="郵便番号">{data.postal}</Row>}
              {data.addr1 && <Row label="住所1">{data.addr1}</Row>}
              {data.addr2 && <Row label="住所2">{data.addr2}</Row>}
              {data.tel && <Row label="電話番号">{data.tel}</Row>}
              {data.email && <Row label="メールアドレス">{data.email}</Row>}
              {data.emergencyAddr && <Row label="緊急連絡先住所">{data.emergencyAddr}</Row>}
              {data.emergencyName && <Row label="緊急連絡先氏名">{data.emergencyName}</Row>}
              {data.emergencyRelation && <Row label="緊急連絡先続柄">{data.emergencyRelation}</Row>}
              {data.emergencyTel && <Row label="緊急連絡先電話番号">{data.emergencyTel}</Row>}

              {data.noteForSupporter && (
                <Row label="サポーターに伝えたいこと、自己紹介など">
                  <p className="whitespace-pre-line">{data.noteForSupporter}</p>
                </Row>
              )}

              {data.faceImageUrl && (
                <div className="pt-2">
                  <div className="mb-2 text-gray-500">顔写真：</div>
                  <Image
                    src={data.faceImageUrl}
                    alt="顔写真"
                    width={200}
                    height={200}
                    className="h-auto w-40 rounded object-cover"
                  />
                </div>
              )}
            </dl>
          </section>

          {/* 公開情報（依頼前の開示内容） */}
          <section className="rounded-2xl border border-[var(--card-border)] bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">依頼の引受前に公開される情報は</h2>
            <p className="whitespace-pre-line text-lg leading-7 text-blue-800">
              {data.publicPreview ?? "（プレビューは準備中です）"}
            </p>
            <h2 className="mb-3 text-lg font-semibold">です。</h2>
          </section>

          {/* 操作 */}
          <div className="space-y-4 pb-[env(safe-area-inset-bottom)]">
            {/* <Button variant="u_primary" size="block" href="/user/profile/edit">
              内容を修正する
            </Button> */}
            <Button variant="u_tertiary" size="block" href="/user">
              前のページにもどる
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div>
      <span className="text-gray-500">{label}：</span>
      <span className="ml-1 align-top">{children ?? "—"}</span>
    </div>
  );
}
