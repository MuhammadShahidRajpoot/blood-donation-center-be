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
import { CallJobs } from './entities/call-jobs.entity';
import { User } from '../../../../api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { CallJobsController } from './controller/call-job.controller';
import { CallJobsService } from './services/call-job.service';
import { CallJobsAssociatedOperations } from './entities/call-job-operation-association.entity';
import { CallJobsAgents } from './entities/call-jobs-agents.entity';
import { CallJobsCallFlows } from './entities/call-jobs-call-flows.entity';
import { CallJobsCallScripts } from './entities/call-jobs-call-scripts.entity';
import { CallJobsCallSegments } from './entities/call-jobs-call-segments.entity';
import { CallJobsHistory } from './entities/call-jobs-history.entity';
import { GenericAttachmentsFiles } from 'src/api/common/entities/generic_attachment_file.entity';
import { TelerecruitmentRequestsService } from '../telerecruitment-requests/service/telerecruitment-requests.service';
import { TelerecruitmentRequests } from '../telerecruitment-requests/entities/telerecruitment-requests.entity';
import { DialingCenterCallJobs } from '../../dialing-center/entity/dialing-center-call-jobs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permissions,
      CallJobs,
      CallJobsAssociatedOperations,
      User,
      CallJobsAgents,
      CallJobsCallFlows,
      CallJobsCallScripts,
      CallJobsCallSegments,
      CallJobsHistory,
      CallJobsAgents,
      GenericAttachmentsFiles,
      TelerecruitmentRequests,
      DialingCenterCallJobs,
    ]),
  ],
  controllers: [CallJobsController],
  providers: [CallJobsService, TelerecruitmentRequestsService, JwtService],
  exports: [CallJobsService],
})
export class CallJobsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      { path: '/call-center/call-jobs', method: RequestMethod.POST },
      {
        path: '/call-center/call-jobs/associate-operation',
        method: RequestMethod.POST,
      },
      {
        path: '/call-center/call-jobs/assign-agents/:callJobId',
        method: RequestMethod.POST,
      },
      {
        path: '/call-center/call-jobs',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/call-jobs/:id',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/call-jobs/:callJobId',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/call-jobs/agent/:callJobId',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/call-jobs/:callJobId',
        method: RequestMethod.PUT,
      },
      {
        path: '/call-center/call-jobs/assign-agents/:callJobId',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/call-jobs/call-schedule/deactivate/:CallJobId',
        method: RequestMethod.PUT,
      },
      {
        path: '/call-center/call-jobs/unassign/:CallJobId/:AgentId',
        method: RequestMethod.PUT,
      },
      {
        path: '/call-center/call-jobs/add-segments/:CallJobId',
        method: RequestMethod.POST,
      },
      {
        path: '/call-center/call-jobs/call-jobs-agents/:id',
        method: RequestMethod.PATCH,
      }
    );
  }
}
