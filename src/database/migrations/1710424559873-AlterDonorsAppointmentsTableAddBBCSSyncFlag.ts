import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterDonorsAppointmentsTableAddBBCSSyncFlag1710424559872
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'donors_appointments',
      new TableColumn({
        name: 'is_bbcs_sync',
        type: 'boolean',
        isNullable: false,
        default: false,
      })
    );
    await queryRunner.addColumn(
      'donors_appointments_history',
      new TableColumn({
        name: 'is_bbcs_sync',
        type: 'boolean',
        isNullable: false,
        default: false,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'donors_appointments',
      new TableColumn({
        name: 'is_bbcs_sync',
        type: 'boolean',
        isNullable: false,
        default: false,
      })
    );
    await queryRunner.dropColumn(
      'donors_appointments_history',
      new TableColumn({
        name: 'is_bbcs_sync',
        type: 'boolean',
        isNullable: false,
        default: false,
      })
    );
  }
}
