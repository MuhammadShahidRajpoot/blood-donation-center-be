import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddressCheckTriggerBeforeCreateUpdate1705578968199
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE  FUNCTION f_exists_in_table(table_name text, id bigint)
                RETURNS BOOLEAN AS $$
                DECLARE
                    row_exist BOOLEAN;
                BEGIN
                    EXECUTE 'SELECT EXISTS (SELECT * FROM ' || table_name || ' WHERE id = $1)' INTO row_exist USING id;
                
                    RETURN row_exist;
                END;
                $$ LANGUAGE plpgsql;`
    );

    await queryRunner.query(`CREATE OR REPLACE  FUNCTION f_check_violations_address()
        RETURNS TRIGGER AS $$
        BEGIN
        
            IF (NOT f_exists_in_table(NEW.addressable_type,NEW.addressable_id)) THEN
                RAISE EXCEPTION '%', 'Key (addressable_id)=(' || NEW.addressable_id || ') is not present in table "' || NEW.addressable_type || '".insert or update on table violates foreign key constraint';
                END IF;                    
        
            RETURN NULL;
            
        END;
        $$ LANGUAGE plpgsql;`);

    await queryRunner.query(`
        CREATE TRIGGER t_check_violations_address
        BEFORE INSERT OR UPDATE 
         ON address
        FOR EACH ROW EXECUTE FUNCTION f_check_violations_address();`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS t_check_violations_address ON address;`
    );

    await queryRunner.query(
      `DROP FUNCTION IF EXISTS f_check_violations_address;`
    );

    await queryRunner.query(`DROP FUNCTION IF EXISTS f_exists_in_table;`);
  }
}
