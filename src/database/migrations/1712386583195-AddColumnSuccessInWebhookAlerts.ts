import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnSuccessInWebhookAlerts1712386583195
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'webhook_alerts',
      new TableColumn({
        name: 'success',
        type: 'boolean',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'webhook_alerts',
      new TableColumn({
        name: 'success',
        type: 'boolean',
        isNullable: true,
      })
    );
  }
}
