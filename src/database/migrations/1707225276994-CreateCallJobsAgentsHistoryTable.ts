import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import GenericHistoryColumns from '../common/generic-history-columns';

export class CreateCallJobsAgentsHistoryTable1707225276994
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'call_jobs_agents_history',
        columns: [
          ...GenericHistoryColumns,
          {
            name: 'call_job_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'staff_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'assigned_calls',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'is_calling',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('call_jobs_agents_history');
  }
}
