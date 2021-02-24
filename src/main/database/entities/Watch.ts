import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * 关注列表
 */
@Entity("watchs")
export class Watch {
  constructor(userId: string, authorId: string) {
    this.userId = userId;
    this.authorId = authorId;
  }

  /** 自增主键 */
  @PrimaryGeneratedColumn()
  id?: number;

  /** 用户 ID */
  @Column("varchar", {
    name: "user_id"
  })
  userId: string;

  /** 关注的作者 ID */
  @Column("varchar", {
    name: "author_id"
  })
  authorId: string;
}
