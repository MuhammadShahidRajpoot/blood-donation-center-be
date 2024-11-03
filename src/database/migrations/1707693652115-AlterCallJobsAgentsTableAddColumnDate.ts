import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterCallJobsAgentsTableAddColumnDate1707693652115
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'call_jobs_agents',
      new TableColumn({
        name: 'date',
        type: 'timestamp',
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE call_jobs_agents DROP COLUMN date;');
  }
}
