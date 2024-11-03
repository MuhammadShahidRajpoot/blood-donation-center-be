import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterVehicleAssignmentDraftRequestedVehicleTypeId1708463438531
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'vehicles_assignments_drafts',
      'requested_vehicle_id'
    );

    await queryRunner.addColumn(
      'vehicles_assignments_drafts',
      new TableColumn({
        name: 'requested_vehicle_type_id',
        type: 'bigint',
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      'vehicles_assignments_drafts',
      new TableForeignKey({
        name: 'requested_vehicle_type',
        columnNames: ['requested_vehicle_type_id'],
        referencedTableName: 'vehicle_type',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL', // or other options depending on your requirements
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'vehicles_assignments_drafts',
      'requested_vehicle_type'
    );

    await queryRunner.dropColumn(
      'vehicles_assignments_drafts',
      'requested_vehicle_type_id'
    );

    await queryRunner.addColumn(
      'vehicles_assignments_drafts',
      new TableColumn({
        name: 'requested_vehicle_id',
        type: 'bigint',
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      'vehicles_assignments_drafts',
      new TableForeignKey({
        name: 'fk_requested_vehicle',
        columnNames: ['requested_vehicle_id'],
        referencedTableName: 'vehicle_type',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      })
    );
  }
}
