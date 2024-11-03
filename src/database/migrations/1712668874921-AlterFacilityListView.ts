import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterFacilityListView1712668874921 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP VIEW IF EXISTS facility_list_view;');
    await queryRunner.query(`
      CREATE VIEW facility_list_view AS
      SELECT 
        fc.id,
        fc.name,
        fc.alternate_name,
        fc.phone,
        fc.code,
        fc.donor_center,
        fc.staging_site,
        fc.created_at,
        fc.created_by,
        fc.status,
        fc.is_archived,
        fc.tenant_id,
        co.id AS collection_operation_id,
        co.name AS collection_operation,
        ic.id AS industry_category_id,
        ic.name AS industry_category,
        ( SELECT string_agg(isc.name::text, ', '::text) AS string_agg
              FROM facility_industry_sub_category fis
                LEFT JOIN industry_categories isc ON fis.industry_sub_category_id = isc.id
              WHERE fis.facility_id = fc.id) AS industry_sub_category,
        ic.maximum_oef AS maximum_oef,
        ic.minimum_oef AS minimum_oef,
        address.city,
        address.state,
        address.county,
        address.zip_code,
        concat(address.address1, ' ', address.address2) AS physical_address
      FROM facility fc
        LEFT JOIN business_units co ON fc.collection_operation = co.id AND co.tenant_id = fc.tenant_id
        LEFT JOIN industry_categories ic ON fc.industry_category = ic.id AND ic.tenant_id = fc.tenant_id
        LEFT JOIN address ON address.addressable_id = fc.id AND address.addressable_type::text = 'facility'::text AND address.tenant_id = fc.tenant_id;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP VIEW IF EXISTS facility_list_view;');
    await queryRunner.query(`
      CREATE VIEW facility_list_view AS
      SELECT fc.id,
        fc.name,
        fc.alternate_name,
        fc.phone,
        fc.code,
        fc.donor_center,
        fc.staging_site,
        fc.created_at,
        fc.created_by,
        fc.status,
        fc.is_archived,
        fc.tenant_id,
        co.id AS collection_operation_id,
        co.name AS collection_operation,
        ic.id AS industry_category_id,
        ic.name AS industry_category,
        ( SELECT string_agg(isc.name::text, ', '::text) AS string_agg
              FROM facility_industry_sub_category fis
                LEFT JOIN industry_categories isc ON fis.industry_sub_category_id = isc.id
              WHERE fis.facility_id = fc.id) AS industry_sub_category,
        address.city,
        address.state,
        address.county,
        address.zip_code,
        concat(address.address1, ' ', address.address2) AS physical_address
      FROM facility fc
        LEFT JOIN business_units co ON fc.collection_operation = co.id AND co.tenant_id = fc.tenant_id
        LEFT JOIN industry_categories ic ON fc.industry_category = ic.id AND ic.tenant_id = fc.tenant_id
        LEFT JOIN address ON address.addressable_id = fc.id AND address.addressable_type::text = 'facility'::text AND address.tenant_id = fc.tenant_id;
  `);
  }
}
