import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterQualificationsHistoryTableAddTenantIdColumn1707224003769
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'location_qualifications_history',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'location_qualifications_history',
      'tenant_id'
    );
  }
}
