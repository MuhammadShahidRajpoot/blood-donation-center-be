import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterDeviceAssignmentDraftTableTenantId1710836062009
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'devices_assignments_drafts',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('devices_assignments_drafts', 'tenant_id');
  }
}
