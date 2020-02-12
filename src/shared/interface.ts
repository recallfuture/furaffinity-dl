import { Author } from "furaffinity-api/dist/interfaces";
import { Subscription, Task, Log } from "@/main/database/entity";

export interface User extends Author {
  a: string;
  b: string;
}

export interface TasksStatus {
  gallery: number;
  galleryComplete: number;
  galleryActive: number;
  scraps: number;
  scrapsComplete: number;
  scrapsActive: number;
}

export interface Detail {
  show: boolean;
  sub: Subscription | null;
  tasksStatus: TasksStatus;
  logs: Log[];
}

export interface AriaStatus {
  downloadSpeed: string;
  numActive: string;
  numStopped: string;
  numStoppedTotal: string;
  numWaiting: string;
  uploadSpeed: string;
}
