import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import GenericHistoryColumns from '../common/generic-history-columns';

export enum operation_type_enum {
  DRIVES = 'drives', //OC -> Operations -> Drives //Default
  SESSIONS = 'sessions', //OC -> Operations -> Sessions
  NON_COLLECTION_EVENTS = 'non_collection_events', //OC -> Operations -> Non Collection Events
}

export class CreateCallJobsAssociatedOperationsHistoryTable1706790866635
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'call_jobs_associated_operations_history',
        columns: [
          ...GenericHistoryColumns,
          {
            name: 'call_job_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'operationable_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'operationable_type',
            type: 'enum',
            enum: Object.values(operation_type_enum),
            isNullable: false,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('call_jobs_associated_operations_history');
  }
}
