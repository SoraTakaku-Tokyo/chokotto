// S2 app/(public)/supporter-signup/page.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import StepHeader from "@/components/supporter-signup/StepHeader";
import StepFooter from "@/components/supporter-signup/StepFooter";
// import { signOut } from "firebase/auth";
// import { auth } from "@/lib/firebase";
import { supporterSignupSchema, type SupporterSignup } from "@/lib/validators/supporterSignup";
// import { loadDraft, saveDraft, clearDraft } from "@/lib/signupDraft";
import { loadDraft, saveDraft } from "@/lib/signupDraft";
import { Button } from "@/components/ui/Button";

type FetchState = "idle" | "loading" | "done" | "error";

/** AbortError 判定（型安全） */
function isAbortError(err: unknown): boolean {
  if (typeof DOMException !== "undefined" && err instanceof DOMException) {
    return err.name === "AbortError";
  }
  if (typeof err === "object" && err !== null && "name" in err) {
    const name = (err as Record<string, unknown>).name;
    return name === "AbortError";
  }
  return false;
}

/** 日付を YYYY-MM-DD へ整形 */
const toYMD = (d: Date) => {
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
};

/** 電話番号の分割・結合ユーティリティ */
const joinPhone = (a: string, b: string, c: string) => [a, b, c].filter(Boolean).join("-");
const toPhoneParts = (v: string): [string, string, string] => {
  const d = (v || "").replace(/[^\d]/g, "");
  if (d.startsWith("03") && d.length === 10) return [d.slice(0, 2), d.slice(2, 6), d.slice(6)]; // 03-xxxx-xxxx
  if (d.length === 11) return [d.slice(0, 3), d.slice(3, 7), d.slice(7)]; // 090-1234-5678
  if (d.length === 10) return [d.slice(0, 3), d.slice(3, 6), d.slice(6)]; // 012-345-6789（代表的な10桁）
  return [d.slice(0, 4), d.slice(4, 8), d.slice(8, 12)]; // フォールバック
};

