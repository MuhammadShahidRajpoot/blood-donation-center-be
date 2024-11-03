import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { AuthMiddleware } from 'src/api/middlewares/auth';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { CommonFunction } from '../common/common-functions';
import { Donors } from './entities/donors.entity';
import { DonorsHistory } from './entities/donors-history.entity';
import { DonorsController } from './controller/donors.controller';
import { DonorsService } from './services/donors.service';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { AddressHistory } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/addressHistory.entity';
import { Contacts } from '../common/entities/contacts.entity';
import { ContactsHistory } from '../common/entities/contacts-history.entity';
import { AddressService } from '../common/address.service';
import { ContactsService } from '../common/contacts.service';
import { Prefixes } from '../common/prefixes/entities/prefixes.entity';
import { Suffixes } from '../common/suffixes/entities/suffixes.entity';
import { DonorDuplicatesModule } from './donorDuplicates/donor-duplicates.module';
import { S3Service } from '../common/s3.service';
import { ExportService } from '../common/exportData.service';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { DonorRecentActivity } from './recent-activity/recent-activity.module';
import { CustomFields } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-field.entity';
import { DonorsAppointments } from './entities/donors-appointments.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { ShiftsSlots } from 'src/api/shifts/entities/shifts-slots.entity';
import { Drives } from 'src/api/operations-center/operations/drives/entities/drives.entity';
import { Sessions } from 'src/api/operations-center/operations/sessions/entities/sessions.entity';
import { DonorsAppointmentsHistory } from './entities/donors-appointments-history.entity';
import { BBCSConnector } from 'src/connector/bbcsconnector';
import { TenantConfigurationDetail } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenantConfigurationDetail';
import { BBCSDataSync } from './cron/syncDonorsWithBBCS.cron';
import { DonorDonations } from './donorDonationHistory/entities/donor-donations.entity';
import { DonorCenterCodes } from './entities/donor-center-codes.entity';
import { DonorGroupCodes } from './entities/donor-group-codes.entity';
import { DonorsAssertionCodes } from './entities/donors-assertion-codes.entity';
import { CRMVolunteer } from '../volunteer/entities/crm-volunteer.entity';
import { Staff } from '../staff/entities/staff.entity';
import { DonorsEligibilities } from './entities/donor_eligibilities.entity';
import { BloodGroups } from './entities/blood-group.entity';
import { BecsRaces } from './entities/becs-race.entity';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { VolunteerListView } from '../volunteer/entities/crm-volunteer-list-view.entity';
import { DonorsViewList } from './entities/donors_list_view.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Donors,
      CRMVolunteer,
      Staff,
      DonorsHistory,
      DonorsViewList,
      Address,
      AddressHistory,
      Contacts,
      ContactsHistory,
      DonorDonations,
      DonorsEligibilities,
      Tenant,
      Prefixes,
      Suffixes,
      Permissions,
      CustomFields,
      DonorsAppointments,
      Shifts,
      ShiftsSlots,
      Drives,
      Sessions,
      DonorsAppointmentsHistory,
      DonorCenterCodes,
      DonorGroupCodes,
      DonorsAssertionCodes,
      TenantConfigurationDetail,
      BloodGroups,
      BecsRaces,
      ProcedureTypes,
      VolunteerListView
    ]),
    DonorDuplicatesModule,
    DonorRecentActivity,
  ],
  controllers: [DonorsController],
  providers: [
    DonorsService,
    CommonFunction,
    AddressService,
    ContactsService,
    JwtService,
    S3Service,
    BBCSConnector,
    ExportService,
    BBCSConnector,
    BBCSDataSync,
    DonorsViewList,
  ],
  exports: [
    DonorsService,
    CommonFunction,
    AddressService,
    ContactsService,
    S3Service,
    ExportService,
  ],
})
export class DonorsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      { path: '/contact-donors', method: RequestMethod.POST },
      { path: '/contact-donors/appointments', method: RequestMethod.POST },
      { path: '/contact-donors', method: RequestMethod.GET },
      { path: '/contact-donors/find-donor-bbcs', method: RequestMethod.GET },
      {
        path: '/contact-donors/donor-appointments',
        method: RequestMethod.GET,
      },
      {
        path: '/contact-donors/upsert/seed-data',
        method: RequestMethod.GET,
      },
      {
        path: '/contact-donors/donor-appointments/:id',
        method: RequestMethod.GET,
      },
      {
        path: '/contact-donors/donor-appointments/filters/:id',
        method: RequestMethod.GET,
      },
      {
        path: '/contact-donors/donor-appointments/create-listing/:id',
        method: RequestMethod.GET,
      },
      {
        path: '/contact-donors/donor-appointments/create-details/:id',
        method: RequestMethod.GET,
      },
      {
        path: '/contact-donors/donor-appointments/create-details/start-time/:id',
        method: RequestMethod.GET,
      },
      {
        path: '/contact-donors/donor-appointments/archive/:id',
        method: RequestMethod.GET,
      },

      { path: '/contact-donors/:id', method: RequestMethod.GET },
      { path: '/contact-donors/eligibilities/details/:id', method: RequestMethod.GET },
      { path: '/contact-donors/:id', method: RequestMethod.PUT },
      { path: '/contact-donors/:id', method: RequestMethod.PATCH },
      {
        path: '/contact-donors/donors/:donorId/appointments/:appointmentId',
        method: RequestMethod.PUT,
      },
      {
        path: '/contact-donors/donors/:donorId/appointments/cancel/:appointmentId',
        method: RequestMethod.PUT,
      },
      { path: '/contact-donors/appointment/:id', method: RequestMethod.GET }
    );
  }
}
