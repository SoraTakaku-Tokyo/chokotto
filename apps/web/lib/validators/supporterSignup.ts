// lib/validators/supporterSignup.ts
import { z } from "zod";

export const genderOptions = ["male", "female", "no_answer"] as const;

export const supporterSignupSchema = z.object({
  familyName: z.string().min(1, "姓を入力してください"),
  firstName: z.string().min(1, "名を入力してください"),
  familyNameKana: z.string().min(1, "セイを入力してください"),
  firstNameKana: z.string().min(1, "メイを入力してください"),
  gender: z.enum(genderOptions),
  birthday: z.string().min(1, "生年月日を選択してください"), // YYYY-MM-DD
  postalCode: z.string().min(1, "郵便番号を入力してください"),
  address1: z.string().min(1, "住所（町名・丁目）を入力してください"),
  address2: z.string().optional().default(""),
  phoneNumber: z.string().min(1, "電話番号を入力してください"),
  emergencyContactName: z.string().min(1, "緊急連絡先氏名を入力してください"),
  emergencyContactRelationship: z.string().min(1, "緊急連絡先続柄を入力してください"),
  emergencyContactPhone: z.string().min(1, "緊急連絡先電話番号を入力してください"),
  bio: z.string().optional().default(""),
  profileImageUrl: z.string().optional().default(""),
  // 画面では非表示（自動セット）
  centerId: z.literal("C001").default("C001"),
  role: z.literal("supporter").default("supporter")
});

export type SupporterSignup = z.infer<typeof supporterSignupSchema>;
