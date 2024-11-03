import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import GenericHistoryColumns from '../common/generic-history-columns';

export class CreateCallJobsCallFlowsHistoryTable1707224003757
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'call_jobs_call_flows_history',
        columns: [
          ...GenericHistoryColumns,
          {
            name: 'call_job_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'call_flow_id',
            type: 'bigint',
            isNullable: false,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('call_jobs_call_flows_history');
  }
}
