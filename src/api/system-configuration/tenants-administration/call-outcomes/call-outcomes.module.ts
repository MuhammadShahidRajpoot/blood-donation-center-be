import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallOutcomesController } from './controller/call-outcomes.controller';
import { CallOutcomesService } from './services/call-outcomes.service';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { JwtService } from '@nestjs/jwt';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { CallOutcomes } from './entities/call-outcomes.entity';
import { CallOutcomesHistory } from './entities/call-outcomes-history.entity';
import { User } from '../user-administration/user/entity/user.entity';
import { CallCenterSettings } from '../call-center-settings/entities/call-center-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permissions,
      CallOutcomes,
      CallOutcomesHistory,
      CallCenterSettings,
      User,
    ]),
  ],
  controllers: [CallOutcomesController],
  providers: [CallOutcomesService, JwtService],
  exports: [CallOutcomesService],
})
export class CallOutcomesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: '/call-center/call-outcomes',
        method: RequestMethod.POST,
      },
      {
        path: '/call-center/call-outcomes/:id',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/call-outcomes',
        method: RequestMethod.GET,
      },
      {
        path: '/call-center/call-outcomes/:id',
        method: RequestMethod.PUT,
      }
    );
  }
}
