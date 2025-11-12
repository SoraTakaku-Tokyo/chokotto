import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import admin from "../lib/firebaseAdmin";

// Prisma Clientのインスタンス（プロジェクト内の実装に合わせてインポート）
const prisma = new PrismaClient();
const router = Router();

// QRコードログインエンドポイント
router.post("/qr-login", async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required." });
  }

  try {
    // ⭐ ステップ1: トランザクション内でトークンを検証・無効化する
    const customToken = await prisma.$transaction(async (tx) => {
      const now = new Date();

      // 1.1. トークンの検索と検証
      const ticket = await tx.authTicket.findFirst({
        where: {
          token: token,
          isUsed: false,
          expiresAt: {
            gt: now // 有効期限が現在時刻よりも未来
          }
        }
      });

      if (!ticket) {
        // トークンが見つからない、期限切れ、または使用済みの場合はエラー
        throw new Error("Invalid or expired QR code token.");
      }

      // 1.2. トークンの無効化（使用済みフラグをtrueに設定）
      await tx.authTicket.update({
        where: { id: ticket.id },
        data: { isUsed: true }
      });

      // 1.3. Custom Tokenの発行
      // トークンに対応するユーザーID（Firebase UID）を取得し、カスタムトークンを生成
      const customToken = await admin.auth().createCustomToken(ticket.userId);

      return customToken;
    });

    // ⭐ ステップ2: クライアントにCustom Tokenを返却
    return res.status(200).json({ customToken });
  } catch (error) {
    console.error("QR Login Error:", error);

    // エラー内容に応じて適切なステータスコードを返す
    if (error instanceof Error && error.message.includes("Invalid or expired")) {
      return res
        .status(401)
        .json({ message: "認証情報が無効です。再度QRコードをスキャンしてください。" });
    }

    return res.status(500).json({ message: "サーバーエラーが発生しました。" });
  }
});

export default router;
