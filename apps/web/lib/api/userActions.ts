// apps/web/lib/api/requests.ts
// ==========================================================
// 依頼関連APIを呼び出してデータを取得・登録する関数
// ==========================================================

// function withBase(baseUrl: string, path: string) {
//   const base = baseUrl.replace(/\/+$/, ""); // 末尾スラッシュ除去
//   const p = path.replace(/^\/+/, ""); // 先頭スラッシュ除去
//   return `${base}/${p}`; // 1本で連結

// }

// 利用者モック用追加④
// ✅ モックON判定（ビルド時 env / クエリ / localStorage で切替。最優先で true を返す）
const isMockOn = (() => {
  // 1) ビルド時の NEXT_PUBLIC_ フラグ（あれば最優先）
  if (process.env.NEXT_PUBLIC_API_MOCK === "1") return true;

  // 2) クエリで一時的に切替（?mock=1 / ?mock=0）
  if (typeof window !== "undefined") {
    const q = new URLSearchParams(window.location.search);
    if (q.get("mock") === "1") localStorage.setItem("API_MOCK", "1");
    if (q.get("mock") === "0") localStorage.removeItem("API_MOCK");
    // 3) localStorage に保存されていればモックON
    if (localStorage.getItem("API_MOCK") === "1") return true;
  }

  return false;
})();

// ✅ 一括モックスイッチ（env / ?mock=1 / localStorage のいずれでもON）
const apiMockOn = (() => {
  if (process.env.NEXT_PUBLIC_API_MOCK === "1") return true;
  if (typeof window !== "undefined") {
    const q = new URLSearchParams(window.location.search);
    if (q.get("mock") === "1") localStorage.setItem("API_MOCK", "1");
    if (q.get("mock") === "0") localStorage.removeItem("API_MOCK");
    if (localStorage.getItem("API_MOCK") === "1") return true;
  }
  return false;
})();

// ✅ タイムアウト付きPOST（ハング対策）
async function postJsonWithTimeout(url: string, body: unknown, timeoutMs = 3000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
      signal: controller.signal
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.json().catch(() => ({}));
  } finally {
    clearTimeout(t);
  }
}

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
 */
