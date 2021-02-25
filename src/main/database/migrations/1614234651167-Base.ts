import { MigrationInterface, QueryRunner } from "typeorm";

export class Base1614234651167 implements MigrationInterface {
  name = "Base1614234651167";

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
                "id" varchar PRIMARY KEY NOT NULL,
                "author_id" varchar NOT NULL,
                "dir" varchar NOT NULL,
                "gallery" integer NOT NULL,
                "galleryEnabled" boolean NOT NULL,
                "scraps" integer NOT NULL,
                "scrapsEnabled" boolean NOT NULL,
                "enabled" boolean NOT NULL
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
