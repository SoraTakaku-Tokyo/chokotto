import express from "express";
import { z } from "zod";

const router = express.Router();

const normalizeTimeSchema = z.object({
  timeText: z.string().min(1, "timeText は必須です")
});

const timeMappings: Record<string, [string, string]> = {
  朝: ["08:00", "10:00"],
  午前: ["08:00", "12:00"],
  昼: ["12:00", "13:00"],
  正午: ["12:00", "13:00"],
  昼頃: ["12:00", "14:00"],
  午後: ["13:00", "17:00"],
  夕方: ["16:00", "18:00"],
  夜: ["19:00", "23:00"],
  深夜: ["23:00", "03:00"],
  夜中: ["23:00", "03:00"]
};

router.post("/", async (req, res) => {
  try {
    const { timeText } = normalizeTimeSchema.parse(req.body);

    // 部分一致で開始・終了時間を取得
    const match = Object.entries(timeMappings)
      .sort(([a], [b]) => b.length - a.length)
      .find(([key]) => timeText.includes(key))?.[1] ?? ["09:00", "12:00"]; // デフォルト（午前）

    const [start, end] = match;
    const normalizedText = `${start}から${end}まで`;

    console.log("🕓 正規化:", timeText, "→", normalizedText);

    res.json({
      scheduledStartTime: start,
      scheduledEndTime: end,
      normalizedText
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("❌ normalize-time error:", error.message);
      res.status(400).json({ error: error.message });
    } else {
      console.error("❌ normalize-time error:", error);
      res.status(400).json({ error: "Unknown error" });
    }
  }
});

export default router;
