import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallCenterSettingsController } from './controller/call-center-settings.controller';
import { CallCenterSettingsService } from './services/call-center-settings.service';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { JwtService } from '@nestjs/jwt';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { CallCenterSettings } from './entities/call-center-settings.entity';
import { CallCenterSettingsHistory } from './entities/call-center-settings-history.entity';
import { User } from '../user-administration/user/entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permissions,
      CallCenterSettings,
      CallCenterSettingsHistory,
      User,
    ]),
  ],
  controllers: [CallCenterSettingsController],
  providers: [CallCenterSettingsService, JwtService],
  exports: [CallCenterSettingsService],
})
export class CallCenterSettingsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: '/call-center-administrations/call-center-settings',
        method: RequestMethod.POST,
      },
      {
        path: '/call-center-administrations/call-center-settings',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center-administrations/call-center-settings/:id',
        method: RequestMethod.PUT,
      }
    );
  }
}
