import { Entity, PrimaryColumn, Column, JoinColumn, ManyToOne } from "typeorm";
import { Subscription } from "./Subscription";

export enum TaskType {
  Gallery = "gallery",
  Scraps = "scraps"
}

export enum TaskStatus {
  Active = "active",
  Complete = "complete",
  Stopped = "stopped",
  Error = "error",
  Waiting = "waiting",
  Paused = "paused"
}

@Entity()
export class Task {
  @PrimaryColumn("varchar")
  id = "";

  @Column("varchar")
  url = "";

  @Column("varchar")
  downloadUrl = "";

  @Column("varchar")
  gid = "";

  @Column("varchar", { nullable: true })
  path: string | undefined;

  @Column("varchar")
  status = "";

  @Column("varchar")
  type: string = TaskType.Gallery;

  @ManyToOne(
    () => Subscription,
    sub => sub.tasks
  )
  @JoinColumn()
  sub: Subscription | undefined;
}
