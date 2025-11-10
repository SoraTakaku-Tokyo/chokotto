// U9 U11 apps/web/app/(app)/user/requests/[id]/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { fetchRequestDetail } from "@/lib/api/requests";
import Image from "next/image";

type RequestDetail = {
  id: number | string;
  title: string;
  status: "open" | "matched" | "confirmed" | string;
  scheduledDate?: string;
  scheduledStartTime?: string | null;
  scheduledEndTime?: string | null;
  workLocation1?: string;
  description?: string | null;
  supporter?: {
    supporterName?: string | null;
    supporterPhone?: string | null;
    supporterNote?: string | null;
    supporterAvatarUrl?: string | null;
  };
};
type ViewMode = "waiting" | "matched";

export default function UserRequestDetail() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const q = search.get("view");
  const viewParam: ViewMode = q === "matched" ? "matched" : "waiting";

  const [data, setData] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const niceDate = useMemo(() => {
    if (!data?.scheduledDate) return "未定";
    return new Date(data.scheduledDate).toLocaleDateString("ja-JP", {
      month: "long",
      day: "numeric",
      weekday: "short"
    });
  }, [data?.scheduledDate]);

  useEffect(() => {
    async function load() {
      try {
        const detail = await fetchRequestDetail(Number(params.id), "user");
        console.log("詳細APIレスポンス:", detail);
        setData(detail);
      } catch (err) {
        console.error("依頼詳細の取得に失敗:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-md space-y-6 p-6">
        <p className="text-gray-800">読み込み中です…</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-md space-y-6 p-6">
        <p className="text-gray-800">依頼が見つかりませんでした。</p>
        <div className="mt-4">
          <Button href="/user" variant="u_secondary" size="block">
            トップに戻る
          </Button>
        </div>
      </main>
    );
  }

  // ステータスとクエリの補正
  const effectiveView: ViewMode =
    data.status === "open"
      ? "waiting"
      : viewParam === "waiting" && data.status !== "open"
        ? "matched"
        : viewParam;

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="mb-4 text-xl font-semibold text-[var(--user-fg)]">
        {effectiveView === "waiting" ? "サポーター募集中" : "サポーター決定"}
      </h1>

      {/* ① 詳細カード（ボタンは含めない） */}
      <RequestSummaryCard data={data} niceDate={niceDate} view={effectiveView} />

      {/* ② アクション群（カードの外に縦並び） */}
      <Actions id={data.id} view={effectiveView} />
    </main>
  );
}

/** 詳細カード（読み物のみ） */
function RequestSummaryCard({
  data,
  niceDate,
  view
}: {
  data: RequestDetail;
  niceDate: string;
  view: "waiting" | "matched";
}) {
  const wrapCls =
    view === "waiting"
      ? "border-sky-200 bg-sky-50 text-sky-900"
      : "border-emerald-200 bg-emerald-50 text-emerald-900";

  return (
    <section className={`mb-6 rounded-lg border p-4 shadow-sm ${wrapCls}`}>
      <h2 className="mb-2 text-lg font-bold text-gray-900">{data.title}</h2>
      <dl className="text-sm leading-7 text-gray-800">
        <div>
          <dt className="inline">依頼ID：</dt>
          <dd className="inline">{data.id}</dd>
        </div>
        <div>
          <dt className="inline">日程：</dt>
          <dd className="inline">{niceDate}</dd>
        </div>
        <div>
          <dt className="inline">時間：</dt>
          <dd className="inline">
            {data.scheduledStartTime || data.scheduledEndTime
              ? `${data.scheduledStartTime ?? ""}〜${data.scheduledEndTime ?? ""}`
              : "未定"}
          </dd>
        </div>
        {data.workLocation1 && (
          <div>
            <dt className="inline">場所：</dt>
            <dd className="inline">{data.workLocation1}</dd>
          </div>
        )}
        {data.description && (
          <div className="whitespace-pre-line">
            <dt className="inline">メモ：</dt>
            <dd className="inline">{data.description}</dd>
          </div>
        )}

        {view === "matched" && data.supporter && (
          <>
            {data.supporter.supporterName && (
              <div className="mt-3">
                <dt className="inline">サポーター：</dt>
                <dd className="inline">{data.supporter.supporterName}</dd>
              </div>
            )}
            {data.supporter.supporterAvatarUrl && (
              <div className="my-2">
                <Image
                  src={data.supporter.supporterAvatarUrl}
                  alt="サポーターの写真"
                  width={112}
                  height={112}
                  className="h-28 w-28 rounded object-cover"
                />
              </div>
            )}
            {data.supporter.supporterPhone && (
              <div>
                <dt className="inline">電話番号：</dt>
                <dd className="inline">{data.supporter.supporterPhone}</dd>
              </div>
            )}
            {data.supporter.supporterNote && (
              <div className="whitespace-pre-line">
                <dt className="inline">自己紹介：</dt>
                <dd className="inline">{data.supporter.supporterNote}</dd>
              </div>
            )}
          </>
        )}
      </dl>
    </section>
  );
}

/** アクション（カードの外） */
function Actions({ id, view }: { id: number | string; view: ViewMode }) {
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.toString() ? `${pathname}?${sp.toString()}` : pathname;
  const contactHref = `/user/contact?redirectTo=${encodeURIComponent(current)}`;

  return (
    <nav className="flex w-full flex-col items-stretch gap-4">
      {view === "waiting" ? (
        <>
          <Button
            style={{ whiteSpace: "nowrap", wordBreak: "keep-all" }}
            href={`/user/requests/${id}/action?type=cancel&step=confirm`}
            variant="u_secondary"
            size="block"
          >
            依頼をキャンセルする
          </Button>
        </>
      ) : (
        <>
          <Button
            style={{ whiteSpace: "nowrap", wordBreak: "keep-all" }}
            href={`/user/requests/${id}/action?type=cancel&step=confirm`}
            variant="u_secondary"
            size="block"
          >
            依頼をキャンセルする
          </Button>
          <Button
            href={`/user/requests/${id}/action?type=change_supporter&step=confirm`}
            variant="u_secondary"
            size="block"
          >
            サポーターさんを
            <br />
            変更したい
          </Button>
        </>
      )}
      <Button href="/user" variant="u_primary" size="block">
        前のページにもどる
      </Button>
      <Button href={contactHref} variant="u_secondary" size="block">
        問い合わせる
      </Button>
    </nav>
  );
}
