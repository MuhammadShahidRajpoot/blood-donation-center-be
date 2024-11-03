import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffSchedulesService } from './services/staff-schedules.service';
import { StaffSchedulesController } from './staff-schedule/controller/staff-schedules.controller';
import { AuthMiddleware } from '../middlewares/auth';
import { CommonFunction } from '../crm/contacts/common/common-functions';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { Contacts } from '../crm/contacts/common/entities/contacts.entity';
import { Address } from '../system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { User } from '../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { JwtService } from '@nestjs/jwt';
import { StaffAssignments } from '../crm/contacts/staff/staffSchedule/entity/self-assignment.entity';
import { Schedule } from './build-schedules/entities/schedules.entity';
import { Shifts } from '../shifts/entities/shifts.entity';
import { Drives } from '../operations-center/operations/drives/entities/drives.entity';
import { Sessions } from '../operations-center/operations/sessions/entities/sessions.entity';
import { NonCollectionEvents } from '../operations-center/operations/non-collection-events/entities/oc-non-collection-events.entity';
import { ShiftsProjectionsStaff } from '../shifts/entities/shifts-projections-staff.entity';
import { StaffConfig } from '../system-configuration/tenants-administration/staffing-administration/staff-setups/entity/StaffConfig.entity';
import { ShiftsRoles } from '../crm/crm-non-collection-profiles/blueprints/entities/shifts-roles.entity';
import { ShiftsDevices } from '../shifts/entities/shifts-devices.entity';
import { ShiftsVehicles } from '../shifts/entities/shifts-vehicles.entity';
import { DeviceAssignments } from './build-schedules/entities/devices-assignment.entity';
import { VehiclesAssignments } from './build-schedules/entities/vehicles-assignment.entity';
import { ScheduleOperation } from './build-schedules/entities/schedule_operation.entity';
import { OperationListController } from './build-schedules/operation-list/controller/operation-list.controller';
import { OperationListService } from './build-schedules/operation-list/service/operation-list.service';
import { ShiftsStaffSetups } from '../shifts/entities/shifts-staffsetups.entity';
import { StaffClassification } from '../crm/contacts/staff/staffClassification/entity/staff-classification.entity';
import { IndustryCategories } from '../system-configuration/tenants-administration/crm-administration/account/industry-categories/entities/industry-categories.entity';
import { FlaggedOperationService } from './build-schedules/operation-list/service/flagged-operation.service';
import { Roles } from '../system-configuration/platform-administration/roles-administration/role-permissions/entities/role.entity';
import { StaffRolesMapping } from '../crm/contacts/staff/staffRolesMapping/entities/staff-roles-mapping.entity';
import { ResourceSharings } from '../operations-center/resource-sharing/entities/resource-sharing.entity';
import { Directions } from '../crm/locations/directions/entities/direction.entity';
import { ScheduleOperationStatus } from './build-schedules/entities/schedule-operation-status.entity';
import { DrivesCertifications } from '../operations-center/operations/drives/entities/drives-certifications.entity';
import { Certification } from '../system-configuration/tenants-administration/staffing-administration/certification/entity/certification.entity';
import { Staff } from '../crm/contacts/staff/entities/staff.entity';
import { BuildSchedulesService } from './build-schedules/services/build-schedules.service';
import { Device } from '../system-configuration/tenants-administration/organizational-administration/resources/device/entities/device.entity';
import { DeviceType } from '../system-configuration/tenants-administration/organizational-administration/resources/device-type/entity/device-type.entity';
import { BusinessUnits } from '../system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { OperationsStatus } from '../system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { ScheduleHistory } from './build-schedules/entities/schedule-history.entity';
import { ScheduleOperationStatusHistory } from './build-schedules/entities/schedule-operation-status-history.entity';
import { StaffAssignmentsDrafts } from './build-schedules/entities/staff-assignments-drafts';
import { DeviceAssignmentsDrafts } from './build-schedules/entities/devices-assignment-drafts.entity';
import { CrmLocationsHistory } from '../crm/locations/entities/crm-locations-history';
import { ShiftsHistory } from '../shifts/entities/shifts-history.entity';
import { DrivesHistory } from '../operations-center/operations/drives/entities/drives-history.entity';
import { NonCollectionEventsHistory } from '../operations-center/operations/non-collection-events/entities/oc-non-collection-events-history.entity';
import { SessionsHistory } from '../operations-center/operations/sessions/entities/sessions-history.entity';
import { OperationsStatusHistory } from '../system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status_history.entity';
import { CrmLocations } from '../crm/locations/entities/crm-locations.entity';
import { Vehicle } from '../system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle.entity';
import { VehiclesAssignmentsDrafts } from './build-schedules/entities/vehicles-assignment-drafts.entity';
import { ContactsRoles } from '../system-configuration/tenants-administration/crm-administration/contacts/role/entities/contacts-role.entity';
import { Notifications } from './build-schedules/entities/notifications.entity';
import { NotificationsStaff } from './build-schedules/entities/notifications-staff.entity';
import { ShiftsVehiclesHistory } from '../shifts/entities/shifts-vehicles-history.entity';
import { ShiftsDevicesHistory } from '../shifts/entities/shifts-devices-history.entity';
import { ShiftsStaffSetupsHistory } from '../shifts/entities/shifts-staffsetups-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Address,
      Contacts,
      User,
      Permissions,
      StaffAssignments,
      Schedule,
      Shifts,
      Drives,
      Sessions,
      NonCollectionEvents,
      ShiftsProjectionsStaff,
      StaffConfig,
      ShiftsRoles,
      StaffAssignments,
      ShiftsDevices,
      ShiftsVehicles,
      DeviceAssignments,
      VehiclesAssignments,
      ScheduleOperation,
      ShiftsStaffSetups,
      StaffConfig,
      StaffClassification,
      IndustryCategories,
      Roles,
      StaffRolesMapping,
      ResourceSharings,
      Directions,
      ScheduleOperationStatus,
      DrivesCertifications,
      Certification,
      Staff,
      Device,
      DeviceType,
      BusinessUnits,
      OperationsStatus,
      ScheduleHistory,
      ScheduleOperationStatusHistory,
      StaffAssignmentsDrafts,
      VehiclesAssignmentsDrafts,
      DeviceAssignmentsDrafts,
      CrmLocationsHistory,
      ShiftsHistory,
      DrivesHistory,
      NonCollectionEventsHistory,
      SessionsHistory,
      OperationsStatusHistory,
      CrmLocations,
      Vehicle,
      ContactsRoles,
      Notifications,
      NotificationsStaff,
      ShiftsVehiclesHistory,
      ShiftsDevicesHistory,
      ShiftsStaffSetupsHistory,
    ]),
  ],
  controllers: [StaffSchedulesController, OperationListController],
  providers: [
    StaffSchedulesService,
    CommonFunction,
    JwtService,
    OperationListService,
    FlaggedOperationService,
    BuildSchedulesService,
  ],
})
export class StaffingManagementModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: '/view-schedules/staff-schedules',
        method: RequestMethod.GET,
      },
      {
        path: '/view-schedules/staff-schedules/search',
        method: RequestMethod.GET,
      },
      {
        path: '/view-schedules/staff-schedules/summary',
        method: RequestMethod.GET,
      },
      {
        path: '/view-schedules/staff-schedules/available-staff/:shiftId',
        method: RequestMethod.GET,
      },
      {
        path: '/view-schedules/staff-schedules/shared-staff/:shiftId',
        method: RequestMethod.GET,
      },
      {
        path: '/view-schedules/staff-schedules/staff-under-minimum-hours',
        method: RequestMethod.GET,
      },
      {
        path: '/view-schedules/staff-schedules/status-exclusions',
        method: RequestMethod.GET,
      },
      {
        path: '/view-schedules/staff-schedules/overstaffed-drives',
        method: RequestMethod.GET,
      }
    );
  }
}
