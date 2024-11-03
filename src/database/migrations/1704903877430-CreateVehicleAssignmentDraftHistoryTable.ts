import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateVehicleAssignmentDraftHistoryTable1704903877430
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'vehicles_assignments_drafts_history',
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
            name: 'vehicle_assignment_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'reason',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'operation_id',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'operation_type',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'pending_assignment',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'is_additional',
            type: 'boolean',
            default: true,
            isNullable: true,
          },
          {
            name: 'shift_id',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'requested_vehicle_id',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'assigned_vehicle_id',
            type: 'bigint',
            isNullable: true,
          },

          {
            name: 'reassign_by',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'is_notify',
            type: 'boolean',
            isNullable: false,
            default: false,
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
    await queryRunner.dropTable('vehicles_assignments_drafts_history');
  }
}
