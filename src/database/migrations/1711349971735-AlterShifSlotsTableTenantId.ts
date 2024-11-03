import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterShifSlotsTableTenantId1711349971735
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'shifts_slots',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'shifts_slots_history',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('shifts_slots', 'tenant_id');
    await queryRunner.dropColumn('shifts_slots_history', 'tenant_id');
  }
}
