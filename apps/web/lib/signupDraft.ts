// lib/signupDraft.ts
import type { SupporterSignup } from "./validators/supporterSignup";
const KEY = "supporterSignupDraft:v2"; // v2: スキーマ名変更に伴いキー更新

export const loadDraft = (): Partial<SupporterSignup> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Partial<SupporterSignup>) : {};
  } catch {
    return {};
  }
};

export const saveDraft = (patch: Partial<SupporterSignup>) => {
  if (typeof window === "undefined") return;
  const current = loadDraft();
  localStorage.setItem(KEY, JSON.stringify({ ...current, ...patch }));
};

export const clearDraft = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
};
