import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
export class CreateStaffAssignmentDraftTable1704878172588
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'staff_assignments_drafts',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'staff_assignment_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'reason',
            type: 'char',
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
            name: 'shift_id',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'role_id',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'staff_id',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'is_additional',
            type: 'boolean',
            default: true,
            isNullable: true,
          },
          {
            name: 'home_base',
            type: 'enum',
            enum: [
              'staff_collection_operation',
              'operation_collection_operation',
              'staff_home_address',
            ],

            isNullable: true,
          },
          {
            name: 'is_travel_time_included',
            type: 'boolean',
            default: true,
            isNullable: true,
          },
          {
            name: 'pending_assignment',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'lead_time',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'travel_to_time',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'setup_time',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'breakdown_time',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'travel_from_time',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'wrapup_time',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'clock_in_time',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'clock_out_time',
            type: 'bigint',
            isNullable: true,
          },
          {
            name: 'total_hours',
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
      'staff_assignments_drafts',
      new TableForeignKey({
        columnNames: ['created_by'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
    await queryRunner.createForeignKey(
      'staff_assignments_drafts',
      new TableForeignKey({
        columnNames: ['staff_assignment_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'staff_assignments',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
    await queryRunner.createForeignKey(
      'staff_assignments_drafts',
      new TableForeignKey({
        columnNames: ['shift_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'shifts',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
    await queryRunner.createForeignKey(
      'staff_assignments_drafts',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
    await queryRunner.createForeignKey(
      'staff_assignments_drafts',
      new TableForeignKey({
        columnNames: ['staff_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'staff',
        onDelete: 'NO ACTION',
        onUpdate: 'NO ACTION',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'staff_assignments_drafts',
      'FK_created_by'
    );
    await queryRunner.dropForeignKey(
      'staff_assignments_drafts',
      'FK_staff_assignment_id'
    );
    await queryRunner.dropForeignKey('staff_assignments_drafts', 'FK_shift_id');
    await queryRunner.dropForeignKey('staff_assignments_drafts', 'FK_role_id');
    await queryRunner.dropForeignKey('staff_assignments_drafts', 'FK_staff_id');
    await queryRunner.dropTable('staff_assignments_drafts');
  }
}
