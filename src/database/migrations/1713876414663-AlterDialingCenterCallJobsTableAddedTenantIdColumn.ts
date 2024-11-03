import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterDialingCenterCallJobsTableAddedTenantIdColumn1713876414663
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM dialing_center_call_jobs;');
    await queryRunner.addColumn(
      'dialing_center_call_jobs',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        isNullable: true,
      })
    );
    await queryRunner.createForeignKey(
      'dialing_center_call_jobs',
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
    const table = await queryRunner.getTable('dialing_center_call_jobs');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('tenant_id') !== -1
    );
    await queryRunner.dropForeignKey('dialing_center_call_jobs', foreignKey);
    await queryRunner.dropColumn('dialing_center_call_jobs', 'tenant_id');
  }
}
