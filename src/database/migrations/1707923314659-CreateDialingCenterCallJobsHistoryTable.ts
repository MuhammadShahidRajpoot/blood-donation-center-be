import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import genericHistoryColumns from '../common/generic-history-columns';

export class CreateDialingCenterCallJobsHistoryTable1707923314659
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'dialing_center_call_jobs_history',
        columns: [
          ...genericHistoryColumns,
          {
            name: 'call_job_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'actual_calls',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'is_start_calling',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('dialing_center_call_jobs_history');
  }
}
