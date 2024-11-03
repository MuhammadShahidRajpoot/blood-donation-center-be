import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterStaffAssignmentDraftHistoryTable1706268170560
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'staff_assignments_drafts_history',
      'staff_assignment_id',
      new TableColumn({
        name: 'staff_assignment_id',
        type: 'bigint',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'staff_assignments_drafts_history',
      'staff_assignment_id',
      new TableColumn({
        name: 'staff_assignment_id',
        type: 'bigint',
        isNullable: false,
      })
    );
  }
}
