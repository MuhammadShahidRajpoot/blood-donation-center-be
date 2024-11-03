import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterStaffAssignmentsTableAddArchive1706009795317
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'staff_assignments_drafts',
      new TableColumn({
        name: 'is_archived',
        type: 'boolean',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'staff_assignments_drafts',
      new TableColumn({
        name: 'shift_start_time',
        type: 'timestamp',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'staff_assignments_drafts',
      new TableColumn({
        name: 'shift_end_time',
        type: 'timestamp',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'staff_assignments_drafts',
      new TableColumn({
        name: 'is_archived',
        type: 'boolean',
        isNullable: true,
      })
    );

    await queryRunner.dropColumn(
      'staff_assignments_drafts',
      new TableColumn({
        name: 'shift_start_time',
        type: 'timestamp',
        isNullable: true,
      })
    );
    await queryRunner.dropColumn(
      'staff_assignments_drafts',
      new TableColumn({
        name: 'shift_end_time',
        type: 'timestamp',
        isNullable: true,
      })
    );
  }
}
