import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexForAccountsandLocationsName1711442862073
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'accounts',
      new TableIndex({
        name: 'IDX_ACCOUNTS_NAME',
        columnNames: ['name'],
      })
    );
    await queryRunner.createIndex(
      'crm_locations',
      new TableIndex({
        name: 'IDX_CRM_LOCATION_NAME',
        columnNames: ['name'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('accounts', 'IDX_ACCOUNTS_NAME');
    await queryRunner.dropIndex('crm_locations', 'IDX_CRM_LOCATION_NAME');
  }
}
