"use client";

type VoiceButtonProps = {
  isRecording: boolean;
  onToggle: () => void;
  ttsEnabled: boolean;
  showSummary: boolean;
  isProcessing?: boolean;
};

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21H9v2h6v-2h-2v-3.08A7 7 0 0 0 19 11h-2Z" />
    </svg>
  );
}

function StopIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

export default function VoiceButton({
  isRecording,
  onToggle,
  ttsEnabled,
  showSummary,
  isProcessing = false
}: VoiceButtonProps) {
  if (!ttsEnabled || showSummary || isProcessing) {
    return null;
  }

  return (
    <>
      {/* フローティングボタン */}
      <div className="fixed bottom-6 left-0 right-0 z-50 flex flex-col items-center space-y-2">
        {/* 状態表示テキスト */}
        <p className={`text-lg font-medium ${isRecording ? "text-red-500" : "text-gray-800"}`}>
          {isRecording ? "話し終わったらここを押して止める" : "ここを押して話す"}
        </p>

        {/* 録音ボタン */}
        <button
          onClick={onToggle}
          className={`flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-all duration-200 hover:scale-105 ${
            isRecording
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-orange-500 text-white hover:bg-orange-600"
          }`}
          aria-label={isRecording ? "録音停止" : "録音開始"}
        >
          {isRecording ? <StopIcon className="h-6 w-6" /> : <MicIcon className="h-6 w-6" />}
        </button>
      </div>
    </>
  );
}
