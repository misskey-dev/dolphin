import {MigrationInterface, QueryRunner} from "typeorm";

export class emojiFileId1572933929311 implements MigrationInterface {
    name = 'emojiFileId1572933929311'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "emoji" ADD "fileId" character varying(32) DEFAULT null`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_6606c5938dd47d90d75a38a46f" ON "emoji" ("fileId") `, undefined);
        await queryRunner.query(`ALTER TABLE "emoji" ADD CONSTRAINT "FK_6606c5938dd47d90d75a38a46f0" FOREIGN KEY ("fileId") REFERENCES "drive_file"("id") ON DELETE CASCADE ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "emoji" DROP CONSTRAINT "FK_6606c5938dd47d90d75a38a46f0"`, undefined);
        await queryRunner.query(`DROP INDEX "IDX_6606c5938dd47d90d75a38a46f"`, undefined);
        await queryRunner.query(`ALTER TABLE "emoji" DROP COLUMN "fileId"`, undefined);
    }

}
