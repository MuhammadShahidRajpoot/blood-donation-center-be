import { MigrationInterface, QueryRunner } from "typeorm";

export class VolunteerListViewQuery1710405878786 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE VIEW volunteers_list_view AS
            SELECT
                volunteer.id AS volunteer_id,
                volunteer.tenant_id,
                volunteer.nick_name,
                concat(volunteer.first_name, ' ', volunteer.last_name) AS name,
                volunteer.first_name,
                volunteer.last_name,
                volunteer.birth_date,
                volunteer.is_active AS status,
                address.id AS address_id,
                address.city AS address_city,
                address.state AS address_state,
                address.county AS address_county,
                phone.id AS phone_id,
                phone.data AS primary_phone,
                email.id AS email_id,
                email.data AS primary_email,
                volunteer.is_archived,
                volunteer.contact_uuid,
                volunteer.created_by,
                ac.id AS account_contacts_id,
                ac.record_id AS account_volunteer_id,
                ac.contactable_id AS account_contacts_able_id,
                ac.contactable_type AS account_contacts_able_type,
                acc.id AS accounts_id,
                acc.collection_operation,
                acc.recruiter
            FROM
                crm_volunteer volunteer
            LEFT JOIN
                address ON address.addressable_id = volunteer.id AND address.addressable_type::text = 'crm_volunteer'::text
            LEFT JOIN
                contacts phone ON phone.contactable_id = volunteer.id AND phone.is_archived = false AND (phone.contact_type = ANY (ARRAY[1, 2, 3])) AND phone.is_primary = true AND phone.contactable_type::text = 'crm_volunteer'::text
            LEFT JOIN
                contacts email ON email.contactable_id = volunteer.id AND email.is_archived = false AND email.is_primary = true AND email.contactable_type::text = 'crm_volunteer'::text AND (email.contact_type = ANY (ARRAY[4, 5, 6]))
            LEFT JOIN
                account_contacts ac ON ac.record_id = volunteer.id AND ac.is_archived = false
            LEFT JOIN
                accounts acc ON acc.id = ac.contactable_id AND acc.is_archived = false
            GROUP BY
                volunteer.id, address.id, email.id, phone.id, ac.id, acc.id;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP VIEW IF EXISTS volunteers_list_view;");
    }
}
