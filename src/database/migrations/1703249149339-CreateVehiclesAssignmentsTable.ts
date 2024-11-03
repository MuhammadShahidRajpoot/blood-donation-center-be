import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateVehiclesAssignmentsTable1703249149339
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'vehicles_assignments',
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
            name: 'requested_vehicle_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'assigned_vehicle_id',
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
      'vehicles_assignments',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'vehicles_assignments',
      new TableForeignKey({
        columnNames: ['shift_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'shifts',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );

    await queryRunner.createForeignKey(
      'vehicles_assignments',
      new TableForeignKey({
        columnNames: ['requested_vehicle_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vehicle',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
    await queryRunner.createForeignKey(
      'vehicles_assignments',
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
    await queryRunner.dropForeignKey('vehicles_assignments', 'FK_created_by');
    await queryRunner.dropForeignKey('vehicles_assignments', 'FK_shift_id');
    await queryRunner.dropForeignKey(
      'vehicles_assignments',
      'FK_requested_vehicle_id'
    );
    await queryRunner.dropForeignKey(
      'vehicles_assignments',
      'FK_assigned_vehicle_id'
    );
    await queryRunner.dropTable('vehicles_assignments');
  }
}
