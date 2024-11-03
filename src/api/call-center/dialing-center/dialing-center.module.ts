import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { JwtService } from '@nestjs/jwt';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { CallJobs } from '../call-schedule/call-jobs/entities/call-jobs.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { DialingCenterController } from './controller/dialing-center.controler';
import { DialingCenterService } from './service/dialing-center-call-jobs.service';
import { DialingCenterCallJobs } from './entity/dialing-center-call-jobs.entity';
import { DialingCenterNotes } from './entity/dailing-center-notes';
import { CallJobsModule } from '../call-schedule/call-jobs/call-jobs.module';
import { Donors } from 'src/api/crm/contacts/donor/entities/donors.entity';
import { DonorsModule } from 'src/api/crm/contacts/donor/donors.module';
import { ContactPreferencesModule } from 'src/api/crm/contacts/common/contact-preferences/contact-preferences.module';
import { StartCallingController } from './start-calling/controller/start-calling.controller';
import { StartCallingService } from './start-calling/service/start-calling.service';
import { ManageScriptsModule } from '../manage-scripts/manage-scripts.module';
import { CallFlowsModule } from 'src/api/system-configuration/tenants-administration/call-flows/call-flows.module';
import { CallMaxCountReset } from './cron/call_max_count_reset.cron';
import { CallJobContacts } from '../manage-segments/entities/call-job-contacts.entity';
import { CallCenterUsersModule } from '../user/call-center-users.module';

@Module({
  imports: [
    CallJobsModule,
    DonorsModule,
    ContactPreferencesModule,
    ManageScriptsModule,
    CallFlowsModule,
    CallCenterUsersModule,
    TypeOrmModule.forFeature([
      Permissions,
      CallJobs,
      CallJobContacts,
      Donors,
      DialingCenterCallJobs,
      User,
      DialingCenterNotes,
    ]),
  ],
  controllers: [DialingCenterController, StartCallingController],
  providers: [
    DialingCenterService,
    StartCallingService,
    JwtService,
    CallMaxCountReset,
  ],
  exports: [DialingCenterService, StartCallingService],
})
export class DialingCenterModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: '/call-center/dialing-center/call-jobs',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/dialing-center/:id',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/dialing-center/call-jobs/agent',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/dialing-center',
        method: RequestMethod.POST,
      },
      {
        path: '/call-center/dialing-center/start-calling/token',
        method: RequestMethod.POST,
      },
      /*  {
        path: '/call-center/dialing-center/start-calling/init',
        method: RequestMethod.POST,
      }, */
      {
        path: '/call-center/dialing-center/start-calling/voice-message',
        method: RequestMethod.PUT,
      },
      {
        path: '/call-center/dialing-center/start-calling/call-child',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/dialing-center/notes',
        method: RequestMethod.POST,
      },
      {
        path: '/call-center/dialing-center/:donor_id',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/dialing-center/operation-detail/:operation_id',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/dialing-center/donor/:donor_id',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/dialing-center/donors-info',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/call-jobs/dialing-center-call-job/:id',
        method: RequestMethod.PATCH,
      }
    );
  }
}
