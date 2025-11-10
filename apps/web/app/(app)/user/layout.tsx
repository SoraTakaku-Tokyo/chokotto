// apps/web/app/(app)/user/layout.tsx
export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    // 画面全体に背景色を適用（幅いっぱい＆高さ100vh以上）
    <div className="min-h-screen w-full bg-[var(--user-bg)]">
      {/* コンテンツの横幅・余白・文字サイズはここで統一 */}
      <main className="user-root font-jp mx-auto max-w-md space-y-6 p-6 font-semibold leading-relaxed antialiased">
        {children}
      </main>
    </div>
  );
}
