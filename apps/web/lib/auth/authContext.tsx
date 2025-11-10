// apps/web/lib/auth/authContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged, Auth } from "firebase/auth";
import { auth } from "../firebase"; // 前回の作業で作成したFirebaseのauthインスタンスをインポート

// ----------------------------------------------------
// 1. Contextの型定義
// ----------------------------------------------------

interface AuthContextType {
  user: User | null; // ログイン中のユーザーオブジェクト (未ログイン時は null)
  loading: boolean; // 認証状態のロード中かどうか
  auth: Auth; // Firebase Authインスタンス自体
}

// ----------------------------------------------------
// 2. Contextの作成
// ----------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ----------------------------------------------------
// 3. Providerコンポーネントの作成
// ----------------------------------------------------

// アプリ全体で認証状態を提供するコンポーネント
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // 初期状態はロード中

  useEffect(() => {
    // Firebaseの認証状態の変更を購読
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false); // 状態が変わったらロード完了
    });

    // クリーンアップ関数: コンポーネントがアンマウントされるときに購読を解除
    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    auth
  };

  return (
    <AuthContext.Provider value={value}>
      {/* 認証状態の確認中は、コンテンツのレンダリングをブロックする */}
      {loading ? <div>認証情報を確認中...</div> : children}
    </AuthContext.Provider>
  );
};

// ----------------------------------------------------
// 4. カスタムフックの作成 (useAuth)
// ----------------------------------------------------

// 認証状態にアクセスするためのカスタムフック
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
