
FROM node:24-alpine

WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.6.0 --activate

COPY package.json pnpm-workspace.yaml tsconfig.base.json pnpm-lock.yaml ./
# The worker's package.json lives under apps/worker/src in this repo
COPY apps/worker/package.json apps/worker/package.json
RUN pnpm install --frozen-lockfile

COPY apps/worker apps/worker

WORKDIR /app/apps/worker
CMD ["pnpm", "dev"]
