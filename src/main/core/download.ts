import { session } from "electron";
import { join } from "path";

const cacheUrlPath = new Map<string, string>();
const downloadingTaskQuene: Electron.DownloadItem[] = [];
const waitingTaskQuene: Electron.DownloadItem[] = [];

const options = {
  maxDownloading: 8,
};

export const initDownloadManager = (): void => {
  session.defaultSession.setProxy({ mode: "system" });
  session.defaultSession.on("will-download", (e, item) => {
    // 取出下载地址和缓存中的保存位置
    const url = item.getURL();
    const path = cacheUrlPath.get(url);

    console.log(url, path);

    if (!path) {
      // 不在缓存中的话就不做特殊处理，调用系统默认行为
      return;
    }

    // 设置下载位置
    item.setSavePath(join(path, item.getFilename()));

    // 超出最大并行下载量的话，存入下载中列表
    if (downloadingTaskQuene.length >= options.maxDownloading) {
      item.pause();
      waitingTaskQuene.push(item);
      return;
    }

    console.log(url + "开始完成");
    downloadingTaskQuene.push(item);

    // 监听下载完成事件
    item.once("done", () => {
      // 移除下载中的项目并清理缓存
      console.log(url + "下载完成");
      cacheUrlPath.delete(url);
      downloadingTaskQuene.splice(downloadingTaskQuene.indexOf(item), 1);

      // 还原等待中的下载项
      while (
        downloadingTaskQuene.length < options.maxDownloading &&
        waitingTaskQuene.length > 0
      ) {
        const nextItem = waitingTaskQuene.shift();
        if (nextItem) {
          nextItem.resume();
          downloadingTaskQuene.push(nextItem);
        }
      }
    });
  });
};

export const addUrl = (url: string, path: string): void => {
  if (cacheUrlPath.has(url)) {
    return;
  }

  cacheUrlPath.set(url, path);
  session.defaultSession.downloadURL(url);
};
