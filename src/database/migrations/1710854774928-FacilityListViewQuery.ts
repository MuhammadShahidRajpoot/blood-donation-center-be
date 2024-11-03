import { MigrationInterface, QueryRunner } from "typeorm";

export class FacilityListViewQuery1710854774928 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE VIEW facility_list_view AS
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
            co.id as collection_operation_id,
            co.name as collection_operation,
            ic.id as industry_category_id,
            ic.name as industry_category,
            (
                SELECT STRING_AGG(isc.name, ', ')
                FROM facility_industry_sub_category AS fis
                LEFT JOIN industry_categories AS isc ON fis.industry_sub_category_id = isc.id
                WHERE fis.facility_id = fc.id
            ) AS industry_sub_category,
            address.city,
            address.state,
            address.county,
            address.zip_code,
            CONCAT(address.address1, ' ', address.address2) as physical_address
        
            FROM
                facility fc
        
            LEFT JOIN business_units AS co ON fc.collection_operation = co.id AND co.tenant_id=fc.tenant_id
            LEFT JOIN industry_categories AS ic ON fc.industry_category = ic.id AND ic.tenant_id=fc.tenant_id
            LEFT JOIN address ON address.addressable_id = fc.id AND address.addressable_type::text = 'facility'::text AND address.tenant_id=fc.tenant_id
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP VIEW IF EXISTS facility_list_view;");
    }

}
