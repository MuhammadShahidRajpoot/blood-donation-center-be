import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterStaffAssignmentsTableColumnsTotalHours1704704325172
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'UPDATE staff_assignments SET total_hours = 12 WHERE total_hours IS NULL'
    );
    await queryRunner.changeColumn(
      'staff_assignments',
      'total_hours',
      new TableColumn({
        name: 'total_hours',
        type: 'decimal', // Change the type as needed
        default: 12,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'staff_assignments',
      'total_hours',
      new TableColumn({
        name: 'total_hours',
        type: 'integer', // Change the type as needed
        default: 12,
      })
    );
  }
}
