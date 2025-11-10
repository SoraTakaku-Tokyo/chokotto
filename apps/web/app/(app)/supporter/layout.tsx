// apps/web/app/(app)/supporter/layout.tsx

import AuthGuard from "@/components/auth/AuthGuard";

export default function SupporterLayout({ children }: { children: React.ReactNode }) {
  return (
    // AuthGuardでサポーターパス内のすべてのコンテンツをラップ
    <AuthGuard>{children}</AuthGuard>
  );
}
