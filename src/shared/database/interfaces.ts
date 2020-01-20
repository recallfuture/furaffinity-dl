import { Author, Submission } from "furaffinity-api/dist/interfaces";

export interface AriaConfig {
  "all-proxy": string;
  "allow-overwrite": boolean;
  "auto-file-renaming": boolean;
  continue: boolean;
  dir: string;
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
  "log-path": string;
  "session-path": string;
}

export interface Task {
  gid?: string;
  path?: string;
  status: string;
  submission: Submission;
}

export interface Subscription {
  author: Author;
  gallery: boolean;
  scraps: boolean;
  galleryTasks: Task[];
  scrapsTasks: Task[];
  dir: string;
  log: string[];
  status: string;
  updateOnly: boolean;
  createAt: number;
  deleted: boolean;
}