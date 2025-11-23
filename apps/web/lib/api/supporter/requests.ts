// apps/web/lib/api/supporter/requests.ts
// ==========================================================
// サポーター側の依頼関連APIを呼び出してデータを取得・登録する関数
// ==========================================================

import { getAuth } from "firebase/auth";

function withBase(baseUrl: string, path: string) {
  const base = baseUrl.replace(/\/+$/, ""); // 末尾スラッシュ除去
  const p = path.replace(/^\/+/, ""); // 先頭スラッシュ除去
  const url = `${base}/${p}`; // 1本で連結
  // ここで直接デバッグログを出す
  console.debug("[withBase] resolved URL:", url);
  return url;
}

export type RequestItem = {
  id: number;
  title: string;
  description?: string;
  status: string;
  scheduledDate: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  workLocation1: string;
  workLocation2?: string;
  requestedAt: string;
  user: {
    id: string;
    role: string;
    gender?: string;
    address1: string;
    ageGroup: string;
    bio?: string;
  };
};

/**
 * Firebaseのトークンを取得して返す関数
 */
async function getAuthToken(): Promise<string | null> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

/**
 * 依頼一覧を取得する関数
 * GET /api/supporter/requests
 */
export async function fetchSupporterRequests(): Promise<RequestItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!baseUrl) {
      throw new Error("環境変数 NEXT_PUBLIC_API_BASE_URL が設定されていません。");
    }

    const token = await getAuthToken();
    if (!token) throw new Error("ユーザーがログインしていません。");

    const res = await fetch(withBase(baseUrl, "/api/supporter/requests"), {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error(`リクエスト失敗: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (error) {
    console.error("依頼一覧の取得に失敗しました:", error);
    throw error;
  }
}

/**
 * 依頼詳細を取得する関数
 * GET /api/supporter/requests/:requestId
 */
export async function fetchSupporterRequestDetail(requestId: number): Promise<RequestItem> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!baseUrl) {
      throw new Error("環境変数 NEXT_PUBLIC_API_BASE_URL が設定されていません。");
    }

    const token = await getAuthToken();
    if (!token) throw new Error("ユーザーがログインしていません。");

    const response = await fetch(withBase(baseUrl, `/api/supporter/requests/${requestId}`), {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error(`リクエスト失敗: ${response.status} ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("依頼詳細の取得に失敗しました:", error);
    throw error;
  }
}
