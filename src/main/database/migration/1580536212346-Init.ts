import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1580536212346 implements MigrationInterface {
  name = "Init1580536212346";

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "task" ("id" varchar PRIMARY KEY NOT NULL, "url" varchar NOT NULL, "downloadUrl" varchar NOT NULL, "gid" varchar NOT NULL, "path" varchar, "status" varchar NOT NULL, "type" varchar NOT NULL, "subId" varchar)`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "subscription" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "avatar" varchar, "gallery" boolean NOT NULL, "galleryDir" varchar NOT NULL, "galleryUpdateOnly" boolean NOT NULL, "scraps" boolean NOT NULL, "scrapsDir" varchar NOT NULL, "scrapsUpdateOnly" boolean NOT NULL, "dir" varchar NOT NULL, "status" varchar NOT NULL, "createAt" integer NOT NULL)`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "log" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "message" varchar NOT NULL, "createAt" integer NOT NULL, "subId" varchar)`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_task" ("id" varchar PRIMARY KEY NOT NULL, "url" varchar NOT NULL, "downloadUrl" varchar NOT NULL, "gid" varchar NOT NULL, "path" varchar, "status" varchar NOT NULL, "type" varchar NOT NULL, "subId" varchar, CONSTRAINT "FK_2182e7d823816279691a4364e7c" FOREIGN KEY ("subId") REFERENCES "subscription" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
      undefined
    );
    await queryRunner.query(
      `INSERT INTO "temporary_task"("id", "url", "downloadUrl", "gid", "path", "status", "type", "subId") SELECT "id", "url", "downloadUrl", "gid", "path", "status", "type", "subId" FROM "task"`,
      undefined
    );
    await queryRunner.query(`DROP TABLE "task"`, undefined);
    await queryRunner.query(
      `ALTER TABLE "temporary_task" RENAME TO "task"`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "temporary_log" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "message" varchar NOT NULL, "createAt" integer NOT NULL, "subId" varchar, CONSTRAINT "FK_30b63c9a5b1cadb2c2d31a9c1c2" FOREIGN KEY ("subId") REFERENCES "subscription" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
      undefined
    );
    await queryRunner.query(
      `INSERT INTO "temporary_log"("id", "type", "message", "createAt", "subId") SELECT "id", "type", "message", "createAt", "subId" FROM "log"`,
      undefined
    );
    await queryRunner.query(`DROP TABLE "log"`, undefined);
    await queryRunner.query(
      `ALTER TABLE "temporary_log" RENAME TO "log"`,
      undefined
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "log" RENAME TO "temporary_log"`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "log" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "message" varchar NOT NULL, "createAt" integer NOT NULL, "subId" varchar)`,
      undefined
    );
    await queryRunner.query(
      `INSERT INTO "log"("id", "type", "message", "createAt", "subId") SELECT "id", "type", "message", "createAt", "subId" FROM "temporary_log"`,
      undefined
    );
    await queryRunner.query(`DROP TABLE "temporary_log"`, undefined);
    await queryRunner.query(
      `ALTER TABLE "task" RENAME TO "temporary_task"`,
      undefined
    );
    await queryRunner.query(
      `CREATE TABLE "task" ("id" varchar PRIMARY KEY NOT NULL, "url" varchar NOT NULL, "downloadUrl" varchar NOT NULL, "gid" varchar NOT NULL, "path" varchar, "status" varchar NOT NULL, "type" varchar NOT NULL, "subId" varchar)`,
      undefined
    );
    await queryRunner.query(
      `INSERT INTO "task"("id", "url", "downloadUrl", "gid", "path", "status", "type", "subId") SELECT "id", "url", "downloadUrl", "gid", "path", "status", "type", "subId" FROM "temporary_task"`,
      undefined
    );
    await queryRunner.query(`DROP TABLE "temporary_task"`, undefined);
    await queryRunner.query(`DROP TABLE "log"`, undefined);
    await queryRunner.query(`DROP TABLE "subscription"`, undefined);
    await queryRunner.query(`DROP TABLE "task"`, undefined);
  }
}
