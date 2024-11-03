import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity('ds_webhook_donors')
export class DSDonorsViewList {
  @ViewColumn()
  donor_id: bigint;

  @ViewColumn()
  donor_number: number;

  @ViewColumn()
  name: string;

  @ViewColumn()
  first_name: string;

  @ViewColumn()
  last_name: string;

  @ViewColumn()
  geo_code: string;

  @ViewColumn()
  gender: string;

  @ViewColumn()
  external_id: string;

  @ViewColumn()
  appointment_date: Date;

  @ViewColumn()
  next_recruit_date: Date;

  @ViewColumn()
  address_city: string;

  @ViewColumn()
  address_state: string;

  @ViewColumn()
  address_county: string;

  @ViewColumn()
  address_country: string;

  @ViewColumn()
  primary_phone: string;

  @ViewColumn()
  address1: string;

  @ViewColumn()
  address2: string;
  @ViewColumn()
  blood_group: string;

  @ViewColumn()
  zip_code: string;

  @ViewColumn()
  primary_email: string;

  @ViewColumn()
  donor_uuid: string;

  @ViewColumn()
  last_donation: Date;

  @ViewColumn()
  updated_at: Date;

  @ViewColumn()
  birth_date: Date;

  @ViewColumn()
  tenant_id: bigint;

  @ViewColumn()
  is_archived: boolean;
  @ViewColumn()
  status: boolean;

  @ViewColumn()
  is_optout_email: boolean;
  @ViewColumn()
  is_optout_sms: boolean;
  @ViewColumn()
  is_optout_push: boolean;
  @ViewColumn()
  is_optout_call: boolean;

  @ViewColumn()
  contact_uuid: string;

  @ViewColumn()
  wholeBloodEligibilityDate: Date;

  @ViewColumn()
  wholeBloodLastDonatedDate: Date;

  @ViewColumn()
  wholeBloodDonationsLifetime: number;

  @ViewColumn()
  wholeBloodDonationsYearTodate: number;

  @ViewColumn()
  wholeBloodDonationsLastyear: number;

  @ViewColumn()
  wholeBloodDonationsNextEligibilityDate: Date;

  @ViewColumn()
  plateletEligibilityDate: Date;

  @ViewColumn()
  plateletLastDonatedDate: Date;

  @ViewColumn()
  plateletDonationsLifetime: number;

  @ViewColumn()
  plateletDonationsYearTodate: number;

  @ViewColumn()
  plateletDonationsLastyear: number;

  @ViewColumn()
  plateletDonationsNextEligibilityDate: Date;

  @ViewColumn()
  dredEligibilityDate: Date;

  @ViewColumn()
  dredLastDonatedDate: Date;

  @ViewColumn()
  dredDonationsLifetime: number;

  @ViewColumn()
  dredDonationsYearTodate: number;

  @ViewColumn()
  dredDonationsLastyear: number;

  @ViewColumn()
  dredDonationsNextEligibilityDate: Date;

  @ViewColumn()
  ccpEligibilityDate: Date;

  @ViewColumn()
  ccpLastDonatedDate: Date;

  @ViewColumn()
  ccpDonationsLifetime: number;

  @ViewColumn()
  ccpDonationsYearTodate: number;

  @ViewColumn()
  ccpDonationsLastyear: number;

  @ViewColumn()
  ccpDonationsNextEligibilityDate: Date;
}
