import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddProcedureTypeToFavorites1705336124936
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('favorites', 'FK_procedure_id');
    await queryRunner.dropColumn('favorites', 'procedure_id');

    await queryRunner.addColumn(
      'favorites',
      new TableColumn({
        name: 'procedure_type_id',
        type: 'bigint',
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      'favorites',
      new TableForeignKey({
        columnNames: ['procedure_type_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'procedure_types',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_procedure_type_id',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'favorites',
      new TableColumn({
        name: 'procedure_id',
        type: 'bigint',
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      'favorites',
      new TableForeignKey({
        columnNames: ['procedure_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'procedure',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_procedure_id',
      })
    );

    await queryRunner.dropForeignKey('favorites', 'FK_procedure_type_id');
    await queryRunner.dropColumn('favorites', 'procedure_type_id');
  }
}
