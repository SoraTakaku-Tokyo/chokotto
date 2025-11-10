import express from "express";
import helmet from "helmet";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { createClient } from "redis";
import pinoHttp from "pino-http";
import authRouter from "./routes/auth";
import requestsRouter from "./routes/requests";
import ordersRouter from "./routes/orders";
import normalizeTimeRouter from "./routes/normalizeTime";
import gptProxyRouter from "./routes/gptProxy";
import { setupSwagger } from "./swagger.js";

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア設定
app.use(helmet());
app.use(
  cors({
    origin: "*", // 開発時は全許可
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Debug-Role"]
  })
);
app.use(express.json());
app.use(pinoHttp());

// Swagger UIをセットアップ
setupSwagger(app);

// Redis レート制限
const redis = createClient({ url: process.env.REDIS_URL });
redis.connect().catch(console.error);
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args: string[]) => redis.sendCommand(args as string[])
    })
  })
);

// Healthチェック
app.get("/healthz", (_req, res) => res.status(200).send("ok"));

// ルーティング
// 認証ルートを追加
app.use("/api/auth", authRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/gpt-proxy", gptProxyRouter);
app.use("/api/normalize-time", normalizeTimeRouter);

// サーバー起動
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
