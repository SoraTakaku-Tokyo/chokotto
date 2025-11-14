// S13 apps/web/app/(app)/supporter/profile/page.tsx
"use client";

import React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type Profile = {
  lastName: string; // 姓
  firstName: string; // 名
  lastNameKana: string; // セイ
  firstNameKana: string; // メイ
  gender: "男" | "女" | "その他";
  birthDate: string; // 生年月日（表示用）
  zip: string; // 郵便番号
  addr1: string; // 住所1（都道府県 市区）
  addr2: string; // 住所2（丁目 番地 建物）
  phone: string; // 電話番号（開示）
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  intro: string; // 利用者へ伝えておきたいこと（開示）
  faceUrl?: string; // 顔写真（/public 配下推奨）
};

// ---- モック（API接続時に差し替え）----
const MOCK: Profile = {
  lastName: "木下",
  firstName: "亜里沙",
  lastNameKana: "キノシタ",
  firstNameKana: "アリサ",
  gender: "女",
  birthDate: "2015年11月29日",
  zip: "178-0071",
  addr1: "東京都練馬区旭町2丁目",
  addr2: "33-44",
  phone: "080-3333-3333",
  emergencyName: "木下俊美",
  emergencyRelation: "母",
  emergencyPhone: "090-4444-4444",
  intro: "お役に立てると嬉しいです！",
  faceUrl: "/face.png"
};
// --------------------------------------

export default function SupporterProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    // TODO: fetch('/api/supporter/profile').then(setProfile)
    setProfile(MOCK);
  }, []);

  if (!profile) {
    return (
      <main className="mx-auto max-w-[420px] p-4">
        <h1 className="mb-3 text-lg font-semibold">登録情報</h1>
        <p className="text-gray-600">読み込み中…</p>
      </main>
    );
  }

  const Blue: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="text-blue-600">{children}</span>
  );

  return (
    <main className="mx-auto max-w-[420px] p-4">
      <h1 className="mb-3 text-lg font-semibold">登録情報</h1>

      <section className="rounded-lg border bg-white p-4 text-sm leading-7">
        <p className="mb-3">
          マッチング時、<Blue>青色部分</Blue>の情報が利用者に公開されます。
        </p>

        <dl className="[&>div]:flex [&>div]:flex-wrap [&>div]:gap-2">
          <div>
            <dt className="w-20 shrink-0 text-gray-600">姓：</dt>
            <dd>{profile.lastName}</dd>
          </div>
          <div>
            <dt className="w-20 shrink-0 text-gray-600">名：</dt>
            <dd>{profile.firstName}</dd>
          </div>
          <div>
            <dt className="w-20 shrink-0 text-gray-600">セイ：</dt>
            <dd>
              <Blue>{profile.lastNameKana}</Blue>
            </dd>
          </div>
          <div>
            <dt className="w-20 shrink-0 text-gray-600">メイ：</dt>
            <dd>{profile.firstNameKana}</dd>
          </div>
          <div>
            <dt className="w-20 shrink-0 text-gray-600">性別：</dt>
            <dd>
              <Blue>{profile.gender}</Blue>
            </dd>
          </div>
          <div>
            <dt className="w-20 shrink-0 text-gray-600">生年月日：</dt>
            <dd>{profile.birthDate}</dd>
          </div>
          <div>
            <dt className="w-20 shrink-0 text-gray-600">郵便番号：</dt>
            <dd>{profile.zip}</dd>
          </div>
          <div>
            <dt className="w-20 shrink-0 text-gray-600">住所1：</dt>
            <dd>{profile.addr1}</dd>
          </div>
          <div>
            <dt className="w-20 shrink-0 text-gray-600">住所2：</dt>
            <dd>{profile.addr2}</dd>
          </div>
          <div>
            <dt className="w-20 shrink-0 text-gray-600">電話番号：</dt>
            <dd>
              <Blue>
                <a href={`tel:${profile.phone.replace(/-/g, "")}`} className="underline">
                  {profile.phone}
                </a>
              </Blue>
            </dd>
          </div>

          <div className="mt-2">
            <dt className="w-32 shrink-0 text-gray-600">緊急連絡先氏名：</dt>
            <dd>{profile.emergencyName}</dd>
          </div>
          <div>
            <dt className="w-32 shrink-0 text-gray-600">緊急連絡先続柄：</dt>
            <dd>{profile.emergencyRelation}</dd>
          </div>
          <div>
            <dt className="w-32 shrink-0 text-gray-600">緊急連絡先電話：</dt>
            <dd>{profile.emergencyPhone}</dd>
          </div>

          <div className="mt-2">
            <dt className="shrink-0 text-gray-600">利用者へ伝えておきたいこと、自己紹介など：</dt>
            <dd className="whitespace-pre-wrap">
              <Blue>{profile.intro}</Blue>
            </dd>
          </div>

          <div className="mt-2">
            <dt className="w-20 shrink-0 text-gray-600">顔写真：</dt>
            <dd>
              {profile.faceUrl ? (
                <Image
                  src={profile.faceUrl}
                  alt="顔写真"
                  width={220}
                  height={220}
                  className="mt-2 h-40 w-40 rounded border object-cover"
                />
              ) : (
                <span className="text-gray-500">未登録</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-6 flex flex-col items-center gap-3">
        {/* <Button onClick={onDummyClick} variant="s_primary" size="lg" equalWidth>
          内容を修正する
        </Button> */}
        <Button href="/supporter" variant="s_secondary" size="lg" equalWidth>
          ホームに戻る
        </Button>
      </div>
      {/* トースト */}
      {/* {toast && <Toast message={toast} />} */}
    </main>
  );
}
