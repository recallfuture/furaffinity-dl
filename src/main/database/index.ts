import { Connection, createConnection, getConnection } from "typeorm";
import path from "path";
import fs from "fs";
import { getDataPath, requireAll } from "@/shared/utils";

// 数据库初始化方法
export const initDatabase = (): Promise<Connection> => {
  // 配置数据库存储位置
  const databaseDir = getDataPath();
  const databaseName = "database.db";
  const databasePath = path.join(databaseDir, databaseName);

  // 创建数据库存储目录
  if (!fs.existsSync(databaseDir)) {
    fs.mkdirSync(databaseDir);
  }

  return createConnection({
    type: "sqljs",
    location: databasePath,

    // 动态获取全部实体类
    entities: requireAll(
      require.context("./entities", true, /.*\.ts/)
    ) as (() => unknown)[],
    // 动态获取全部迁移类
    migrations: requireAll(
      require.context("./migrations", true, /.*\.ts/)
    ) as (() => unknown)[],
    migrationsRun: true,
  });
};

// 数据库关闭方法
export const closeDatabase = (): Promise<void> => getConnection().close();
