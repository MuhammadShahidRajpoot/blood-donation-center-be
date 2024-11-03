import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterDeviceAssignmentDraftTable1706267076147
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'devices_assignments_drafts',
      'device_assignment_id',
      new TableColumn({
        name: 'device_assignment_id',
        type: 'bigint',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'devices_assignments_drafts',
      'device_assignment_id',
      new TableColumn({
        name: 'device_assignment_id',
        type: 'bigint',
        isNullable: false,
      })
    );
  }
}
