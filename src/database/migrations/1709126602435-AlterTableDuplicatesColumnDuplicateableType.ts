import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableDuplicatesColumnDuplicateableType1709126602435
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.query(`
          ALTER TABLE public.duplicates ALTER COLUMN duplicatable_type TYPE varchar(255) USING duplicatable_type::varchar(255);
        `),
      queryRunner.query(`
          ALTER TABLE public.duplicates_history ALTER COLUMN duplicatable_type TYPE varchar(255) USING duplicatable_type::varchar(255);
        `),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.query(`
          ALTER TABLE public.duplicates ALTER COLUMN duplicatable_type TYPE public.duplicates_duplicatable_type_enum USING duplicatable_type::text::public.duplicates_duplicatable_type_enum;
        `),
      queryRunner.query(`
          ALTER TABLE public.duplicates_history ALTER COLUMN duplicatable_type TYPE public.duplicates_duplicatable_type_enum USING duplicatable_type::text::public.duplicates_duplicatable_type_enum;
        `),
    ]);
  }
}
