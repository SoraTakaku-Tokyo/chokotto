// ******************************************************
// 利用者（user）向けの依頼API
// ******************************************************

import { Router, Response, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { RequestCreateSchema } from "../../schema/request";
import { ZodError } from "zod";
import { requireAuth, AuthenticatedRequest } from "../../middleware/auth";

const router = Router();

// GET /api/user/requests
// ★依頼リスト取得API★
// Firebase認証あり。
// status ≠ "completed", "canceled", "expired"

router.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { uid, role } = req.user!;

    // 利用者以外は拒否
    if (role !== "user") {
      res.status(403).json({ error: "利用者のみ依頼可能です。" });
      return;
    }

    // 閉じてないもの＆＆自分が出した依頼のみ
    const baseWhere: Prisma.RequestWhereInput = {
      NOT: {
        status: { in: ["completed", "canceled", "expired"] }
      },
      userId: uid
    };

    // 絞り込み条件に一致する依頼を取得
    const requests = await prisma.request.findMany({
      where: baseWhere,
      orderBy: {
        scheduledDate: "asc" // 実施予定日付が早いもの順
      }
    });

    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/user/requests
// ★依頼新規登録API★
// Firebase 認証
// req の型を AuthenticatedRequest に明示的に設定

router.post("/", requireAuth, (async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { uid, role, address1, centerId } = req.user!;

    // 利用者以外は拒否
    if (role !== "user") {
      res.status(403).json({ error: "利用者のみ依頼可能です。" });
      return;
    }

    // Zodでバリデーション実行
    const parsed = RequestCreateSchema.parse(req.body);

    const newRequest = await prisma.request.create({
      data: {
        userId: uid,
        title: "買い物代行",
        description: parsed.description,
        scheduledDate: new Date(parsed.scheduledDate),
        scheduledStartTime: parsed.scheduledStartTime,
        scheduledEndTime: parsed.scheduledEndTime,
        workLocation1: parsed.location1,
        workLocation2: address1,
        centerId: centerId
      }
    });

    res.status(201).json(newRequest);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: error.errors });
    } else if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "unknown error" });
    }
  }
}) as RequestHandler);

// GET /api/user/requests/:requestId
// ★依頼詳細取得API★
// req の型を AuthenticatedRequest に明示的に設定

router.get("/:requestId", requireAuth, (async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { requestId } = req.params;
    const { uid, role } = req.user!;

    // requestIdが数値かどうかのチェック
    const requestIdNum = Number(requestId);
    if (Number.isNaN(requestIdNum)) {
      res.status(400).json({ error: "リクエストIDは数値を入力してください" });
      return;
    }

    // 利用者以外は拒否
    if (role !== "user") {
      res.status(403).json({ error: "利用者のみ依頼可能です。" });
      return;
    }

    // requestデータを取得
    const request = await prisma.request.findUnique({
      where: { id: requestIdNum },
      include: {
        user: true,
        matchedSupporter: true
      }
    });

    if (!request) {
      res.status(404).json({ error: "依頼が見つかりません。" });
      return;
    }

    if (request.userId !== uid) {
      res.status(403).json({ error: "あなたの依頼ではありません。" });
      return;
    }

    // サポーター情報を取得
    let matchedSupporterId: string | null = null;
    matchedSupporterId = request.matchedSupporterId;

    // サポーター未決定(targetUserId が null)でも request 本体は返す
    let formattedSupporter: Record<string, unknown> | null = null;

    if (matchedSupporterId) {
      const matchedSupporter = await prisma.user.findUnique({
        where: { id: matchedSupporterId },
        select: {
          familyName: true,
          firstName: true,
          familyNameKana: true,
          firstNameKana: true,
          gender: true,
          phoneNumber: true,
          profileImageUrl: true,
          bio: true
        }
      });

      // フロント用に整形
      if (matchedSupporter) {
        formattedSupporter = {
          supporterName: matchedSupporter.familyNameKana,
          supporterPhone: matchedSupporter.phoneNumber,
          supporterNote: matchedSupporter.bio,
          supporterAvatarUrl: matchedSupporter.profileImageUrl
        };
      }
    }

    // 最終整形
    const formatted = { ...request, supporter: formattedSupporter };

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching request detail:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}) as RequestHandler);

export default router;
