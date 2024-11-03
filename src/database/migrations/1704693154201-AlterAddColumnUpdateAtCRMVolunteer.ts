import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class AlterAddColumnUpdateAtCRMVolunteer1704693154201
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'crm_volunteer',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        precision: 6,
        default: `('now'::text)::timestamp(6) with time zone`,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('crm_volunteer', 'updated_at');
  }
}
