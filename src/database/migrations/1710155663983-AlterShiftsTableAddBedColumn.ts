import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterShiftsTableAddBedColumn1710155663983
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'shifts_slots',
      new TableColumn({
        name: 'bed',
        type: 'int',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'shifts_slots_history',
      new TableColumn({
        name: 'bed',
        type: 'int',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'shifts_slots',
      new TableColumn({
        name: 'bed',
        type: 'int',
        isNullable: true,
      })
    );
    await queryRunner.dropColumn(
      'shifts_slots_history',
      new TableColumn({
        name: 'bed',
        type: 'int',
        isNullable: true,
      })
    );
  }
}
