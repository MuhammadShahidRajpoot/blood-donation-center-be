import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexesRegardingAlphabetCTables1703155374733
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // category Table
    await queryRunner.createIndex(
      'category',
      new TableIndex({
        name: 'IDX_CATEGORY_PARENT_ID',
        columnNames: ['parent_id'],
      })
    );

    await queryRunner.createIndex(
      'category',
      new TableIndex({
        name: 'IDX_CATEGORY_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'category',
      new TableIndex({
        name: 'IDX_CATEGORY_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // certification
    await queryRunner.createIndex(
      'certification',
      new TableIndex({
        name: 'IDX_CERTIFICATION_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // close_date_collection_operations
    await queryRunner.createIndex(
      'close_date_collection_operations',
      new TableIndex({
        name: 'IDX_CLOSE_DATE_COLLECTION_OPERATIONS_CLOSE_DATE_ID',
        columnNames: ['close_date_id'],
      })
    );

    await queryRunner.createIndex(
      'close_date_collection_operations',
      new TableIndex({
        name: 'IDX_CLOSE_DATE_COLLECTION_OPERATIONS_COLLECTION_OPERATION_ID',
        columnNames: ['collection_operation_id'],
      })
    );

    // close_dates Table
    await queryRunner.createIndex(
      'close_dates',
      new TableIndex({
        name: 'IDX_CLOSE_DATES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // communications
    await queryRunner.createIndex(
      'communications',
      new TableIndex({
        name: 'IDX_COMMUNICATIONS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'communications',
      new TableIndex({
        name: 'IDX_COMMUNICATIONS_CONTACTS_ID',
        columnNames: ['contacts_id'],
      })
    );

    // contact_preferences Table
    await queryRunner.createIndex(
      'contact_preferences',
      new TableIndex({
        name: 'IDX_CONTACT_PREFREENCES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'contact_preferences',
      new TableIndex({
        name: 'IDX_CONTACT_PREFREENCES_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    // contacts Table
    await queryRunner.createIndex(
      'contacts',
      new TableIndex({
        name: 'IDX_CONTACTS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // contact_roles Table
    await queryRunner.createIndex(
      'contacts_roles',
      new TableIndex({
        name: 'IDX_CONTACT_ROLES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // crm_attachments
    await queryRunner.createIndex(
      'crm_attachments',
      new TableIndex({
        name: 'IDX_CRM_ATTACHMENTS_CATEGORY_ID',
        columnNames: ['category_id'],
      })
    );

    await queryRunner.createIndex(
      'crm_attachments',
      new TableIndex({
        name: 'IDX_CRM_ATTACHMENTS_SUB_CATEGORY_ID',
        columnNames: ['sub_category_id'],
      })
    );

    await queryRunner.createIndex(
      'crm_attachments',
      new TableIndex({
        name: 'IDX_CRM_ATTACHMENTS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // crm_locations
    await queryRunner.createIndex(
      'crm_locations',
      new TableIndex({
        name: 'IDX_CRM_LOCATIONS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'crm_locations',
      new TableIndex({
        name: 'IDX_CRM_LOCATIONS_SITE_CONTACT_ID',
        columnNames: ['site_contact_id'],
      })
    );

    // crm_locations_specs
    await queryRunner.createIndex(
      'crm_locations_specs',
      new TableIndex({
        name: 'IDX_CRM_LOCATIONS_SPECS_LOCATION_ID',
        columnNames: ['location_id'],
      })
    );

    await queryRunner.createIndex(
      'crm_locations_specs',
      new TableIndex({
        name: 'IDX_CRM_LOCATIONS_SPECS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'crm_locations_specs',
      new TableIndex({
        name: 'IDX_CRM_LOCATIONS_SPECS_ROOM_SIZE_ID',
        columnNames: ['room_size_id'],
      })
    );

    // crm_locations_specs_options Table
    await queryRunner.createIndex(
      'crm_locations_specs_options',
      new TableIndex({
        name: 'IDX_CRM_LOCATIONS_SPECS_OPTIONS_LOCATION_SPECS_ID',
        columnNames: ['location_specs_id'],
      })
    );

    await queryRunner.createIndex(
      'crm_locations_specs_options',
      new TableIndex({
        name: 'IDX_CRM_LOCATIONS_SPECS_OPTIONS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // crm_ncp_blueprints
    await queryRunner.createIndex(
      'crm_ncp_blueprints',
      new TableIndex({
        name: 'IDX_CRM_NCP_BLUEPRINTS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'crm_ncp_blueprints',
      new TableIndex({
        name: 'IDX_CRM_NCP_BLUEPRINTS_CRM_NON_COLLECTION_PROFILES_ID',
        columnNames: ['crm_non_collection_profiles_id'],
      })
    );

    // crm_non_collection_profiles Table
    await queryRunner.createIndex(
      'crm_non_collection_profiles',
      new TableIndex({
        name: 'IDX_CRM_NCP_NON_COLLECTION_PROFILES_EVENT_CATEGORY_ID',
        columnNames: ['event_category_id'],
      })
    );

    await queryRunner.createIndex(
      'crm_non_collection_profiles',
      new TableIndex({
        name: 'IDX_CRM_NCP_NON_COLLECTION_PROFILES_EVENT_SUBCATEGORY_ID',
        columnNames: ['event_subcategory_id'],
      })
    );

    await queryRunner.createIndex(
      'crm_non_collection_profiles',
      new TableIndex({
        name: 'IDX_CRM_NCP_NON_COLLECTION_PROFILES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'crm_non_collection_profiles',
      new TableIndex({
        name: 'IDX_CRM_NCP_NON_COLLECTION_PROFILES_OWNER_ID',
        columnNames: ['owner_id'],
      })
    );

    // crm_volunteer
    await queryRunner.createIndex(
      'crm_volunteer',
      new TableIndex({
        name: 'IDX_CRM_VOLUNTEER_PREFIX_ID',
        columnNames: ['prefix_id'],
      })
    );

    await queryRunner.createIndex(
      'crm_volunteer',
      new TableIndex({
        name: 'IDX_CRM_VOLUNTEER_SUFFIX_ID',
        columnNames: ['suffix_id'],
      })
    );

    await queryRunner.createIndex(
      'crm_volunteer',
      new TableIndex({
        name: 'IDX_CRM_VOLUNTEER_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // custom_fields
    await queryRunner.createIndex(
      'custom_fields',
      new TableIndex({
        name: 'IDX_CUSTOM_FIELDS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // custom_fields_data
    await queryRunner.createIndex(
      'custom_fields_data',
      new TableIndex({
        name: 'IDX_CUSTOM_FIELDS_DATA_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'custom_fields_data',
      new TableIndex({
        name: 'IDX_CUSTOM_FIELDS_DATA_FIELD_ID',
        columnNames: ['field_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // category Table
    await queryRunner.dropIndex('category', 'IDX_CATEGORY_PARENT_ID');

    await queryRunner.dropIndex('category', 'IDX_CATEGORY_CREATED_BY');

    await queryRunner.dropIndex('category', 'IDX_CATEGORY_TENANT_ID');

    // certification
    await queryRunner.dropIndex('certification', 'IDX_CERTIFICATION_TENANT_ID');

    // close_date_collection_operations
    await queryRunner.dropIndex(
      'close_date_collection_operations',
      'IDX_CLOSE_DATE_COLLECTION_OPERATIONS_CLOSE_DATE_ID'
    );

    await queryRunner.dropIndex(
      'close_date_collection_operations',
      'IDX_CLOSE_DATE_COLLECTION_OPERATIONS_COLLECTION_OPERATION_ID'
    );

    // close_dates Table
    await queryRunner.dropIndex('close_dates', 'IDX_CLOSE_DATES_TENANT_ID');

    // communications
    await queryRunner.dropIndex(
      'communications',
      'IDX_COMMUNICATIONS_TENANT_ID'
    );

    await queryRunner.dropIndex(
      'communications',
      'IDX_COMMUNICATIONS_CONTACTS_ID'
    );

    // contact_preferences Table
    await queryRunner.dropIndex(
      'contact_preferences',
      'IDX_CONTACT_PREFREENCES_TENANT_ID'
    );

    await queryRunner.dropIndex(
      'contact_preferences',
      'IDX_CONTACT_PREFREENCES_CREATED_BY'
    );

    // contacts Table
    await queryRunner.dropIndex('contacts', 'IDX_CONTACTS_TENANT_ID');

    // contact_roles Table
    await queryRunner.dropIndex(
      'contacts_roles',
      'IDX_CONTACT_ROLES_TENANT_ID'
    );

    // crm_attachments
    await queryRunner.dropIndex(
      'crm_attachments',
      'IDX_CRM_ATTACHMENTS_CATEGORY_ID'
    );

    await queryRunner.dropIndex(
      'crm_attachments',
      'IDX_CRM_ATTACHMENTS_SUB_CATEGORY_ID'
    );

    await queryRunner.dropIndex(
      'crm_attachments',
      'IDX_CRM_ATTACHMENTS_TENANT_ID'
    );

    // crm_locations
    await queryRunner.dropIndex('crm_locations', 'IDX_CRM_LOCATIONS_TENANT_ID');

    await queryRunner.dropIndex(
      'crm_locations',
      'IDX_CRM_LOCATIONS_SITE_CONTACT_ID'
    );

    // crm_locations_specs
    await queryRunner.dropIndex(
      'crm_locations_specs',
      'IDX_CRM_LOCATIONS_SPECS_LOCATION_ID'
    );

    await queryRunner.dropIndex(
      'crm_locations_specs',
      'IDX_CRM_LOCATIONS_SPECS_TENANT_ID'
    );

    await queryRunner.dropIndex(
      'crm_locations_specs',
      'IDX_CRM_LOCATIONS_SPECS_ROOM_SIZE_ID'
    );

    // crm_locations_specs_options Table
    await queryRunner.dropIndex(
      'crm_locations_specs_options',
      'IDX_CRM_LOCATIONS_SPECS_OPTIONS_LOCATION_SPECS_ID'
    );

    await queryRunner.dropIndex(
      'crm_locations_specs_options',
      'IDX_CRM_LOCATIONS_SPECS_OPTIONS_TENANT_ID'
    );

    // crm_ncp_blueprints
    await queryRunner.dropIndex(
      'crm_ncp_blueprints',
      'IDX_CRM_NCP_BLUEPRINTS_TENANT_ID'
    );

    await queryRunner.dropIndex(
      'crm_ncp_blueprints',
      'IDX_CRM_NCP_BLUEPRINTS_CRM_NON_COLLECTION_PROFILES_ID'
    );

    // crm_non_collection_profiles Table
    await queryRunner.dropIndex(
      'crm_non_collection_profiles',
      'IDX_CRM_NCP_NON_COLLECTION_PROFILES_EVENT_CATEGORY_ID'
    );

    await queryRunner.dropIndex(
      'crm_non_collection_profiles',
      'IDX_CRM_NCP_NON_COLLECTION_PROFILES_EVENT_SUBCATEGORY_ID'
    );

    await queryRunner.dropIndex(
      'crm_non_collection_profiles',
      'IDX_CRM_NCP_NON_COLLECTION_PROFILES_TENANT_ID'
    );

    await queryRunner.dropIndex(
      'crm_non_collection_profiles',
      'IDX_CRM_NCP_NON_COLLECTION_PROFILES_OWNER_ID'
    );

    // crm_volunteer
    await queryRunner.dropIndex('crm_volunteer', 'IDX_CRM_VOLUNTEER_PREFIX_ID');

    await queryRunner.dropIndex('crm_volunteer', 'IDX_CRM_VOLUNTEER_SUFFIX_ID');

    await queryRunner.dropIndex('crm_volunteer', 'IDX_CRM_VOLUNTEER_TENANT_ID');

    // custom_fields
    await queryRunner.dropIndex('custom_fields', 'IDX_CUSTOM_FIELDS_TENANT_ID');

    // custom fields data
    await queryRunner.dropIndex(
      'custom_fields_data',
      'IDX_CUSTOM_FIELDS_DATA_TENANT_ID'
    );

    await queryRunner.dropIndex(
      'custom_fields_data',
      'IDX_CUSTOM_FIELDS_DATA_FIELD_ID'
    );
  }
}
