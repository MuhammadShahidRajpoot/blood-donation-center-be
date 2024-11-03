import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableCallJobsAssociatedOperationsColumnOperationableType1709033359898
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.query(`
        ALTER TABLE public.call_jobs_associated_operations ALTER COLUMN operationable_type TYPE varchar(255) USING operationable_type::varchar(255);
      `),
      queryRunner.query(`
        ALTER TABLE public.call_jobs_associated_operations_history ALTER COLUMN operationable_type TYPE varchar(255) USING operationable_type::varchar(255);
      `),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.query(`
        ALTER TABLE public.call_jobs_associated_operations ALTER COLUMN operationable_type TYPE public.call_jobs_associated_operations_operationable_type_enum USING operationable_type::text::public.call_jobs_associated_operations_operationable_type_enum;
      `),
      queryRunner.query(`
        ALTER TABLE public.call_jobs_associated_operations_history ALTER COLUMN operationable_type TYPE public.call_jobs_associated_operations_operationable_type_enum USING operationable_type::text::public.call_jobs_associated_operations_operationable_type_enum;
      `),
    ]);
  }
}
