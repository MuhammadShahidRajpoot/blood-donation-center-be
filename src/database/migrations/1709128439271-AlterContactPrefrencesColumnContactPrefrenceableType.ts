import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterContactPrefrencesColumnContactPrefrenceableType1709128439271
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.query(`
        ALTER TABLE public.contact_preferences ALTER COLUMN contact_preferenceable_type TYPE varchar(255) USING contact_preferenceable_type::varchar(255);
      `),
      queryRunner.query(`
        ALTER TABLE public.contact_preferences_history ALTER COLUMN contact_preferenceable_type TYPE varchar(255) USING contact_preferenceable_type::varchar(255);
      `),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.query(`
        ALTER TABLE public.contact_preferences ALTER COLUMN contact_preferenceable_type TYPE public.contact_preferences_contact_preferenceable_type_enum USING contact_preferenceable_type::text::public.contact_preferences_contact_preferenceable_type_enum;
      `),
      queryRunner.query(`
        ALTER TABLE public.contact_preferences_history ALTER COLUMN contact_preferenceable_type TYPE public.contact_preferences_contact_preferenceable_type_enum USING contact_preferenceable_type::text::public.contact_preferences_contact_preferenceable_type_enum;
      `),
    ]);
  }
}
