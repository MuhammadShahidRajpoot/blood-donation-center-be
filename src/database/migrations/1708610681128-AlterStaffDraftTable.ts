import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterStaffDraftTable1708610681128 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'clock_in_time',
      new TableColumn({
        name: 'clock_in_time',
        type: 'timestamp',
        isNullable: true,
      })
    );

    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'clock_out_time',
      new TableColumn({
        name: 'clock_out_time',
        type: 'timestamp',
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'clock_in_time',
      new TableColumn({
        name: 'clock_in_time',
        type: 'bigint',
        isNullable: true,
      })
    );

    await queryRunner.changeColumn(
      'staff_assignments_drafts',
      'clock_out_time',
      new TableColumn({
        name: 'clock_out_time',
        type: 'bigint',
        isNullable: true,
      })
    );
  }
}
