import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterDonorAppointmentsHistoryTable1698765675952
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'donors_appointments_history',
      new TableColumn({
        name: 'appointmentable_type',
        type: 'bigint',
        isNullable: false,
      }),
      new TableColumn({
        name: 'appointmentable_type',
        type: 'varchar',
        length: '255',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'donors_appointments_history',
      new TableColumn({
        name: 'appointmentable_type',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'appointmentable_type',
        type: 'bigint',
        isNullable: false,
      })
    );
  }
}
