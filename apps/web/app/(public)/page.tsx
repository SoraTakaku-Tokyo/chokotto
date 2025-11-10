import Link from "next/link";
import { routes } from "@/lib/routes";

export default function Landing() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">ようこそ</h1>
      <p className="text-sm">画面モック用の入口ページです。</p>
      <div className="grid gap-2">
        <Link className="underline" href={routes.user.home}>
          利用者画面へ
        </Link>
        <Link className="underline" href={routes.supporter.home}>
          サポーター画面へ
        </Link>
        <Link className="underline" href={routes.supporterSignup.emailPassword}>
          サポーター登録へ
        </Link>
      </div>
    </section>
  );
}
