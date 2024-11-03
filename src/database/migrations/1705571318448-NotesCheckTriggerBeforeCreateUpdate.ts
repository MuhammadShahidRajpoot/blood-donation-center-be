import { MigrationInterface, QueryRunner } from 'typeorm';
export class NotesCheckTriggerBeforeCreateUpdate1705571318448
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
    await queryRunner.query(`CREATE OR REPLACE FUNCTION f_check_violations_notes()
    RETURNS TRIGGER AS $$
    BEGIN
        IF (NOT f_exists_in_table(NEW.noteable_type,NEW.noteable_id)) THEN
            RAISE EXCEPTION '%', 'Key (noteable_id)=(' || NEW.noteable_id || ') is not present in table "' || NEW.noteable_type || '".insert or update on table violates foreign key constraint';
            END IF;                    
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;`);
    await queryRunner.query(`
    DROP TRIGGER IF EXISTS t_check_violations_notes on notes;
    CREATE TRIGGER t_check_violations_notes
    BEFORE INSERT OR UPDATE
     ON notes
    FOR EACH ROW EXECUTE FUNCTION f_check_violations_notes();`);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS t_check_violations_notes ON notes;`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS f_check_violations_notes;`
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS f_exists_in_table;`);
  }
}
