import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class AlterAddColumnUpdateAtDonorsTable1704692215218
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'donors',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        precision: 6,
        default: `('now'::text)::timestamp(6) with time zone`,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('donors', 'updated_at');
  }
}
