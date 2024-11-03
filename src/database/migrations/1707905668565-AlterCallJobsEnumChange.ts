import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';
export enum CallJobStatusEnum {
  SCHEDULED = 'scheduled',
  COMPLETE = 'complete',
  CANCELLED = 'cancelled',
  IN_PROGRESS = 'in-progress',
  IN_COMPLETE = 'in-complete',
  PENDING = 'pending',
  IN_ACTIVE = 'In-active',
}

export class AlterCallJobsEnumChange1707905668565
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE call_jobs DROP COLUMN IF EXISTS status;'
    );
    await queryRunner.query('DROP TYPE IF EXISTS call_jobs_status_enum;');
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
