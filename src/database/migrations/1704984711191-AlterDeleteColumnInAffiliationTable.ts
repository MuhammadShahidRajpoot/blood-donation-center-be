import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterDeleteColumnInAffiliationTable1704984711191
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove deleted_at column from affiliation table
    await queryRunner.query(
      'ALTER TABLE affiliation DROP COLUMN IF EXISTS deleted_at'
    );

    // Remove deleted_at column from affiliation_history table
    await queryRunner.query(
      'ALTER TABLE affiliation_history DROP COLUMN IF EXISTS deleted_at'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Adding deleted_at column back to affiliation table (you might need to adjust the data type)
    await queryRunner.query(
      'ALTER TABLE affiliation ADD COLUMN deleted_at TIMESTAMP'
    );

    // Adding deleted_at column back to affiliation_history table (you might need to adjust the data type)
    await queryRunner.query(
      'ALTER TABLE affiliation_history ADD COLUMN deleted_at TIMESTAMP'
    );
  }
}
