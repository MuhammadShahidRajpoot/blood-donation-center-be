import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class FileName1703255701679 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Index for PromotionalItems table
    await queryRunner.createIndex(
      'promotional_items',
      new TableIndex({
        name: 'IDX_PROMOTIONAL_ITEMS_PROMOTION_ID',
        columnNames: ['promotion_id'],
      })
    );

    await queryRunner.createIndex(
      'promotional_items',
      new TableIndex({
        name: 'IDX_PROMOTIONAL_ITEMS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Index for PromotionEntity table
    await queryRunner.createIndex(
      'promotion_entity',
      new TableIndex({
        name: 'IDX_PROMOTION_ENTITY_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Index for Prospects table
    await queryRunner.createIndex(
      'prospects',
      new TableIndex({
        name: 'IDX_PROSPECTS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Index for ProspectsBlueprints table
    await queryRunner.createIndex(
      'prospects_blueprints',
      new TableIndex({
        name: 'IDX_PROSPECTS_BLUEPRINTS_PROSPECT_ID',
        columnNames: ['prospect_id'],
      })
    );

    await queryRunner.createIndex(
      'prospects_blueprints',
      new TableIndex({
        name: 'IDX_PROSPECTS_BLUEPRINTS_BLUEPRINT_ID',
        columnNames: ['blueprint_id'],
      })
    );

    await queryRunner.createIndex(
      'prospects_blueprints',
      new TableIndex({
        name: 'IDX_PROSPECTS_BLUEPRINTS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Index for ProspectsCommunications table
    await queryRunner.createIndex(
      'prospects_communications',
      new TableIndex({
        name: 'IDX_PROSPECTS_COMMUNICATIONS_PROSPECT_ID',
        columnNames: ['prospect_id'],
      })
    );

    await queryRunner.createIndex(
      'prospects_communications',
      new TableIndex({
        name: 'IDX_PROSPECTS_COMMUNICATIONS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index for PromotionalItems table
    await queryRunner.dropIndex(
      'promotional_items',
      'IDX_PROMOTIONAL_ITEMS_PROMOTION_ID'
    );

    await queryRunner.dropIndex(
      'promotional_items',
      'IDX_PROMOTIONAL_ITEMS_TENANT_ID'
    );

    // Drop Index for PromotionEntity table
    await queryRunner.dropIndex(
      'promotion_entity',
      'IDX_PROMOTION_ENTITY_TENANT_ID'
    );

    // Drop Index for Prospects table
    await queryRunner.dropIndex('prospects', 'IDX_PROSPECTS_TENANT_ID');

    // Drop Index for ProspectsBlueprints table
    await queryRunner.dropIndex(
      'prospects_blueprints',
      'IDX_PROSPECTS_BLUEPRINTS_PROSPECT_ID'
    );
    await queryRunner.dropIndex(
      'prospects_blueprints',
      'IDX_PROSPECTS_BLUEPRINTS_BLUEPRINT_ID'
    );
    await queryRunner.dropIndex(
      'prospects_blueprints',
      'IDX_PROSPECTS_BLUEPRINTS_TENANT_ID'
    );

    //Drop Index for ProspectsCommunications table
    await queryRunner.dropIndex(
      'prospects_communications',
      'IDX_PROSPECTS_COMMUNICATIONS_PROSPECT_ID'
    );
    await queryRunner.dropIndex(
      'prospects_communications',
      'IDX_PROSPECTS_COMMUNICATIONS_TENANT_ID'
    );
  }
}
