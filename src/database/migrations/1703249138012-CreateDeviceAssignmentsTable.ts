import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateDeviceAssignmentsTable1703249138012
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'devices_assignments',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'operation_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'operation_type',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'pending_assignment',
            type: 'boolean',
            isNullable: false,
          },
          {
            name: 'shift_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'requested_device_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'assigned_device_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'is_additional',
            type: 'boolean',
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
      'devices_assignments',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'devices_assignments',
      new TableForeignKey({
        columnNames: ['shift_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'shifts',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'devices_assignments',
      new TableForeignKey({
        columnNames: ['requested_device_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'device',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
    await queryRunner.createForeignKey(
      'devices_assignments',
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
    await queryRunner.dropForeignKey('devices_assignments', 'FK_created_by');
    await queryRunner.dropForeignKey('devices_assignments', 'FK_shift_id');
    await queryRunner.dropForeignKey(
      'devices_assignments',
      'FK_requested_device_id'
    );
    await queryRunner.dropForeignKey(
      'devices_assignments',
      'FK_assigned_device_id'
    );
    await queryRunner.dropTable('devices_assignments');
  }
}
