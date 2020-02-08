import ipc from "electron-promise-ipc";
import { Author, Result, Submission } from "furaffinity-api/dist/interfaces";

/**
 * 清除 furaffinity.net 的所有cookie
 */
export async function clearCookies() {
  // @ts-ignore
  return await ipc.send("fa.clearCookies");
}

/**
 * 获取 furaffinity.net 的所有cookie
 */
export async function getCookies(): Promise<Electron.Cookie[]> {
  // @ts-ignore
  return await ipc.send("fa.getCookies");
}

/**
 * 通过 cookie 登录
 */
export async function faLogin(a: string, b: string) {
  // @ts-ignore
  return await ipc.send("fa.login", a, b);
}

/**
 * 获取当前已登录的用户
 */
export async function faUser(): Promise<Author | null> {
  // @ts-ignore
  return await ipc.send("fa.user");
}

/**
 * 获取用户的关注列表
 */
export async function faWatchingList(): Promise<Author[]> {
  // @ts-ignore
  return await ipc.send("fa.watchingList");
}

/**
 * 获取用户的详细信息
 * @param id 用户id
 */
export async function faAuthor(id: string): Promise<Author> {
  // @ts-ignore
  return await ipc.send("fa.author", id);
}

/**
 * 获取某一页 gallery 的所有结果
 * @param id 用户id
 * @param page 当前页数
 */
export async function faGallery(id: string, page: number): Promise<Result> {
  // @ts-ignore
  return await ipc.send("fa.gallery", id, page);
}

/**
 * 获取某一页 scraps 的所有结果
 * @param id 用户id
 * @param page 当前页数
 */
export async function faScraps(id: string, page: number): Promise<Result> {
  // @ts-ignore
  return await ipc.send("fa.scraps", id, page);
}

/**
 * 获取作品详情
 * @param id 作品id
 */
export async function faSubmission(id: string): Promise<Submission> {
  // @ts-ignore
  return await ipc.send("fa.submission", id);
}

export async function openFolderDialog(): Promise<string | undefined> {
  // @ts-ignore
  return await ipc.send("app.openFolderDialog");
}

export async function existsPaths(paths: string[]): Promise<boolean[]> {
  // @ts-ignore
  return await ipc.send("app.existsPaths", paths);
}

export async function isNeedMgrate() {
  // @ts-ignore
  return await ipc.send("app.isNeedMigrate");
}

export async function migrate() {
  // @ts-ignore
  return await ipc.send("app.migrate");
}