import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrmAttachmentsCheckTriggerBeforeCreateUpdate1705578898668
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE OR REPLACE FUNCTION f_check_violations_attachmentable()
          RETURNS TRIGGER AS $$
          BEGIN
              IF (NOT f_exists_in_table(NEW.attachmentable_type, NEW.attachmentable_id)) THEN
                  RAISE EXCEPTION '%', 'Key (attachmentable_id)=(' || NEW.attachmentable_id || ') is not present in table "' || NEW.attachmentable_type || '". Insert or update on table violates foreign key constraint';
              END IF;
              RETURN NULL;
          END;
          $$ LANGUAGE plpgsql;
        `);

    await queryRunner.query(`
          CREATE TRIGGER t_check_violations_attachmentable
          BEFORE INSERT OR UPDATE 
          ON crm_attachments
          FOR EACH ROW EXECUTE FUNCTION f_check_violations_attachmentable();
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          DROP TRIGGER IF EXISTS t_check_violations_attachmentable ON crm_attachments;
        `);

    await queryRunner.query(`
          DROP FUNCTION IF EXISTS f_check_violations_attachmentable;
        `);
  }
}
