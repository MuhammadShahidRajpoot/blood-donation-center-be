import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCallCenterSettingsHistoryTable1706105102138
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'call_center_settings',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
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
    await queryRunner.createForeignKey(
      'call_center_settings',
      new TableForeignKey({
        columnNames: ['tenant_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'tenant',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('call_center_settings', 'FK_tenant_id');
    await queryRunner.dropTable('call_center_settings');
  }
}
