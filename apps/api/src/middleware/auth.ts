import type { Response, NextFunction } from "express"; // 💡 修正: Request を削除
import { getAdminApp } from "../firebase"; // getAdminApp をインポート
import type { DecodedIdToken } from "firebase-admin/auth"; // Firebase Adminの型をインポート
import type { Request as ExpressRequest } from "express"; // Express Requestの基本型をインポート

// **********************************************
// 💡 修正点 1: 外部で利用するための型をエクスポート
// **********************************************

// Custom claims を含む型を定義
// role, approved, および DecodedIdToken には含まれないが、Firebaseトークンが持つ uid を明示的に追加
export interface CustomDecodedIdToken extends DecodedIdToken {
  uid: string; // DecodedIdTokenにも含まれるが、TypeScriptのエラー回避のため明示
  role: string;
  approved: boolean;
}

// 認証後の req.user の型
export interface CustomRequestUser {
  uid: string;
  role: string;
  claims: CustomDecodedIdToken; // 拡張された型を使用
  userId: string; // 独自のユーザー識別子 (通常は uid と同じ)
}

// Express Requestにカスタムユーザープロパティを追加した Request の型エイリアス
// requests.ts などで明示的にインポートして利用します。
export interface AuthenticatedRequest extends ExpressRequest {
  user?: CustomRequestUser;
}

// Express Requestにカスタムユーザープロパティを追加する型を拡張 (グローバル)
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // 既存の Request インターフェースに user プロパティを追加
    interface Request {
      user?: CustomRequestUser;
    }
  }
}

// **********************************************
// 認証ロジック
// **********************************************

// 環境変数設定に基づいて開発モードを判定
// const DEV_OPEN_MODE = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";

// 🚩フロント用ではなく、バックエンド専用の環境変数に変更
// (NEXT_PUBLIC_ は Next.js 用 → Express 側では普通の USE_FIREBASE_EMULATOR を見る)
const DEV_OPEN_MODE = process.env.USE_FIREBASE_EMULATOR === "true";

// 💡 修正点 3: req の型を AuthenticatedRequest に変更し、req.user の型エラーを回避
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // 開発モード：トークン無しでも通す
  if (DEV_OPEN_MODE) {
    console.warn("⚠️ Authentication skipped: Running in DEV_OPEN_MODE.");

    // 追加: フロントからヘッダーで "user" or "supporter" を指定できる
    const requestedRole = req.headers["x-debug-role"] as string | undefined;

    // それぞれの固定ユーザーを定義
    const dummyUsers = {
      supporter: {
        uid: "K5w5gAs2mlaht0AzK5LP15DgD7x1",
        role: "supporter",
        email: "testuser3@example.com"
      },
      user: {
        uid: "ZP6l5FZf8uMMnPHRcoOHGIjUD6o1",
        role: "user",
        email: "testuser1@example.com"
      }
    };

    // 指定がない場合は supporter
    const target = requestedRole === "user" ? dummyUsers.user : dummyUsers.supporter;

    const dummyClaims: CustomDecodedIdToken = {
      role: target.role,
      approved: true,
      aud: "dummy-aud",
      auth_time: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      firebase: { sign_in_provider: "custom", identities: {} },
      iat: Math.floor(Date.now() / 1000),
      iss: "https://securetoken.google.com/dummy-project",
      sub: target.uid,
      uid: target.uid,
      email: target.email,
      email_verified: true
    };

    req.user = {
      uid: dummyClaims.uid,
      claims: dummyClaims,
      role: dummyClaims.role,
      userId: dummyClaims.uid
    };
    console.warn("Authentication skipped: Running in DEV_OPEN_MODE.");
    return next();
  }

  // 本番系：IDトークン検証
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: "missing token" });

  try {
    const app = getAdminApp();
    const decoded = (await app.auth().verifyIdToken(token)) as CustomDecodedIdToken;

    // 必須クレームのチェック
    if (!decoded.role || typeof decoded.approved !== "boolean") {
      return res.status(403).json({ error: "Token lacks required custom claims (role/approved)." });
    }

    req.user = {
      uid: decoded.uid,
      claims: decoded,
      role: decoded.role,
      userId: decoded.uid // userId も設定
    };
    next();
  } catch (e) {
    console.error("Token verification failed:", e);
    return res.status(401).json({ error: "invalid token" });
  }
}
