import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTenantTimezonesTable1713779943624
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE tenant_time_zones ALTER COLUMN name type varchar(100)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE tenant_time_zones ALTER COLUMN name type varchar(30)`
    );
  }
}
