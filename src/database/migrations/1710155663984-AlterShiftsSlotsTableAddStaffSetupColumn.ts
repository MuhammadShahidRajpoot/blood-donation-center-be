import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterShiftsSlotsTableAddStaffSetupColumn1710155663983
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'shifts_slots',
      new TableColumn({
        name: 'staff_setup_id',
        type: 'bigint',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'shifts_slots_history',
      new TableColumn({
        name: 'staff_setup_id',
        type: 'bigint',
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      'shifts_slots',
      new TableForeignKey({
        columnNames: ['staff_setup_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'staff_setup',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('shifts_slots', 'staff_setup_id');
    await queryRunner.dropColumn(
      'shifts_slots',
      new TableColumn({
        name: 'staff_setup_id',
        type: 'bigint',
        isNullable: true,
      })
    );
    await queryRunner.dropColumn(
      'shifts_slots_history',
      new TableColumn({
        name: 'staff_setup_id',
        type: 'bigint',
        isNullable: true,
      })
    );
  }
}
