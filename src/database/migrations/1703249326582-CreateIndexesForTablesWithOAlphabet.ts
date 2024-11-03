import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexesForTablesWithOAlphabet1703249326582
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'oc_drives',
      new TableIndex({
        name: 'IDX_OC_DRIVES_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'oc_non_collection_events',
      new TableIndex({
        name: 'IDX_OC_NON_COLLECTION_EVENTS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'oc_non_collection_events',
      new TableIndex({
        name: 'IDX_OC_NON_COLLECTION_EVENTS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'oc_non_collection_events',
      new TableIndex({
        name: 'IDX_OC_NON_COLLECTION_EVENTS_OWNER_ID',
        columnNames: ['owner_id'],
      })
    );

    await queryRunner.createIndex(
      'oc_non_collection_events',
      new TableIndex({
        name: 'IDX_OC_NON_COLLECTION_EVENTS_NON_COLLECTION_PROFILE_ID',
        columnNames: ['non_collection_profile_id'],
      })
    );

    await queryRunner.createIndex(
      'oc_non_collection_events',
      new TableIndex({
        name: 'IDX_OC_NON_COLLECTION_EVENTS_LOCATION_ID',
        columnNames: ['location_id'],
      })
    );

    if (
      await queryRunner.hasColumn(
        'oc_non_collection_events',
        'collection_operation_id'
      )
    )
      await queryRunner.createIndex(
        'oc_non_collection_events',
        new TableIndex({
          name: 'IDX_OC_NON_COLLECTION_EVENTS_COLLECTION_OPERATION_ID',
          columnNames: ['collection_operation_id'],
        })
      );

    await queryRunner.createIndex(
      'oc_non_collection_events',
      new TableIndex({
        name: 'IDX_OC_NON_COLLECTION_EVENTS_STATUS_ID',
        columnNames: ['status_id'],
      })
    );

    await queryRunner.createIndex(
      'oc_non_collection_events',
      new TableIndex({
        name: 'IDX_OC_NON_COLLECTION_EVENTS_EVENT_CATEGORY_ID',
        columnNames: ['event_category_id'],
      })
    );

    await queryRunner.createIndex(
      'oc_non_collection_events',
      new TableIndex({
        name: 'IDX_OC_NON_COLLECTION_EVENTS_EVENT_SUBCATEGORY_ID',
        columnNames: ['event_subcategory_id'],
      })
    );

    await queryRunner.createIndex(
      'operations_status',
      new TableIndex({
        name: 'IDX_OPERATIONS_STATUS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'operations_status',
      new TableIndex({
        name: 'IDX_OPERATIONS_STATUS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'organizational_levels',
      new TableIndex({
        name: 'IDX_ORGANIZATIONAL_LEVELS_PARENT_LEVEL',
        columnNames: ['parent_level'],
      })
    );

    await queryRunner.createIndex(
      'organizational_levels',
      new TableIndex({
        name: 'IDX_ORGANIZATIONAL_LEVELS_TENANT',
        columnNames: ['tenant'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('oc_drives', 'IDX_OC_DRIVES_CREATED_BY');

    await queryRunner.dropIndex(
      'oc_non_collection_events',
      'IDX_OC_NON_COLLECTION_EVENTS_CREATED_BY'
    );

    await queryRunner.dropIndex(
      'oc_non_collection_events',
      'IDX_OC_NON_COLLECTION_EVENTS_TENANT_ID'
    );

    await queryRunner.dropIndex(
      'oc_non_collection_events',
      'IDX_OC_NON_COLLECTION_EVENTS_OWNER_ID'
    );

    await queryRunner.dropIndex(
      'oc_non_collection_events',
      'IDX_OC_NON_COLLECTION_EVENTS_NON_COLLECTION_PROFILE_ID'
    );

    await queryRunner.dropIndex(
      'oc_non_collection_events',
      'IDX_OC_NON_COLLECTION_EVENTS_LOCATION_ID'
    );

    await queryRunner.dropIndex(
      'oc_non_collection_events',
      'IDX_OC_NON_COLLECTION_EVENTS_COLLECTION_OPERATION_ID'
    );

    await queryRunner.dropIndex(
      'oc_non_collection_events',
      'IDX_OC_NON_COLLECTION_EVENTS_STATUS_ID'
    );

    await queryRunner.dropIndex(
      'oc_non_collection_events',
      'IDX_OC_NON_COLLECTION_EVENTS_EVENT_CATEGORY_ID'
    );

    await queryRunner.dropIndex(
      'oc_non_collection_events',
      'IDX_OC_NON_COLLECTION_EVENTS_EVENT_SUBCATEGORY_ID'
    );

    await queryRunner.dropIndex(
      'operations_status',
      'IDX_OPERATIONS_STATUS_TENANT_ID'
    );

    await queryRunner.dropIndex(
      'operations_status',
      'IDX_OPERATIONS_STATUS_CREATED_BY'
    );

    await queryRunner.dropIndex(
      'organizational_levels',
      'IDX_ORGANIZATIONAL_LEVELS_PARENT_LEVEL'
    );

    await queryRunner.dropIndex(
      'organizational_levels',
      'IDX_ORGANIZATIONAL_LEVELS_TENANT'
    );
  }
}
