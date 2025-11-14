import Link from "next/link";

export default function Landing() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">ご近所サポート ちょこっと</h1>
      <p className="text-sm">
        ちょこっとは、地域の高齢者とボランティアをつなぐ、安心・簡単なお手伝いマッチングサービスです。
      </p>
      <div className="grid gap-2">
        <Link className="underline" href="/user-login">
          利用者画面はこちら
        </Link>
        <Link className="underline" href="/supporter-login">
          サポーター画面はこちら
        </Link>
      </div>
    </section>
  );
}
