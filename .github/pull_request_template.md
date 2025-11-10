## 目的

- （このPRで何ができるようになるかを1行で）

## 変更点

- [ ] UI
- [ ] API/DB
- [ ] 認証/QR
- [ ] 音声/AI

## 動作確認

<details>
<summary>ローカル準備（クリックで展開）</summary>

1. ローカルにリポジトリを取得：`git fetch && git checkout <このbranch>`
2. 依存導入：`pnpm install`
3. 環境変数：`.env.example` を参考に `.env` を作成/追記
4. 起動（例）
   - API: `pnpm --filter @app/api dev`
   - Web: `pnpm --filter @app/web dev`
   </details>

- [ ] サポーターとしてログインし、募集中の依頼を引き受ける。

## 共通チェック内容

- [ ] **CIが緑**（PRの _Conversation_ バナーが “All checks have passed”）
- [ ] **Lint / Format をローカルで通過済み**（`pnpm lint` / `pnpm format:check`）
- [ ] **変更範囲が妥当**（該当箇所のみ、`.env`・生成物・大容量バイナリがgitに含まれてない）
- [ ] **UX最小OK**（「通信中」やわかりやすいエラー表示がある、利用者向け画面は高齢者向けになっている など）

## 個別チェック内容

- [ ] 依頼テーブルののステータスが`open`→`matched`になっている
- [ ] 履歴テーブルのステータスが`open`→`matched`になっている
