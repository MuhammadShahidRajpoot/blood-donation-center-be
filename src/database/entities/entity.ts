import { Qualification } from 'src/api/crm/locations/qualification/entities/qualification.entity';
import { Staff } from 'src/api/crm/contacts/staff/entities/staff.entity';
import { StaffHistory } from 'src/api/crm/contacts/staff/entities/staff-history.entity';
import { StaffRolesMapping } from 'src/api/crm/contacts/staff/staffRolesMapping/entities/staff-roles-mapping.entity';
import { StaffRolesMappingHistory } from 'src/api/crm/contacts/staff/staffRolesMapping/entities/staff-roles-mapping-history.entity';
import { StaffDonorCentersMapping } from 'src/api/crm/contacts/staff/staffDonorCentersMapping/entities/staff-donor-centers-mapping.entity';
import { StaffDonorCentersMappingHistory } from 'src/api/crm/contacts/staff/staffDonorCentersMapping/entities/staff-donor-centers-mapping-history.entity';
import { EmailTemplate } from '../../api/admin/email-template/entities/email-template.entity';
import { Templates } from '../../api/admin/templates/entities/templates.entity';
import { Auth } from '../../api/common/auth/entity/auth.entity';
import { AccountContacts } from 'src/api/crm/accounts/entities/accounts-contacts.entity';
import { AccountsHistory } from 'src/api/crm/accounts/entities/accounts-history.entity';
import { AttachmentsFiles } from 'src/api/crm/common/documents/attachment/entities/attachment-files.entity';
import { CrmAttachmentsHistory } from 'src/api/crm/common/documents/attachment/entities/attachment-history.entity';
import { CrmAttachments } from 'src/api/crm/common/documents/attachment/entities/attachment.entity';
import { ContactsHistory } from 'src/api/crm/contacts/common/entities/contacts-history.entity';
import { Contacts } from 'src/api/crm/contacts/common/entities/contacts.entity';
import { Prefixes } from 'src/api/crm/contacts/common/prefixes/entities/prefixes.entity';
import { Suffixes } from 'src/api/crm/contacts/common/suffixes/entities/suffixes.entity';
import { DonorsHistory } from 'src/api/crm/contacts/donor/entities/donors-history.entity';
import { Donors } from 'src/api/crm/contacts/donor/entities/donors.entity';
import { CRMVolunteerHistory } from 'src/api/crm/contacts/volunteer/entities/crm-volunteer-history.entity';
import { CRMVolunteer } from 'src/api/crm/contacts/volunteer/entities/crm-volunteer.entity';
import { CrmNonCollectionProfilesHistory } from 'src/api/crm/crm-non-collection-profiles/entities/crm-non-collection-profile-history.entity';
import { CrmNonCollectionProfiles } from 'src/api/crm/crm-non-collection-profiles/entities/crm-non-collection-profiles.entity';
import { Directions } from 'src/api/crm/locations/directions/entities/direction.entity';
import { CrmLocationsHistory } from 'src/api/crm/locations/entities/crm-locations-history';
import { CrmLocationsSpecsHistory } from 'src/api/crm/locations/entities/crm-locations-specs-history.entity';
import { CrmLocationsSpecsOptionsHistory } from 'src/api/crm/locations/entities/crm-locations-specs-options-history.entity';
import { CrmLocationsSpecsOptions } from 'src/api/crm/locations/entities/crm-locations-specs-options.entity';
import { CrmLocationsSpecs } from 'src/api/crm/locations/entities/crm-locations-specs.entity';
import { CrmLocations } from 'src/api/crm/locations/entities/crm-locations.entity';
import { NonCollectionEvents } from 'src/api/operations-center/operations/non-collection-events/entities/oc-non-collection-events.entity';
import { Sessions } from 'src/api/operations-center/operations/sessions/entities/sessions.entity';
import { SessionsHistory } from 'src/api/operations-center/operations/sessions/entities/sessions-history.entity';
import { SessionsPromotions } from 'src/api/operations-center/operations/sessions/entities/sessions-promotions.entity';
import { SessionsPromotionsHistory } from 'src/api/operations-center/operations/sessions/entities/sessions-promotions-history.entity';
import { StagesHistory } from 'src/api/system-configuration/tenants-administration/crm-administration/account/stages/entities/stage-history.entity';
import { Alias } from 'src/api/system-configuration/tenants-administration/crm-administration/alias/entities/alias.entity';
import { Locations } from 'src/api/system-configuration/tenants-administration/crm-administration/locations/location/entity/location.entity';
import { DailyCapacity } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/daily-capacity/entities/daily-capacity.entity';
import { DailyHourHistory } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/daily-hour/entities/daily-hour-history.entity';
import { DailyHour } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/daily-hour/entities/daily-hour.entity';
import { OperationsStatusHistory } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status_history.entity';
import { TaskManagementHistory } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/task-management/entities/task-management-history.entity';
import { TaskManagement } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/task-management/entities/task-management.entity';
import { GoalVarianceHistory } from 'src/api/system-configuration/tenants-administration/operations-administration/calendar/goal-variance/entities/goal-variance-history.entity';
import { GoalVariance } from 'src/api/system-configuration/tenants-administration/operations-administration/calendar/goal-variance/entities/goal-variance.entity';
import { EquipmentHistory } from 'src/api/system-configuration/tenants-administration/operations-administration/manage-equipment/equipment/entity/equipment-history.entity';
import { AprovalsHistory } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/approvals/entity/approvals-history.entity';
import { Approval } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/approvals/entity/approvals.entity';
import { DailyGoalsCalendersHistory } from 'src/api/system-configuration/tenants-administration/organizational-administration/goals/daily-goals-calender/entity/daily-goals-calender-history.entity';
import { DonorCenterFilter } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/entity/donor_center.entity';
import { StaffConfig } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/StaffConfig.entity';
import { StaffConfigHistory } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/StaffConfigHistory.entity';
import { StaffSetup } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/staffSetup.entity';
import { StaffSetupHistory } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/staffSetupHistory.entity';
import { TeamCollectionOperation } from 'src/api/system-configuration/tenants-administration/staffing-administration/teams/entity/team-collection-operation.entity';
import { TasksHistory } from 'src/api/tasks/entities/tasks-history.entity';
import { Tasks } from 'src/api/tasks/entities/tasks.entity';
import { Accounts } from '../../api/crm/accounts/entities/accounts.entity';
import { NotesHistory } from '../../api/crm/common/documents/notes/entities/note-history.entity';
import { Notes } from '../../api/crm/common/documents/notes/entities/note.entity';
import { MenuItems } from '../../api/donor-portal/menu-items/entities/menu-items.entity';
import UserEvents from '../../api/system-configuration/logs-events/entities/user-event.entity';
import { Applications } from '../../api/system-configuration/platform-administration/roles-administration/application/entities/application.entity';
import { Modules } from '../../api/system-configuration/platform-administration/roles-administration/role-permissions/entities/module.entity';
import { Permissions } from '../../api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { Roles } from '../../api/system-configuration/platform-administration/roles-administration/role-permissions/entities/role.entity';
import { RolesHistory } from '../../api/system-configuration/platform-administration/roles-administration/role-permissions/entities/roleHistory';
import { RolePermission } from '../../api/system-configuration/platform-administration/roles-administration/role-permissions/entities/rolePermission.entity';
import { TenantRole } from '../../api/system-configuration/platform-administration/roles-administration/role-permissions/entities/tenantRole.entity';
import { Address } from '../../api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { AddressHistory } from '../../api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/addressHistory.entity';
import { Tenant } from '../../api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { TenantConfigurationDetail } from '../../api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenantConfigurationDetail';
import { TenantConfigurationDetailHistory } from '../../api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenantConfigurationDetailHistory';
import { TenantHistory } from '../../api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenantHistory.entity';
import { LeavesTypes } from '../../api/system-configuration/staffing-administration/leave-type/entities/leave-types.entity';
import { LeavesTypesHistory } from '../../api/system-configuration/staffing-administration/leave-type/entities/leaves-types-history.entity';
import { Affiliation } from '../../api/system-configuration/tenants-administration/crm-administration/account/affiliation/entity/affiliation.entity';
import { AffiliationHistory } from '../../api/system-configuration/tenants-administration/crm-administration/account/affiliation/entity/affiliationHistory.entity';
import { IndustryCategoriesHistory } from '../../api/system-configuration/tenants-administration/crm-administration/account/industry-categories/entities/industry-categories-history.entity';
import { IndustryCategories } from '../../api/system-configuration/tenants-administration/crm-administration/account/industry-categories/entities/industry-categories.entity';
import { SourcesHistory } from '../../api/system-configuration/tenants-administration/crm-administration/account/sources/entities/sources-history.entity';
import { Sources } from '../../api/system-configuration/tenants-administration/crm-administration/account/sources/entities/sources.entity';
import { Stages } from '../../api/system-configuration/tenants-administration/crm-administration/account/stages/entities/stages.entity';
import { Category } from '../../api/system-configuration/tenants-administration/crm-administration/common/entity/category.entity';
import { CategoryHistory } from '../../api/system-configuration/tenants-administration/crm-administration/common/entity/categoryhistory.entity';
import { ContactsRolesHistory } from '../../api/system-configuration/tenants-administration/crm-administration/contacts/role/entities/contact-role-history.entity';
import { ContactsRoles } from '../../api/system-configuration/tenants-administration/crm-administration/contacts/role/entities/contacts-role.entity';
import { RoomSizesHistory } from '../../api/system-configuration/tenants-administration/crm-administration/locations/room-sizes/entity/roomSizesHistory.entity';
import { RoomSize } from '../../api/system-configuration/tenants-administration/crm-administration/locations/room-sizes/entity/roomsizes.entity';
import { TerritoryHistory } from '../../api/system-configuration/tenants-administration/geo-administration/territories/entities/territories-history.entity';
import { Territory } from '../../api/system-configuration/tenants-administration/geo-administration/territories/entities/territories.entity';
import { AuditFields } from '../../api/system-configuration/tenants-administration/operations-administration/audit-fields/entities/audit-fields.entity';
import { BookingRules } from '../../api/system-configuration/tenants-administration/operations-administration/booking-drives/booking-rules/entities/booking-rules.entity';
import { BookingRulesAddField } from '../../api/system-configuration/tenants-administration/operations-administration/booking-drives/booking-rules/entities/booking_rules_add_field.entity';
import { DailyCapacityHistory } from '../../api/system-configuration/tenants-administration/operations-administration/booking-drives/daily-capacity/entities/daily-capacity-history.entity';
import { OperationsStatus } from '../../api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { BannerCollectionOperation } from '../../api/system-configuration/tenants-administration/operations-administration/calendar/banners/entities/banner-collection-operations.entity';
import { BannerHistory } from '../../api/system-configuration/tenants-administration/operations-administration/calendar/banners/entities/banner-history.entity';
import { Banner } from '../../api/system-configuration/tenants-administration/operations-administration/calendar/banners/entities/banner.entity';
import { CloseDateCollectionOperation } from '../../api/system-configuration/tenants-administration/operations-administration/calendar/close-dates/entities/close-date-collection-operations.entity';
import { CloseDateHistory } from '../../api/system-configuration/tenants-administration/operations-administration/calendar/close-dates/entities/close-date-history.entity';
import { CloseDate } from '../../api/system-configuration/tenants-administration/operations-administration/calendar/close-dates/entities/close-date.entity';
import { LockDateCollectionOperation } from '../../api/system-configuration/tenants-administration/operations-administration/calendar/lock-dates/entities/lock-date-collection-operations.entity';
import { LockDateHistory } from '../../api/system-configuration/tenants-administration/operations-administration/calendar/lock-dates/entities/lock-date-history.entity';
import { LockDate } from '../../api/system-configuration/tenants-administration/operations-administration/calendar/lock-dates/entities/lock-date.entity';
import { EquipmentCollectionOperationEntity } from '../../api/system-configuration/tenants-administration/operations-administration/manage-equipment/equipment/entity/equipment-collection-operations.entity';
import { EquipmentEntity } from '../../api/system-configuration/tenants-administration/operations-administration/manage-equipment/equipment/entity/equipment.entity';
import { MarketingMaterialsHistory } from '../../api/system-configuration/tenants-administration/operations-administration/marketing-equipment/marketing-material/entities/marketing-material-history.entity';
import { MarketingMaterials } from '../../api/system-configuration/tenants-administration/operations-administration/marketing-equipment/marketing-material/entities/marketing-material.entity';
import { PromotionalItemCollectionOperationHistory } from '../../api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotional-items/entities/promotional-item-collection-operations-history.entity';
import { PromotionalItemCollectionOperation } from '../../api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotional-items/entities/promotional-item-collection-operations.entity';
import { PromotionalItemsHistory } from '../../api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotional-items/entities/promotional-item-history.entity';
import { PromotionalItems } from '../../api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotional-items/entities/promotional-item.entity';
import { PromotionsCollectionOperation } from '../../api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotions/entity/promotions-collection-operations.entity';
import { PromotionHistory } from '../../api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotions/entity/promotions-history.entity';
import { PromotionEntity } from '../../api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotions/entity/promotions.entity';
import { AdsHistory } from '../../api/system-configuration/tenants-administration/organizational-administration/content-management-system/ads/entities/ads-history.entity';
import { Ads } from '../../api/system-configuration/tenants-administration/organizational-administration/content-management-system/ads/entities/ads.entity';
import { DailyGoalsAllocationHistory } from '../../api/system-configuration/tenants-administration/organizational-administration/goals/daily-goals-allocation/entities/daily-goals-allocation-history.entity';
import { DailyGoalsAllocations } from '../../api/system-configuration/tenants-administration/organizational-administration/goals/daily-goals-allocation/entities/daily-goals-allocation.entity';
import { DailyGoalsCalenders } from '../../api/system-configuration/tenants-administration/organizational-administration/goals/daily-goals-calender/entity/daily-goals-calender.entity';
import { MonthlyGoalsHistory } from '../../api/system-configuration/tenants-administration/organizational-administration/goals/monthly-goals/entities/monthly-goals-history.entity';
import { MonthlyGoals } from '../../api/system-configuration/tenants-administration/organizational-administration/goals/monthly-goals/entities/monthly-goals.entity';
import { PerformanceRulesHistory } from '../../api/system-configuration/tenants-administration/organizational-administration/goals/performance-rules/entities/performance-rules-history.entity';
import { PerformanceRules } from '../../api/system-configuration/tenants-administration/organizational-administration/goals/performance-rules/entities/performance-rules.entity';
import { BusinessUnitsHistory } from '../../api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units-history.entity';
import { BusinessUnits } from '../../api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { OrganizationalLevelsHistory } from '../../api/system-configuration/tenants-administration/organizational-administration/hierarchy/organizational-levels/entities/organizational-level-history.entity';
import { OrganizationalLevels } from '../../api/system-configuration/tenants-administration/organizational-administration/hierarchy/organizational-levels/entities/organizational-level.entity';
import { ProcedureTypesHistory } from '../../api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types-history.entity';
import { ProcedureTypesProducts } from '../../api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types-products.entity';
import { ProcedureTypes } from '../../api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { Procedure } from '../../api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedures/entities/procedure.entity';
import { ProcedureHistory } from '../../api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedures/entities/procedures-history.entity';
import { ProceduresProducts } from '../../api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedures/entities/procedures-products.entity';
import { Products } from '../../api/system-configuration/tenants-administration/organizational-administration/products-procedures/products/entities/products.entity';
import { ProductsHistory } from '../../api/system-configuration/tenants-administration/organizational-administration/products-procedures/products/entities/productsHistory.entity';
import { DeviceType } from '../../api/system-configuration/tenants-administration/organizational-administration/resources/device-type/entity/device-type.entity';
import { DeviceTypeHistory } from '../../api/system-configuration/tenants-administration/organizational-administration/resources/device-type/entity/deviceTypeHistory';
import { DeviceHistory } from '../../api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device-history.entity';
import { DeviceMaintenance } from '../../api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device-maintenance.entity';
import { DeviceShare } from '../../api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device-share.entity';
import { Device } from '../../api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device.entity';
import { Facility } from '../../api/system-configuration/tenants-administration/organizational-administration/resources/facilities/entity/facility.entity';
import { FacilityHistory } from '../../api/system-configuration/tenants-administration/organizational-administration/resources/facilities/entity/facilityHistory.entity';
import { VehicleTypeHistory } from '../../api/system-configuration/tenants-administration/organizational-administration/resources/vehicle-type/entities/vehicle-type-history.entity';
import { VehicleType } from '../../api/system-configuration/tenants-administration/organizational-administration/resources/vehicle-type/entities/vehicle-type.entity';
import { VehicleCertification } from '../../api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle-certification.entity';
import { VehicleHistory } from '../../api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle-history.entity';
import { VehicleMaintenance } from '../../api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle-maintenance.entity';
import { VehicleShare } from '../../api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle-share.entity';
import { Vehicle } from '../../api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle.entity';
import { CertificationHistory } from '../../api/system-configuration/tenants-administration/staffing-administration/certification/entity/certification-history.entity';
import { Certification } from '../../api/system-configuration/tenants-administration/staffing-administration/certification/entity/certification.entity';
import { StaffingClassificationSettingHistory } from '../../api/system-configuration/tenants-administration/staffing-administration/classification-settings/entity/setting-history.entity';
import { StaffingClassificationSetting } from '../../api/system-configuration/tenants-administration/staffing-administration/classification-settings/entity/setting.entity';
import { StaffingClassificationHistory } from '../../api/system-configuration/tenants-administration/staffing-administration/classifications/entity/classification-history.entity';
import { StaffingClassification } from '../../api/system-configuration/tenants-administration/staffing-administration/classifications/entity/classification.entity';
import { TeamStaffHistory } from '../../api/system-configuration/tenants-administration/staffing-administration/teams/entity/team-staff-history';
import { TeamStaff } from '../../api/system-configuration/tenants-administration/staffing-administration/teams/entity/team-staff.entiity';
import { Team } from '../../api/system-configuration/tenants-administration/staffing-administration/teams/entity/team.entity';
import { TeamHistory } from '../../api/system-configuration/tenants-administration/staffing-administration/teams/entity/teamHistory';
import { User } from '../../api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { UserHistory } from '../../api/system-configuration/tenants-administration/user-administration/user/entity/userhistory.entity';
import { UserBusinessUnits } from '../../api/system-configuration/tenants-administration/user-administration/user/entity/user-business-units.entity';
import { UserBusinessUnitsHistory } from '../../api/system-configuration/tenants-administration/user-administration/user/entity/user-business-units-history.entity';
import { Drives } from 'src/api/operations-center/operations/drives/entities/drives.entity';
import { DrivesHistory } from 'src/api/operations-center/operations/drives/entities/drives-history.entity';
import { LinkedDrives } from 'src/api/operations-center/operations/drives/entities/linked-drives.entity';
import { LinkedDrivesHistory } from 'src/api/operations-center/operations/drives/entities/linked-drives-history.entity';
import { DrivesMarketingMaterialItems } from 'src/api/operations-center/operations/drives/entities/drives-marketing-material-items.entity';
import { DrivesMarketingMaterialItemsHistory } from 'src/api/operations-center/operations/drives/entities/drives-marketing-material-items-history.entity';
import { DrivesPromotionalItems } from 'src/api/operations-center/operations/drives/entities/drives_promotional_items.entity';
import { DrivesPromotionalItemsHistory } from 'src/api/operations-center/operations/drives/entities/drives_promotional_items_history.entity';
import { ShiftsHistory } from 'src/api/shifts/entities/shifts-history.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { ShiftsVehicles } from 'src/api/shifts/entities/shifts-vehicles.entity';
import { ShiftsVehiclesHistory } from 'src/api/shifts/entities/shifts-vehicles-history.entity';
import { ShiftsStaffSetups } from 'src/api/shifts/entities/shifts-staffsetups.entity';
import { ShiftsStaffSetupsHistory } from 'src/api/shifts/entities/shifts-staffsetups-history.entity';
import { ShiftsSlots } from 'src/api/shifts/entities/shifts-slots.entity';
import { ShiftsSlotsHistory } from 'src/api/shifts/entities/shifts-slots-history.entity';
import { ShiftsProjectionsStaff } from 'src/api/shifts/entities/shifts-projections-staff.entity';
import { ShiftsProjectionsStaffHistory } from 'src/api/shifts/entities/shifts-projections-staff-history.entity';
import { ShiftsDevices } from 'src/api/shifts/entities/shifts-devices.entity';
import { DrivesDonorCommunicationSupplementalAccounts } from 'src/api/operations-center/operations/drives/entities/drives-donor-comms-supp-accounts.entity';
import { DrivesDonorCommunicationSupplementalAccountsHistory } from 'src/api/operations-center/operations/drives/entities/drives-donor-comms-supp-accounts-history.entity';
import { DrivesZipCodes } from 'src/api/operations-center/operations/drives/entities/drives-zipcodes.entity';
import { DrivesZipCodesHistory } from 'src/api/operations-center/operations/drives/entities/drives-zipcodes-history.entity';
import { FilterCriteria } from 'src/api/crm/Filters/entities/filter_criteria';
import { FilterSaved } from 'src/api/crm/Filters/entities/filter_saved';
import { FilterSavedCriteria } from 'src/api/crm/Filters/entities/filter_saved_criteria';
import { StaffCertification } from 'src/api/system-configuration/tenants-administration/staffing-administration/certification/entity/staff-certification.entity';
import { StaffCertificationHistory } from 'src/api/system-configuration/tenants-administration/staffing-administration/certification/entity/staff-certification-history.entity';
import { StaffCollectionOperation } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff/entity/staff-collection-operation.entity';
import { AccountContactsHistory } from 'src/api/crm/accounts/entities/accounts-contacts-history.entity';
import { StaffLeave } from 'src/api/crm/contacts/staff/staffLeave/entity/staff-leave.entity';
import { StaffLeaveHistory } from 'src/api/crm/contacts/staff/staffLeave/entity/staff-leave-history.entity';
import { DrivesEquipments } from 'src/api/operations-center/operations/drives/entities/drives-equipment.entity';
import { DrivesEquipmentHistory } from 'src/api/operations-center/operations/drives/entities/drives-equipment-history.entity';
import { DrivesCertifications } from 'src/api/operations-center/operations/drives/entities/drives-certifications.entity';
import { DrivesCertificationsHistory } from 'src/api/operations-center/operations/drives/entities/drives-certifications-history.entity';
import { DrivesContacts } from 'src/api/operations-center/operations/drives/entities/drive-contacts.entity';
import { DrivesContactsHistory } from 'src/api/operations-center/operations/drives/entities/drive-contacts-history.entity';
import { AccountPreferences } from 'src/api/crm/accounts/entities/account-preferences.entity';
import { AccountPreferencesHistory } from 'src/api/crm/accounts/entities/account-preferences-history.entity';
import { AccountAffiliations } from 'src/api/crm/accounts/entities/account-affiliations.entity';
import { AccountAffilitaionsHistory } from 'src/api/crm/accounts/entities/account-affiliations-history.entity';
import { Duplicates } from 'src/api/common/entities/duplicates/duplicates.entity';
import { DuplicatesHistory } from 'src/api/common/entities/duplicates/duplicates-history.entity';
import { CustomFields } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-field.entity';
import { PickLists } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/pick-lists.entity';
import { CustomFieldsData } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-filed-data.entity';
import { CustomFieldsHistory } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custome-field-history.entity';
import { PickListsHistory } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/pick-lists-history.entity';
import { CustomFieldsDataHistory } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-filed-data-history';
import { DirectionsHistory } from 'src/api/crm/locations/directions/entities/direction-history.entity';
import { ShiftsRoles } from 'src/api/crm/crm-non-collection-profiles/blueprints/entities/shifts-roles.entity';
import { ShiftsRolesHistory } from 'src/api/crm/crm-non-collection-profiles/blueprints/entities/shifts-roles-history.entity';
import { CrmNcpBluePrints } from 'src/api/crm/crm-non-collection-profiles/blueprints/entities/ncp-blueprints.entity';
import { CrmNcpBluePrintsHistory } from 'src/api/crm/crm-non-collection-profiles/blueprints/entities/ncp-blueprints-history.entity';
import { ContactPreferences } from 'src/api/crm/contacts/common/contact-preferences/entities/contact-preferences';
import { ContactPreferencesHistory } from 'src/api/crm/contacts/common/contact-preferences/entities/contact-preferences-history';
import { Favorites } from 'src/api/operations-center/manage-favorites/entities/favorites.entity';
import { DonorGroupCodes } from 'src/api/crm/contacts/donor/entities/donor-group-codes.entity';
import { DonorGroupCodesHistory } from 'src/api/crm/contacts/donor/entities/donor-group-codes-history.entity';
import { DonorCenterCodes } from '../../api/crm/contacts/donor/entities/donor-center-codes.entity';
import { DonorCenterCodesHistory } from '../../api/crm/contacts/donor/entities/donor-center-codes-history.entity';
import { Communications } from 'src/api/crm/contacts/volunteer/communication/entities/communication.entity';
import { CommunicationsHistory } from 'src/api/crm/contacts/volunteer/communication/entities/communication-history.entity';
import { NonCollectionEventsHistory } from 'src/api/operations-center/operations/non-collection-events/entities/oc-non-collection-events-history.entity';
import { FavoritesHistory } from 'src/api/operations-center/manage-favorites/entities/favorites-history.entity';
import { TaskCollectionOperation } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/task-management/entities/task-management-collection-operation.entity';
import { DonorsActivities } from 'src/api/crm/contacts/donor/recent-activity/entities/recent-activity.entity';
import { DonorsAppointments } from 'src/api/crm/contacts/donor/entities/donors-appointments.entity';
import { DonorsAppointmentsHistory } from 'src/api/crm/contacts/donor/entities/donors-appointments-history.entity';
import { DonorDonations } from 'src/api/crm/contacts/donor/donorDonationHistory/entities/donor-donations.entity';
import { DonorDonationsHistory } from 'src/api/crm/contacts/donor/donorDonationHistory/entities/donor-donations-history.entity';
import { CRMVolunteerActivityLog } from 'src/api/crm/contacts/volunteer/entities/crm-volunteer-activity-log.entity';
import { DonorsAssertionCodes } from 'src/api/crm/contacts/donor/entities/donors-assertion-codes.entity';
import { DonorsAssertionCodesHistory } from 'src/api/crm/contacts/donor/entities/donors_assertion-codes-history.entity';
import { AssertionCodesHistory } from 'src/api/crm/contacts/donor/entities/assertion-codes-history.entity';
import { AssertionCodes } from 'src/api/crm/contacts/donor/entities/assertion-codes.entity';
import { StaffClassification } from 'src/api/crm/contacts/staff/staffClassification/entity/staff-classification.entity';
import { StaffClassificationHistory } from 'src/api/crm/contacts/staff/staffClassification/entity/staff-classification-history.entity';
import { StaffShiftScheduleHistory } from 'src/api/crm/contacts/staff/staffShiftSchedule/entity/staff-shift-schedule-history';
import { StaffShiftSchedule } from 'src/api/crm/contacts/staff/staffShiftSchedule/entity/staff-shift-schedule.entity';
import { StaffAssignments } from 'src/api/crm/contacts/staff/staffSchedule/entity/self-assignment.entity';
import { ShiftsDevicesHistory } from 'src/api/shifts/entities/shifts-devices-history.entity';
import { DonorCenterBluePrints } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/donor-center-blueprints/entity/donor_center_blueprint';
import { DonorCenterBluePrintsHistory } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/donor-center-blueprints/entity/donor_center_blueprint_history';
import { DonorDonationsHospitals } from 'src/api/crm/contacts/donor/donorDonationHistory/entities/donor-donations-hospitals.entity';
import { Hospitals } from 'src/api/crm/contacts/donor/donorDonationHistory/entities/hospitals.entity';
import { HospitalsHistory } from 'src/api/crm/contacts/donor/donorDonationHistory/entities/hospitals-history.entity';
import { Prospects } from 'src/api/operations-center/prospects/entities/prospects.entity';
import { ProspectsHistory } from 'src/api/operations-center/prospects/entities/prospects-history.entity';
import { ProspectsBlueprints } from 'src/api/operations-center/prospects/entities/prospects-blueprints.entity';
import { ProspectsBlueprintsHistory } from 'src/api/operations-center/prospects/entities/prospects-blueprints-history.entity';
import { ProspectsCommunications } from 'src/api/operations-center/prospects/entities/prospects-communications.entity';
import { ProspectsCommunicationsHistory } from 'src/api/operations-center/prospects/entities/prospects-communications-history.entity';
import { EmailTemplateHistory } from 'src/api/admin/email-template/entities/email-template-history.entity';
import { Pickups } from 'src/api/operations-center/operations/drives/entities/pickups.entity';
import { PickupsHistory } from 'src/api/operations-center/operations/drives/entities/pickups-history.entity';
import { ResourceSharings } from 'src/api/operations-center/resource-sharing/entities/resource-sharing.entity';
import { ResourceSharingsHistory } from 'src/api/operations-center/resource-sharing/entities/resource-sharing-history.entity';
import { Schedule } from 'src/api/staffing-management/build-schedules/entities/schedules.entity';
import { OcApprovals } from 'src/api/operations-center/approvals/entities/oc-approval.entity';
import { OcApprovalsHistory } from 'src/api/operations-center/approvals/entities/oc-approval-history.entity';
import { OcApprovalsDetail } from 'src/api/operations-center/approvals/entities/oc-approval-detail.entity';
import { OcApprovalsDetailHistory } from 'src/api/operations-center/approvals/entities/oc-approval-detail-history.entity';
import { ScheduleOperationStatus } from 'src/api/staffing-management/build-schedules/entities/schedule-operation-status.entity';
import { DataSyncBatchOperations } from 'src/api/bbcs_data_syncs/entities/data_sync_batch_operations.entity';
import { DonorsEligibilities } from 'src/api/crm/contacts/donor/entities/donor_eligibilities.entity';
import { ResourceSharingsFulfillment } from 'src/api/operations-center/resource-sharing/entities/resource-sharing-fullfilment.entity';
import { ResourceSharingsFulfillmentHistory } from 'src/api/operations-center/resource-sharing/entities/resource-sharing-fullfilment-history.entity';
import { ProspectsFilters } from 'src/api/operations-center/prospects/entities/prospects-filters.entity';
import { DonationsSummery } from 'src/api/operations-center/operations/sessions/results/entities/sessions-donation-summery.entity';
import { DonationsSummeryHistory } from 'src/api/operations-center/operations/sessions/results/entities/sessions-donations-summery-history.entity';
import { ScheduleHistory } from 'src/api/staffing-management/build-schedules/entities/schedule-history.entity';
import { ScheduleOperationStatusHistory } from 'src/api/staffing-management/build-schedules/entities/schedule-operation-status-history.entity';
import { SiteContactAssociations } from 'src/api/crm/contacts/staff/staffContactAssociation/entities/site-contact-associations.entity';
import { QualificationHistory } from 'src/api/crm/locations/qualification/entities/qualification-history.entity';
import { FavoritesOrganizationalLevels } from 'src/api/operations-center/manage-favorites/entities/favorites-org-levels.entity';
import { FavoritesOrganizationalLevelsHistory } from 'src/api/operations-center/manage-favorites/entities/favorites-org-levels-history.entity';
import { FavoritesRecruiters } from 'src/api/operations-center/manage-favorites/entities/favorites-recruiters';
import { FavoritesRecruitersHistory } from 'src/api/operations-center/manage-favorites/entities/favorites-recruiters-history';
import { ScheduleOperation } from 'src/api/staffing-management/build-schedules/entities/schedule_operation.entity';
import { DeviceAssignments } from 'src/api/staffing-management/build-schedules/entities/devices-assignment.entity';
import { CallCenterSettings } from 'src/api/system-configuration/tenants-administration/call-center-settings/entities/call-center-settings.entity';
import { CallCenterSettingsHistory } from 'src/api/system-configuration/tenants-administration/call-center-settings/entities/call-center-settings-history.entity';
import { VehiclesAssignments } from 'src/api/staffing-management/build-schedules/entities/vehicles-assignment.entity';
import { StaffAssignmentsDrafts } from 'src/api/staffing-management/build-schedules/entities/staff-assignments-drafts';
import { VehiclesAssignmentsDrafts } from 'src/api/staffing-management/build-schedules/entities/vehicles-assignment-drafts.entity';
import { DeviceAssignmentsDrafts } from 'src/api/staffing-management/build-schedules/entities/devices-assignment-drafts.entity';
import { ContaminationAlerts } from 'src/api/common/entities/contamination-alerts.entity';
import { BloodGroups } from 'src/api/crm/contacts/donor/entities/blood-group.entity';
import { BecsRaces } from 'src/api/crm/contacts/donor/entities/becs-race.entity';
import { TenantTimeZones } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant_time_zones.entity';
import { CallJobs } from 'src/api/call-center/call-schedule/call-jobs/entities/call-jobs.entity';
import { CallJobsAssociatedOperations } from 'src/api/call-center/call-schedule/call-jobs/entities/call-job-operation-association.entity';
import { CallOutcomes } from 'src/api/system-configuration/tenants-administration/call-outcomes/entities/call-outcomes.entity';
import { CallOutcomesHistory } from 'src/api/system-configuration/tenants-administration/call-outcomes/entities/call-outcomes-history.entity';
import { CallFlowsEntity } from 'src/api/system-configuration/tenants-administration/call-flows/entity/call-flows.entity';
import { CallFlowsEntityHistory } from 'src/api/system-configuration/tenants-administration/call-flows/entity/call-flows.entity-history';
import { ManageScripts } from 'src/api/call-center/manage-scripts/entities/manage-scripts.entity';
import { ManageScriptsHistory } from 'src/api/call-center/manage-scripts/entities/manage-scripts-history.entity';
import { GenericAttachmentsFiles } from 'src/api/common/entities/generic_attachment_file.entity';
import { Segments } from 'src/api/call-center/manage-segments/entities/segments.entity';
import { SegmentsHistory } from 'src/api/call-center/manage-segments/entities/segments-history.entity';
import { SegmentsContacts } from 'src/api/call-center/manage-segments/entities/segments-contacts.entity';
import { SegmentsContactsHistory } from 'src/api/call-center/manage-segments/entities/segments-contacts-history.entity';
import { CallJobsAgents } from 'src/api/call-center/call-schedule/call-jobs/entities/call-jobs-agents.entity';
import { CallJobsCallFlows } from 'src/api/call-center/call-schedule/call-jobs/entities/call-jobs-call-flows.entity';
import { CallJobsCallScripts } from 'src/api/call-center/call-schedule/call-jobs/entities/call-jobs-call-scripts.entity';
import { CallJobsCallSegments } from 'src/api/call-center/call-schedule/call-jobs/entities/call-jobs-call-segments.entity';
import { DialingCenterCallJobs } from 'src/api/call-center/dialing-center/entity/dialing-center-call-jobs.entity';
import { CallJobsHistory } from 'src/api/call-center/call-schedule/call-jobs/entities/call-jobs-history.entity';
import { Notifications } from 'src/api/staffing-management/build-schedules/entities/notifications.entity';
import { NotificationsStaff } from 'src/api/staffing-management/build-schedules/entities/notifications-staff.entity';
import { ScheduleJobConfiguration } from 'src/api/scheduler/entities/schedule_job_configuration.entity';
import { ScheduleJobDetails } from 'src/api/scheduler/entities/schedule_job_details.entity';
import { DialingCenterNotes } from 'src/api/call-center/dialing-center/entity/dailing-center-notes';
import { DonorsViewList } from 'src/api/crm/contacts/donor/entities/donors_list_view.entity';
import { ChangeAudits } from 'src/api/crm/contacts/common/entities/change-audits.entity';
import { FacilityViewList } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/entity/facility_list_view.entity';
import { VolunteerListView } from 'src/api/crm/contacts/volunteer/entities/crm-volunteer-list-view.entity';
import { AccountsListView } from 'src/api/crm/accounts/entities/accounts_list_view.entity';
import { TelerecruitmentRequests } from 'src/api/call-center/call-schedule/telerecruitment-requests/entities/telerecruitment-requests.entity';
import { CRMLocationsViewList } from 'src/api/crm/locations/entities/crm-locations-list-views';
import { DataSyncRecordExceptions } from 'src/api/bbcs_data_syncs/entities/data_sync_record_exceptions.entity';
import { CallJobContacts } from 'src/api/call-center/manage-segments/entities/call-job-contacts.entity';
import { WebHookAlerts } from 'src/api/common/dailyStory-webhooks/entities/ds-webhook.entity';
import { StaffListView } from 'src/api/crm/contacts/staff/entities/staff-list-view.entity';
import { Assertion } from 'src/api/system-configuration/tenants-administration/donor-assertion/entity/assertion.entity';
import { CallCenterUsers } from 'src/api/call-center/user/entity/call-center-users.entity';
import { PushNotifications } from 'src/api/notifications/entities/push-notifications.entity';
import { TargetNotifications } from 'src/api/notifications/entities/target-notifications.entity';
import { UserNotifications } from 'src/api/notifications/entities/user-notifications.entity';
import { AssertionHistory } from 'src/api/system-configuration/tenants-administration/donor-assertion/entity/assertion-history.entity';
import { DonorDuplicatesListView } from 'src/api/common/entities/duplicates/duplicates-list-view.entity';
import { DSDonorsViewList } from 'src/api/common/dailyStory-webhooks/entities/ds-webhook-donors-view';

