// permissions.enum.ts
export enum PermissionsEnum {
  SYSTEM_CONFIGURATION_DASHBOARD_ACCESSABLE_PRODUCTS = '010101',
  SYSTEM_CONFIGURATION_DASHBOARD_WRITE = '010102',

  TENANT_ONBOARDING_READ = '010201',
  TENANT_ONBOARDING_WRITE = '010202',
  TENANT_ONBOARDING_ARCHIVE = '010203',

  TENANT_MANAGEMENT_READ = '010301',
  TENANT_MANAGEMENT_WRITE = '010302',
  TENANT_MANAGEMENT_ARCHIVE = '010303',
  TENANT_MANAGEMENT_ADD_CONFIG = '010304',
  TENANT_MANAGEMENT_LOGIN_AS_TENANT = '010305',

  PRODUCT_LICENSING_READ = '010401',
  PRODUCT_LICENSING_WRITE = '010402',
  PRODUCT_LICENSING_ARCHIVE = '010403',

  USER_ADMINISTRATION_READ = '010501',
  USER_ADMINISTRATION_WRITE = '010502',
  USER_ADMINISTRATION_ARCHIVE = '010503',
  USER_ADMINISTRATION_UPDATE_PASSWORD = '010504',

  ROLE_ADMINISTRATION_READ = '010601',
  ROLE_ADMINISTRATION_WRITE = '010602',
  ROLE_ADMINISTRATION_ARCHIVE = '010603',

  LOG_AND_EVENT_MANAGEMENT_READ = '010701',
  LOG_AND_EVENT_MANAGEMENT_WRITE = '010702',
  LOG_AND_EVENT_MANAGEMENT_ARCHIVE = '010703',

  DASHBOARD_ACCESSABLE_APPLICATIONS_READ = '020101',

  //  SYSTEM_CONFIGURATION
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_HIERARCHY_ORGANIZATIONAL_LEVELS_READ = '0109010101',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_HIERARCHY_ORGANIZATIONAL_LEVELS_WRITE = '0109010102',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_HIERARCHY_ORGANIZATIONAL_LEVELS_ARCHIVE = '0109010103',

  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_HIERARCHY_BUSINESS_UNITS_READ = '0109010201',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_HIERARCHY_BUSINESS_UNITS_WRITE = '0109010202',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_HIERARCHY_BUSINESS_UNITS_ARCHIVE = '0109010203',

  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_GOALS_MONTHLY_GOALS_READ = '0109020101',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_GOALS_MONTHLY_GOALS_WRITE = '0109020102',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_GOALS_MONTHLY_GOALS_ARCHIVE = '0109020103',

  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_GOALS_DAILY_GOALS_ALLOCATION_READ = '0109020201',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_GOALS_DAILY_GOALS_ALLOCATION_WRITE = '0109020202',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_GOALS_DAILY_GOALS_ALLOCATION_SCHEDULE_CHANGE = '0109020203',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_GOALS_DAILY_GOALS_ALLOCATION_ARCHIVE = '0109020204',

  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_GOALS_DAILY_GOALS_CALENDAR_READ = '0109020301',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_GOALS_DAILY_GOALS_CALENDAR_WRITE = '0109020302',

  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_GOALS_PERFORMANCE_RULES_READ = '0109020401',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_GOALS_PERFORMANCE_RULES_WRITE = '0109020402',

  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_PRODUCTS_AND_PROCEDURES_PRODUCTS_READ = '0109030101',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_PRODUCTS_AND_PROCEDURES_PRODUCTS_WRITE = '0109030102',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_PRODUCTS_AND_PROCEDURES_PRODUCTS_ARCHIVE = '0109030103',

  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_PRODUCTS_AND_PROCEDURES_PROCEDURES_READ = '0109030201',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_PRODUCTS_AND_PROCEDURES_PROCEDURES_WRITE = '0109030202',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_PRODUCTS_AND_PROCEDURES_PROCEDURES_ARCHIVE = '0109030203',

  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_PRODUCTS_AND_PROCEDURES_PROCEDURE_TYPES_READ = '0109030301',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_PRODUCTS_AND_PROCEDURES_PROCEDURE_TYPES_WRITE = '0109030302',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_PRODUCTS_AND_PROCEDURES_PROCEDURE_TYPES_ARCHIVE = '0109030303',

  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_DEVICES_READ = '0109040101',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_DEVICES_WRITE = '0109040102',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_DEVICES_ARCHIVE = '0109040103',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_DEVICES_SHARE_DEVICE = '0109040104',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_DEVICES_SCHEDULE_RETIREMENT = '0109040105',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_DEVICES_SCHEDULE_MAINTENANCE = '0109040106',

  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_DEVICE_TYPE_READ = '0109040201',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_DEVICE_TYPE_WRITE = '0109040202',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_DEVICE_TYPE_ARCHIVE = '0109040203',

  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_VEHICLES_READ = '0109040301',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_VEHICLES_WRITE = '0109040302',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_VEHICLES_ARCHIVE = '0109040303',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_VEHICLES_SHARE_VEHICLE = '0109040304',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_VEHICLES_SCHEDULE_RETIREMENT = '0109040305',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_VEHICLES_SCHEDULE_MAINTENANCE = '0109040306',

  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_VEHICLE_TYPE_READ = '0109040401',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_VEHICLE_TYPE_WRITE = '0109040402',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_VEHICLE_TYPE_ARCHIVE = '0109040403',

  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_FACILITIES_READ = '0109040501',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_FACILITIES_WRITE = '0109040502',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_RESOURCES_FACILITIES_ARCHIVE = '0109040503',

  // SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_LOYALTY_PROGRAM_READ = '030501',
  // SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_LOYALTY_PROGRAM_WRITE = '030502',

  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_CONTENT_MANAGEMENT_SYSTEM_ADS_READ = '0109060101',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_CONTENT_MANAGEMENT_SYSTEM_ADS_WRITE = '0109060102',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_CONTENT_MANAGEMENT_SYSTEM_ADS_ARCHIVE = '0109060103',

  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_CONTENT_MANAGEMENT_SYSTEM_EMAIL_TEMPLATES_READ = '0109060201',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_CONTENT_MANAGEMENT_SYSTEM_EMAIL_TEMPLATES_WRITE = '0109060202',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_CONTENT_MANAGEMENT_SYSTEM_EMAIL_TEMPLATES_ARCHIVE = '0109060203',

  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_CUSTOM_FIELDS_READ = '01090701',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_CUSTOM_FIELDS_WRITE = '01090702',
  SYSTEM_CONFIGURATION_ORGANIZATIONAL_ADMINISTRATION_CUSTOM_FIELDS_ARCHIVE = '01090703',

  SYSTEM_CONFIGURATION_GEO_ADMINISTRATION_TERRITORY_MANAGEMENT_READ = '01100101',
  SYSTEM_CONFIGURATION_GEO_ADMINISTRATION_TERRITORY_MANAGEMENT_WRITE = '01100102',
  SYSTEM_CONFIGURATION_GEO_ADMINISTRATION_TERRITORY_MANAGEMENT_ARCHIVE = '01100103',

  SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_OUTCOMES_READ = '01110101',
  SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_OUTCOMES_WRITE = '01110102',
  SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_OUTCOMES_ARCHIVE = '01110103',

  SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_READ = '01110201',
  SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_CENTER_SETTINGS_WRITE = '01110202',

  SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_READ = '01110301',
  SYSTEM_CONFIGURATION_CALL_CENTER_ADMINISTRATION_CALL_FLOWS_WRITE = '01110302',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_AFFILIATION_READ = '0112010101',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_AFFILIATION_WRITE = '0112010102',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_AFFILIATION_ARCHIVE = '0112010103',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_SOURCES_READ = '0112010201',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_SOURCES_WRITE = '0112010202',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_SOURCES_ARCHIVE = '0112010203',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_STAGES_READ = '0112010301',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_STAGES_WRITE = '0112010302',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_STAGES_ARCHIVE = '0112010303',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_INDUSTRY_CATEGORY_READ = '0112010401',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_INDUSTRY_CATEGORY_WRITE = '0112010402',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_INDUSTRY_CATEGORY_ARCHIVE = '0112010403',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_INDUSTRY_SUBCATEGORY_READ = '0112010501',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_INDUSTRY_SUBCATEGORY_WRITE = '0112010502',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_INDUSTRY_SUBCATEGORY_ARCHIVE = '0112010503',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_ATTACHMENTS_CATEGORY_READ = '0112010601',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_ATTACHMENTS_CATEGORY_WRITE = '0112010602',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_ATTACHMENTS_CATEGORY_ARCHIVE = '0112010603',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_ATTACHMENTS_SUBCATEGORY_READ = '0112010701',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_ATTACHMENTS_SUBCATEGORY_WRITE = '0112010702',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_ATTACHMENTS_SUBCATEGORY_ARCHIVE = '0112010703',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_NOTES_CATEGORY_READ = '0112010801',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_NOTES_CATEGORY_WRITE = '0112010802',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_NOTES_CATEGORY_ARCHIVE = '0112010803',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_NOTES_SUBCATEGORY_READ = '0112010901',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_NOTES_SUBCATEGORY_WRITE = '0112010902',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_ACCOUNTS_NOTES_SUBCATEGORY_ARCHIVE = '0112010903',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_LOCATIONS_ROOM_SIZES_READ = '0112030101',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_LOCATIONS_ROOM_SIZES_WRITE = '0112030102',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_LOCATIONS_ROOM_SIZES_ARCHIVE = '0112030103',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_LOCATIONS_ATTACHMENTS_CATEGORY_READ = '0112030201',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_LOCATIONS_ATTACHMENTS_CATEGORY_WRITE = '0112030202',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_LOCATIONS_ATTACHMENTS_CATEGORY_ARCHIVE = '0112030203',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_LOCATIONS_ATTACHMENTS_SUBCATEGORY_READ = '0112030301',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_LOCATIONS_ATTACHMENTS_SUBCATEGORY_WRITE = '0112030302',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_LOCATIONS_ATTACHMENTS_SUBCATEGORY_ARCHIVE = '0112030303',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_LOCATIONS_NOTES_CATEGORY_READ = '0112030401',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_LOCATIONS_NOTES_CATEGORY_WRITE = '0112030402',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_LOCATIONS_NOTES_CATEGORY_ARCHIVE = '0112030403',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_LOCATIONS_NOTES_SUBCATEGORY_READ = '0112030501',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_LOCATIONS_NOTES_SUBCATEGORY_WRITE = '0112030502',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_LOCATIONS_NOTES_SUBCATEGORY_ARCHIVE = '0112020503',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_CONTACTS_ROLES_READ = '0112020101',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_CONTACTS_ROLES_WRITE = '0112020102',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_CONTACTS_ROLES_ARCHIVE = '0112020103',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_CONTACTS_ATTACHMENTS_CATEGORY_READ = '0112020201',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_CONTACTS_ATTACHMENTS_CATEGORY_WRITE = '0112020202',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_CONTACTS_ATTACHMENTS_CATEGORY_ARCHIVE = '0112020203',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_CONTACTS_ATTACHMENTS_SUBCATEGORY_READ = '0112020301',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_CONTACTS_ATTACHMENTS_SUBCATEGORY_WRITE = '0112020302',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_CONTACTS_ATTACHMENTS_SUBCATEGORY_ARCHIVE = '0112020303',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_CONTACTS_NOTES_CATEGORY_READ = '0112020401',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_CONTACTS_NOTES_CATEGORY_WRITE = '0112020402',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_CONTACTS_NOTES_CATEGORY_ARCHIVE = '0112020403',

  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_CONTACTS_NOTES_SUBCATEGORY_READ = '0112020501',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_CONTACTS_NOTES_SUBCATEGORY_WRITE = '0112020502',
  SYSTEM_CONFIGURATION_CRM_ADMINISTRATION_CONTACTS_NOTES_SUBCATEGORY_ARCHIVE = '0112020503',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_BOOKING_DRIVES_BOOKING_RULE_READ = '0113010101',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_BOOKING_DRIVES_BOOKING_RULE_WRITE = '0113010102',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_BOOKING_DRIVES_BOOKING_RULE_ARCHIVE = '0113010103',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_BOOKING_DRIVES_DAILY_CAPACITY_READ = '0113010201',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_BOOKING_DRIVES_DAILY_CAPACITY_WRITE = '0113010202',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_BOOKING_DRIVES_DAILY_CAPACITY_ARCHIVE = '0113010203',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_BOOKING_DRIVES_DAILY_HOURS_READ = '0113010301',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_BOOKING_DRIVES_DAILY_HOURS_WRITE = '0113010302',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_BOOKING_DRIVES_DAILY_HOURS_ARCHIVE = '0113010302',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_BOOKING_DRIVES_OPERATION_STATUS_READ = '0113010401',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_BOOKING_DRIVES_OPERATION_STATUS_WRITE = '0113010402',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_BOOKING_DRIVES_OPERATION_STATUS_ARCHIVE = '0113010403',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_BOOKING_DRIVES_TASK_MANAGEMENT_READ = '0113010501',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_BOOKING_DRIVES_TASK_MANAGEMENT_WRITE = '0113010502',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_BOOKING_DRIVES_TASK_MANAGEMENT_ARCHIVE = '0113010503',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_CALENDAR_BANNER_READ = '0113020101',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_CALENDAR_BANNER_WRITE = '0113020102',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_CALENDAR_BANNER_MANAGEMENT_ARCHIVE = '0113020103',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_CALENDAR_LOCK_DATES_READ = '0113020201',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_CALENDAR_LOCK_DATES_WRITE = '0113020202',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_CALENDAR_LOCK_DATES_MANAGEMENT_ARCHIVE = '0113020203',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_CALENDAR_CLOSE_DATES_READ = '0113020301',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_CALENDAR_CLOSE_DATES_WRITE = '0113020302',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_CALENDAR_CLOSE_DATES_MANAGEMENT_ARCHIVE = '0113020303',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_CALENDAR_GOAL_VARIANCE_READ = '0113020401',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_CALENDAR_GOAL_VARIANCE_WRITE = '0113020402',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_MARKETING_EQUIPMENTS_PROMOTIONS_READ = '0113030101',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_MARKETING_EQUIPMENTS_PROMOTIONS_WRITE = '0113030102',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_MARKETING_EQUIPMENTS_PROMOTIONS_ARCHIVE = '0113030103',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_MARKETING_EQUIPMENTS_PROMOTIONAL_ITEMS_READ = '0113030201',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_MARKETING_EQUIPMENTS_PROMOTIONAL_ITEMS_WRITE = '0113030202',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_MARKETING_EQUIPMENTS_PROMOTIONAL_ITEMS_ARCHIVE = '0113030202',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_MARKETING_EQUIPMENTS_MARKETING_MATERIAL_READ = '0113030301',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_MARKETING_EQUIPMENTS_MARKETING_MATERIAL_WRITE = '0113030302',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_CALENDAR_MARKETING_EQUIPMENTS_MARKETING_MATERIAL_ARCHIVE = '0113030303',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_MARKETING_EQUIPMENTS_APPROVALS_READ = '0113030401',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_MARKETING_EQUIPMENTS_APPROVALS_WRITE = '0113030402',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_MARKETING_EQUIPMENTS_EQUIPMENTS_READ = '0113030501',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_MARKETING_EQUIPMENTS_EQUIPMENTS_WRITE = '0113030502',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_MARKETING_EQUIPMENTS_EQUIPMENTS_ARCHIVE = '0113030503',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NOTES_AND_ATTACHMENTS_ATTACHMENTS_CATEGORY_READ = '0113040101',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NOTES_AND_ATTACHMENTS_ATTACHMENTS_CATEGORY_WRITE = '0113040102',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NOTES_AND_ATTACHMENTS_ATTACHMENTS_CATEGORY_ARCHIVE = '0113040103',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NOTES_AND_ATTACHMENTS_ATTACHMENTS_SUBCATEGORY_READ = '0113040201',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NOTES_AND_ATTACHMENTS_ATTACHMENTS_SUBCATEGORY_WRITE = '0113040202',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NOTES_AND_ATTACHMENTS_ATTACHMENTS_SUBCATEGORY_ARCHIVE = '0113040203',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NOTES_AND_ATTACHMENTS_NOTES_CATEGORY_READ = '0113040301',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NOTES_AND_ATTACHMENTS_NOTES_CATEGORY_WRITE = '0113040302',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NOTES_AND_ATTACHMENTS_NOTES_CATEGORY_ARCHIVE = '0113040303',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NOTES_AND_ATTACHMENTS_NOTES_SUBCATEGORY_READ = '0113040401',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NOTES_AND_ATTACHMENTS_NOTES_SUBCATEGORY_WRITE = '0113040402',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NOTES_AND_ATTACHMENTS_NOTES_SUBCATEGORY_ARCHIVE = '0113040403',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NON_COLLECTION_EVENTS_NCE_CATEGORY_READ = '0113050101',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NON_COLLECTION_EVENTS_NCE_CATEGORY_WRITE = '0113050102',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NON_COLLECTION_EVENTS_NCE_CATEGORY_ARCHIVE = '0113050103',

  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NON_COLLECTION_EVENTS_NCE_SUBCATEGORY_READ = '0113050201',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NON_COLLECTION_EVENTS_NCE_SUBCATEGORY_WRITE = '0113050202',
  SYSTEM_CONFIGURATION_OPERATIONS_ADMINISTRATION_NON_COLLECTION_EVENTS_NCE_SUBCATEGORY_ARCHIVE = '0113050203',

  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_STAFF_SETUPS_READ = '01140101',
  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_STAFF_SETUPS_WRITE = '01140102',
  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_STAFF_SETUPS_ARCHIVE = '01140103',

  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_CLASSIFICATIONS_READ = '0114020101',
  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_CLASSIFICATIONS_WRITE = '0114020102',
  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_CLASSIFICATIONS_ARCHIVE = '0114020103',

  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_SETTINGS_READ = '0114020201',
  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_SETTINGS_WRITE = '0114020202',
  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_SETTINGS_ARCHIVE = '0114020203',

  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_LEAVE_TYPES_READ = '01140301',
  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_LEAVE_TYPES_WRITE = '01140302',
  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_LEAVE_TYPES_ARCHIVE = '01140303',

  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_CERTIFICATIONS_READ = '0114030101',
  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_CERTIFICATIONS_WRITE = '0114030102',
  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_CERTIFICATIONS_ARCHIVE = '0114030103',

  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_ASSIGNED_CERTIFICATION_READ = '0114030201',
  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_ASSIGNED_CERTIFICATION_WRITE = '0114030202',

  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_TEAMS_READ = '0114040101',
  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_TEAMS_WRITE = '0114040102',
  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_TEAMS_ARCHIVE = '0114040103',

  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_ASSIGNED_ASSIGNED_MEMBER_READ = '0114040201',
  SYSTEM_CONFIGURATION_STAFF_ADMINISTRATION_ASSIGNED_ASSIGNED_MEMBER_WRITE = '0114040202',

