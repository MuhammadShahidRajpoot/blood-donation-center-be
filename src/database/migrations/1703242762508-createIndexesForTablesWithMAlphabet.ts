import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class createIndexesForTablesWithLAlphabet1703242762508
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'leaves',
      new TableIndex({
        name: 'IDX_LEAVES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'leaves',
      new TableIndex({
        name: 'IDX_LEAVES_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'leave_types',
      new TableIndex({
        name: 'IDX_LEAVE_TYPES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'linked_drives',
      new TableIndex({
        name: 'IDX_LINKED_DRIVES_CURRENT_DRIVE_ID',
        columnNames: ['current_drive_id'],
      })
    );

    await queryRunner.createIndex(
      'linked_drives',
      new TableIndex({
        name: 'IDX_LINKED_DRIVES_PROSPECTIVE_DRIVE_ID',
        columnNames: ['prospective_drive_id'],
      })
    );

    // await queryRunner.createIndex(
    //   'location_a_lias',
    //   new TableIndex({
    //     name: 'IDX_LOCATION_A_LIAS_CREATED_BY',
    //     columnNames: ['created_by'],
    //   })
    // );

    // await queryRunner.createIndex(
    //   'location_a_lias',
    //   new TableIndex({
    //     name: 'IDX_LOCATION_A_LIAS_TENANT_ID',
    //     columnNames: ['tenant_id'],
    //   })
    // );

    // await queryRunner.createIndex(
    //   'location_attachment_category',
    //   new TableIndex({
    //     name: 'IDX_LOCATION_ATTACHMENT_CATEGORY_CREATED_BY',
    //     columnNames: ['created_by'],
    //   })
    // );

    // await queryRunner.createIndex(
    //   'location_attachment_category',
    //   new TableIndex({
    //     name: 'IDX_LOCATION_ATTACHMENT_CATEGORY_TENANT_ID',
    //     columnNames: ['tenant_id'],
    //   })
    // );

    await queryRunner.createIndex(
      'location_directions',
      new TableIndex({
        name: 'IDX_LOCATION_DIRECTIONS_COLLECTION_OPERATION_ID',
        columnNames: ['collection_operation_id'],
      })
    );

    await queryRunner.createIndex(
      'location_directions',
      new TableIndex({
        name: 'IDX_LOCATION_DIRECTIONS_LOCATION_ID',
        columnNames: ['location_id'],
      })
    );

    await queryRunner.createIndex(
      'location_directions',
      new TableIndex({
        name: 'IDX_LOCATION_DIRECTIONS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'location_directions',
      new TableIndex({
        name: 'IDX_LOCATION_DIRECTIONS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'lock_date_collection_operations',
      new TableIndex({
        name: 'IDX_LOCK_DATA_COLLECTION_OPERATIONS_LOCK_DATE_ID',
        columnNames: ['lock_date_id'],
      })
    );

    await queryRunner.createIndex(
      'lock_date_collection_operations',
      new TableIndex({
        name: 'IDX_LOCK_DATA_COLLECTION_OPERATIONS_COLLECTION_OPERATION_ID',
        columnNames: ['collection_operation_id'],
      })
    );

    await queryRunner.createIndex(
      'lock_dates',
      new TableIndex({
        name: 'IDX_LOCK_DATES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('leaves', 'IDX_LEAVES_TENANT_ID');

    await queryRunner.dropIndex('leaves', 'IDX_LEAVES_CREATED_BY');

    await queryRunner.dropIndex('leave_types', 'IDX_LEAVE_TYPES_TENANT_ID');

    await queryRunner.dropIndex(
      'linked_drives',
      'IDX_LINKED_DRIVES_CURRENT_DRIVE_ID'
    );

    await queryRunner.dropIndex(
      'linked_drives',
      'IDX_LINKED_DRIVES_PROSPECTIVE_DRIVE_ID'
    );

    // await queryRunner.dropIndex(
    //   'location_a_lias',
    //   'IDX_LOCATION_A_LIAS_CREATED_BY'
    // );

    // await queryRunner.dropIndex(
    //   'location_a_lias',
    //   'IDX_LOCATION_A_LIAS_TENANT_ID'
    // );

    // await queryRunner.dropIndex(
    //   'location_attachment_category',
    //   'IDX_LOCATION_ATTACHMENT_CATEGORY_CREATED_BY'
    // );

    // await queryRunner.dropIndex(
    //   'location_attachment_category',
    //   'IDX_LOCATION_ATTACHMENT_CATEGORY_TENANT_ID'
    // );

    await queryRunner.dropIndex(
      'location_directions',
      'IDX_LOCATION_DIRECTIONS_COLLECTION_OPERATION_ID'
    );

    await queryRunner.dropIndex(
      'location_directions',
      'IDX_LOCATION_DIRECTIONS_LOCATION_ID'
    );

    await queryRunner.dropIndex(
      'location_directions',
      'IDX_LOCATION_DIRECTIONS_TENANT_ID'
    );

    await queryRunner.dropIndex(
      'location_directions',
      'IDX_LOCATION_DIRECTIONS_CREATED_BY'
    );

    await queryRunner.dropIndex(
      'lock_date_collection_operations',
      'IDX_LOCK_DATA_COLLECTION_OPERATIONS_LOCK_DATE_ID'
    );

    await queryRunner.dropIndex(
      'lock_date_collection_operations',
      'IDX_LOCK_DATA_COLLECTION_OPERATIONS_COLLECTION_OPERATION_ID'
    );

    await queryRunner.dropIndex('lock_dates', 'IDX_LOCK_DATES_TENANT_ID');
  }
}
