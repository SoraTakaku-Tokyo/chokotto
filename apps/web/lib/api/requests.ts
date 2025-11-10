// apps/web/lib/api/requests.ts
// ==========================================================
// 依頼関連APIを呼び出してデータを取得・登録する関数
// ==========================================================

// function withBase(baseUrl: string, path: string) {
//   const base = baseUrl.replace(/\/+$/, ""); // 末尾スラッシュ除去
//   const p = path.replace(/^\/+/, ""); // 先頭スラッシュ除去
//   return `${base}/${p}`; // 1本で連結

// }

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
 * 依頼一覧を取得する関数
 * GET /api/requests
 * @param role "user" または "supporter"（開発モード時のみ有効）
 */
export async function fetchRequests(role?: "user" | "supporter"): Promise<RequestItem[]> {
  try {
    // baseURLは .env.local に記載（例：NEXT_PUBLIC_API_BASE_URL=http://localhost:3001）
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!baseUrl) {
      throw new Error("環境変数 NEXT_PUBLIC_API_BASE_URL が設定されていません。");
    }

    const headers: HeadersInit = { "Content-Type": "application/json" };
    // 💡 roleが渡された場合のみヘッダーを付与
    if (role) headers["X-Debug-Role"] = role;

    const url = withBase(baseUrl, "/api/requests");

    // Firebaseログインは見せるが、API呼び出しは固定モードでスキップ
    const res = await fetch(url, {
      cache: "no-store",
      headers
    });

    if (!res.ok) {
      throw new Error(`リクエスト失敗: ${res.status} ${res.statusText}`);
    }

    // JSONをパースして返す
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("依頼一覧の取得に失敗しました:", error);
    throw error;
  }
}

/**
 * 依頼新規登録を行う関数
 * POST /api/requests
 */
export async function createRequest(formData: {
  description?: string;
  scheduledDate: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  location1?: string;
}): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!baseUrl) {
      throw new Error("環境変数 NEXT_PUBLIC_API_BASE_URL が設定されていません。");
    }

    const response = await fetch(withBase(baseUrl, "/api/requests"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      throw new Error(`依頼登録失敗: ${response.status} ${response.statusText}`);
    }

    console.log("依頼登録成功");
  } catch (error) {
    console.error("依頼登録に失敗しました:", error);
    throw error;
  }
}

/**
 * 依頼詳細を取得する関数
 * GET /api/requests/:requestId
 */
export async function fetchRequestDetail(
  requestId: number,
  role?: "user" | "supporter"
): Promise<RequestItem> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!baseUrl) {
      throw new Error("環境変数 NEXT_PUBLIC_API_BASE_URL が設定されていません。");
    }

    // role が渡された場合のみデバッグヘッダーを追加
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (role) headers["X-Debug-Role"] = role;

    const url = withBase(baseUrl, `/api/requests/${requestId}`);
    const response = await fetch(url, { cache: "no-store", headers });

    if (!response.ok) {
      throw new Error(`リクエスト失敗: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // 💡 利用者側の整形処理を追加
    if (role === "user" && data.supporter) {
      return {
        ...data,
        supporterName: `${data.supporter.familyName ?? ""}${data.supporter.firstName ?? ""}`,
        supporterPhone: data.supporter.phoneNumber ?? "",
        supporterNote: data.supporter.bio ?? "",
        supporterAvatarUrl: data.supporter.profileImageUrl ?? ""
      };
    }

    return data;
  } catch (error) {
    console.error("依頼詳細の取得に失敗しました:", error);
    throw error;
  }
}

/**
 * 利用者が依頼をキャンセルする関数
 * PATCH /api/orders/:requestId
 */
export async function cancelRequest(requestId: string | number): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) throw new Error("環境変数 NEXT_PUBLIC_API_BASE_URL が設定されていません。");

  // updateStatus に "canceled" を指定
  const res = await fetch(`${baseUrl}/api/orders/${requestId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Role": "user"
    },
    body: JSON.stringify({ updateStatus: "canceled" })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`キャンセル失敗: ${res.status} ${res.statusText} ${errText}`);
  }

  console.log("依頼キャンセル完了");
}

/**
 * 利用者がサポーター変更を希望する関数
 * PATCH /api/orders/:requestId
 */
export async function requestChangeSupporter(requestId: string | number): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!baseUrl) throw new Error("環境変数 NEXT_PUBLIC_API_BASE_URL が設定されていません。");

  // updateStatus に "refusal" を指定（サポーター辞退扱い）
  const res = await fetch(`${baseUrl}/api/orders/${requestId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Role": "user"
    },
    body: JSON.stringify({ updateStatus: "refusal" })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`サポーター変更依頼失敗: ${res.status} ${res.statusText} ${errText}`);
  }

  console.log("サポーター変更依頼完了");
}
