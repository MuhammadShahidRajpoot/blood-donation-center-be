import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterDailyGoalsCalendarAddManualUpdated1706877764176
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'daily_goals_calenders',
      new TableColumn({
        name: 'manual_updated',
        type: 'boolean',
        default: false,
      })
    );
    await queryRunner.addColumn(
      'daily_goals_calenders_history',
      new TableColumn({
        name: 'manual_updated',
        type: 'boolean',
        default: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'daily_goals_calenders',
      new TableColumn({
        name: 'manual_updated',
        type: 'boolean',
        default: false,
      })
    );
    await queryRunner.dropColumn(
      'daily_goals_calenders_history',
      new TableColumn({
        name: 'manual_updated',
        type: 'boolean',
        default: false,
      })
    );
  }
}
