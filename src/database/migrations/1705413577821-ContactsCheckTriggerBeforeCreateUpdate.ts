import { MigrationInterface, QueryRunner } from 'typeorm';
export class ContactsCheckTriggerBeforeCreateUpdate1705413577821
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION f_exists_in_table(table_name text, id bigint)
            RETURNS BOOLEAN AS $$
            DECLARE
                row_exist BOOLEAN;
            BEGIN
                EXECUTE 'SELECT EXISTS (SELECT * FROM ' || table_name || ' WHERE id = $1)' INTO row_exist USING id;
                RETURN row_exist;
            END;
            $$ LANGUAGE plpgsql;`
    );
    await queryRunner.query(`CREATE OR REPLACE FUNCTION f_check_violations_contacts()
    RETURNS TRIGGER AS $$
    BEGIN
        IF (NOT f_exists_in_table(NEW.contactable_type,NEW.contactable_id)) THEN
            RAISE EXCEPTION '%', 'Key (contactable_id)=(' || NEW.contactable_id || ') is not present in table "' || NEW.contactable_type || '".insert or update on table violates foreign key constraint';
            END IF;                    
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;`);
    await queryRunner.query(`
    DROP TRIGGER IF EXISTS t_check_violations_contacts on contacts;
    CREATE TRIGGER t_check_violations_contacts
    BEFORE INSERT OR UPDATE
     ON contacts
    FOR EACH ROW EXECUTE FUNCTION f_check_violations_contacts();`);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS t_check_violations_contacts ON contacts;`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS f_check_violations_contacts;`
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS f_exists_in_table;`);
  }
}
