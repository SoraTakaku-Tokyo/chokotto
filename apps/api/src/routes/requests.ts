import { Router, Response, RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { RequestCreateSchema } from "../schema/request";
import { ZodError } from "zod";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// GET /api/requests
// ★依頼リスト取得API★
// Firebase認証あり。
// トークンの uid とデータベースの role を元に条件分岐。
// status ≠ "completed", "canceled", "expired"

router.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { uid, role } = req.user!;

  // Firebase UID から DBユーザーを取得し、存在チェック
    const appUser = await prisma.user.findUnique({
      where: { id: uid },
    });

    if (!appUser) {
      res.status(404).json({ error: "ユーザー登録が見つかりません。" });
      return;
    }

    // 役割別で絞り込み条件を準備
    let baseWhere: Prisma.RequestWhereInput = {};

    // role別条件分岐
    if (role === "user" && uid) {
      // 利用者側：閉じてないもの＆自分が出した依頼のみ
      baseWhere = {
        NOT: {
          status: { in: ["completed", "canceled", "expired"] }
        },
        userId: uid,
      };
    }

    if (role === "supporter" && uid) {
      // サポーター側：openのみ、decline/refusal除外
      baseWhere = {
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
    }

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

    // 生年月日から「年代」を計算する関数
    const getAgeGroup = (birthday: Date): string => {
      const age = new Date().getFullYear() - birthday.getFullYear();
      const decade = Math.floor(age / 10) * 10;
      return `${decade}代`;
    };

    // フロントへ送る利用者情報
    const formatted = requests.map((req) => ({
      ...req,
      user: {
        id: req.user.id,
        role: req.user.role,
        gender: req.user.gender,
        address1: req.user.address1,
        ageGroup: getAgeGroup(req.user.birthday),
        bio: req.user.bio
      }
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST /api/requests
// ★依頼新規登録API★
// Firebase 認証が有効：req.user.uid を利用してユーザーIDを取得
// req の型を AuthenticatedRequest に明示的に設定

router.post("/", requireAuth, (async (req: AuthenticatedRequest, res: Response) => {
  try {

    const { uid, role } = req.user!;

    // Firebase UID から DBユーザーを取得し、存在チェックも
    const appUser = await prisma.user.findUnique({
      where: { id: uid },
      select: {
        id: true,
        address1: true,
        centerId: true,
      },
    });

    if (!appUser) {
      res.status(404).json({ error: "ユーザー登録が見つかりません。" });
      return;
    }

    // 利用者以外は拒否
    if (role !== "user") {
      return res.status(403).json({ error: "利用者のみ依頼可能です" });
    }

    // Zodでバリデーション実行
    const parsed = RequestCreateSchema.parse(req.body);

    const newRequest = await prisma.request.create({
      data: {
        userId: appUser.id,
        title: "買い物代行",
        description: parsed.description,
        scheduledDate: new Date(parsed.scheduledDate),
        scheduledStartTime: parsed.scheduledStartTime,
        scheduledEndTime: parsed.scheduledEndTime,
        workLocation1: parsed.location1,
        workLocation2: appUser.address1,
        centerId: appUser.centerId
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

// GET /api/requests/:requestId
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

    // Firebase UID から DBユーザーを取得し、存在チェック
    const appUser = await prisma.user.findUnique({
      where: { id: uid },
    });

    if (!appUser) {
      res.status(404).json({ error: "ユーザー登録が見つかりません。" });
      return;
    }

    // roleがnullでないかチェック
    if (!role) {
      res.status(400).json({ error: "ユーザーのロール情報が不明です。" });
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

    // 閲覧者のroleに応じて表示データを切り替える
    let targetUserId: string | null = null;
    if (role === "supporter") {
      // サポーターが見る → 依頼者情報を取得
      targetUserId = request.userId;
    } else if (role === "user") {
      // 利用者が見る → サポーター情報を取得
      targetUserId = request.matchedSupporterId;
    }

    // サポーター未決定targetUserId が null でも request 本体は返す」
    let formattedUser: Record<string, unknown> | null = null;

    if (targetUserId) {
      // userテーブルから詳細情報を取得
      const user = await prisma.user.findUnique({
        where: { id: targetUserId },
        select:
          role === "supporter"
            ? {
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
            : {
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

      // 年代を計算する関数
      const getAgeGroup = (birthday?: Date): string | null => {
        if (!birthday) return null;
        const age = new Date().getFullYear() - birthday.getFullYear();
        const decade = Math.floor(age / 10) * 10;
        return `${decade}代`;
      };

      // フロント用に整形
      if (user) {
        if (role === "supporter") {
          // サポーター側：birthday を除外して、利用者の年代を付与
          const { birthday, ...rest } = user;
          // formattedUser = { ...rest, ageGroup: getAgeGroup(birthday) };
          formattedUser = {
            ...rest,
            fullName: `${user.familyName}${user.firstName}`,
            ageGroup: getAgeGroup(birthday)
          };
        } else {
          // formattedUser = user;
          formattedUser = {
            supporterName: user.familyNameKana,
            supporterPhone: user.phoneNumber,
            supporterNote: user.bio,
            supporterAvatarUrl: user.profileImageUrl
          };
        }
      }
    }

    // 最終整形
    const formatted =
      role === "supporter"
        ? { ...request, user: formattedUser } // サポーター側 → 利用者情報
        : { ...request, supporter: formattedUser }; // 利用者側 → サポーター情報

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching request detail:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}) as RequestHandler);

export default router;
