import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { ManageSegmentsController } from './controller/manage-segments.controller';
import { ManageSegmentsService } from './services/manage-segments.service';
import { Segments } from './entities/segments.entity';
import { SegmentsHistory } from './entities/segments-history.entity';
import { SegmentsContacts } from './entities/segments-contacts.entity';
import { Contacts } from 'src/api/crm/contacts/common/entities/contacts.entity';
import { DailyStoryDataSync } from './cron/syncSegmentsFromDailyStory.cron';
import { CallJobContacts } from './entities/call-job-contacts.entity';
import { Donors } from 'src/api/crm/contacts/donor/entities/donors.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Tenant,
      Permissions,
      Segments,
      SegmentsHistory,
      SegmentsContacts,
      Contacts,
      CallJobContacts,
      Donors,
    ]),
  ],
  controllers: [ManageSegmentsController],
  providers: [ManageSegmentsService, JwtService, DailyStoryDataSync],
  exports: [ManageSegmentsService],
})
export class ManageSegmentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      { path: '/call-center/segments', method: RequestMethod.POST },
      { path: '/call-center/segments', method: RequestMethod.GET },
      {
        path: '/call-center/manage-segments/contacts',
        method: RequestMethod.POST,
      },
      { path: '/call-center/segments-update', method: RequestMethod.GET },
      {
        path: '/call-center/segments/:segmentId/donor-information',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/segments-contacts/:id',
        method: RequestMethod.PATCH,
      },
      {
        path: '/call-center/call-jobs-segments-contacts/:id',
        method: RequestMethod.PATCH,
      }
    );
  }
}
