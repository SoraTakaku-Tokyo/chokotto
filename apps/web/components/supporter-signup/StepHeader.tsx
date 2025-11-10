// components/supporter-signup/StepHeader.tsx
"use client";
import React from "react";
import ProgressDots from "./ProgressDots";

export default function StepHeader({
  title,
  description,
  step
}: {
  title: string;
  description?: string;
  step: 1 | 2 | 3 | 4;
}) {
  return (
    <header className="space-y-3">
      <h1 className="text-2xl font-bold">{title}</h1>
      {description && <p className="text-base text-gray-700">{description}</p>}
      <ProgressDots step={step} />
    </header>
  );
}
