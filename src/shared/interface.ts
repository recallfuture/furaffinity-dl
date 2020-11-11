export interface AriaConfig {
  "all-proxy": string;
  "allow-overwrite": boolean;
  "auto-file-renaming": boolean;
  continue: boolean;
  "max-concurrent-downloads": number;
  "max-connection-per-server": number;
  "max-download-limit": number | string;
  "max-overall-download-limit": number | string;
  "max-overall-upload-limit": number | string;
  "min-split-size": string;
  "rpc-listen-port": number;
  "rpc-secret": string;
  split: number;
  "user-agent": string;
}

export interface UserConfig {
  /** 用户身份信息，可通过网页登录获得 */
  cookie?: {
    a: string;
    b: string;
  };

  /** 默认下载目录 */
  dir: string;
}
