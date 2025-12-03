// ******************************************************
// サポーター（supporter）向けの依頼API
// ******************************************************

import { Router, Response, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../../middleware/auth";
import { getAgeGroup } from "../../utils/getAgeGroup";

const router = Router();

// GET /api/supporter/requests
// ★依頼リスト取得API★
// Firebase認証あり。
// requestSatus = "open"　かつ、orderStatus ≠ "decline(辞退)" "refusal(交代要請)"

router.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { uid, role } = req.user!;

    // サポーター以外は拒否
    if (role !== "supporter") {
      res.status(403).json({ error: "サポーターのみ閲覧可能です。" });
      return;
    }

    // openのみ、decline/refusal除外
    const baseWhere: Prisma.RequestWhereInput = {
      AND: [
        { status: "open" },
        {
          NOT: {
            orders: {
              some: {
                supporterId: uid,
                status: { in: ["decline", "refusal"] }
              }
            }
          }
        }
      ]
    };

    // 絞り込み条件に一致する依頼を取得
    const requests = await prisma.request.findMany({
      where: baseWhere,
      orderBy: {
        scheduledDate: "asc" // 日付が早いもの順
      },
      include: {
        // 利用者情報も取得
        user: {
          select: {
            id: true,
            role: true,
            birthday: true,
            gender: true,
            address1: true,
            bio: true
          }
        }
      }
    });

    // フロントへ送る利用者情報
    const formatted = requests.map((req) => ({
      ...req,
      user: {
        id: req.user.id,
        gender: req.user.gender,
        address1: req.user.address1,
        ageGroup: getAgeGroup(req.user.birthday),
        bio: req.user.bio
      }
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET /api/supporter/requests/:requestId
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
      res.status(400).json({ error: "リクエストIDは数値を入力してください。" });
      return;
    }

    // サポーター以外は拒否
    if (role !== "supporter") {
      res.status(403).json({ error: "サポーターのみ閲覧可能です。" });
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

    // userテーブルから詳細情報を取得
    const user = await prisma.user.findUnique({
      where: { id: request.userId },
      select: {
        familyName: true,
        firstName: true,
        familyNameKana: true,
        firstNameKana: true,
        gender: true,
        phoneNumber: true,
        address1: true,
        address2: true,
        profileImageUrl: true,
        bio: true,
        birthday: true
      }
    });

    if (!user) {
      res.status(404).json({ error: "利用者情報が見つかりません。" });
      return;
    }

    // フロント用に整形
    let formattedUser: Record<string, unknown> | null = null;

    // open の場合は一覧用の簡易 user 情報だけ返す
    if (request.status === "open") {
      formattedUser = {
        ageGroup: getAgeGroup(user.birthday),
        gender: user.gender,
        address1: user.address1,
        bio: user.bio
      };

      // 自分が引き受けた依頼なら、個人情報を返す
    } else if (request.matchedSupporterId === uid) {
      formattedUser = {
        familyName: user.familyName,
        firstName: user.firstName,
        familyNameKana: user.familyNameKana,
        firstNameKana: user.firstNameKana,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        address1: user.address1,
        address2: user.address2,
        profileImageUrl: user.profileImageUrl,
        bio: user.bio,
        ageGroup: getAgeGroup(user.birthday)
      };

      // 他のサポーターが受けた依頼なら403エラー
    } else {
      res.status(403).json({ error: "この依頼は他のサポーターが対応中のため閲覧できません。" });
      return;
    }

    // 最終整形
    const formatted = { ...request, user: formattedUser };

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching request detail:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}) as RequestHandler);

export default router;
