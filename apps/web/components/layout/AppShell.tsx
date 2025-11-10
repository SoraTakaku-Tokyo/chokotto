"use client";

import React from "react";
// import Nav from "./Nav"; // Nav コンポーネントを読み込み
// import Footer from "./Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* <Nav /> */}
      <main className="container mx-auto max-w-3xl p-4">{children}</main>
      {/* <footer className="mt-auto border-t p-4 text-center text-xs text-gray-500">ちょこっと</footer> */}
      {/* <Footer /> */}
    </div>
  );
}
