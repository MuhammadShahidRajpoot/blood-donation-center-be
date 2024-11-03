import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { OcApprovalsService } from './service/oc-approvals.service';
import { OcApprovalsController } from './controller/oc-approval.controller';
import { OcApprovals } from './entities/oc-approval.entity';
import { OcApprovalsHistory } from './entities/oc-approval-history.entity';
import { OcApprovalsDetail } from './entities/oc-approval-detail.entity';
import { OcApprovalsDetailHistory } from './entities/oc-approval-detail-history.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { JwtService } from '@nestjs/jwt';
import { Sessions } from '../operations/sessions/entities/sessions.entity';
import { Drives } from '../operations/drives/entities/drives.entity';
import { NonCollectionEvents } from '../operations/non-collection-events/entities/oc-non-collection-events.entity';
import { OrganizationalLevels } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/organizational-levels/entities/organizational-level.entity';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OcApprovals,
      OcApprovalsHistory,
      OcApprovalsDetail,
      OcApprovalsDetailHistory,
      Shifts,
      User,
      Permissions,
      Sessions,
      Drives,
      NonCollectionEvents,
      OrganizationalLevels,
      BusinessUnits,
    ]),
  ],
  controllers: [OcApprovalsController],
  providers: [OcApprovalsService, JwtService],
})
export class OcApprovalsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: '/operations/approvals',
        method: RequestMethod.POST,
      },
      {
        path: '/operations/approvals',
        method: RequestMethod.GET,
      },
      {
        path: '/operations/approvals/:id/details',
        method: RequestMethod.GET,
      },
      {
        path: 'operations/approvals/archive/:id',
        method: RequestMethod.PATCH,
      },
      {
        path: 'operations/approvals/:id/approval-details',
        method: RequestMethod.PUT,
      }
    );
  }
}
