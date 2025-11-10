"use client";

type MessageItemProps = {
  role: "user" | "assistant";
  text: string;
};

export default function MessageItem({ role, text }: MessageItemProps) {
  return (
    <div className={`flex items-end gap-2 ${role === "user" ? "justify-end" : "justify-start"}`}>
      {/* 左側（アシスタント） */}
      {role === "assistant" && (
        <div className="h-8 w-8 flex-shrink-0 rounded-full border border-gray-400 bg-gray-300"></div>
      )}

      {/* 吹き出し */}
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl border px-4 py-3 text-lg leading-relaxed shadow-sm ${
          role === "user"
            ? "rounded-br-none border-orange-200 bg-orange-50 text-gray-800"
            : "rounded-bl-none border-gray-200 bg-white text-gray-900"
        }`}
      >
        {text}
      </div>

      {/* 右側（ユーザー） */}
      {role === "user" && (
        <div className="h-8 w-8 flex-shrink-0 rounded-full border border-orange-300 bg-orange-200"></div>
      )}
    </div>
  );
}
