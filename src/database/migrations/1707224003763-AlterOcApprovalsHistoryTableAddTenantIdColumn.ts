import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterOcApprovalsHistoryTableAddTenantIdColumn1707224003763
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'oc_approvals_history',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('oc_approvals_history', 'tenant_id');
  }
}
