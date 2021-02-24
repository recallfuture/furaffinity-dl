import { MigrationInterface, QueryRunner } from "typeorm";

export class Base1614165964691 implements MigrationInterface {
  name = "Base1614165964691";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "authors" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "avatar" varchar,
                "submissions" integer NOT NULL DEFAULT (0),
                "gallery" integer NOT NULL DEFAULT (0),
                "scraps" integer NOT NULL DEFAULT (0)
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "submissions" (
                "id" varchar PRIMARY KEY NOT NULL,
                "author_id" varchar NOT NULL,
                "downloadUrl" varchar NOT NULL,
                "category" varchar NOT NULL,
                "gid" varchar NOT NULL,
                "file_path" varchar
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" varchar PRIMARY KEY NOT NULL,
                "name" varchar NOT NULL,
                "avatar" varchar NOT NULL,
                "cookies" text NOT NULL
            )
        `);
    await queryRunner.query(`
            CREATE TABLE "watchs" (
                "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
                "user_id" varchar NOT NULL,
                "author_id" varchar NOT NULL
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "watchs"
        `);
    await queryRunner.query(`
            DROP TABLE "users"
        `);
    await queryRunner.query(`
            DROP TABLE "submissions"
        `);
    await queryRunner.query(`
            DROP TABLE "authors"
        `);
  }
}
