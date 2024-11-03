import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterScheduleTable1707924321789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'schedule',
      new TableColumn({
        name: 'locked_by',
        type: 'bigint',
        default: null,
        isNullable: true,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('schedule', 'locked_by');
  }
}
