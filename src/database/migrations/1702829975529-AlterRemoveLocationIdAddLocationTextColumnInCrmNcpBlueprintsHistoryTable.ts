import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterRemoveLocationIdAddLocationTextColumnInCrmNcpBlueprintsHistoryTable1702829975529
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'crm_ncp_blueprints_history',
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
      'crm_ncp_blueprints_history',
      'location',
      new TableColumn({
        name: 'location_id',
        type: 'int',
        isNullable: false,
      })
    );
  }
}
