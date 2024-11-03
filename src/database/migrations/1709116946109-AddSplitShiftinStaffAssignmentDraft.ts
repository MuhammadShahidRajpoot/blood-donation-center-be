import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddSplitShiftinStaffAssignmentDraft1709116946109
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'staff_assignments_drafts',
      new TableColumn({
        name: 'split_shift',
        type: 'boolean',
        default: false,
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('staff_assignments_drafts', 'split_shift');
  }
}
