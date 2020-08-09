import {
  Submission,
  SubmissionCategory,
} from "@/main/database/entities/Submission";
import { Author } from "@/main/database/entities/Author";
import { findAuthorById } from "@/main/service/AuthorService";
import { findWatchByIdAndAuthorId } from "@/main/service/WatchService";
import logger from "@/shared/logger";
import {
  findSubmissionById,
  createSubmissionFromFaSubmission,
  findSubmissionsIn,
} from "@/main/service/SubmissionService";
import {
  PagingResults,
  getPagingResults,
  getSubmission,
  getSubmissions,
} from "@/main/service/FaService";

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
 * @param pagingResults 从 FA 获取到的列表信息
 * @param category 所在图集分类
 */
async function fetchSubmissionList(
  pagingResults: PagingResults,
  category: SubmissionCategory
) {
  for (let begin = 0; begin < pagingResults.length; begin += concurrency) {
    const items = pagingResults.slice(begin, begin + concurrency);
    // TODO: 获取成功后进行下载
    await Promise.all(items.map((item) => fetchSubmission(item.id, category)));
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
    // 每页固定 72 张
    const pagingResults = await getPagingResults(category, author.id, page, 72);

    if (pagingResults.length === 0) {
      logger.log(`[${author.id}/${category}/${page}] 获取结束`);
      break;
    }

    await fetchSubmissionList(pagingResults, category);

    if (pagingResults.length < 72) {
      logger.log(`[${author.id}/${category}/${page}] 获取结束`);
      break;
    }
  }
}

/**
 * 获取作者下的所有作品
 * @param watch 用户关注的作者信息
 */
async function fetchAuthor(userId: string, authorId: string) {
  // 获取作者信息
  const watch = await findWatchByIdAndAuthorId(userId, authorId);
  const author = await findAuthorById(watch.authorId);

  // 将要下载的图集
  const categoryEnabledMap = {
    [SubmissionCategory.Gallery]: watch.galleryEnabled,
    [SubmissionCategory.Scraps]: watch.scrapsEnabled,
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

export function fetchAuthors(authors: string[], skipWhenExists = false) {
  return Promise.all(authors.map((authorId) => fetchAuthor("", authorId)));
}

/**
 * 查找有新作品的作者
 * 根据作品发布时间线上的数据来统计的
 * @param totalPage 查找的最大页数
 */
export async function fetchNeedUpdateAuthors(
  maxPage: number
): Promise<string[]> {
  const needUpdateAuthors = new Set<string>();

  let pagingResults = await getSubmissions();
  for (let page = 1; page <= maxPage; page++) {
    const authorSubmissionMap: { [key: string]: string[] } = {};
    pagingResults.forEach((result) => {
      const authorId = result.author.id;
      authorSubmissionMap[authorId] = authorSubmissionMap[authorId] || [];
      authorSubmissionMap[authorId].push(result.id);
    });

    await Promise.all(
      Object.entries(authorSubmissionMap).map(async ([authorId, idList]) => {
        const entities = await findSubmissionsIn(idList);
        // 查找是否有没获取的
        if (entities.length < idList.length) {
          needUpdateAuthors.add(authorId);
        }
      })
    );

    if (!pagingResults.next) break;
    pagingResults = await pagingResults.next();
  }

  return Array.from(needUpdateAuthors);
}
