import Link from "next/link";
import { routes } from "@/lib/routes";

const mock = [
  { id: 101, title: "買い物の同行", status: "open" },
  { id: 102, title: "通院の付き添い", status: "open" }
];

export default function UserRequests() {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">依頼一覧（モック）</h3>
      <ul className="space-y-2">
        {mock.map((r) => (
          <li key={r.id} className="rounded border p-3">
            <div className="font-medium">{r.title}</div>
            <div className="text-xs text-gray-500">状態: {r.status}</div>
            <Link className="text-sm underline" href={routes.user.requestDetail(r.id)}>
              詳細へ
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
