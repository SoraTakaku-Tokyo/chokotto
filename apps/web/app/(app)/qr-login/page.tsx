// apps/web/app/(app)/qr-login/page.tsx

import QrScanner from "@/components/auth/QrScanner";

const QrLoginPage = () => (
  <div className="p-4">
    {/* QrScannerコンポーネントを配置 */}
    <QrScanner />
  </div>
);

export default QrLoginPage;
