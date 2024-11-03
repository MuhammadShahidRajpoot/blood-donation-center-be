import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterStaffAssignmentsTable1706009795316
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'staff_assignments',
      new TableColumn({
        name: 'split_shift',
        type: 'boolean',
        default: false,
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'staff_assignments',
      new TableColumn({
        name: 'split_shift',
        type: 'boolean',
        default: false,
        isNullable: false,
      })
    );
  }
}
