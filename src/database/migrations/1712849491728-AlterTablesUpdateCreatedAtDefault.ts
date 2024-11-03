import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTablesUpdateCreatedAtDefault1712849491728
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE territory
      ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
    `);
    await queryRunner.query(`
      ALTER TABLE crm_non_collection_profiles
      ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
    `);
    await queryRunner.query(`
      ALTER TABLE operations_status
      ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
    `);
    await queryRunner.query(`
      ALTER TABLE task
      ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE territory
      ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
    `);
    await queryRunner.query(`
      ALTER TABLE crm_non_collection_profiles
      ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
    `);
    await queryRunner.query(`
      ALTER TABLE operations_status
      ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
    `);
    await queryRunner.query(`
      ALTER TABLE task
      ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
    `);
  }
}
