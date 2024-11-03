import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexesForTablesWithRAlphabet1703255593859
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Indexes for ResourceSharings table
    await queryRunner.createIndex(
      'resource_sharings',
      new TableIndex({
        name: 'IDX_RESOURCE_SHARINGS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'resource_sharings',
      new TableIndex({
        name: 'IDX_RESOURCE_SHARINGS_FROM_COLLECTION_OPERATION_ID',
        columnNames: ['from_collection_operation_id'],
      })
    );

    await queryRunner.createIndex(
      'resource_sharings',
      new TableIndex({
        name: 'IDX_RESOURCE_SHARINGS_TO_COLLECTION_OPERATION_ID',
        columnNames: ['to_collection_operation_id'],
      })
    );

    // Indexes for ResourceSharingsFulfillment table
    await queryRunner.createIndex(
      'resource_sharings_fulfillment',
      new TableIndex({
        name: 'IDX_RESOURCE_SHARINGS_FULFILLMENT_RESOURCE_SHARE_ID',
        columnNames: ['resource_share_id'],
      })
    );

    await queryRunner.createIndex(
      'resource_sharings_fulfillment',
      new TableIndex({
        name: 'IDX_RESOURCE_SHARINGS_FULFILLMENT_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    // Indexes for RolePermission table
    await queryRunner.createIndex(
      'role_permission',
      new TableIndex({
        name: 'IDX_ROLE_PERMISSION_ROLE_ID',
        columnNames: ['role_id'],
      })
    );

    await queryRunner.createIndex(
      'role_permission',
      new TableIndex({
        name: 'IDX_ROLE_PERMISSION_PERMISSION_ID',
        columnNames: ['permission_id'],
      })
    );

    await queryRunner.createIndex(
      'role_permission',
      new TableIndex({
        name: 'IDX_ROLE_PERMISSION_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    // Indexes for Roles table
    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'IDX_ROLES_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'roles',
      new TableIndex({
        name: 'IDX_ROLES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Index for RoomSize table
    await queryRunner.createIndex(
      'room_size',
      new TableIndex({
        name: 'IDX_ROOM_SIZE_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes for ResourceSharings table
    await queryRunner.dropIndex(
      'resource_sharings',
      'IDX_RESOURCE_SHARINGS_TENANT_ID'
    );
    await queryRunner.dropIndex(
      'resource_sharings',
      'IDX_RESOURCE_SHARINGS_FROM_COLLECTION_OPERATION_ID'
    );
    await queryRunner.dropIndex(
      'resource_sharings',
      'IDX_RESOURCE_SHARINGS_TO_COLLECTION_OPERATION_ID'
    );

    // Drop indexes for ResourceSharingsFulfillment table
    await queryRunner.dropIndex(
      'resource_sharings_fulfillment',
      'IDX_RESOURCE_SHARINGS_FULFILLMENT_RESOURCE_SHARE_ID'
    );
    await queryRunner.dropIndex(
      'resource_sharings_fulfillment',
      'IDX_RESOURCE_SHARINGS_FULFILLMENT_CREATED_BY'
    );

    // Drop indexes for RolePermission table
    await queryRunner.dropIndex(
      'role_permission',
      'IDX_ROLE_PERMISSION_ROLE_ID'
    );
    await queryRunner.dropIndex(
      'role_permission',
      'IDX_ROLE_PERMISSION_PERMISSION_ID'
    );
    await queryRunner.dropIndex(
      'role_permission',
      'IDX_ROLE_PERMISSION_CREATED_BY'
    );

    // Drop indexes for Roles table
    await queryRunner.dropIndex('roles', 'IDX_ROLES_CREATED_BY');
    await queryRunner.dropIndex('roles', 'IDX_ROLES_TENANT_ID');

    // Drop index for RoomSize table
    await queryRunner.dropIndex('room_size', 'IDX_ROOM_SIZE_TENANT_ID');
  }
}
