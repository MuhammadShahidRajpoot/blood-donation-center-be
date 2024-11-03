import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthMiddleware } from '../middlewares/auth';
import { JwtService } from '@nestjs/jwt';
import { PushNotifications } from './entities/push-notifications.entity';
import { NotificationsService } from './services/notifications.service';

import { UserNotifications } from './entities/user-notifications.entity';
import { TargetNotifications } from './entities/target-notifications.entity';
import { User } from '../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { Permissions } from '../system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { NotificationsController } from './controller/notifications.controller';
import { NotificationsGateway } from './services/notifications.gateway';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Permissions,
      NotificationsService,
      PushNotifications,
      UserNotifications,
      TargetNotifications,
    ]),
  ],
  providers: [NotificationsService, JwtService, NotificationsGateway],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '/notifications', method: RequestMethod.POST },
        { path: '/notifications', method: RequestMethod.GET },
        { path: '/notifications/markAllAsRead', method: RequestMethod.PUT },
        { path: '/notifications/markAllAsRead/:id', method: RequestMethod.PUT }
      );
  }
}
