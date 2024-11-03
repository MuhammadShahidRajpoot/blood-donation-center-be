import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDonorsListsViewQuerry1711515753958
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP VIEW IF EXISTS donors_lists_view;');
    await queryRunner.query(`
                CREATE OR REPLACE VIEW donors_lists_view AS
                SELECT donor.id AS donor_id,
                donor.donor_number,
                concat(donor.first_name, ' ', donor.last_name) AS name,
                donor.first_name,
                donor.last_name,
                address.city AS address_city,
                address.state AS address_state,
                address.county AS address_county,
                phone.data AS primary_phone,
                address.address1,
                address.address2,
                address.zip_code,
                email.data AS primary_email,
                donor.external_id AS donor_uuid,
                donor.last_donation_date AS last_donation,
                donor.tenant_id,
                donor.is_archived,
                blood_groups.name AS blood_group,
                donor.updated_at AS donor_updated_at,
                dgc.group_code_id,
                dcc.center_code_id,
                dac.assertion_code_id
               FROM donors donor
                 LEFT JOIN address address ON address.addressable_id = donor.id AND address.addressable_type::text = 'donors'::text
                 LEFT JOIN contacts phone ON phone.contactable_id = donor.id AND (phone.contact_type = ANY (ARRAY[1, 2, 3])) AND phone.is_primary = true AND phone.contactable_type::text = 'donors'::text
                 LEFT JOIN contacts email ON email.contactable_id = donor.id AND email.is_primary = true AND email.contactable_type::text = 'donors'::text AND (email.contact_type = ANY (ARRAY[4, 5, 6]))
                 LEFT JOIN blood_groups ON blood_groups.id = donor.blood_group_id
                 LEFT JOIN donor_center_codes dcc ON dcc.donor_id = donor.id AND dcc.is_archived = false
                 LEFT JOIN donor_group_codes dgc ON dgc.donor_id = donor.id AND dgc.is_archived = false
                 LEFT JOIN donors_assertion_codes dac ON dac.donor_id = donor.id AND dac.is_archived = false
              GROUP BY donor.id, address.id, email.id, phone.id, blood_groups.id, dgc.id, dcc.id, dac.id;
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP VIEW IF EXISTS donors_list_view;');
  }
}
