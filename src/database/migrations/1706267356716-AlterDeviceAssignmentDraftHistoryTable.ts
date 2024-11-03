import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterDeviceAssignmentDraftHistoryTable1706267356716
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'devices_assignments_drafts_history',
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
      'devices_assignments_drafts_history',
      'device_assignment_id',
      new TableColumn({
        name: 'device_assignment_id',
        type: 'bigint',
        isNullable: false,
      })
    );
  }
}
