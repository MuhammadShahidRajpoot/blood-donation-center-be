import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateVehicleAssignmentDraftTable1704881274128
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'vehicles_assignments_drafts',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
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
    await queryRunner.createForeignKey(
      'vehicles_assignments_drafts',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'vehicles_assignments_drafts',
      new TableForeignKey({
        columnNames: ['vehicle_assignment_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vehicles_assignments',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'vehicles_assignments_drafts',
      new TableForeignKey({
        columnNames: ['requested_vehicle_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vehicle',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
    await queryRunner.createForeignKey(
      'vehicles_assignments_drafts',
      new TableForeignKey({
        columnNames: ['assigned_vehicle_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vehicle',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'vehicles_assignments_drafts',
      'FK_created_by'
    );
    await queryRunner.dropForeignKey(
      'vehicles_assignments_drafts',
      'FK_vehicle_assignment_id'
    );
    await queryRunner.dropForeignKey(
      'vehicles_assignments_drafts',
      'FK_requested_vehicle_id'
    );
    await queryRunner.dropForeignKey(
      'vehicles_assignments_drafts',
      'FK_assigned_vehicle_id'
    );
    await queryRunner.dropTable('vehicles_assignments_drafts');
  }
}
