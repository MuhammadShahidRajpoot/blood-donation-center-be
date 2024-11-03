import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterRemoveLocationIdAddLocationTextColumnInCrmNcpBlueprintsTable1702719429953
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'crm_ncp_blueprints',
      'location_id',
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
        name: 'location_id',
        type: 'int',
        isNullable: false,
      })
    );
  }
}
