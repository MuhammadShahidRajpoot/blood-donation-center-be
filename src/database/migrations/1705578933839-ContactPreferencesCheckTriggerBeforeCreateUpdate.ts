import { MigrationInterface, QueryRunner } from 'typeorm';

export class ContactPreferencesCheckTriggerBeforeCreateUpdate1705578933839
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE OR REPLACE FUNCTION f_check_violations_contact_preferences()
          RETURNS TRIGGER AS $$
          BEGIN
              IF (NOT f_exists_in_table(NEW.contact_preferenceable_type, NEW.contact_preferenceable_id)) THEN
                  RAISE EXCEPTION '%', 'Key (contact_preferenceable_id)=(' || NEW.contact_preferenceable_id || ') is not present in table "' || NEW.contact_preferenceable_type || '". Insert or update on table violates foreign key constraint';
              END IF;
              RETURN NULL;
          END;
          $$ LANGUAGE plpgsql;
        `);

    await queryRunner.query(`
          CREATE TRIGGER t_check_violations_contact_preferences
          BEFORE INSERT OR UPDATE 
          ON contact_preferences
          FOR EACH ROW EXECUTE FUNCTION f_check_violations_contact_preferences();
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          DROP TRIGGER IF EXISTS t_check_violations_contact_preferences ON contact_preferences;
        `);

    await queryRunner.query(`
          DROP FUNCTION IF EXISTS f_check_violations_contact_preferences;
        `);
  }
}
