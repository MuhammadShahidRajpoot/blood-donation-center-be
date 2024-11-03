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
import { User } from '../../../../api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { AssertionController } from './controller/donor-assertion.controller';
import { AssertionService } from './services/donor-assertion.service';
import { Assertion } from './entity/assertion.entity';
import { AssertionHistory } from './entity/assertion-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permissions, User, Assertion, AssertionHistory]),
  ],
  controllers: [AssertionController],
  providers: [AssertionService, JwtService],
  exports: [AssertionService],
})
export class AssertionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      { path: '/call-center/assertions', method: RequestMethod.POST },
      { path: '/call-center/assertions/:id', method: RequestMethod.PUT },
      { path: '/call-center/assertions/:id', method: RequestMethod.GET },
      {
        path: '/call-center/assertions',
        method: RequestMethod.GET,
      }
    );
  }
}
