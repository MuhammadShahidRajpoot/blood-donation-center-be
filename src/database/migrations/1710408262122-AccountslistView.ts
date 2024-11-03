import { MigrationInterface, QueryRunner } from 'typeorm';

export class AccountslistView1710408262122 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE OR REPLACE VIEW accounts_lists_view AS
            SELECT
                a.id as account_id,
                a.is_archived,
                a.name,
                a.alternate_name,
                a.phone,
                a.website,
                a.facebook,
                address.city,
                address.state,
                address.county,
                ic.id AS industry_category_id,
                ic.name AS industry_category_name,
                isc.id AS industry_subcategory_id,
                isc.name AS industry_subcategory_name,
                s.id AS stage_id,
                s.name AS stage_name,
                src.id AS source_id,
                src.name AS source_name,
                a.becs_code,
                bu.id AS collection_operation_id,
                bu.name AS collection_operation_name,
                u.id AS recruiter_id,
                concat(u.first_name, ' ', u.last_name) AS recruiter_name,
                t.id AS territory_id,
                t.territory_name AS territory_name,
                a.population,
                a.is_active,
                a.rsmo,
                a.tenant_id
            FROM
                accounts a
            LEFT JOIN industry_categories ic ON a.industry_category = ic.id AND ic.is_archive=false
            LEFT JOIN industry_categories isc ON a.industry_subcategory = isc.id AND isc.is_archive=false
            LEFT JOIN stages s ON a.stage = s.id AND s.is_archived=false
            LEFT JOIN sources src ON a.source = src.id
            LEFT JOIN business_units bu ON a.collection_operation = bu.id
            LEFT JOIN "user" u ON a.recruiter = u.id AND u.is_archived=false
            LEFT JOIN territory t ON a.territory = t.id
            LEFT JOIN address ON address.addressable_id = a.id AND address.addressable_type::text = 'accounts'::text;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP VIEW IF EXISTS accounts_lists_view;');
  }
}
