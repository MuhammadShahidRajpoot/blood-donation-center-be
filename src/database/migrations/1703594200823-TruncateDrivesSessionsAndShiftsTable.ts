import { MigrationInterface, QueryRunner } from 'typeorm';

export class TruncateDrivesSessionsAndShiftsTable1703594200823
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('TRUNCATE TABLE drives RESTART IDENTITY CASCADE');
    await queryRunner.query('TRUNCATE TABLE sessions RESTART IDENTITY CASCADE');
    await queryRunner.query('TRUNCATE TABLE shifts RESTART IDENTITY CASCADE');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the custom sequences
  }
}
