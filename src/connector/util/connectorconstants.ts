export class BBCSConstants {
  public static readonly BASE_URL = 'https://recapi.bbcsinc.com:8444/api';
  public static readonly FIND_SPONSOR_GROUP_URL = '/v1/find';
  public static readonly CREATE_SPONSOR_GROUP_URL = '/v1/create';
  public static readonly FIND_DONOR_URL = '/v1/donors/find';
  public static readonly NEW_DONOR_URL = '/v1/donors/new';
  public static readonly EDIT_DONOR_URL = '/v1/donors/modify';
  public static readonly EDIT_DONOR_ADDRESS_URL = '/v1//contact-donors/address';
  public static readonly FIND_DONOR_BY_UUID_URL = '/v1/donors/single';
  public static readonly FIND_DONOR_ELIGIBILITY_URL =
    '/v1/eligibility/categories';
  public static readonly DONOR_SYNC_URL = '/v1/donors';
  public static readonly DONOR_DONATION_SYNC_URL = '/v1/donors/donations';
  public static readonly DONOR_ELIGIBILITY_URL = '/v1/eligibility/star';
  public static readonly MODIFY_DONOR_URL = '/v1/donors/modify';
  public static readonly ACCOUNT_URL = '/v1/schedule/groups';
  public static readonly SINGLE_DONOR = '/v1/donors/single';
  public static readonly SET_DRIVE_URL = '/v1/schedule/drives/set';
  public static readonly SET_SESSION_URL = '/v1/schedule/calendars/set';
  public static readonly SET_SLOTS_URL = '/v1/schedule/slots/set';
  public static readonly SET_APPT_URL = '/v1/schedule/appointments/set';
  public static readonly INITIAL_TIMESTAMP = '1900-01-02T17:51:00Z';
}
