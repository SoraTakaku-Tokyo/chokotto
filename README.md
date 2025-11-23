## 目的

- Docker Compose で Web（Next.js）・API（Express + Prisma）・Worker（BullMQ）・Postgres・Redis・Mailpit・Nginx を一括起動します。
- **MVP用・ローカル開発環境** です。

## 前提ツール（ローカルにインストール）

- Node.js 24 LTS
- pnpm
- Docker Desktop（Compose 付き）
- Git
- VS Code（推奨拡張：ESLint / Prettier / Tailwind CSS IntelliSense）
- ngrok（任意：スマホ実機確認用）

### Windows の注意（重要）

- **必ず WSL2 (Ubuntu) 側にリポジトリをクローン**してください。  
  `C:` 配下に置くとファイル監視が不安定・低速になります。

## セットアップ手順

### 1) リポジトリ取得

`git clone <your-repo>`
`cd <your-repo>`

### 2) 環境変数ファイルを作成

`cp .env.example .env.dev`
`cp apps/web/.env.example apps/web/.env.local`

#### Firebase の API キー等を .env.devとapps/web/.env.local に記入

#### .env.dev 末尾の OPENAI_API_KEY=sk-XXXXXXX にキーを記入

### 3) 依存導入

`pnpm install -r`

### 4) サービス起動（初回はビルドあり）

`docker compose up --build`

#### もしエラーが発生して再ビルドが必要な場合…

`docker compose down -v`
`docker compose up --build`

### 5) もしデータが無かったらデータ作成

　マイグレーション
　`docker compose exec api pnpm prisma migrate deploy`
　シーディング
　`docker compose exec api pnpm prisma db seed`

### 6) Playwright のブラウザをインストール ※e2eテストの前にインストールしてください。

`pnpm -F ./apps/web exec playwright install --with-deps`

## アクセス確認

コマンドでバックエンド接続確認
`curl http://localhost:3001/healthz` => ok

```
~~curl -X POST http://localhost:3001/api/tasks \~~
 ~~-H "Content-Type: application/json" \`~~
 ~~-d '{"title":"hello","detail":"first"}'~~
~~=> レコードが作成される（何回か試すとidが増えていく）~~

~~curl http://localhost:3001/api/tasks~~
~~=> 作成した分のレコード取得~~
```

フロントエンド接続
Nginx 経由の動作確認（/ → web, /api → api）
`curl http://localhost/api/healthz` => ok

- `pnpm lint` が正常に実行される
- `pnpm format:check` が正常に実行される
- `pnpm test` 実行で ✓ 1 passed が出る

※E2Eテストの時に使用。それまではインストール不要です。
`

`cd apps/web && pnpm test:e2e` 実行で Playwright のテストが成功する

### ブラウザで「localhost」だけで実行すると画像の画面が表示される

### QRログイン（開発用モック）

サンプル URL: http://localhost:3000/qr?c=TEST

### ホットリロードが効かないとき

Windows/macOS で稀に変更検知が不安定な場合、.env.dev に以下を追記してください（CPU 使用率が増えることがあります）。

CHOKIDAR_USEPOLLING=true
WATCHPACK_POLLING=true

WSL2（Ubuntu）側に置いていれば通常は不要です。

### よくあるトラブルと対処

- Prisma migrate を忘れた
  → docker compose exec -T api pnpm prisma migrate dev --name init を一度実行

- ポート競合（3000/3001/8025/5432/6379）
  → 他アプリを停止、または docker-compose.yml のポートを変更

- Windows で遅い/不安定
  → WSL2 側へクローンし直す（/home/<user>/repo など）

- CI (Verify lockfile is in sync) が失敗した場合
  → PR のチェックで `pnpm -w install --frozen-lockfile` が失敗する場合は、依存追加に対して `pnpm-lock.yaml` が更新されていないことが原因です。

以下を実行して lockfile を最新化してから再コミットしてください。

```bash
pnpm -w install --lockfile-only
pnpm dlx prettier pnpm-lock.yaml --write　// Prettierの整形に合わせる
git add pnpm-lock.yaml
git commit -m "chore: sync lockfile"
git push
```

- Prisma seed で ts-node が見つからない場合

```エラーメッセージ例：
Error: Command failed with ENOENT: ts-node prisma/seed.ts
```

→ 下記を実行してください
💡この対応は 1回だけでOK。
コンテナを再構築（docker compose down -v や --no-cache）した場合のみ再実行してください。

```
docker compose exec api pnpm add -D ts-node typescript --no-lockfile
docker compose exec api npx prisma db seed
```

また、この操作で apps/api/package.json が modified 状態になりますが、
コミットせずに以下で元に戻してください：

```
git restore apps/api/package.json
```

- 音声入力画面でダミーの依頼票が作成されない
  → 変にキャッシュが残っていると、CSSが働かないこともあります。
  `rm -rf apps/web/.next`でキャッシュを削除してから、dockerを再起動してください。

### 便利コマンド（package.json 経由）

#### 起動（= docker compose up --build）

`pnpm dev`

#### 停止とボリューム削除

`pnpm down`

#### ログ追従

`pnpm logs`

### ディレクトリ構成

```bash
.
├── apps
│ ├── api # Express + Prisma
│ ├── web # Next.js + Tailwind
│ └── worker # BullMQ
├── infra/nginx # 開発用 Nginx 設定
├── docker-compose.yml
├── .env.example
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## API ドキュメント (Swagger UI)

開発環境では、以下の URL で API ドキュメント（Swagger UI）を確認できます。  
http://localhost:3001/api/docs

## 📘 API ドキュメント（Swagger / OpenAPI）

このプロジェクトの API 仕様書は OpenAPI 形式（YAML）で定義されています。

OpenAPI ファイル
apps/api/src/docs/openapi.yaml

### ブラウザで表示（Swagger Editor）

https://editor.swagger.io/?url=https://raw.githubusercontent.com/SoraTakaku-Tokyo/chokotto/main/apps/api/src/docs/openapi.yaml
