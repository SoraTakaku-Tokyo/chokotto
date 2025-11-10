// apps/web/lib/auth/qrAuth.ts

/**
 * QRトークンをバックエンドAPIに送信し、Firebase Custom Tokenを取得する
 * @param qrToken - QRコードから読み取ったワンタイムトークン
 * @returns Firebase Custom Token
 */

export async function exchangeQrToken(qrToken: string): Promise<string> {
  // 💡 修正点: APIのベースURLを環境変数から取得
  // 環境変数が設定されていない場合に備え、フォールバック値 ('http://localhost:3001') を設定
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  // バックエンドのルーティング設定に基づいた完全なパスを構築
  const apiEndpoint = `${API_BASE_URL}/api/auth/qr-login`;

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: qrToken })
    });

    // HTTPステータスコードが200番台以外の場合はエラーとして処理
    if (!response.ok) {
      // 💡 ESLint回避: APIからのエラーメッセージを使用
      const errorData = await response.json().catch(() => ({ message: "不明な認証エラー" }));
      // throw文は必須ロジックのため、ここは許可
      throw new Error(errorData.message || "認証失敗");
    }

    const data = await response.json();

    if (!data.customToken || typeof data.customToken !== "string") {
      // throw文は必須ロジックのため、ここは許可
      throw new Error("APIからのトークン形式が無効です");
    }

    return data.customToken;
  } catch (error) {
    // 💡 ESLint回避: サーバー通信エラーはログに記録

    console.error("API呼び出しエラー:", error);
    throw error;
  }
}
