import { MigrationInterface, QueryRunner } from "typeorm";

export class StaffViewList1711359757317 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE VIEW staff_list_view AS
            SELECT 
                "staff"."id" AS staff_id,
                "staff"."collection_operation_id" AS collection_operation_id,
                "staff"."classification_id" AS classification_id,
                CONCAT("staff"."first_name", ' ', "staff"."last_name") AS name, 
                "staff"."first_name" AS first_name, 
                "staff"."last_name" AS last_name, 
                "staff"."birth_date" AS birth_date, 
                "address"."city" AS address_city, 
                "address"."county" AS address_county, 
                "address"."state" AS address_state, 
                STRING_AGG(DISTINCT "phone"."data", ', ') AS primary_phone, 
                STRING_AGG(DISTINCT "email"."data", ', ') AS primary_email, 
                "collection_operation"."name" AS collection_operation_name, 
                "classification"."name" AS classification_name, 
                "staff"."is_active" AS status, 
                "staff"."contact_uuid" AS contact_uuid, 
                "staff"."tenant_id" AS tenant_id, 
                SUM("agent"."assigned_calls") AS total_calls,
                STRING_AGG(DISTINCT team.name, ', ') AS teams,
                ARRAY_AGG(team.id) AS team_ids,
                STRING_AGG(DISTINCT "staff_role"."name", ', ') AS roles,
                ARRAY_AGG(staff_role.id) AS role_ids,
                STRING_AGG(DISTINCT primary_staff_role.name, ', ') AS primary_roles,
                STRING_AGG(DISTINCT other_staff_role.name, ', ') AS other_roles,
                "agent"."date" AS agent_date,
                STRING_AGG(staff_certification.name, ', ') AS certifications,
                ARRAY_AGG(staff_facility.id) AS staff_donor_center_facility_ids,
                ARRAY_AGG(staff_certification.id) AS staff_certification_ids,
                "staff"."is_archived" AS is_archived
            FROM 
                "staff" 
            LEFT JOIN 
                "business_units" "collection_operation" ON "collection_operation"."id" = "staff"."collection_operation_id"  
            LEFT JOIN 
                "staffing_classification" "classification" ON "classification"."id" = "staff"."classification_id" 
                    AND ("classification"."is_archived" = false)  
            LEFT JOIN 
                    "address" "address" ON "address"."addressable_id" = "staff"."id" 
                AND ("address"."addressable_type" = 'staff')  
            LEFT JOIN 
                "contacts" "phone" ON "phone"."contactable_id" = "staff"."id" 
                    AND ("phone"."is_primary" = true AND "phone"."contactable_type" = 'staff' AND "phone"."contact_type" = ANY (ARRAY[1, 2, 3]))  
            LEFT JOIN 
                "contacts" "email" ON "email"."contactable_id" = "staff"."id" 
                    AND ("email"."is_primary" = true AND "email"."contactable_type" = 'staff' AND "email"."contact_type" = ANY (ARRAY[4, 5, 6]))  
            LEFT JOIN 
                "call_jobs_agents" "agent" ON "agent"."staff_id" = "staff"."id"
            LEFT join
                "team_staff" "teams" ON teams.staff_id = staff.id
            LEFT join
                "team" ON teams.team_id = team.id AND team.is_archived = false AND team.deleted_at IS NULL
            LEFT JOIN 
                "staff_roles_mapping" "staff_roles" ON staff_roles.staff_id = staff.id  AND ("staff_roles"."is_archived" = FALSE) 
            LEFT join
                "contacts_roles" "staff_role" ON "staff_role"."id" = "staff_roles"."role_id" AND ("staff_role"."is_archived" = FALSE)
            LEFT JOIN 
                "staff_roles_mapping" "primary_roles" ON "primary_roles"."staff_id" = "staff"."id" AND ("primary_roles"."is_primary" = TRUE)  AND               ("primary_roles"."is_archived" = FALSE)
            LEFT JOIN 
                "contacts_roles" "primary_staff_role" ON "primary_staff_role"."id" = "primary_roles"."role_id" AND ("primary_staff_role"."is_archived" = FALSE)
            LEFT JOIN 
                "staff_roles_mapping" "other_roles" ON "other_roles"."staff_id" = "staff"."id" AND ("other_roles"."is_primary" = FALSE)  AND             ("other_roles"."is_archived" = FALSE)
            LEFT JOIN 
                "contacts_roles" "other_staff_role" ON "other_staff_role"."id" = "other_roles"."role_id" AND ("other_staff_role"."is_archived" = FALSE)
            LEFT JOIN 
                "staff_donor_centers_mapping" "staff_donor_centers" ON "staff_donor_centers"."staff_id" = "staff"."id" AND ("staff_donor_centers"."is_archived" = FALSE)
            LEFT JOIN 
                "facility" "staff_facility" ON "staff_facility"."id" = "staff_donor_centers"."donor_center_id" AND ("staff_facility"."is_archived" = FALSE)
            LEFT JOIN 
                "staff_certification" "staff_certifications" ON "staff_certifications"."staff_id" = "staff"."id" AND ("staff_certifications"."is_archived" = FALSE)
            LEFT JOIN 
                "certification" "staff_certification" ON "staff_certification"."id" = "staff_certifications"."certificate_id"
            GROUP By 
                "staff"."id", "address"."city", "address"."county",  "address"."state", "collection_operation"."name", "classification"."name", "agent"."date"
                `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP VIEW IF EXISTS staff_list_view;');
  }
}