  SYSTEM_CONFIGURATION_USER_ADMINISTRATIONS_USER_ROLES_READ = '01150101',
  SYSTEM_CONFIGURATION_USER_ADMINISTRATIONS_USER_ROLES_WRITE = '01150102',
  SYSTEM_CONFIGURATION_USER_ADMINISTRATIONS_USER_ROLES_ARCHIVE = '01150103',

  SYSTEM_CONFIGURATION_USER_ADMINISTRATIONS_USERS_READ = '01150201',
  SYSTEM_CONFIGURATION_USER_ADMINISTRATIONS_USERS_WRITE = '01150202',
  SYSTEM_CONFIGURATION_USER_ADMINISTRATIONS_USERS_ARCHIVE = '01150203',

  OPERATIONS_CENTER_OPERATIONS_DRIVES_READ = '13040101',
  OPERATIONS_CENTER_OPERATIONS_DRIVES_WRITE = '13040102',
  OPERATIONS_CENTER_OPERATIONS_DRIVES_ARCHIVE = '13040103',
  OPERATIONS_CENTER_OPERATIONS_DRIVES_STAFFING = '13040104',

  OPERATIONS_CENTER_OPERATIONS_DRIVES_COPY_DRIVE = '13040105',
  OPERATIONS_CENTER_OPERATIONS_DRIVES_LINK_DRIVE = '13040106',
  OPERATIONS_CENTER_OPERATIONS_DRIVES_MODULE_CODE = 'operation_center_drives',

