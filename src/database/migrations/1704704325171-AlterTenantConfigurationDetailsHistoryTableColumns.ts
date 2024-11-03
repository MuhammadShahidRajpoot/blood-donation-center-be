import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterTenantConfigurationDetailsTableColumns1704704325171
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'tenant_configuration_detail_history',
      'end_point_url',
      new TableColumn({
        name: 'end_point_url',
        type: 'text', // Change the type as needed
        isNullable: true,
      })
    );

    await queryRunner.changeColumn(
      'tenant_configuration_detail_history',
      'secret_key',
      new TableColumn({
        name: 'secret_key',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );

    await queryRunner.changeColumn(
      'tenant_configuration_detail_history',
      'secret_value',
      new TableColumn({
        name: 'secret_value',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'tenant_configuration_detail_history',
      'end_point_url',
      new TableColumn({
        name: 'end_point_url',
        type: 'text', // Change the type as needed
        isNullable: false,
      })
    );

    await queryRunner.changeColumn(
      'tenant_configuration_detail_history',
      'secret_key',
      new TableColumn({
        name: 'secret_key',
        type: 'varchar',
        length: '255',
        isNullable: false,
      })
    );

    await queryRunner.changeColumn(
      'tenant_configuration_detail_history',
      'secret_value',
      new TableColumn({
        name: 'secret_value',
        type: 'varchar',
        length: '255',
        isNullable: false,
      })
    );
  }
}
