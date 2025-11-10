"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function QRLogin() {
  const sp = useSearchParams();
  const code = sp.get("c") ?? "";
  const [status, setStatus] = useState("待機中...");

  useEffect(() => {
    if (!code) {
      setStatus("コードが見つかりません");
      return;
    }
    // 実際は API にPOSTし、カスタムトークン→Firebase signIn の流れ。
    // ここではモック表示のみ。
    setStatus(`受け付けました（c=${code}）`);
  }, [code]);

  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">QRログイン（開発モック）</h1>
      <p className="mt-4">{status}</p>
      <p className="mt-2 text-sm text-gray-500">
        ※MVPでは「標準カメラで読み取り→URL起動」。ブラウザ内スキャンは非対応。
      </p>
    </main>
  );
}
