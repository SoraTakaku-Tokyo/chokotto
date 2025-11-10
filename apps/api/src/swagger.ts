import fs from "fs";
import path from "path";
import yaml from "yaml";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { fileURLToPath } from "url";

// ESM環境で__dirnameを再現
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// YAMLファイルのパス
const filePath = path.join(__dirname, "docs", "openapi.yaml");
const file = fs.readFileSync(filePath, "utf8");
const swaggerDocument = yaml.parse(file);

export const setupSwagger = (app: Express): void => {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
