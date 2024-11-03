import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterCallJobsAgentsHistoryTableAddedActualCallsColumn1712317756331
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'call_jobs_agents_history',
      new TableColumn({
        name: 'actual_calls',
        type: 'bigint',
        isNullable: true,
        default: 0,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('call_jobs_agents_history', 'actual_calls');
  }
}
