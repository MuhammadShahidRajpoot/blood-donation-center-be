import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexesForTablesWithMAlphabet1703245656444
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'marketing_materials',
      new TableIndex({
        name: 'IDX_MARKETING_MATERIALS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'marketing_materials',
      new TableIndex({
        name: 'IDX_MARKETING_MATERIALS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'marketing_materials_collection_operations',
      new TableIndex({
        name: 'IDX_MARKETING_MATERIALS_COLLECTION_OPERATIONS_MARKETING_MATERIALS_ID',
        columnNames: ['marketing_materials_id'],
      })
    );

    await queryRunner.createIndex(
      'marketing_materials_collection_operations',
      new TableIndex({
        name: 'IDX_MARKETING_MATERIALS_COLLECTION_OPERATIONS_BUSINESS_UNIT_ID',
        columnNames: ['business_unit_id'],
      })
    );

    await queryRunner.createIndex(
      'modules',
      new TableIndex({
        name: 'IDX_MODULES_APPLICATION_ID',
        columnNames: ['application_id'],
      })
    );

    await queryRunner.createIndex(
      'modules',
      new TableIndex({
        name: 'IDX_MODULES_PARENT_ID',
        columnNames: ['parent_id'],
      })
    );

    await queryRunner.createIndex(
      'monthly_goals',
      new TableIndex({
        name: 'IDX_MONTHLY_GOALS_PROCEDURE_TYPE',
        columnNames: ['procedure_type'],
      })
    );

    await queryRunner.createIndex(
      'monthly_goals',
      new TableIndex({
        name: 'IDX_MONTHLY_GOALS_DONOR_CENTER',
        columnNames: ['donor_center'],
      })
    );

    await queryRunner.createIndex(
      'monthly_goals',
      new TableIndex({
        name: 'IDX_MONTHLY_GOALS_RECRUITER',
        columnNames: ['recruiter'],
      })
    );

    await queryRunner.createIndex(
      'monthly_goals',
      new TableIndex({
        name: 'IDX_MONTHLY_GOALS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'monthly_goals_collection_operations',
      new TableIndex({
        name: 'IDX_MONTHLY_GOALS_COLLECTION_OPERATIONS_MONTHLY_GOALS_ID',
        columnNames: ['monthly_goals_id'],
      })
    );

    await queryRunner.createIndex(
      'monthly_goals_collection_operations',
      new TableIndex({
        name: 'IDX_MONTHLY_GOALS_COLLECTION_OPERATIONS_BUSINESS_UNIT_ID',
        columnNames: ['business_unit_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'marketing_materials',
      'IDX_MARKETING_MATERIALS_CREATED_BY'
    );

    await queryRunner.dropIndex(
      'marketing_materials',
      'IDX_MARKETING_MATERIALS_TENANT_ID'
    );

    await queryRunner.dropIndex(
      'marketing_materials_collection_operations',
      'IDX_MARKETING_MATERIALS_COLLECTION_OPERATIONS_MARKETING_MATERIALS_ID'
    );

    await queryRunner.dropIndex(
      'marketing_materials_collection_operations',
      'IDX_MARKETING_MATERIALS_COLLECTION_OPERATIONS_BUSINESS_UNIT_ID'
    );

    await queryRunner.dropIndex('modules', 'IDX_MODULES_APPLICATION_ID');

    await queryRunner.dropIndex('modules', 'IDX_MODULES_PARENT_ID');

    await queryRunner.dropIndex(
      'monthly_goals',
      'IDX_MONTHLY_GOALS_PROCEDURE_TYPE'
    );

    await queryRunner.dropIndex(
      'monthly_goals',
      'IDX_MONTHLY_GOALS_DONOR_CENTER'
    );

    await queryRunner.dropIndex('monthly_goals', 'IDX_MONTHLY_GOALS_RECRUITER');

    await queryRunner.dropIndex('monthly_goals', 'IDX_MONTHLY_GOALS_TENANT_ID');

    await queryRunner.dropIndex(
      'monthly_goals_collection_operations',
      'IDX_MONTHLY_GOALS_COLLECTION_OPERATIONS_MONTHLY_GOALS_ID'
    );

    await queryRunner.dropIndex(
      'monthly_goals_collection_operations',
      'IDX_MONTHLY_GOALS_COLLECTION_OPERATIONS_BUSINESS_UNIT_ID'
    );
  }
}
