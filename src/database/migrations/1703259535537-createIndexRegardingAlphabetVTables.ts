import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexRegardingAlphabetVTables1703259535537
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // VEHICLE
    await queryRunner.createIndex(
      'vehicle',
      new TableIndex({
        name: 'IDX_VEHICLE_VEHICLE_TYPE_ID',
        columnNames: ['vehicle_type_id'],
      })
    );
    await queryRunner.createIndex(
      'vehicle',
      new TableIndex({
        name: 'IDX_VEHICLE_REPLACE_VEHICLE_ID',
        columnNames: ['replace_vehicle_id'],
      })
    );
    await queryRunner.createIndex(
      'vehicle',
      new TableIndex({
        name: 'IDX_VEHICLE_COLLECTION_OPERATION',
        columnNames: ['collection_operation'],
      })
    );
    await queryRunner.createIndex(
      'vehicle',
      new TableIndex({
        name: 'IDX_VEHICLE_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'vehicle',
      new TableIndex({
        name: 'IDX_VEHICLE_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // VEHICLE
    // VEHICLE CERTIFICATION
    await queryRunner.createIndex(
      'vehicle_certification',
      new TableIndex({
        name: 'IDX_VEHICLE_CERTIFICATION_VEHICLE_ID',
        columnNames: ['vehicle_id'],
      })
    );
    await queryRunner.createIndex(
      'vehicle_certification',
      new TableIndex({
        name: 'IDX_VEHICLE_CERTIFICATION_CERTIFICATION_ID',
        columnNames: ['certification_id'],
      })
    );
    await queryRunner.createIndex(
      'vehicle_certification',
      new TableIndex({
        name: 'IDX_VEHICLE_CERTIFICATION_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'vehicle_certification',
      new TableIndex({
        name: 'IDX_VEHICLE_CERTIFICATION_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    // VEHICLE CERTIFICATION
    // VEHICLE MAINTENANCE
    await queryRunner.createIndex(
      'vehicle_maintenance',
      new TableIndex({
        name: 'IDX_VEHICLE_MAINTENANCE_VEHICLE_ID',
        columnNames: ['vehicle_id'],
      })
    );
    await queryRunner.createIndex(
      'vehicle_maintenance',
      new TableIndex({
        name: 'IDX_VEHICLE_MAINTENANCE_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'vehicle_maintenance',
      new TableIndex({
        name: 'IDX_VEHICLE_MAINTENANCE_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    // VEHICLE MAINTENANCE
    // VEHICLE SHARE
    await queryRunner.createIndex(
      'vehicle_share',
      new TableIndex({
        name: 'IDX_VEHICLE_SHARE_VEHICLE_ID',
        columnNames: ['vehicle_id'],
      })
    );
    await queryRunner.createIndex(
      'vehicle_share',
      new TableIndex({
        name: 'IDX_VEHICLE_SHARE_FROM',
        columnNames: ['from'],
      })
    );
    await queryRunner.createIndex(
      'vehicle_share',
      new TableIndex({
        name: 'IDX_VEHICLE_SHARE_TO',
        columnNames: ['to'],
      })
    );
    await queryRunner.createIndex(
      'vehicle_share',
      new TableIndex({
        name: 'IDX_VEHICLE_SHARE_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'vehicle_share',
      new TableIndex({
        name: 'IDX_VEHICLE_SHARE_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // VEHICLE SHARE
    // VEHICLE TYPE
    await queryRunner.createIndex(
      'vehicle_type',
      new TableIndex({
        name: 'IDX_VEHICLE_TYPE_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'vehicle_type',
      new TableIndex({
        name: 'IDX_VEHICLE_TYPE_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // VEHICLE TYPE
    // VOLUNTEERS ACTIVITIES
    await queryRunner.createIndex(
      'volunteers_activities',
      new TableIndex({
        name: 'IDX_VOLUNTEERS_ACTIVITIES_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // VOLUNTEERS ACTIVITIES
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // VEHICLE
    await queryRunner.dropIndex('vehicle', 'IDX_VEHICLE_VEHICLE_TYPE_ID');
    await queryRunner.dropIndex('vehicle', 'IDX_VEHICLE_REPLACE_VEHICLE_ID');
    await queryRunner.dropIndex('vehicle', 'IDX_VEHICLE_COLLECTION_OPERATION');
    await queryRunner.dropIndex('vehicle', 'IDX_VEHICLE_TENANT_ID');
    await queryRunner.dropIndex('vehicle', 'IDX_VEHICLE_CREATED_BY');
    // VEHICLE
    // VEHICLE CERTIFICATION
    await queryRunner.dropIndex(
      'vehicle_certification',
      'IDX_VEHICLE_CERTIFICATION_VEHICLE_ID'
    );
    await queryRunner.dropIndex(
      'vehicle_certification',
      'IDX_VEHICLE_CERTIFICATION_CERTIFICATION_ID'
    );
    await queryRunner.dropIndex(
      'vehicle_certification',
      'IDX_VEHICLE_CERTIFICATION_CREATED_BY'
    );
    await queryRunner.dropIndex(
      'vehicle_certification',
      'IDX_VEHICLE_CERTIFICATION_TENANT_ID'
    );
    // VEHICLE CERTIFICATION
    // VEHICLE MAINTENANCE
    await queryRunner.dropIndex(
      'vehicle_maintenance',
      'IDX_VEHICLE_MAINTENANCE_VEHICLE_ID'
    );
    await queryRunner.dropIndex(
      'vehicle_maintenance',
      'IDX_VEHICLE_MAINTENANCE_CREATED_BY'
    );
    await queryRunner.dropIndex(
      'vehicle_maintenance',
      'IDX_VEHICLE_MAINTENANCE_TENANT_ID'
    );
    // VEHICLE MAINTENANCE
    // VEHICLE SHARE
    await queryRunner.dropIndex(
      'vehicle_share',
      'IDX_VEHICLE_SHARE_VEHICLE_ID'
    );
    await queryRunner.dropIndex('vehicle_share', 'IDX_VEHICLE_SHARE_FROM');
    await queryRunner.dropIndex('vehicle_share', 'IDX_VEHICLE_SHARE_TO');
    await queryRunner.dropIndex('vehicle_share', 'IDX_VEHICLE_SHARE_TENANT_ID');
    await queryRunner.dropIndex(
      'vehicle_share',
      'IDX_VEHICLE_SHARE_CREATED_BY'
    );
    // VEHICLE SHARE
    // VEHICLE TYPE
    await queryRunner.dropIndex('vehicle_type', 'IDX_VEHICLE_TYPE_TENANT_ID');
    await queryRunner.dropIndex('vehicle_type', 'IDX_VEHICLE_TYPE_CREATED_BY');
    // VEHICLE TYPE
    // VOLUNTEERS ACTIVITIES
    await queryRunner.dropIndex(
      'volunteers_activities',
      'IDX_VOLUNTEERS_ACTIVITIES_CREATED_BY'
    );
    // VOLUNTEERS ACTIVITIES
  }
}
