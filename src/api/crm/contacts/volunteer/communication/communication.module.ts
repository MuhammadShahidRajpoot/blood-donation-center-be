import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CommunicationController } from './controller/communication.controller';
import { CommunicationService } from './services/communication.service';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Communications } from './entities/communication.entity';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { Contacts } from '../../common/entities/contacts.entity';
import { CRMVolunteer } from '../entities/crm-volunteer.entity';
import { HttpService, HttpModule } from '@nestjs/axios';
import { TenantService } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/services/tenant.service';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { TenantHistory } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenantHistory.entity';
import { TenantConfigurationDetail } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenantConfigurationDetail';
import { TenantConfigurationDetailHistory } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenantConfigurationDetailHistory';
import { AddressHistory } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/addressHistory.entity';
import { Applications } from 'src/api/system-configuration/platform-administration/roles-administration/application/entities/application.entity';
import { ContactsRoles } from 'src/api/system-configuration/tenants-administration/crm-administration/contacts/role/entities/contacts-role.entity';
import { RolePermission } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/rolePermission.entity';
import { Roles } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/role.entity';
import { UserEmailTemplateService } from 'src/api/system-configuration/tenants-administration/organizational-administration/content-management-system/email-template/services/user-email-template.service';
import { VolunteerListView } from '../entities/crm-volunteer-list-view.entity';
import { EmailTemplate } from 'src/api/admin/email-template/entities/email-template.entity';
import { EmailTemplateHistory } from 'src/api/admin/email-template/entities/email-template-history.entity';
import { TemplateService } from 'src/api/admin/templates/services/template.service';
import { CommonFunction } from '../../common/common-functions';
import { Templates } from 'src/api/admin/templates/entities/templates.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Communications,
      Permissions,
      Contacts,
      CRMVolunteer,
      Tenant,
      Address,
      TenantHistory,
      TenantConfigurationDetail,
      TenantConfigurationDetailHistory,
      AddressHistory,
      Applications,
      ContactsRoles,
      RolePermission,
      Roles,
      VolunteerListView,
      EmailTemplate,
      EmailTemplateHistory,
      Templates,
    ]),
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  controllers: [CommunicationController],
  providers: [
    CommunicationService,
    JwtService,
    HttpModule,
    TenantService,
    UserEmailTemplateService,
    TemplateService,
    CommonFunction,
  ], // HttpService should only be in providers
  exports: [CommunicationService],
})
export class CommunicationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: '/contacts/volunteers/communications',
        method: RequestMethod.GET,
      },
      {
        path: '/contacts/volunteers/communications',
        method: RequestMethod.POST,
      },
      {
        path: '/contacts/volunteers/communications/campaigns',
        method: RequestMethod.GET,
      },
      {
        path: '/contacts/volunteers/communications/email-templates/:campaign_id',
        method: RequestMethod.GET,
      },
      {
        path: '/contacts/volunteers/communications/:id',
        method: RequestMethod.GET,
      }
    );
  }
}
