import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterShiftsProjectionsStaffTableColumns1704704325169
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'shifts_projections_staff',
      new TableColumn({
        name: 'id',
        type: 'bigint',
        isNullable: true,
      })
    );
    await queryRunner.createPrimaryKey(
      'shifts_projections_staff',
      ['shift_id', 'procedure_type_id', 'staff_setup_id'],
      'shifts_projections_staff_pk'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropPrimaryKey(
      'shifts_projections_staff',
      'shifts_projections_staff_pk'
    );
    await queryRunner.addColumn(
      'shifts_projections_staff',
      new TableColumn({
        name: 'id',
        type: 'bigint',
        isPrimary: true,
        isGenerated: true,
        generationStrategy: 'increment',
      })
    );
  }
}