export async function fetchRequests(): Promise<RequestItem[]> {
  try {
    // 利用者モック用追加① まずは無条件でモック判定を評価
    if (isMockOn) {
      await new Promise((r) => setTimeout(r, 120));
      return USER_REQUESTS_MOCK;
    }

    // // baseURLは .env.local に記載（例：NEXT_PUBLIC_API_BASE_URL=http://localhost:3001）
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!baseUrl) {
      // 利用者モック用追加⑤
      console.warn("[fetchRequests] NEXT_PUBLIC_API_BASE_URL 未設定のためモックを返します。");
      await new Promise((r) => setTimeout(r, 80));
      return USER_REQUESTS_MOCK;
      // throw new Error("環境変数 NEXT_PUBLIC_API_BASE_URL が設定されていません。");
    }

    // Firebaseログインは見せるが、API呼び出しは固定モードでスキップ
    const res = await fetch(withBase(baseUrl, "/api/requests"), {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error(`リクエスト失敗: ${res.status} ${res.statusText}`);
    }

    // JSONをパースして返す
    const data = await res.json();
    return data;
  } catch (error) {
    // 利用者モック用追加② API失敗時はモックにフォールバック（開発中の遷移確認用）
    console.warn("[fetchRequests] API失敗のためモックにフォールバックします:", error);
    return USER_REQUESTS_MOCK as unknown as RequestItem[];
    //   console.error("依頼一覧の取得に失敗しました:", error);
    //   throw error;
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
export async function fetchRequestDetail(requestId: number): Promise<RequestItem> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!baseUrl) {
      throw new Error("環境変数 NEXT_PUBLIC_API_BASE_URL が設定されていません。");
    }

    const url = withBase(baseUrl, `/api/requests/${requestId}`);
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`リクエスト失敗: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("依頼詳細の取得に失敗しました:", error);
    throw error;
  }
}

// 以下、利用者モック用追加③
/** 利用者側の一覧/詳細で使う最小DTO */
export type UserRequestDTO = {
  id: number | string;
  title: string;
  status: "open" | "matched" | "confirmed" | string;
  scheduledDate?: string;
  scheduledStartTime?: string | null;
  scheduledEndTime?: string | null;
  workLocation1?: string;
  description?: string | null;
  supporterName?: string | null;
  supporterPhone?: string | null;
};

/** 画面遷移確認用のモックデータ（id=100 は募集中、id=101 はサポーター決定） */
const USER_REQUESTS_MOCK: RequestItem[] = [
  {
    id: 100,
    title: "買い物代行（牛乳・パンなど）",
    description: "重いものは少なめでお願いします。",
    status: "open",
    scheduledDate: new Date().toISOString(),
    scheduledStartTime: "14:00",
    scheduledEndTime: "16:00",
    workLocation1: "自宅（高野1丁目）",
    workLocation2: "",
    requestedAt: new Date().toISOString(),
    user: {
      id: "u-100",
      role: "user",
      gender: "female",
      address1: "高野1丁目",
      ageGroup: "70-79",
      bio: ""
    }
  },
  {
    id: 101,
    title: "通院の付き添い",
    description: "受付まで一緒に行っていただけると助かります。",
    status: "matched", // or "confirmed"
    scheduledDate: new Date(Date.now() + 86400000).toISOString(),
    scheduledStartTime: "09:30",
    scheduledEndTime: "11:30",
    workLocation1: "市民病院 正面入口",
    workLocation2: "",
    requestedAt: new Date().toISOString(),
    user: {
      id: "u-101",
      role: "user",
      gender: "female",
      address1: "高野1丁目",
      ageGroup: "70-79",
      bio: ""
    }
  }
  // {
  //   id: 102,
  //   title: "通院の付き添い",
  //   description: "受付まで一緒に行っていただけると助かります。",
  //   status: "matched", // or "confirmed"
  //   scheduledDate: new Date(Date.now() + 86400000).toISOString(),
  //   scheduledStartTime: "09:30",
  //   scheduledEndTime: "11:30",
  //   workLocation1: "市民病院 正面入口",
  //   workLocation2: "",
  //   requestedAt: new Date().toISOString(),
  //   user: {
  //     id: "u-101",
  //     role: "user",
  //     gender: "female",
  //     address1: "高野1丁目",
  //     ageGroup: "70-79",
  //     bio: ""
  //   }
  // }
];

// ===== 利用者アクション用 API（モック対応） =====
export async function cancelRequest(
  requestId: number | string,
  body?: { note?: string }
): Promise<{ ok: true }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ✅ モック強制
  if (apiMockOn || !baseUrl) {
    await new Promise((r) => setTimeout(r, 400));
    console.log("[mock] cancelRequest:", requestId, body);
    return { ok: true };
  }

  // ✅ 実API（ハング防止のタイムアウト付き）
  const url = withBase(baseUrl, `/api/requests/${requestId}/cancel`);
  await postJsonWithTimeout(url, body, 3000);
  return { ok: true };
}

export async function requestChangeSupporter(
  requestId: number | string,
  body?: { note?: string }
): Promise<{ ok: true }> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ✅ モック強制
  if (apiMockOn || !baseUrl) {
    await new Promise((r) => setTimeout(r, 400));
    console.log("[mock] requestChangeSupporter:", requestId, body);
    return { ok: true }; // ← ここで必ずreturn
  }

  // ✅ 実API（ハング防止のタイムアウト付き）
  const url = withBase(baseUrl, `/api/requests/${requestId}/change-supporter`);
  await postJsonWithTimeout(url, body, 3000);
  return { ok: true };
}
