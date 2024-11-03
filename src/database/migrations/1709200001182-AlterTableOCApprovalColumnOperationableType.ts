import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableOCApprovalColumnOperationableType1709200001182
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.query(`
        ALTER TABLE public.oc_approvals ALTER COLUMN operationable_type TYPE varchar(250) USING operationable_type::varchar(250);
      `),
      queryRunner.query(`
        ALTER TABLE public.oc_approvals_history ALTER COLUMN operationable_type TYPE varchar(250) USING operationable_type::varchar(250);
      `),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await Promise.all([
      queryRunner.query(`
        ALTER TABLE public.oc_approvals ALTER COLUMN operationable_type TYPE varchar(21) USING operationable_type::varchar(21);
      `),
      queryRunner.query(`
        ALTER TABLE public.oc_approvals_history ALTER COLUMN operationable_type TYPE varchar(21) USING operationable_type::varchar(21);
      `),
    ]);
  }
}
