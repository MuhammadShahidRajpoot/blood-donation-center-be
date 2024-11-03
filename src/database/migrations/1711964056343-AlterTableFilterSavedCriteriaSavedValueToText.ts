import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableFilterSavedCriteriaSavedValueToText1711964056343
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.filter_saved_criteria ALTER COLUMN filter_saved_value TYPE text USING filter_saved_value::text;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE public.filter_saved_criteria ALTER COLUMN filter_saved_value TYPE varchar(255) USING filter_saved_value::varchar(255);
    `);
  }
}
