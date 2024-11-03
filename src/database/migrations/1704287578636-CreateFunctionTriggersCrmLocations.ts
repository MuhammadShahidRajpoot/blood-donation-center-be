import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFunctionTriggersCrmLocations1704287578636
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE OR REPLACE FUNCTION f_crm_locations_history()
            RETURNS TRIGGER AS $$
            BEGIN
            
                IF (TG_OP = 'UPDATE') THEN
                    IF (NOT OLD.is_archived AND NEW.is_archived ) THEN
                        
                        INSERT INTO crm_locations_history ( id, created_at, is_archived, created_by, history_reason, name, cross_street, floor, room, room_phone, site_contact_id, becs_code, site_type, is_active, tenant_id)
                        VALUES ( OLD.id, CURRENT_TIMESTAMP, OLD.is_archived, NEW.created_by, 'C', OLD.name, OLD.cross_street, OLD.floor, OLD.room, OLD.room_phone, OLD.site_contact_id, OLD.becs_code, OLD.site_type, OLD.is_active, OLD.tenant_id);
                       
                        INSERT INTO crm_locations_history ( id, created_at, is_archived, created_by, history_reason, name, cross_street, floor, room, room_phone, site_contact_id, becs_code, site_type, is_active, tenant_id)
                        VALUES ( NEW.id,CURRENT_TIMESTAMP, NEW.is_archived, NEW.created_by, 'D', NEW.name, NEW.cross_street, NEW.floor, NEW.room, NEW.room_phone, NEW.site_contact_id, NEW.becs_code, NEW.site_type, NEW.is_active, NEW.tenant_id);
                        
                    
                        UPDATE crm_locations_specs SET is_archived = TRUE, created_by = NEW.created_by WHERE location_id = NEW.id;
            
                    ELSE
                        INSERT INTO crm_locations_history ( id, created_at, is_archived, created_by, history_reason, name, cross_street, floor, room, room_phone, site_contact_id, becs_code, site_type, is_active, tenant_id)
                        VALUES ( OLD.id, CURRENT_TIMESTAMP, OLD.is_archived, NEW.created_by, 'C', OLD.name, OLD.cross_street, OLD.floor, OLD.room, OLD.room_phone, OLD.site_contact_id, OLD.becs_code, OLD.site_type, OLD.is_active, OLD.tenant_id);
                    END IF;
                    
                    UPDATE crm_locations set created_by = OLD.created_by;
                    
                END IF;
            
                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql;`
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS t_crm_locations_history ON crm_locations;
      CREATE TRIGGER t_crm_locations_history
        AFTER UPDATE OF 
            created_at,
            is_archived,
            name,
            cross_street,
            floor,
            room,
            room_phone,
            site_contact_id,
            becs_code,
            site_type,
            qualification_status,
            is_active,
            tenant_id
         ON crm_locations
        FOR EACH ROW EXECUTE FUNCTION f_crm_locations_history();`
    );

    await queryRunner.query(`CREATE OR REPLACE FUNCTION f_crm_locations_specs_history()
    RETURNS TRIGGER AS $$
    BEGIN
        IF (TG_OP = 'UPDATE') THEN
            IF (NOT OLD.is_archived AND NEW.is_archived) THEN
                
                INSERT INTO crm_locations_specs_history ( id, created_at, is_archived, created_by, history_reason, room_size_id, elevator, inside_stairs, outside_stairs, location_id, tenant_id, electrical_note, special_instructions ) 
                VALUES ( OLD.id, CURRENT_TIMESTAMP, OLD.is_archived, OLD.created_by, 'C', OLD.room_size_id, OLD.elevator, OLD.inside_stairs, OLD.outside_stairs, OLD.location_id, OLD.tenant_id, OLD.electrical_note, OLD.special_instructions);
    
                INSERT INTO crm_locations_specs_history ( id, created_at, is_archived, created_by, history_reason, room_size_id, elevator, inside_stairs, outside_stairs, location_id, tenant_id, electrical_note, special_instructions ) 
                VALUES ( NEW.id, CURRENT_TIMESTAMP, NEW.is_archived, NEW.created_by, 'D', NEW.room_size_id, NEW.elevator, NEW.inside_stairs, NEW.outside_stairs, NEW.location_id, NEW.tenant_id, NEW.electrical_note, NEW.special_instructions);
                
                UPDATE crm_locations_specs_options SET is_archived = TRUE, created_by = NEW.created_by WHERE location_specs_id = NEW.id;
            ELSE
                -- Logic if conditions don't meet the archiving requirement
                INSERT INTO crm_locations_specs_history ( id, created_at, is_archived, created_by, history_reason, room_size_id, elevator, inside_stairs, outside_stairs, location_id, tenant_id, electrical_note, special_instructions ) 
                VALUES ( OLD.id, CURRENT_TIMESTAMP, OLD.is_archived, NEW.created_by, 'C', OLD.room_size_id, OLD.elevator, OLD.inside_stairs, OLD.outside_stairs, OLD.location_id, OLD.tenant_id, OLD.electrical_note, OLD.special_instructions );
            END IF;
            UPDATE crm_locations_specs set created_by = OLD.created_by;
            
        END IF;
    
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;`);
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS t_crm_locations_specs_history ON crm_locations_specs;
      CREATE TRIGGER t_crm_locations_specs_history
      AFTER UPDATE OF
          created_at,
          is_archived,
          room_size_id,
          elevator,
          inside_stairs,
          outside_stairs,
          location_id,
          tenant_id,
          special_instructions,
          electrical_note
      ON crm_locations_specs
      FOR EACH ROW EXECUTE FUNCTION f_crm_locations_specs_history();`
    );

    await queryRunner.query(`CREATE OR REPLACE FUNCTION f_crm_locations_specs_options_history()
    RETURNS TRIGGER AS $$
    BEGIN
        IF (TG_OP = 'UPDATE') THEN
            IF (NOT OLD.is_archived AND NEW.is_archived) THEN
            
                INSERT INTO public.crm_locations_specs_options_history ( id, created_at, is_archived, created_by, history_reason, location_specs_id, specs_key, specs_value, tenant_id ) 
                VALUES ( OLD.id, CURRENT_TIMESTAMP, OLD.is_archived, OLD.created_by, 'C', OLD.location_specs_id, OLD.specs_key, OLD.specs_value, OLD.tenant_id );
    
                INSERT INTO public.crm_locations_specs_options_history ( id, created_at, is_archived, created_by, history_reason, location_specs_id, specs_key, specs_value, tenant_id ) 
                VALUES ( NEW.id, CURRENT_TIMESTAMP, NEW.is_archived, NEW.created_by, 'D', NEW.location_specs_id, NEW.specs_key, NEW.specs_value, NEW.tenant_id );
            ELSE
                INSERT INTO public.crm_locations_specs_options_history ( id, created_at, is_archived, created_by, history_reason, location_specs_id, specs_key, specs_value, tenant_id ) 
                VALUES ( OLD.id, CURRENT_TIMESTAMP, OLD.is_archived, NEW.created_by, 'C', OLD.location_specs_id, OLD.specs_key, OLD.specs_value, OLD.tenant_id );
            END IF;
            UPDATE crm_locations_specs_options set created_by = OLD.created_by;
        END IF;
    
        RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;`);
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS t_crm_locations_specs_options_history ON crm_locations_specs_options;
      CREATE TRIGGER t_crm_locations_specs_options_history
      AFTER UPDATE OF
          created_at,
          is_archived,
          specs_key,
          specs_value,
          location_specs_id,
          tenant_id
      ON crm_locations_specs_options
      FOR EACH ROW EXECUTE FUNCTION f_crm_locations_specs_options_history();`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS t_crm_locations_history ON crm_locations;`
    );
    await queryRunner.query(`DROP FUNCTION IF EXISTS f_crm_locations_history;`);

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS t_crm_locations_specs_history ON crm_locations_specs;`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS f_crm_locations_specs_history;`
    );

    await queryRunner.query(
      `DROP TRIGGER IF EXISTS t_crm_locations_specs_options_history ON crm_locations_specs_options;`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS f_crm_locations_specs_options_history;`
    );
  }
}
