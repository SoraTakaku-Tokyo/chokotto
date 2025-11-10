"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { Html5Qrcode } from "html5-qrcode";

// AuthContextとAPI関数をインポート
import { useAuth } from "../../lib/auth/authContext";
import { exchangeQrToken } from "../../lib/auth/qrAuth";

// 💡 ステータス管理用の列挙型
enum ScannerState {
  INITIAL = "INITIAL", // 初期状態（カスタムボタン表示）
  SCANNING = "SCANNING", // カメラ起動中
  AUTHENTICATING = "AUTHENTICATING" // 認証中（カメラ停止）
}

const QrScanner = () => {
  const router = useRouter();
  const { user, loading, auth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [scannerState, setScannerState] = useState<ScannerState>(ScannerState.INITIAL);
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null); // カメラの設定

  const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 }
  }; // 認証成功時の処理

  const handleScanSuccess = useCallback(
    async (qrToken: string) => {
      setScannerState(ScannerState.AUTHENTICATING);
      if (html5QrCode) {
        html5QrCode
          .stop()
          .catch((e: unknown) => console.error("Failed to stop scanner after scan success", e));
      }

      try {
        const customToken = await exchangeQrToken(qrToken);
        await signInWithCustomToken(auth, customToken);
        setError(null);
      } catch (err: unknown) {
        console.error("Authentication process failed:", err); // エラーオブジェクトがErrorインスタンスであることを確認してメッセージを取得
        const errorMessage =
          err instanceof Error ? err.message : "認証に失敗しました。QRコードを再度ご確認ください。";
        setError(errorMessage);
        setScannerState(ScannerState.INITIAL); // 失敗したら初期状態に戻す
      }
    },
    [auth, html5QrCode]
  );

  const startCamera = useCallback(async () => {
    setError(null);
    if (!html5QrCode) return;
    setScannerState(ScannerState.SCANNING);
    try {
      await html5QrCode.start({ facingMode: "environment" }, config, handleScanSuccess, () => {});
    } catch (err: unknown) {
      console.error("Camera startup failed:", err);
      setError("カメラへのアクセスを許可してください。");
      setScannerState(ScannerState.INITIAL);
    }
  }, [html5QrCode, config, handleScanSuccess]);
  useEffect(() => {
    const scannerId = "reader";
    const localHtml5QrCode = new Html5Qrcode(scannerId, false);
    setHtml5QrCode(localHtml5QrCode);

    if (loading) return () => {};

    if (user) {
      router.push("/user");
      return () => {};
    } // 3. クリーンアップ関数
    return () => {
      // 💡 修正: anyアサーションを削除し、localHtml5QrCodeが存在する場合のみ停止を試みる
      // Html5Qrcode.stop() は、スキャン中でない場合に呼び出されるとエラーを返すため、try...catchを使用
      try {
        // isScanning() が定義されていない場合はエラーになるため、Promiseが解決できるかstopを試みる
        if (localHtml5QrCode) {
          localHtml5QrCode.stop().catch((e: unknown) => {
            // このcatchは、スキャン中でない場合に発生するエラーを無視するために使用

            console.warn("Scanner stop warning (may not have been scanning):", e);
          });
        }
      } catch (e: unknown) {
        // 致命的なエラーが起きた場合のみログ

        console.error("Failed to stop scanner on unmount:", e);
      }
    };
  }, [loading, user, router]);

  if (loading || scannerState === ScannerState.AUTHENTICATING) {
    return (
      <div>
        {scannerState === ScannerState.AUTHENTICATING ? "認証中..." : "認証情報を確認中..."}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6">
            <h2 className="mb-4 text-2xl font-bold">QRコードをスキャンしてください</h2>
                  <div id="reader" style={{ width: "100%", maxWidth: "400px" }} />           {" "}
      {/* カスタムUIコンポーネント: 初期状態でのみ表示 */}     {" "}
      {scannerState === ScannerState.INITIAL && (
        <div
          className="mt-4 flex flex-col items-center justify-center rounded-lg border border-gray-300 p-10 shadow-md"
          style={{ width: "100%", maxWidth: "400px" }}
        >
                      <p className="mb-4 text-gray-600">カメラを起動してQRコードを読み取ります</p> 
                   {" "}
          <button
            onClick={startCamera}
            className="rounded-lg bg-[#f4753f] px-6 py-3 font-semibold text-white transition duration-150 hover:bg-[#e36734]"
          >
                            📸 カメラを起動する            {" "}
          </button>
                 {" "}
        </div>
      )}
                  {error && <p className="mt-4 text-center text-red-500">{error}</p>}   {" "}
    </div>
  );
};

export default QrScanner;
