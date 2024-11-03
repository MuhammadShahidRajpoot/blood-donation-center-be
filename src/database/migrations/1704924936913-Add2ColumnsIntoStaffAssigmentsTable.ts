import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class Add2ColumnsIntoStaffAssigmentsTable1704924936913
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'staff_assignments',
      new TableColumn({
        name: 'shift_start_time',
        type: 'timestamp',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'staff_assignments',
      new TableColumn({
        name: 'shift_end_time',
        type: 'timestamp',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'staff_assignments',
      new TableColumn({
        name: 'shift_start_time',
        type: 'timestamp',
        isNullable: true,
      })
    );
    await queryRunner.dropColumn(
      'staff_assignments',
      new TableColumn({
        name: 'shift_end_time',
        type: 'timestamp',
        isNullable: true,
      })
    );
  }
}
