import admin from "../lib/firebaseAdmin";
import { prisma } from "../lib/prisma";
import type { Response, NextFunction } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";
import type { Request as ExpressRequest } from "express";

// **********************************************
// 型定義
// **********************************************

// Firebaseトークンの基本情報(uidを必須にして型エラーを回避)
export interface CustomDecodedIdToken extends DecodedIdToken {
  uid: string;
}

// 認証後の req.user の型を作成
export interface AuthenticatedUser {
  uid: string;
  role: string;
  identityVerified: boolean;
  familyName: string;
  firstName: string;
  familyNameKana: string;
  firstNameKana: string;
  gender: string;
  birthday: Date;
  phoneNumber: string;
  address1: string;
  address2: string;
  profileImageUrl: string | null;
  bio: string | null;
}

// req.userプロパティを持てるRequest型を作成
export interface AuthenticatedRequest extends ExpressRequest {
  user?: AuthenticatedUser;
}

// Request型へのreq.userプロパティ追加をアプリ全体に反映
declare global {
  namespace Express {
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
      return res.status(404).json({ error: "ユーザー登録が見つかりません。" });
    }

    // ----------------------------------------------------
    // req.user に格納して次へ
    // ----------------------------------------------------

    req.user = {
      uid: decoded.uid,
      role: dbUser.role,
      identityVerified: dbUser.identityVerified,
      familyName: dbUser.familyName,
      firstName: dbUser.firstName,
      familyNameKana: dbUser.familyNameKana,
      firstNameKana: dbUser.firstNameKana,
      gender: dbUser.gender,
      birthday: dbUser.birthday,
      phoneNumber: dbUser.phoneNumber,
      address1: dbUser.address1,
      address2: dbUser.address2,
      profileImageUrl: dbUser.profileImageUrl,
      bio: dbUser.bio,
      centerId: dbUser.centerId
    };

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
