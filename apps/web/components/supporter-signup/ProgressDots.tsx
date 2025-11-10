// components/supporter-signup/ProgressDots.tsx
"use client";
import React from "react";
import { cn } from "@/lib/cn";

export default function ProgressDots({ step }: { step: 1 | 2 | 3 | 4 }) {
  const dots = [1, 2, 3, 4] as const;
  return (
    <div className="flex items-center justify-center gap-3">
      {dots.map((d) => (
        <span
          key={d}
          aria-label={`step ${d}`}
          className={cn(
            "inline-block h-3 w-3 rounded-full",
            d <= step ? "bg-[var(--btn-primary-bg)]" : "bg-gray-300"
          )}
        />
      ))}
    </div>
  );
}
