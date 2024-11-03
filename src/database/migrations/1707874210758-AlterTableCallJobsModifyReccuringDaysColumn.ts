import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableCallJobsModifyReccuringDaysColumn1707874210758
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE call_jobs ALTER COLUMN recurring_days TYPE varchar(100)'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      'ALTER TABLE call_jobs ALTER COLUMN recurring_days TYPE varchar(20)'
    );
  }
}
