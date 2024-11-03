import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexesForTablesWithNAlphabet1703247753999
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ncp_collection_operations
    await queryRunner.createIndex(
      'ncp_collection_operations',
      new TableIndex({
        name: 'IDX_NCP_COLLECTION_OPERATIONS_NCP_ID',
        columnNames: ['ncp_id'],
      })
    );

    await queryRunner.createIndex(
      'ncp_collection_operations',
      new TableIndex({
        name: 'IDX_NCP_COLLECTION_OPERATIONS_BUSINESS_UNIT_ID',
        columnNames: ['business_unit_id'],
      })
    );

    await queryRunner.createIndex(
      'notes',
      new TableIndex({
        name: 'IDX_NOTES_CATEGORY_ID',
        columnNames: ['category_id'],
      })
    );

    await queryRunner.createIndex(
      'notes',
      new TableIndex({
        name: 'IDX_NOTES_SUB_CATEGORY_ID',
        columnNames: ['sub_category_id'],
      })
    );

    await queryRunner.createIndex(
      'notes',
      new TableIndex({
        name: 'IDX_NOTES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'ncp_collection_operations',
      'IDX_NCP_COLLECTION_OPERATIONS_NCP_ID'
    );

    await queryRunner.dropIndex(
      'ncp_collection_operations',
      'IDX_NCP_COLLECTION_OPERATIONS_BUSINESS_UNIT_ID'
    );

    await queryRunner.dropIndex('notes', 'IDX_NOTES_CATEGORY_ID');

    await queryRunner.dropIndex('notes', 'IDX_NOTES_SUB_CATEGORY_ID');

    await queryRunner.dropIndex('notes', 'IDX_NOTES_TENANT_ID');
  }
}
