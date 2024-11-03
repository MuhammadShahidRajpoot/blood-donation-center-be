import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { BBCSDataSyncsService } from './services/bbcs_data_syncs.service';
import { BBCSDataSyncsController } from './controller/bbcs_data_syncs.controller';
import { AuthMiddleware } from '../middlewares/auth';
import { JwtService } from '@nestjs/jwt';
import { Address } from '../system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { Contacts } from '../crm/contacts/common/entities/contacts.entity';
import { Donors } from '../crm/contacts/donor/entities/donors.entity';
import { User } from '../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { Permissions } from '../system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { BBCSConnector } from 'src/connector/bbcsconnector';
import { DataSyncBatchOperations } from './entities/data_sync_batch_operations.entity';
import { Accounts } from '../crm/accounts/entities/accounts.entity';
import { IndustryCategories } from '../system-configuration/tenants-administration/crm-administration/account/industry-categories/entities/industry-categories.entity';
import { BusinessUnits } from '../system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { TenantConfigurationDetail } from '../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenantConfigurationDetail';
import { BecsRaces } from '../crm/contacts/donor/entities/becs-race.entity';
import { BloodGroups } from '../crm/contacts/donor/entities/blood-group.entity';
import { ContactPreferences } from '../crm/contacts/common/contact-preferences/entities/contact-preferences';
import { Suffixes } from '../crm/contacts/common/suffixes/entities/suffixes.entity';
import { ProcedureTypes } from '../system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { DonorsEligibilities } from '../crm/contacts/donor/entities/donor_eligibilities.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Donors,
      Address,
      Contacts,
      ContactPreferences,
      User,
      Permissions,
      DataSyncBatchOperations,
      Accounts,
      IndustryCategories,
      BusinessUnits,
      ProcedureTypes,
      TenantConfigurationDetail,
      BecsRaces,
      BloodGroups,
      Suffixes,
      DonorsEligibilities,
    ]),
  ],
  providers: [BBCSDataSyncsService, JwtService, BBCSConnector],
  controllers: [BBCSDataSyncsController],
  exports: [BBCSDataSyncsService],
})
export class BBCSDataSyncsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/bbcs/donors/sync', method: RequestMethod.PATCH },
        { path: '/bbcs/accounts/sync', method: RequestMethod.PATCH },
        { path: '/bbcs/donors/sync/stop', method: RequestMethod.PATCH }
      );
  }
}
