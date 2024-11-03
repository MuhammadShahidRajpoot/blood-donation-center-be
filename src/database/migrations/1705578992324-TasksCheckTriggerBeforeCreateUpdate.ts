import { MigrationInterface, QueryRunner } from 'typeorm';

export class TasksCheckTriggerBeforeCreateUpdate1705578992324
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE OR REPLACE FUNCTION f_check_violations_tasks()
          RETURNS TRIGGER AS $$
          BEGIN
              IF (NOT f_exists_in_table(NEW.taskable_type, NEW.taskable_id)) THEN
                  RAISE EXCEPTION '%', 'Key (taskable_id)=(' || NEW.taskable_id || ') is not present in table "' || NEW.taskable_type || '". Insert or update on table violates foreign key constraint';
              END IF;
              RETURN NULL;
          END;
          $$ LANGUAGE plpgsql;
        `);

    await queryRunner.query(`
          CREATE TRIGGER t_check_violations_tasks
          BEFORE INSERT OR UPDATE 
          ON tasks
          FOR EACH ROW EXECUTE FUNCTION f_check_violations_tasks();
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          DROP TRIGGER IF EXISTS t_check_violations_tasks ON tasks;
        `);

    await queryRunner.query(`
          DROP FUNCTION IF EXISTS f_check_violations_tasks;
        `);
  }
}
