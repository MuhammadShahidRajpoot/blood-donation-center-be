import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class ScheduleOperationHistory1703594200822
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'schedule_operation_status_history',
        columns: [
          {
            name: 'rowkey',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'history_reason',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'id',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'schedule_id',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'operation_status_id',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'is_archived',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_by',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: 6,
            default: `('now'::text)::timestamp(6) with time zone`,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('schedule_operation_status_history');
  }
}
