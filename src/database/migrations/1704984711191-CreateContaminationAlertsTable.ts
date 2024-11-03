import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateContaminationAlertsTable1704984711191
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // create table
    await queryRunner.createTable(
      new Table({
        name: 'contamination_alerts',
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
            name: 'request',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'response',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'endpoint',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'url',
            type: 'text',
            isNullable: true,
          },
        ],
      }),
      true // set `true` to create the table if it doesn't exist);
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('contamination_alerts');
  }
}
