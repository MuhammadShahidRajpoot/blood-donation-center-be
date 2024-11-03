import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterCallJobsAgentsTableAddedActualCallsColumn1712057387735
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'call_jobs_agents',
      new TableColumn({
        name: 'actual_calls',
        type: 'bigint',
        isNullable: false,
        default: 0,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('call_jobs_agents', 'actual_calls');
  }
}
