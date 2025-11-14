"use client";
import { FaRegSmileBeam, FaRobot } from "react-icons/fa";
import { useEffect, useRef } from "react";
import { playTTS } from "../utils/playTTS";
import { Button } from "@/components/ui/Button";

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

type MessageListProps = {
  messages: Message[];
  ttsEnabled: boolean;
  setTtsEnabled: (_enabled: boolean) => void;
};

export default function MessageList({ messages, ttsEnabled, setTtsEnabled }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // 💬 スクロール追従
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔊 自動読み上げ（TTS）
  useEffect(() => {
    if (!ttsEnabled || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.role === "assistant" && last.text) {
      playTTS(last.text);
    }
  }, [messages, ttsEnabled]);

  // 初回クリックで音声再生を有効化
  const handleEnableTTS = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      console.log("🔓 音声再生が有効になりました");
    }
    setTtsEnabled(true);
  };

  // 🎧 初回はボタンを表示
  if (!ttsEnabled) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="mx-auto max-w-xs space-y-6 md:max-w-sm">
          <Button onClick={handleEnableTTS} variant="u_primary" size="block">
            チャットを開始する
          </Button>
          <Button variant="u_tertiary" size="block" href="/user/requests/new/grocery">
            前のページにもどる
          </Button>
        </div>
      </div>
    );
  }

  // 💬 チャット表示部分
  return (
    <div className="space-y-3 overflow-y-auto">
      {messages.map((m) => (
        <div
          key={m.id}
          className={`flex items-start gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {/* アシスタントアイコン（左側） */}
          {m.role === "assistant" && (
            <div className="mt-2">
              <FaRobot size={24} className="text-[#22a2b4]" />
            </div>
          )}

          <div
            className={`relative max-w-sm rounded-2xl p-4 ${
              m.role === "user"
                ? "bg-orange-200 text-gray-800 after:absolute after:right-0 after:top-4 after:h-0 after:w-0 after:translate-x-2 after:border-l-8 after:border-t-8 after:border-l-orange-200 after:border-t-transparent"
                : "bg-gray-200 text-gray-800 after:absolute after:left-0 after:top-4 after:h-0 after:w-0 after:-translate-x-2 after:border-r-8 after:border-t-8 after:border-r-gray-200 after:border-t-transparent"
            }`}
          >
            <pre className="whitespace-pre-wrap break-words text-lg leading-relaxed">{m.text}</pre>
          </div>

          {/* 利用者アイコン（右側） */}
          {m.role === "user" && (
            <div className="mt-2">
              <FaRegSmileBeam size={24} className="text-orange-500" />
            </div>
          )}
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
