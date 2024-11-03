import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterTableCallJobAgentsHistoryReplaceStaffWithUser1712849491727
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('call_jobs_agents_history', 'staff_id');

    await queryRunner.addColumn(
      'call_jobs_agents_history',
      new TableColumn({
        name: 'user_id',
        type: 'bigint',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('call_jobs_agents_history', 'user_id');

    await queryRunner.addColumn(
      'call_jobs_agents_history',
      new TableColumn({
        name: 'staff_id',
        type: 'bigint',
      })
    );
  }
}