  OPERATIONS_CENTER_OPERATIONS_DRIVES_STAFFING_READ = '1304010101',
  OPERATIONS_CENTER_OPERATIONS_DRIVES_STAFFING_MODULE_CODE = 'operation_center_drives_staffing',

  OPERATIONS_CENTER_OPERATIONS_DASHBOARD_READ = '130101',
  OPERATIONS_CENTER_OPERATIONS_DASHBOARD_MODULE_CODE = 'operation_center_dashboard',

  OPERATIONS_CENTER_OPERATIONS_APPROVAL_READ = '130701',
  OPERATIONS_CENTER_OPERATIONS_APPROVAL_MODULE_CODE = 'operation_center_approval',

  OPERATIONS_CENTER_OPERATIONS_CALENDAR_READ = '130301',
  OPERATIONS_CENTER_OPERATIONS_CALENDAR_MODULE_CODE = 'operation_center_calendar',

  OPERATIONS_CENTER_OPERATIONS_SESSIONS_READ = '13040201',
  OPERATIONS_CENTER_OPERATIONS_SESSIONS_WRITE = '13040202',
  OPERATIONS_CENTER_OPERATIONS_SESSIONS_ARCHIVE = '13040203',
  OPERATIONS_CENTER_OPERATIONS_SESSIONS_STAFFING = '13040204',

