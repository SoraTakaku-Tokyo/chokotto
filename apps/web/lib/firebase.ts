import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage"; // ★修正箇所: connectStorageEmulator をインポート
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// クライアント側でFirebase SDKが使用する設定値
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_WEB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, // 必要に応じて追加
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID // 必要に応じて追加
};

// Next.jsの環境変数チェック
const useEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";
// ★修正箇所: .env.devで設定した新しい環境変数を取得
const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST;

// アプリの初期化
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// サービスインスタンスの取得
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

if (useEmulator && emulatorHost) {
  // ★修正: NEXT_PUBLIC_FIREBASE_EMULATOR_HOST (http://host.docker.internal:9099) を使用

  // 例: emulatorHostが 'http://host.docker.internal:9099' の場合、ホストとポートを分解
  const url = new URL(emulatorHost);
  const host = url.hostname;
  const port = parseInt(url.port, 10);

  // Auth Emulator への接続
  console.log(`[Firebase] Connecting to Auth Emulator at ${host}:${port}`);
  connectAuthEmulator(auth, `${url.protocol}//${host}:${port}`, { disableWarnings: true });

  // Firestore Emulator への接続
  // Firestoreのエミュレータはポート8080であることが多いですが、ここでは一旦9099をベースにします。
  // 必要に応じてポートを修正してください（例: port: 8080）。
  console.log(`[Firebase] Connecting to Firestore Emulator at ${host}:8080`);
  connectFirestoreEmulator(db, host, 8080);

  // Storage Emulator への接続
  // Storageのエミュレータはポート9199であることが多いですが、ここでは一旦9099をベースにします。
  console.log(`[Firebase] Connecting to Storage Emulator at ${host}:9199`);
  connectStorageEmulator(storage, host, 9199);
} else if (useEmulator && !emulatorHost) {
  // エミュレーター使用フラグはONだが、ホストが設定されていない場合の警告
  console.warn(
    "NEXT_PUBLIC_USE_FIREBASE_EMULATOR is 'true', but NEXT_PUBLIC_FIREBASE_EMULATOR_HOST is missing."
  );
}

// APIテスト用のコード。APIがフロントとつながったら削除する！
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).auth = getAuth();
}