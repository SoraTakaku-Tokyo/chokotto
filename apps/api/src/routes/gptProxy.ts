import express from "express";
import OpenAI from "openai";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("🟢 /api/gpt-proxy called with:", req.body);
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // 日本時間で取得
    const formatJST = (date: Date) => {
      const jstDate = new Date(date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }));
      return `${jstDate.getFullYear()}年${jstDate.getMonth() + 1}月${jstDate.getDate()}日`;
    };
    const prompt = `
  今日は${formatJST(today)}、明日は${formatJST(tomorrow)}です。

  以下の文章から「日時」「時間」「場所」「その他（あれば）」をJSONで抽出してください。
  「明日」「今日」は具体的な日付に変換してください。
  日付は必ず「YYYY年MM月DD日」形式で出力してください。

  例：
  入力：「10月10日の午後にスーパーに行きたい」
  出力：
  {
    "date": "2025年10月10日",
    "time": "午後",
    "place": "スーパー",
    "other": null
  }

  入力: ${text}
  `;

    const completion = await openai.responses.create({
      model: "gpt-5-nano",
      input: prompt
    });

    // const output = completion.output?.[0] as {
    //   content?: { text?: string }[];
    // };
    // const textOutput = output?.content?.[0]?.text ?? "";

    const outputText = completion.output_text || "";
    const parsed = JSON.parse(outputText);

    let normalized = null;
    const API_BASE = process.env.API_BASE_URL;
    if (!API_BASE) {
      throw new Error("環境変数 API_BASE_URL が設定されていません");
    }

    if (parsed.time) {
      const resNorm = await fetch(`${API_BASE}/normalize-time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeText: parsed.time })
      });
      normalized = await resNorm.json();
    }

    res.json({ ...parsed, normalizedTime: normalized });
  } catch (err) {
    console.error("❌ GPT Proxy Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
