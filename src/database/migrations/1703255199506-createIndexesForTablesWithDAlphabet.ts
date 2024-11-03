import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class CreateIndexesForTablesWithDAlphabet1703255199506
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Index for DailyCapacity table
    await queryRunner.createIndex(
      'daily_capacity',
      new TableIndex({
        name: 'IDX_DAILY_CAPACITY_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Index for DailyGoalsAllocations table
    await queryRunner.createIndex(
      'daily_goals_allocations',
      new TableIndex({
        name: 'IDX_DAILY_GOALS_ALLOCATIONS_PROCEDURE_TYPE_ID',
        columnNames: ['procedure_type_id'],
      })
    );

    await queryRunner.createIndex(
      'daily_goals_allocations',
      new TableIndex({
        name: 'IDX_DAILY_GOALS_ALLOCATIONS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Index for DailyGoalsCalenders table
    await queryRunner.createIndex(
      'daily_goals_calenders',
      new TableIndex({
        name: 'IDX_DAILY_GOALS_CALENDERS_PROCEDURE_TYPE_ID',
        columnNames: ['procedure_type_id'],
      })
    );

    await queryRunner.createIndex(
      'daily_goals_calenders',
      new TableIndex({
        name: 'IDX_DAILY_GOALS_CALENDERS_COLLECTION_OPERATION',
        columnNames: ['collection_operation'],
      })
    );

    await queryRunner.createIndex(
      'daily_goals_calenders',
      new TableIndex({
        name: 'IDX_DAILY_GOALS_CALENDERS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Index for DailyHour table
    await queryRunner.createIndex(
      'daily_hour',
      new TableIndex({
        name: 'IDX_DAILY_HOUR_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Index for Device table
    await queryRunner.createIndex(
      'device',
      new TableIndex({
        name: 'IDX_DEVICE_DEVICE_TYPE_ID',
        columnNames: ['device_type_id'],
      })
    );

    await queryRunner.createIndex(
      'device',
      new TableIndex({
        name: 'IDX_DEVICE_REPLACE_DEVICE',
        columnNames: ['replace_device'],
      })
    );

    await queryRunner.createIndex(
      'device',
      new TableIndex({
        name: 'IDX_DEVICE_COLLECTION_OPERATION',
        columnNames: ['collection_operation'],
      })
    );

    await queryRunner.createIndex(
      'device',
      new TableIndex({
        name: 'IDX_DEVICE_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'device',
      new TableIndex({
        name: 'IDX_DEVICE_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Index for DeviceMaintenance table
    await queryRunner.createIndex(
      'device_maintenance',
      new TableIndex({
        name: 'IDX_DEVICE_MAINTENANCE_DEVICE',
        columnNames: ['device'],
      })
    );

    await queryRunner.createIndex(
      'device_maintenance',
      new TableIndex({
        name: 'IDX_DEVICE_MAINTENANCE_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'device_maintenance',
      new TableIndex({
        name: 'IDX_DEVICE_MAINTENANCE_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Indexes for DeviceShare table
    await queryRunner.createIndex(
      'device_share',
      new TableIndex({
        name: 'IDX_DEVICE_SHARE_DEVICE',
        columnNames: ['device'],
      })
    );

    await queryRunner.createIndex(
      'device_share',
      new TableIndex({
        name: 'IDX_DEVICE_SHARE_FROM',
        columnNames: ['from'],
      })
    );

    await queryRunner.createIndex(
      'device_share',
      new TableIndex({
        name: 'IDX_DEVICE_SHARE_TO',
        columnNames: ['to'],
      })
    );

    await queryRunner.createIndex(
      'device_share',
      new TableIndex({
        name: 'IDX_DEVICE_SHARE_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'device_share',
      new TableIndex({
        name: 'IDX_DEVICE_SHARE_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Indexes for DeviceType table
    await queryRunner.createIndex(
      'device_type',
      new TableIndex({
        name: 'IDX_DEVICE_TYPE_PROCEDURE_TYPE',
        columnNames: ['procedure_type'],
      })
    );

    await queryRunner.createIndex(
      'device_type',
      new TableIndex({
        name: 'IDX_DEVICE_TYPE_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'device_type',
      new TableIndex({
        name: 'IDX_DEVICE_TYPE_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Indexes for Directions table
    await queryRunner.createIndex(
      'location_directions',
      new TableIndex({
        name: 'IDX_DIRECTIONS_COLLECTION_OPERATION_ID',
        columnNames: ['collection_operation_id'],
      })
    );

    await queryRunner.createIndex(
      'location_directions',
      new TableIndex({
        name: 'IDX_DIRECTIONS_LOCATION_ID',
        columnNames: ['location_id'],
      })
    );

    await queryRunner.createIndex(
      'location_directions',
      new TableIndex({
        name: 'IDX_DIRECTIONS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    await queryRunner.createIndex(
      'location_directions',
      new TableIndex({
        name: 'IDX_DIRECTIONS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Indexes for DonorCenterBluePrints table
    await queryRunner.createIndex(
      'donor_center_blueprints',
      new TableIndex({
        name: 'IDX_DONORCENTERBLUEPRINTS_DONORCENTER_ID',
        columnNames: ['donorcenter_id'],
      })
    );

    await queryRunner.createIndex(
      'donor_center_blueprints',
      new TableIndex({
        name: 'IDX_DONORCENTERBLUEPRINTS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Indexes for DonorCenterCodes table
    await queryRunner.createIndex(
      'donor_center_codes',
      new TableIndex({
        name: 'IDX_DONORCENTERCODES_DONOR_ID',
        columnNames: ['donor_id'],
      })
    );

    await queryRunner.createIndex(
      'donor_center_codes',
      new TableIndex({
        name: 'IDX_DONORCENTERCODES_CENTER_CODE_ID',
        columnNames: ['center_code_id'],
      })
    );

    await queryRunner.createIndex(
      'donor_center_codes',
      new TableIndex({
        name: 'IDX_DONORCENTERCODES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Indexes for DonorCenterFilter table
    await queryRunner.createIndex(
      'donor_center_filter',
      new TableIndex({
        name: 'IDX_DONORCENTERFILTER_COLLECTION_OPERATION',
        columnNames: ['collection_operation'],
      })
    );

    await queryRunner.createIndex(
      'donor_center_filter',
      new TableIndex({
        name: 'IDX_DONORCENTERFILTER_ORGANIZATIONAL_LEVEL',
        columnNames: ['organizational_level'],
      })
    );

    // Indexes for DonorGroupCodes table
    await queryRunner.createIndex(
      'donor_group_codes',
      new TableIndex({
        name: 'IDX_DONORGROUPCODES_DONOR_ID',
        columnNames: ['donor_id'],
      })
    );

    await queryRunner.createIndex(
      'donor_group_codes',
      new TableIndex({
        name: 'IDX_DONORGROUPCODES_GROUP_CODE_ID',
        columnNames: ['group_code_id'],
      })
    );

    await queryRunner.createIndex(
      'donor_group_codes',
      new TableIndex({
        name: 'IDX_DONORGROUPCODES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Indexes for Donors table
    await queryRunner.createIndex(
      'donors',
      new TableIndex({
        name: 'IDX_DONORS_PREFIX_ID',
        columnNames: ['prefix_id'],
      })
    );

    await queryRunner.createIndex(
      'donors',
      new TableIndex({
        name: 'IDX_DONORS_SUFFIX_ID',
        columnNames: ['suffix_id'],
      })
    );

    await queryRunner.createIndex(
      'donors',
      new TableIndex({
        name: 'IDX_DONORS_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Indexes for DonorsActivities table
    await queryRunner.createIndex(
      'donors_activities',
      new TableIndex({
        name: 'IDX_DONORS_ACTIVITIES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'donors_activities',
      new TableIndex({
        name: 'IDX_DONORS_ACTIVITIES_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    // Indexes for DonorsAppointments table
    await queryRunner.createIndex(
      'donors_appointments',
      new TableIndex({
        name: 'IDX_DONORS_APPOINTMENTS_DONOR_ID',
        columnNames: ['donor_id'],
      })
    );

    await queryRunner.createIndex(
      'donors_appointments',
      new TableIndex({
        name: 'IDX_DONORS_APPOINTMENTS_SLOT_ID',
        columnNames: ['slot_id'],
      })
    );

    await queryRunner.createIndex(
      'donors_appointments',
      new TableIndex({
        name: 'IDX_DONORS_APPOINTMENTS_PROCEDURE_TYPE_ID',
        columnNames: ['procedure_type_id'],
      })
    );

    // Indexes for DonorsAssertionCodes table
    await queryRunner.createIndex(
      'donors_assertion_codes',
      new TableIndex({
        name: 'IDX_DONORS_ASSERTION_CODES_DONOR_ID',
        columnNames: ['donor_id'],
      })
    );

    await queryRunner.createIndex(
      'donors_assertion_codes',
      new TableIndex({
        name: 'IDX_DONORS_ASSERTION_CODES_ASSERTION_CODE_ID',
        columnNames: ['assertion_code_id'],
      })
    );

    await queryRunner.createIndex(
      'donors_assertion_codes',
      new TableIndex({
        name: 'IDX_DONORS_ASSERTION_CODES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Indexes for DonorDonations table
    await queryRunner.createIndex(
      'donors_donations',
      new TableIndex({
        name: 'IDX_DONORS_DONATIONS_DONOR_ID',
        columnNames: ['donor_id'],
      })
    );

    await queryRunner.createIndex(
      'donors_donations',
      new TableIndex({
        name: 'IDX_DONORS_DONATIONS_DONATION_TYPE',
        columnNames: ['donation_type'],
      })
    );

    await queryRunner.createIndex(
      'donors_donations',
      new TableIndex({
        name: 'IDX_DONORS_DONATIONS_ACCOUNT_ID',
        columnNames: ['account_id'],
      })
    );

    await queryRunner.createIndex(
      'donors_donations',
      new TableIndex({
        name: 'IDX_DONORS_DONATIONS_SESSIONS_ID',
        columnNames: ['sessions_id'],
      })
    );

    await queryRunner.createIndex(
      'donors_donations',
      new TableIndex({
        name: 'IDX_DONORS_DONATIONS_DRIVE_ID',
        columnNames: ['drive_id'],
      })
    );

    await queryRunner.createIndex(
      'donors_donations',
      new TableIndex({
        name: 'IDX_DONORS_DONATIONS_FACILITY_ID',
        columnNames: ['facility_id'],
      })
    );

    // Indexes for DonorsEligibilities table
    await queryRunner.createIndex(
      'donors_eligibilities',
      new TableIndex({
        name: 'IDX_DONORS_ELIGIBILITIES_DONOR_ID',
        columnNames: ['donor_id'],
      })
    );

    await queryRunner.createIndex(
      'donors_eligibilities',
      new TableIndex({
        name: 'IDX_DONORS_ELIGIBILITIES_DONATION_TYPE',
        columnNames: ['donation_type'],
      })
    );

    await queryRunner.createIndex(
      'donors_eligibilities',
      new TableIndex({
        name: 'IDX_DONORS_ELIGIBILITIES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // Indexes for Drives table
    await queryRunner.createIndex(
      'drives',
      new TableIndex({
        name: 'IDX_DRIVES_ACCOUNT_ID',
        columnNames: ['account_id'],
      })
    );

    await queryRunner.createIndex(
      'drives',
      new TableIndex({
        name: 'IDX_DRIVES_LOCATION_ID',
        columnNames: ['location_id'],
      })
    );

    await queryRunner.createIndex(
      'drives',
      new TableIndex({
        name: 'IDX_DRIVES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    await queryRunner.createIndex(
      'drives',
      new TableIndex({
        name: 'IDX_DRIVES_PROMOTION_ID',
        columnNames: ['promotion_id'],
      })
    );

    await queryRunner.createIndex(
      'drives',
      new TableIndex({
        name: 'IDX_DRIVES_OPERATION_STATUS_ID',
        columnNames: ['operation_status_id'],
      })
    );

    await queryRunner.createIndex(
      'drives',
      new TableIndex({
        name: 'IDX_DRIVES_RECRUITER_ID',
        columnNames: ['recruiter_id'],
      })
    );

    // Indexes for DrivesCertifications table
    await queryRunner.createIndex(
      'drives_certifications',
      new TableIndex({
        name: 'IDX_DRIVES_CERTIFICATIONS_DRIVE_ID',
        columnNames: ['drive_id'],
      })
    );

    await queryRunner.createIndex(
      'drives_certifications',
      new TableIndex({
        name: 'IDX_DRIVES_CERTIFICATIONS_CERTIFICATION_ID',
        columnNames: ['certification_id'],
      })
    );

    // Indexes for DrivesContacts table
    await queryRunner.createIndex(
      'drives_contacts',
      new TableIndex({
        name: 'IDX_DRIVES_CONTACTS_DRIVE_ID',
        columnNames: ['drive_id'],
      })
    );

    await queryRunner.createIndex(
      'drives_contacts',
      new TableIndex({
        name: 'IDX_DRIVES_CONTACTS_ACCOUNTS_CONTACTS_ID',
        columnNames: ['accounts_contacts_id'],
      })
    );

    await queryRunner.createIndex(
      'drives_contacts',
      new TableIndex({
        name: 'IDX_DRIVES_CONTACTS_ROLE_ID',
        columnNames: ['role_id'],
      })
    );

    // Indexes for DrivesDonorCommsSupplementalAccounts table
    await queryRunner.createIndex(
      'drives_donor_comms_supp_accounts',
      new TableIndex({
        name: 'IDX_DRIVES_DONOR_COMMS_SUPP_ACCOUNTS_DRIVE_ID',
        columnNames: ['drive_id'],
      })
    );

    await queryRunner.createIndex(
      'drives_donor_comms_supp_accounts',
      new TableIndex({
        name: 'IDX_DRIVES_DONOR_COMMS_SUPP_ACCOUNTS_ACCOUNT_ID',
        columnNames: ['account_id'],
      })
    );

    await queryRunner.createIndex(
      'drives_donor_comms_supp_accounts',
      new TableIndex({
        name: 'IDX_DRIVES_DONOR_COMMS_SUPP_ACCOUNTS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    // Indexes for DrivesEquipments table
    await queryRunner.createIndex(
      'drives_equipments',
      new TableIndex({
        name: 'IDX_DRIVES_EQUIPMENTS_DRIVE_ID',
        columnNames: ['drive_id'],
      })
    );

    await queryRunner.createIndex(
      'drives_equipments',
      new TableIndex({
        name: 'IDX_DRIVES_EQUIPMENTS_EQUIPMENT_ID',
        columnNames: ['equipment_id'],
      })
    );

    // Indexes for DrivesMarketingMaterialItems table
    await queryRunner.createIndex(
      'drives_marketing_material_items',
      new TableIndex({
        name: 'IDX_DRIVES_MARKETING_MATERIAL_ITEMS_DRIVE_ID',
        columnNames: ['drive_id'],
      })
    );

    await queryRunner.createIndex(
      'drives_marketing_material_items',
      new TableIndex({
        name: 'IDX_DRIVES_MARKETING_MATERIAL_ITEMS_MARKETING_MATERIAL_ID',
        columnNames: ['marketing_material_id'],
      })
    );

    await queryRunner.createIndex(
      'drives_marketing_material_items',
      new TableIndex({
        name: 'IDX_DRIVES_MARKETING_MATERIAL_ITEMS_MARKETING_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    // Indexes for DrivesPromotionalItems table
    await queryRunner.createIndex(
      'drives_promotional_items',
      new TableIndex({
        name: 'IDX_DRIVES_PROMOTIONAL_ITEMS_DRIVE_ID',
        columnNames: ['drive_id'],
      })
    );

    await queryRunner.createIndex(
      'drives_promotional_items',
      new TableIndex({
        name: 'IDX_DRIVES_PROMOTIONAL_ITEMS_PROMOTIONAL_ITEM_ID',
        columnNames: ['promotional_item_id'],
      })
    );

    await queryRunner.createIndex(
      'drives_promotional_items',
      new TableIndex({
        name: 'IDX_DRIVES_PROMOTIONAL_ITEMS_CREATED_BY',
        columnNames: ['created_by'],
      })
    );

    // Indexes for DrivesZipCodes table
    await queryRunner.createIndex(
      'drives_zipcodes',
      new TableIndex({
        name: 'IDX_DRIVES_ZIPCODES_DRIVE_ID',
        columnNames: ['drive_id'],
      })
    );

    // Indexes for Duplicates table
    await queryRunner.createIndex(
      'duplicates',
      new TableIndex({
        name: 'IDX_DUPLICATES_TENANT_ID',
        columnNames: ['tenant_id'],
      })
    );

    // // Indexes for DonorsDonationsHospital table
    // await queryRunner.createIndex(
    //     'donors_donations_hospital',
    //     new TableIndex({
    //       name: 'IDX_DUPLICATES_DONORS_DONATIONS_ID',
    //       columnNames: ['donors_donations_id'],
    //     })
    //   );

    // // Indexes for DonorCenters table
    // await queryRunner.createIndex(
    //     'donor_centers',
    //     new TableIndex({
    //       name: 'IDX_DONOR_CENTERS_CREATED_BY',
    //       columnNames: ['ceated_by'],
    //     })
    //   );

    // Indexes for DailyHourCollectionOperations table
    await queryRunner.createIndex(
      'daily_hour_collection_operations',
      new TableIndex({
        name: 'IDX_DAILY_HOUR_COLLECTION_OPERATIONS_DAILY_HOUR_ID',
        columnNames: ['daily_hour_id'],
      })
    );

    await queryRunner.createIndex(
      'daily_hour_collection_operations',
      new TableIndex({
        name: 'IDX_DAILY_HOUR_COLLECTION_OPERATIONS_BUSINESS_UNIT_ID',
        columnNames: ['business_unit_id'],
      })
    );

    // Indexes for DailyGoalsCollectionOperations table
    await queryRunner.createIndex(
      'daily_goals_collection_operations',
      new TableIndex({
        name: 'IDX_DAILY_GOALS_COLLECTION_OPERATIONS_DAILY_GOALS_ALLOCATION_ID',
        columnNames: ['daily_goals_allocation_id'],
      })
    );

    await queryRunner.createIndex(
      'daily_goals_collection_operations',
      new TableIndex({
        name: 'IDX_DAILY_GOALS_COLLECTION_OPERATIONS_BUSINESS_UNIT_ID',
        columnNames: ['business_unit_id'],
      })
    );

    // Indexes for DailyGoalsCalenderOperations table
    // await queryRunner.createIndex(
    //   'daily_goals_calender_operations',
    //   new TableIndex({
    //     name: 'IDX_DAILY_GOALS_CALENDER_OPERATIONS_DAILY_GOALS_CALENDER_ID',
    //     columnNames: ['daily_goals_calender_id'],
    //   })
    // );

    // await queryRunner.createIndex(
    //   'daily_goals_calender_operations',
    //   new TableIndex({
    //     name: 'IDX_DAILY_GOALS_CALENDER_OPERATIONS_BUSINESS_UNIT_ID',
    //     columnNames: ['business_unit_id'],
    //   })
    // );

    // Indexes for DailyCapacityCollectionOperations table
    await queryRunner.createIndex(
      'daily_capacity_collection_operations',
      new TableIndex({
        name: 'IDX_DAILY_CAPACITY_COLLECTION_OPERATIONS_DAILY_CAPACITY_ID',
        columnNames: ['daily_capacity_id'],
      })
    );

    await queryRunner.createIndex(
      'daily_capacity_collection_operations',
      new TableIndex({
        name: 'IDX_DAILY_CAPACITY_COLLECTION_OPERATIONS_BUSINESS_UNIT_ID',
        columnNames: ['business_unit_id'],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index for DailyCapacity table
    await queryRunner.dropIndex(
      'daily_capacity',
      'IDX_DAILY_CAPACITY_TENANT_ID'
    );

    // Drop index for DailyGoalsAllocations table
    await queryRunner.dropIndex(
      'daily_goals_allocations',
      'IDX_DAILY_GOALS_ALLOCATIONS_PROCEDURE_TYPE_ID'
    );

    await queryRunner.dropIndex(
      'daily_goals_allocations',
      'IDX_DAILY_GOALS_ALLOCATIONS_TENANT_ID'
    );

    // Drop indexes for DailyGoalsCalenders table
    await queryRunner.dropIndex(
      'daily_goals_calenders',
      'IDX_DAILY_GOALS_CALENDERS_PROCEDURE_TYPE_ID'
    );

    await queryRunner.dropIndex(
      'daily_goals_calenders',
      'IDX_DAILY_GOALS_CALENDERS_COLLECTION_OPERATION'
    );

    await queryRunner.dropIndex(
      'daily_goals_calenders',
      'IDX_DAILY_GOALS_CALENDERS_TENANT_ID'
    );

    // Drop index for DailyHour table
    await queryRunner.dropIndex('daily_hour', 'IDX_DAILY_HOUR_TENANT_ID');

    // Drop indexes for Device table
    await queryRunner.dropIndex('device', 'IDX_DEVICE_DEVICE_TYPE_ID');
    await queryRunner.dropIndex('device', 'IDX_DEVICE_REPLACE_DEVICE');
    await queryRunner.dropIndex('device', 'IDX_DEVICE_COLLECTION_OPERATION');
    await queryRunner.dropIndex('device', 'IDX_DEVICE_CREATED_BY');
    await queryRunner.dropIndex('device', 'IDX_DEVICE_TENANT_ID');

    // Drop indexes for DeviceMaintenance table
    await queryRunner.dropIndex(
      'device_maintenance',
      'IDX_DEVICE_MAINTENANCE_DEVICE'
    );
    await queryRunner.dropIndex(
      'device_maintenance',
      'IDX_DEVICE_MAINTENANCE_CREATED_BY'
    );
    await queryRunner.dropIndex(
      'device_maintenance',
      'IDX_DEVICE_MAINTENANCE_TENANT_ID'
    );

    // Drop indexes for DeviceShare table
    await queryRunner.dropIndex('device_share', 'IDX_DEVICE_SHARE_DEVICE');
    await queryRunner.dropIndex('device_share', 'IDX_DEVICE_SHARE_FROM');
    await queryRunner.dropIndex('device_share', 'IDX_DEVICE_SHARE_TO');
    await queryRunner.dropIndex('device_share', 'IDX_DEVICE_SHARE_CREATED_BY');
    await queryRunner.dropIndex('device_share', 'IDX_DEVICE_SHARE_TENANT_ID');

    // Drop indexes for DeviceType table
    await queryRunner.dropIndex(
      'device_type',
      'IDX_DEVICE_TYPE_PROCEDURE_TYPE'
    );
    await queryRunner.dropIndex('device_type', 'IDX_DEVICE_TYPE_CREATED_BY');
    await queryRunner.dropIndex('device_type', 'IDX_DEVICE_TYPE_TENANT_ID');

    // Drop indexes for Directions table
    await queryRunner.dropIndex(
      'location_directions',
      'IDX_DIRECTIONS_COLLECTION_OPERATION_ID'
    );
    await queryRunner.dropIndex(
      'location_directions',
      'IDX_DIRECTIONS_LOCATION_ID'
    );
    await queryRunner.dropIndex(
      'location_directions',
      'IDX_DIRECTIONS_CREATED_BY'
    );
    await queryRunner.dropIndex(
      'location_directions',
      'IDX_DIRECTIONS_TENANT_ID'
    );

    // Drop indexes for DonorCenterBluePrints table
    await queryRunner.dropIndex(
      'donor_center_blueprints',
      'IDX_DONORCENTERBLUEPRINTS_DONORCENTER_ID'
    );
    await queryRunner.dropIndex(
      'donor_center_blueprints',
      'IDX_DONORCENTERBLUEPRINTS_TENANT_ID'
    );

    // Drop indexes for DonorCenterCodes table
    await queryRunner.dropIndex(
      'donor_center_codes',
      'IDX_DONORCENTERCODES_DONOR_ID'
    );

    await queryRunner.dropIndex(
      'donor_center_codes',
      'IDX_DONORCENTERCODES_CENTER_CODE_ID'
    );

    await queryRunner.dropIndex(
      'donor_center_codes',
      'IDX_DONORCENTERCODES_TENANT_ID'
    );

    // Drop indexes for DonorCenterFilter table
    await queryRunner.dropIndex(
      'donor_center_filter',
      'IDX_DONORCENTERFILTER_COLLECTION_OPERATION'
    );

    await queryRunner.dropIndex(
      'donor_center_filter',
      'IDX_DONORCENTERFILTER_ORGANIZATIONAL_LEVEL'
    );

    // Drop indexes for DonorGroupCodes table
    await queryRunner.dropIndex(
      'donor_group_codes',
      'IDX_DONORGROUPCODES_DONOR_ID'
    );

    await queryRunner.dropIndex(
      'donor_group_codes',
      'IDX_DONORGROUPCODES_GROUP_CODE_ID'
    );

    await queryRunner.dropIndex(
      'donor_group_codes',
      'IDX_DONORGROUPCODES_TENANT_ID'
    );

    // Drop indexes for Donors table
    await queryRunner.dropIndex('donors', 'IDX_DONORS_PREFIX_ID');
    await queryRunner.dropIndex('donors', 'IDX_DONORS_SUFFIX_ID');
    await queryRunner.dropIndex('donors', 'IDX_DONORS_TENANT_ID');

    // Drop indexes for DonorsActivities table
    await queryRunner.dropIndex(
      'donors_activities',
      'IDX_DONORS_ACTIVITIES_TENANT_ID'
    );
    await queryRunner.dropIndex(
      'donors_activities',
      'IDX_DONORS_ACTIVITIES_CREATED_BY'
    );

    // Drop indexes for DonorsAppointments table
    await queryRunner.dropIndex(
      'donors_appointments',
      'IDX_DONORS_APPOINTMENTS_DONOR_ID'
    );
    await queryRunner.dropIndex(
      'donors_appointments',
      'IDX_DONORS_APPOINTMENTS_SLOT_ID'
    );
    await queryRunner.dropIndex(
      'donors_appointments',
      'IDX_DONORS_APPOINTMENTS_PROCEDURE_TYPE_ID'
    );

    // Drop indexes for DonorsAssertionCodes table
    await queryRunner.dropIndex(
      'donors_assertion_codes',
      'IDX_DONORS_ASSERTION_CODES_DONOR_ID'
    );
    await queryRunner.dropIndex(
      'donors_assertion_codes',
      'IDX_DONORS_ASSERTION_CODES_ASSERTION_CODE_ID'
    );
    await queryRunner.dropIndex(
      'donors_assertion_codes',
      'IDX_DONORS_ASSERTION_CODES_TENANT_ID'
    );

    // Drop indexes for DonorDonations table
    await queryRunner.dropIndex(
      'donors_donations',
      'IDX_DONORS_DONATIONS_DONOR_ID'
    );
    await queryRunner.dropIndex(
      'donors_donations',
      'IDX_DONORS_DONATIONS_DONATION_TYPE'
    );
    await queryRunner.dropIndex(
      'donors_donations',
      'IDX_DONORS_DONATIONS_ACCOUNT_ID'
    );
    await queryRunner.dropIndex(
      'donors_donations',
      'IDX_DONORS_DONATIONS_SESSIONS_ID'
    );
    await queryRunner.dropIndex(
      'donors_donations',
      'IDX_DONORS_DONATIONS_DRIVE_ID'
    );
    await queryRunner.dropIndex(
      'donors_donations',
      'IDX_DONORS_DONATIONS_FACILITY_ID'
    );

    // Drop indexes for DonorsEligibilities table
    await queryRunner.dropIndex(
      'donors_eligibilities',
      'IDX_DONORS_ELIGIBILITIES_DONOR_ID'
    );
    await queryRunner.dropIndex(
      'donors_eligibilities',
      'IDX_DONORS_ELIGIBILITIES_DONATION_TYPE'
    );
    await queryRunner.dropIndex(
      'donors_eligibilities',
      'IDX_DONORS_ELIGIBILITIES_TENANT_ID'
    );

    // Drop indexes for Drives table
    await queryRunner.dropIndex('drives', 'IDX_DRIVES_ACCOUNT_ID');
    await queryRunner.dropIndex('drives', 'IDX_DRIVES_LOCATION_ID');
    await queryRunner.dropIndex('drives', 'IDX_DRIVES_TENANT_ID');
    await queryRunner.dropIndex('drives', 'IDX_DRIVES_PROMOTION_ID');
    await queryRunner.dropIndex('drives', 'IDX_DRIVES_OPERATION_STATUS_ID');
    await queryRunner.dropIndex('drives', 'IDX_DRIVES_RECRUITER_ID');

    // Drop indexes for DrivesCertifications table
    await queryRunner.dropIndex(
      'drives_certifications',
      'IDX_DRIVES_CERTIFICATIONS_DRIVE_ID'
    );
    await queryRunner.dropIndex(
      'drives_certifications',
      'IDX_DRIVES_CERTIFICATIONS_CERTIFICATION_ID'
    );

    // Drop indexes for DrivesContacts table
    await queryRunner.dropIndex(
      'drives_contacts',
      'IDX_DRIVES_CONTACTS_DRIVE_ID'
    );
    await queryRunner.dropIndex(
      'drives_contacts',
      'IDX_DRIVES_CONTACTS_ACCOUNTS_CONTACTS_ID'
    );
    await queryRunner.dropIndex(
      'drives_contacts',
      'IDX_DRIVES_CONTACTS_ROLE_ID'
    );

    // Drop indexes for DrivesDonorCommsSupplementalAccounts table
    await queryRunner.dropIndex(
      'drives_donor_comms_supp_accounts',
      'IDX_DRIVES_DONOR_COMMS_SUPP_ACCOUNTS_DRIVE_ID'
    );
    await queryRunner.dropIndex(
      'drives_donor_comms_supp_accounts',
      'IDX_DRIVES_DONOR_COMMS_SUPP_ACCOUNTS_ACCOUNT_ID'
    );
    await queryRunner.dropIndex(
      'drives_donor_comms_supp_accounts',
      'IDX_DRIVES_DONOR_COMMS_SUPP_ACCOUNTS_CREATED_BY'
    );

    // Drop indexes for DrivesEquipments table
    await queryRunner.dropIndex(
      'drives_equipments',
      'IDX_DRIVES_EQUIPMENTS_DRIVE_ID'
    );
    await queryRunner.dropIndex(
      'drives_equipments',
      'IDX_DRIVES_EQUIPMENTS_EQUIPMENT_ID'
    );

    // Drop indexes for DrivesMarketingMaterialItems table
    await queryRunner.dropIndex(
      'drives_marketing_material_items',
      'IDX_DRIVES_MARKETING_MATERIAL_ITEMS_DRIVE_ID'
    );
    await queryRunner.dropIndex(
      'drives_marketing_material_items',
      'IDX_DRIVES_MARKETING_MATERIAL_ITEMS_MARKETING_MATERIAL_ID'
    );
    await queryRunner.dropIndex(
      'drives_marketing_material_items',
      'IDX_DRIVES_MARKETING_MATERIAL_ITEMS_MARKETING_CREATED_BY'
    );

    // Drop indexes for DrivesPromotionalItems table
    await queryRunner.dropIndex(
      'drives_promotional_items',
      'IDX_DRIVES_PROMOTIONAL_ITEMS_DRIVE_ID'
    );
    await queryRunner.dropIndex(
      'drives_promotional_items',
      'IDX_DRIVES_PROMOTIONAL_ITEMS_PROMOTIONAL_ITEM_ID'
    );
    await queryRunner.dropIndex(
      'drives_promotional_items',
      'IDX_DRIVES_PROMOTIONAL_ITEMS_CREATED_BY'
    );

    // Drop indexes for DrivesZipCodes table
    await queryRunner.dropIndex(
      'drives_zipcodes',
      'IDX_DRIVES_ZIPCODES_DRIVE_ID'
    );

    // Drop indexes for Duplicates table_TYPE
    await queryRunner.dropIndex('duplicates', 'IDX_DUPLICATES_TENANT_ID');

    // // Drop Indexes for DonorsDonationsHospital table
    // await queryRunner.dropIndex('donors_donations_hospital', 'IDX_DUPLICATES_DONORS_DONATIONS_ID');

    // // Drop Indexes for DonorCenters table
    // await queryRunner.dropIndex('donor_centers', 'IDX_DONOR_CENTERS_CREATED_BY');

    // Drop Indexes for DailyHourCollectionOperations table
    await queryRunner.dropIndex(
      'daily_hour_collection_operations',
      'IDX_DAILY_HOUR_COLLECTION_OPERATIONS_DAILY_HOUR_ID'
    );
    await queryRunner.dropIndex(
      'daily_hour_collection_operations',
      'IDX_DAILY_HOUR_COLLECTION_OPERATIONS_BUSINESS_UNIT_ID'
    );

    // Drop Indexes for DailyGoalsCollectionOperations table
    await queryRunner.dropIndex(
      'daily_goals_collection_operations',
      'IDX_DAILY_GOALS_COLLECTION_OPERATIONS_DAILY_GOALS_ALLOCATION_ID'
    );
    await queryRunner.dropIndex(
      'daily_goals_collection_operations',
      'IDX_DAILY_GOALS_COLLECTION_OPERATIONS_BUSINESS_UNIT_ID'
    );

    // Drop Indexes for DailyGoalsCalenderOperations table
    // await queryRunner.dropIndex(
    //   'daily_goals_calender_operations',
    //   'IDX_DAILY_GOALS_CALENDER_OPERATIONS_DAILY_GOALS_CALENDER_ID'
    // );
    // await queryRunner.dropIndex(
    //   'daily_goals_calender_operations',
    //   'IDX_DAILY_GOALS_CALENDER_OPERATIONS_BUSINESS_UNIT_ID'
    // );

    // Drop Indexes for DailyCapacityCollectionOperations table
    await queryRunner.dropIndex(
      'daily_capacity_collection_operations',
      'IDX_DAILY_CAPACITY_COLLECTION_OPERATIONS_DAILY_CAPACITY_ID'
    );
    await queryRunner.dropIndex(
      'daily_capacity_collection_operations',
      'IDX_DAILY_CAPACITY_COLLECTION_OPERATIONS_BUSINESS_UNIT_ID'
    );
  }
}
