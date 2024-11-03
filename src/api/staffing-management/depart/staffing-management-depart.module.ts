import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { S3Service } from '../common/s3.service';
import { ExportService } from '../common/exportData.service';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { DepartController } from './controller/depart.controller';
import { Staff } from 'src/api/crm/contacts/staff/entities/staff.entity';
import { ContactsRoles } from 'src/api/system-configuration/tenants-administration/crm-administration/contacts/role/entities/contacts-role.entity';
import { StaffAssignments } from 'src/api/crm/contacts/staff/staffSchedule/entity/self-assignment.entity';
import { CommonFunction } from 'src/api/crm/contacts/common/common-functions';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { Contacts } from 'src/api/crm/contacts/common/entities/contacts.entity';
import { DepartService } from './services/depart.service';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Address,
      Contacts,
      User,
      Tenant,
      Permissions,
      Staff,
      ContactsRoles,
      StaffAssignments,
      Shifts,
    ]),
  ],
  controllers: [DepartController],
  providers: [
    DepartService,
    S3Service,
    JwtService,
    ExportService,
    CommonFunction,
  ],
  exports: [S3Service, ExportService],
})
export class StaffingManagementDepartModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '/view-schedules/departure-schedules/search',
      method: RequestMethod.GET,
    });
  }
}
