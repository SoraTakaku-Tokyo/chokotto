// app/api/zip/lookup/route.ts
import { NextResponse } from "next/server";

type ZipCloudResult = {
  status: number;
  message: string | null;
  results: null | Array<{
    zipcode: string;
    address1: string; // 都道府県
    address2: string; // 市区町村
    address3: string; // 町域
  }>;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const zipcode = (searchParams.get("zipcode") || "").replace(/[^\d]/g, "").slice(0, 7);

  if (zipcode.length !== 7) {
    return NextResponse.json({ ok: false, error: "zipcode must be 7 digits" }, { status: 400 });
  }

  // サーバ側から ZipCloud へ
  const url = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`;
  try {
    const res = await fetch(url, {
      // 毎回取りたいのでキャッシュ無効（必要なら revalidate 秒を設定）
      cache: "no-store",
      // タイムアウト代替: 7秒で中断
      signal: AbortSignal.timeout ? AbortSignal.timeout(7000) : undefined,
      // Next.js の fetch 拡張（任意）
      next: { revalidate: 0 }
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `upstream HTTP ${res.status}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as ZipCloudResult;

    if (data.status !== 200 || !data.results || data.results.length === 0) {
      return NextResponse.json({ ok: false, error: data.message || "not found" }, { status: 404 });
    }

    const r = data.results[0];
    return NextResponse.json(
      {
        ok: true,
        zipcode: r.zipcode,
        prefecture: r.address1,
        city: r.address2,
        town: r.address3,
        display: `${r.address1}${r.address2}${r.address3}`
      },
      {
        status: 200,
        headers: {
          // フロントから同一オリジンで叩くので本来不要だが、将来の別オリジン向けに一応
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-store"
        }
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
