// Redis 接続可否だけ確認（BullMQを使わず簡易に）
import { createClient } from "redis";
const client = createClient({ url: process.env.REDIS_URL });
try {
  const start = Date.now();
  await client.connect();
  await client.ping();
  await client.quit();
  const ms = Date.now() - start;
  console.log(`ok ${ms}ms`);
  process.exit(0);
} catch (e) {
  console.error(e);
  process.exit(1);
}
