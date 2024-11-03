import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateDriveHistorTable1695305811858 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'drives_history',
        columns: [
          {
            name: 'rowkey',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'id', type: 'bigint', isNullable: false },
          {
            name: 'name',
            type: 'varchar',
            length: '60',
            isNullable: true,
          },
          {
            name: 'account_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'location_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'is_multi_day_drive',
            type: 'boolean',
            isNullable: false,
          },
          {
            name: 'tenant_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'promotion_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'operation_status_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'recruiter_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            precision: 6,
            default: `('now'::text)::timestamp(6) with time zone`,
          },
          { name: 'history_reason', type: 'varchar', length: '1' },
          {
            name: 'is_archived',
            type: 'boolean',
            default: false,
          },
          { name: 'created_by', type: 'bigint', isNullable: false },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Then, drop the table
    await queryRunner.dropTable('drives_history');
  }
}
