import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBusinessUnitsMetaDataToFavorites1705397243855
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'favorites',
      new TableColumn({
        name: 'bu_metadata',
        type: 'text',
        isNullable: true,
      })
    );

    await queryRunner.addColumn(
      'favorites_history',
      new TableColumn({
        name: 'bu_metadata',
        type: 'text',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('favorites', 'bu_metadata');

    await queryRunner.dropColumn('favorites_history', 'bu_metadata');
  }
}
