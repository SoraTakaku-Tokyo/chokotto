// Admin SDK初期化

import * as admin from "firebase-admin";

let app: admin.app.App | undefined;

/**
 * Firebase Admin App インスタンスを取得する
 * 環境変数 GCP_SA_JSON があれば認証情報を使って初期化し、なければ認証情報なしで初期化する
 */
export function getAdminApp() {
  if (app) return app;

  const projectId = process.env.FIREBASE_PROJECT_ID || "demo-myapp";
  const gcpSaJson = process.env.GCP_SA_JSON;

  // 本物のSAが無くても “アプリは起動できる” ようにする
  // 認証情報があればそれを使用
  if (gcpSaJson) {
    const cred = admin.credential.cert(JSON.parse(gcpSaJson));
    app = admin.initializeApp({ credential: cred, projectId });
    try {
      const cred = admin.credential.cert(JSON.parse(gcpSaJson));
      app = admin.initializeApp({ credential: cred, projectId });
      console.log("Firebase Admin SDK initialized with Service Account.");
    } catch (e) {
      console.error(
        "FATAL: Failed to initialize Firebase Admin SDK with GCP_SA_JSON. Check JSON format.",
        e
      );
      // エラー発生時は認証情報なしで続行（開発モードを想定）
      app = admin.initializeApp({ projectId });
    }
  } else {
    // 資格情報なし。verifyIdToken等は“開発モードでスタブ”想定
    app = admin.initializeApp({ projectId });
    console.warn(
      "Firebase Admin SDK initialized without Service Account. Running in development mode."
    );
  }
  return app;
}

/**
 * Firebase Authのインスタンスを取得する (Custom Token発行に使用)
 */
export const adminAuth = () => {
  const adminApp = getAdminApp();
  return adminApp.auth();
};
