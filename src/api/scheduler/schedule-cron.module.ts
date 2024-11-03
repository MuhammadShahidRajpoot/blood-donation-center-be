import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { SchedulerService } from './services/scheduler.service';
import { ScheduleJobConfiguration } from './entities/schedule_job_configuration.entity';
import { BBCSDataSyncsModule } from '../bbcs_data_syncs/bbcs_data_syncs.module';
import { BBCSDataSyncsService } from '../bbcs_data_syncs/services/bbcs_data_syncs.service';
import { Donors } from '../crm/contacts/donor/entities/donors.entity';
import { Address } from '../system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { Contacts } from '../crm/contacts/common/entities/contacts.entity';
import { DonorsEligibilities } from '../crm/contacts/donor/entities/donor_eligibilities.entity';
import { ContactPreferences } from '../crm/contacts/common/contact-preferences/entities/contact-preferences';
import { Accounts } from '../crm/accounts/entities/accounts.entity';
import { IndustryCategories } from '../system-configuration/tenants-administration/crm-administration/account/industry-categories/entities/industry-categories.entity';
import { BusinessUnits } from '../system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { Suffixes } from '../crm/contacts/common/suffixes/entities/suffixes.entity';
import { User } from '../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { ProcedureTypes } from '../system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { DataSyncBatchOperations } from '../bbcs_data_syncs/entities/data_sync_batch_operations.entity';
import { BloodGroups } from '../crm/contacts/donor/entities/blood-group.entity';
import { BecsRaces } from '../crm/contacts/donor/entities/becs-race.entity';
import { TenantConfigurationDetail } from '../system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenantConfigurationDetail';
import { BBCSConnector } from 'src/connector/bbcsconnector';
import { CrmLocations } from '../crm/locations/entities/crm-locations.entity';
import { Drives } from '../operations-center/operations/drives/entities/drives.entity';
import { Shifts } from '../shifts/entities/shifts.entity';
import { BookingRules } from '../system-configuration/tenants-administration/operations-administration/booking-drives/booking-rules/entities/booking-rules.entity';
import { DonorsAppointments } from '../crm/contacts/donor/entities/donors-appointments.entity';
import { ShiftsSlots } from '../shifts/entities/shifts-slots.entity';
import { Sessions } from '../operations-center/operations/sessions/entities/sessions.entity';
import { DonorDonationService } from '../crm/contacts/donor/donorDonationHistory/services/donor-donation.service';
import { Procedure } from '../system-configuration/tenants-administration/organizational-administration/products-procedures/procedures/entities/procedure.entity';
import { Hospitals } from '../crm/contacts/donor/donorDonationHistory/entities/hospitals.entity';
import { DonorDonations } from '../crm/contacts/donor/donorDonationHistory/entities/donor-donations.entity';
import { DonorDonationsHistory } from '../crm/contacts/donor/donorDonationHistory/entities/donor-donations-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Donors,
      Address,
      Contacts,
      DonorsEligibilities,
      ContactPreferences,
      Accounts,
      IndustryCategories,
      BusinessUnits,
      Suffixes,
      User,
      ProcedureTypes,
      DataSyncBatchOperations,
      BloodGroups,
      BecsRaces,
      TenantConfigurationDetail,
      ScheduleJobConfiguration,
      CrmLocations,
      Drives,
      Shifts,
      BookingRules,
      DonorsAppointments,
      ShiftsSlots,
      Sessions,
      Procedure,
      Hospitals,
      DonorDonations,
      DonorDonationsHistory
    ]),
    BBCSDataSyncsModule,
  ],
  controllers: [],
  providers: [SchedulerService, BBCSDataSyncsService, DonorDonationService, BBCSConnector],
  exports: [SchedulerService],
})
export class SchedulerCronModule {}
