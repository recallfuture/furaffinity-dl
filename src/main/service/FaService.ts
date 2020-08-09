/**
 * 为了避免命名冲突，在此文件进行重命名并重新导出
 */
import {
  Author as getAuthor,
  Gallery as getGalleryPagingResults,
  Scraps as getScrapsPagingResults,
  Submission as getSubmission,
  Submissions as getSubmissions,
  PagingResults,
  Login as faLogin,
} from "furaffinity-api";
import { Submission as FaSubmission } from "furaffinity-api/dist/interfaces";
import { SubmissionCategory } from "../database/entities/Submission";

const apiMap = {
  [SubmissionCategory.Gallery]: getGalleryPagingResults,
  [SubmissionCategory.Scraps]: getScrapsPagingResults,
};

/**
 * 获取图集列表
 * @param category 图集分类
 * @param id 作者 ID
 * @param page 当前页数
 */
export const getPagingResults = (
  category: SubmissionCategory,
  id: string,
  page: number,
  perpage: number
): Promise<PagingResults> => {
  const api = apiMap[category];
  if (!api) {
    throw new Error(`图集类型错误：${category}`);
  }

  return api(id, page, perpage);
};

/**
 * 获取 scraps 作品数量
 * @param id 作者 ID
 * @param total 作品总数
 */
const getScrapsNumber = async (id: string, total: number): Promise<number> => {
  // 二分法求作品数量
  // 从第一页开始计算 scraps 的数量，因为 scraps 通常不会超过 72 张，也就意味着最快只需查一次
  let min = 1;
  let max = Math.floor(total / 72) + 1;
  const perpage = 72;
  for (let page = 1; ; ) {
    const pagingResults = await getScrapsPagingResults(id, page, perpage);
    if (page === 1 && pagingResults.length < perpage) {
      return pagingResults.length;
    }

    if (pagingResults.nextLink) {
      min = page;
      page = page < max ? Math.floor((page + max) / 2) : page * 2;
      max = Math.max(max, page);
    } else if (pagingResults.length > 0) {
      return perpage * (page - 1) + pagingResults.length;
    } else {
      max = page;
      page = Math.floor((page + min) / 2);
    }
  }
};

/**
 * 获取作者各图集的作品数量
 * @param id 作者 ID
 */
export const getAuthorStats = async (
  id: string
): Promise<{
  total: number;
  gallery: number;
  scraps: number;
}> => {
  const faAuthor = await getAuthor(id);

  const total = faAuthor.stats?.submissions || 0;
  const scraps = await getScrapsNumber(id, total);
  const gallery = total - scraps;

  return {
    total,
    gallery,
    scraps,
  };
};

export type { PagingResults, FaSubmission };

export {
  faLogin,
  getGalleryPagingResults as getGalleryItemListFormGallery,
  getScrapsPagingResults as getGalleryItemListFormScraps,
  getSubmission,
  getSubmissions,
};
