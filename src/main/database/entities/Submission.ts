import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * 作品所在图集
 */
export enum SubmissionCategory {
  Gallery = "gallery",
  Scraps = "scraps"
}

/**
 * 作品表
 */
@Entity("submissions")
export class Submission {
  constructor(
    id: string,
    authorId: string,
    downloadUrl: string,
    category: SubmissionCategory
  ) {
    this.id = id;
    this.authorId = authorId;
    this.downloadUrl = downloadUrl;
    this.category = category;
  }

  /** 作品 ID */
  @PrimaryColumn("varchar")
  id: string;

  /** 作者 ID */
  @Column("varchar", {
    name: "author_id"
  })
  authorId: string;

  /** 作品下载地址 */
  @Column("varchar")
  downloadUrl: string;

  /** 作品所在图集 */
  @Column("varchar")
  category: SubmissionCategory;

  /** 下载好的本地文件路径 */
  @Column("varchar", { name: "file_path", nullable: true })
  filePath?: string;
}
