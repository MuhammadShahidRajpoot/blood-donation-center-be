import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeStaffLastNameNotNullable1623149518546
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE staff ALTER COLUMN last_name SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE staff_history ALTER COLUMN last_name SET NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE staff ALTER COLUMN last_name SET NOT NULL`
    );

    await queryRunner.query(
      `ALTER TABLE staff_history ALTER COLUMN last_name SET NOT NULL`
    );
  }
}