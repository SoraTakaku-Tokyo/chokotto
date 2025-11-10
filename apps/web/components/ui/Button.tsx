"use client";

import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonStyles = cva(
  "inline-flex items-center justify-center rounded-lg font-medium shadow-md transition " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "disabled:cursor-not-allowed disabled:opacity-40",
  {
    variants: {
      variant: {
        s_primary:
          "bg-[var(--btn-primary-bg)] text-gray-900 hover:bg-[var(--btn-primary-hov)] focus-visible:ring-[var(--btn-primary-ring)]",
        s_secondary:
          "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-fg)] hover:bg-[var(--btn-secondary-hov)] focus-visible:ring-[var(--btn-secondary-ring)]",
        ghost:
          "bg-transparent text-[var(--btn-ghost-fg)] hover:bg-[var(--btn-ghost-hov)] focus-visible:ring-gray-400",
        danger: "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500",

        u_primary:
          "font-semibold bg-[var(--user-primary-bg)] text-white hover:bg-[var(--user-primary-hov)] focus-visible:ring-[var(--user-primary-ring)]",
        u_secondary:
          "font-semibold bg-[var(--user-secondary-bg)] text-gray-900 hover:bg-[var(--user-secondary-hov)] focus-visible:ring-[var(--user-secondary-ring)]",
        /* ← 追加：戻る等に使うニュートラル（グレー） */
        u_tertiary:
          "font-semibold bg-[var(--user-tertiary-bg)] text-white hover:bg-[var(--user-tertiary-hov)] focus-visible:ring-[var(--user-tertiary-ring)]"
      },

      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-10 px-4 text-base",
        lg: "h-12 px-6 text-base",
        block: "min-h-14 w-full px-6 py-3 text-xl leading-tight", // 文言が2行になった時用
        block_tight: "min-h-12 w-full px-5 py-2 text-lg leading-tight tracking-tight"
      },
      fullWidth: { true: "w-full" },
      equalWidth: { true: "" },
      center: { true: "mx-auto" },
      loading: { true: "relative pointer-events-none" }
    },
    compoundVariants: [
      { size: "sm", equalWidth: true, class: "w-28" }, // ~112px
      { size: "md", equalWidth: true, class: "w-32" }, // ~128px
      { size: "lg", equalWidth: true, class: "w-60" } // ~160px
    ],
    defaultVariants: { variant: "danger", size: "md" }
  }
);

// バリアント系（共通）
type VariantBase = VariantProps<typeof buttonStyles> & {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
  /** 追加クラス（外側から上書き・拡張） */
  className?: string;
};

// a要素として使う場合（href必須）
type LinkButtonProps = VariantBase &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "className"> & {
    href: string;
  };

// button要素として使う場合
type NativeButtonProps = VariantBase &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className">;

// 判別共用体（hrefの有無で分岐）
type ButtonProps = LinkButtonProps | NativeButtonProps;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(props, ref) {
  const {
    variant,
    size,
    fullWidth,
    equalWidth,
    loading,
    leftIcon,
    rightIcon,
    children,
    className,
    ...rest
  } = props as ButtonProps;

  const cls = cn(buttonStyles({ variant, size, fullWidth, equalWidth, loading }), className);

  if ("href" in props) {
    // Linkとして（refは渡さない）
    const { href, ...anchorRest } = rest as Omit<LinkButtonProps, keyof VariantBase>;
    return (
      <Link href={href} className={cls} aria-busy={loading || undefined} {...anchorRest}>
        <Content leftIcon={leftIcon} rightIcon={rightIcon} loading={!!loading}>
          {children}
        </Content>
      </Link>
    );
  }

  // ネイティブbuttonとして
  const buttonRest = rest as Omit<NativeButtonProps, keyof VariantBase>;
  return (
    <button className={cls} aria-busy={loading || undefined} ref={ref} {...buttonRest}>
      <Content leftIcon={leftIcon} rightIcon={rightIcon} loading={!!loading}>
        {children}
      </Content>
    </button>
  );
});

function Content({
  children,
  leftIcon,
  rightIcon,
  loading
}: {
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading: boolean;
}) {
  return (
    <>
      {leftIcon ? <span className="mr-2 inline-flex">{leftIcon}</span> : null}
      <span className={loading ? "opacity-0" : undefined}>{children}</span>
      {rightIcon ? <span className="ml-2 inline-flex">{rightIcon}</span> : null}
      {loading ? (
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
          <Spinner />
        </span>
      ) : null}
    </>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" role="img" aria-label="loading">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
        opacity="0.25"
      />
      <path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" strokeWidth="4" fill="none" />
    </svg>
  );
}