export const entities = [
  Qualification,
  User,
  Auth,
  EmailTemplate,
  Templates,
  MenuItems,
  Tenant,
  Address,
  TenantConfigurationDetail,
  TenantConfigurationDetailHistory,
  TenantHistory,
  AddressHistory,
  Applications,
  Modules,
  EquipmentCollectionOperationEntity,
  Permissions,
  ProcedureTypes,
  ProcedureTypesHistory,
  Products,
  ProductsHistory,
  ProcedureTypesProducts,
  RolePermission,
  EquipmentEntity,
  Roles,
  TenantRole,
  OrganizationalLevels,
  DeviceType,
  Procedure,
  ProcedureHistory,
  ProceduresProducts,
  VehicleType,
  VehicleTypeHistory,
  Facility,
  FacilityHistory,
  Device,
  RolesHistory,
  UserHistory,
  OrganizationalLevelsHistory,
  DeviceTypeHistory,
  BusinessUnits,
  DeviceHistory,
  Category,
  BusinessUnitsHistory,
  EquipmentHistory,
  DailyGoalsAllocations,
  Vehicle,
  VehicleHistory,
  VehicleCertification,
  VehicleMaintenance,
  VehicleShare,
  MonthlyGoals,
  DeviceMaintenance,
  DeviceShare,
  MonthlyGoalsHistory,
  CategoryHistory,
  Territory,
  TerritoryHistory,
  Affiliation,
  AffiliationHistory,
  MonthlyGoalsHistory,
  IndustryCategories,
  IndustryCategoriesHistory,
  DailyGoalsAllocationHistory,
  DailyGoalsCalenders,
  UserEvents,
  MonthlyGoalsHistory,
  PerformanceRules,
  PerformanceRulesHistory,
  BookingRules,
  AuditFields,
  BookingRulesAddField,
  Ads,
  AdsHistory,
  ContactsRolesHistory,
  ContactsRoles,
  Banner,
  Stages,
  BannerHistory,
  BannerCollectionOperation,
  TaskManagement,
  RoomSize,
  RoomSizesHistory,
  OperationsStatus,
  Team,
  TeamHistory,
  Category,
  StaffingClassification,
  StaffingClassificationHistory,
  LockDate,
  LockDateHistory,
  LockDateCollectionOperation,
  LeavesTypes,
  Category,
  CategoryHistory,
  Alias,
  StaffingClassificationSetting,
  TeamCollectionOperation,
  Sources,
  SourcesHistory,
  MarketingMaterials,
  MarketingMaterialsHistory,
  OperationsStatusHistory,
  Certification,
  CertificationHistory,
  StaffCertification,
  StaffCertificationHistory,
  GoalVariance,
  GoalVarianceHistory,
  PromotionEntity,
  PromotionsCollectionOperation,
  StaffingClassificationSettingHistory,
  CloseDate,
  CloseDateHistory,
  CloseDateCollectionOperation,
  PromotionalItems,
  PromotionalItemsHistory,
  PromotionalItemCollectionOperation,
  StaffSetup,
  StaffSetupHistory,
  StaffConfigHistory,
  PromotionalItemCollectionOperationHistory,
  StaffConfig,
  StaffConfigHistory,
  PromotionHistory,
  Staff,
  StaffCollectionOperation,
  TeamStaff,
  DailyCapacity,
  Directions,
  DirectionsHistory,
  Locations,
  Accounts,
  AccountsListView,
  AccountContacts,
  StaffLeave,
  StaffLeaveHistory,
  Duplicates,
  DuplicatesHistory,
  AprovalsHistory,
  Approval,
  TeamStaffHistory,
  DailyCapacityHistory,
  Tasks,
  TasksHistory,
  Notes,
  NotesHistory,
  BusinessUnitsHistory,
  Contacts,
  ContactsHistory,
  CRMVolunteer,
  CRMVolunteerHistory,
  Prefixes,
  Suffixes,
  CrmLocations,
  CrmNonCollectionProfiles,
  TaskManagementHistory,
  LeavesTypesHistory,
  StagesHistory,
  Donors,
  DonorsHistory,
  DonorCenterFilter,
  AttachmentsFiles,
  CrmAttachments,
  CrmAttachmentsHistory,
  DailyHour,
  DailyHourHistory,
  CrmNonCollectionProfilesHistory,
  Drives,
  Sessions,
  SessionsHistory,
  SessionsPromotions,
  SessionsPromotionsHistory,
  NonCollectionEvents,
  AccountsHistory,
  AccountContactsHistory,
  Staff,
  StaffHistory,
  StaffRolesMapping,
  StaffRolesMappingHistory,
  StaffDonorCentersMapping,
  StaffDonorCentersMappingHistory,
  FilterCriteria,
  FilterSaved,
  FilterSavedCriteria,
  CrmLocationsHistory,
  CrmLocationsSpecs,
  CrmLocationsSpecsOptions,
  CrmLocationsSpecsOptionsHistory,
  CrmLocationsSpecsHistory,
  DailyGoalsCalendersHistory,
  DrivesHistory,
  LinkedDrives,
  LinkedDrivesHistory,
  DrivesMarketingMaterialItems,
  DrivesMarketingMaterialItemsHistory,
  DrivesEquipments,
  DrivesEquipmentHistory,
  DrivesCertifications,
  DrivesCertificationsHistory,
  DrivesPromotionalItems,
  DrivesPromotionalItemsHistory,
  DrivesContacts,
  DrivesContactsHistory,
  Shifts,
  ShiftsHistory,
  ShiftsVehicles,
  ShiftsVehiclesHistory,
  ShiftsStaffSetups,
  ShiftsStaffSetupsHistory,
  ShiftsSlots,
  ShiftsSlotsHistory,
  ShiftsProjectionsStaff,
  ShiftsProjectionsStaffHistory,
  ShiftsDevices,
  ShiftsDevicesHistory,
  DrivesDonorCommunicationSupplementalAccounts,
  DrivesDonorCommunicationSupplementalAccountsHistory,
  DrivesZipCodes,
  DrivesZipCodesHistory,
  AccountPreferences,
  AccountPreferencesHistory,
  AccountAffiliations,
  AccountAffilitaionsHistory,
  CustomFields,
  PickLists,
  CustomFieldsData,
  CustomFieldsHistory,
  PickListsHistory,
  CustomFieldsDataHistory,
  ShiftsRoles,
  ShiftsRolesHistory,
  CrmNcpBluePrints,
  CrmNcpBluePrintsHistory,
  ContactPreferences,
  ContactPreferencesHistory,
  Favorites,
  DonorGroupCodes,
  DonorGroupCodesHistory,
  DonorCenterCodes,
  DonorCenterCodesHistory,
  Communications,
  CommunicationsHistory,
  NonCollectionEventsHistory,
  FavoritesHistory,
  TaskCollectionOperation,
  DonorsActivities,
  DonorsAppointments,
  DonorsAppointmentsHistory,
  DonorDonations,
  DonorDonationsHistory,
  CRMVolunteerActivityLog,
  DonorCenterBluePrints,
  DonorsAssertionCodes,
  DonorsAssertionCodesHistory,
  AssertionCodesHistory,
  AssertionCodes,
  StaffClassification,
  StaffClassificationHistory,
  StaffShiftSchedule,
  StaffShiftScheduleHistory,
  StaffAssignments,
  DonorCenterBluePrintsHistory,
  DonorDonationsHospitals,
  Hospitals,
  HospitalsHistory,
  Prospects,
  ProspectsHistory,
  ProspectsBlueprints,
  ProspectsBlueprintsHistory,
  ProspectsCommunications,
  ProspectsCommunicationsHistory,
  EmailTemplateHistory,
  Pickups,
  PickupsHistory,
  ResourceSharings,
  ResourceSharingsHistory,
  Schedule,
  OcApprovals,
  OcApprovalsHistory,
  OcApprovalsDetail,
  OcApprovalsDetailHistory,
  ScheduleHistory,
  ScheduleOperationStatus,
  ScheduleOperationStatusHistory,
  UserBusinessUnits,
  UserBusinessUnitsHistory,
  DataSyncBatchOperations,
  DonorsEligibilities,
  ResourceSharingsFulfillment,
  ResourceSharingsFulfillmentHistory,
  ProspectsFilters,
  DonationsSummery,
  DonationsSummeryHistory,
  SiteContactAssociations,
  QualificationHistory,
  FavoritesOrganizationalLevels,
  FavoritesOrganizationalLevelsHistory,
  FavoritesRecruiters,
  FavoritesRecruitersHistory,
  ScheduleOperation,
  DeviceAssignments,
  CallCenterSettings,
  CallCenterSettingsHistory,
  VehiclesAssignments,
  StaffAssignmentsDrafts,
  TenantTimeZones,
  DeviceAssignmentsDrafts,
  VehiclesAssignmentsDrafts,
  ContaminationAlerts,
  BloodGroups,
  BecsRaces,
  CallJobs,
  CallJobsAssociatedOperations,
  CallOutcomes,
  CallOutcomesHistory,
  CallFlowsEntity,
  CallFlowsEntityHistory,
  ManageScripts,
  ManageScriptsHistory,
  GenericAttachmentsFiles,
  Segments,
  SegmentsHistory,
  SegmentsContacts,
  SegmentsContactsHistory,
  CallJobsAgents,
  CallJobsCallFlows,
  CallJobsCallScripts,
  CallJobsCallSegments,
  DialingCenterCallJobs,
  CallJobsHistory,
  Notifications,
  NotificationsStaff,
  ScheduleJobConfiguration,
  ScheduleJobDetails,
  DialingCenterNotes,
  DonorsViewList,
  FacilityViewList,
  ChangeAudits,
  VolunteerListView,
  CRMLocationsViewList,
  TelerecruitmentRequests,
  CRMLocationsViewList,
  DataSyncRecordExceptions,
  CallJobContacts,
  WebHookAlerts,
  DSDonorsViewList,
  StaffListView,
  Assertion,
  AssertionHistory,
  CallCenterUsers,
  PushNotifications,
  TargetNotifications,
  UserNotifications,
  DonorDuplicatesListView,
];
