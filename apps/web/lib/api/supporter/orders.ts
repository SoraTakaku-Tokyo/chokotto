// apps/web/lib/api/suppurter/orders.ts
// ==========================================================
// サポーター側の受注関連API呼び出し関数まとめ
// ==========================================================

import { getAuth } from "firebase/auth";

export type OrderItem = {
  id: number;
  description?: string;
  status: string;
  scheduledDate: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  location1: string;
  user: {
    id: string;
    role: string;
    gender?: string;
    address1: string;
    ageGroup: string;
    bio?: string;
  };
  orderStatus: string; // orderテーブル側のstatus
};

/**
 * Firebaseのトークンを取得する関数
 */
async function getAuthToken(): Promise<string> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("ユーザーがログインしていません。");
  return await user.getIdToken();
}

/**
 * 引受リストを取得する関数
 * GET /api/supporter/orders
 */
export async function fetchOrders(): Promise<OrderItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) throw new Error("環境変数 NEXT_PUBLIC_API_BASE_URL が設定されていません。");

    const token = await getAuthToken();

    const response = await fetch(`${baseUrl}/api/supporter/orders`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`リクエスト失敗: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("引受リストの取得に失敗しました:", error);
    throw error;
  }
}

/**
 * 依頼を引き受ける関数
 * POST /api/supporter/orders/:requestId
 */
export async function createOrder(requestId: number): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) throw new Error("環境変数 NEXT_PUBLIC_API_BASE_URL が設定されていません。");

    const token = await getAuthToken();

    const response = await fetch(`${baseUrl}/api/supporter/orders/${requestId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`引受登録失敗: ${response.status} ${response.statusText}`);
    }

    console.log("引受登録成功");
  } catch (error) {
    console.error("引受登録に失敗しました:", error);
    throw error;
  }
}
