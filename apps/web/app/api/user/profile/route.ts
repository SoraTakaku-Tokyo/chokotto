// DEVモックAPI: 環境変数 NEXT_PUBLIC_USE_PROFILE_MOCK=1 のときだけ有効
import { NextResponse } from "next/server";

type UserProfile = {
  sei: string;
  mei: string;
  seiKana?: string;
  meiKana?: string;
  birth?: string;
  postal?: string;
  addr1?: string;
  addr2?: string;
  tel?: string;
  email?: string;
  emergencyAddr?: string;
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyTel?: string;
  noteForSupporter?: string;
  faceImageUrl?: string;
  publicPreview?: string;
};

export const runtime = "nodejs";

export async function GET() {
  // ← 本番ではフラグをOFF（またはこのファイル削除）
  if (process.env.NEXT_PUBLIC_USE_PROFILE_MOCK !== "1") {
    return NextResponse.json({ ok: false, error: "mock disabled" }, { status: 404 });
  }

  const profile: UserProfile = {
    sei: "イノウエ",
    mei: "セツコ",
    birth: "1945年9月3日",
    postal: "178-0061",
    addr1: "東京都練馬区大泉学園町9丁目",
    addr2: "77-8",
    tel: "090-1111-1111",
    email: "testuser1@example.com",
    // emergencyAddr: "〇〇市〇〇1-2-3",
    emergencyName: "井上幸則",
    emergencyRelation: "子",
    emergencyTel: "090-2222-2222",
    noteForSupporter: "難聴があり聞き取りにくいので、ゆっくり話してください。",
    faceImageUrl: "/sampleuser6.png",
    publicPreview:
      "大泉学園町9丁目、80代、女性\n難聴があり聞き取りにくいので、ゆっくり話してください。"
  };

  // no-storeでフロントの読み直しが効くように
  return NextResponse.json(
    { ok: true, profile },
    {
      status: 200,
      headers: { "Cache-Control": "no-store" }
    }
  );
}
