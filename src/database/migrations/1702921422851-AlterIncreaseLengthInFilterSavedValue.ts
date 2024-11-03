import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterIncreaseLengthInFilterSavedValue1702921422851
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE filter_saved_criteria
       ALTER COLUMN filter_saved_value TYPE varchar(255) 
       USING filter_saved_value::varchar(255);`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE filter_saved_criteria
       ALTER COLUMN filter_saved_value TYPE varchar(60) 
       USING filter_saved_value::varchar(60);`
    );
  }
}
