import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { User } from '../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { ManageScripts } from './entities/manage-scripts.entity';
import { ManageScriptsController } from './controller/manage-scripts.controller';
import { ManageScriptsService } from './services/manage-scripts.services';
import { ManageScriptsHistory } from './entities/manage-scripts-history.entity';
import { S3Service } from 'src/api/crm/contacts/common/s3.service';
import { GenericAttachmentsFiles } from 'src/api/common/entities/generic_attachment_file.entity';
import { CallJobsCallScripts } from '../call-schedule/call-jobs/entities/call-jobs-call-scripts.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ManageScripts,
      ManageScriptsHistory,
      GenericAttachmentsFiles,
      Permissions,
      S3Service,
      CallJobsCallScripts,
    ]),
  ],
  controllers: [ManageScriptsController],
  providers: [ManageScriptsService, S3Service, JwtService],
  exports: [ManageScriptsService, S3Service],
})
export class ManageScriptsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      { path: '/call-center/scripts', method: RequestMethod.POST },
      { path: '/call-center/scripts', method: RequestMethod.GET },
      {
        path: '/call-center/scripts/call-job-id/:callJobId',
        method: RequestMethod.GET,
      },
      { path: '/call-center/scripts/:id', method: RequestMethod.GET },
      { path: '/call-center/scripts/:id', method: RequestMethod.PUT },
      { path: '/call-center/scripts/:id', method: RequestMethod.PATCH }
    );
  }
}
