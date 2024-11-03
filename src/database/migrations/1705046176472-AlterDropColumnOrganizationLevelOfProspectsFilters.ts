import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterDropColumnOrganizationLevelOfProspectsFilters1705046176472
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'prospects_filters',
      'organizational_level_id'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'prospects_filters',
      new TableColumn({
        name: 'organizational_level_id',
        type: 'int',
        isNullable: false,
      })
    );
  }
}
