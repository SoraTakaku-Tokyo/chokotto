// apps/web/app/layout.tsx
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { AuthProvider } from "@/lib/auth/authContext";
import RouteThemeBodyClass from "./RouteThemeBodyClass";

export const metadata = { title: "ちょこっと" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="text-gray-900">
        {/* ルートに応じて body に theme クラスを付与 */}
        <RouteThemeBodyClass />
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
