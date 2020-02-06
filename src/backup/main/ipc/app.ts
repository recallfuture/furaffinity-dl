import { dialog, app } from "electron";
import ipc from "electron-promise-ipc";
import { win } from "../window";
import { exists } from "fs";
import { promisify } from "util";
import _db from "../database";
import * as db from "../database/service";
import { dbPath } from "../database/api";
import logger from "@/backup/shared/logger";
import fs from "fs";
import { Subscription, Task } from "../database/entity";
import { TaskType } from "../database/entity/Task";

const existsAsync = promisify(exists);

/**
 * 打开选择文件夹的对话框
 * 返回文件夹路径
 */
async function openFolderDialog(): Promise<string[] | undefined> {
  let result;
  if (win) {
    result = await dialog.showOpenDialog(win, {
      properties: ["openDirectory", "multiSelections"]
    });
  } else {
    result = await dialog.showOpenDialog({
      properties: ["openDirectory"]
    });
  }

  return result.filePaths;
}

async function existsPaths(paths: string[]) {
  const result: Boolean[] = [];

  for (const path of paths) {
    result.push(await existsAsync(path));
  }

  return result;
}

/**
 * 是否需要迁移数据库
 */
async function isNeedMigrate(): Promise<Boolean> {
  return fs.existsSync(dbPath);
}

/**
 * 迁移数据库
 */
export async function migrate() {
  // 读取旧数据库
  await _db.initDatabase(dbPath);
  // 获取所有的订阅数据
  const subs = await _db.subscription.getAll();
  console.log(subs.length);

  // 迁移配置信息
  const config = await _db.ariaConfig.get();
  db.saveAriaConfig(config);

  let index = 1;
  for (const sub of subs) {
    try {
      const s = new Subscription();
      s.id = sub.author.id;
      s.name = sub.author.name;
      s.url = sub.author.url;
      s.avatar = sub.author.avatar;
      s.dir = sub.dir;
      s.createAt = sub.createAt;
      s.gallery = sub.gallery;
      s.galleryDir = sub.galleryDir;
      s.galleryTaskNum = sub.galleryTasks.length;
      s.scraps = sub.scraps;
      s.scrapsDir = sub.scrapsDir;
      s.scrapsTaskNum = sub.scrapsTasks.length;
      s.status = sub.status;
      await db.saveSub(s);
      logger.log("添加新订阅", s.id, `${index++}/${subs.length}`);

      await db.addTasks(
        sub.galleryTasks.map(task => {
          const t = new Task();
          t.id = task.id;
          t.gid = task.gid;
          t.path = task.path;
          t.status = task.status;
          t.type = TaskType.Gallery;
          t.url = task.url;
          t.downloadUrl = task.downloadUrl;
          t.sub = s;
          return t;
        })
      );
      await db.addTasks(
        sub.scrapsTasks.map(task => {
          const t = new Task();
          t.id = task.id;
          t.gid = task.gid;
          t.path = task.path;
          t.status = task.status;
          t.type = TaskType.Scraps;
          t.url = task.url;
          t.downloadUrl = task.downloadUrl;
          t.sub = s;
          return t;
        })
      );

      logger.log(
        "任务添加完成",
        sub.galleryTasks.length + sub.scrapsTasks.length
      );
    } catch (e) {
      logger.error(e);
    }
    // 发送迁移状态
    if (win) {
      ipc.send("app.migrateStatus", win?.webContents, {
        current: index,
        total: subs.length
      });
    }
  }
  fs.unlinkSync(dbPath);
}

export function registerAppIpc() {
  ipc.on("app.openFolderDialog", openFolderDialog);
  ipc.on("app.existsPaths", existsPaths as any);
  ipc.on("app.isNeedMigrate", isNeedMigrate);
  ipc.on("app.migrate", migrate);
}
