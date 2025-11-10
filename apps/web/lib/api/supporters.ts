// lib/api/supporters.ts
import type { SupporterSignup } from "@/lib/validators/supporterSignup";

export async function submitSupporterSignup(payload: SupporterSignup) {
  const res = await fetch("/api/supporters/signup/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      // ここでは birthday の Date 変換は API Route 側で実施
      identityVerified: false, // 初期は未確認
      role: "supporter",
      centerId: "C001"
    })
  });
  if (!res.ok) throw new Error("サインアップに失敗しました");
  return res.json();
}
