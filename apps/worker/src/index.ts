import { Queue, Worker, QueueEvents, JobsOptions } from "bullmq";
// Note: 環境構築段階では未使用のため一時コメントアウト
// import { createWriteStream } from "node:fs";
import Pino from "pino";

function createLogger() {
  if (process.env.NODE_ENV !== "production") {
    try {
      return Pino({ transport: { target: "pino-pretty" } });
    } catch {
      // pino-pretty 未インストール時でも起動を継続
      return Pino();
    }
  }
  return Pino(); // 本番はJSON
}
const logger = createLogger();
const connection = { connection: { url: process.env.REDIS_URL } };

const digestQueue = new Queue("emailDigest", connection);
new QueueEvents("emailDigest", connection);

// Note: Workerインスタンスは自動的に起動処理を行うため、
// コード上で直接参照する必要がなく、ESLintが未使用警告を出す。
// 一時的に無視しており、将来的に状態監視や停止制御で使用予定。
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const processWorker = new Worker(
  "emailDigest",
  async (job) => {
    logger.info({ jobId: job.id, name: job.name }, "processing job");
    // ここでメールダイジェストの作成や送信を行う（MVPではログのみ）
    return { ok: true };
  },
  connection
);

// デモ用：起動時にキューへジョブ投入
(async () => {
  const opts: JobsOptions = { removeOnComplete: 100, removeOnFail: 1000 };
  await digestQueue.add("daily", { ts: Date.now() }, opts);
  logger.info("Worker started and demo job enqueued");
})();
