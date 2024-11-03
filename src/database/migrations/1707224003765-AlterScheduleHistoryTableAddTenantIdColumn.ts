import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterScheduleHistoryTableAddTenantIdColumn1707224003765
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'schedule_history',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('schedule_history', 'tenant_id');
  }
}
