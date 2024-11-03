import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOperationStatusHistoryTable1704902866562
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'schedule_operation_history',
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
            name: 'operation_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'schedule_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'pending_assignment',
            type: 'boolean',
            default: false,
          },
          {
            name: 'in_sync',
            type: 'boolean',
            default: false,
          },
          {
            name: 'to_be_removed',
            type: 'boolean',
            default: false,
          },

          {
            name: 'operation_type',
            type: 'text',
          },
          {
            name: 'created_by',
            type: 'bigint',
            isNullable: false,
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
    await queryRunner.dropTable('schedule_history_history');
  }
}
