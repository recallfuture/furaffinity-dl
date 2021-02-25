import {
  Submission,
  SubmissionCategory
} from "@/main/database/entities/Submission";
import logger from "@/shared/logger";
import {
  findSubmissionById,
  createSubmissionFromFaSubmission
} from "../service/SubmissionService";
import {
  GalleryItem,
  getGalleryItemList,
  getSubmission
} from "../service/FaService";
import { Author } from "../database/entities/Author";
import { findAuthorById } from "../service/AuthorService";
import { Watch } from "../database/entities/Watch";

class FetchStopError extends Error {}

/** 是否正在爬取数据 */
const fetching = false;
/** 并行获取数量 */
const concurrency = 1;

/**
 * 获取图集信息
 * @param id 作品 ID
 * @param category 作品所在图集
 */
async function fetchSubmission(
  id: string,
  category: SubmissionCategory
): Promise<Submission> {
  if (!fetching) {
    throw new FetchStopError();
  }

  // 从数据库中拿出作品信息
  const submission = await findSubmissionById(id);
  if (submission) {
    return submission;
  }

  // 从 FA 获取作品信息
  const faSubmission = await getSubmission(id);
  if (faSubmission === null) {
    throw new Error(`作品详情获取失败：${id}`);
  }

  return createSubmissionFromFaSubmission(faSubmission, category);
}

/**
 * 获取列表
 * @param galleryItemList 从 FA 获取到的列表信息
 * @param category 所在图集分类
 */
async function fetchSubmissionList(
  galleryItemList: GalleryItem[],
  category: SubmissionCategory
) {
  for (let begin = 0; begin < galleryItemList.length; begin += concurrency) {
    const items = galleryItemList.slice(begin, begin + concurrency);
    // TODO: 获取成功后进行下载
    await Promise.all(items.map(item => fetchSubmission(item.id, category)));
  }
}

/**
 * 获取该作者某分类下的所有作品
 * @param author 作者信息
 * @param category 目标图集
 */
async function fetchCategory(author: Author, category: SubmissionCategory) {
  // TODO: 可配置最大下载数量
  for (let page = 1; ; page++) {
    // TODO: 每页固定 72 张
    const galleryItemList = await getGalleryItemList(category, author.id, page);
    if (galleryItemList === null) {
      throw new Error("获取作品列表失败");
    }

    if (galleryItemList.length === 0) {
      logger.log(`[${author.id}/${category}/${page}] 获取结束`);
      break;
    }

    await fetchSubmissionList(galleryItemList, category);

    if (galleryItemList.length < 72) {
      logger.log(`[${author.id}/${category}/${page}] 获取结束`);
      break;
    }
  }
}

/**
 * 获取作者下的所有作品
 * @param watch 用户关注的作者信息
 */
async function fetchAuthor(watch: Watch) {
  // 获取作者信息
  const author = await findAuthorById(watch.authorId);

  if (!author) {
    throw new Error(`作者不存在：${watch.authorId}`);
  }

  // 将要下载的图集
  const categoryEnabledMap = {
    [SubmissionCategory.Gallery]: watch.galleryEnabled,
    [SubmissionCategory.Scraps]: watch.scrapsEnabled
  };

  // 遍历图集
  for (const [category, enabled] of Object.entries(categoryEnabledMap)) {
    if (!enabled) {
      continue;
    }

    try {
      // 下载此图集的所有图片
      logger.log(`[${author.id}/${category}] 开始获取`);
      await fetchCategory(author, category as SubmissionCategory);
    } catch (e) {
      if (e instanceof FetchStopError) {
        // 用户手动停止
        logger.log(`[${author.id}/${category}] 用户中止获取`);
        break;
      } else {
        logger.log(`[${author.id}/${category}] 出现错误：\n${e}`);
      }
    }
  }
}
