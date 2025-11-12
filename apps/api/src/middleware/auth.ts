import type { Response, NextFunction } from "express";
import { getAdminApp } from "../firebase";
import type { DecodedIdToken } from "firebase-admin/auth";
import type { Request as ExpressRequest } from "express";
import { prisma } from "../lib/prisma";

// **********************************************
// 型定義
// **********************************************

// Firebaseトークンの基本情報
export interface CustomDecodedIdToken extends DecodedIdToken {
  uid: string;
}

// 認証後の req.user の型
export interface AuthenticatedUser {
  uid: string;
  role: string;
}

// Express Requestにカスタムユーザープロパティを追加した Request の型エイリアス
// requests.ts などで明示的にインポートして利用します。
export interface AuthenticatedRequest extends ExpressRequest {
  user?: AuthenticatedUser;
}

// Express Requestにカスタムユーザープロパティを追加する型を拡張 (グローバル)
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // 既存の Request インターフェースに user プロパティを追加
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// **********************************************
// 認証ロジック
// **********************************************

const DEV_OPEN_MODE = process.env.USE_FIREBASE_EMULATOR === "true";

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
  
    // 開発モード：トークン無しでも通す
    if (DEV_OPEN_MODE) {
      console.warn("⚠️ Authentication skipped: Running in DEV_OPEN_MODE.");

      // 追加: フロントからヘッダーで "user" or "supporter" を指定できる
      const requestedRole = req.headers["x-debug-role"] as string | undefined;

      // ダミーUIDを生成（Firebaseエミュレーター想定）
        const dummyUid =
          requestedRole === "user"
            ? "uYY5LKi9ZsfrdP5LmHhBkO3TLw62"
            : "BuUmfPzwDpfZi4mtPACvdQrMiE73";

        // DBからユーザー情報を取得（Firebase UIDベース）
        const dbUser = await prisma.user.findUnique({
          where: { id: dummyUid },
        });

        if (!dbUser) {
          return res.status(404).json({ error: "Dummy user not found in DB" });
        }

        req.user = {
          uid: dbUser.id,
          role: dbUser.role,
        };

      return next();
    }

    // 本番系：IDトークン検証
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "missing token" });
    }

    const token = authHeader.split(" ")[1];
    const app = getAdminApp();
    const decoded = (await app.auth().verifyIdToken(token)) as CustomDecodedIdToken;

    // ----------------------------------------------------
    // DBユーザーを特定（firebase_uidで照合）
    // ----------------------------------------------------
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.uid },
    });

    if (!dbUser) {
      return res.status(404).json({ error: "User not found in DB" });
    }

    // ----------------------------------------------------
    // req.user に格納して次へ
    // ----------------------------------------------------

    req.user = {
      uid: decoded.uid,
      role: dbUser.role,
    };
  
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
