/**
 * 为了避免命名冲突，在此文件进行重命名并重新导出
 */

import {
  Gallery as getGalleryItemListFormGallery,
  Result as GalleryItem,
  Scraps as getGalleryItemListFormScraps,
  Submission as getSubmission
} from "furaffinity-api";
import { Submission as FaSubmission } from "furaffinity-api/dist/interfaces";
import { SubmissionCategory } from "../database/entities/Submission";

const apiMap = {
  [SubmissionCategory.Gallery]: getGalleryItemListFormGallery,
  [SubmissionCategory.Scraps]: getGalleryItemListFormScraps
};

/**
 * 获取图集列表
 * @param category 图集分类
 * @param id 作者 ID
 * @param page 当前页数
 */
export const getGalleryItemList = (
  category: SubmissionCategory,
  id: string,
  page: number
) => {
  const api = apiMap[category];
  if (!api) {
    throw new Error(`图集类型错误：${category}`);
  }

  return api(id, page);
};

export {
  GalleryItem,
  getGalleryItemListFormGallery,
  getGalleryItemListFormScraps,
  getSubmission,
  FaSubmission
};
