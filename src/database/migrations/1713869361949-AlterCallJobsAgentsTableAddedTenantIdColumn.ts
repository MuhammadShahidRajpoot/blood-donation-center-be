import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterCallJobsAgentsTableAddedTenantIdColumn1713869361949
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM call_jobs_agents;');
    await queryRunner.addColumn(
      'call_jobs_agents',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        isNullable: true,
      })
    );
    await queryRunner.createForeignKey(
      'call_jobs_agents',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenant',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('call_jobs_agents');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('tenant_id') !== -1
    );
    await queryRunner.dropForeignKey('call_jobs_agents', foreignKey);
    await queryRunner.dropColumn('call_jobs_agents', 'tenant_id');
  }
}
