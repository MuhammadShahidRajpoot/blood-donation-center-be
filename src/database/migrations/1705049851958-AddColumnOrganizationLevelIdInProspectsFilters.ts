import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnOrganizationLevelIdInProspectsFilters1705049851958
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'prospects_filters',
      new TableColumn({
        name: 'organizational_level_id',
        type: 'int',
        isArray: true,
        isNullable: false,
        default: 'ARRAY[]::int[]',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'prospects_filters',
      'organizational_level_id'
    );
  }
}
