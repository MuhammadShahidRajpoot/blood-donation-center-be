import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexesRegardingAlphabetBTables1703152980748
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // banner_collection_operations table
    await queryRunner.createIndex(
      'banner_collection_operations',
      new TableIndex({
        name: 'IDX_BANNER_COLLECTIONS_OPERATIONS_BANNER_ID',
        columnNames: ['banner_id'],
      })
    );

    await queryRunner.createIndex(
      'banner_collection_operations',
      new TableIndex({
        name: 'IDX_BANNER_COLLECTIONS_OPERATIONS_COLLECTION_OPERATION_ID',
        columnNames: ['collection_operation_id'],
      })
    );

    // banners Table
    await queryRunner.createIndex(
      'banners',
      new TableIndex({
        name: 'IDX_BANNERS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // bbcs_data_syncs Table
    await queryRunner.createIndex(
      'bbcs_data_syncs',
      new TableIndex({
        name: 'IDX_BBCS_DATA_SYNCS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // booking_rules Table
    await queryRunner.createIndex(
      'booking_rules',
      new TableIndex({
        name: 'IDX_BOOKING_RULES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'booking_rules',
      new TableIndex({
        name: 'IDX_BOOKING_RULES_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    // booking_rules_add_field Table
    await queryRunner.createIndex(
      'booking_rules_add_field',
      new TableIndex({
        name: 'IDX_BOOKING_RULES_ADD_FIELD_ADD_FIELD_ID',
        columnNames: ['add_field_id'],
      })
    );

    await queryRunner.createIndex(
      'booking_rules_add_field',
      new TableIndex({
        name: 'IDX_BOOKING_RULES_ADD_FIELD_BOOKING_RULES_ID',
        columnNames: ['booking_rules_id'],
      })
    );

    // business_units Table
    await queryRunner.createIndex(
      'business_units',
      new TableIndex({
        name: 'IDX_BUSINESS_UNITS_ORGANIZATIONAL_LEVEL_ID',
        columnNames: ['organizational_level_id'],
      })
    );

    await queryRunner.createIndex(
      'business_units',
      new TableIndex({
        name: 'IDX_BUSINESS_UNITS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'business_units',
      new TableIndex({
        name: 'IDX_BUSINESS_UNITS_PARENT_LEVEL',
        columnNames: ['parent_level'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // banner_collection_operations Table
    await queryRunner.dropIndex(
      'banner_collection_operations',
      'IDX_BANNER_COLLECTIONS_OPERATIONS_BANNER_ID'
    );

    await queryRunner.dropIndex(
      'banner_collection_operations',
      'IDX_BANNER_COLLECTIONS_OPERATIONS_COLLECTION_OPERATION_ID'
    );

    // banners Table
    await queryRunner.dropIndex('banners', 'IDX_BANNERS_TENANT_ID');

    // bbcs_data_syncs Table
    await queryRunner.dropIndex(
      'bbcs_data_syncs',
      'IDX_BBCS_DATA_SYNCS_TENANT_ID'
    );

    // booking_rules Table
    await queryRunner.dropIndex('booking_rules', 'IDX_BOOKING_RULES_TENANT_ID');
    await queryRunner.dropIndex(
      'booking_rules',
      'IDX_BOOKING_RULES_CREATED_BY'
    );

    // booking_rules_add_field Table
    await queryRunner.dropIndex(
      'booking_rules_add_field',
      'IDX_BOOKING_RULES_ADD_FIELD_ADD_FIELD_ID'
    );

    await queryRunner.dropIndex(
      'booking_rules_add_field',
      'IDX_BOOKING_RULES_ADD_FIELD_BOOKING_RULES_ID'
    );

    // business_units Table
    await queryRunner.dropIndex(
      'business_units',
      'IDX_BUSINESS_UNITS_ORGANIZATIONAL_LEVEL_ID'
    );

    await queryRunner.dropIndex(
      'business_units',
      'IDX_BUSINESS_UNITS_TENANT_ID'
    );

    await queryRunner.dropIndex(
      'business_units',
      'IDX_BUSINESS_UNITS_PARENT_LEVEL'
    );
  }
}
