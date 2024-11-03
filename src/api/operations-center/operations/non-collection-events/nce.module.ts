import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { Accounts } from 'src/api/crm/accounts/entities/accounts.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { PromotionEntity } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotions/entity/promotions.entity';
import { OperationsStatus } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { CrmLocations } from 'src/api/crm/locations/entities/crm-locations.entity';
import { AccountContacts } from 'src/api/crm/accounts/entities/accounts-contacts.entity';
import { ContactsRoles } from 'src/api/system-configuration/tenants-administration/crm-administration/contacts/role/entities/contacts-role.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { ShiftsModule } from 'src/api/shifts/shifts.module';
import { CustomFields } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-field.entity';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { NCEController } from './controller/nce.controller';
import { NCEService } from './service/nce.service';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { ShiftsDevices } from 'src/api/shifts/entities/shifts-devices.entity';
import { ShiftsVehicles } from 'src/api/shifts/entities/shifts-vehicles.entity';
import { ShiftsHistory } from 'src/api/shifts/entities/shifts-history.entity';
import { Device } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device.entity';
import { Vehicle } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle.entity';
import { EntityManager } from 'typeorm';
import { CrmNonCollectionProfiles } from 'src/api/crm/crm-non-collection-profiles/entities/crm-non-collection-profiles.entity';
import { NonCollectionEvents } from './entities/oc-non-collection-events.entity';
import { NonCollectionEventsHistory } from './entities/oc-non-collection-events-history.entity';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { UserBusinessUnits } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user-business-units.entity';
import { ShiftsRoles } from 'src/api/crm/crm-non-collection-profiles/blueprints/entities/shifts-roles.entity';
import { Category } from 'src/api/system-configuration/tenants-administration/crm-administration/common/entity/category.entity';
import { FlaggedOperationService } from 'src/api/staffing-management/build-schedules/operation-list/service/flagged-operation.service';
import { OperationListModule } from 'src/api/staffing-management/build-schedules/operation-list/operation-list.module';
import { Schedule } from 'src/api/staffing-management/build-schedules/entities/schedules.entity';
import { Drives } from '../drives/entities/drives.entity';
import { Sessions } from '../sessions/entities/sessions.entity';
import { ScheduleOperation } from 'src/api/staffing-management/build-schedules/entities/schedule_operation.entity';
import { ScheduleOperationStatus } from 'src/api/staffing-management/build-schedules/entities/schedule-operation-status.entity';
import { ChangeAudits } from 'src/api/crm/contacts/common/entities/change-audits.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Accounts,
      User,
      CrmLocations,
      PromotionEntity,
      OperationsStatus,
      AccountContacts,
      Tenant,
      CustomFields,
      Permissions,
      Shifts,
      ShiftsDevices,
      ShiftsVehicles,
      ShiftsHistory,
      Device,
      Vehicle,
      ContactsRoles,
      EntityManager,
      CrmNonCollectionProfiles,
      NonCollectionEvents,
      NonCollectionEventsHistory,
      BusinessUnits,
      UserBusinessUnits,
      OperationsStatus,
      ShiftsRoles,
      Category,
      Schedule,
      Drives,
      Sessions,
      ScheduleOperation,
      ScheduleOperationStatus,
      ChangeAudits,
    ]),
    ShiftsModule,
    OperationListModule,
  ],
  controllers: [NCEController],
  providers: [NCEService, JwtService, FlaggedOperationService],
})
export class NCEModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: '/operations/non-collection-events',
        method: RequestMethod.POST,
      },
      {
        path: '/operations/non-collection-events',
        method: RequestMethod.GET,
      },
      {
        path: '/operations/non-collection-events/:id',
        method: RequestMethod.GET,
      },
      {
        path: '/operations/non-collection-events/:id/shift-details',
        method: RequestMethod.GET,
      },
      {
        path: '/operations/non-collection-events/:id',
        method: RequestMethod.PUT,
      },
      {
        path: '/operations/non-collection-events/archive/:id',
        method: RequestMethod.PATCH,
      },
      {
        path: '/operations/non-collection-events/with-directions/:collectionOperationId',
        method: RequestMethod.GET,
      },
      {
        path: '/operations/non-collection-events/location-events/:locationId',
        method: RequestMethod.GET,
      }
    );
  }
}
