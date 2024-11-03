import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
export enum CallJobHistoryStatusEnum {
  ASSIGNED = 'assigned',
  COMPLETE = 'complete',
  CANCELLED = 'cancelled',
  IN_PROGRESS = 'in-progress',
  PENDING = 'pending',
  INACTIVE = 'inactive',
  SCHEDULED = 'scheduled',
  IN_COMPLETE = 'in-complete',
}

export class AlterCallJobHistoryEnum1710414709585
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE call_jobs_history DROP COLUMN IF EXISTS status;'
    );
    await queryRunner.query(
      'DROP TYPE IF EXISTS call_jobs_history_status_enum CASCADE;'
    );
    await queryRunner.addColumn(
      'call_jobs_history',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: Object.values(CallJobHistoryStatusEnum),
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE call_jobs_history DROP COLUMN IF EXISTS status;'
    );
  }
}
