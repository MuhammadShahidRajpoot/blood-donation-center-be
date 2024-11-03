import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterColumnBECSCodeAddVarCharCRMLocations1711713134992
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE crm_locations RENAME COLUMN "becs_code_varchar" TO "becs_code"'
    );

    await queryRunner.query(`
      CREATE OR REPLACE VIEW crm_locations_lists_view AS
      SELECT crm_locations.id,
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
        WHEN address.tenant_id IS NOT NULL THEN
        Json_build_object('addressable_type', address.addressable_type,
        'address1',
        address.address1, 'address2', address.address2, 'zip_code',
        address.zip_code,
        'city',
        address.city, 'state', address.state, 'country', address.country,
        'county',
        address.county, 'coordinates', address.coordinates, 'tenant_id',
        address.tenant_id)
        ELSE NULL
      END AS address,
      CASE
        WHEN volunteer.tenant_id IS NOT NULL THEN
        Json_build_object('first_name', volunteer.first_name, 'last_name',
        volunteer.last_name, 'tenant_id',
        volunteer.tenant_id)
        ELSE NULL
      END AS site_contact_info,
      CASE
        WHEN qualification.tenant_id IS NOT NULL THEN
        Json_build_object('qualification_date',
        qualification.qualification_date,
        'qualification_expires', qualification.qualification_expires,
        'tenant_id',
        qualification.tenant_id)
        ELSE NULL
      END AS qulification_id
      FROM   crm_locations
      left join crm_volunteer volunteer
              ON volunteer.id = crm_locations.site_contact_id
                AND volunteer.is_archived = FALSE
                AND crm_locations.tenant_id = volunteer.tenant_id
      left join address
              ON crm_locations.id = address.addressable_id
                AND address.addressable_type :: text = 'crm_locations' :: text
                AND crm_locations.tenant_id = address.tenant_id
      left join qualifications qualification
              ON qualification.location_id = crm_locations.id
                AND qualification.qualification_status = TRUE
                AND crm_locations.is_archived = FALSE
                AND crm_locations.tenant_id = qualification.tenant_id
      WHERE crm_locations.is_archived = FALSE 
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP VIEW IF EXISTS crm_locations_lists_view;');

    await queryRunner.query(
      'ALTER TABLE crm_locations RENAME COLUMN "becs_code" TO "becs_code_varchar"'
    );
  }
}
