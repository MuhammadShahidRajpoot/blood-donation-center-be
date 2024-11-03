import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexesForTablesWithPAlphabet1703251335145
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'performance_rules',
      new TableIndex({
        name: 'IDX_PERFORMANCE_RULES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'IDX_PERMISSIONS_MODULE_ID',
        columnNames: ['module_id'],
      })
    );

    await queryRunner.createIndex(
      'permissions',
      new TableIndex({
        name: 'IDX_PERMISSIONS_APPLICATION_ID',
        columnNames: ['application_id'],
      })
    );

    await queryRunner.createIndex(
      'pick_lists',
      new TableIndex({
        name: 'IDX_PICK_LISTS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'pick_lists',
      new TableIndex({
        name: 'IDX_PICK_LISTS_CUSTOM_FIELD_ID',
        columnNames: ['custom_field_id'],
      })
    );

    await queryRunner.createIndex(
      'pickups',
      new TableIndex({
        name: 'IDX_PICKUPS_PICKABLE_ID',
        columnNames: ['pickable_id'],
      })
    );

    await queryRunner.createIndex(
      'pickups',
      new TableIndex({
        name: 'IDX_PICKUPS_EQUIPMENT_ID',
        columnNames: ['equipment_id'],
      })
    );

    await queryRunner.createIndex(
      'prefixes',
      new TableIndex({
        name: 'IDX_PICKUPS_EQUIPMENT_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'procedure',
      new TableIndex({
        name: 'IDX_PROCEDURE_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'procedure',
      new TableIndex({
        name: 'IDX_PROCEDURE_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'procedures_products',
      new TableIndex({
        name: 'IDX_PROCEDURES_PRODUCTS_PROCEDURES_ID',
        columnNames: ['procedures_id'],
      })
    );

    await queryRunner.createIndex(
      'procedures_products',
      new TableIndex({
        name: 'IDX_PROCEDURES_PRODUCTS_PRODUCT_ID',
        columnNames: ['product_id'],
      })
    );

    await queryRunner.createIndex(
      'procedure_types',
      new TableIndex({
        name: 'IDX_PROCEDURE_TYPES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'procedure_types',
      new TableIndex({
        name: 'IDX_PROCEDURE_TYPES_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_PRODUCTS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_PRODUCTS_UPDATED_BY',
        columnNames: ['updated_by'],
      })
    );

    await queryRunner.createIndex(
      'products',
      new TableIndex({
        name: 'IDX_PRODUCTS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'promotions_collection_operations',
      new TableIndex({
        name: 'IDX_PROMOTIONS_COLLECTION_OPERATIONS_PROMOTION_ID',
        columnNames: ['promotion_id'],
      })
    );

    await queryRunner.createIndex(
      'promotions_collection_operations',
      new TableIndex({
        name: 'IDX_PROMOTIONS_COLLECTION_OPERATIONS_COLLECTION_OPERATION_ID',
        columnNames: ['collection_operation_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'performance_rules',
      'IDX_PERFORMANCE_RULES_TENANT_ID'
    );

    await queryRunner.dropIndex('permissions', 'IDX_PERMISSIONS_MODULE_ID');

    await queryRunner.dropIndex(
      'permissions',
      'IDX_PERMISSIONS_APPLICATION_ID'
    );

    await queryRunner.dropIndex('pick_lists', 'IDX_PICK_LISTS_TENANT_ID');

    await queryRunner.dropIndex('pick_lists', 'IDX_PICK_LISTS_CUSTOM_FIELD_ID');

    await queryRunner.dropIndex('pickups', 'IDX_PICKUPS_PICKABLE_ID');

    await queryRunner.dropIndex('pickups', 'IDX_PICKUPS_EQUIPMENT_ID');

    await queryRunner.dropIndex('prefixes', 'IDX_PICKUPS_EQUIPMENT_CREATED_BY');

    await queryRunner.dropIndex('procedure', 'IDX_PROCEDURE_CREATED_BY');

    await queryRunner.dropIndex('procedure', 'IDX_PROCEDURE_TENANT_ID');

    await queryRunner.dropIndex(
      'procedures_products',
      'IDX_PROCEDURES_PRODUCTS_PROCEDURES_ID'
    );

    await queryRunner.dropIndex(
      'procedures_products',
      'IDX_PROCEDURES_PRODUCTS_PRODUCT_ID'
    );

    await queryRunner.dropIndex(
      'procedure_types',
      'IDX_PROCEDURE_TYPES_TENANT_ID'
    );

    await queryRunner.dropIndex(
      'procedure_types',
      'IDX_PROCEDURE_TYPES_CREATED_BY'
    );

    await queryRunner.dropIndex('products', 'IDX_PRODUCTS_CREATED_BY');

    await queryRunner.dropIndex('products', 'IDX_PRODUCTS_UPDATED_BY');

    await queryRunner.dropIndex('products', 'IDX_PRODUCTS_TENANT_ID');

    await queryRunner.dropIndex(
      'promotions_collection_operations',
      'IDX_PROMOTIONS_COLLECTION_OPERATIONS_PROMOTION_ID'
    );

    await queryRunner.dropIndex(
      'promotions_collection_operations',
      'IDX_PROMOTIONS_COLLECTION_OPERATIONS_COLLECTION_OPERATION_ID'
    );
  }
}
