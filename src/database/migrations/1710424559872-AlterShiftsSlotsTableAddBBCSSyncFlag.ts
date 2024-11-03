import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterShiftsSlotsTableAddBBCSSyncFlag1710424559872
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'shifts_slots',
      new TableColumn({
        name: 'is_bbcs_sync',
        type: 'boolean',
        isNullable: false,
        default: false,
      })
    );
    await queryRunner.addColumn(
      'shifts_slots_history',
      new TableColumn({
        name: 'is_bbcs_sync',
        type: 'boolean',
        isNullable: false,
        default: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'shifts_slots',
      new TableColumn({
        name: 'is_bbcs_sync',
        type: 'boolean',
        isNullable: false,
        default: false,
      })
    );
    await queryRunner.dropColumn(
      'shifts_slots_history',
      new TableColumn({
        name: 'is_bbcs_sync',
        type: 'boolean',
        isNullable: false,
        default: false,
      })
    );
  }
}
