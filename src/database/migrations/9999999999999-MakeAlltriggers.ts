// eslint-disable
import { MigrationInterface, QueryRunner } from 'typeorm';
export class MakeAlltriggers9999999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // eslint-disable-next-line
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const filePath = path.join(
      __dirname,
      '../JsonData/seed-history-table.json'
    );
    const dataFile = fs.readFileSync(filePath);
    const seedData = JSON.parse(dataFile);
    const filePathHistory = path.join(
      __dirname,
      '../JsonData/seed-history-table.json'
    );
    const historyFile = fs.readFileSync(filePathHistory);
    const historyTaleSeedData = JSON.parse(historyFile);
    // console.log({ historyTaleSeedData });
    for (const data of historyTaleSeedData?.table_names) {
      console.log(data.name, 'name');

      await queryRunner.query(`
    CREATE OR REPLACE FUNCTION f_${data.name}_history()
    RETURNS TRIGGER AS $$
       DECLARE
    dynamic_columns TEXT;
    column_values TEXT;
    matching_columns TEXT[];
    current_column_name TEXT;
    BEGIN
    -- Get the list of dynamic column names excluding the id
    SELECT STRING_AGG(column_name, ', ')
    INTO dynamic_columns
    FROM information_schema.columns
    WHERE table_name = '${data.name}';

    IF (TG_OP = 'UPDATE') THEN
        -- Construct the dynamic query to fetch all column values from OLD record
        EXECUTE 'SELECT ' || dynamic_columns || ' FROM "${data.name}" WHERE id = $1'
        INTO column_values
        USING OLD.id;

        -- Initialize an array to store matching columns
        matching_columns := '{}';

        -- Iterate over each dynamic column
        FOREACH current_column_name IN ARRAY string_to_array(dynamic_columns, ', ') LOOP
            -- Check if the column exists in the history table
            IF current_column_name = ANY(ARRAY(SELECT column_name FROM information_schema.columns WHERE table_name = '${data.name}_history')) THEN
                -- Add the matching column to the array
                matching_columns := array_append(matching_columns, current_column_name);
            END IF;
        END LOOP;

        -- Use dynamic SQL to insert into ${data.name}_history with explicit columns and values
        EXECUTE 'INSERT INTO ${data.name}_history (' || array_to_string(matching_columns, ', ') || ', history_reason) 
                  SELECT ' || array_to_string(matching_columns, ', ') || ', ''C'' FROM "${data.name}" WHERE id = $1'
        USING OLD.id;
    END IF;

    
    IF (TG_OP = 'DELETE') THEN
        -- Construct the dynamic query to fetch all column values from OLD record
        EXECUTE 'SELECT ' || dynamic_columns || ' FROM "${data.name}" WHERE id = $1'
        INTO column_values
        USING OLD.id;

        -- Initialize an array to store matching columns
        matching_columns := '{}';

        -- Iterate over each dynamic column
        FOREACH current_column_name IN ARRAY string_to_array(dynamic_columns, ', ') LOOP
            -- Check if the column exists in the history table
            IF current_column_name = ANY(ARRAY(SELECT column_name FROM information_schema.columns WHERE table_name = '${data.name}_history')) THEN
                -- Add the matching column to the array
                matching_columns := array_append(matching_columns, current_column_name);
            END IF;
        END LOOP;

        -- Use dynamic SQL to insert into ${data.name}_history with explicit columns and values
        EXECUTE 'INSERT INTO ${data.name}_history (' || array_to_string(matching_columns, ', ') || ', history_reason) 
                  SELECT ' || array_to_string(matching_columns, ', ') || ', ''D'' FROM "${data.name}" WHERE id = $1'
        USING OLD.id;
            RETURN OLD;
    END IF;


    RETURN NEW;
END;

    $$ LANGUAGE plpgsql;
`);

      // Check if the trigger exists
      // const checkTriggerQuery = `
      // SELECT trigger_name
      // FROM information_schema.triggers
      // WHERE trigger_name = 'tr_${data.name}_history';`;

      // const triggerExists = await queryRunner.query(checkTriggerQuery);

      // if (triggerExists.length > 0) {
      //   // Drop the trigger if it exists
      //   const dropTriggerQuery = `DROP TRIGGER tr_${data.name}_history`;
      //   await queryRunner.query(dropTriggerQuery);
      // }
      await queryRunner.query(`DO $$ 
            DECLARE
                trigger_exists BOOLEAN;
            BEGIN
                SELECT EXISTS (
                    SELECT 1
                    FROM information_schema.triggers
                    WHERE trigger_name = 'tr_${data.name}_history'
                ) INTO trigger_exists;

                IF trigger_exists THEN
                    EXECUTE 'DROP TRIGGER IF EXISTS tr_${data.name}_history ON "${data.name}"';
                END IF;
            END $$;
            `);

      // Recreate the trigger

      const createTriggerQuery = `
    CREATE TRIGGER tr_${data.name}_history
    BEFORE UPDATE OR DELETE ON "${data.name}"
    FOR EACH ROW
    EXECUTE FUNCTION f_${data.name}_history();`;

      await queryRunner.query(createTriggerQuery);
    }
  }
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS tr_Address_history ON address;`
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS f_Address_history;`);
  }
}
