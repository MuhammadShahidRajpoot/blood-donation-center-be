import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexesForTablesWithGAlphabet1703238142013
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createIndex(
      'goal_variance',
      new TableIndex({
        name: 'IDX_GOAL_VARIANCE_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'goal_variance',
      new TableIndex({
        name: 'IDX_GOAL_VARIANCE_UPDATED_BY',
        columnNames: ['updated_by'],
      })
    );

    await queryRunner.createIndex(
      'goal_variance',
      new TableIndex({
        name: 'IDX_GOAL_VARIANCE_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'goal_variance',
      'IDX_GOAL_VARIANCE_CREATED_BY'
    );

    await queryRunner.dropIndex(
      'goal_variance',
      'IDX_GOAL_VARIANCE_UPDATED_BY'
    );

    await queryRunner.dropIndex('goal_variance', 'IDX_GOAL_VARIANCE_TENANT_ID');
  }
}
