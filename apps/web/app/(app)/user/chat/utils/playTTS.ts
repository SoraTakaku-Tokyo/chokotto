// apps/web/app/(app)/user/chat/utils/playTTS.ts
export function playTTS(text: string) {
  if (typeof window === "undefined") return;

  const synth = window.speechSynthesis;
  if (!synth) {
    console.error("❌ speechSynthesis がサポートされていません");
    return;
  }

  // 再生を完全リセットしてから開始（重要）
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // ✅ Kyoko のような日本語音声を優先的に設定
  const voices = synth.getVoices();
  const japaneseVoice = voices.find((v) => v.lang.startsWith("ja") || v.name.includes("Kyoko"));
  if (japaneseVoice) {
    utterance.voice = japaneseVoice;
  }

  // 🎧 再生確認ログ
  utterance.onstart = () => console.log("🔊 再生開始:", text);
  utterance.onend = () => console.log("✅ 再生終了");
  utterance.onerror = (e) => {
    // "interrupted"エラーは正常な処理なので警告レベルに
    if (e.error === "interrupted") {
      console.warn("⚠️ 音声再生が中断されました（前の音声をキャンセル）");
    } else {
      console.error("❌ 音声再生エラー:", e.error);
    }
  };

  // ✅ 再生開始を少し遅延させると安定（Chromeで重要）
  setTimeout(() => {
    // Safari や Chrome で一瞬だけ pause/resume を挟むと有効化されやすい
    synth.resume();
    synth.speak(utterance);
  }, 200);
}
