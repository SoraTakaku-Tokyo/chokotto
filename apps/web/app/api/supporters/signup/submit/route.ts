// app/api/supporters/signup/submit/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  // 仮実装：受け取ったデータをログに出して型確認だけする
  console.log("received signup:", body);

  // TODO: ここで Prisma で users へ保存
  //  - role: "supporter"
  //  - centerId: "C001"
  //  - identityVerified: false
  //  - birthday: new Date(body.birthday)
  //  - profileImageUrl: 受け取ったURLをそのまま保存
  //  - address1/address2: 画面の住所②/③が入ってくる

  // ダミー応答
  return NextResponse.json({ ok: true });
}
