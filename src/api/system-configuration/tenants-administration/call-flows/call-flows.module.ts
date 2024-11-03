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
import { User } from '../user-administration/user/entity/user.entity';
import { CallFlowsEntity } from './entity/call-flows.entity';
import { CallFlowsController } from './controller/call-flows.controller';
import { CallFlowsService } from './services/call-flows.service';
import { CallFlowsEntityHistory } from './entity/call-flows.entity-history';
import { CallJobsCallFlows } from 'src/api/call-center/call-schedule/call-jobs/entities/call-jobs-call-flows.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permissions,
      CallFlowsEntity,
      CallFlowsEntityHistory,
      CallJobsCallFlows,
      User,
    ]),
  ],
  controllers: [CallFlowsController],
  providers: [CallFlowsService, JwtService],
  exports: [CallFlowsService],
})
export class CallFlowsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: '/call-center/call-flows',
        method: RequestMethod.POST,
      },
      {
        path: '/call-center/call-flows/:id',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/call-flows/call-job-id/:callJobId',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/call-flows/',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/call-flows/:id',
        method: RequestMethod.PUT,
      },
      {
        path: '/call-center/call-flows/:id',
        method: RequestMethod.PATCH,
      }
    );
  }
}
