import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

import genericColumns from '../common/generic-columns';

export enum call_job_status_enum {
  SCHEDULED = 'scheduled', // the call job has been assigned to agents but calling has not yet been started
  COMPLETE = 'complete', // the system has attempted to dial each number on all segments for this call job at least one time, has posted a call outcome on all records, and all agents have clicked "FINISH" on this particular call job.
  CANCELLED = 'cancelled', // Cancelled before being in progress either after pending or assigned
  IN_PROGRESS = 'in-progress', // calling for this call job has begun; at least one agent is actively engaged in calling for this call job.
  IN_COMPLETE = 'in-complete', // the call job has been started by one or more agents, but no agent is currently actively engaged in calling for this call job, all records in the call job segment(s) do not have an outcome, and no agent has clicked the "FINISH" CTA (this status will also appear if these conditions apply and the end date has passed).
}

export enum segment_type_enum {
  INCLUDE = 'include',
  EXCLUDE = 'exclude',
}

export class CreateCallJobsTable1706790814733 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'call_jobs',
        columns: [
          ...genericColumns,
          {
            name: 'date',
            type: 'timestamp',
            precision: 6,
            isNullable: false,
          },
          {
            name: 'frequency',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: Object.values(call_job_status_enum),
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'tenant_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'segment_type',
            type: 'enum',
            enum: Object.values(segment_type_enum),
            isNullable: false,
          },
          {
            name: 'is_recurring',
            type: 'boolean',
            default: false,
            isNullable: true,
          },
          {
            name: 'recurring_frequency',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'recurring_days',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'recurring_end_date',
            type: 'timestamp',
            precision: 6,
            isNullable: true,
          },
          {
            name: 'recurring_type',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'is_assigned',
            type: 'boolean',
            default: false,
            isNullable: true,
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      'call_jobs',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'call_jobs',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenant',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('call_jobs', 'FK_tenant_id');

    await queryRunner.dropForeignKey('call_jobs', 'FK_created_by');

    await queryRunner.dropTable('call_jobs');
  }
}
