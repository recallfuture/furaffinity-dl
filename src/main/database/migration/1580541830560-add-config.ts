import {MigrationInterface, QueryRunner} from "typeorm";

export class addConfig1580541830560 implements MigrationInterface {
    name = 'addConfig1580541830560'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "config" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "type" varchar NOT NULL, "data" text NOT NULL)`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "config"`, undefined);
    }

}
