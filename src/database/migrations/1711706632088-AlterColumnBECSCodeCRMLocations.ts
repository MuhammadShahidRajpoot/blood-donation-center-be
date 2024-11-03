import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterColumnBECSCodeCRMLocations1711706632088
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "crm_locations" ADD COLUMN "becs_code_varchar" VARCHAR(255)'
    );

    await queryRunner.query(
      'UPDATE "crm_locations" SET becs_code_varchar = CAST(becs_code AS VARCHAR)'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "crm_locations" DROP COLUMN "becs_code_varchar"'
    );
  }
}
