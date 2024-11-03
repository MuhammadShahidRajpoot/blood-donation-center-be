import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateGenderLengthOfDonor1703770379128
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE donors ALTER COLUMN gender TYPE VARCHAR(20)'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE donors ALTER COLUMN gender TYPE VARCHAR(1)'
    );
  }
}
