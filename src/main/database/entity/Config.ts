import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum ConfigType {
  Aria = "aria",
  User = "user"
}

@Entity()
export class Config {
  @PrimaryGeneratedColumn()
  id: number | undefined;

  @Column("varchar")
  type: string | undefined;

  @Column("text")
  data: string | undefined;
}
