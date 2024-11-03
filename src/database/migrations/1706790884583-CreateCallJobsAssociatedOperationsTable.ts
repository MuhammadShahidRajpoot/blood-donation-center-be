import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

import genericColumns from '../common/generic-columns';

export enum operation_type_enum {
  DRIVES = 'drives', //OC -> Operations -> Drives //Default
  SESSIONS = 'sessions', //OC -> Operations -> Sessions
  NON_COLLECTION_EVENTS = 'non_collection_events', //OC -> Operations -> Non Collection Events
}

export class CreateCallJobsAssociatedOperationsTable1706790884583
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'call_jobs_associated_operations',
        columns: [
          ...genericColumns,
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

    await queryRunner.createForeignKey(
      'call_jobs_associated_operations',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_created_by',
      })
    );

    await queryRunner.createForeignKey(
      'call_jobs_associated_operations',
      new TableForeignKey({
        columnNames: ['call_job_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'call_jobs',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_call_job_id',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'call_jobs_associated_operations',
      'FK_call_job_id'
    );

    await queryRunner.dropForeignKey(
      'call_jobs_associated_operations',
      'FK_created_by'
    );

    await queryRunner.dropTable('call_jobs_associated_operations');
  }
}
