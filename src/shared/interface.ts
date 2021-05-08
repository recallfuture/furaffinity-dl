export interface UserConfig {
  /** 用户身份信息，可通过网页登录获得 */
  cookie?: {
    a: string;
    b: string;
  };

  /** 默认下载目录 */
  dir: string;
}
