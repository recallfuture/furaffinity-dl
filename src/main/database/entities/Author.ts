import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * 画师类
 */
@Entity("authors")
export class Author {
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  /** 用户 ID */
  @PrimaryColumn("varchar")
  id: string;
  /** 用户名 */
  @Column("varchar")
  name: string;
  /** 头像 */
  @Column("varchar", { nullable: true })
  avatar?: string;

  /** 作品总数 */
  @Column("int", {
    default: 0
  })
  submissions = 0;
  /** gallery 内作品总数 */
  @Column("int", {
    default: 0
  })
  gallery = 0;
  /** scraps 内作品总数 */
  @Column("int", {
    default: 0
  })
  scraps = 0;
}
