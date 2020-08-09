import { createConnection, getConnection } from "typeorm";
import { app } from "electron";
import path from "path";
import fs from "fs";

// 配置数据库存储位置
const databaseDir =
  process.env.NODE_ENV === "production"
    ? path.join(app.getPath("documents"), "Furaffinity-dl")
    : ".";
const databaseName = "database.db";
const databasePath = path.join(databaseDir, databaseName);

// 创建数据库存储目录
if (!fs.existsSync(databaseDir)) {
  fs.mkdirSync(databaseDir);
}

// 暴露数据库初始化方法
export const initDatabase = () =>
  createConnection({
    type: "sqlite",
    database: databasePath,

    entities: [path.resolve(__dirname, "entities/*.{.ts,.js}")],
    migrations: [path.resolve(__dirname, "migrations/*.{.ts,.js}")],
    migrationsRun: true
  });

// 暴露数据库关闭方法
export const closeDatabase = getConnection().close;
