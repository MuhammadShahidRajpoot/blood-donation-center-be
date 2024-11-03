import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterTenantDailyStoryCampaignsColumn1709820228100
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn(
      'tenant',
      'dailystory_campaign_id',
      'daily_story_campaigns'
    );
    await queryRunner.renameColumn(
      'tenant_history',
      'dailystory_campaign_id',
      'daily_story_campaigns'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn(
      'tenant',
      'daily_story_campaigns',
      'dailystory_campaign_id'
    );
    await queryRunner.renameColumn(
      'tenant_history',
      'daily_story_campaigns',
      'dailystory_campaign_id'
    );
  }
}