export default function SignupBasicPage() {
  const router = useRouter();

  const [form, setForm] = useState<SupporterSignup>({
    familyName: "",
    firstName: "",
    familyNameKana: "",
    firstNameKana: "",
    gender: "male",
    birthday: "",
    postalCode: "",
    address1: "",
    address2: "",
    phoneNumber: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
    bio: "",
    profileImageUrl: "",
    centerId: "C001",
    role: "supporter"
  });

  const [zipFetch, setZipFetch] = useState<FetchState>("idle");
  const abortRef = useRef<AbortController | null>(null);
  const [[p1, p2, p3], setP] = useState<[string, string, string]>(["", "", ""]);
  const [[ep1, ep2, ep3], setEP] = useState<[string, string, string]>(["", "", ""]);

  // 必須/任意バッジ
  const Req = () => (
    <span className="ml-2 rounded border border-rose-200 bg-rose-50 px-1.5 py-[2px] text-xs font-medium text-rose-600">
      必須
    </span>
  );
  const Opt = () => (
    <span className="ml-2 rounded border border-gray-200 bg-gray-50 px-1.5 py-[2px] text-xs text-gray-600">
      任意
    </span>
  );

  // 重複防止用：最後に成功/失敗を含めて検索した郵便番号
  const lastSearchedZip = useRef<string | null>(null);
  // 自動再試行抑止用：直近でエラーになった郵便番号
  const lastErrorZip = useRef<string | null>(null);

  useEffect(() => {
    const d = loadDraft();
    setForm((prev) => {
      const today = new Date();
      const th30 = new Date(today);
      th30.setFullYear(today.getFullYear() - 30); // 30年前
      return {
        ...prev,
        ...d,
        // ドラフトに生年月日が無ければ30年前を初期セット
        birthday: d?.birthday && d.birthday !== "" ? d.birthday : toYMD(th30),
        centerId: "C001",
        role: "supporter"
      };
    });
    // 電話番号を3分割へ反映
    const [a, b, c] = toPhoneParts(d?.phoneNumber ?? "");
    setP([a, b, c]);
    const [ea, eb, ec] = toPhoneParts(d?.emergencyContactPhone ?? "");
    setEP([ea, eb, ec]);
  }, []);

  const update = (patch: Partial<SupporterSignup>) => {
    const next = { ...form, ...patch };
    setForm(next);
    saveDraft(next);
  };

  // 7桁だけ抽出（ハイフン等を除去）
  const normalizedPostal = useMemo(
    () => form.postalCode.replace(/[^\d]/g, "").slice(0, 7),
    [form.postalCode]
  );

  /** 分割入力の更新（本人） */
  const setPhonePart = (idx: 0 | 1 | 2, v: string) => {
    const digits = v.replace(/[^\d]/g, "");
    const limits = [4, 4, 4] as const;
    const clipped = digits.slice(0, limits[idx]);
    const next: [string, string, string] = [p1, p2, p3];
    next[idx] = clipped;
    setP([...next] as [string, string, string]);
    update({ phoneNumber: joinPhone(next[0], next[1], next[2]) });
  };
  /** 分割入力の更新（緊急連絡先） */
  const setEmergencyPhonePart = (idx: 0 | 1 | 2, v: string) => {
    const digits = v.replace(/[^\d]/g, "");
    const limits = [4, 4, 4] as const;
    const clipped = digits.slice(0, limits[idx]);
    const next: [string, string, string] = [ep1, ep2, ep3];
    next[idx] = clipped;
    setEP([...next] as [string, string, string]);
    update({ emergencyContactPhone: joinPhone(next[0], next[1], next[2]) });
  };

  const lookupAddressByPostal = useCallback(
    async (zip: string) => {
      // 連打・重複検索の抑止
      if (zip === lastSearchedZip.current && zipFetch !== "error") return;
      if (zipFetch === "loading") return;

      // 実行中があれば中断
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setZipFetch("loading");
      lastSearchedZip.current = zip;

      try {
        const res = await fetch(`/api/zip/lookup?zipcode=${zip}`, { cache: "no-store" });

        if (res.ok) {
          const data: {
            ok: boolean;
            zipcode?: string;
            prefecture?: string;
            city?: string;
            town?: string;
            display?: string;
            error?: string;
          } = await res.json();

          if (!data.ok) {
            setZipFetch("error");
            alert(data.error || "住所が見つかりませんでした。郵便番号を確認してください。");
            lastErrorZip.current = zip;
            return;
          }

          // C001=東京都練馬区のチェック
          const isTokyoNerima = data.prefecture === "東京都" && data.city === "練馬区";
          if (!isTokyoNerima && lastErrorZip.current !== zip) {
            alert(
              `郵便番号の地区が「${data.prefecture}${data.city}」です。登録センター（東京都練馬区）と異なる可能性があります。`
            );
          }

          const town = data.town ?? "";
          update({ postalCode: zip, address1: town });
          setZipFetch("done");
          lastErrorZip.current = null; // 成功したので解除
          return;
        }

        // res.ok が false の場合
        if (res.status === 404) {
          setZipFetch("error");
          alert("住所が見つかりませんでした。郵便番号を確認してください。");
          lastErrorZip.current = zip;
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      } catch (err: unknown) {
        if (isAbortError(err)) return; // 中断は無視
        console.error(err);
        setZipFetch("error");
        if (lastErrorZip.current !== zip) {
          alert("通信エラーが発生しました。時間をおいて再度お試しください。");
        }
        lastErrorZip.current = zip;
      }
    },
    [update, zipFetch]
  );

  // 7桁揃った時だけ自動検索（エラーになった番号は自動再試行しない）
  useEffect(() => {
    if (normalizedPostal.length === 7) {
      if (normalizedPostal !== lastErrorZip.current) {
        void lookupAddressByPostal(normalizedPostal);
      }
    } else {
      setZipFetch("idle");
    }
  }, [normalizedPostal, lookupAddressByPostal]);

  const handleNext = () => {
    const parsed = supporterSignupSchema
      .omit({ profileImageUrl: true }) // 写真は次ステップ
      .safeParse({ ...form, postalCode: normalizedPostal });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "入力内容を確認してください";
      alert(msg);
      return;
    }
    router.push("/supporter-signup/photo");
  };

  // const handleCancel = () => {
  //   if (confirm("登録をやめますか？下書きは削除されます。")) {
  //     clearDraft();
  //     router.push("/supporter-login");
  //   }
  // };

  return (
    <>
      <StepHeader step={2} title="新規登録する" />
      <div className="mt-5 space-y-4 text-lg">
        <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
          あなたの登録センター：
          <br />
          <b>東京都練馬区</b>（センターID: <b>C001</b>）<br />
          <div className="mt-1 text-gray-600">センターは自動で設定されます。</div>
        </div>

        {/* 氏名・カナ・性別・生年月日 */}
        <div className="space-y-3">
          <div>
            <label htmlFor="ln" className="block font-medium">
              姓 <Req />
            </label>
            <input
              id="ln"
              className="mt-1 w-full rounded border p-2"
              placeholder="例：練馬"
              value={form.familyName}
              onChange={(e) => update({ familyName: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="fn" className="block font-medium">
              名 <Req />
            </label>
            <input
              id="fn"
              className="mt-1 w-full rounded border p-2"
              placeholder="例：花子"
              value={form.firstName}
              onChange={(e) => update({ firstName: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="lk" className="block font-medium">
              セイ <Req />
            </label>
            <input
              id="lk"
              className="mt-1 w-full rounded border p-2"
              placeholder="例：ネリマ"
              value={form.familyNameKana}
              onChange={(e) => update({ familyNameKana: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="fk" className="block font-medium">
              メイ <Req />
            </label>
            <input
              id="fk"
              className="mt-1 w-full rounded border p-2"
              placeholder="例：ハナコ"
              value={form.firstNameKana}
              onChange={(e) => update({ firstNameKana: e.target.value })}
              required
            />
          </div>

          <fieldset className="space-y-2">
            <legend className="font-medium">
              性別 <Req />
            </legend>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  checked={form.gender === "male"}
                  onChange={() => update({ gender: "male" })}
                  required
                />
                男
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  checked={form.gender === "female"}
                  onChange={() => update({ gender: "female" })}
                  required
                />
                女
              </label>
              {/* <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  checked={form.gender === "no_answer"}
                  onChange={() => update({ gender: "no_answer" })}
                  required
                />
                回答しない
              </label> */}
            </div>
          </fieldset>

          <div>
            <label htmlFor="bd" className="block font-medium">
              生年月日 <Req />
            </label>
            <input
              id="bd"
              type="date"
              autoComplete="bday"
              className="mt-1 w-full rounded border p-2"
              value={form.birthday}
              onChange={(e) => update({ birthday: e.target.value })}
              max={toYMD(new Date())}
              required
            />
          </div>
        </div>

        {/* 郵便番号 + 検索ボタン */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="pc" className="block font-medium">
              郵便番号 <Req />
            </label>
            <span className="text-sm text-gray-500" aria-live="polite">
              {zipFetch === "loading" ? "検索中…" : "7桁で検索"}
            </span>
          </div>

          <div className="flex flex-nowrap items-center gap-2">
            <input
              id="pc"
              inputMode="numeric"
              pattern="\d*"
              autoComplete="postal-code"
              className="w-[12ch] flex-none shrink-0 rounded border p-2 tabular-nums"
              placeholder="例：1770033"
              value={form.postalCode}
              onChange={(e) => update({ postalCode: e.target.value })}
              required
            />
            <Button
              style={{ whiteSpace: "nowrap", wordBreak: "keep-all" }}
              onClick={() => {
                const z = normalizedPostal;
                if (z.length !== 7) {
                  alert("郵便番号は7桁で入力してください。");
                  return;
                }
                lastErrorZip.current = null;
                void lookupAddressByPostal(z);
              }}
              variant="s_secondary"
              size="md"
              className="flex-none shrink-0"
            >
              検索
            </Button>
          </div>
        </div>

        {/* 市区町村は固定表示（C001） */}
        <div className="rounded border border-gray-200 bg-gray-50 p-3 leading-relaxed">
          <div className="text-sm leading-relaxed text-gray-700">
            住所（市区町村）： <b>東京都練馬区</b>
          </div>
        </div>

        {/* 町名・丁目（address1）/ 番地・建物（address2） */}
        <div className="space-y-3">
          <div>
            <label htmlFor="a1" className="block font-medium leading-relaxed">
              住所（丁目まで入力） <Req />
            </label>
            <input
              id="a1"
              className="mt-1 w-full min-w-0 rounded border p-2"
              placeholder="例：高野台1丁目"
              value={form.address1}
              onChange={(e) => update({ address1: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="a2" className="block font-medium">
              住所（番地・建物名） <Opt />
            </label>
            <input
              id="a2"
              className="mt-1 w-full rounded border p-2"
              placeholder="例：1-2-3 ◯◯ハイツ203"
              value={form.address2}
              onChange={(e) => update({ address2: e.target.value })}
            />
          </div>
        </div>

        {/* 電話番号・緊急連絡先 */}
        <div className="space-y-3">
          <div>
            <label className="block font-medium">
              電話番号 <Req />
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                aria-label="電話番号・市外局番"
                inputMode="numeric"
                pattern="\d*"
                autoComplete="tel-area-code"
                maxLength={4}
                className="w-[6ch] rounded border p-2 tabular-nums"
                placeholder="090"
                value={p1}
                onChange={(e) => setPhonePart(0, e.target.value)}
                required
              />
              <span aria-hidden>-</span>
              <input
                aria-label="電話番号・市内局番"
                inputMode="numeric"
                pattern="\d*"
                autoComplete="tel-local-prefix"
                maxLength={4}
                className="w-[7ch] rounded border p-2 tabular-nums"
                placeholder="1234"
                value={p2}
                onChange={(e) => setPhonePart(1, e.target.value)}
                required
              />
              <span aria-hidden>-</span>
              <input
                aria-label="電話番号・加入者番号"
                inputMode="numeric"
                pattern="\d*"
                autoComplete="tel-local-suffix"
                maxLength={4}
                className="w-[7ch] rounded border p-2 tabular-nums"
                placeholder="5678"
                value={p3}
                onChange={(e) => setPhonePart(2, e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="en" className="block font-medium">
              緊急連絡先氏名 <Req />
            </label>
            <input
              id="en"
              className="mt-1 w-full rounded border p-2"
              placeholder="例：練馬ツツジ"
              value={form.emergencyContactName}
              onChange={(e) => update({ emergencyContactName: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="er" className="block font-medium">
              緊急連絡先続柄 <Req />
            </label>
            <input
              id="er"
              className="mt-1 w-full rounded border p-2"
              placeholder="例：母、父、配偶者等"
              value={form.emergencyContactRelationship}
              onChange={(e) => update({ emergencyContactRelationship: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block font-medium">
              緊急連絡先電話番号 <Req />
            </label>
            <div className="mt-1 flex items-center gap-2">
              <input
                aria-label="緊急連絡先・市外局番"
                inputMode="numeric"
                pattern="\d*"
                autoComplete="tel-area-code"
                maxLength={4}
                className="w-[6ch] rounded border p-2 tabular-nums"
                placeholder="080"
                value={ep1}
                onChange={(e) => setEmergencyPhonePart(0, e.target.value)}
                required
              />
              <span aria-hidden>-</span>
              <input
                aria-label="緊急連絡先・市内局番"
                inputMode="numeric"
                pattern="\d*"
                autoComplete="tel-local-prefix"
                maxLength={4}
                className="w-[7ch] rounded border p-2 tabular-nums"
                placeholder="1234"
                value={ep2}
                onChange={(e) => setEmergencyPhonePart(1, e.target.value)}
                required
              />
              <span aria-hidden>-</span>
              <input
                aria-label="緊急連絡先・加入者番号"
                inputMode="numeric"
                pattern="\d*"
                autoComplete="tel-local-suffix"
                maxLength={4}
                className="w-[7ch] rounded border p-2 tabular-nums"
                placeholder="5678"
                value={ep3}
                onChange={(e) => setEmergencyPhonePart(2, e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="block font-medium">
            利用者へ伝えておきたいこと
            <br />
            自己紹介等 <Opt />
          </label>
          <textarea
            id="bio"
            rows={5}
            className="mt-1 w-full rounded border p-2"
            placeholder="例：お役に立てるよう、精一杯頑張ります！"
            value={form.bio ?? ""}
            onChange={(e) => update({ bio: e.target.value })}
          />
        </div>
      </div>

      <StepFooter
        onNext={handleNext}
        // secondary={
        // <Button
        //   variant="s_secondary"
        //   size="lg"
        //   equalWidth
        //   onClick={async () => {
        //     if (confirm("登録をやめますか？下書きは削除されます。")) {
        //       await signOut(auth); // 👈 ←これがポイント
        //       clearDraft();
        //       router.push("/supporter-login");
        //     }
        //   }}
        // >
        //   やっぱりやめる
        //   <br />
        //   （ログアウト）
        // </Button>
        // }
        showBack={false}
      />
    </>
  );
}
