import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableCallScriptColumnScriptType1709035663973
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.query(`
        ALTER TABLE public.call_scripts ALTER COLUMN script_type TYPE varchar(255) USING script_type::varchar(255);
      `),
      queryRunner.query(`
        ALTER TABLE public.call_scripts_history ALTER COLUMN script_type TYPE varchar(255) USING script_type::varchar(255);
      `),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.query(`
        ALTER TABLE public.call_scripts ALTER COLUMN script_type TYPE public.call_scripts_script_type_enum USING script_type::text::public.call_scripts_script_type_enum;
      `),
      queryRunner.query(`
        ALTER TABLE public.call_scripts_history ALTER COLUMN script_type TYPE public.call_scripts_script_type_enum USING script_type::text::public.call_scripts_script_type_enum;
      `),
    ]);
  }
}
