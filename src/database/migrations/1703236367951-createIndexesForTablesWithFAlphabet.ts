import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class FileName1703236367951 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'facility',
      new TableIndex({
        name: 'IDX_FACILITY_COLLECTION_OPERATION',
        columnNames: ['collection_operation'],
      })
    );

    await queryRunner.createIndex(
      'facility',
      new TableIndex({
        name: 'IDX_FACILITY_INDUSTRY_CATEGORY',
        columnNames: ['industry_category'],
      })
    );

    await queryRunner.createIndex(
      'facility',
      new TableIndex({
        name: 'IDX_FACILITY_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'facility',
      new TableIndex({
        name: 'IDX_FACILITY_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'facility_industry_sub_category',
      new TableIndex({
        name: 'IDX_FACILITY_INDUSTRY_SUB_CATEGORY_FACILITY_ID',
        columnNames: ['facility_id'],
      })
    );

    await queryRunner.createIndex(
      'facility_industry_sub_category',
      new TableIndex({
        name: 'IDX_FACILITY_INDUSTRY_SUB_CATEGORY_INDUSTRY_SUB_CATEGORY_ID',
        columnNames: ['industry_sub_category_id'],
      })
    );

    await queryRunner.createIndex(
      'favorites',
      new TableIndex({
        name: 'IDX_FAVORITES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'favorites',
      new TableIndex({
        name: 'IDX_FAVORITES_PRODUCT_ID',
        columnNames: ['product_id'],
      })
    );

    await queryRunner.createIndex(
      'favorites',
      new TableIndex({
        name: 'IDX_FAVORITES_PROCEDURE_ID',
        columnNames: ['procedure_id'],
      })
    );

    await queryRunner.createIndex(
      'favorites',
      new TableIndex({
        name: 'IDX_FAVORITES_OPERATIONS_STATUS_ID',
        columnNames: ['operations_status_id'],
      })
    );

    await queryRunner.createIndex(
      'favorites',
      new TableIndex({
        name: 'IDX_FAVORITES_ORGANIZATION_LEVEL_ID',
        columnNames: ['organization_level_id'],
      })
    );

    await queryRunner.createIndex(
      'filter_saved_criteria',
      new TableIndex({
        name: 'IDX_FILTER_SAVED_CRITERIA_FILTER_SAVED_ID',
        columnNames: ['filter_saved_id'],
      })
    );

    await queryRunner.createIndex(
      'filter_saved_criteria',
      new TableIndex({
        name: 'IDX_FILTER_SAVED_CRITERIA_FILTER_CRITERIA_ID',
        columnNames: ['filter_criteria_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'facility',
      'IDX_FACILITY_COLLECTION_OPERATION'
    );

    await queryRunner.dropIndex('facility', 'IDX_FACILITY_INDUSTRY_CATEGORY');

    await queryRunner.dropIndex('facility', 'IDX_FACILITY_CREATED_BY');

    await queryRunner.dropIndex('facility', 'IDX_FACILITY_TENANT_ID');

    await queryRunner.dropIndex(
      'facility_industry_sub_category',
      'IDX_FACILITY_INDUSTRY_SUB_CATEGORY_FACILITY_ID'
    );

    await queryRunner.dropIndex(
      'facility_industry_sub_category',
      'IDX_FACILITY_INDUSTRY_SUB_CATEGORY_INDUSTRY_SUB_CATEGORY_ID'
    );

    await queryRunner.dropIndex('favorites', 'IDX_FAVORITES_TENANT_ID');

    await queryRunner.dropIndex('favorites', 'IDX_FAVORITES_PRODUCT_ID');

    await queryRunner.dropIndex('favorites', 'IDX_FAVORITES_PROCEDURE_ID');

    await queryRunner.dropIndex(
      'favorites',
      'IDX_FAVORITES_OPERATIONS_STATUS_ID'
    );

    await queryRunner.dropIndex(
      'favorites',
      'IDX_FAVORITES_ORGANIZATION_LEVEL_ID'
    );

    await queryRunner.dropIndex(
      'filter_saved_criteria',
      'IDX_FILTER_SAVED_CRITERIA_FILTER_SAVED_ID'
    );

    await queryRunner.dropIndex(
      'filter_saved_criteria',
      'IDX_FILTER_SAVED_CRITERIA_FILTER_CRITERIA_ID'
    );
  }
}
