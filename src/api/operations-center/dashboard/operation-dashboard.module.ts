import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { OperationDashboardController } from './controller/dashboard-controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { OperationDashboardService } from './service/operation-dashboard.service';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { JwtService } from '@nestjs/jwt';
import { Sessions } from '../operations/sessions/entities/sessions.entity';
import { Drives } from '../operations/drives/entities/drives.entity';
import { MonthlyGoals } from 'src/api/system-configuration/tenants-administration/organizational-administration/goals/monthly-goals/entities/monthly-goals.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { DonorDonations } from 'src/api/crm/contacts/donor/donorDonationHistory/entities/donor-donations.entity';
import { PromotionEntity } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotions/entity/promotions.entity';
import { BookingRules } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/booking-rules/entities/booking-rules.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Permissions,
      Drives,
      Sessions,
      MonthlyGoals,
      Shifts,
      DonorDonations,
      PromotionEntity,
      BookingRules,
    ]),
  ],
  controllers: [OperationDashboardController],
  providers: [OperationDashboardService, JwtService],
})
export class OperationDashboardModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: '/operation-dashboard/kpi',
        method: RequestMethod.GET,
      },
      {
        path: '/operation-dashboard/blood-type',
        method: RequestMethod.GET,
      },
      {
        path: '/operation-dashboard/drive-schedule',
        method: RequestMethod.GET,
      },
      {
        path: '/operation-dashboard/promotions',
        method: RequestMethod.GET,
      },
      {
        path: '/operation-dashboard/forecast',
        method: RequestMethod.GET,
      }
    );
  }
}
