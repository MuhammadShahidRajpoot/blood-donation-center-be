import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterLocationColumnInNCPBlueprints1709546191211
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('crm_ncp_blueprints');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('location') !== -1
    );

    if (foreignKey) {
      await queryRunner.dropForeignKey('crm_ncp_blueprints', foreignKey.name);
    }

    await queryRunner.changeColumn(
      'crm_ncp_blueprints',
      'location',
      new TableColumn({
        name: 'location',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'crm_ncp_blueprints',
      'location',
      new TableColumn({
        name: 'location',
        type: 'bigint',
        isNullable: true,
      })
    );
    await queryRunner.createForeignKey(
      'crm_ncp_blueprints',
      new TableForeignKey({
        columnNames: ['location'],
        referencedColumnNames: ['id'],
        referencedTableName: 'crm_locations',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }
}
