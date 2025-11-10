import { z } from "zod";

// 共通のフォーマットチェック
const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
const timeRegex = /^\d{2}:\d{2}$/; // HH:mm

export const RequestCreateSchema = z.object({
  // ---- ユーザー入力部分 ----
  description: z.string().optional(),
  scheduledDate: z.string().regex(dateRegex, "日付はYYYY-MM-DD形式で入力してください"),
  scheduledStartTime: z.string().regex(timeRegex, "時刻はHH:mm形式で入力してください"),
  scheduledEndTime: z.string().regex(timeRegex, "時刻はHH:mm形式で入力してください"),
  location1: z.string().optional()
});

export type RequestCreateInput = z.infer<typeof RequestCreateSchema>;
