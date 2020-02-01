import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Subscription } from "./Subscription";

export enum LogType {
  Log = "log",
  Info = "info",
  Warning = "warning",
  Error = "error"
}

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id: number | undefined;

  @Column("varchar")
  type: string = LogType.Info;

  @Column("varchar")
  message: string = "";

  @Column("int")
  createAt: number = new Date().getTime();

  @ManyToOne(
    type => Subscription,
    sub => sub.logs
  )
  sub: Subscription | undefined;
}
