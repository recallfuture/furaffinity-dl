import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Task } from "./Task";
import { Log } from "./Log";

@Entity()
export class Subscription {
  @PrimaryColumn("varchar")
  id: string = "";
  @Column("varchar")
  name: string = "";
  @Column("varchar")
  url: string = "";
  @Column("varchar", { nullable: true })
  avatar: string | undefined;

  @Column("boolean")
  gallery: boolean = true;
  @Column("varchar")
  galleryDir: string = "";
  @Column("int")
  galleryTaskNum: number = 0;
  @Column("boolean")
  galleryUpdateOnly: boolean = false;

  @Column("boolean")
  scraps: boolean = false;
  @Column("varchar")
  scrapsDir: string = "";
  @Column("int")
  scrapsTaskNum: number = 0;
  @Column("boolean")
  scrapsUpdateOnly: boolean = false;

  @OneToMany(
    type => Task,
    task => task.sub
  )
  tasks: Task[] | undefined;

  @OneToMany(
    type => Log,
    log => log.sub
  )
  logs: Log[] | undefined;

  @Column("varchar")
  dir: string = "";
  @Column("varchar")
  status: string = "";
  @Column("int")
  createAt: number = new Date().getTime();
}
