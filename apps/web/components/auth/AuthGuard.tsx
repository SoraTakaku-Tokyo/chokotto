// apps/web/components/auth/AuthGuard.tsx

"use client";

import React, { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/authContext"; // 作成済みのカスタムフック

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  // 認証状態とロード状態を取得
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 認証情報の確認が完了していて (loading === false)、
    // かつユーザーがログインしていない場合 (user === null) にリダイレクトを実行
    if (!loading && !user) {
      // ログインページへリダイレクト
      // TODO: パスを /supporter-login に設定
      router.push("/supporter-login");
    }

    // user, loading, router が変更されたときに useEffect を再実行
  }, [user, loading, router]);

  // 1. 認証情報を確認中の場合は、ローディング画面を表示
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-lg text-gray-600">
        認証情報を確認中です...
      </div>
    );
  }

  // 2. ログインしていない場合は、useEffectでリダイレクトされるため、ここでは何も表示しない

  // 3. ログインしている場合は、子コンポーネント（保護されたページ）を表示
  if (user) {
    return <>{children}</>;
  }

  // ユーザーがいないが、ロードが完了している場合は、useEffectでリダイレクト済み
  return null;
};

export default AuthGuard;
