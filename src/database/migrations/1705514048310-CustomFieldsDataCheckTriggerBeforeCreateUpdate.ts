import { MigrationInterface, QueryRunner } from 'typeorm';
export class CustomFieldsDataCheckTriggerBeforeCreateUpdate1705514048310
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
    await queryRunner.query(`CREATE OR REPLACE FUNCTION f_check_violations_custom_fields_data()
    RETURNS TRIGGER AS $$
    BEGIN
        IF (NOT f_exists_in_table(NEW.custom_field_datable_type,NEW.custom_field_datable_id)) THEN
            RAISE EXCEPTION '%', 'Key (custom_field_datable_id)=(' || NEW.custom_field_datable_id || ') is not present in table "' || NEW.custom_field_datable_type || '".insert or update on table violates foreign key constraint';
            END IF;                    
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;`);
    await queryRunner.query(`
    DROP TRIGGER IF EXISTS t_check_violations_custom_fields_data on custom_fields_data;
    CREATE TRIGGER t_check_violations_custom_fields_data
    BEFORE INSERT OR UPDATE
     ON custom_fields_data
    FOR EACH ROW EXECUTE FUNCTION f_check_violations_custom_fields_data();`);
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS t_check_violations_custom_fields_data ON custom_fields_data;`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS f_check_violations_custom_fields_data;`
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS f_exists_in_table;`);
  }
}
