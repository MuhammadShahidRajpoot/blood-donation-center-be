import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterDrivesColumn1709806660673 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make the columns nullable with default value null in the 'drives' table
    await queryRunner.query(
      'ALTER TABLE drives ALTER COLUMN marketing_items_status DROP NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE drives ALTER COLUMN promotional_items_status DROP NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE drives ALTER COLUMN marketing_items_status SET DEFAULT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE drives ALTER COLUMN promotional_items_status SET DEFAULT NULL'
    );

    // Make the columns nullable with default value null in the 'drives_history' table
    await queryRunner.query(
      'ALTER TABLE drives_history ALTER COLUMN marketing_items_status DROP NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE drives_history ALTER COLUMN promotional_items_status DROP NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE drives_history ALTER COLUMN marketing_items_status SET DEFAULT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE drives_history ALTER COLUMN promotional_items_status SET DEFAULT NULL'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert the changes if needed (make columns not nullable and set default value to false)
    await queryRunner.query(
      'ALTER TABLE drives ALTER COLUMN marketing_items_status SET NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE drives ALTER COLUMN promotional_items_status SET NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE drives ALTER COLUMN marketing_items_status SET DEFAULT false'
    );
    await queryRunner.query(
      'ALTER TABLE drives ALTER COLUMN promotional_items_status SET DEFAULT false'
    );

    await queryRunner.query(
      'ALTER TABLE drives_history ALTER COLUMN marketing_items_status SET NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE drives_history ALTER COLUMN promotional_items_status SET NOT NULL'
    );
    await queryRunner.query(
      'ALTER TABLE drives_history ALTER COLUMN marketing_items_status SET DEFAULT false'
    );
    await queryRunner.query(
      'ALTER TABLE drives_history ALTER COLUMN promotional_items_status SET DEFAULT false'
    );
  }
}
