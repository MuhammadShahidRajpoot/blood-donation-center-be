import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { SeedersController } from './controllers/seeders.controller';
import { SeedersService } from './services/seeders.service';
import { Applications } from '../../system-configuration/platform-administration/roles-administration/application/entities/application.entity';
import { Modules } from '../../system-configuration/platform-administration/roles-administration/role-permissions/entities/module.entity';
import { FilterCriteria } from '../../crm/Filters/entities/filter_criteria';
import { CrmAccountsSeed } from '../../seeders/crmAccounts.seeders';
import { CrmLocationsSeed } from '../../seeders/crmlocations.seeders';
import { migrations } from '../../seeders/migrations.seeder';
import { OcNonCollectionEventSeed } from '../../seeders/ocNonCollectionEvents.seeder';
import { rolePermissions } from '../../seeders/rolePermissions.seeder';
import { SessionsFiltersSeed } from '../../seeders/sessionsFilters.seeder';
import { User } from '../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { StaffingManagementStaffListSeed } from '../../seeders/staffingManagementStaffList.seeders';
import { OcApprovalsSeed } from 'src/api/seeders/OcApprovalsSeed.seeder';
import { StaffingManagementStaffSchedulesSeed } from 'src/api/seeders/staffingManagementStaffSchedules.seeders';
import { FilterSavedCriteria } from 'src/api/crm/Filters/entities/filter_saved_criteria';
import { ocDrivesSeed } from 'src/api/seeders/ocDrives.seeders';
import { StaffingManagemenetDetailsNotesFilters } from 'src/api/seeders/staffingManagementDetailsNotesFilters';
import { DonorsSeed } from 'src/api/seeders/donors.seeder';
import { BloodGroups } from 'src/api/crm/contacts/donor/entities/blood-group.entity';
import { BecsRaces } from 'src/api/crm/contacts/donor/entities/becs-race.entity';
import { RolePermission } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/rolePermission.entity';
import { Roles } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/role.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { TenantRole } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/tenantRole.entity';
import { RolesHistory } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/roleHistory';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Applications,
      Modules,
      Permissions,
      FilterCriteria,
      FilterSavedCriteria,
      BloodGroups,
      BecsRaces,
      Roles,
      User,
      Tenant,
      TenantRole,
      RolesHistory,
      RolePermission,
    ]),
  ],
  controllers: [SeedersController],
  providers: [
    SeedersService,
    CrmAccountsSeed,
    CrmLocationsSeed,
    migrations,
    OcNonCollectionEventSeed,
    rolePermissions,
    SessionsFiltersSeed,
    OcApprovalsSeed,
    StaffingManagementStaffListSeed,
    StaffingManagementStaffSchedulesSeed,
    ocDrivesSeed,
    StaffingManagemenetDetailsNotesFilters,
    DonorsSeed,
  ],
  exports: [SeedersService],
})
export class SeedersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply()
      .forRoutes(
        { path: '/seeders/seed/', method: RequestMethod.POST },
        { path: '/seeders/roles', method: RequestMethod.POST },
        { path: '/seeders/drop/', method: RequestMethod.POST }
      );
  }
}
