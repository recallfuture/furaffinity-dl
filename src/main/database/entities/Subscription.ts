import { Entity, BaseEntity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { Task } from "./Task";
import { Log } from "./Log";

@Entity()
export class Subscription extends BaseEntity {
  @PrimaryColumn("varchar")
  id = "";
  @Column("varchar")
  name = "";
  @Column("varchar")
  url = "";
  @Column("varchar", { nullable: true })
  avatar: string | undefined;

  @Column("boolean")
  gallery = true;
  @Column("varchar")
  galleryDir = "";
  @Column("int")
  galleryTaskNum = 0;
  @Column("boolean")
  galleryUpdateOnly = false;

  @Column("boolean")
  scraps = false;
  @Column("varchar")
  scrapsDir = "";
  @Column("int")
  scrapsTaskNum = 0;
  @Column("boolean")
  scrapsUpdateOnly = false;

  @OneToMany(
    () => Task,
    task => task.sub
  )
  tasks: Task[] | undefined;

  @OneToMany(
    () => Log,
    log => log.sub
  )
  logs: Log[] | undefined;

  @Column("varchar")
  dir = "";
  @Column("varchar")
  status = "";
  @Column("int")
  createAt = new Date().getTime();
}
