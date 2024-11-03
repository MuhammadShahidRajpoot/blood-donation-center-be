import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexRegardingAlphabetSTables1703247535164
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // SCHEDULE
    await queryRunner.createIndex(
      'schedule',
      new TableIndex({
        name: 'IDX_SCHEDULE_COLLECTION_OPERATION_ID',
        columnNames: ['collection_operation_id'],
      })
    );
    await queryRunner.createIndex(
      'schedule',
      new TableIndex({
        name: 'IDX_SCHEDULE_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // SCHEDULE
    // SCHEDULE OPERATION STATUS
    await queryRunner.createIndex(
      'schedule_operation_status',
      new TableIndex({
        name: 'IDX_SCHEDULE_OPERATION_STATUS_SCHEDULE_ID',
        columnNames: ['schedule_id'],
      })
    );
    await queryRunner.createIndex(
      'schedule_operation_status',
      new TableIndex({
        name: 'IDX_SCHEDULE_OPERATION_STATUS_OPERATION_STATUS_ID',
        columnNames: ['operation_status_id'],
      })
    );
    await queryRunner.createIndex(
      'schedule_operation_status',
      new TableIndex({
        name: 'IDX_SCHEDULE_OPERATION_STATUS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // SCHEDULE OPERATION STATUS
    // SESSIONS
    await queryRunner.createIndex(
      'sessions',
      new TableIndex({
        name: 'IDX_SESSIONS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'sessions',
      new TableIndex({
        name: 'IDX_SESSIONS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'sessions',
      new TableIndex({
        name: 'IDX_SESSIONS_DONOR_CENTER_ID',
        columnNames: ['donor_center_id'],
      })
    );
    await queryRunner.createIndex(
      'sessions',
      new TableIndex({
        name: 'IDX_SESSIONS_OPERATION_STATUS_ID',
        columnNames: ['operation_status_id'],
      })
    );
    await queryRunner.createIndex(
      'sessions',
      new TableIndex({
        name: 'IDX_SESSIONS_COLLECTION_OPERATION_ID',
        columnNames: ['collection_operation_id'],
      })
    );
    // SESSIONS
    // SESSIONS PROMOTIONS
    await queryRunner.createIndex(
      'sessions_promotions',
      new TableIndex({
        name: 'IDX_SESSIONS_PROMOTIONS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'sessions_promotions',
      new TableIndex({
        name: 'IDX_SESSIONS_PROMOTIONS_SESSION_ID',
        columnNames: ['session_id'],
      })
    );
    await queryRunner.createIndex(
      'sessions_promotions',
      new TableIndex({
        name: 'IDX_SESSIONS_PROMOTIONS_PROMOTION_ID',
        columnNames: ['promotion_id'],
      })
    );
    // SESSIONS PROMOTIONS
    // SHIFTS
    await queryRunner.createIndex(
      'shifts',
      new TableIndex({
        name: 'IDX_SHIFTS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'shifts',
      new TableIndex({
        name: 'IDX_SHIFTS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    // SHIFTS
    // SHIFTS DEVICES
    await queryRunner.createIndex(
      'shifts_devices',
      new TableIndex({
        name: 'IDX_SHIFTS_DEVICES_SHIFT_ID',
        columnNames: ['shift_id'],
      })
    );
    await queryRunner.createIndex(
      'shifts_devices',
      new TableIndex({
        name: 'IDX_SHIFTS_DEVICES_DEVICE_ID',
        columnNames: ['device_id'],
      })
    );
    await queryRunner.createIndex(
      'shifts_devices',
      new TableIndex({
        name: 'IDX_SHIFTS_DEVICES_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // SHIFTS DEVICES
    // SHIFTS PROJECTION STAFF
    await queryRunner.createIndex(
      'shifts_projections_staff',
      new TableIndex({
        name: 'IDX_SHIFTS_PROJECTIONS_STAFF_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'shifts_projections_staff',
      new TableIndex({
        name: 'IDX_SHIFTS_PROJECTIONS_STAFF_SHIFT_ID',
        columnNames: ['shift_id'],
      })
    );
    await queryRunner.createIndex(
      'shifts_projections_staff',
      new TableIndex({
        name: 'IDX_SHIFTS_PROJECTIONS_STAFF_PROCEDURE_TYPE_ID',
        columnNames: ['procedure_type_id'],
      })
    );
    await queryRunner.createIndex(
      'shifts_projections_staff',
      new TableIndex({
        name: 'IDX_SHIFTS_PROJECTIONS_STAFF_STAFF_SETUP_ID',
        columnNames: ['staff_setup_id'],
      })
    );
    // SHIFTS PROJECTION STAFF
    // SHIFTS ROLES
    await queryRunner.createIndex(
      'shifts_roles',
      new TableIndex({
        name: 'IDX_SHIFTS_ROLES_SHIFT_ID',
        columnNames: ['shift_id'],
      })
    );
    await queryRunner.createIndex(
      'shifts_roles',
      new TableIndex({
        name: 'IDX_SHIFTS_ROLES_ROLE_ID',
        columnNames: ['role_id'],
      })
    );
    await queryRunner.createIndex(
      'shifts_roles',
      new TableIndex({
        name: 'IDX_SHIFTS_ROLES_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // SHIFTS ROLES
    // SHIFTS SLOTS
    await queryRunner.createIndex(
      'shifts_slots',
      new TableIndex({
        name: 'IDX_SHIFTS_SLOTS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'shifts_slots',
      new TableIndex({
        name: 'IDX_SHIFTS_SLOTS_SHIFT_ID',
        columnNames: ['shift_id'],
      })
    );
    await queryRunner.createIndex(
      'shifts_slots',
      new TableIndex({
        name: 'IDX_SHIFTS_SLOTS_PROCEDURE_TYPE_ID',
        columnNames: ['procedure_type_id'],
      })
    );
    // SHIFTS SLOTS
    // SHIFTS STAFF SETUPS
    await queryRunner.createIndex(
      'shifts_staff_setups',
      new TableIndex({
        name: 'IDX_SHIFTS_STAFF_SETUPS_SHIFT_ID',
        columnNames: ['shift_id'],
      })
    );
    await queryRunner.createIndex(
      'shifts_staff_setups',
      new TableIndex({
        name: 'IDX_SHIFTS_STAFF_SETUPS_STAFF_SETUP_ID',
        columnNames: ['staff_setup_id'],
      })
    );
    await queryRunner.createIndex(
      'shifts_staff_setups',
      new TableIndex({
        name: 'IDX_SHIFTS_STAFF_SETUPS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // SHIFTS STAFF SETUPS
    // SHIFTS VEHICLES
    await queryRunner.createIndex(
      'shifts_vehicles',
      new TableIndex({
        name: 'IDX_SHIFTS_VEHICLES_SHIFT_ID',
        columnNames: ['shift_id'],
      })
    );
    await queryRunner.createIndex(
      'shifts_vehicles',
      new TableIndex({
        name: 'IDX_SHIFTS_VEHICLES_VEHICLE_ID',
        columnNames: ['vehicle_id'],
      })
    );
    await queryRunner.createIndex(
      'shifts_vehicles',
      new TableIndex({
        name: 'IDX_SHIFTS_VEHICLES_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // SHIFTS VEHICLES
    // SOURCES
    await queryRunner.createIndex(
      'sources',
      new TableIndex({
        name: 'IDX_SOURCES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'sources',
      new TableIndex({
        name: 'IDX_SOURCES_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // SOURCES
    // STAFF
    await queryRunner.createIndex(
      'staff',
      new TableIndex({
        name: 'IDX_STAFF_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'staff',
      new TableIndex({
        name: 'IDX_STAFF_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'staff',
      new TableIndex({
        name: 'IDX_STAFF_PREFIX',
        columnNames: ['prefix'],
      })
    );
    await queryRunner.createIndex(
      'staff',
      new TableIndex({
        name: 'IDX_STAFF_SUFFIX',
        columnNames: ['suffix'],
      })
    );
    await queryRunner.createIndex(
      'staff',
      new TableIndex({
        name: 'IDX_STAFF_CLASSIFICATION_ID',
        columnNames: ['classification_id'],
      })
    );
    await queryRunner.createIndex(
      'staff',
      new TableIndex({
        name: 'IDX_STAFF_COLLECTION_OPERATION_ID',
        columnNames: ['collection_operation_id'],
      })
    );
    // STAFF
    // STAFF CERTIFICATION
    await queryRunner.createIndex(
      'staff_certification',
      new TableIndex({
        name: 'IDX_STAFF_CERTIFICATION_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'staff_certification',
      new TableIndex({
        name: 'IDX_STAFF_CERTIFICATION_STAFF_ID',
        columnNames: ['staff_id'],
      })
    );
    await queryRunner.createIndex(
      'staff_certification',
      new TableIndex({
        name: 'IDX_STAFF_CERTIFICATION_CERTIFICATE_ID',
        columnNames: ['certificate_id'],
      })
    );
    await queryRunner.createIndex(
      'staff_certification',
      new TableIndex({
        name: 'IDX_STAFF_CERTIFICATION_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    // STAFF CERTIFICATION
    // STAFF CLASSIFICATION
    await queryRunner.createIndex(
      'staff_classification',
      new TableIndex({
        name: 'IDX_STAFF_CLASSIFICATION_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'staff_classification',
      new TableIndex({
        name: 'IDX_STAFF_CLASSIFICATION_STAFF_ID',
        columnNames: ['staff_id'],
      })
    );
    await queryRunner.createIndex(
      'staff_classification',
      new TableIndex({
        name: 'IDX_STAFF_CLASSIFICATION_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'staff_classification',
      new TableIndex({
        name: 'IDX_STAFF_CLASSIFICATION_STAFFING_CLASSIFICATION_ID',
        columnNames: ['staffing_classification_id'],
      })
    );
    // STAFF CLASSIFICATION
    // STAFF COLLECTION OPERATIONS
    await queryRunner.createIndex(
      'staff_collection_operations',
      new TableIndex({
        name: 'IDX_STAFF_COLLECTION_OPERATIONS_STAFF_ID',
        columnNames: ['staff_id'],
      })
    );
    await queryRunner.createIndex(
      'staff_collection_operations',
      new TableIndex({
        name: 'IDX_STAFF_COLLECTION_OPERATIONS_COLLECTION_OPERATION_ID',
        columnNames: ['collection_operation_id'],
      })
    );
    await queryRunner.createIndex(
      'staff_collection_operations',
      new TableIndex({
        name: 'IDX_STAFF_COLLECTION_OPERATIONS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'staff_collection_operations',
      new TableIndex({
        name: 'IDX_STAFF_COLLECTION_OPERATIONS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // STAFF COLLECTION OPERATIONS
    // STAFF CONFIG
    await queryRunner.createIndex(
      'staff_config',
      new TableIndex({
        name: 'IDX_STAFF_CONFIG_STAFF_SETUP_ID',
        columnNames: ['staff_setup_id'],
      })
    );
    await queryRunner.createIndex(
      'staff_config',
      new TableIndex({
        name: 'IDX_STAFF_CONFIG_CONTACT_ROLE_ID',
        columnNames: ['contact_role_id'],
      })
    );
    await queryRunner.createIndex(
      'staff_config',
      new TableIndex({
        name: 'IDX_STAFF_CONFIG_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    // STAFF CONFIG
    // STAFF DONOR CENTERS MAPPING
    await queryRunner.createIndex(
      'staff_donor_centers_mapping',
      new TableIndex({
        name: 'IDX_STAFF_DONOR_CENTERS_MAPPING_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'staff_donor_centers_mapping',
      new TableIndex({
        name: 'IDX_STAFF_DONOR_CENTERS_MAPPING_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'staff_donor_centers_mapping',
      new TableIndex({
        name: 'IDX_STAFF_DONOR_CENTERS_MAPPING_STAFF_ID',
        columnNames: ['staff_id'],
      })
    );
    await queryRunner.createIndex(
      'staff_donor_centers_mapping',
      new TableIndex({
        name: 'IDX_STAFF_DONOR_CENTERS_MAPPING_DONOR_CENTER_ID',
        columnNames: ['donor_center_id'],
      })
    );
    // STAFF DONOR CENTERS MAPPING
    // STAFF LEAVE
    await queryRunner.createIndex(
      'staff_leave',
      new TableIndex({
        name: 'IDX_STAFF_LEAVE_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'staff_leave',
      new TableIndex({
        name: 'IDX_STAFF_LEAVE_STAFF_ID',
        columnNames: ['staff_id'],
      })
    );
    await queryRunner.createIndex(
      'staff_leave',
      new TableIndex({
        name: 'IDX_STAFF_LEAVE_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    // STAFF LEAVE
    // STAFF ROLES MAPPING
    await queryRunner.createIndex(
      'staff_roles_mapping',
      new TableIndex({
        name: 'IDX_STAFF_ROLES_MAPPING_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'staff_roles_mapping',
      new TableIndex({
        name: 'IDX_STAFF_ROLES_MAPPING_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'staff_roles_mapping',
      new TableIndex({
        name: 'IDX_STAFF_ROLES_MAPPING_STAFF_ID',
        columnNames: ['staff_id'],
      })
    );
    await queryRunner.createIndex(
      'staff_roles_mapping',
      new TableIndex({
        name: 'IDX_STAFF_ROLES_MAPPING_ROLE_ID',
        columnNames: ['role_id'],
      })
    );
    // STAFF ROLES MAPPING
    // STAFF SETUP
    await queryRunner.createIndex(
      'staff_setup',
      new TableIndex({
        name: 'IDX_STAFF_SETUP_PROCEDURE_TYPE_ID',
        columnNames: ['procedure_type_id'],
      })
    );
    await queryRunner.createIndex(
      'staff_setup',
      new TableIndex({
        name: 'IDX_STAFF_SETUP_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'staff_setup',
      new TableIndex({
        name: 'IDX_STAFF_SETUP_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // STAFF SETUP
    // STAFF SHIFT SCHEDULE
    await queryRunner.createIndex(
      'staff_shift_schedule',
      new TableIndex({
        name: 'IDX_STAFF_SHIFT_SCHEDULE_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'staff_shift_schedule',
      new TableIndex({
        name: 'IDX_STAFF_SHIFT_SCHEDULE_STAFF_ID',
        columnNames: ['staff_id'],
      })
    );
    await queryRunner.createIndex(
      'staff_shift_schedule',
      new TableIndex({
        name: 'IDX_STAFF_SHIFT_SCHEDULE_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    // STAFF SHIFT SCHEDULE
    // STAFFING CLASSIFICATION
    await queryRunner.createIndex(
      'staffing_classification',
      new TableIndex({
        name: 'IDX_STAFFING_CLASSIFICATION_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'staffing_classification',
      new TableIndex({
        name: 'IDX_STAFFING_CLASSIFICATION_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // STAFFING CLASSIFICATION
    // STAFFING CLASSIFICATION SETTING
    await queryRunner.createIndex(
      'staffing_classification_setting',
      new TableIndex({
        name: 'IDX_STAFFING_CLASSIFICATION_SETTING_CLASSIFICATION_ID',
        columnNames: ['classification_id'],
      })
    );
    await queryRunner.createIndex(
      'staffing_classification_setting',
      new TableIndex({
        name: 'IDX_STAFFING_CLASSIFICATION_SETTING_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    await queryRunner.createIndex(
      'staffing_classification_setting',
      new TableIndex({
        name: 'IDX_STAFFING_CLASSIFICATION_SETTING_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    // STAFFING CLASSIFICATION SETTING
    // STAGES
    await queryRunner.createIndex(
      'stages',
      new TableIndex({
        name: 'IDX_STAGES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );
    await queryRunner.createIndex(
      'stages',
      new TableIndex({
        name: 'IDX_STAGES_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // STAGES
    // SUFFIXES
    await queryRunner.createIndex(
      'suffixes',
      new TableIndex({
        name: 'IDX_SUFFIXES_CREATED_BY',
        columnNames: ['created_by'],
      })
    );
    // SUFFIXES
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // SCHEDULE
    await queryRunner.dropIndex(
      'schedule',
      'IDX_SCHEDULE_COLLECTION_OPERATION_ID'
    );
    await queryRunner.dropIndex('schedule', 'IDX_SCHEDULE_CREATED_BY');
    // SCHEDULE
    // SCHEDULE OPERATION STATUS
    await queryRunner.dropIndex(
      'schedule_operation_status',
      'IDX_SCHEDULE_OPERATION_STATUS_SCHEDULE_ID'
    );
    await queryRunner.dropIndex(
      'schedule_operation_status',
      'IDX_SCHEDULE_OPERATION_STATUS_OPERATION_STATUS_ID'
    );
    await queryRunner.dropIndex(
      'schedule_operation_status',
      'IDX_SCHEDULE_OPERATION_STATUS_CREATED_BY'
    );
    // SCHEDULE OPERATION STATUS
    // SESSIONS
    await queryRunner.dropIndex('sessions', 'IDX_SESSIONS_CREATED_BY');
    await queryRunner.dropIndex('sessions', 'IDX_SESSIONS_TENANT_ID');
    await queryRunner.dropIndex('sessions', 'IDX_SESSIONS_DONOR_CENTER_ID');
    await queryRunner.dropIndex('sessions', 'IDX_SESSIONS_OPERATION_STATUS_ID');
    await queryRunner.dropIndex(
      'sessions',
      'IDX_SESSIONS_COLLECTION_OPERATION_ID'
    );
    // SESSIONS
    // SESSIONS PROMOTIONS
    await queryRunner.dropIndex(
      'sessions_promotions',
      'IDX_SESSIONS_PROMOTIONS_CREATED_BY'
    );
    await queryRunner.dropIndex(
      'sessions_promotions',
      'IDX_SESSIONS_PROMOTIONS_SESSION_ID'
    );
    await queryRunner.dropIndex(
      'sessions_promotions',
      'IDX_SESSIONS_PROMOTIONS_PROMOTION_ID'
    );
    // SESSIONS PROMOTIONS
    // SHIFTS
    await queryRunner.dropIndex('shifts', 'IDX_SHIFTS_CREATED_BY');
    await queryRunner.dropIndex('shifts', 'IDX_SHIFTS_TENANT_ID');
    // SHIFTS
    // SHIFTS DEVICES
    await queryRunner.dropIndex(
      'shifts_devices',
      'IDX_SHIFTS_DEVICES_SHIFT_ID'
    );
    await queryRunner.dropIndex(
      'shifts_devices',
      'IDX_SHIFTS_DEVICES_DEVICE_ID'
    );
    await queryRunner.dropIndex(
      'shifts_devices',
      'IDX_SHIFTS_DEVICES_CREATED_BY'
    );
    // SHIFTS DEVICES
    // SHIFTS PROJECTION STAFF
    await queryRunner.dropIndex(
      'shifts_projections_staff',
      'IDX_SHIFTS_PROJECTIONS_STAFF_CREATED_BY'
    );
    await queryRunner.dropIndex(
      'shifts_projections_staff',
      'IDX_SHIFTS_PROJECTIONS_STAFF_SHIFT_ID'
    );
    await queryRunner.dropIndex(
      'shifts_projections_staff',
      'IDX_SHIFTS_PROJECTIONS_STAFF_PROCEDURE_TYPE_ID'
    );
    await queryRunner.dropIndex(
      'shifts_projections_staff',
      'IDX_SHIFTS_PROJECTIONS_STAFF_STAFF_SETUP_ID'
    );
    // SHIFTS PROJECTION STAFF
    // SHIFTS ROLES
    await queryRunner.dropIndex('shifts_roles', 'IDX_SHIFTS_ROLES_SHIFT_ID');
    await queryRunner.dropIndex('shifts_roles', 'IDX_SHIFTS_ROLES_ROLE_ID');
    await queryRunner.dropIndex('shifts_roles', 'IDX_SHIFTS_ROLES_CREATED_BY');
    // SHIFTS ROLES
    // SHIFTS SLOTS
    await queryRunner.dropIndex('shifts_slots', 'IDX_SHIFTS_SLOTS_CREATED_BY');
    await queryRunner.dropIndex('shifts_slots', 'IDX_SHIFTS_SLOTS_SHIFT_ID');
    await queryRunner.dropIndex(
      'shifts_slots',
      'IDX_SHIFTS_SLOTS_PROCEDURE_TYPE_ID'
    );
    // SHIFTS SLOTS
    // SHIFTS STAFF SETUPS
    await queryRunner.dropIndex(
      'shifts_staff_setups',
      'IDX_SHIFTS_STAFF_SETUPS_SHIFT_ID'
    );
    await queryRunner.dropIndex(
      'shifts_staff_setups',
      'IDX_SHIFTS_STAFF_SETUPS_STAFF_SETUP_ID'
    );
    await queryRunner.dropIndex(
      'shifts_staff_setups',
      'IDX_SHIFTS_STAFF_SETUPS_CREATED_BY'
    );
    // SHIFTS STAFF SETUPS
    // SHIFTS VEHICLES
    await queryRunner.dropIndex('shifts_slots', 'IDX_SHIFTS_VEHICLES_SHIFT_ID');
    await queryRunner.dropIndex(
      'shifts_slots',
      'IDX_SHIFTS_VEHICLES_VEHICLE_ID'
    );
    await queryRunner.dropIndex(
      'shifts_slots',
      'IDX_SHIFTS_VEHICLES_CREATED_BY'
    );
    // SHIFTS VEHICLES
    // SOURCES
    await queryRunner.dropIndex('sources', 'IDX_SOURCES_TENANT_ID');
    await queryRunner.dropIndex('sources', 'IDX_SOURCES_CREATED_BY');
    // SOURCES
    // STAFF
    await queryRunner.dropIndex('staff', 'IDX_STAFF_TENANT_ID');
    await queryRunner.dropIndex('staff', 'IDX_STAFF_CREATED_BY');
    await queryRunner.dropIndex('staff', 'IDX_STAFF_PREFIX');
    await queryRunner.dropIndex('staff', 'IDX_STAFF_SUFFIX');
    await queryRunner.dropIndex('staff', 'IDX_STAFF_CLASSIFICATION_ID');
    await queryRunner.dropIndex('staff', 'IDX_STAFF_COLLECTION_OPERATION_ID');
    // STAFF
    // STAFF CERTIFICATION
    await queryRunner.dropIndex(
      'staff_certification',
      'IDX_STAFF_CERTIFICATION_CREATED_BY'
    );
    await queryRunner.dropIndex(
      'staff_certification',
      'IDX_STAFF_CERTIFICATION_STAFF_ID'
    );
    await queryRunner.dropIndex(
      'staff_certification',
      'IDX_STAFF_CERTIFICATION_CERTIFICATE_ID'
    );
    await queryRunner.dropIndex(
      'staff_certification',
      'IDX_STAFF_CERTIFICATION_TENANT_ID'
    );
    // STAFF CERTIFICATION
    // STAFF CLASSIFICATION
    await queryRunner.dropIndex(
      'staff_classification',
      'IDX_STAFF_CLASSIFICATION_CREATED_BY'
    );
    await queryRunner.dropIndex(
      'staff_classification',
      'IDX_STAFF_CLASSIFICATION_STAFF_ID'
    );
    await queryRunner.dropIndex(
      'staff_classification',
      'IDX_STAFF_CLASSIFICATION_TENANT_ID'
    );
    await queryRunner.dropIndex(
      'staff_classification',
      'IDX_STAFF_CLASSIFICATION_STAFFING_CLASSIFICATION_ID'
    );
    // STAFF CLASSIFICATION
    // STAFF COLLECTION OPERATIONS
    await queryRunner.dropIndex(
      'staff_collection_operations',
      'IDX_STAFF_COLLECTION_OPERATIONS_STAFF_ID'
    );
    await queryRunner.dropIndex(
      'staff_collection_operations',
      'IDX_STAFF_COLLECTION_OPERATIONS_COLLECTION_OPERATION_ID'
    );
    await queryRunner.dropIndex(
      'staff_collection_operations',
      'IDX_STAFF_COLLECTION_OPERATIONS_TENANT_ID'
    );
    await queryRunner.dropIndex(
      'staff_collection_operations',
      'IDX_STAFF_COLLECTION_OPERATIONS_CREATED_BY'
    );
    // STAFF COLLECTION OPERATIONS
    // STAFF CONFIG
    await queryRunner.dropIndex(
      'staff_config',
      'IDX_STAFF_CONFIG_STAFF_SETUP_ID'
    );
    await queryRunner.dropIndex(
      'staff_config',
      'IDX_STAFF_CONFIG_CONTACT_ROLE_ID'
    );
    await queryRunner.dropIndex('staff_config', 'IDX_STAFF_CONFIG_TENANT_ID');
    // STAFF CONFIG
    // STAFF DONOR CENTERS MAPPING
    await queryRunner.dropIndex(
      'staff_donor_centers_mapping',
      'IDX_STAFF_DONOR_CENTERS_MAPPING_CREATED_BY'
    );
    await queryRunner.dropIndex(
      'staff_donor_centers_mapping',
      'IDX_STAFF_DONOR_CENTERS_MAPPING_TENANT_ID'
    );
    await queryRunner.dropIndex(
      'staff_donor_centers_mapping',
      'IDX_STAFF_DONOR_CENTERS_MAPPING_STAFF_ID'
    );
    await queryRunner.dropIndex(
      'staff_donor_centers_mapping',
      'IDX_STAFF_DONOR_CENTERS_MAPPING_DONOR_CENTER_ID'
    );
    // STAFF DONOR CENTERS MAPPING
    // STAFF LEAVE
    await queryRunner.dropIndex('staff_leave', 'IDX_STAFF_LEAVE_CREATED_BY');
    await queryRunner.dropIndex('staff_leave', 'IDX_STAFF_LEAVE_STAFF_ID');
    await queryRunner.dropIndex('staff_leave', 'IDX_STAFF_LEAVE_TENANT_ID');
    // STAFF LEAVE
    // STAFF ROLES MAPPING
    await queryRunner.dropIndex(
      'staff_roles_mapping',
      'IDX_STAFF_ROLES_MAPPING_CREATED_BY'
    );
    await queryRunner.dropIndex(
      'staff_roles_mapping',
      'IDX_STAFF_ROLES_MAPPING_TENANT_ID'
    );
    await queryRunner.dropIndex(
      'staff_roles_mapping',
      'IDX_STAFF_ROLES_MAPPING_STAFF_ID'
    );
    await queryRunner.dropIndex(
      'staff_roles_mapping',
      'IDX_STAFF_ROLES_MAPPING_ROLE_ID'
    );
    // STAFF ROLES MAPPING
    // STAFF SETUP
    await queryRunner.dropIndex(
      'staff_setup',
      'IDX_STAFF_SETUP_PROCEDURE_TYPE_ID'
    );
    await queryRunner.dropIndex('staff_setup', 'IDX_STAFF_SETUP_TENANT_ID');
    await queryRunner.dropIndex('staff_setup', 'IDX_STAFF_SETUP_CREATED_BY');
    // STAFF SETUP
    // STAFF SHIFT SCHEDULE
    await queryRunner.dropIndex(
      'staff_shift_schedule',
      'IDX_STAFF_SHIFT_SCHEDULE_CREATED_BY'
    );
    await queryRunner.dropIndex(
      'staff_shift_schedule',
      'IDX_STAFF_SHIFT_SCHEDULE_STAFF_ID'
    );
    await queryRunner.dropIndex(
      'staff_shift_schedule',
      'IDX_STAFF_SHIFT_SCHEDULE_TENANT_ID'
    );
    // STAFF SHIFT SCHEDULE
    // STAFFING CLASSIFICATION
    await queryRunner.dropIndex(
      'staffing_classification',
      'IDX_STAFFING_CLASSIFICATION_TENANT_ID'
    );
    await queryRunner.dropIndex(
      'staffing_classification',
      'IDX_STAFFING_CLASSIFICATION_CREATED_BY'
    );
    // STAFFING CLASSIFICATION
    // STAFFING CLASSIFICATION SETTING
    await queryRunner.dropIndex(
      'staffing_classification_setting',
      'IDX_STAFFING_CLASSIFICATION_SETTING_CLASSIFICATION_ID'
    );
    await queryRunner.dropIndex(
      'staffing_classification_setting',
      'IDX_STAFFING_CLASSIFICATION_SETTING_CREATED_BY'
    );
    await queryRunner.dropIndex(
      'staffing_classification_setting',
      'IDX_STAFFING_CLASSIFICATION_SETTING_TENANT_ID'
    );
    // STAFFING CLASSIFICATION SETTING
    // STAGES
    await queryRunner.dropIndex('stages', 'IDX_STAGES_TENANT_ID');
    await queryRunner.dropIndex('stages', 'IDX_STAGES_CREATED_BY');
    // STAGES
    // SUFFIXES
    await queryRunner.dropIndex('suffixes', 'IDX_SUFFIXES_CREATED_BY');
    // SUFFIXES
  }
}
