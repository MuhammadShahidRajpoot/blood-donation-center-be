import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterStaffAssignmentsDraftsTable1705442484839
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'total_hours',
      new TableColumn({
        name: 'total_hours',
        type: 'decimal', // Change the type as needed
        isNullable: true,
      })
    );
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'staff_assignment_id',
      new TableColumn({
        name: 'staff_assignment_id',
        type: 'bigint', // Change the type as needed
        isNullable: true,
      })
    );
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'operation_id',
      new TableColumn({
        name: 'operation_id',
        type: 'bigint', // Change the type as needed
        isNullable: false,
      })
    );
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'operation_type',
      new TableColumn({
        name: 'operation_type',
        type: 'varchar', // Change the type as needed
        length: '255',
        isNullable: false,
      })
    );
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'shift_id',
      new TableColumn({
        name: 'shift_id',
        type: 'bigint', // Change the type as needed
        isNullable: false,
      })
    );
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'role_id',
      new TableColumn({
        name: 'role_id',
        type: 'bigint', // Change the type as needed
        isNullable: false,
      })
    );
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'staff_id',
      new TableColumn({
        name: 'staff_id',
        type: 'bigint', // Change the type as needed
        isNullable: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'total_hours',
      new TableColumn({
        name: 'total_hours',
        type: 'int', // Change the type as needed
        isNullable: true,
      })
    );
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'staff_assignment_id',
      new TableColumn({
        name: 'staff_assignment_id',
        type: 'bigint', // Change the type as needed
        isNullable: false,
      })
    );
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'operation_id',
      new TableColumn({
        name: 'operation_id',
        type: 'bigint', // Change the type as needed
        isNullable: true,
      })
    );
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'operation_type',
      new TableColumn({
        name: 'operation_type',
        type: 'text', // Change the type as needed
        isNullable: true,
      })
    );
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'shift_id',
      new TableColumn({
        name: 'shift_id',
        type: 'bigint', // Change the type as needed
        isNullable: true,
      })
    );
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'role_id',
      new TableColumn({
        name: 'role_id',
        type: 'bigint', // Change the type as needed
        isNullable: true,
      })
    );
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'staff_id',
      new TableColumn({
        name: 'staff_id',
        type: 'bigint', // Change the type as needed
        isNullable: true,
      })
    );
  }
}
