import { MigrationInterface, QueryRunner } from 'typeorm';
export class CommunicationsCheckTriggerBeforeCreateUpdate1705516969681
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
    await queryRunner.query(`CREATE OR REPLACE FUNCTION f_check_violations_communications()
    RETURNS TRIGGER AS $$
    BEGIN
        IF (NOT f_exists_in_table(NEW.communicationable_type,NEW.communicationable_id)) THEN
            RAISE EXCEPTION '%', 'Key (communicationable_id)=(' || NEW.communicationable_id || ') is not present in table "' || NEW.communicationable_type || '".insert or update on table violates foreign key constraint';
            END IF;                    
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;`);
    await queryRunner.query(`
    DROP TRIGGER IF EXISTS t_check_violations_communications on communications;
    CREATE TRIGGER t_check_violations_communications
    BEFORE INSERT OR UPDATE
     ON communications
    FOR EACH ROW EXECUTE FUNCTION f_check_violations_communications();`);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS t_check_violations_communications ON communications;`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS f_check_violations_communications;`
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS f_exists_in_table;`);
  }
}
