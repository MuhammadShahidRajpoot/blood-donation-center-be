import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class AlterAddColumnUpdateAtStaffTable1704692818778
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'staff',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        precision: 6,
        default: `('now'::text)::timestamp(6) with time zone`,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('staff', 'updated_at');
  }
}
