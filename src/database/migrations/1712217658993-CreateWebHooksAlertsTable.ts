import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateWebHooksAlertsTable1712217658993
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // create table
    await queryRunner.createTable(
      new Table({
        name: 'webhook_alerts',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: 6,
            default: `('now'::text)::timestamp(6) with time zone`,
          },
          {
            name: 'webhookType',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'api',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'payload',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
      true // set `true` to create the table if it doesn't exist);
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('webhook_alerts');
  }
}
