import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterVehicleAssignmentDraftHistoryTable1706267645788
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'vehicles_assignments_drafts_history',
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
      'vehicles_assignments_drafts_history',
      'vehicle_assignment_id',
      new TableColumn({
        name: 'vehicle_assignment_id',
        type: 'bigint',
        isNullable: false,
      })
    );
  }
}
