"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import React from "react";

type Props = {
  onNext?: () => void;
  onBack?: () => void; // ←追加
  nextLabel?: string;
  backLabel?: string;
  showBack?: boolean;
  secondary?: React.ReactNode;
};

export default function StepFooter({
  onNext,
  onBack,
  nextLabel = "次へ",
  backLabel = "戻る",
  showBack = true,
  secondary
}: Props) {
  const router = useRouter();

  return (
    <div className="mt-10 flex flex-col items-center gap-5">
      <Button onClick={onNext} variant="s_primary" size="lg" equalWidth>
        {nextLabel}
      </Button>

      {secondary}

      {showBack && (
        <Button
          variant="s_secondary"
          size="lg"
          equalWidth
          onClick={() => {
            if (onBack) {
              onBack(); // ← 明示指定があればそれを実行
            } else {
              router.back(); // ← そうでなければ履歴戻り
            }
          }}
        >
          {backLabel}
        </Button>
      )}
    </div>
  );
}
