import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterRemoveCollectionOperationIdFromOCNCETable1702634042198
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'oc_non_collection_events',
      'FK_collection_operation_id'
    );

    await queryRunner.dropColumn(
      'oc_non_collection_events',
      'collection_operation_id'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'oc_non_collection_events',
      new TableColumn({
        name: 'collection_operation_id',
        type: 'bigint',
        isNullable: false,
      })
    );

    await queryRunner.createForeignKey(
      'oc_non_collection_events',
      new TableForeignKey({
        columnNames: ['collection_operation_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'business_units',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
        name: 'FK_collection_operation_id',
      })
    );
  }
}
