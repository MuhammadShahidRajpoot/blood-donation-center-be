import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import GenericHistoryColumns from '../common/generic-history-columns';

export enum segment_type_enum {
  INCLUDE = 'include',
  EXCLUDE = 'exclude',
}

export class CreateCallJobsCallSegmentsHistoryTable1707694922516
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'call_jobs_call_segments_history',
        columns: [
          ...GenericHistoryColumns,
          {
            name: 'call_job_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'segment_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'segment_type',
            type: 'enum',
            enum: Object.values(segment_type_enum),
            isNullable: false,
          },
        ],
      }),
      true
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('call_jobs_call_segments_history');
  }
}
