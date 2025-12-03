import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../../middleware/auth";
import { getAgeGroup } from "../../utils/getAgeGroup";

const router = Router();

// POST /api/supporter/orders/:id
//  ★新規引受登録API★
// requestId は URLパラメータから受け取る。
// userId は auth.ts（requireAuth）から受け取る。
// 機能：
// 1. 指定された requestId の依頼を "matched" に更新し、supporterId を設定
// 2. orders テーブルに新しいレコードを追加

router.post("/:requestId", requireAuth, async (req, res) => {
  try {
    // 受け取ったrequestId
    const { requestId } = req.params;

    // auth.tsからユーザー情報を取得
    const { uid, role } = req.user!;

    // サポーター以外は拒否
    if (role !== "supporter") {
      return res.status(403).json({ error: "サポーターのみ引受可能です。" });
    }

    // 対象の request を取得
    const request = await prisma.request.findUnique({ where: { id: Number(requestId) } });

    if (!request) {
      return res.status(404).json({ error: "指定された依頼が見つかりません。" });
    }

    // すでにマッチ済み、キャンセルなどの場合は拒否
    if (request.status !== "open") {
      return res.status(400).json({ error: "この依頼は受付終了です。" });
    }

    // トランザクションで一括処理
    const [updatedRequest, newOrder] = await prisma.$transaction([
      prisma.request.update({
        where: { id: Number(requestId) },
        data: { status: "matched", matchedSupporterId: uid }
      }),
      prisma.order.create({
        data: { requestId: Number(requestId), supporterId: uid, status: "matched" }
      })
    ]);

    // 成功レスポンス
    return res
      .status(201)
      .json({ message: "Order created successfully", order: newOrder, updatedRequest });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "サーバーエラーが発生しました" });
  }
});

// GET /api/supporter/orders
//  ★引受リスト取得API★
// 機能：
// サポーターIDでordersデータにヒットがあったら
// そのリクエストIDでrequestsを見に行き、一覧出力する
// requestStatusに応じて詳細を見せるかどうかはフロント側で制御

router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { uid, role } = req.user!;

    // サポーター以外のアクセスは拒否
    if (role !== "supporter") {
      return res.status(403).json({ error: "サポーターのみ閲覧できます。" });
    }

    // サポーターの引受データ取得（対応する依頼情報と利用者情報を含む）
    const orders = await prisma.order.findMany({
      where: {
        supporterId: uid
      },
      orderBy: {
        request: {
          scheduledDate: "asc"
        }
      },
      include: {
        request: {
          include: {
            user: {
              select: {
                id: true,
                birthday: true,
                gender: true,
                address1: true,
                bio: true
              }
            }
          }
        }
      }
    });

    if (!orders || orders.length === 0) {
      return res.status(200).json([]);
    }

    // フロントで扱う形式に整形
    const formatted = orders.map((order) => {
      const req = order.request;
      const user = req.user;
      return {
        ...req,
        orderStatus: order.status,
        user: {
          id: user.id,
          gender: user.gender,
          address1: user.address1,
          ageGroup: getAgeGroup(user.birthday),
          bio: user.bio
        }
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error("Error fetching supporter orders:", error);
    res.status(500).json({ error: "サーバーエラーが発生しました" });
  }
});

export default router;
