import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSequencesForDriveandSession1703594200824
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create a custom sequences
    await queryRunner.query(
      'CREATE SEQUENCE even_drive_sequence INCREMENT BY 2 START WITH 2'
    );
    await queryRunner.query(
      'CREATE SEQUENCE odd_session_sequence INCREMENT BY 2 START WITH 1'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the custom sequences
    await queryRunner.query('DROP SEQUENCE even_drive_sequence');
    await queryRunner.query('DROP SEQUENCE odd_session_sequence');
  }
}
