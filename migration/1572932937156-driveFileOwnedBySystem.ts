import {MigrationInterface, QueryRunner} from "typeorm";

export class driveFileOwnedBySystem1572932937156 implements MigrationInterface {
    name = 'driveFileOwnedBySystem1572932937156'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "drive_file" ADD "ownedBySystem" boolean NOT NULL DEFAULT false`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "drive_file" DROP COLUMN "ownedBySystem"`, undefined);
    }

}
