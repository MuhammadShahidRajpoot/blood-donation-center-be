import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterDeviceAssignmentTableTenantId1710836527113
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'devices_assignments',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('devices_assignments', 'tenant_id');
  }
}
