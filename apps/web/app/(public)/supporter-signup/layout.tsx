// app/(public)/supporter-signup/layout.tsx
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md p-5">
      <div className="rounded-2xl bg-white p-5 shadow-sm">{children}</div>
    </div>
  );
}
