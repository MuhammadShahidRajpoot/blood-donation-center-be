import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCallCenterSettingsTable1706103883341
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'call_center_settings_history',
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
            length: '1',
            isNullable: false,
          },
          {
            name: 'id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'calls_per_hour',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'appointments_per_hour',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'donors_per_hour',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'caller_id_name',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'caller_id_number',
            type: 'varchar',
            length: '15',
            isNullable: false,
          },
          {
            name: 'callback_number',
            type: 'varchar',
            length: '15',
            isNullable: false,
          },
          {
            name: 'max_calls_per_rolling_30_days',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'max_calls',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'max_no_of_rings',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'busy_call_outcome',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'no_answer_call_outcome',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'max_retries',
            type: 'int',
            isNullable: false,
          },

          {
            name: 'tenant_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: 6,
            default: `('now'::text)::timestamp(6) with time zone`,
          },
          {
            name: 'created_by',
            type: 'bigint',
            isNullable: false,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('call_center_settings_history');
  }
}
