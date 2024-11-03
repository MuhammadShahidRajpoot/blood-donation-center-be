import { MigrationInterface, QueryRunner } from 'typeorm';
export class DuplicatesCheckTriggerBeforeCreateUpdate1705568657881
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
    await queryRunner.query(`CREATE OR REPLACE FUNCTION f_check_violations_duplicates()
    RETURNS TRIGGER AS $$
    BEGIN
        IF (NOT f_exists_in_table(NEW.duplicatable_type::text,NEW.duplicatable_id)) THEN
            RAISE EXCEPTION '%', 'Key (duplicatable_id)=(' || NEW.duplicatable_id || ') is not present in table "' || NEW.duplicatable_type || '".insert or update on table violates foreign key constraint';
            END IF;                    
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;`);
    await queryRunner.query(`
    DROP TRIGGER IF EXISTS t_check_violations_duplicates on duplicates;
    CREATE TRIGGER t_check_violations_duplicates
    BEFORE INSERT OR UPDATE
     ON duplicates
    FOR EACH ROW EXECUTE FUNCTION f_check_violations_duplicates();`);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS t_check_violations_duplicates ON duplicates;`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS f_check_violations_duplicates;`
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS f_exists_in_table;`);
  }
}
