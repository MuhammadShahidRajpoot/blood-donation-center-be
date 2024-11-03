import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterVehicleAssignmentTableTenantId1710836515188
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'vehicles_assignments',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('vehicles_assignments', 'tenant_id');
  }
}
