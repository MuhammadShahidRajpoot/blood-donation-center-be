import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterColumnBECSCodeAddVarcharCRMLocationsHistory1711806416701
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "crm_locations_history" ADD COLUMN "becs_code_varchar" VARCHAR(255)'
    );

    await queryRunner.query(
      'UPDATE "crm_locations_history" SET becs_code_varchar = CAST(becs_code AS VARCHAR)'
    );

    await queryRunner.query(
      'ALTER TABLE "crm_locations_history" DROP COLUMN "becs_code"'
    );

    await queryRunner.query(
      'ALTER TABLE crm_locations_history RENAME COLUMN "becs_code_varchar" TO "becs_code"'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE crm_locations_history RENAME COLUMN "becs_code" TO "becs_code_varchar"'
    );

    await queryRunner.query(
      'ALTER TABLE "crm_locations_history" ADD COLUMN "becs_code" BIGINT'
    );

    await queryRunner.query(
      'UPDATE "crm_locations_history" SET becs_code = CAST(becs_code_varchar AS BIGINT)'
    );

    await queryRunner.query(
      'ALTER TABLE "crm_locations_history" DROP COLUMN "becs_code_varchar"'
    );
  }
}
