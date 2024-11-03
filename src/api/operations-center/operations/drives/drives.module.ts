import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { DrivesController } from './controller/drives.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DrivesService } from './service/drives.service';
import { JwtService } from '@nestjs/jwt';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { Accounts } from 'src/api/crm/accounts/entities/accounts.entity';
import { DrivesHistory } from './entities/drives-history.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { PromotionEntity } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotions/entity/promotions.entity';
import { OperationsStatus } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { Drives } from './entities/drives.entity';
import { CrmLocations } from 'src/api/crm/locations/entities/crm-locations.entity';
import { AccountContacts } from 'src/api/crm/accounts/entities/accounts-contacts.entity';
import { ContactsRoles } from 'src/api/system-configuration/tenants-administration/crm-administration/contacts/role/entities/contacts-role.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { ShiftsModule } from 'src/api/shifts/shifts.module';
import { CustomFields } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-field.entity';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { DriveContact } from './dto/create-drive.dto';
import { Vehicle } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle.entity';
import { VehicleType } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicle-type/entities/vehicle-type.entity';
import { ShiftsSlots } from 'src/api/shifts/entities/shifts-slots.entity';
import { DriveContactsService } from './service/drive-contacts.service';
import { DrivesContactsHistory } from './entities/drive-contacts-history.entity';
import { DrivesContacts } from './entities/drive-contacts.entity';
import { DriveCertificationsService } from './service/drive-certifications.service';
import { DrivesCertifications } from './entities/drives-certifications.entity';
import { DrivesCertificationsHistory } from './entities/drives-certifications-history.entity';
import { BookingRules } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/booking-rules/entities/booking-rules.entity';
import { ShiftsProjectionsStaff } from 'src/api/shifts/entities/shifts-projections-staff.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { ShiftsStaffSetups } from 'src/api/shifts/entities/shifts-staffsetups.entity';
import { ShiftsVehicles } from 'src/api/shifts/entities/shifts-vehicles.entity';
import { DonorCenterBlueprintsModule } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/donor-center-blueprints/donor-center-blueprints.module';
import { DonorsModule } from 'src/api/crm/contacts/donor/donors.module';
import { PickupsHistory } from './entities/pickups-history.entity';
import { Pickups } from './entities/pickups.entity';
import { PickupService } from './service/pickups.service';
import { DriveEquipmentsService } from './service/drive-equipments.service';
import { DrivesEquipmentHistory } from './entities/drives-equipment-history.entity';
import { DrivesEquipments } from './entities/drives-equipment.entity';
import { CustomFieldsData } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-filed-data.entity';
import { CustomFieldsDataHistory } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-filed-data-history';
import { DrivesZipCodes } from './entities/drives-zipcodes.entity';
import { DrivesDonorCommunicationSupplementalAccounts } from './entities/drives-donor-comms-supp-accounts.entity';
import { DrivesPromotionalItems } from './entities/drives_promotional_items.entity';
import { DrivesMarketingMaterialItems } from './entities/drives-marketing-material-items.entity';
import { LinkedDrives } from './entities/linked-drives.entity';
import { LinkedDrivesHistory } from './entities/linked-drives-history.entity';
import { LinkedDriveService } from './service/linked-drive.service';
import { DonorsAppointments } from 'src/api/crm/contacts/donor/entities/donors-appointments.entity';
import { DrivesResultService } from './service/drives-result.service';
import { DrivesZipCodesHistory } from './entities/drives-zipcodes-history.entity';
import { TenantConfigurationDetail } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenantConfigurationDetail';
import { BBCSConnector } from 'src/connector/bbcsconnector';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { OcApprovals } from '../../approvals/entities/oc-approval.entity';
import { Device } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device.entity';
import { StaffSetup } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/staffSetup.entity';
import { OperationsApprovalsService } from './service/opertion-approvals.service';
import { Approval } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/approvals/entity/approvals.entity';
import { OperationListModule } from 'src/api/staffing-management/build-schedules/operation-list/operation-list.module';
import { FlaggedOperationService } from 'src/api/staffing-management/build-schedules/operation-list/service/flagged-operation.service';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { ScheduleOperation } from 'src/api/staffing-management/build-schedules/entities/schedule_operation.entity';
import { Schedule } from 'src/api/staffing-management/build-schedules/entities/schedules.entity';
import { ScheduleOperationStatus } from 'src/api/staffing-management/build-schedules/entities/schedule-operation-status.entity';
import { NonCollectionEvents } from '../non-collection-events/entities/oc-non-collection-events.entity';
import { Sessions } from 'src/api/operations-center/operations/sessions/entities/sessions.entity';
import { MarketingMaterials } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/marketing-material/entities/marketing-material.entity';
import { PromotionalItems } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotional-items/entities/promotional-item.entity';
import { ChangeAudits } from 'src/api/crm/contacts/common/entities/change-audits.entity';
import { UserBusinessUnits } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user-business-units.entity';
import { NotificationsModule } from 'src/api/notifications/notifications.module';
import { PushNotifications } from 'src/api/notifications/entities/push-notifications.entity';
import { UserNotifications } from 'src/api/notifications/entities/user-notifications.entity';
import { TargetNotifications } from 'src/api/notifications/entities/target-notifications.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Drives,
      DrivesHistory,
      DriveContact,
      DrivesContacts,
      DrivesContactsHistory,
      DrivesCertifications,
      ScheduleOperation,
      Schedule,
      Sessions,
      ScheduleOperationStatus,
      NonCollectionEvents,
      DrivesCertificationsHistory,
      DrivesEquipments,
      DrivesEquipmentHistory,
      LinkedDrives,
      LinkedDrivesHistory,
      Pickups,
      PickupsHistory,
      Address,
      Vehicle,
      VehicleType,
      DrivesDonorCommunicationSupplementalAccounts,
      Accounts,
      User,
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
      Permissions,
      Shifts,
      ShiftsSlots,
      ShiftsProjectionsStaff,
      ShiftsStaffSetups,
      ShiftsVehicles,
      DrivesZipCodes,
      DrivesZipCodesHistory,
      DrivesPromotionalItems,
      DrivesMarketingMaterialItems,
      DonorsAppointments,
      TenantConfigurationDetail,
      Device,
      StaffSetup,
      ProcedureTypes,
      BusinessUnits,
      UserBusinessUnits,
      OcApprovals,
      Approval,
      MarketingMaterials,
      PromotionalItems,
      ChangeAudits,
      PushNotifications,
      UserNotifications,
      TargetNotifications
    ]),
    ShiftsModule,
    DonorCenterBlueprintsModule,
    OperationListModule,
    DonorsModule,
    NotificationsModule
  ],
  providers: [
    DrivesService,
    JwtService,
    DriveContactsService,
    DriveCertificationsService,
    PickupService,
    DriveEquipmentsService,
    FlaggedOperationService,

    LinkedDriveService,
    DrivesResultService,
    BBCSConnector,
    OperationsApprovalsService,
  ],
  controllers: [DrivesController],
  exports: [
    DriveContactsService,
    DriveCertificationsService,
    PickupService,
    DriveEquipmentsService,
    OperationsApprovalsService,
    LinkedDriveService,
  ],
})
export class DrivesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      { path: '/drives', method: RequestMethod.GET },
      { path: '/drives/location/:id', method: RequestMethod.GET },
      { path: '/drives/export/url', method: RequestMethod.GET },
      { path: '/drives', method: RequestMethod.POST },
      { path: '/drives/:id', method: RequestMethod.PUT },

      { path: '/drives/last/:id', method: RequestMethod.GET },
      { path: '/drives/:id', method: RequestMethod.GET },
      { path: '/drives/:id', method: RequestMethod.DELETE },
      { path: '/drives/results/:id', method: RequestMethod.GET },
      { path: '/drives/shift/:id', method: RequestMethod.GET },
      {
        path: '/drives/shifts/:shiftId/projection/:procedureTypeId/slots',
        method: RequestMethod.POST,
      },
      {
        path: '/drives/shifts/projection/staff',
        method: RequestMethod.PATCH,
      },
      {
        path: '/drives/shifts/donors-schedules/:id',
        method: RequestMethod.GET,
      },
      {
        path: '/drives/shifts/procedure-type/slots',
        method: RequestMethod.POST,
      },
      { path: '/drives/:drive_id/contacts', method: RequestMethod.POST },
      {
        path: '/drives/:drive_id/contacts/:contact_id',
        method: RequestMethod.PUT,
      },
      { path: '/drives/:drive_id/certifications', method: RequestMethod.POST },
      { path: '/drives/blueprints/account/:id', method: RequestMethod.GET },
      { path: '/drives/single/:id', method: RequestMethod.GET },
      { path: '/drives/:drive_id/pickups', method: RequestMethod.POST },
      { path: '/drives/:drive_id/pickups', method: RequestMethod.GET },
      { path: '/drives/:id/change-audit', method: RequestMethod.GET },
      { path: '/drives/:drive_id/equipment', method: RequestMethod.POST },
      {
        path: '/drives/:drive_id/equipment/:equipment_id',
        method: RequestMethod.PUT,
      },
      { path: '/drives/:drive_id/link_drive', method: RequestMethod.POST },
      { path: '/drives/linkvehicles/view/:id', method: RequestMethod.POST },

      { path: '/drives/list/account/:id', method: RequestMethod.GET },
      { path: '/drives/linkvehicles', method: RequestMethod.GET },
      { path: '/drives/linkvehicles/:id', method: RequestMethod.GET },
      {
        path: '/drives/donors/:donorId/appointments/:appointmentId',
        method: RequestMethod.PUT,
      },
      { path: '/drives/donors/appointments', method: RequestMethod.POST },
      { path: '/drives/contacts/:id', method: RequestMethod.GET },
      { path: '/drives/linkDrive/update/:id', method: RequestMethod.POST },
      { path: '/drives/linkvehicles', method: RequestMethod.POST },
      { path: '/drives/shift/location/:id', method: RequestMethod.GET }

    );
  }
}
