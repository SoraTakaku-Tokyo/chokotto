// S4 app/(public)/supporter-signup/review/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StepHeader from "@/components/supporter-signup/StepHeader";
import { loadDraft, clearDraft } from "@/lib/signupDraft";
import type { SupporterSignup } from "@/lib/validators/supporterSignup";
import { Button } from "@/components/ui/Button";
import { submitSupporterSignup } from "@/lib/api/supporters";

export default function ReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<Partial<SupporterSignup>>({});

  useEffect(() => setData(loadDraft()), []);

  const submit = async () => {
    try {
      await submitSupporterSignup(data as SupporterSignup);
      clearDraft();
      router.push("/supporter-signup/complete");
    } catch (e) {
      alert("送信に失敗しました。時間をおいて再度お試しください。");
      console.error(e);
    }
  };

  return (
    <>
      <StepHeader step={4} title="この内容で登録します。よろしいですか？" />
      <p className="mt-2 text-sm text-gray-600">
        マッチング時、<span className="text-blue-600">青色部分</span>の情報が利用者に公開されます。
      </p>

      <div className="mt-5 space-y-1 text-lg">
        <div>姓：{data.familyName}</div>
        <div>名：{data.firstName}</div>
        <div>
          セイ：<span className="text-blue-700">{data.familyNameKana}</span>
        </div>
        <div>メイ：{data.firstNameKana}</div>
        <div>
          性別：
          <span className="text-blue-700">
            {data.gender === "male" ? "男" : data.gender === "female" ? "女" : "非回答"}
          </span>
        </div>
        <div>生年月日：{data.birthday}</div>
        <div>郵便番号：{data.postalCode}</div>
        <div>住所１：東京都練馬区</div>
        <div>住所２：{data.address1}</div>
        <div>住所３：{data.address2}</div>
        <div>
          電話番号：<span className="text-blue-700">{data.phoneNumber}</span>
        </div>
        <div>緊急連絡先氏名：{data.emergencyContactName}</div>
        <div>緊急連絡先続柄：{data.emergencyContactRelationship}</div>
        <div>緊急連絡先電話番号：{data.emergencyContactPhone}</div>
        <div>
          利用者へ伝えておきたいこと
          <br />
          自己紹介など：
          <br />
          <span className="text-blue-700">{data.bio}</span>
        </div>

        {data.profileImageUrl && (
          <div className="mt-3">
            顔写真：
            <div className="mt-2 inline-block rounded border-2 border-blue-400 p-2">
              <img
                src={String(data.profileImageUrl)}
                alt="顔写真"
                className="h-32 w-32 object-cover"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col items-center gap-3">
        <Button onClick={submit} variant="s_primary" className="w-64 py-4 text-lg">
          登録する
        </Button>
        <Button onClick={() => router.back()} variant="s_secondary" className="w-64 py-4 text-lg">
          戻る
        </Button>
      </div>
    </>
  );
}