  OPERATIONS_CENTER_OPERATIONS_SESSIONS_SESSIONS = '13040205',
  OPERATIONS_CENTER_OPERATIONS_SESSIONS_MODULE_CODE = 'operation_center_sessions',

  OPERATIONS_CENTER_OPERATIONS_SESSIONS_STAFFING_READ = '1304020101',
  OPERATIONS_CENTER_OPERATIONS_SESSIONS_STAFFING_MODULE_CODE = 'operation_center_sessions_staffing',

  OPERATIONS_CENTER_OPERATIONS_NON_COLLECTION_EVENTS_READ = '13040301',
  OPERATIONS_CENTER_OPERATIONS_NON_COLLECTION_EVENTS_WRITE = '13040302',
  OPERATIONS_CENTER_OPERATIONS_NON_COLLECTION_EVENTS_ARCHIVE = '13040303',
  OPERATIONS_CENTER_OPERATIONS_NON_COLLECTION_EVENTS_STAFFING = '13040304',
  OPERATIONS_CENTER_OPERATIONS_NON_COLLECTION_EVENTS_MODULE_CODE = 'operation_center_NCE',

  OPERATIONS_CENTER_OPERATIONS_MANAGE_FAVORITE_READ = '130201',
  OPERATIONS_CENTER_OPERATIONS_MANAGE_FAVORITE_WRITE = '130202',
  OPERATIONS_CENTER_OPERATIONS_MANAGE_FAVORITE_ARCHIVE = '130203',
  OPERATIONS_CENTER_OPERATIONS_MANAGE_FAVORITE_DUPLICATE = '130204',
  OPERATIONS_CENTER_OPERATIONS_MANAGE_FAVORITE_DEFAULT = '130205',
  OPERATIONS_CENTER_OPERATIONS_MANAGE_FAVORITE_MODULE_CODE = 'operation_center_favorite',

  OPERATIONS_CENTER_OPERATIONS_RESOURCE_SHARING_READ = '130501',
  OPERATIONS_CENTER_OPERATIONS_RESOURCE_SHARING_WRITE = '130502',
  OPERATIONS_CENTER_OPERATIONS_RESOURCE_SHARING_ARCHIVE = '130503',
  OPERATIONS_CENTER_OPERATIONS_RESOURCE_SHARING_MODULE_CODE = 'operation_center_resource',

  OPERATIONS_CENTER_OPERATIONS_PROSPECTS_READ = '130601',
  OPERATIONS_CENTER_OPERATIONS_PROSPECTS_WRITE = '130602',
  OPERATIONS_CENTER_OPERATIONS_PROSPECTS_ARCHIVE = '130603',
  OPERATIONS_CENTER_OPERATIONS_PROSPECTS_DUPLICATE = '130604',
  OPERATIONS_CENTER_OPERATIONS_PROSPECTS_CANCEL = '130605',
  OPERATIONS_CENTER_OPERATIONS_PROSPECTS_MODULE_CODE = 'operation_center_prospects',

  OPERATIONS_CENTER_OPERATIONS_NON_COLLECTION_EVENTS_STAFFING_READ = '1304030101',
  OPERATIONS_CENTER_OPERATIONS_NON_COLLECTION_EVENTS_STAFFING_MODULE_CODE = 'operation_center_NCE_staffing',

  CRM_DASHBOARD_READ = '120601',

