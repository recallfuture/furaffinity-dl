import {MigrationInterface, QueryRunner} from "typeorm";

export class modSub1580551797171 implements MigrationInterface {
    name = 'modSub1580551797171'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "temporary_subscription" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "avatar" varchar, "gallery" boolean NOT NULL, "galleryDir" varchar NOT NULL, "galleryUpdateOnly" boolean NOT NULL, "scraps" boolean NOT NULL, "scrapsDir" varchar NOT NULL, "scrapsUpdateOnly" boolean NOT NULL, "dir" varchar NOT NULL, "status" varchar NOT NULL, "createAt" integer NOT NULL, "url" varchar NOT NULL, "galleryTaskNum" integer NOT NULL, "scrapsTaskNum" integer NOT NULL)`, undefined);
        await queryRunner.query(`INSERT INTO "temporary_subscription"("id", "name", "avatar", "gallery", "galleryDir", "galleryUpdateOnly", "scraps", "scrapsDir", "scrapsUpdateOnly", "dir", "status", "createAt") SELECT "id", "name", "avatar", "gallery", "galleryDir", "galleryUpdateOnly", "scraps", "scrapsDir", "scrapsUpdateOnly", "dir", "status", "createAt" FROM "subscription"`, undefined);
        await queryRunner.query(`DROP TABLE "subscription"`, undefined);
        await queryRunner.query(`ALTER TABLE "temporary_subscription" RENAME TO "subscription"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "subscription" RENAME TO "temporary_subscription"`, undefined);
        await queryRunner.query(`CREATE TABLE "subscription" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar NOT NULL, "avatar" varchar, "gallery" boolean NOT NULL, "galleryDir" varchar NOT NULL, "galleryUpdateOnly" boolean NOT NULL, "scraps" boolean NOT NULL, "scrapsDir" varchar NOT NULL, "scrapsUpdateOnly" boolean NOT NULL, "dir" varchar NOT NULL, "status" varchar NOT NULL, "createAt" integer NOT NULL)`, undefined);
        await queryRunner.query(`INSERT INTO "subscription"("id", "name", "avatar", "gallery", "galleryDir", "galleryUpdateOnly", "scraps", "scrapsDir", "scrapsUpdateOnly", "dir", "status", "createAt") SELECT "id", "name", "avatar", "gallery", "galleryDir", "galleryUpdateOnly", "scraps", "scrapsDir", "scrapsUpdateOnly", "dir", "status", "createAt" FROM "temporary_subscription"`, undefined);
        await queryRunner.query(`DROP TABLE "temporary_subscription"`, undefined);
    }

}
