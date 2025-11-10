// apps/web/lib/api/orders.ts
// ==========================================================
// 受注関連API呼び出し関数まとめ
// ==========================================================

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
 * 引受リストを取得する関数
 * GET /api/orders
 */
export async function fetchOrders(): Promise<OrderItem[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) throw new Error("環境変数 NEXT_PUBLIC_API_BASE_URL が設定されていません。");

    const url = `${baseUrl}/api/orders`;

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`リクエスト失敗: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
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

    const url = `${baseUrl}/api/orders/${requestId}`;
    const response = await fetch(url, { method: "POST" });

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
    const url = `${baseUrl}/api/orders/${requestId}`;

    const response = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updateStatus })
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
