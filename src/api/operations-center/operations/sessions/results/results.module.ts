import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { PromotionEntity } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotions/entity/promotions.entity';
import { OperationsStatus } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { CustomFields } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-field.entity';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { Facility } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/facilities/entity/facility.entity';
import { DonationsSummeryController } from './controller/donation-summery.controller';
import { DonationsSummery } from './entities/sessions-donation-summery.entity';
import { DonationsSummeryService } from './service/donations-summery.services';
import { EntityManager, Repository } from 'typeorm';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { Sessions } from '../entities/sessions.entity';
import { SessionsHistory } from '../entities/sessions-history.entity';
import { SessionsPromotions } from '../entities/sessions-promotions.entity';
import { SessionsPromotionsHistory } from '../entities/sessions-promotions-history.entity';
import { DonationsSummeryHistory } from './entities/sessions-donations-summery-history.entity';
// import { DonationsSummeryService } from './service/donations-summery.services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sessions,
      SessionsHistory,
      SessionsPromotions,
      SessionsPromotionsHistory,
      User,
      PromotionEntity,
      OperationsStatus,
      CustomFields,
      Permissions,
      BusinessUnits,
      Facility,
      DonationsSummery,
      ProcedureTypes,
      Shifts,
      DonationsSummeryHistory,
    ]),
  ],
  controllers: [DonationsSummeryController],
  providers: [DonationsSummeryService, JwtService],
})
export class ResultModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: '/operations/sessions/:id/results',
        method: RequestMethod.GET,
      },
      {
        path: '/operations/sessions/:id/results/:shift_id/projections/:procedure_type_id',
        method: RequestMethod.POST,
      },
      {
        path: '/operations/sessions/:id/results/:shift_id/projections/:procedure_type_id',
        method: RequestMethod.PUT,
      }
    );
  }
}
