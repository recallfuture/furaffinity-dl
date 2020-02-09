import { Author } from "furaffinity-api/dist/interfaces";
import { Subscription, Task, Log } from "@/main/database/entity";

export interface User extends Author {
  a: string;
  b: string;
}

export interface Detail {
  show: boolean;
  sub: Subscription | null;
  tasks: Task[];
  logs: Log[];
}
