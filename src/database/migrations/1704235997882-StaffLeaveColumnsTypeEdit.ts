import { MigrationInterface, QueryRunner } from 'typeorm';

export class StaffLeaveColumnsTypeEdit1704235997882
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE staff_leave ALTER COLUMN hours TYPE double precision'
    );
    await queryRunner.query(
      'ALTER TABLE staff_leave ADD type_id BIGINT NOT NULL DEFAULT (1) REFERENCES leave_types'
    );
    await queryRunner.query('ALTER TABLE staff_leave DROP COLUMN type');
    await queryRunner.query('ALTER TABLE staff_leave_history DROP COLUMN type');
    await queryRunner.query(
      'ALTER TABLE staff_leave_history ALTER COLUMN hours TYPE double precision'
    );
    await queryRunner.query(
      'ALTER TABLE staff_leave_history ADD type_id BIGINT NOT NULL DEFAULT (1) REFERENCES leave_types'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE staff_leave ALTER COLUMN hours TYPE int'
    );
    await queryRunner.query('ALTER TABLE staff_leave DROP COLUMN type_id');
    await queryRunner.query(
      'ALTER TABLE staff_leave ADD COLUMN TYPE staff_leave_type_enum'
    );
    await queryRunner.query(
      'ALTER TABLE staff_leave_history DROP COLUMN type_id'
    );
    await queryRunner.query(
      'ALTER TABLE staff_leave_history ALTER COLUMN hours TYPE int'
    );
    await queryRunner.query(
      'ALTER TABLE staff_leave_history ADD COLUMN TYPE staff_leave_history_type_enum'
    );
  }
}
