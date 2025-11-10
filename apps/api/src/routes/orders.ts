import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// POST /api/orders/:id
//  ★受注新規登録API★
// 現段階では Firebase 認証は未実装。
// requestId は URLパラメータから受け取る。
// userId は auth.ts（requireAuth）から受け取る。
// 仮）　POST /api/orders/:requestId?userId=supporter001
// 機能：
// 1. 指定された requestId の依頼を "matched" に更新し、supporterId を設定
// 2. orders テーブルに新しいレコードを追加

router.post("/:requestId", requireAuth, async (req, res) => {
  try {
    // 受け取ったrequestId
    const { requestId } = req.params;

    // auth.tsからユーザー情報を取得
    const { userId, role } = req.user || {};

    // サポーター以外は拒否
    if (role !== "supporter") {
      return res.status(403).json({ error: "サポーターのみ受注可能です" });
    }

    // 対象の request を取得
    const request = await prisma.request.findUnique({ where: { id: Number(requestId) } });

    if (!request) {
      return res.status(404).json({ error: "指定された依頼が見つかりません" });
    }

    // すでにマッチ済み、キャンセルなどの場合は拒否
    if (request.status !== "open") {
      return res.status(400).json({ error: "この依頼は受付終了です" });
    }

    // トランザクションで一括処理
    const [updatedRequest, newOrder] = await prisma.$transaction([
      prisma.request.update({
        where: { id: Number(requestId) },
        data: { status: "matched", matchedSupporterId: userId }
      }),
      prisma.order.create({
        data: { requestId: Number(requestId), supporterId: userId, status: "matched" }
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

// PATCH /api/orders/:requestID
//  ★依頼・受注ステータス更新API★
// 現段階では Firebase 認証は未実装。
// requestId をURLから、 更新後ステータスを リクエストボディから受け取る。
// 機能：
// 1. confirmed、completed、canceled ⇒ requestsデータとordersデータのステータス更新
// 2. decline、refusal ⇒ ordersデータのステータス更新、requestsデータのmatchedsupporterIdを削除しopenに更新

router.patch("/:requestId", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    // 今は特に使用しないが、requireAuthから受け取れる。
    // const { userId, role } = req.user || {};

    // 受け取ったrequestId
    const { requestId } = req.params;

    // 受け取った更新後ステータス
    const { updateStatus } = req.body;

    // 対象の request を取得
    const request = await prisma.request.findUnique({
      where: { id: Number(requestId) }
    });

    if (!request) {
      return res.status(404).json({ error: "指定された依頼が見つかりません" });
    }

    // 1. confirmed、completed、canceled ⇒ requestsデータとordersデータのステータス更新
    if (["confirmed", "completed", "canceled"].includes(updateStatus)) {
      // 先に、サポーターIDを取得する
      const supporterId = request.matchedSupporterId;

      // サポーター未決定 or 該当Orderがない場合は request のみ更新
      if (!supporterId) {
        const updatedRequest = await prisma.request.update({
          where: { id: Number(requestId) },
          data: { status: updateStatus }
        });
        return res.status(200).json({
          message: "ステータスを更新しました（requestのみ）",
          updatedRequest
        });
      }

      // 該当オーダーを取得
      const order = await prisma.order.findUnique({
        where: {
          requestId_supporterId: {
            requestId: Number(requestId),
            supporterId
          }
        }
      });

      if (!order) {
        // Orderが存在しない場合も request のみ更新
        const updatedRequest = await prisma.request.update({
          where: { id: Number(requestId) },
          data: { status: updateStatus }
        });
        return res.status(200).json({
          message: "ステータスを更新しました（Orderなし）",
          updatedRequest
        });
      }

      // トランザクションで一括処理
      const [updatedRequest, updatedOrder] = await prisma.$transaction([
        prisma.request.update({
          where: { id: Number(requestId) },
          data: { status: updateStatus }
        }),
        prisma.order.update({
          where: {
            requestId_supporterId: {
              requestId: Number(requestId),
              supporterId: supporterId!
            }
          },
          data: { status: updateStatus }
        })
      ]);

      return res.status(200).json({
        message: "ステータスを更新しました（confirmed/completed/canceled）",
        updatedRequest,
        updatedOrder
      });

      // 2. decline、refusal ⇒ ordersデータのステータス更新、requestsデータのmatchedsupporterIdを削除しopenに更新
    } else if (["decline", "refusal"].includes(updateStatus)) {
      // 先に、サポーターIDを取得する
      const supporterId = request.matchedSupporterId;

      // 💡 サポーター未決定の場合でも open に戻せるようにする
      if (!supporterId) {
        const updatedRequest = await prisma.request.update({
          where: { id: Number(requestId) },
          data: { status: "open", matchedSupporterId: null }
        });
        return res.status(200).json({
          message: "サポーターなしの依頼を open に戻しました",
          updatedRequest
        });
      }

      // トランザクションで一括処理
      const [updatedRequest, updatedOrder] = await prisma.$transaction([
        prisma.request.update({
          where: { id: Number(requestId) },
          data: { status: "open", matchedSupporterId: null }
        }),
        prisma.order.update({
          where: {
            requestId_supporterId: {
              requestId: Number(requestId),
              supporterId: supporterId!
            }
          },
          data: { status: updateStatus }
        })
      ]);

      return res.status(200).json({
        message: "ステータスを更新しました（decline/refusal）",
        updatedRequest,
        updatedOrder
      });
    } else {
      return res.status(400).json({ error: "不正なステータスです" });
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "サーバーエラーが発生しました" });
  }
});

// GET /api/orders
//  ★引受リスト取得API★
// requireAuth により、仮の userId と role が req.user に設定される。
// 将来的に Firebase 対応になっても auth.ts の修正だけで対応可能。
// 機能：
// サポーターIDでordersデータにヒットがあったら
// そのリクエストIDでrequestsを見に行き、一覧出力する

router.get("/", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    // apps/api/src/middleware/auth.tsで注入されたユーザー情報を取得
    const { userId, role } = req.user || {};

    // サポーター以外のアクセスは拒否
    if (role !== "supporter") {
      return res.status(403).json({ error: "サポーターのみ閲覧できます" });
    }

    // サポーターの受注データ取得（対応する依頼情報と利用者情報を含む）
    const orders = await prisma.order.findMany({
      where: { supporterId: userId },
      orderBy: {
        request: {
          scheduledDate: "asc" // ← ここを修正！
        }
      },
      include: {
        request: {
          include: {
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
        }
      }
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "引き受けた依頼はありません" });
    }

    // 年代を算出する関数
    const getAgeGroup = (birthday: Date): string => {
      const age = new Date().getFullYear() - birthday.getFullYear();
      const decade = Math.floor(age / 10) * 10;
      return `${decade}代`;
    };

    // フロントで扱う形式に整形
    const formatted = orders.map((order) => {
      const req = order.request;
      const user = req.user;
      return {
        ...req,
        orderStatus: order.status, // order側のステータス
        user: {
          id: user.id,
          role: user.role,
          gender: user.gender,
          address1: user.address1,
          ageGroup: getAgeGroup(user.birthday),
          bio: user.bio
        }
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching supporter orders:", error);
    res.status(500).json({ error: "サーバーエラーが発生しました" });
  }
});

export default router;
