import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
export enum call_jobs_history_status_enum {
  NEW = 'new', // email and SMS CC Defined
  IN_PROGRESS = 'in-progress', // email and SMS CC Defined
  DELIVERED = 'delivered', // email and SMS
  BOUNCED = 'bounced', // email only
  BLOCKED = 'blocked', // email only
  DEFERRED = 'deferred', // email only
  FAILED = 'failed', // email and SMS
  SENT = 'sent', // SMS only
  UNDELIVERED = 'undelivered', // SMS only
  SCHEDULED = 'scheduled',
  COMPLETE = 'complete',
  CANCELLED = 'cancelled',
  IN_COMPLETE = 'in-complete',
  PENDING = 'pending',
  IN_ACTIVE = 'In-active',
}

export class AlterCallJobsHistoryEnumChange1707924052978
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE call_jobs_history DROP COLUMN IF EXISTS frequency;'
    );
    await queryRunner.query(
      'ALTER TABLE call_jobs_history DROP COLUMN IF EXISTS type;'
    );
    await queryRunner.query(
      'ALTER TABLE call_jobs_history DROP COLUMN IF EXISTS segment_type;'
    );
    await queryRunner.query(
      'DROP TYPE IF EXISTS call_jobs_history_segment_type_enum;'
    );
    await queryRunner.query(
      'ALTER TABLE call_jobs_history DROP COLUMN IF EXISTS status;'
    );
    await queryRunner.query(
      'DROP TYPE IF EXISTS call_jobs_history_status_enum;'
    );
    await queryRunner.addColumn(
      'call_jobs_history',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: Object.values(call_jobs_history_status_enum),
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE call_jobs_history DROP COLUMN IF EXISTS status;'
    );
    await queryRunner.query(
      'DROP TYPE IF EXISTS call_jobs_history_status_enum;'
    );
  }
}
