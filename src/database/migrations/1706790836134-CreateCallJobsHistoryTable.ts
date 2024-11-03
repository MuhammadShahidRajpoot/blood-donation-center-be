import { MigrationInterface, QueryRunner, Table } from 'typeorm';

import GenericHistoryColumns from '../common/generic-history-columns';

export enum call_job_status_enum {
  NEW = 'new', // email and SMS CC Defined
  IN_PROGRESS = 'in_progress', // email and SMS CC Defined
  DELIVERED = 'delivered', // email and SMS
  BOUNCED = 'bounced', // email only
  BLOCKED = 'blocked', // email only
  DEFERRED = 'deferred', // email only
  FAILED = 'failed', // email and SMS
  SENT = 'sent', // SMS only
  UNDELIVERED = 'undelivered', // SMS only
}

export enum segment_type_enum {
  NEW = 'new', // email and SMS CC Defined
  IN_PROGRESS = 'in_progress', // email and SMS CC Defined
  DELIVERED = 'delivered', // email and SMS
  BOUNCED = 'bounced', // email only
  BLOCKED = 'blocked', // email only
  DEFERRED = 'deferred', // email only
  FAILED = 'failed', // email and SMS
  SENT = 'sent', // SMS only
  UNDELIVERED = 'undelivered', // SMS only
}

export class CreateCallJobsHistoryTable1706790836134
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'call_jobs_history',
        columns: [
          ...GenericHistoryColumns,
          {
            name: 'date',
            type: 'timestamp',
            precision: 6,
            default: `('now'::text)::timestamp(6) with time zone`,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('call_jobs_history');
  }
}
