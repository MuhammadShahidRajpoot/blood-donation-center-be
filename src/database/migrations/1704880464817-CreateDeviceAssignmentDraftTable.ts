import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateDeviceAssignmentDraftTable1704880464817
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'devices_assignments_drafts',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'device_assignment_id',
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
            name: 'requested_device_id',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'assigned_device_id',
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
      'devices_assignments_drafts',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'devices_assignments_drafts',
      new TableForeignKey({
        columnNames: ['device_assignment_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'devices_assignments',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'devices_assignments_drafts',
      new TableForeignKey({
        columnNames: ['requested_device_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'device',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
    await queryRunner.createForeignKey(
      'devices_assignments_drafts',
      new TableForeignKey({
        columnNames: ['assigned_device_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'device',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'devices_assignments_drafts',
      'FK_created_by'
    );
    await queryRunner.dropForeignKey(
      'devices_assignments_drafts',
      'FK_device_assignment_id'
    );
    await queryRunner.dropForeignKey(
      'devices_assignments_drafts',
      'FK_requested_device_id'
    );
    await queryRunner.dropForeignKey(
      'devices_assignments_drafts',
      'FK_assigned_device_id'
    );
    await queryRunner.dropTable('devices_assignments_drafts');
  }
}
