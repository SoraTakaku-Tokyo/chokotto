// U1 apps/web/app/(app)/user/page.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { fetchRequests } from "@/lib/api/requests";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";

// 最小限の型（requests.tsの返却に合わせつつ、使う範囲だけ）
type RequestItem = {
  id: number | string;
  title: string;
  status: "open" | "matched" | "confirmed" | string;
  scheduledDate?: string; // ISO
  scheduledStartTime?: string | null;
  scheduledEndTime?: string | null;
  workLocation1?: string;
  description?: string | null;
};

export default function UserHome() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.toString() ? `${pathname}?${sp.toString()}` : pathname;
  const contactHref = `/user/contact?redirectTo=${encodeURIComponent(current)}`;

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchRequests("user");
        // 進行中（＝一覧カードに出す対象）だけ抽出
        const active = (list as RequestItem[]).filter((r) =>
          ["open", "matched", "confirmed"].includes(r.status)
        );
        setRequests(active);
      } catch (e) {
        console.error("依頼一覧の取得に失敗:", e);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="space-y-6">
      {/* <h2 className="text-center text-2xl font-bold text-[var(--user-fg)]">
        ご近所サポート
        <br />
        ちょこっと
      </h2> */}
      <div className="flex items-center justify-center py-10">
        <Image src="/logo.png" alt="ちょこっと" width={240} height={72} priority />
      </div>

      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
        {/* メインアクション（右カラム） */}
        <nav className="order-1 mx-auto flex w-full max-w-xs flex-col items-stretch space-y-6 md:order-2 md:max-w-none">
          <Button variant="u_primary" size="block" equalWidth href="/user/requests/new/grocery">
            買い物を依頼する
          </Button>
          <Button variant="u_secondary" size="block" equalWidth href="/user/profile">
            登録情報の確認
          </Button>
          <Button variant="u_secondary" size="block" equalWidth href={contactHref}>
            問い合わせる
          </Button>
        </nav>

        {/* 依頼一覧（左カラム） */}
        <div className="order-2 space-y-4 md:order-1">
          <h3 className="text-xl font-semibold text-[var(--user-fg)]">進行中の依頼</h3>
          <RequestsPanel loading={loading} items={requests} />
        </div>
      </div>
    </section>
  );
}

function RequestsPanel({ loading, items }: { loading: boolean; items: RequestItem[] }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--card-border)] bg-white p-5 shadow-md">
        <p className="text-sm text-gray-700">読み込み中です…</p>
        <div className="mt-4 space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--card-border)] bg-white p-5 shadow-md">
        <p className="text-sm text-gray-700">
          進行中の依頼はありません。新規依頼から始めましょう。
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((r) => {
        const href =
          r.status === "open"
            ? `/user/requests/${r.id}?view=waiting` // U11: 募集中
            : `/user/requests/${r.id}?view=matched`; // U9: サポーター決定（matched/confirmed）
        return <RequestCard key={String(r.id)} item={r} href={href} />;
      })}
    </ul>
  );
}

function RequestCard({ item, href }: { item: RequestItem; href: string }) {
  const date = item.scheduledDate
    ? new Date(item.scheduledDate).toLocaleDateString("ja-JP", {
        month: "long",
        day: "numeric",
        weekday: "short"
      })
    : "未定";

  const time =
    item.scheduledStartTime || item.scheduledEndTime
      ? `${item.scheduledStartTime ?? ""}〜${item.scheduledEndTime ?? ""}`
      : "時間未定";

  const badge =
    item.status === "open"
      ? { text: "募集中", cls: "bg-sky-100 text-sky-700 border-sky-200" }
      : { text: "サポーター決定", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" };

  return (
    <li>
      <Link
        href={href}
        className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md"
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="font-semibold text-gray-900">{item.title}</p>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${badge.cls}`}
          >
            {badge.text}
          </span>
        </div>
        <dl className="text-sm leading-6 text-gray-800">
          <div>
            <dt className="inline">日程：</dt>
            <dd className="inline">{date}</dd>
          </div>
          <div>
            <dt className="inline">時間：</dt>
            <dd className="inline">{time}</dd>
          </div>
          {item.workLocation1 && (
            <div>
              <dt className="inline">場所：</dt>
              <dd className="inline">{item.workLocation1}</dd>
            </div>
          )}
          {item.description && (
            <div className="line-clamp-2">
              <dt className="inline">メモ：</dt>
              <dd className="inline">{item.description}</dd>
            </div>
          )}
        </dl>
      </Link>
    </li>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <div className="mb-2 h-4 w-32 rounded bg-gray-200" />
      <div className="mb-1.5 h-3 w-48 rounded bg-gray-200" />
      <div className="mb-1.5 h-3 w-40 rounded bg-gray-200" />
      <div className="h-3 w-28 rounded bg-gray-200" />
    </div>
  );
}
