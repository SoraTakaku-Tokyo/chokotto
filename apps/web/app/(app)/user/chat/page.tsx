"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MessageList from "./components/MessageList";
import VoiceButton from "./components/VoiceButton";
import SummaryCard from "./components/SummaryCard";
import { createRequest } from "@/lib/api/requests";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
// import { auth } from "@/lib/firebase"; // NOTE: ログイン機能実装時に使用

// Web Speech API の型定義
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: () => void;
  onresult: (_event: SpeechRecognitionEvent) => void;
  onerror: (_event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

type Message = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "ご用件をお話しください。\n例：「10月10日の午後にスーパーで買い物してほしい」"
    }
  ]);

  const [isRecording, setIsRecording] = useState(false);
  const [summary, setSummary] = useState({
    date: "",
    time: "",
    place: "",
    note: ""
  });
  const [showSummary, setShowSummary] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [retry, setRetry] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentRecognition, setCurrentRecognition] = useState<SpeechRecognition | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isRequestSubmitted, setIsRequestSubmitted] = useState(false);

  const handleRetry = () => {
    // 状態をリセット
    setMessages([
      {
        id: 1,
        role: "assistant",
        text: "ご用件をお話しください。\n例：「10月10日の午後にスーパーで買い物してほしい」"
      }
    ]);
    setSummary({ date: "", time: "", place: "", note: "" });
    setShowSummary(false);
    setIsRecording(false);
    setIsListening(false);
    setIsProcessing(false);
    setIsRequestSubmitted(false);
    if (currentRecognition) {
      currentRecognition.stop();
      setCurrentRecognition(null);
    }
  };

  // ✅ GPT Proxy呼び出し関数
  const sendToGptProxy = async (userText: string) => {
    console.log("📤 GPTへ送信:", userText);
    const res = await fetch("http://localhost:3001/api/gpt-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: userText })
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    console.log("🤖 GPT応答:", data);
    return data;
  };

  const handleGptProcessing = async (transcript: string) => {
    if (!transcript || transcript.trim().length === 0) return;

    setIsProcessing(true);
    try {
      const gptResult = await sendToGptProxy(transcript);

      const userMessageId = Date.now();
      const assistantMessageId = Date.now() + Math.random();
      setMessages((prev) => [
        ...prev,
        { id: userMessageId, role: "user", text: transcript },
        {
          id: assistantMessageId,
          role: "assistant",
          text: "これまでの情報を元に依頼票を作成しました。\n内容に問題なければ、「依頼する」ボタンを押してください。"
        }
      ]);

      setSummary({
        date: gptResult.date || "",
        time: gptResult.normalizedTime?.normalizedText || gptResult.time || "",
        place: gptResult.place || "",
        note: gptResult.other || ""
      });

      setShowSummary(true);
    } catch (err) {
      console.error("❌ GPT呼び出しエラー:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          role: "assistant",
          text: "エラーが発生しました。もう一度お試しください。"
        }
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitSummary = async () => {
    console.log("📤 フロントから送信データ:", summary);
    setIsLoading(true);
    setRetry(false);

    try {
      // 日付変換関数を追加
      const convertDateFormat = (dateStr: string): string => {
        if (!dateStr || dateStr === "") return "2025-10-31";

        // "10月31日" → "2025-10-31" に変換
        const match = dateStr.match(/(\d+)月(\d+)日/);
        if (match) {
          const month = match[1].padStart(2, "0");
          const day = match[2].padStart(2, "0");
          return `2025-${month}-${day}`;
        }

        // 既にYYYY-MM-DD形式の場合はそのまま
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dateStr;
        }

        return "2025-10-31"; // デフォルト値
      };
      const requestBody = {
        description: summary.note || "内容なし",
        scheduledDate: convertDateFormat(summary.date),
        scheduledStartTime: summary.time.split("から")[0] || "09:00",
        scheduledEndTime: summary.time.split("から")[1]?.replace("まで", "") || "12:00",
        location1: summary.place || "おまかせ"
        // title, workLocation1は削除（APIスキーマに合わせる）
      };

      console.log("🔍 送信データ詳細:", JSON.stringify(requestBody, null, 2));
      console.log("🔍 summary詳細:", JSON.stringify(summary, null, 2));

      await createRequest(requestBody);

      // NOTE:利用者ログイン実装機能ができたら復活します
      // const user = auth.currentUser;
      // const token = user ? await user.getIdToken() : null;

      // NOTE: テスト用モック認証（利用者ログイン実装機能ができたら削除します）
      // const mockUser = {
      //   uid: "ZP6l5FZf8uMMnPHRcoOHGIjUD6o1", // ← ここにテスト用UIDを入力
      //   getIdToken: async () => "mock-test-token-12345"
      // };

      // TODO: 利用者ログイン実装後に実際のAPI呼び出しに戻す
      // const user = mockUser; // auth.currentUser の代わり
      // const token = await user.getIdToken();
      // const res = await
      // fetch(`http://localhost:3001/api/requests`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     ...(token && { Authorization: `Bearer ${token}`
      // });
      //   },
      //   body: JSON.stringify(requestBody)
      // });

      const userMessageId = Date.now();
      const assistantMessageId = Date.now() + Math.random();
      setMessages((prev) => [
        ...prev,
        { id: userMessageId, role: "user", text: "この内容で依頼します。" },
        {
          id: assistantMessageId,
          role: "assistant",
          text: "依頼を受け付けました。\nありがとうございます。\nトップページへ戻ります。"
        }
      ]);

      setShowSummary(false);
      setIsRequestSubmitted(true);

      // 6秒後にトップページに遷移
      setTimeout(() => {
        router.push("/user");
      }, 6000);
    } catch (error) {
      console.error("❌ 送信エラー:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          role: "assistant",
          text: "エラーが発生しました。もう一度お試しください。"
        }
      ]);
      setRetry(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 🎙️ 音声認識機能
  const startVoiceRecognition = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          role: "assistant",
          text: "お使いのブラウザは音声認識に対応していません。Chrome、Edge、Safariをお試しください。"
        }
      ]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.continuous = true; // 連続認識を有効化
    recognition.interimResults = true; // 中間結果も取得

    recognition.onstart = () => {
      console.log("🎙️ 音声認識開始");
      setIsListening(true);
    };

    let finalTranscript = "";

    recognition.onresult = async (event) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      console.log("🗣️ 最終結果:", finalTranscript);
      console.log("🔄 中間結果:", interimTranscript);

      console.log("🔍 チェック:", {
        finalTranscript,
        isListening,
        isProcessing,
        lastProcessedTranscript,
        isEqual: finalTranscript === lastProcessedTranscript
      });
      // onresult内では処理を行わず、ログのみ
      // 理由: onresultは音声認識中に何度も発火するため、
      // ここでGPT処理を実行すると重複呼び出しが発生する。
      // 実際の処理はonend（音声認識完了時）で1回だけ実行する。
    };

    recognition.onerror = (event) => {
      console.error("❌ 音声認識エラー:", event.error);
      setIsListening(false);
      setIsRecording(false); // エラー時に録音ボタンをOFF状態に戻す

      let errorMessage = "音声認識でエラーが発生しました。";

      switch (event.error) {
        case "not-allowed":
          errorMessage = "マイクの使用が許可されていません。ブラウザの設定をご確認ください。";
          break;
        case "no-speech":
          errorMessage = "音声が検出されませんでした。もう一度お話しください。";
          break;
        case "network":
          errorMessage = "ネットワークエラーです。接続をご確認ください。";
          break;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          role: "assistant",
          text: errorMessage
        }
      ]);
    };

    recognition.onend = () => {
      console.log("🛑 音声認識終了");
      setIsListening(false);

      if (finalTranscript && finalTranscript.trim().length > 0 && !isProcessing) {
        handleGptProcessing(finalTranscript);
      }
    };

    recognition.start();
    setCurrentRecognition(recognition);
  };

  // 🎙️ 録音トグル処理
  const toggleRecording = () => {
    setIsRecording((prev) => !prev);

    if (isRecording) {
      console.log("🛑 録音停止");
      setIsListening(false);
      setIsProcessing(false);
      setLastProcessedTranscript(""); // 音声認識停止時にリセット
      if (currentRecognition) {
        currentRecognition.stop();
        setCurrentRecognition(null);
      }
    } else {
      console.log("🎙️ 録音開始");
      setIsProcessing(false); // 開始時にフラグをリセット
      startVoiceRecognition();
    }
  };

  return (
    <div className="flex h-[100dvh] flex-col bg-[var(--user-bg)]">
      <div className="relative flex-1 overflow-y-auto bg-[var(--user-bg)] pb-24">
        <MessageList messages={messages} ttsEnabled={ttsEnabled} setTtsEnabled={setTtsEnabled} />

        {showSummary && (
          <SummaryCard
            summary={summary}
            onChange={setSummary}
            onSubmit={handleSubmitSummary}
            onRetry={handleRetry}
            disabled={isLoading}
            isLoading={isLoading}
          />
        )}

        {isProcessing && (
          <LoadingSpinner message="依頼票を作成しています。<br />お待ちください。" />
        )}

        {isLoading && <LoadingSpinner message="送信中です…" />}

        {retry && (
          <div className="flex justify-center">
            <Button variant="u_secondary" size="block" onClick={handleSubmitSummary}>
              再送する
            </Button>
          </div>
        )}
      </div>

      <VoiceButton
        isRecording={isRecording || isListening}
        onToggle={toggleRecording}
        ttsEnabled={ttsEnabled}
        showSummary={showSummary || isRequestSubmitted}
        isProcessing={isProcessing}
      />
    </div>
  );
}
