import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterVehicleAssignmentDraftTableTenantId1710835816283
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'vehicles_assignments_drafts',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('vehicles_assignments_drafts', 'tenant_id');
  }
}
