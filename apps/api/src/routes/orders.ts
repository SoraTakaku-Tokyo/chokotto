import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// PATCH /api/orders/:requestId
//  ★依頼・引受ステータス更新API★
// requestId をURLから、 更新後ステータスをリクエストボディから受け取る。
// 機能：
// 1. canceled ⇒ requestsデータとordersデータ（存在しない場合あり）のステータス更新
// 2. confirmed、completed ⇒ requestsデータとordersデータのステータス更新
// 3. decline、refusal ⇒ ordersデータのステータス更新、requestsデータのmatchedsupporterIdを削除しopenに更新

router.patch("/:requestId", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    // 受け取ったrequestId
    const { requestId } = req.params;

    // 受け取った更新後ステータス
    const { updateStatus } = req.body;

    // requireAuthから受け取ったユーザーID
    const { uid } = req.user!;

    // requestIdが数値かどうかのチェック
    const requestIdNum = Number(requestId);
    if (isNaN(requestIdNum)) {
      return res.status(400).json({ error: "リクエストIDは数値を指定してください。" });
    }

    // 対象の request を取得
    const request = await prisma.request.findUnique({
      where: { id: Number(requestId) }
    });

    if (!request) {
      return res.status(404).json({ error: "指定された依頼が見つかりません。" });
    }

    // 実行者チェック
    const userOnlyStatuses = ["canceled", "refusal"];
    const supporterOnlyStatuses = ["confirmed", "decline", "completed"];

    // canceled・refusal：依頼者本人しか実行できない
    if (userOnlyStatuses.includes(updateStatus)) {
      if (uid !== request.userId) {
        return res.status(403).json({ error: "依頼者本人のみ操作可能です。" });
      }
    }

    // confirmed・decline・completed：引き受けたサポーターしか実行できない
    if (supporterOnlyStatuses.includes(updateStatus)) {
      if (uid !== request.matchedSupporterId) {
        return res.status(403).json({ error: "担当サポーターのみ操作可能です。" });
      }
    }

    // ==========================================
    // 1. canceled ⇒ requestsデータとordersデータのステータス更新(ordersが無い場合もある)
    // ==========================================
    if (updateStatus === "canceled") {
      // 先に、サポーターIDを取得する
      const supporterId = request.matchedSupporterId;

      // サポーター欄ブランクの場合は request のみ更新
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
        console.warn(
          `【警告】matchedSupporterId があるのに Order が存在しません`,
        { requestId, supporterId }
        );
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
        message: "ステータスを更新しました（canceled）",
        updatedRequest,
        updatedOrder
      });

    // ==========================================
    // 2. confirmed、completed ⇒ requestsデータとordersデータのステータス更新
    // ==========================================
    } else if (["confirmed", "completed"].includes(updateStatus)) {
      // 先に、サポーターIDを取得する
      const supporterId = request.matchedSupporterId;

      // サポーター欄ブランクの場合はエラー
      if (!supporterId) {
        return res.status(409).json({ error: "引受されていないため、この操作はできません。" });
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
        // Orderが存在しない場合もエラー
        return res.status(409).json({ error: "対応する引受データが見つかりません。" });
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
        message: "ステータスを更新しました（confirmed, completed）",
        updatedRequest,
        updatedOrder
      });

    // ==========================================
    // 3. decline、refusal ⇒ ordersデータのステータス更新、requestsデータのmatchedsupporterIdを削除しopenに更新
    // ==========================================
    } else if (["decline", "refusal"].includes(updateStatus)) {
      // 先に、サポーターIDを取得する
      const supporterId = request.matchedSupporterId;

      // サポーター欄ブランクの場合はエラー
      if (!supporterId) {
        return res.status(409).json({ error: "引受されていないため、この操作はできません。" });
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
        // Orderが存在しない場合もエラー
        return res.status(409).json({ error: "対応する引受データが見つかりません。" });
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
      return res.status(400).json({ error: "不正なステータスです。" });
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "サーバーエラーが発生しました。" });
  }
});

export default router;
