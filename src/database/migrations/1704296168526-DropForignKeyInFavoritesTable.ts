import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class DropForignKeyInFavoritesTable1704296168526
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('favorites', 'FK_organization_level_id');
    await queryRunner.dropColumn('favorites', 'organization_level_id');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'favorites',
      new TableColumn({
        name: 'organization_level_id',
        type: 'bigint',
        isNullable: true,
      })
    );
    await queryRunner.createForeignKey(
      'favorites',
      new TableForeignKey({
        columnNames: ['organization_level_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'organizational_levels',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_organization_level_id',
      })
    );
  }
}
