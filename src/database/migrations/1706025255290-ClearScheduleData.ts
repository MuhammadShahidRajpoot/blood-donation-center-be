import { MigrationInterface, QueryRunner } from 'typeorm';

export class ClearScheduleData1706025255290 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM schedule_operation;');
    await queryRunner.query('DELETE FROM schedule_operation_status;');
    await queryRunner.query('DELETE FROM schedule;');
  }
  // eslint-disable-next-line
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
