import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterShiftsTableAddShiftNumber1707924321791
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'shifts',
      new TableColumn({
        name: 'shift_number',
        type: 'int',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'shifts',
      new TableColumn({
        name: 'shift_number',
        type: 'int',
        isNullable: true,
      })
    );
  }
}
