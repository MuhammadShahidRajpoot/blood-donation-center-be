import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterDonorAppointmentsHistoryTableAddTenantIdColumn1707224003759
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'donors_appointments_history',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('donors_appointments_history', 'tenant_id');
  }
}
