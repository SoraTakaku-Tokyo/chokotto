"use client";

import { Button } from "@/components/ui/Button";

type Summary = { date: string; time: string; place: string; note: string };

type SummaryCardProps = {
  summary: Summary;
  onChange: (updated: Summary) => void;
  onSubmit?: () => void;
  onRetry?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
};

export default function SummaryCard({
  summary,
  onChange,
  onSubmit,
  onRetry,
  disabled = false,
  isLoading = false
}: SummaryCardProps) {
  // 入力変更時の共通ハンドラ
  const handleChange = (field: keyof Summary, value: string) => {
    onChange({ ...summary, [field]: value });
  };

  // 「依頼する」ボタンのクリック処理
  const handleSubmit = () => {
    console.log("✅ この内容で依頼する：", summary);
    if (onSubmit) onSubmit();
  };

  return (
    <div className="relative border-t bg-white p-4 text-gray-800 shadow-inner">
      <h2 className="mb-3 text-lg font-semibold">入力内容のまとめ（修正できます）</h2>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        {/* 日にち */}
        <div>
          <label className="mb-1 block text-lg font-medium text-gray-700">📅 日にち</label>
          <input
            type="text"
            value={summary.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-base"
            placeholder="例：10月10日"
          />
        </div>

        {/* 時間 */}
        <div>
          <label className="mb-1 block text-lg font-medium text-gray-700">⏰ 時間</label>
          <input
            type="text"
            value={summary.time}
            onChange={(e) => handleChange("time", e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-base"
            placeholder="例：午前中"
          />
        </div>

        {/* 買い物先 */}
        <div>
          <label className="mb-1 block text-lg font-medium text-gray-700">🏬 買い物先</label>
          <input
            type="text"
            value={summary.place}
            onChange={(e) => handleChange("place", e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-base"
            placeholder="例：スーパー"
          />
        </div>

        {/* その他 */}
        <div>
          <label className="mb-1 block text-lg font-medium text-gray-700">🗒️ その他</label>
          <textarea
            value={summary.note}
            onChange={(e) => handleChange("note", e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2 text-base"
            placeholder="補足情報など"
            rows={2}
          />
        </div>

        <div className="mt-5 flex justify-center">
          <Button
            type="submit"
            variant="u_primary"
            size="block"
            disabled={disabled || isLoading}
            className="!px-0"
          >
            {isLoading ? "送信中…" : "この内容で依頼する"}
          </Button>
        </div>
        <div className="mt-3 flex justify-center">
          <Button
            type="button"
            variant="u_tertiary"
            size="block"
            onClick={onRetry}
            disabled={disabled || isLoading}
          >
            修正する
          </Button>
        </div>
        <a
          href="/user/requests/new/grocery"
          className="block text-center text-sm text-gray-600 underline"
        >
          入力方法の選択に戻る
        </a>
      </form>
    </div>
  );
}
