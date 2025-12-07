import { z } from "zod";

// 共通のフォーマットチェック
const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
const timeRegex = /^\d{2}:\d{2}$/; // HH:mm

export const RequestCreateSchema = z
  .object({
    // ---- ユーザー入力部分 ----
    scheduledDate: z
      .string()
      .regex(dateRegex, "日付はYYYY-MM-DD形式で入力してください。")
      .refine(
        (v) => {
          // 存在しない年月日だとJSが自動補正するので切り出した値と
          // ずれる
          const inputDate = new Date(v);
          const [yyyy, mm, dd] = v.split("-").map(Number);
          return (
            inputDate.getFullYear() === yyyy &&
            inputDate.getMonth() + 1 === mm &&
            inputDate.getDate() === dd
          );
        },
        { message: "正しい日付を入力してください。" }
      )
      .refine(
        (v) => {
          const inputDate = new Date(v);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return inputDate >= today;
        },
        { message: "日にちは今日以降の日付を指定してください。" }
      ),

    scheduledStartTime: z
      .string()
      .regex(timeRegex, "時刻はHH:mm形式で入力してください。")
      .refine(
        (v) => {
          const [hh, mm] = v.split(":").map(Number);
          if (hh === 24 && mm === 0) return true;
          return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
        },
        { message: "24時間表記で正しい時刻を入力してください。" }
      ),

    scheduledEndTime: z
      .string()
      .regex(timeRegex, "時刻はHH:mm形式で入力してください。")
      .refine(
        (v) => {
          const [hh, mm] = v.split(":").map(Number);
          if (hh === 24 && mm === 0) return true;
          return hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59;
        },
        { message: "24時間表記で正しい時刻を入力してください。" }
      ),

    location1: z.string().max(100, "買い物先は100文字以内で入力してください。").optional(),

    description: z.string().max(200, "その他は200文字以内で入力してください。").optional()
  })

  // 開始時刻＜終了時刻となっているかチェック
  .superRefine((data, ctx) => {
    const [sh, sm] = data.scheduledStartTime.split(":").map(Number);
    const [eh, em] = data.scheduledEndTime.split(":").map(Number);

    const start = sh * 60 + sm;
    const end = eh * 60 + em;

    if (end <= start) {
      ctx.addIssue({
        code: "custom",
        path: ["scheduledEndTime"],
        message: "終了時刻は開始時刻より後にしてください。"
      });
    }
  });

export type RequestCreateInput = z.infer<typeof RequestCreateSchema>;
