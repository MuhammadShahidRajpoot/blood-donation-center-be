import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnRequestTypeInWebhookAlerts1712386583194
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'webhook_alerts',
      new TableColumn({
        name: 'request_type',
        type: 'text',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'webhook_alerts',
      new TableColumn({
        name: 'request_type',
        type: 'text',
        isNullable: true,
      })
    );
  }
}
