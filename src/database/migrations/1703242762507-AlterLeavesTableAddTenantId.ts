import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterLeavesTableAddTenantId1703242762507
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('leaves', 'tenant_id'))) {
      await queryRunner.addColumn(
        'leaves',
        new TableColumn({
          name: 'tenant_id',
          type: 'bigint',
          isNullable: true,
        })
      );

      await queryRunner.createForeignKey(
        'leaves',
        new TableForeignKey({
          name: 'FK_tenant_id',
          columnNames: ['tenant_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'tenant',
          onDelete: 'NO ACTION',
          onUpdate: 'NO ACTION',
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('leaves', 'tenant_id')) {
      await queryRunner.dropForeignKey('leaves', 'FK_tenant_id');
      await queryRunner.dropColumn('leaves', 'tenant_id');
    }
  }
}
