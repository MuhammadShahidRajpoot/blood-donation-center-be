import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
export enum CallJobStatusEnum {
  ASSIGNED = 'assigned',
  COMPLETE = 'complete',
  CANCELLED = 'cancelled',
  IN_PROGRESS = 'in-progress',
  PENDING = 'pending',
  INACTIVE = 'inactive',
  SCHEDULED = 'scheduled',
  IN_COMPLETE = 'in-complete',
}

export class AlterCallJobStatusEnum1710424559871 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE call_jobs DROP COLUMN IF EXISTS status;'
    );
    await queryRunner.query(
      'DROP TYPE IF EXISTS call_jobs_status_enum CASCADE;'
    );
    await queryRunner.addColumn(
      'call_jobs',
      new TableColumn({
        name: 'status',
        type: 'enum',
        enum: Object.values(CallJobStatusEnum),
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE call_jobs DROP COLUMN IF EXISTS status;'
    );
  }
}
