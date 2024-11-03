import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { BuildSchedulesController } from './controller/build-schedules.controller';
import { BuildSchedulesService } from './services/build-schedules.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedules.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { OperationsStatus } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { JwtService } from '@nestjs/jwt';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { ScheduleOperationStatus } from './entities/schedule-operation-status.entity';
import { Drives } from 'src/api/operations-center/operations/drives/entities/drives.entity';
import { Sessions } from 'src/api/operations-center/operations/sessions/entities/sessions.entity';
import { NonCollectionEvents } from 'src/api/operations-center/operations/non-collection-events/entities/oc-non-collection-events.entity';
import { StaffConfig } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/StaffConfig.entity';
import { Directions } from 'src/api/crm/locations/directions/entities/direction.entity';
import { ShiftsProjectionsStaff } from 'src/api/shifts/entities/shifts-projections-staff.entity';
import { StaffAssignments } from 'src/api/crm/contacts/staff/staffSchedule/entity/self-assignment.entity';
import { CommonFunction } from 'src/api/crm/contacts/common/common-functions';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { Contacts } from 'src/api/crm/contacts/common/entities/contacts.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { ScheduleOperation } from './entities/schedule_operation.entity';
import { DeviceAssignmentsDrafts } from './entities/devices-assignment-drafts.entity';
import { VehiclesAssignmentsDrafts } from './entities/vehicles-assignment-drafts.entity';
import { StaffAssignmentsDrafts } from './entities/staff-assignments-drafts';
import { VehiclesAssignments } from './entities/vehicles-assignment.entity';
import { DeviceAssignments } from './entities/devices-assignment.entity';
import { ShiftsDevices } from 'src/api/shifts/entities/shifts-devices.entity';
import { ShiftsVehicles } from 'src/api/shifts/entities/shifts-vehicles.entity';
import { ShiftsRoles } from 'src/api/crm/crm-non-collection-profiles/blueprints/entities/shifts-roles.entity';
import { Roles } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/role.entity';
import { StaffRolesMapping } from 'src/api/crm/contacts/staff/staffRolesMapping/entities/staff-roles-mapping.entity';
import { OperationsStatusHistory } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status_history.entity';
import { CrmLocationsHistory } from 'src/api/crm/locations/entities/crm-locations-history';
import { ShiftsHistory } from 'src/api/shifts/entities/shifts-history.entity';
import { DrivesHistory } from 'src/api/operations-center/operations/drives/entities/drives-history.entity';
import { NonCollectionEventsHistory } from 'src/api/operations-center/operations/non-collection-events/entities/oc-non-collection-events-history.entity';
import { SessionsHistory } from 'src/api/operations-center/operations/sessions/entities/sessions-history.entity';
import { CrmLocations } from 'src/api/crm/locations/entities/crm-locations.entity';
import { Notifications } from './entities/notifications.entity';
import { NotificationsStaff } from './entities/notifications-staff.entity';
import { Device } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device.entity';
import { Vehicle } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle.entity';
import { ContactsRoles } from 'src/api/system-configuration/tenants-administration/crm-administration/contacts/role/entities/contacts-role.entity';
import { Staff } from 'src/api/crm/contacts/staff/entities/staff.entity';
import { ShiftsStaffSetupsHistory } from 'src/api/shifts/entities/shifts-staffsetups-history.entity';
import { ShiftsStaffSetups } from 'src/api/shifts/entities/shifts-staffsetups.entity';
import { ShiftsDevicesHistory } from 'src/api/shifts/entities/shifts-devices-history.entity';
import { ShiftsVehiclesHistory } from 'src/api/shifts/entities/shifts-vehicles-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Address,
      Contacts,
      Schedule,
      User,
      OperationsStatus,
      BusinessUnits,
      Permissions,
      ScheduleOperationStatus,
      Drives,
      Sessions,
      NonCollectionEvents,
      StaffConfig,
      Directions,
      ShiftsProjectionsStaff,
      StaffAssignments,
      Shifts,
      ScheduleOperation,
      DeviceAssignments,
      VehiclesAssignments,
      StaffAssignmentsDrafts,
      VehiclesAssignmentsDrafts,
      DeviceAssignmentsDrafts,
      ShiftsDevices,
      ShiftsVehicles,
      DeviceAssignments,
      VehiclesAssignments,
      ShiftsProjectionsStaff,
      StaffConfig,
      ShiftsRoles,
      Roles,
      StaffRolesMapping,
      StaffAssignments,
      CrmLocationsHistory,
      ShiftsHistory,
      DrivesHistory,
      NonCollectionEventsHistory,
      SessionsHistory,
      OperationsStatusHistory,
      CrmLocations,
      Notifications,
      NotificationsStaff,
      Device,
      Vehicle,
      ContactsRoles,
      Staff,
      ShiftsVehiclesHistory,
      ShiftsDevicesHistory,
      ShiftsStaffSetups,
      ShiftsStaffSetupsHistory,
    ]),
  ],
  controllers: [BuildSchedulesController],
  providers: [BuildSchedulesService, JwtService, CommonFunction],
  exports: [BuildSchedulesService],
})
export class BuildSchedulesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: '/staffing-management/schedules',
        method: RequestMethod.POST,
      },
      {
        path: '/staffing-management/schedules',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/check-schedule/:start_date/:end_date/:collection_operation_id',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/archive',
        method: RequestMethod.PATCH,
      },
      {
        path: '/staffing-management/schedules',
        method: RequestMethod.PATCH,
      },
      {
        path: '/staffing-management/collection_operations/list',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/create/details/about',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/details/rtd/:operation_id/:operation_type/shifts/:shift_id/modify-rtd/:schedule_status',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/operations/shifts/modify-rtd',
        method: RequestMethod.PATCH,
      },
      {
        path: '/staffing-management/schedules/:schedule_id/:user_id',
        method: RequestMethod.PATCH,
      },
      {
        path: '/staffing-management/schedules/available-devices',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/available-vehicles',
        method: RequestMethod.GET,
      },
      {
        path: '/shared-devices',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/shared-vehicles',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/operations/:operation_id/:operation_type/shifts/:shift_id/update-home-base/:schedule_status',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/operations/:operation_id/:operation_type/shifts/:shift_id/update-home-base',
        method: RequestMethod.PATCH,
      },
      {
        path: '/staffing-management/schedules/operations/:operation_id/shifts/:shift_id/staff-assignments',
        method: RequestMethod.POST,
      },
      {
        path: '/staffing-management/schedules/operations/:operation_id/shifts/:shift_id/devices-assignments',
        method: RequestMethod.POST,
      },
      {
        path: '/staffing-management/schedules/operations/:operation_id/shifts/:shift_id/vehicles-assignments',
        method: RequestMethod.POST,
      },
      {
        path: 'staffing-management/schedules/publish/schedule/:schedule_id',
        method: RequestMethod.PATCH,
      },
      {
        path: '/staffing-management/schedules/operations/notify/staff',
        method: RequestMethod.POST,
      },
      {
        path: '/staffing-management/schedules/:action/schedule/:schedule_id/:operation_id',
        method: RequestMethod.PATCH,
      },
      {
        path: '/staffing-management/schedules/collection_operations/list/:id',
        method: RequestMethod.GET,
      },
      {
        path: '/staffing-management/schedules/shifts/roles_times/all',
        method: RequestMethod.GET,
      }
    );
  }
}
