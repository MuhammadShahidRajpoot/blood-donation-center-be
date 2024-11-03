import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateNCECollectionOperationTable1702634042195
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'nce_collection_operations',
        columns: [
          {
            name: 'nce_id',
            type: 'bigint',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'business_unit_id',
            type: 'bigint',
            isPrimary: true,
            isNullable: false,
          },
        ],
      })
    );

    await queryRunner.createForeignKey(
      'nce_collection_operations',
      new TableForeignKey({
        columnNames: ['nce_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'oc_non_collection_events',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'FK_nce_id',
      })
    );

    await queryRunner.createForeignKey(
      'nce_collection_operations',
      new TableForeignKey({
        columnNames: ['business_unit_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'business_units',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        name: 'FK_business_unit_id',
      })
    );

    await queryRunner.createIndex(
      'nce_collection_operations',
      new TableIndex({
        columnNames: ['nce_id'],
      })
    );

    await queryRunner.createIndex(
      'nce_collection_operations',
      new TableIndex({
        columnNames: ['business_unit_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('nce_collection_operations', 'FK_nce_id');
    await queryRunner.dropForeignKey(
      'nce_collection_operations',
      'FK_business_unit_id'
    );

    await queryRunner.dropTable('nce_collection_operations');
  }
}
