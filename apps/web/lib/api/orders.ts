// apps/web/lib/api/orders.ts
// ==========================================================
// 受注関連API呼び出し関数まとめ
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
 * GET /api/orders
 */
export async function fetchOrders(): Promise<OrderItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) throw new Error("環境変数 NEXT_PUBLIC_API_BASE_URL が設定されていません。");

    const token = await getAuthToken();

    const response = await fetch(`${baseUrl}/api/orders`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
 * POST /api/orders/:requestId
 */
export async function createOrder(requestId: number): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) throw new Error("環境変数 NEXT_PUBLIC_API_BASE_URL が設定されていません。");

    const token = await getAuthToken();

    const response = await fetch(`${baseUrl}/api/orders/${requestId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`受注登録失敗: ${response.status} ${response.statusText}`);
    }

    console.log("受注登録成功");
  } catch (error) {
    console.error("受注登録に失敗しました:", error);
    throw error;
  }
}

/**
 * ステータスを更新する関数
 * PATCH /api/orders/:requestId
 */
export async function updateOrderStatus(requestId: number, updateStatus: string): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) throw new Error("環境変数 NEXT_PUBLIC_API_BASE_URL が設定されていません。");
    
    const token = await getAuthToken();

    const response = await fetch(`${baseUrl}/api/orders/${requestId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ updateStatus }),
    });

    if (!response.ok) {
      throw new Error(`ステータス更新失敗: ${response.status} ${response.statusText}`);
    }

    console.log(`ステータス更新成功: ${updateStatus}`);
  } catch (error) {
    console.error("ステータス更新に失敗しました:", error);
    throw error;
  }
}

/**
 * 依頼をキャンセルする関数
 * PATCH /api/orders/:requestId
 */
export async function cancelRequest(requestId: string | number): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL が設定されていません。");

    const token = await getAuthToken();

    const res = await fetch(`${baseUrl}/api/orders/${requestId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ updateStatus: "canceled" }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`キャンセル失敗: ${res.status} ${res.statusText} ${errText}`);
    }

    console.log("依頼キャンセル完了");
  } catch (error) {
    console.error("依頼キャンセルに失敗しました:", error);
    throw error;
  }
}

/**
 * 利用者がサポーター変更を希望する関数
 * PATCH /api/orders/:requestId
 */
export async function requestChangeSupporter(requestId: string | number): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) throw new Error("NEXT_PUBLIC_API_BASE_URL が設定されていません。");

    const token = await getAuthToken();

    const res = await fetch(`${baseUrl}/api/orders/${requestId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ 追加
      },
      body: JSON.stringify({ updateStatus: "refusal" }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`サポーター変更依頼失敗: ${res.status} ${res.statusText} ${errText}`);
    }

    console.log("サポーター変更依頼完了");
  } catch (error) {
    console.error("サポーター変更依頼に失敗しました:", error);
    throw error;
  }
}