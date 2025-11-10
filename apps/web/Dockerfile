# apps/web 用
FROM node:24-alpine

# Firebaseなどの外部HTTPS接続を可能にする
RUN apk update && apk add --no-cache ca-certificates

WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

# 開発用設定を明示（devDependenciesも含める）
ENV NODE_ENV=development

# ルートメタとワークスペース定義を先に
COPY package.json pnpm-workspace.yaml tsconfig.base.json pnpm-lock.yaml ./
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile

# 残りのソース
COPY apps/web apps/web

WORKDIR /app/apps/web
EXPOSE 3000
CMD ["pnpm", "dev"]
