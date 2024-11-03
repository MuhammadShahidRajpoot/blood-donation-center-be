import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterCallJobsHistoryDate1708343878171
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE call_jobs_history DROP COLUMN IF EXISTS date;'
    );

    await queryRunner.addColumn(
      'call_jobs_history',
      new TableColumn({
        name: 'start_date',
        type: 'timestamp',
        isNullable: false,
      })
    );

    await queryRunner.addColumn(
      'call_jobs_history',
      new TableColumn({
        name: 'end_date',
        type: 'timestamp',
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('call_jobs_history', 'start_date');
    await queryRunner.dropColumn('call_jobs_history', 'end_date');
  }
}
