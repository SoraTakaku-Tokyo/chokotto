// S3 app/(public)/supporter-signup/photo/page.tsx

"use client";

import React, { useEffect, useRef, useState } from "react";
import StepHeader from "@/components/supporter-signup/StepHeader";
import StepFooter from "@/components/supporter-signup/StepFooter";
import { useRouter } from "next/navigation";
import { loadDraft, saveDraft } from "@/lib/signupDraft";
import { Button } from "@/components/ui/Button";

export default function SignupPhotoPage() {
  const router = useRouter();
  const [photo, setPhoto] = useState<string>(""); // dataURL
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const d = loadDraft();
    setPhoto(d.profileImageUrl ?? "");
  }, []);

  const onPick = () => inputRef.current?.click();

  async function fileToDataUrl(file: File): Promise<string> {
    const bitmap = await createImageBitmap(file);
    // 画像のリサイズ（最長辺1600px）
    const max = 1600;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d not available");
    ctx.drawImage(bitmap, 0, 0, width, height);
    // 画質は0.92程度で
    return canvas.toDataURL("image/jpeg", 0.92);
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("画像ファイルを選択してください。");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(f);
      setPhoto(dataUrl);
      const d = loadDraft();
      saveDraft({ ...d, profileImageUrl: dataUrl });
    } catch (err) {
      console.error(err);
      alert("画像の読み込みに失敗しました。別の画像でお試しください。");
    } finally {
      // 同じファイルを続けて選んでも change になるよう値リセット
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onRemove() {
    if (!photo) return;
    if (!confirm("写真を削除しますか？")) return;
    setPhoto("");
    const d = loadDraft();
    saveDraft({ ...d, profileImageUrl: "" });
  }

  function onNext() {
    if (!photo) {
      if (!confirm("写真が未登録です。このまま進みますか？")) return;
    }
    router.push("/supporter-signup/review");
  }

  return (
    <>
      <StepHeader step={3} title="顔写真登録" />
      <div className="mt-5 space-y-4 text-lg">
        <p className="text-gray-700">
          ご本人確認のため、顔写真の登録をお願いします。
          <br />
          明るい場所で、正面から撮影された写真をご用意ください。
        </p>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          {photo ? (
            <div className="space-y-4">
              <img
                src={photo}
                alt="登録予定の顔写真"
                className="mx-auto aspect-square h-auto w-64 rounded-2xl object-cover shadow"
              />
              <div className="flex flex-col items-center gap-3">
                <Button variant="s_secondary" size="lg" equalWidth onClick={onPick}>
                  他の写真にする
                </Button>
                <Button variant="s_secondary" size="lg" equalWidth onClick={onRemove}>
                  この写真を削除
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="text-gray-600">まだ写真が登録されていません</div>
              <Button variant="s_primary" size="lg" equalWidth onClick={onPick}>
                写真を選ぶ
              </Button>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          //   capture="environment"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      <StepFooter onNext={onNext} showBack onBack={() => router.push("/supporter-signup")} />
    </>
  );
}
