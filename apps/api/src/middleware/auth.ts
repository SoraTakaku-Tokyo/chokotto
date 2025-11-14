import type { Response, NextFunction } from "express";
import admin from "../lib/firebaseAdmin";
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

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // IDトークン検証
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "missing token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = (await admin.auth().verifyIdToken(token)) as CustomDecodedIdToken;

    // ----------------------------------------------------
    // DBユーザーを特定（firebase_uidで照合）
    // ----------------------------------------------------
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.uid }
    });

    if (!dbUser) {
      return res.status(404).json({ error: "User not found in DB" });
    }

    // ----------------------------------------------------
    // req.user に格納して次へ
    // ----------------------------------------------------

    req.user = {
      uid: decoded.uid,
      role: dbUser.role
    };

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
