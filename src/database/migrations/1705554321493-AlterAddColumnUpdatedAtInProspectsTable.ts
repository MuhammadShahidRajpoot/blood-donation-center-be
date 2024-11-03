import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterAddColumnUpdatedAtInProspectsTable1705554321493
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'prospects',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        precision: 6,
        default: `('now'::text)::timestamp(6) with time zone`,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('prospects', 'updated_at');
  }
}
