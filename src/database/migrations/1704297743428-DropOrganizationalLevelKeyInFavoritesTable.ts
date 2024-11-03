import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class DropOrganizationalLevelKeyInFavoritesTable1704297743428
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('favorites_history', 'organization_level_id');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'favorites_history',
      new TableColumn({
        name: 'organization_level_id',
        type: 'bigint',
        isNullable: true,
      })
    );
  }
}
