"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const spinnerStyles = cva("animate-spin", {
  variants: {
    size: {
      sm: "h-6 w-6",
      md: "h-8 w-8",
      lg: "h-10 w-10"
    },
    color: {
      orange: "text-orange-500",
      blue: "text-blue-500",
      gray: "text-gray-500"
    }
  },
  defaultVariants: {
    size: "lg",
    color: "orange"
  }
});

const overlayStyles = cva("fixed inset-0 z-50 flex flex-col items-center justify-center", {
  variants: {
    background: {
      light: "bg-white/70",
      dark: "bg-black/50",
      transparent: "bg-transparent"
    }
  },
  defaultVariants: {
    background: "light"
  }
});

export interface LoadingSpinnerProps
  extends VariantProps<typeof spinnerStyles>,
    VariantProps<typeof overlayStyles> {
  message?: string;
  overlay?: boolean;
  className?: string;
}

export function LoadingSpinner({
  size,
  color,
  background,
  message,
  overlay = true,
  className,
  ...props
}: LoadingSpinnerProps) {
  const spinner = (
    <svg
      className={cn(spinnerStyles({ size, color }), className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );

  const content = (
    <>
      {spinner}
      {message && (
        <span
          className="text-lg font-medium text-gray-700"
          dangerouslySetInnerHTML={{ __html: message }}
        />
      )}
    </>
  );

  if (overlay) {
    return <div className={overlayStyles({ background })}>{content}</div>;
  }

  return <div className="flex flex-col items-center justify-center gap-3">{content}</div>;
}
