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
import { CallCenterUsersController } from './controller/call-center-user.controller';
import { CallCenterUsersService } from './service/call-center-users.service';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { CallCenterUsers } from './entity/call-center-users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permissions, CallCenterUsers, User])],
  controllers: [CallCenterUsersController],
  providers: [CallCenterUsersService, JwtService],
  exports: [CallCenterUsersService],
})
export class CallCenterUsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes({
      path: '/call-center/agents',
      method: RequestMethod.GET,
    });
  }
}
