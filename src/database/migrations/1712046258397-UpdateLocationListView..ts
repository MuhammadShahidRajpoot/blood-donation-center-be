import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateLocationListView1712046258397 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP VIEW IF EXISTS crm_locations_lists_view;');
    await queryRunner.query(`
    CREATE VIEW crm_locations_lists_view AS
        SELECT
            l.id,
            l.created_at,
            l.is_archived,
            l.name,
            l.cross_street,
            l.floor,
            l.room,
            l.room_phone,
            l.site_contact_id,
            l.becs_code,
            l.site_type,
            l.qualification_status,
            l.is_active,
            l.created_by,
            l.tenant_id,
            d.id AS drive_id,
            ac.id AS account_id,
            ac.collection_operation,
            ac.recruiter,
            ad.id AS address_id,
            v.id AS volunteer_id,
            q.id AS qualification_id,
            CASE
                WHEN ad.tenant_id IS NOT NULL THEN jsonb_build_object('addressable_type', ad.addressable_type, 'address1', ad.address1, 'address2', ad.address2, 'zip_code', ad.zip_code, 'city', ad.city, 'state', ad.state, 'country', ad.country, 'county', ad.county, 'coordinates', ad.coordinates, 'tenant_id', ad.tenant_id)
                ELSE NULL::jsonb
            END AS address,
            CASE
                WHEN v.id IS NOT NULL THEN jsonb_build_object('first_name', v.first_name, 'last_name', v.last_name, 'tenant_id', v.tenant_id)
                ELSE NULL::jsonb
            END AS site_contact_info,
            CASE
                WHEN q.location_id IS NOT NULL THEN jsonb_build_object('qualification_date', q.qualification_date, 'qualification_expires', q.qualification_expires, 'tenant_id', q.tenant_id)
                ELSE NULL::jsonb
            END AS qulification_id
        FROM crm_locations l
            LEFT JOIN crm_volunteer v ON v.id = l.site_contact_id AND v.is_archived = false AND l.tenant_id = v.tenant_id
            LEFT JOIN address ad ON l.id = ad.addressable_id AND ad.addressable_type::text = 'crm_locations'::text AND l.tenant_id = ad.tenant_id
            LEFT JOIN qualifications q ON q.location_id = l.id AND q.qualification_status = true AND l.is_archived = false AND l.tenant_id = q.tenant_id
            LEFT JOIN drives d ON d.location_id = l.id AND d.is_archived = false AND d.tenant_id = l.tenant_id
            LEFT JOIN accounts ac ON ac.id = d.account_id AND ac.is_archived = false AND ac.tenant_id = l.tenant_id
        WHERE l.is_archived = false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP VIEW IF EXISTS crm_locations_lists_view;');
    await queryRunner.query(`
    CREATE VIEW public.crm_locations_lists_view
    AS  SELECT crm_locations.id,
        crm_locations.created_at,
        crm_locations.is_archived,
        crm_locations.name,
        crm_locations.cross_street,
        crm_locations.floor,
        crm_locations.room,
        crm_locations.room_phone,
        crm_locations.site_contact_id,
        crm_locations.becs_code,
        crm_locations.site_type,
        crm_locations.qualification_status,
        crm_locations.is_active,
        crm_locations.created_by,
        crm_locations.tenant_id,
            CASE
                WHEN address.tenant_id IS NOT NULL THEN json_build_object('addressable_type', address.addressable_type, 'address1', address.address1, 'address2', address.address2, 'zip_code', address.zip_code, 'city', address.city, 'state', address.state, 'country', address.country, 'county', address.county, 'coordinates', address.coordinates, 'tenant_id', address.tenant_id)
                ELSE NULL::json
            END AS address,
            CASE
                WHEN volunteer.tenant_id IS NOT NULL THEN json_build_object('first_name', volunteer.first_name, 'last_name', volunteer.last_name, 'tenant_id', volunteer.tenant_id)
                ELSE NULL::json
            END AS site_contact_info,
            CASE
                WHEN qualification.tenant_id IS NOT NULL THEN json_build_object('qualification_date', qualification.qualification_date, 'qualification_expires', qualification.qualification_expires, 'tenant_id', qualification.tenant_id)
                ELSE NULL::json
            END AS qulification_id
       FROM crm_locations
         LEFT JOIN crm_volunteer volunteer ON volunteer.id = crm_locations.site_contact_id AND volunteer.is_archived = false AND crm_locations.tenant_id = volunteer.tenant_id
         LEFT JOIN address ON crm_locations.id = address.addressable_id AND address.addressable_type::text = 'crm_locations'::text AND crm_locations.tenant_id = address.tenant_id
         LEFT JOIN qualifications qualification ON qualification.location_id = crm_locations.id AND qualification.qualification_status = true AND crm_locations.is_archived = false AND crm_locations.tenant_id = qualification.tenant_id
      WHERE crm_locations.is_archived = false;
    `);
  }
}
