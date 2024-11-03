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
import { User } from '../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { TelerecruitmentRequestsController } from './controller/telerecruitment-requests.controller';
import { GenericAttachmentsFiles } from 'src/api/common/entities/generic_attachment_file.entity';
import { TelerecruitmentRequestsService } from './service/telerecruitment-requests.service';
import { TelerecruitmentRequests } from './entities/telerecruitment-requests.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permissions,
      User,
      GenericAttachmentsFiles,
      TelerecruitmentRequests,
    ]),
  ],
  controllers: [TelerecruitmentRequestsController],
  providers: [TelerecruitmentRequestsService, JwtService],
  exports: [TelerecruitmentRequestsService],
})
export class TelerecruitmentRequestsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: '/call-center/telerecruitment-requests',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/telerecruitment-requests/accept/:id',
        method: RequestMethod.PUT,
      },
      {
        path: '/call-center/telerecruitment-requests/decline/:id',
        method: RequestMethod.PUT,
      }
    );
  }
}
