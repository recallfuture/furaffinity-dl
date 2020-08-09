import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * 关注列表
 */
@Entity("watchs")
export class Watch {
  constructor(id: string, authorId: string, dir: string) {
    this.id = id;
    this.authorId = authorId;
    this.dir = dir;
  }

  /** 用户 ID */
  @PrimaryColumn("varchar")
  id: string;

  /** 关注的作者 ID */
  @Column("varchar", {
    name: "author_id"
  })
  authorId: string;

  /** 存储位置 */
  @Column("varchar")
  dir: string;

  /** 当前已下载的 gallery 图集数量 */
  @Column("int")
  gallery = 0;

  /** 是否下载 gallery */
  @Column("boolean")
  galleryEnabled = true;

  /** 当前已下载的 scraps 图集数量 */
  @Column("int")
  scraps = 0;

  /** 是否下载 scraps */
  @Column("boolean")
  scrapsEnabled = false;

  /** 是否启用 */
  @Column("boolean")
  enabled = true;
}
