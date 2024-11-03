import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { OperationListService } from './service/operation-list.service';
import { OperationListController } from './controller/operation-list.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from '../entities/schedules.entity';
import { Drives } from 'src/api/operations-center/operations/drives/entities/drives.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { Sessions } from 'src/api/operations-center/operations/sessions/entities/sessions.entity';
import { NonCollectionEvents } from 'src/api/operations-center/operations/non-collection-events/entities/oc-non-collection-events.entity';
import { ShiftsProjectionsStaff } from 'src/api/shifts/entities/shifts-projections-staff.entity';
import { StaffConfig } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/StaffConfig.entity';
import { ShiftsRoles } from 'src/api/crm/crm-non-collection-profiles/blueprints/entities/shifts-roles.entity';
import { StaffAssignments } from 'src/api/crm/contacts/staff/staffSchedule/entity/self-assignment.entity';
import { ShiftsDevices } from 'src/api/shifts/entities/shifts-devices.entity';
import { ShiftsVehicles } from 'src/api/shifts/entities/shifts-vehicles.entity';
import { DeviceAssignments } from '../entities/devices-assignment.entity';
import { VehiclesAssignments } from '../entities/vehicles-assignment.entity';
import { ScheduleOperation } from '../entities/schedule_operation.entity';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { Roles } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/role.entity';
import { StaffRolesMapping } from 'src/api/crm/contacts/staff/staffRolesMapping/entities/staff-roles-mapping.entity';
import { Directions } from 'src/api/crm/locations/directions/entities/direction.entity';
import { FlaggedOperationService } from './service/flagged-operation.service';
import { ScheduleOperationStatus } from '../entities/schedule-operation-status.entity';
import { DrivesCertifications } from 'src/api/operations-center/operations/drives/entities/drives-certifications.entity';
import { Certification } from 'src/api/system-configuration/tenants-administration/staffing-administration/certification/entity/certification.entity';
import { Device } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device.entity';
import { DeviceType } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/device-type/entity/device-type.entity';
import { BuildSchedulesService } from '../services/build-schedules.service';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { OperationsStatus } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { ScheduleHistory } from '../entities/schedule-history.entity';
import { ScheduleOperationStatusHistory } from '../entities/schedule-operation-status-history.entity';
import { StaffAssignmentsDrafts } from '../entities/staff-assignments-drafts';
import { DeviceAssignmentsDrafts } from '../entities/devices-assignment-drafts.entity';
import { CrmLocationsHistory } from 'src/api/crm/locations/entities/crm-locations-history';
import { ShiftsHistory } from 'src/api/shifts/entities/shifts-history.entity';
import { DrivesHistory } from 'src/api/operations-center/operations/drives/entities/drives-history.entity';
import { NonCollectionEventsHistory } from 'src/api/operations-center/operations/non-collection-events/entities/oc-non-collection-events-history.entity';
import { SessionsHistory } from 'src/api/operations-center/operations/sessions/entities/sessions-history.entity';
import { OperationsStatusHistory } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status_history.entity';
import { CrmLocations } from 'src/api/crm/locations/entities/crm-locations.entity';
import { CommonFunction } from 'src/api/crm/contacts/common/common-functions';
import { Contacts } from 'src/api/crm/contacts/common/entities/contacts.entity';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { BuildSchedulesModule } from '../build-schedules.module';
import { Vehicle } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle.entity';
import { VehiclesAssignmentsDrafts } from '../entities/vehicles-assignment-drafts.entity';
import { ContactsRoles } from 'src/api/system-configuration/tenants-administration/crm-administration/contacts/role/entities/contacts-role.entity';
import { Staff } from 'src/api/crm/contacts/staff/entities/staff.entity';
import { Notifications } from '../entities/notifications.entity';
import { NotificationsStaff } from '../entities/notifications-staff.entity';
import { ShiftsVehiclesHistory } from 'src/api/shifts/entities/shifts-vehicles-history.entity';
import { ShiftsDevicesHistory } from 'src/api/shifts/entities/shifts-devices-history.entity';
import { ShiftsStaffSetups } from 'src/api/shifts/entities/shifts-staffsetups.entity';
import { ShiftsStaffSetupsHistory } from 'src/api/shifts/entities/shifts-staffsetups-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Schedule,
      Drives,
      Shifts,
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
      ScheduleOperationStatus,
      User,
      Permissions,
      Roles,
      StaffRolesMapping,
      Directions,
      DrivesCertifications,
      Certification,
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
      Address,
      Contacts,
      Vehicle,
      ContactsRoles,
      Staff,
      Notifications,
      NotificationsStaff,
      ShiftsVehiclesHistory,
      ShiftsDevicesHistory,
      ShiftsStaffSetups,
      ShiftsStaffSetupsHistory,
    ]),
    BuildSchedulesModule,
  ],
  controllers: [OperationListController],
  providers: [
    OperationListService,
    FlaggedOperationService,
    JwtService,
    CommonFunction,
    BuildSchedulesService,
  ],
  exports: [BuildSchedulesService],
})
export class OperationListModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: '/staffing-management/schedules/operation-list/:schedule_id',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/operation/flagged/:id/:type',
        method: RequestMethod.PATCH,
      },
      {
        path: '/staffing-management/schedules/operations/split_shift/:assignment_id/:assignment_type/:schedule_id',
        method: RequestMethod.PATCH,
      },
      {
        path: '/staffing-management/schedules/operations/data/:operation_id/:operation_type/schedule/:schedule_id',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/:operation_id/:operation_type/shifts/:shift_id/assigned-staff/:schedule_id',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/:operation_id/:operation_type/shifts/:shift_id/assigned-vehicle/:schedule_id',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/:schedule_id/:operation_id/shifts/:shift_id/assigned-staff',
        method: RequestMethod.DELETE,
      },
      {
        path: '/staffing-management/schedules/:operation_id/shifts/:shift_id/assigned-vehicle',
        method: RequestMethod.DELETE,
      },
      {
        path: '/staffing-management/schedules/operation/staff/reassign_staff',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/operation/staff/reassign_vehicle',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/operation/staff-assignment',
        method: RequestMethod.PUT,
      },
      {
        path: '/staffing-management/schedules/operation/vehicle-assignment',
        method: RequestMethod.PUT,
      },
      {
        path: '/staffing-management/schedules/drives/certifications/:operation_id',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/:operation_id/:operation_type/shifts/:shift_id/assigned-device/:schedule_status',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/:operation_id/shifts/:shift_id/assigned-device',
        method: RequestMethod.DELETE,
      },
      {
        path: '/staffing-management/schedules/operation/staff/reassign-device',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/operation/device-assignment',
        method: RequestMethod.PUT,
      },
      {
        path: '/staffing-management/schedules/:operation_id/:operation_type',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/:operation_id/shifts/:shift_id/assigned-vehicle',
        method: RequestMethod.DELETE,
      },
      {
        path: '/staffing-management/schedules/operations/:operation_id/unassign-all-assignments',
        method: RequestMethod.DELETE,
      }
    );
  }
}
