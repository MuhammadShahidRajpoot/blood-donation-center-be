import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexesForTablesWithIAlphabet1703239406936
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'industry_categories',
      new TableIndex({
        name: 'IDX_INDUSTRY_CATEGORIES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'industry_categories',
      new TableIndex({
        name: 'IDX_INDUSTRY_CATEGORIES_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'industry_categories',
      new TableIndex({
        name: 'IDX_INDUSTRY_CATEGORIES_PARENT_ID',
        columnNames: ['parent_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'industry_categories',
      'IDX_INDUSTRY_CATEGORIES_TENANT_ID'
    );

    await queryRunner.dropIndex(
      'industry_categories',
      'IDX_INDUSTRY_CATEGORIES_CREATED_BY'
    );

    await queryRunner.dropIndex(
      'industry_categories',
      'IDX_INDUSTRY_CATEGORIES_PARENT_ID'
    );
  }
}
