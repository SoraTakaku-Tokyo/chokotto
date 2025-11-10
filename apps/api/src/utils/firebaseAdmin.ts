import * as adminImport from "firebase-admin"; // Admin SDKを別名でインポート
import path from "path";
import * as fs from "fs";
import { ServiceAccount } from "firebase-admin"; // ServiceAccountの型をインポート

// 修正済み: 'as any' を削除し、ESM/CommonJSの互換性を型安全に担保
const admin: typeof adminImport =
  (adminImport as unknown as { default: typeof adminImport }).default || adminImport;

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

// ======================================================
// ここから：環境変数がなくてもDEVモードでは起動するようにする
// ======================================================
//
// if (!serviceAccountPath) {
//   throw new Error("FIREBASE_SERVICE_ACCOUNT_PATH is not set in environment variables.");
// }

if (!serviceAccountPath) {
  if (process.env.USE_FIREBASE_EMULATOR === "true") {
    // 🔸 開発モードではFirebase Admin初期化を完全スキップ
    console.warn("⚠️ Firebase Admin initialization skipped (DEV mode)");
    // return でこのファイル内の初期化処理を終了
  } else {
    // 🔸 本番では従来どおりエラーを投げる
    throw new Error("FIREBASE_SERVICE_ACCOUNT_PATH is not set in environment variables.");
  }
} else {
  // admin.apps.length のチェック
  if (admin.apps.length === 0) {
    // JSONファイルを安全に読み込む
    const serviceAccountJson = fs.readFileSync(path.resolve(serviceAccountPath), "utf8");

    // 💡 JSON.parseの結果に ServiceAccount 型を明示的に指定
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson);

    admin.initializeApp({
      // ServiceAccount 型を cert() に渡すことで型安全性が確保される
      credential: admin.credential.cert(serviceAccount)
    });
  }
}
// ======================================================
// ここまで
// ======================================================

// // admin.apps.length のチェック
// if (admin.apps.length === 0) {
//   if (!serviceAccountPath) {
//     throw new Error("FIREBASE_SERVICE_ACCOUNT_PATH is not set in environment variables.");
//   }

//   // JSONファイルを安全に読み込む
//   const serviceAccountJson = fs.readFileSync(path.resolve(serviceAccountPath), "utf8");

//   // 💡 修正箇所: JSON.parseの結果に ServiceAccount 型を明示的に指定
//   const serviceAccount: ServiceAccount = JSON.parse(serviceAccountJson);

//   admin.initializeApp({
//     // ServiceAccount 型を cert() に渡すことで型安全性が確保される
//     credential: admin.credential.cert(serviceAccount)
//   });
// }

// 外部ファイルでは、この正しく初期化されたSDKインスタンスを使用
export default admin;
