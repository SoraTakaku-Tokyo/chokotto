
# ✨ Alpine ではなく Debian(glibc) を使う
FROM node:24-bookworm-slim

WORKDIR /app
ENV PNPM_HOME="/pnpm" \
    PATH="$PNPM_HOME:$PATH" \
    PNPM_LOG_LEVEL=info

# pnpm を固定
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

# ネイティブ依存のために root 証明書等を用意
# ヘルスチェックのために 'curl' がインストールされていることを確認
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends ca-certificates openssl curl \
  && rm -rf /var/lib/apt/lists/*

# 1) ワークスペース定義 + lockfile
COPY package.json pnpm-workspace.yaml tsconfig.base.json pnpm-lock.yaml ./
COPY apps/api/package.json apps/api/

# ----------------------------------------------------
# 💡 prisma の実体は apps/api/prisma 配下
# postinstall で prisma generate が実行される場合に備え、先にコピー
# ----------------------------------------------------
COPY apps/api/prisma/ apps/api/prisma/

# ここから新構成（オンラインビルド：開発時用）
# 依存を lockfile に基づいてオンラインインストール
# ==============================
RUN pnpm install --frozen-lockfile

# ソースコードをコピー（依存解決後）
# このステップは、APIコード全体をコピーするために維持します。
COPY apps/api apps/api

WORKDIR /app/apps/api
EXPOSE 3001

# ----------------------------------------------------
# 🌟 修正ポイント: HEALTHCHECK を追加
# 起動後10秒待機し、5秒ごとに /healthz をチェックする
# ----------------------------------------------------
HEALTHCHECK --interval=5s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:3001/healthz || exit 1

CMD ["pnpm", "dev"]
