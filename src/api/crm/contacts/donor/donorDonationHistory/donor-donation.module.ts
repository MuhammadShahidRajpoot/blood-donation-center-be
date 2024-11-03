import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { Donors } from '../entities/donors.entity';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { DonorDonations } from './entities/donor-donations.entity';
import { DonorDonationsHistory } from './entities/donor-donations-history.entity';
import { DonorDonationController } from './controller/donor-donation-history.controller';
import { DonorDonationService } from './services/donor-donation.service';
import { DonorDonationsDataBBCS } from './cron/bbcs-donor-donations-data.cron';
import { DonorDonationsHospitals } from './entities/donor-donations-hospitals.entity';
import { Hospitals } from './entities/hospitals.entity';
import { HospitalsHistory } from './entities/hospitals-history.entity';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { BBCSConnector } from 'src/connector/bbcsconnector';
import { Accounts } from 'src/api/crm/accounts/entities/accounts.entity';
import { Procedure } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedures/entities/procedure.entity';
import { DonorsAppointments } from '../entities/donors-appointments.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      DonorDonations,
      DonorDonationsHistory,
      Donors,
      Permissions,
      DonorDonationsHospitals,
      Hospitals,
      HospitalsHistory,
      Address,
      Accounts,
      Procedure,
      DonorsAppointments
    ]),
  ],
  controllers: [DonorDonationController],
  providers: [
    DonorDonationService,
    JwtService,
    DonorDonationsDataBBCS,
    BBCSConnector,
  ],
})
export class DonorDonationsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: '/donors/donations/history',
        method: RequestMethod.POST,
      },
      {
        path: '/donors/donations/history/hospitals',
        method: RequestMethod.GET,
      }
    );
  }
}
