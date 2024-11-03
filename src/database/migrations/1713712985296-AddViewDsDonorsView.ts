import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddViewDsDonorsView1713712985296 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('DROP VIEW IF EXISTS ds_webhook_donors');
    queryRunner.query(`
drop view if EXISTS public."ds_webhook_donors" ;
create or replace
view public."ds_webhook_donors"
as
select
	distinct donor.id as donor_id,
	donor.donor_number,
	concat(donor.first_name,
	' ',
	donor.last_name) as name,
	donor.first_name,
	donor.last_name,
	donor.updated_at,
	donor.birth_date,
	donor.geo_code,
	donor.gender,
	donor.appointment_date,
	donor.next_recruit_date,
	address.city as address_city,
	address.state as address_state,
	address.county as address_county,
	max(phone.data::text) as primary_phone,
	address.address1,
	address.address2,
	address.zip_code,
	max(email.data::text) as primary_email,
	donor.external_id as donor_uuid,
	donor.last_donation_date as last_donation,
	donor.tenant_id,
	donor.is_archived,
	blood_groups.name as blood_group,
	donor.is_active as status,
	donor.external_id,
	donor.contact_uuid as contact_uuid,
	address.country  as address_country,
	max(
        case
            when procedure_types.becs_product_category::text = '*ZWB'::text then donors_eligibilities.created_at
            else null::timestamp without time zone
        end) as "wholeBloodEligibilityDate",
	max(
        case
            when procedure_types.becs_product_category::text = '*ZWB'::text then donors_eligibilities.donation_date
            else null::date
        end) as "wholeBloodLastDonatedDate",
	max(
        case
            when procedure_types.becs_product_category::text = '*ZWB'::text then donors_eligibilities.donation_ltd
            else null::integer
        end) as "wholeBloodDonationsLifetime",
	max(
        case
            when procedure_types.becs_product_category::text = '*ZWB'::text then donors_eligibilities.donation_ytd
            else null::integer
        end) as "wholeBloodDonationsYearTodate",
	max(
        case
            when procedure_types.becs_product_category::text = '*ZWB'::text then donors_eligibilities.donation_last_year
            else null::integer
        end) as "wholeBloodDonationsLastyear",
	max(
        case
            when procedure_types.becs_product_category::text = '*ZWB'::text then donors_eligibilities.next_eligibility_date
            else null::date
        end) as "wholeBloodDonationsNextEligibilityDate",
	max(
        case
            when procedure_types.becs_product_category::text = '*PLT'::text then donors_eligibilities.created_at
            else null::timestamp without time zone
        end) as "plateletEligibilityDate",
	max(
        case
            when procedure_types.becs_product_category::text = '*PLT'::text then donors_eligibilities.donation_date
            else null::date
        end) as "plateletLastDonatedDate",
	max(
        case
            when procedure_types.becs_product_category::text = '*PLT'::text then donors_eligibilities.donation_ltd
            else null::integer
        end) as "plateletDonationsLifetime",
	max(
        case
            when procedure_types.becs_product_category::text = '*PLT'::text then donors_eligibilities.donation_ytd
            else null::integer
        end) as "plateletDonationsYearTodate",
	max(
        case
            when procedure_types.becs_product_category::text = '*PLT'::text then donors_eligibilities.donation_last_year
            else null::integer
        end) as "plateletDonationsLastyear",
	max(
        case
            when procedure_types.becs_product_category::text = '*PLT'::text then donors_eligibilities.next_eligibility_date
            else null::date
        end) as "plateletDonationsNextEligibilityDate",
	max(
        case
            when procedure_types.becs_product_category::text = '*2R'::text then donors_eligibilities.created_at
            else null::timestamp without time zone
        end) as "dredEligibilityDate",
	max(
        case
            when procedure_types.becs_product_category::text = '*2R'::text then donors_eligibilities.donation_date
            else null::date
        end) as "dredLastDonatedDate",
	max(
        case
            when procedure_types.becs_product_category::text = '*2R'::text then donors_eligibilities.donation_ltd
            else null::integer
        end) as "dredDonationsLifetime",
	max(
        case
            when procedure_types.becs_product_category::text = '*2R'::text then donors_eligibilities.donation_ytd
            else null::integer
        end) as "dredDonationsYearTodate",
	max(
        case
            when procedure_types.becs_product_category::text = '*2R'::text then donors_eligibilities.donation_last_year
            else null::integer
        end) as "dredDonationsLastyear",
	max(
        case
            when procedure_types.becs_product_category::text = '*2R'::text then donors_eligibilities.next_eligibility_date
            else null::date
        end) as "dredDonationsNextEligibilityDate",
	max(
        case
            when procedure_types.becs_product_category::text = '*PLS'::text then donors_eligibilities.created_at
            else null::timestamp without time zone
        end) as "ccpEligibilityDate",
	max(
        case
            when procedure_types.becs_product_category::text = '*PLS'::text then donors_eligibilities.donation_date
            else null::date
        end) as "ccpLastDonatedDate",
	max(
        case
            when procedure_types.becs_product_category::text = '*PLS'::text then donors_eligibilities.donation_ltd
            else null::integer
        end) as "ccpDonationsLifetime",
	max(
        case
            when procedure_types.becs_product_category::text = '*PLS'::text then donors_eligibilities.donation_ytd
            else null::integer
        end) as "ccpDonationsYearTodate",
	max(
        case
            when procedure_types.becs_product_category::text = '*PLS'::text then donors_eligibilities.donation_last_year
            else null::integer
        end) as "ccpDonationsLastyear",
	max(
        case
            when procedure_types.becs_product_category::text = '*PLS'::text then donors_eligibilities.next_eligibility_date
            else null::date
        end) as "ccpDonationsNextEligibilityDate",
        
      cp.is_optout_email as is_optout_email,
      cp.is_optout_sms as is_optout_sms,
      cp.is_optout_push as is_optout_push,
      cp.is_optout_call as is_optout_call
          
   FROM donors donor
     LEFT JOIN address address ON address.addressable_id = donor.id AND address.addressable_type::text = 'donors'::text
     LEFT JOIN contacts phone ON phone.contactable_id = donor.id AND (phone.contact_type = ANY (ARRAY[1, 2, 3])) AND phone.is_primary = true AND phone.contactable_type::text = 'donors'::text
     LEFT JOIN contacts email ON email.contactable_id = donor.id AND email.is_primary = true AND email.contactable_type::text = 'donors'::text AND (email.contact_type = ANY (ARRAY[4, 5, 6]))
     LEFT JOIN blood_groups ON blood_groups.id = donor.blood_group_id
     LEFT JOIN donors_eligibilities ON donors_eligibilities.donor_id = donor.id
     LEFT JOIN procedure_types ON donors_eligibilities.donation_type = procedure_types.id
     left join contact_preferences cp on cp.id = donor.id AND cp.contact_preferenceable_type = 'donors'

  GROUP BY donor.id, address.id, blood_groups.id,cp.is_optout_email,cp.is_optout_sms,cp.is_optout_push,cp.is_optout_call;
    
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('DROP VIEW IF EXISTS ds_webhook_donors');
  }
}
