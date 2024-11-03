import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexesForTablesWithEAlphabet1703255459664
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Indexes for EmailTemplate table
    await queryRunner.createIndex(
      'email_template',
      new TableIndex({
        name: 'IDX_EMAIL_TEMPLATE_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'email_template',
      new TableIndex({
        name: 'IDX_EMAIL_TEMPLATE_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Indexes for equipments table
    await queryRunner.createIndex(
      'equipments',
      new TableIndex({
        name: 'IDX_EQUIPMENTS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'equipments',
      new TableIndex({
        name: 'IDX_EQUIPMENTS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Indexes for EquipmentCollectionOperationEntity table
    await queryRunner.createIndex(
      'equipments_collection_operations',
      new TableIndex({
        name: 'IDX_EQUIPMENT_COLLECTION_OPERATIONS_EQUIPMENT_ID',
        columnNames: ['equipment_id'],
      })
    );

    await queryRunner.createIndex(
      'equipments_collection_operations',
      new TableIndex({
        name: 'IDX_EQUIPMENT_COLLECTION_OPERATIONS_COLLECTION_OPERATION_ID',
        columnNames: ['collection_operation_id'],
      })
    );

    await queryRunner.createIndex(
      'equipments_collection_operations',
      new TableIndex({
        name: 'IDX_EQUIPMENT_COLLECTION_OPERATIONS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes for EmailTemplate table
    await queryRunner.dropIndex(
      'email_template',
      'IDX_EMAIL_TEMPLATE_CREATED_BY'
    );
    await queryRunner.dropIndex(
      'email_template',
      'IDX_EMAIL_TEMPLATE_TENANT_ID'
    );

    // Drop Indexes for equipments table
    await queryRunner.dropIndex('equipments', 'IDX_EQUIPMENTS_CREATED_BY');
    await queryRunner.dropIndex('equipments', 'IDX_EQUIPMENTS_TENANT_ID');

    // Drop indexes for EquipmentCollectionOperationEntity table
    await queryRunner.dropIndex(
      'equipments_collection_operations',
      'IDX_EQUIPMENT_COLLECTION_OPERATIONS_EQUIPMENT_ID'
    );
    await queryRunner.dropIndex(
      'equipments_collection_operations',
      'IDX_EQUIPMENT_COLLECTION_OPERATIONS_COLLECTION_OPERATION_ID'
    );
    await queryRunner.dropIndex(
      'equipments_collection_operations',
      'IDX_EQUIPMENT_COLLECTION_OPERATIONS_CREATED_BY'
    );
  }
}
