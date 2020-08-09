import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * Furaffinity 验证用户身份的必要 cookies 结构
 */
interface FaCookies {
  a: string;
  b: string;
}

/**
 * 已登陆的用户表
 */
@Entity("users")
export class User {
  constructor(id: string, name: string, avatar: string, cookies: FaCookies) {
    this.id = id;
    this.name = name;
    this.avatar = avatar;
    this.cookies = cookies;
  }

  /** 用户 ID */
  @PrimaryColumn("varchar")
  id: string;

  /** 用户名 */
  @Column("varchar")
  name: string;

  /** 用户头像 */
  @Column("varchar")
  avatar: string;

  /** 表明用户身份的必要 cookies */
  @Column("simple-json")
  cookies: FaCookies;
}
