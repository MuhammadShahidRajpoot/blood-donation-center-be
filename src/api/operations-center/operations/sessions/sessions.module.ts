import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { Sessions } from './entities/sessions.entity';
import { SessionsHistory } from './entities/sessions-history.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { PromotionEntity } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotions/entity/promotions.entity';
import { OperationsStatus } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { CustomFields } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-field.entity';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { Facility } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/entity/facility.entity';
import { SessionsPromotions } from './entities/sessions-promotions.entity';
import { SessionsPromotionsHistory } from './entities/sessions-promotions-history.entity';
import { ShiftsService } from 'src/api/shifts/services/shifts.service';
import { Vehicle } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle.entity';
import { ProcedureTypesProducts } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types-products.entity';
import { StaffSetup } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/staffSetup.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { ShiftsStaffSetups } from 'src/api/shifts/entities/shifts-staffsetups.entity';
import { ShiftsDevices } from 'src/api/shifts/entities/shifts-devices.entity';
import { ShiftsHistory } from 'src/api/shifts/entities/shifts-history.entity';
import { Products } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/products/entities/products.entity';
import { ShiftsProjectionsStaff } from 'src/api/shifts/entities/shifts-projections-staff.entity';
import { ShiftsProjectionsStaffHistory } from 'src/api/shifts/entities/shifts-projections-staff-history.entity';
import { ShiftsSlots } from 'src/api/shifts/entities/shifts-slots.entity';
import { ShiftsVehicles } from 'src/api/shifts/entities/shifts-vehicles.entity';
import { Device } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device.entity';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { Drives } from '../drives/entities/drives.entity';
import { DrivesService } from '../drives/service/drives.service';
import { DonorCenterBlueprintService } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/donor-center-blueprints/services/donor-center-blueprints.services';
import { DonorsService } from 'src/api/crm/contacts/donor/services/donors.service';
import { DonorsAppointments } from 'src/api/crm/contacts/donor/entities/donors-appointments.entity';
import { DrivesHistory } from '../drives/entities/drives-history.entity';
import { DriveContact } from '../drives/dto/create-drive.dto';
import { DrivesContacts } from '../drives/entities/drive-contacts.entity';
import { DrivesContactsHistory } from '../drives/entities/drive-contacts-history.entity';
import { DrivesCertifications } from '../drives/entities/drives-certifications.entity';
import { DrivesCertificationsHistory } from '../drives/entities/drives-certifications-history.entity';
import { DrivesEquipments } from '../drives/entities/drives-equipment.entity';
import { DrivesEquipmentHistory } from '../drives/entities/drives-equipment-history.entity';
import { LinkedDrives } from '../drives/entities/linked-drives.entity';
import { LinkedDrivesHistory } from '../drives/entities/linked-drives-history.entity';
import { Pickups } from '../drives/entities/pickups.entity';
import { PickupsHistory } from '../drives/entities/pickups-history.entity';
import { DrivesDonorCommunicationSupplementalAccounts } from '../drives/entities/drives-donor-comms-supp-accounts.entity';
import { Accounts } from 'src/api/crm/accounts/entities/accounts.entity';
import { CustomFieldsData } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-filed-data.entity';
import { CustomFieldsDataHistory } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-filed-data-history';
import { CrmLocations } from 'src/api/crm/locations/entities/crm-locations.entity';
import { AccountContacts } from 'src/api/crm/accounts/entities/accounts-contacts.entity';
import { ContactsRoles } from 'src/api/system-configuration/tenants-administration/crm-administration/contacts/role/entities/contacts-role.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { BookingRules } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/booking-rules/entities/booking-rules.entity';
import { VehicleType } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicle-type/entities/vehicle-type.entity';
import { DrivesZipCodes } from '../drives/entities/drives-zipcodes.entity';
import { DrivesZipCodesHistory } from '../drives/entities/drives-zipcodes-history.entity';
import { DrivesPromotionalItems } from '../drives/entities/drives_promotional_items.entity';
import { DrivesMarketingMaterialItems } from '../drives/entities/drives-marketing-material-items.entity';
import { DonorCenterBlueprintsModule } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/donor-center-blueprints/donor-center-blueprints.module';
import { DonorsModule } from 'src/api/crm/contacts/donor/donors.module';
import { DriveContactsService } from '../drives/service/drive-contacts.service';
import { DriveCertificationsService } from '../drives/service/drive-certifications.service';
import { DriveEquipmentsService } from '../drives/service/drive-equipments.service';
import { PickupService } from '../drives/service/pickups.service';
import { DonorCenterBluePrintsHistory } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/donor-center-blueprints/entity/donor_center_blueprint_history';
import { DonorCenterBluePrints } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/donor-center-blueprints/entity/donor_center_blueprint';
import { ShiftsSlotsHistory } from 'src/api/shifts/entities/shifts-slots-history.entity';
import { Donors } from 'src/api/crm/contacts/donor/entities/donors.entity';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { Contacts } from 'src/api/crm/contacts/common/entities/contacts.entity';
import { DonorsHistory } from 'src/api/crm/contacts/donor/entities/donors-history.entity';
import { DonorsAppointmentsHistory } from 'src/api/crm/contacts/donor/entities/donors-appointments-history.entity';
import { TenantConfigurationDetail } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenantConfigurationDetail';
import { BBCSConnector } from 'src/connector/bbcsconnector';
import { DonorCenterCodes } from 'src/api/crm/contacts/donor/entities/donor-center-codes.entity';
import { DonorGroupCodes } from 'src/api/crm/contacts/donor/entities/donor-group-codes.entity';
import { DonorsAssertionCodes } from 'src/api/crm/contacts/donor/entities/donors-assertion-codes.entity';
import { EquipmentEntity } from 'src/api/system-configuration/tenants-administration/operations-administration/manage-equipment/equipment/entity/equipment.entity';
import { OcApprovals } from '../../approvals/entities/oc-approval.entity';
import { CRMVolunteer } from 'src/api/crm/contacts/volunteer/entities/crm-volunteer.entity';
import { Staff } from 'src/api/crm/contacts/staff/entities/staff.entity';
import { DonorDonations } from 'src/api/crm/contacts/donor/donorDonationHistory/entities/donor-donations.entity';
import { DonorsEligibilities } from 'src/api/crm/contacts/donor/entities/donor_eligibilities.entity';
import { OperationsApprovalsService } from '../drives/service/opertion-approvals.service';
import { Approval } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/approvals/entity/approvals.entity';
import { BloodGroups } from 'src/api/crm/contacts/donor/entities/blood-group.entity';
import { BecsRaces } from 'src/api/crm/contacts/donor/entities/becs-race.entity';
import { ScheduleOperation } from 'src/api/staffing-management/build-schedules/entities/schedule_operation.entity';
import { Schedule } from 'src/api/staffing-management/build-schedules/entities/schedules.entity';
import { ScheduleOperationStatus } from 'src/api/staffing-management/build-schedules/entities/schedule-operation-status.entity';
import { NonCollectionEvents } from '../non-collection-events/entities/oc-non-collection-events.entity';
import { OperationListModule } from 'src/api/staffing-management/build-schedules/operation-list/operation-list.module';
import { FlaggedOperationService } from 'src/api/staffing-management/build-schedules/operation-list/service/flagged-operation.service';
import { MarketingMaterials } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/marketing-material/entities/marketing-material.entity';
import { PromotionalItems } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotional-items/entities/promotional-item.entity';
import { DonorsViewList } from 'src/api/crm/contacts/donor/entities/donors_list_view.entity';
import { ChangeAudits } from 'src/api/crm/contacts/common/entities/change-audits.entity';
import { VolunteerListView } from 'src/api/crm/contacts/volunteer/entities/crm-volunteer-list-view.entity';
import { UserBusinessUnits } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user-business-units.entity';
import { NotificationsModule } from 'src/api/notifications/notifications.module';
import { PushNotifications } from 'src/api/notifications/entities/push-notifications.entity';
import { UserNotifications } from 'src/api/notifications/entities/user-notifications.entity';
import { TargetNotifications } from 'src/api/notifications/entities/target-notifications.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sessions,
      DonorsViewList,
      SessionsHistory,
      SessionsPromotions,
      SessionsPromotionsHistory,
      User,
      PromotionEntity,
      OperationsStatus,
      CustomFields,
      Permissions,
      BusinessUnits,
      Facility,
      Vehicle,
      Products,
      ScheduleOperation,
      Schedule,
      ScheduleOperationStatus,
      NonCollectionEvents,
      ProcedureTypesProducts,
      Shifts,
      ShiftsHistory,
      ShiftsProjectionsStaff,
      ShiftsProjectionsStaffHistory,
      ShiftsStaffSetups,
      ShiftsSlots,
      ShiftsDevices,
      Drives,
      ShiftsVehicles,
      StaffSetup,
      DonorsAppointments,
      Drives,
      DrivesHistory,
      DriveContact,
      DrivesContacts,
      DrivesContactsHistory,
      DrivesCertifications,
      DrivesCertificationsHistory,
      DrivesEquipments,
      DrivesEquipmentHistory,
      LinkedDrives,
      LinkedDrivesHistory,
      Pickups,
      PickupsHistory,
      Vehicle,
      VehicleType,
      DrivesDonorCommunicationSupplementalAccounts,
      Accounts,
      User,
      UserBusinessUnits,
      CustomFieldsData,
      CustomFieldsDataHistory,
      CrmLocations,
      PromotionEntity,
      OperationsStatus,
      AccountContacts,
      ContactsRoles,
      Tenant,
      BookingRules,
      CustomFields,
      DrivesZipCodes,
      DrivesZipCodesHistory,
      DrivesPromotionalItems,
      DrivesMarketingMaterialItems,
      DonorCenterBluePrintsHistory,
      DonorCenterBluePrints,
      ShiftsSlotsHistory,
      Donors,
      Address,
      Contacts,
      DonorsHistory,
      DonorsAppointments,
      DonorsAppointmentsHistory,
      TenantConfigurationDetail,
      Device,
      ProcedureTypes,
      DonorCenterCodes,
      DonorGroupCodes,
      DonorsAssertionCodes,
      CRMVolunteer,
      Staff,
      DonorDonations,
      DonorsEligibilities,
      EquipmentEntity,
      OcApprovals,
      Approval,
      BloodGroups,
      BecsRaces,
      MarketingMaterials,
      PromotionalItems,
      ChangeAudits,
      VolunteerListView,
      PushNotifications,
      UserNotifications,
      TargetNotifications
    ]),
    DonorCenterBlueprintsModule,
    DonorsModule,
    OperationListModule,
    NotificationsModule
  ],
  controllers: [SessionsController],
  providers: [
    SessionsService,
    ShiftsService,
    JwtService,
    DrivesService,
    OperationsApprovalsService,
    DonorCenterBlueprintService,
    DonorsService,
    FlaggedOperationService,
    DriveContactsService,
    DriveCertificationsService,
    DriveEquipmentsService,
    PickupService,
    BBCSConnector,
  ],
})
export class SessionsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      { path: '/operations/sessions/create', method: RequestMethod.POST },
      { path: '/operations/sessions/create-many', method: RequestMethod.POST },
      { path: '/operations/sessions/list', method: RequestMethod.GET },
      { path: '/operations/sessions/:id/find', method: RequestMethod.GET },
      { path: '/operations/sessions/:id/update', method: RequestMethod.PUT },
      {
        path: '/operations/sessions/:id/delete',
        method: RequestMethod.DELETE,
      },
      {
        path: '/operations/sessions/donors/:donorId/appointments/:appointmentId',
        method: RequestMethod.PUT,
      },
      {
        path: '/operations/sessions/donors/appointments',
        method: RequestMethod.POST,
      },
      {
        path: '/operations/sessions/shifts/procedure-type/projection-staff',
        method: RequestMethod.POST,
      },
      {
        path: '/operations/sessions/shifts/:shiftId/projection/:procedureTypeId/slots',
        method: RequestMethod.POST,
      },
      {
        path: '/operations/sessions/shifts/projection/staff',
        method: RequestMethod.PATCH,
      },
      {
        path: '/operations/sessions/shifts/donors-schedules/:id',
        method: RequestMethod.GET,
      },
      {
        path: '/operations/sessions/shifts/procedure-type/slots',
        method: RequestMethod.POST,
      },
      {
        path: '/operations/sessions/donors',
        method: RequestMethod.GET,
      },
      {
        path: '/operations/sessions/:session_id/pickups',
        method: RequestMethod.POST,
      },
      {
        path: '/operations/sessions/:session_id/pickups',
        method: RequestMethod.GET,
      },
      {
        path: '/operations/sessions/marketing-equipment/equipment',
        method: RequestMethod.GET,
      },
      {
        path: '/operations/sessions/shifts/about/:id',
        method: RequestMethod.GET,
      },
      {
        path: '/operations/sessions/shift/:id',
        method: RequestMethod.GET,
      },
      {
        path: '/operations/sessions/:id/change-audit',
        method: RequestMethod.GET,
      }
    );
  }
}
