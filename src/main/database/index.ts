import { createConnection, getConnection } from "typeorm";
import path from "path";
import fs from "fs";
import { getDataPath } from "@/shared/utils";

// 数据库初始化方法
export const initDatabase = () => {
  // 配置数据库存储位置
  const databaseDir = getDataPath();
  const databaseName = "database.db";
  const databasePath = path.join(databaseDir, databaseName);

  // 创建数据库存储目录
  if (!fs.existsSync(databaseDir)) {
    fs.mkdirSync(databaseDir);
  }

  return createConnection({
    type: "better-sqlite3",
    database: databasePath,

    entities: [path.resolve(__dirname, "entities/*.{.ts,.js}")],
    migrations: [path.resolve(__dirname, "migrations/*.{.ts,.js}")],
    migrationsRun: true
  });
};

// 数据库关闭方法
export const closeDatabase = () => getConnection().close();

export default {
  initDatabase,
  closeDatabase
};
