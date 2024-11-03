import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterLocationColumnOfNCPBlueprints1703853841828
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
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

  public async down(queryRunner: QueryRunner): Promise<void> {
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
    await queryRunner.dropForeignKey('crm_ncp_blueprints', 'FK_location');
  }
}
