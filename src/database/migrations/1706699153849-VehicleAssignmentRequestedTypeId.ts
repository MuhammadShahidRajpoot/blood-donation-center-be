import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class VehicleAssignmentRequestedTypeId1706699153849
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'vehicles_assignments',
      'requested_vehicle_id'
    );

    await queryRunner.addColumn(
      'vehicles_assignments',
      new TableColumn({
        name: 'requested_vehicle_type_id',
        type: 'integer',
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      'vehicles_assignments',
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
      'vehicles_assignments',
      'requested_vehicle_type'
    );

    await queryRunner.dropColumn(
      'vehicles_assignments',
      'requested_vehicle_type_id'
    );

    await queryRunner.addColumn(
      'vehicles_assignments',
      new TableColumn({
        name: 'requested_vehicle_id',
        type: 'integer',
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      'vehicles_assignments',
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