  CRM_ACCOUNTS_READ = '120101',
  CRM_ACCOUNTS_WRITE = '120102',
  CRM_ACCOUNTS_SCHEDULE_DRIVE = '120103',
  CRM_ACCOUNTS_ARCHIVE = '120104',

  CRM_CONTACTS_VOLUNTEERS_READ = '12020101',
  CRM_CONTACTS_VOLUNTEERS_WRITE = '12020102',
  CRM_CONTACTS_VOLUNTEERS_SCHEDULE_DRIVE = '12020103',
  CRM_CONTACTS_VOLUNTEERS_ARCHIVE = '12020104',
  CRM_CONTACTS_VOLUNTEERS_SEND_EMAIL_OR_SMS = '12020105',

  CRM_CONTACTS_DONOR_READ = '12020201',
  CRM_CONTACTS_DONOR_WRITE = '12020202',
  CRM_CONTACTS_DONOR_SEND_EMAIL_OR_SMS = '12020203',
  CRM_CONTACTS_DONOR_ARCHIVE = '12020204',

  CRM_CONTACTS_STAFF_READ = '12020301',
  CRM_CONTACTS_STAFF_WRITE = '12020302',
  CRM_CONTACTS_STAFF_SEND_EMAIL_OR_SMS = '12020303',
  CRM_CONTACTS_STAFF_ARCHIVE = '12020304',

  CRM_LOCATIONS_READ = '120301',
  CRM_LOCATIONS_WRITE = '120302',
  CRM_LOCATIONS_ARCHIVE = '120303',

  CRM_DONOR_CENTERS_READ = '120401',
  CRM_DONOR_CENTERS_WRITE = '120402',
  CRM_DONOR_CENTERS_ARCHIVE = '120403',

  CRM_NON_COLLECTION_PROFILES_READ = '120501',
  CRM_NON_COLLECTION_PROFILES_WRITE = '120502',
  CRM_NON_COLLECTION_PROFILES_ARCHIVE = '120503',

  STAFFING_MANAGEMENT_DASHBOARD_READ = '060101',

  STAFFING_MANAGEMENT_STAFF_LIST_READ = '060201',
  STAFFING_MANAGEMENT_STAFF_LIST_WRITE = '060202',
  STAFFING_MANAGEMENT_STAFF_LIST_CURRENT_SCHEDULE = '060203',
  STAFFING_MANAGEMENT_STAFF_LIST_COMMUNICATE = '060204',
  STAFFING_MANAGEMENT_STAFF_LIST_ARCHIVE = '060205',

  STAFFING_MANAGEMENT_BUILD_SCHEDULES_READ = '060301',
  STAFFING_MANAGEMENT_BUILD_SCHEDULES_WRITE = '060302',
  STAFFING_MANAGEMENT_BUILD_SCHEDULES_ARCHIVE = '060303',

  STAFFING_MANAGEMENT_QUICK_CHANGE_READ = '060401',
  STAFFING_MANAGEMENT_QUICK_CHANGE_WRITE = '060402',
  STAFFING_MANAGEMENT_QUICK_CHANGE_LEAVE = '060403',
  STAFFING_MANAGEMENT_QUICK_CHANGE_REASSIGN = '060404',

  STAFFING_MANAGEMENT_VIEW_SCHEDULE_STAFF_SCHEDULE = '060501',
  STAFFING_MANAGEMENT_VIEW_SCHEDULE_DEPART_SCHEDULE = '060502',

  CALL_CENTER_MANAGE_SCRIPTS_READ = '070101',
  CALL_CENTER_MANAGE_SCRIPTS_WRITE = '070102',
  CALL_CENTER_MANAGE_SCRIPTS_ARCHIVE = '070103',

  CALL_CENTER_MANAGE_SEGMENTS_READ = '070401',
  CALL_CENTER_MANAGE_SEGMENTS_WRITE = '070402',
  CALL_CENTER_MANAGE_DASHBOARD_READ = '070201',
  CALL_CENTER_MANAGE_DASHBOARD_WRITE = '070202',
  CALL_CENTER_MANAGE_CALL_SCHEDULE_READ = '070301',
  CALL_CENTER_MANAGE_CALL_SCHEDULE_WRITE = '070302',
  CALL_CENTER_DIALING_CENTER_READ = '070501',
}
