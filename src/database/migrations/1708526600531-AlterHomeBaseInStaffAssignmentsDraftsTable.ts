import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterHomeBaseInStaffAssignmentsDraftsTable1708526600531
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'home_base',
      new TableColumn({
        name: 'home_base',
        type: 'int',
        isNullable: true, // Set nullable to true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'home_base',
      new TableColumn({
        name: 'home_base',
        type: 'enum',
        enum: [
          'staff_collection_operation',
          'operation_collection_operation',
          'staff_home_address',
        ],
        isNullable: true, // Set nullable to true
      })
    );
  }
}
