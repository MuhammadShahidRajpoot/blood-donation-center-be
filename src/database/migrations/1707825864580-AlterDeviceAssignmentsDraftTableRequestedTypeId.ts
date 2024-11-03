import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AlterDeviceAssignmentsDraftTableRequestedTypeId1707825864580
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'devices_assignments_drafts',
      'requested_device_id'
    );

    await queryRunner.addColumn(
      'devices_assignments_drafts',
      new TableColumn({
        name: 'requested_device_type_id',
        type: 'integer',
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      'devices_assignments_drafts',
      new TableForeignKey({
        name: 'requested_device_type',
        columnNames: ['requested_device_type_id'],
        referencedTableName: 'device_type',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL', // or other options depending on your requirements
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      'devices_assignments_drafts',
      'requested_device_type'
    );

    await queryRunner.dropColumn(
      'devices_assignments_drafts',
      'requested_device_type_id'
    );

    await queryRunner.addColumn(
      'devices_assignments_drafts',
      new TableColumn({
        name: 'requested_device_id',
        type: 'integer',
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      'devices_assignments_drafts',
      new TableForeignKey({
        name: 'fk_requested_device',
        columnNames: ['requested_device_id'],
        referencedTableName: 'device_type',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      })
    );
  }
}
