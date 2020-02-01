import { Entity, PrimaryColumn, Column, JoinColumn, ManyToOne } from "typeorm";
import { Subscription } from "./Subscription";

export enum TaskType {
  Gallery = "gallery",
  Scraps = "scraps"
}

@Entity()
export class Task {
  @PrimaryColumn("varchar")
  id: string = "";

  @Column("varchar")
  url: string = "";

  @Column("varchar")
  downloadUrl: string = "";

  @Column("varchar")
  gid: string = "";

  @Column("varchar", { nullable: true })
  path: string | undefined;

  @Column("varchar")
  status: string = "";

  @Column("varchar")
  type: string = TaskType.Gallery;

  @ManyToOne(
    type => Subscription,
    sub => sub.tasks,
    {
      eager: true
    }
  )
  @JoinColumn()
  sub: Subscription | undefined;
}
