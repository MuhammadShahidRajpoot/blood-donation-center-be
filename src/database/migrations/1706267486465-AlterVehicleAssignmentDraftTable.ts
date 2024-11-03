import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterVehicleAssignmentDraftTable1706267486465
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'vehicles_assignments_drafts',
      'vehicle_assignment_id',
      new TableColumn({
        name: 'vehicle_assignment_id',
        type: 'bigint',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'vehicles_assignments_drafts',
      'vehicle_assignment_id',
      new TableColumn({
        name: 'vehicle_assignment_id',
        type: 'bigint',
        isNullable: false,
      })
    );
  }
}
