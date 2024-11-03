import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterCallJobContactsTable1712056209639
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'call_job_contacts',
      new TableColumn({
        name: 'max_call_count',
        type: 'bigint',
        default: 0,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('call_job_contacts', 'max_call_count');
  }
}
