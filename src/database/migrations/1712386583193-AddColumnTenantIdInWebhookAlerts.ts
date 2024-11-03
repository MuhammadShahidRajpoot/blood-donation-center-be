import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddColumnTenantIdInWebhookAlerts1712386583193
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'webhook_alerts',
      new TableColumn({
        name: 'tenant_id',
        type: 'bigint',
        isNullable: true,
      })
    );
    await queryRunner.addColumn(
      'webhook_alerts',
      new TableColumn({
        name: 'status',
        type: 'boolean',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
