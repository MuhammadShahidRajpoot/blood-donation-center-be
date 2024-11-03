import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTablesUpdateCreatedAtDefault1713779943625
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE organizational_levels
      ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
    `);
    await queryRunner.query(`
      ALTER TABLE business_units
      ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
    `);
    await queryRunner.query(`
      ALTER TABLE monthly_goals
      ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
    `);
    await queryRunner.query(`
      ALTER TABLE daily_goals_allocations
      ALTER COLUMN created_at SET DEFAULT now() AT TIME ZONE 'UTC'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE organizational_levels
      ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
    `);
    await queryRunner.query(`
      ALTER TABLE business_units
      ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
    `);
    await queryRunner.query(`
      ALTER TABLE monthly_goals
      ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
    `);
    await queryRunner.query(`
      ALTER TABLE daily_goals_allocations
      ALTER COLUMN created_at SET DEFAULT 'now'::text::timestamp(6) with time zone
    `);
  }
}
