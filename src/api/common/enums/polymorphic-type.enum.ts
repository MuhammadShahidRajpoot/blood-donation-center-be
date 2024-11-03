export enum PolymorphicType {
  SC_ORG_ADMIN_FACILITY = 'facility', //SC -> Organizational Administration -> Resource Managment -> Facilities
  SC_TENANT = 'tenant', //SC -> Tenant Managment -> Tenant
  CRM_ACCOUNTS = 'accounts', // CRM -> Accounts
  CRM_LOCATIONS = 'crm_locations', // CRM -> Locations
  CRM_CONTACTS_STAFF = 'staff', //  CRM -> Contacts -> Staff
  CRM_CONTACTS_VOLUNTEERS = 'crm_volunteer', // CRM -> Contacts -> Volunteer
  CRM_CONTACTS_DONORS = 'donors', //  CRM -> Contacts -> Donors
  CRM_DONOR_CENTERS = 'donor_centers', // CRM -> Donor Centers
  CRM_DONOR_CENTERS_BLUEPRINTS = 'donor_center_blueprints', //CRM -> Donor Centers -> View -> Blueprints
  CRM_NON_COLLECTION_PROFILES = 'crm_non_collection_profiles', // CRM -> Non-Collection Profile
  CRM_NON_COLLECTION_PROFILES_BLUEPRINTS = 'crm_ncp_blueprints', //CRM -> Non-Collection Profile
  OC_OPERATIONS_DRIVES = 'drives', //  OC -> Operations -> Drives
  OC_OPERATIONS_SESSIONS = 'sessions', //  OC -> Operations -> Sessions
  OC_OPERATIONS_NON_COLLECTION_EVENTS = 'oc_non_collection_events', //  OC -> Operations -> Non Collection Events
}

export enum BloodType {
  APOS = 'A positive',
  BPOS = 'B positive',
  ABNG = 'AB negative',
  ABPS = 'AB positive',
  ANEG = 'A negative',
  BNEG = 'B negative',
  ONEG = 'O negative',
  OPOS = 'O positive',
  UNK = 'Unknown',
}

export enum GenderType {
  F = 'Female',
  M = 'Male',
  O = 'Other',
}

export enum FunctionTypeEnum {
  VOLUNTEERS = 1,
  DONOR = 2,
  STAFF = 3,
}
