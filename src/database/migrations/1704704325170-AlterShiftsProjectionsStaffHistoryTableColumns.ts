import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterShiftsProjectionsStaffHistoryTableColumns1704704325170
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'shifts_projections_staff_history',
      new TableColumn({
        name: 'id',
        type: 'bigint',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'shifts_projections_staff_history',
      new TableColumn({
        name: 'id',
        type: 'bigint',
      })
    );
  }
}
