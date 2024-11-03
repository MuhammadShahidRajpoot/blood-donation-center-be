import * as cron from 'cron';
import { ScheduleJobConfiguration } from '../entities/schedule_job_configuration.entity';
import moment, { Moment } from 'moment';
import { JobNamesEnum } from '../enum/jobs.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, In, IsNull, Not, Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getTenantConfig } from 'src/api/common/utils/tenantConfig';
import { IndustryCategories } from 'src/api/system-configuration/tenants-administration/crm-administration/account/industry-categories/entities/industry-categories.entity';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { Suffixes } from 'src/api/crm/contacts/common/suffixes/entities/suffixes.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { DataSyncBatchOperations } from 'src/api/bbcs_data_syncs/entities/data_sync_batch_operations.entity';
import { BloodGroups } from 'src/api/crm/contacts/donor/entities/blood-group.entity';
import { BecsRaces } from 'src/api/crm/contacts/donor/entities/becs-race.entity';
import { TenantConfigurationDetail } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenantConfigurationDetail';
import { BBCSConnector } from 'src/connector/bbcsconnector';
import { CapitalizeName } from 'src/api/utils/capitalizeName';
import { Donors } from 'src/api/crm/contacts/donor/entities/donors.entity';
import { Accounts } from 'src/api/crm/accounts/entities/accounts.entity';
import { ContactPreferences } from 'src/api/crm/contacts/common/contact-preferences/entities/contact-preferences';
import { DonorsEligibilities } from 'src/api/crm/contacts/donor/entities/donor_eligibilities.entity';
import { Contacts } from 'src/api/crm/contacts/common/entities/contacts.entity';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { ContactTypeEnum } from 'src/api/crm/contacts/common/enums';
import { findPrimaryContact } from 'src/api/crm/contacts/donor/common/common-functions';
import { DataSyncOperationTypeEnum } from '../enum/data_sync_operation_type.enum';
import { DataSyncDirectioneEnum } from '../enum/data_sync_direction.enum';
import { ExecutionStatusEnum } from '../enum/execution_status.enum';
import { DataSyncRecordExceptions } from 'src/api/bbcs_data_syncs/entities/data_sync_record_exceptions.entity';
import { CrmLocations } from 'src/api/crm/locations/entities/crm-locations.entity';
import { Drives } from 'src/api/operations-center/operations/drives/entities/drives.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { BookingRules } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/booking-rules/entities/booking-rules.entity';
import { TimeZoneCities, convertToTimeZone } from 'src/api/utils/date';
import { DonorsAppointments } from 'src/api/crm/contacts/donor/entities/donors-appointments.entity';
import { ShiftsSlots } from 'src/api/shifts/entities/shifts-slots.entity';
import { Sessions } from 'src/api/operations-center/operations/sessions/entities/sessions.entity';
import { BBCSConstants } from 'src/connector/util/connectorconstants';
import { Procedure } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedures/entities/procedure.entity';
import { DonorDonationService } from 'src/api/crm/contacts/donor/donorDonationHistory/services/donor-donation.service';
import { DonorDonations } from 'src/api/crm/contacts/donor/donorDonationHistory/entities/donor-donations.entity';

require('dotenv').config(); // eslint-disable-line @typescript-eslint/no-var-requires
export class SchedulerService {
  constructor(
    @InjectRepository(Donors)
    private readonly donorsRepository: Repository<Donors>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Contacts)
    private readonly contactsRepository: Repository<Contacts>,
    @InjectRepository(DonorsEligibilities)
    private readonly donorsEligibilities: Repository<DonorsEligibilities>,
    @InjectRepository(ContactPreferences)
    private readonly contactPreferencesRepository: Repository<ContactPreferences>,
    @InjectRepository(Accounts)
    private readonly accountRepository: Repository<Accounts>,
    @InjectRepository(IndustryCategories)
    private readonly industryCategoriesRepository: Repository<IndustryCategories>,
    @InjectRepository(BusinessUnits)
    private businessUnitsRepository: Repository<BusinessUnits>,
    @InjectRepository(Suffixes)
    private suffixesRepository: Repository<Suffixes>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProcedureTypes)
    private readonly procedure_type: Repository<ProcedureTypes>,
    @InjectRepository(DataSyncBatchOperations)
    private readonly BBCSDataSyncsRepository: Repository<DataSyncBatchOperations>,
    @InjectRepository(BloodGroups)
    private readonly bloodGroupsRepository: Repository<BloodGroups>,
    @InjectRepository(BecsRaces)
    private readonly becsRaceRepository: Repository<BecsRaces>,
    @InjectRepository(TenantConfigurationDetail)
    private readonly tenantConfigRepository: Repository<TenantConfigurationDetail>,
    @InjectRepository(ScheduleJobConfiguration)
    private readonly scheduleJobConfigurationRepository: Repository<ScheduleJobConfiguration>,
    @InjectRepository(Accounts)
    private readonly accountsRespository: Repository<Accounts>,
    @InjectRepository(CrmLocations)
    private readonly crmLocationsRespository: Repository<CrmLocations>,
    @InjectRepository(Drives)
    private readonly drivesRepo: Repository<Drives>,
    @InjectRepository(Sessions)
    private readonly sessionsRepo: Repository<Sessions>,
    @InjectRepository(Shifts)
    private readonly shiftsRepo: Repository<Shifts>,
    @InjectRepository(ShiftsSlots)
    private readonly shiftsSlotsRepo: Repository<ShiftsSlots>,
    @InjectRepository(BookingRules)
    private readonly bookingRulesRepository: Repository<BookingRules>,
    @InjectRepository(DonorsAppointments)
    private readonly donorsAppointmentsRepository: Repository<DonorsAppointments>,
    @InjectRepository(Procedure)
    private readonly procedureRepository: Repository<Procedure>,
    private readonly BBCSConnectorService: BBCSConnector,
    private readonly donorDonationService: DonorDonationService,
    @InjectRepository(DonorDonations)
    private readonly donorDonationRepository: Repository<DonorDonations>,
    private readonly entityManager: EntityManager
  ) {}

  private scheduledJobs: { [jobId: string]: cron.CronJob } = {};

  async getJobConfigs() {
    return this.scheduleJobConfigurationRepository.find({
      relations: ['job'],
    });
  }

  // @Cron(CronExpression.EVERY_10_SECONDS) // Dev
  @Cron(process.env.SCHEDULE_RUN_EXPRESSION || CronExpression.EVERY_30_MINUTES)
  async registerDynamicCronJobs() {
    // console.log('registerDynamicCronJobs');
    const cronList = (await this.getJobConfigs()) || [];
    // console.log(`Total Crons ${cronList.length}`);
    cronList.forEach((cronItem) => {
      this.scheduleCronJob(cronItem);
    });
  }

  private async scheduleCronJob(cronItem: ScheduleJobConfiguration) {
    const cronExpression = await this.generateCronExpression(
      cronItem.schedule_base_on,
      moment(cronItem.schedule_time)
    );
    // console.log({ cronExpression });
    if (!this.scheduledJobs[cronItem.id.toString()]) {
      if (cronItem.job.job_title == JobNamesEnum.DONORS_SYNC) {
        // console.log(JobNamesEnum.DONORS_SYNC);
        // console.log(`Executing task: ${cronItem.id.toString()}`);
        // console.log({ cronExpression });
        // this.syncDonorsCron({ end_date: null }, cronItem.tenant_id);
        const cronJob = new cron.CronJob(cronExpression, () => {
          // console.log('Cron Scheduled');
          this.syncDonorsCron({ end_date: null }, cronItem.tenant_id);
        });
        cronJob.start();
        console.log(`Running ${cronItem.id.toString()} : ${cronJob.running}`);
        this.scheduledJobs[cronItem.id.toString()] = cronJob;
      }

      if (cronItem.job.job_title == JobNamesEnum.DRIVES_SYNC_DEGREE37_TO_BBCS) {
        const cronJob = new cron.CronJob(cronExpression, () => {
          // console.log('Cron Scheduled');
          this.syncDrivesCron(cronItem.tenant_id);
        });
        cronJob.start();
        console.log(`Running ${cronItem.id.toString()} : ${cronJob.running}`);
        this.scheduledJobs[cronItem.id.toString()] = cronJob;
        // Sync Drives
      }

      if (
        cronItem.job.job_title == JobNamesEnum.SESSIONS_SYNC_DEGREE37_TO_BBCS
      ) {
        const cronJob = new cron.CronJob(cronExpression, () => {
          // console.log('Cron Scheduled');
          this.syncSessionsCron(cronItem.tenant_id);
        });
        cronJob.start();
        console.log(`Running ${cronItem.id.toString()} : ${cronJob.running}`);
        this.scheduledJobs[cronItem.id.toString()] = cronJob;
      }

      if (
        cronItem.job.job_title ==
        JobNamesEnum.BBCS_DONORS_DONATIONS_SYNC_TO_Degree37
      ) {
        const cronJob = new cron.CronJob(cronExpression, () => {});
        cronJob.start();
        console.log(`Running ${cronItem.id.toString()} : ${cronJob.running}`);
        this.scheduledJobs[cronItem.id.toString()] = cronJob;
        this.triggerDonorDonationHistoryAssertion(cronItem.tenant_id);
      }
      // this.syncSessionsCron(311);
    } else {
      console.log(
        `Job with ID ${cronItem.id.toString()} is already scheduled.`
      );
    }
  }

  async syncDrivesCron(tenant_id) {
    // console.log('Sync drives cron or tenant', tenant_id);

    const bookingRules = await this.bookingRulesRepository.findOne({
      where: { tenant_id },
      order: { id: 'DESC' },
    });

    const user = await this.userRepository.findOne({
      where: {
        role: {
          is_auto_created: true,
          tenant_id,
        },
      },
      relations: ['role'],
    });
    if (!user) {
      console.log('Auto generated user not found');
      return;
    }
    console.log({ user });

    // const id: any = 308;
    // const drivesForTheDay = await this.drivesRepo.find({
    // where: {
    // id,
    // tenant_id,
    // is_archived: false,
    // },
    // relations: ['tenant', 'tenant.tenant_time_zones'],
    // });

    const drivesForTheDay = await this.drivesRepo.find({
      where: {
        date: new Date(),
        tenant_id,
        is_archived: false,
      },
      relations: ['tenant', 'tenant.tenant_time_zones'],
    });

    const batchRun = await this.generateBatchOperation(
      new Date()?.toISOString(),
      null,
      0,
      0,
      drivesForTheDay.length,
      tenant_id,
      user,
      ExecutionStatusEnum.Running,
      DataSyncOperationTypeEnum.Drive,
      DataSyncDirectioneEnum.D37_TO_BBCS,
      ''
    );
    let insertCount = 0;
    for (const drive of drivesForTheDay) {
      const timezone =
        drive?.tenant?.tenant_time_zones?.length > 0
          ? drive?.tenant?.tenant_time_zones?.[0]?.code
          : 'UTC';
      // console.log({ timezone });
      const shifts = await this.shiftsRepo.find({
        where: {
          shiftable_type: PolymorphicType.OC_OPERATIONS_DRIVES,
          is_archived: false,
          tenant_id,
          shiftable_id: drive.id,
        },
        relations: ['slots', 'projections'],
        order: {
          slots: {
            start_time: 'ASC',
          },
        },
      });
      let start = null;
      let end = null;
      let numberOfSlots = 0;
      for (const shift of shifts) {
        numberOfSlots += shift?.slots?.length || 0;
        if (
          !start ||
          moment(shift?.slots?.[0]?.start_time).isBefore(moment(start))
        )
          start = moment(shift?.slots?.[0]?.start_time);
        if (
          !end ||
          moment(shift?.slots?.[shift?.slots?.length - 1]?.end_time).isAfter(
            moment(end)
          )
        )
          end = moment(shift?.slots?.[shift?.slots?.length - 1]?.end_time);
      }

      const account: any = await this.accountsRespository.findOne({
        where: {
          id: drive.account_id,
        },
      });

      const tenantConfig = await getTenantConfig(
        this.tenantConfigRepository,
        tenant_id
      );

      // TO DO: Change it for Go Live.
      const driveId = parseInt(drive.id.toString());
      const tempDriveId = driveId + 4000100;

      const query = `
			SELECT crm_locations.*, address.*
				FROM crm_locations
				INNER JOIN address ON crm_locations.id = address.addressable_id AND address.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'
				LEFT JOIN crm_volunteer AS volunteer ON crm_locations.site_contact_id = volunteer.id
				WHERE crm_locations.is_archived = false
				AND address.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'
				AND crm_locations.id = ${drive?.location_id}
			`;

      const location = await this.crmLocationsRespository.query(query);
      // console.log({ start, end });
      const { isBBCSDriveCreated, bbcsDriveData, exception } =
        await this.saveDriveonBBCS(
          drive,
          shifts,
          start,
          end,
          numberOfSlots,
          tenant_id,
          bookingRules.maximum_draw_hours_allow_appt,
          timezone,
          account,
          tenantConfig,
          tempDriveId,
          location
        );

      if (isBBCSDriveCreated) {
        insertCount += 1;
        // Success sync
        drive.is_bbcs_sync = true;
        await this.entityManager.save(drive);
        const { isGenerated, slotsParams, exception, shiftIds } =
          await this.syncDriveSlots(
            drive,
            shifts,
            location,
            timezone,
            tenantConfig,
            tempDriveId
          );
        if (isGenerated) {
          await this.shiftsSlotsRepo.update(
            {
              shift_id: In(shiftIds),
              is_archived: false,
            },
            {
              is_bbcs_sync: true,
            }
          );
          // Success
          const appoinments: any = await this.donorsAppointmentsRepository.find(
            {
              where: {
                is_archived: false,
                appointmentable_type: PolymorphicType.OC_OPERATIONS_DRIVES,
                appointmentable_id: drive.id,
              },
              relations: ['slot_id', 'procedure_type', 'donor_id'],
            }
          );
          console.log(appoinments);
          for (const appt of appoinments) {
            const apptData = {
              // source: 'BUSA', // Needs sources from BBCS
              source: location?.[0]?.becs_code, // Needs sources from BBCS
              appointmentTime: convertToTimeZone(
                appt?.slot_id?.start_time,
                TimeZoneCities[timezone]
              ).format('YYYY-MM-DDTHH:mm:ss'),
              // uuid: '4ebfec4c-d74a-4016-b462-1c6b40bf7539',
              uuid: appt?.donor_id?.external_id,
              // reason: 'FLEX', // to do: From Reason Map
              reason: appt?.procedure_type?.becs_appointment_reason,
              status: 2, // Ask for Status
              comment: '',
              user: 'D37',
            };

            const { isApptCreated, exception } =
              await this.createAppointmentBBCS(apptData, tenantConfig);
            if (!isApptCreated) {
              const exceptionData = new DataSyncRecordExceptions();
              exceptionData.tenant_id = tenant_id;
              exceptionData.created_by = user;
              exceptionData.datasyncable_id = appt?.id.toString();
              exceptionData.datasyncable_type =
                DataSyncOperationTypeEnum.Appoinments;
              exceptionData.sync_direction = DataSyncDirectioneEnum.D37_TO_BBCS;
              exceptionData.exception = JSON.stringify({
                data: apptData,
                exception: exception.toString(),
              });
              exceptionData.attempt = 1;
              exceptionData.is_deleted = false;
              await this.entityManager.save(exceptionData);
            }
          }
        } else {
          // Handle Add Ecception log
          const exceptionData = new DataSyncRecordExceptions();
          exceptionData.tenant_id = tenant_id;
          exceptionData.created_by = user;
          exceptionData.datasyncable_id = drive.id.toString();
          exceptionData.datasyncable_type = DataSyncOperationTypeEnum.Slots;
          exceptionData.sync_direction = DataSyncDirectioneEnum.D37_TO_BBCS;
          exceptionData.exception = JSON.stringify({
            data: slotsParams,
            exception: exception.toString(),
          });
          exceptionData.attempt = 1;
          exceptionData.is_deleted = false;
          await this.entityManager.save(exceptionData);
        }
      } else {
        const exceptionData = new DataSyncRecordExceptions();
        exceptionData.tenant_id = tenant_id;
        exceptionData.created_by = user;
        exceptionData.datasyncable_id = drive.id.toString();
        exceptionData.datasyncable_type = DataSyncOperationTypeEnum.Drive;
        exceptionData.sync_direction = DataSyncDirectioneEnum.D37_TO_BBCS;
        exceptionData.exception = JSON.stringify({
          data: bbcsDriveData,
          exception: exception?.toString() || '',
        });
        exceptionData.attempt = 1;
        exceptionData.is_deleted = false;
        await this.entityManager.save(exceptionData);
      }
    }
    batchRun.inserted_count = insertCount;
    batchRun.end_date = new Date();
    batchRun.job_end = new Date();
    batchRun.execution_status = ExecutionStatusEnum.Completed;
    await this.entityManager.save(batchRun);
  }

  async syncSessionsCron(tenant_id) {
    const user = await this.userRepository.findOne({
      where: {
        role: {
          is_auto_created: true,
          tenant_id,
        },
      },
      relations: ['role'],
    });
    if (!user) {
      console.log('Auto generated user not found');
      return;
    }
    console.log({ user });

    // const id: any = 1201;
    // const sessionsForTheDay = await this.sessionsRepo.find({
    // where: {
    // id,
    // tenant_id,
    // is_archived: false,
    // },
    // relations: ['tenant', 'tenant.tenant_time_zones'],
    // });

    const sessionsForTheDay = await this.sessionsRepo.find({
      where: {
        date: new Date(),
        tenant_id,
        is_archived: false,
      },
      relations: ['tenant', 'tenant.tenant_time_zones', 'donor_center'],
    });

    const batchRun = await this.generateBatchOperation(
      new Date()?.toISOString(),
      null,
      0,
      0,
      sessionsForTheDay.length,
      tenant_id,
      user,
      ExecutionStatusEnum.Running,
      DataSyncOperationTypeEnum.Session,
      DataSyncDirectioneEnum.D37_TO_BBCS,
      ''
    );
    let insertCount = 0;

    const tenantConfig = await getTenantConfig(
      this.tenantConfigRepository,
      tenant_id
    );
    for (const session of sessionsForTheDay) {
      const timezone =
        session?.tenant?.tenant_time_zones?.length > 0
          ? session?.tenant?.tenant_time_zones?.[0]?.code
          : 'UTC';
      console.log({ timezone });
      const shifts = await this.shiftsRepo.find({
        where: {
          shiftable_type: PolymorphicType.OC_OPERATIONS_SESSIONS,
          is_archived: false,
          tenant_id,
          shiftable_id: session.id,
        },
        relations: ['slots', 'projections'],
        order: {
          slots: {
            start_time: 'ASC',
          },
        },
      });
      let start = null;
      let end = null;
      let numberOfSlots = 0;
      for (const shift of shifts) {
        numberOfSlots += shift?.slots?.length || 0;
        if (
          !start ||
          moment(shift?.slots?.[0].start_time).isBefore(moment(start))
        )
          start = moment(shift?.slots?.[0]?.start_time);
        if (
          !end ||
          moment(shift?.slots?.[shift?.slots?.length - 1]?.end_time).isAfter(
            moment(end)
          )
        )
          end = moment(shift?.slots?.[shift?.slots?.length - 1]?.end_time);
      }

      const { isBBCSSessionCreated, bbcsSessionData, exception } =
        await this.saveSessiononBBCS(
          start,
          end,
          session.date,
          // '2022-12-17',
          '', // Description
          session?.donor_center?.code,
          // 'AMES' /* todo: Source*/,
          timezone,
          tenantConfig
        );
      console.log({ isBBCSSessionCreated });
      if (isBBCSSessionCreated) {
        insertCount += 1;
        // Success sync
        // session.is_bbcs_sync = true; // Add Column in Session
        await this.entityManager.save(session);
        const { isGenerated, slotsParams, exception, shiftIds } =
          await this.syncSessionSlots(
            shifts,
            timezone,
            tenantConfig,
            session.date,
            // '2022-12-17',
            session?.donor_center?.code
          );
        if (isGenerated) {
          await this.shiftsSlotsRepo.update(
            {
              shift_id: In(shiftIds),
              is_archived: false,
            },
            {
              is_bbcs_sync: true,
            }
          );
          // Success
          const appoinments: any = await this.donorsAppointmentsRepository.find(
            {
              where: {
                is_archived: false,
                appointmentable_type: PolymorphicType.OC_OPERATIONS_SESSIONS,
                appointmentable_id: session.id,
              },
              relations: ['slot_id', 'procedure_type', 'donor_id'],
            }
          );
          // console.log(appoinments);
          for (const appt of appoinments) {
            const apptData = {
              // source: 'BUSA',
              source: session?.donor_center?.code, // Facility BECS Code
              appointmentTime: convertToTimeZone(
                appt?.slot_id?.start_time,
                TimeZoneCities[timezone]
              ).format('YYYY-MM-DDTHH:mm:ss'),
              // uuid: '4ebfec4c-d74a-4016-b462-1c6b40bf7539',
              uuid: appt?.donor_id?.external_id,
              // reason: 'FLEX', // to do: From Reason Map
              reason: appt?.procedure_type?.becs_appointment_reason,
              status: 2, // Ask for Status
              comment: '',
              user: 'D37',
            };

            const { isApptCreated, exception } =
              await this.createAppointmentBBCS(apptData, tenantConfig);
            if (!isApptCreated) {
              const exceptionData = new DataSyncRecordExceptions();
              exceptionData.tenant_id = tenant_id;
              exceptionData.created_by = user;
              exceptionData.datasyncable_id = appt?.id.toString();
              exceptionData.datasyncable_type =
                DataSyncOperationTypeEnum.Appoinments;
              exceptionData.sync_direction = DataSyncDirectioneEnum.D37_TO_BBCS;
              exceptionData.exception = JSON.stringify({
                data: apptData,
                exception: exception.toString(),
              });
              exceptionData.attempt = 1;
              exceptionData.is_deleted = false;
              await this.entityManager.save(exceptionData);
            }
          }
        } else {
          // Handle Add Ecception log
          const exceptionData = new DataSyncRecordExceptions();
          exceptionData.tenant_id = tenant_id;
          exceptionData.created_by = user;
          exceptionData.datasyncable_id = session.id.toString();
          exceptionData.datasyncable_type = DataSyncOperationTypeEnum.Slots;
          exceptionData.sync_direction = DataSyncDirectioneEnum.D37_TO_BBCS;
          exceptionData.exception = JSON.stringify({
            data: slotsParams,
            exception: exception.toString(),
          });
          exceptionData.attempt = 1;
          exceptionData.is_deleted = false;
          await this.entityManager.save(exceptionData);
        }
      } else {
        const exceptionData = new DataSyncRecordExceptions();
        exceptionData.tenant_id = tenant_id;
        exceptionData.created_by = user;
        exceptionData.datasyncable_id = session.id.toString();
        exceptionData.datasyncable_type = DataSyncOperationTypeEnum.Session;
        exceptionData.sync_direction = DataSyncDirectioneEnum.D37_TO_BBCS;
        exceptionData.exception = JSON.stringify({
          data: bbcsSessionData,
          exception: exception.toString(),
        });
        exceptionData.attempt = 1;
        exceptionData.is_deleted = false;
        await this.entityManager.save(exceptionData);
      }
    }
    batchRun.inserted_count = insertCount;
    batchRun.end_date = new Date();
    batchRun.job_end = new Date();
    await this.entityManager.save(batchRun);
    batchRun.execution_status = ExecutionStatusEnum.Completed;
    await this.entityManager.save(batchRun);
  }

  async createAppointmentBBCS(apptData, tenantConfig) {
    try {
      const isApptCreated = await this.BBCSConnectorService.createAppointment(
        apptData,
        tenantConfig
      );
      return { isApptCreated, exception: '' };
    } catch (err) {
      return { isApptCreated: false, exception: err.toString() };
    }
  }
  async saveDriveonBBCS(
    drive: Drives,
    shifts: Shifts[],
    start: Moment,
    end: Moment,
    numberOfSlots: number,
    tenant_id: bigint,
    allowappointmentAtShiftEndTime: boolean,
    timezone,
    account,
    tenantConfig,
    tempDriveId,
    location
  ) {
    // console.log({ shifts });

    const procedureTypeIds = shifts
      ?.flatMap((item) =>
        item?.projections?.map((projItem) => projItem.procedure_type_id)
      )
      .filter(Boolean); // Filter out undefined or falsy values

    // console.log({ procedureTypeIds });
    const proceduresInDrive = await this.procedure_type.find({
      where: {
        id: In(procedureTypeIds),
      },
    });

    const leastDurationProcedure = proceduresInDrive.reduce(
      (minDurationProcedure, item) => {
        if (
          !minDurationProcedure ||
          item.procedure_duration < minDurationProcedure.procedure_duration
        ) {
          return item;
        }
        return minDurationProcedure;
      },
      null
    );

    const leastDuration = leastDurationProcedure?.procedure_duration;

    // console.log({ leastDuration });

    const startTZ = convertToTimeZone(start, TimeZoneCities[timezone]);
    const endTZ = convertToTimeZone(end, TimeZoneCities[timezone]);

    // console.log({ start, startTZ });

    const bbcsDriveData = {
      // source: "BUSA", // Needs sources from BBCS
      source: location?.[0]?.becs_code, // Needs sources from BBCS // Location BECS Code todo
      isNewDrive: true,
      driveDate: drive.date,
      start: startTZ.format('HH:mm'),
      end: allowappointmentAtShiftEndTime
        ? endTZ.add(leastDuration, 'minutes').format('HH:mm')
        : endTZ.format('HH:mm'), // add least duration if allowappointment is true
      last: endTZ.subtract(leastDuration, 'minutes').format('HH:mm'), // For last shift might end after shift end time due to allowappointment at shift end time , subtract least Duration
      donors: 0,
      beds: numberOfSlots,
      donorsPerInterval: leastDuration,
      // group: 'CFDC',
      group: account?.becs_code,
      // group2: 0,
      // group3: 0,
      // group4: 0,
      // group5: 0,
      rep: '',
      startLunch: '',
      endLunch: '',
      driveID: tempDriveId,
      // comment1: '', // empty
      // comment2: '', // empty
      // comment3: '', // empty
      // comment4: '', // empty
      // comment5: '', // empty
      // comment6: '', // empty
      // comment7: '', // empty
      // comment8: '', // empty
      description: location?.[0]?.address1, //address line one
      addressLineOne: location?.[0]?.address1,
      addressLineTwo: location?.[0]?.address2,
      city: location?.[0]?.city,
      // state: 'CA', // Not working with location.state, must be two digit short state
      state: location?.[0]?.short_state, // Not working with location.state, must be two digit short state
      zipCode: location?.[0]?.zip_code,
      zipCodeExt: '', //optional
    };
    try {
      // console.log({ allowappointmentAtShiftEndTime });
      const isBBCSDriveCreated = await this.BBCSConnectorService.setDriveBBCS(
        bbcsDriveData,
        tenantConfig
      );
      console.log({ isBBCSDriveCreated });
      return { isBBCSDriveCreated, bbcsDriveData };
    } catch (err) {
      return { isBBCSDriveCreated: false, bbcsDriveData, exception: err };
    }
  }

  async syncDriveSlots(
    drive: Drives,
    shifts: Shifts[],
    location,
    timezone,
    tenantConfig: TenantConfigurationDetail,
    driveId
  ) {
    const startTimes = [];
    const shiftIds = [];
    shifts?.map((sItem) => {
      shiftIds.push(sItem.id);
      sItem.slots?.map((item) => {
        startTimes.push({
          startTime: convertToTimeZone(
            item.start_time,
            TimeZoneCities[timezone]
          ).format('HH:mm'),
          reasonCategory: 'WBA',
          slotID: 'ID1',
        });
      });
    });

    const slotsParams = {
      startTimes,
      drive: driveId,
      // source: 'BUSA', // Needs sources from BBCS
      source: location?.becs_code, // Needs sources from BBCS
      date: drive.date,
      user: 'D37',
    };
    console.log({ slotsParams });
    try {
      const generatedSlots = await this.BBCSConnectorService.setSlotsBBCS(
        slotsParams,
        tenantConfig
      );
      console.log({ generatedSlots });
      return {
        isGenerated: generatedSlots == startTimes.length,
        slotsParams,
        exception: '',
        shiftIds,
      };
    } catch (err) {
      return { isGenerated: false, slotsParams, exception: err };
    }
  }

  async syncSessionSlots(
    shifts: Shifts[],
    timezone,
    tenantConfig: TenantConfigurationDetail,
    date,
    source
  ) {
    const startTimes = [];
    const shiftIds = [];
    shifts?.map((sItem) => {
      shiftIds.push(sItem.id);
      sItem.slots?.map((item) => {
        startTimes.push({
          startTime: convertToTimeZone(
            item.start_time,
            TimeZoneCities[timezone]
          ).format('HH:mm'),
          reasonCategory: 'WBA',
          slotID: 'ID1',
        });
      });
    });

    const slotsParams = {
      startTimes,
      drive: 0,
      // source: 'AMES' /* todo : Source*/, // Needs sources from BBCS
      source, // Needs sources from BBCS Donor Center BBCS Code
      date: moment(date).format('YYYY-MM-DD'),
      // date: '2022-12-17',
      user: 'D37',
    };
    console.log({ slotsParams });
    try {
      const generatedSlots = await this.BBCSConnectorService.setSlotsBBCS(
        slotsParams,
        tenantConfig
      );
      console.log({ generatedSlots });
      return {
        isGenerated: generatedSlots == startTimes.length,
        slotsParams,
        exception: '',
        shiftIds,
      };
    } catch (err) {
      return { isGenerated: false, slotsParams, exception: err };
    }
  }

  async generateCronExpression(interval: string, scheduleTime: Moment) {
    const hour = scheduleTime.hour();
    const minute = scheduleTime.minute();

    switch (interval.toLowerCase()) {
      case 'yearly':
        return `${minute} ${hour} ${scheduleTime.date()} ${
          scheduleTime.month() + 1
        } 1`;
      case 'monthly':
        return `${minute} ${hour} ${scheduleTime.date()} * 1`;
      case 'weekly':
        const dayOfWeek = scheduleTime.format('ddd').toUpperCase();
        return `${minute} ${hour} 1 * ${dayOfWeek}`;
      case 'daily':
        return `${minute} ${hour} * * *`;
      case 'hourly':
        return `${minute} * * * *`;
      default:
        return null;
    }
  }

  async getLastRunDonorSync(type, tenant_id) {
    const lastRun = await this.BBCSDataSyncsRepository.find({
      where: {
        data_sync_operation_type: type,
        tenant_id,
        is_archived: false,
      },
      order: { id: 'DESC' },
      take: 1,
    });
    return lastRun?.[0];
  }

  async generateBatchOperation(
    nextDate: string,
    nextStart: string,
    successInserts: number,
    successUpdates: number,
    total_count: number,
    tenant_id: bigint,
    user: User,
    execution_status: ExecutionStatusEnum,
    data_sync_operation_type: DataSyncOperationTypeEnum,
    sync_direction: DataSyncDirectioneEnum,
    exception = ''
  ) {
    const cron_details = new DataSyncBatchOperations();
    cron_details.job_start = new Date();
    cron_details.end_date = null; // dup
    cron_details.job_end = null; // dup
    cron_details.next_start = nextStart;
    cron_details.inserted_count = successInserts;
    cron_details.updated_count = successUpdates;
    cron_details.total_count = total_count;
    cron_details.tenant_id = tenant_id;
    cron_details.created_by = user;
    cron_details.execution_status = execution_status;
    cron_details.data_sync_operation_type = data_sync_operation_type;
    cron_details.sync_direction = sync_direction;
    cron_details.exception = exception;
    cron_details.is_failed = false;
    cron_details.start_date = new Date(nextDate);
    cron_details.updated_date = null;
    cron_details.attempt = 0;
    const cronDetails = await this.entityManager.save(cron_details);
    return cronDetails;
  }

  async syncDonorsCron(queryParams: any, tenant_id) {
    const cronType = DataSyncOperationTypeEnum.Donor;
    console.log('syncDonorsCron');
    const procedure_types = {};
    (
      await this.procedure_type.findBy({
        becs_product_category: Not(IsNull()),
        tenant_id,
        is_active: true,
        is_archive: false,
      })
    ).forEach((proc) => {
      if (!proc.becs_product_category) return;
      procedure_types[proc.becs_product_category] = proc.id;
    });

    const tenantConfig = await getTenantConfig(
      this.tenantConfigRepository,
      tenant_id
    );
    if (!tenantConfig) return;

    const user = await this.userRepository.findOne({
      where: {
        role: {
          is_auto_created: true,
          tenant_id,
        },
      },
      relations: ['role'],
    });

    let lastRun = await this.getLastRunDonorSync(cronType, tenant_id);
    try {
      const limit = 350;
      let nextDate =
        lastRun && lastRun?.updated_date
          ? lastRun?.updated_date?.toISOString()
          : '1900-01-01T00:00:00Z';
      let nextStart = lastRun ? lastRun?.next_start : '';
      let isNext = true;
      let donorsInfo = [];
      if (lastRun?.execution_status == ExecutionStatusEnum.Stopped) {
        await this.BBCSDataSyncsRepository.update(
          { id: lastRun?.id },
          {
            execution_status: ExecutionStatusEnum.Running,
          }
        );
      }
      console.log('Start the Job');
      // console.log({ lastRun });
      // console.log({ isNext, execution_status });
      while (isNext) {
        lastRun = await this.getLastRunDonorSync(cronType, tenant_id);
        console.log({ lastRun });
        if (lastRun?.execution_status == ExecutionStatusEnum.Stopped) {
          break;
        } else if (
          !lastRun ||
          lastRun.execution_status == ExecutionStatusEnum.Completed ||
          lastRun.execution_status == ExecutionStatusEnum.NotStarted
        ) {
          console.log('Generate New Batch');
          lastRun = await this.generateBatchOperation(
            nextDate,
            '',
            0,
            0,
            0,
            tenant_id,
            user,
            ExecutionStatusEnum.Running,
            DataSyncOperationTypeEnum.Donor,
            DataSyncDirectioneEnum.BBCS_TO_D37,
            ''
          );
        } else {
          lastRun.execution_status = ExecutionStatusEnum.Running;
          await this.entityManager.save(lastRun);
        }

        const data = await this.BBCSConnectorService.fetchDonorsData(
          limit,
          nextStart,
          nextDate || '',
          tenantConfig
        );

        isNext = data?.isNext;
        donorsInfo = data?.data;
        nextDate = data?.nextDate || '';
        nextStart = data?.nextStart;

        const {
          successInserts,
          successUpdates,
          failures,
          donorUUIDs,
          donorIds,
        } = await this.processBatch(donorsInfo, tenant_id, user);

        await this.processBatchEligibilities(
          donorUUIDs,
          tenantConfig,
          donorIds,
          procedure_types,
          tenant_id,
          user
        );

        lastRun = await this.getLastRunDonorSync(cronType, tenant_id);
        if (lastRun?.execution_status !== ExecutionStatusEnum.Stopped)
          lastRun.execution_status = ExecutionStatusEnum.Completed;
        lastRun.next_start = nextStart;
        lastRun.inserted_count = successInserts;
        lastRun.updated_count = successUpdates;
        lastRun.total_count = donorsInfo.length;
        if (failures > 0) {
          lastRun.is_failed = true;
          lastRun.attempt++;
        }
        lastRun.updated_date = new Date(nextDate);
        lastRun.end_date = new Date();
        lastRun.job_end = new Date();
        await this.entityManager.save(lastRun);
      }
    } catch (error) {
      lastRun.execution_status = ExecutionStatusEnum.Stopped;
      await this.entityManager.save(lastRun);
      console.log(`Exception occured: ${error}`);
    } finally {
      console.log('CRON Completed');
    }
  }

  async processBatch(donorsInfo, tenant_id, user) {
    let successInserts = 0;
    let successUpdates = 0;
    let failures = 0;
    const i = 1;
    const donorUUIDs = [];
    const donorIds = {};
    for (const donor of donorsInfo) {
      const { donorUUID, donorId, created, updated, failed } =
        await this.processBatchRecord(tenant_id, user, donor);
      if (created) successInserts++;
      if (updated) successUpdates++;
      if (failed) failures++;
      if (created || updated) {
        donorUUIDs.push(donorUUID);
        donorIds[donorUUID] = donorId;
      }
    }

    return {
      successInserts,
      successUpdates,
      failures,
      donorUUIDs,
      donorIds,
    };
  }

  async processBatchRecord(tenant_id, user, donor) {
    let donorId = null;
    try {
      console.log(donor?.UUID);
      const existingDonor = await this.donorsRepository.findOne({
        where: { external_id: donor?.UUID, is_archived: false },
      });
      const upsertDonor = existingDonor ?? new Donors();
      upsertDonor.external_id = donor?.UUID;
      upsertDonor.donor_number = donor?.donorNumber;
      upsertDonor.first_name =
        CapitalizeName(donor?.firstName) ?? donor?.firstName;
      upsertDonor.last_name =
        CapitalizeName(donor?.lastName) ?? donor?.lastName;
      upsertDonor.is_active = true;
      upsertDonor.is_archived = false;
      upsertDonor.birth_date = donor?.birthDate;
      upsertDonor.prefix_id = null;
      upsertDonor.is_synced = true;
      upsertDonor.tenant_id = tenant_id;
      upsertDonor.created_by = user;
      upsertDonor.middle_name =
        CapitalizeName(donor?.middleName) ?? donor?.middleName;
      upsertDonor.record_create_date = donor?.recordCreateDate;
      upsertDonor.last_update_date = donor?.lastUpdateDate;
      upsertDonor.next_recruit_date = donor?.nextRecruitDate;
      upsertDonor.greatest_deferral_date = donor?.greatestDeferralDate;
      upsertDonor.last_donation_date = donor?.lastDonationDate;
      upsertDonor.appointment_date = donor?.appointmentDate;
      upsertDonor.gender = donor?.gender;
      upsertDonor.geo_code = donor?.geoCode;
      upsertDonor.group_category = donor?.groupCategory;
      upsertDonor.misc_code = donor?.miscCode;
      upsertDonor.rec_result = donor?.recResult;
      upsertDonor.gallon_award1 = donor?.gallonAward1;
      upsertDonor.gallon_award2 = donor?.gallonAward2;

      let bloodGroup: any, becsRace: any, suffix: any;

      if (donor?.bloodType) {
        bloodGroup = await this.bloodGroupsRepository.findOne({
          where: {
            becs_name: donor.bloodType,
          },
        });
      }

      if (!bloodGroup) {
        bloodGroup = await this.bloodGroupsRepository.findOne({
          where: {
            becs_name: 'UNK',
          },
        });
      }

      upsertDonor.blood_group_id = bloodGroup ?? null;

      if (donor?.race) {
        becsRace = await this.becsRaceRepository.findOne({
          where: {
            becs_code: donor.race,
          },
        });
      }

      if (!becsRace) {
        becsRace = await this.becsRaceRepository.findOne({
          where: {
            becs_code: 'U',
          },
        });
      }
      upsertDonor.race_id = becsRace ?? null;

      if (donor?.suffixName) {
        suffix = await this.suffixesRepository.findOne({
          where: {
            abbreviation: donor.suffixName,
          },
        });
      }
      upsertDonor.suffix_id = suffix ?? null;
      const savedupsertDonor = await this.entityManager.save(upsertDonor);
      donorId = savedupsertDonor.id;
      // ------------ Address --------------- //
      const existingAddress = await this.addressRepository.findOne({
        where: {
          addressable_id: savedupsertDonor?.id,
          addressable_type: PolymorphicType.CRM_CONTACTS_DONORS,
        },
      });

      const address = existingAddress ?? new Address();
      address.addressable_type = PolymorphicType.CRM_CONTACTS_DONORS;
      address.addressable_id = savedupsertDonor.id;
      address.address1 =
        donor?.addressLine1 && donor?.addressLine1 != ''
          ? CapitalizeName(donor?.addressLine1)
          : '';
      address.address2 =
        donor?.addressLine2 && donor?.addressLine2 != ''
          ? CapitalizeName(donor?.addressLine2)
          : '';
      address.zip_code = donor?.zipCode;
      address.city =
        donor?.city && donor?.city != '' ? CapitalizeName(donor?.city) : '';
      address.state = donor?.state;
      address.short_state = donor?.state;
      address.country = '';
      address.county = '';
      address.latitude = 0;
      address.longitude = 0;
      address.tenant_id = tenant_id;
      address.created_by = user.id;

      await this.entityManager.save(address);

      // ------------ Contacts --------------- //
      if (existingDonor) {
        await this.contactsRepository.delete({
          contactable_id: savedupsertDonor.id,
          contactable_type: PolymorphicType.CRM_CONTACTS_DONORS,
        });
      }
      let primary_email = false,
        emailCanContact = false,
        phoneCanCall = false,
        phoneCanText = false;
      for (const email of donor?.emailContacts) {
        const emailContact = new Contacts();
        emailContact.contactable_id = savedupsertDonor.id;
        emailContact.contactable_type = PolymorphicType.CRM_CONTACTS_DONORS;
        if (email?.code == 'EMAL') {
          // EMAL - Personal Email
          emailCanContact = email?.canContact;
          emailContact.contact_type = ContactTypeEnum.PERSONAL_EMAIL;
        } else {
          emailContact.contact_type = ContactTypeEnum.OTHER_EMAIL;
        }
        emailContact.data = email.email;
        emailContact.is_primary = !primary_email;
        emailContact.tenant_id = tenant_id;
        emailContact.created_by = user;
        emailContact.is_archived = false;
        await this.entityManager.save(emailContact);
        primary_email = true;
      }

      if (donor?.phoneContacts?.length) {
        const primaryContact = await findPrimaryContact(donor?.phoneContacts);
        for (const phone of donor?.phoneContacts) {
          const phoneContact = new Contacts();
          phoneContact.contactable_id = savedupsertDonor.id;
          phoneContact.contactable_type = PolymorphicType.CRM_CONTACTS_DONORS;
          switch (phone.code) {
            case 'WPHN': // WPHN Work Phone - BBCS
              phoneContact.is_primary = primaryContact?.code == 'WPHN';
              phoneContact.contact_type = ContactTypeEnum.WORK_PHONE;
              break;
            case 'CELL': // CELL Mobile Phone - BBCS
              phoneContact.is_primary = primaryContact?.code == 'CELL';
              phoneContact.contact_type = ContactTypeEnum.MOBILE_PHONE;
              break;
            case 'HPHN': // MPHN Mobile Phone - BBCS
              phoneContact.is_primary = primaryContact?.code == 'HPHN';
              phoneContact.contact_type = ContactTypeEnum.MOBILE_PHONE;
              break;
            case 'MPHN': // MPHN Mobile Phone - BBCS
              phoneContact.is_primary = primaryContact?.code == 'MPHN';
              phoneContact.contact_type = ContactTypeEnum.MOBILE_PHONE;
              break;
            default: // HPHN Home Phone - BBCS
              phoneContact.is_primary = true;
              phoneContact.contact_type = ContactTypeEnum.OTHER_PHONE;
              break;
          }
          phoneContact.data = phone.phoneNumber
            ? phone.phoneNumber?.replace(/\D/g, '')
            : null;
          phoneContact.tenant_id = tenant_id;
          phoneContact.created_by = user;
          phoneContact.is_archived = false;
          await this.entityManager.save(phoneContact);

          if ((phoneContact.is_primary = true)) {
            phoneCanCall = phone.canCall;
            phoneCanText = phone.canText;
          }
        }
      }

      const existingContactPreference =
        await this.contactPreferencesRepository.findOne({
          where: {
            contact_preferenceable_id: savedupsertDonor.id,
            contact_preferenceable_type: PolymorphicType.CRM_CONTACTS_DONORS,
          },
        });

      const contactPreference =
        existingContactPreference ?? new ContactPreferences();
      contactPreference.contact_preferenceable_id = savedupsertDonor.id;
      contactPreference.contact_preferenceable_type =
        PolymorphicType.CRM_CONTACTS_DONORS;
      contactPreference.is_optout_email = !emailCanContact;
      contactPreference.is_optout_sms = !phoneCanText;
      contactPreference.is_optout_push = false;
      contactPreference.is_optout_call = !phoneCanCall;
      contactPreference.next_call_date = null;
      contactPreference.is_archived = false;
      contactPreference.tenant_id = tenant_id;
      contactPreference.created_by = user;
      await this.entityManager.save(contactPreference);

      return {
        donorUUID: donor.UUID,
        donorId: savedupsertDonor.id,
        created: !existingDonor,
        updated: existingDonor != null,
        failed: false,
      };
    } catch (error) {
      const exceptionData = new DataSyncRecordExceptions();
      exceptionData.tenant_id = tenant_id;
      exceptionData.created_by = user;
      exceptionData.datasyncable_id = donor.UUID;
      exceptionData.datasyncable_type = DataSyncOperationTypeEnum.Donor;
      exceptionData.sync_direction = DataSyncDirectioneEnum.BBCS_TO_D37;
      exceptionData.exception = error;
      exceptionData.attempt = 1;
      exceptionData.is_deleted = false;
      await this.entityManager.save(exceptionData);
      return {
        donorUUID: donor.UUID,
        donorId: donorId,
        created: false,
        updated: false,
        failed: true,
      };
    }
  }

  async processBatchEligibilities(
    donorUUIDs,
    tenantConfig,
    donorIds,
    procedure_types,
    tenant_id,
    user
  ) {
    const donorEligibility =
      await this.BBCSConnectorService.getDonorEligibility(
        donorUUIDs,
        moment(),
        tenantConfig
      );
    for (const keyEligibility in donorEligibility) {
      const procedureTypesList = donorEligibility[keyEligibility];
      for (const key in procedureTypesList) {
        const procedureType = procedureTypesList[key];

        const existingEligibility = await this.donorsEligibilities.findOne({
          where: {
            donor_id: donorIds[keyEligibility],
            donation_type: procedure_types[key],
            tenant_id: tenant_id,
            is_archived: false,
          },
        });
        await this.saveEligibility(
          existingEligibility,
          donorIds,
          keyEligibility,
          procedureType,
          key,
          procedure_types,
          tenant_id,
          user
        );
      }
    }
  }

  async saveEligibility(
    existingEligibility,
    donorIds,
    keyEligibility,
    procedureType,
    key,
    procedure_types,
    tenant_id,
    user
  ) {
    try {
      const donorEligibilityItem =
        existingEligibility || new DonorsEligibilities();
      donorEligibilityItem.donor_id = donorIds[keyEligibility];
      donorEligibilityItem.donation_type = procedure_types[key];
      donorEligibilityItem.donation_date = procedureType.lastDate;
      donorEligibilityItem.next_eligibility_date =
        procedureType.nextEligibleDate;
      donorEligibilityItem.donation_ytd = procedureType.donationYTD;
      donorEligibilityItem.donation_ltd = procedureType.donationLTD;
      donorEligibilityItem.donation_last_year = procedureType.donationLastYear;
      donorEligibilityItem.tenant_id = tenant_id; // - D37
      donorEligibilityItem.created_by = user; // - D37
      donorEligibilityItem.created_at = new Date();
      const saved = await this.entityManager.save(donorEligibilityItem);
      console.log(`Saved Eligibility ${saved.id}`);

      await this.entityManager.update(
        Donors,
        { id: donorIds[keyEligibility] },
        {
          last_update_date: new Date(),
        }
      );
    } catch (error) {
      console.log(`Error Setting Donor Eligibility`);
    }
  }

  async saveSessiononBBCS(
    start: Moment,
    end: Moment,
    date,
    description: string = '',
    source,
    timezone,
    tenantConfig
  ) {
    const startTZ = convertToTimeZone(start, TimeZoneCities[timezone]);
    const endTZ = convertToTimeZone(end, TimeZoneCities[timezone]);

    const bbcsSessionData = {
      startDate: moment(date).format('YYYY-MM-DD'),
      start: startTZ.format('HH:mm'),
      end: endTZ.format('HH:mm'),
      description,
      source, // todo: becs code facility
      // source: 'AMES',
    };
    try {
      const isBBCSSessionCreated =
        await this.BBCSConnectorService.setSessionBBCS(
          bbcsSessionData,
          tenantConfig
        );
      console.log({ isBBCSSessionCreated });
      return { isBBCSSessionCreated, bbcsSessionData };
    } catch (err) {
      return { isBBCSSessionCreated: false, bbcsSessionData, exception: err };
    }
  }

  async processDonationJobBatch(
    procedures,
    donationsInfo,
    donors,
    donorAccounts,
    queryRunner
  ) {
    let successInserts = 0;
    let failures = 0;

    for (const donor of donors) {
      const row = donationsInfo.filter(
        (donationHistory) => donationHistory.donorNumber === donor.donor_number
      )[0];

      const donorDonationAlreadyExists =
        await this.donorDonationRepository.findOneBy({
          bbcs_uuid: row.UUID,
        });

      if (donorDonationAlreadyExists) {
        continue;
      }

      const donorProcedure = procedures[row?.product];
      if (!donorProcedure) {
        // procedure is required
        continue;
      }

      const account = donorAccounts.filter(
        (account) => account.becs_code === row.group
      )[0];
      donor['account_id'] = account?.id;
      const newDonationHistory =
        await this.donorDonationService.mapBBCSDonationHistory(
          donor,
          row,
          donorProcedure
        );
      try {
        const savedDonor: any = await queryRunner.manager.save(
          newDonationHistory
        );
        if (savedDonor) {
          successInserts++;
        } else {
          failures++;
        }
      } catch (error) {
        const exceptionData = new DataSyncRecordExceptions();
        exceptionData.tenant_id = donor.tenant_id;
        exceptionData.created_by = newDonationHistory.created_by;
        exceptionData.datasyncable_id = newDonationHistory?.id.toString();
        exceptionData.datasyncable_type = DataSyncOperationTypeEnum.Donations;
        exceptionData.sync_direction = DataSyncDirectioneEnum.BBCS_TO_D37;
        exceptionData.exception = JSON.stringify({
          data: newDonationHistory,
          exception: error.toString(),
        });
        exceptionData.attempt = 1;
        exceptionData.is_deleted = false;
        await this.entityManager.save(exceptionData);
      }
    }

    return {
      successInserts,
      failures,
    };
  }

  async triggerDonorDonationHistoryAssertion(tenantId) {
    const cronType = DataSyncOperationTypeEnum.Donations;
    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    let lastRun = await this.getLastRunDonorSync(cronType, tenantId);

    try {
      const limit = 100;
      let nextStart = lastRun ? lastRun?.next_start : '';
      let isNext = true;
      let nextDate =
        lastRun && lastRun?.updated_date
          ? lastRun?.updated_date?.toISOString()
          : BBCSConstants.INITIAL_TIMESTAMP;

      console.log(
        'CRON: Donor Donation History Assertion - Job Started _______________________________',
        moment().format()
      );

      let donationsInfo = [];
      const procedures = {};
      (
        await this.procedureRepository.findBy({
          external_reference: Not(IsNull()),
          tenant_id: tenantId,
        })
      ).forEach((proc) => {
        if (!proc?.external_reference) return;
        procedures[proc?.external_reference] = proc;
      });

      const user = await this.userRepository.findOne({
        where: {
          role: {
            is_auto_created: true,
            tenant_id: tenantId,
          },
        },
        relations: ['role'],
      });

      if (lastRun?.execution_status == ExecutionStatusEnum.Stopped) {
        await this.BBCSDataSyncsRepository.update(
          { id: lastRun?.id },
          {
            execution_status: ExecutionStatusEnum.Running,
          }
        );
      }

      while (isNext) {
        lastRun = await this.getLastRunDonorSync(cronType, tenantId);
        console.log({ lastRun });
        if (lastRun?.execution_status == ExecutionStatusEnum.Stopped) {
          break;
        } else if (
          !lastRun ||
          lastRun.execution_status == ExecutionStatusEnum.Completed ||
          lastRun.execution_status == ExecutionStatusEnum.NotStarted
        ) {
          console.log('Generate New Batch');
          lastRun = await this.generateBatchOperation(
            nextDate,
            '',
            0,
            0,
            0,
            tenantId,
            user,
            ExecutionStatusEnum.Running,
            cronType,
            DataSyncDirectioneEnum.BBCS_TO_D37,
            ''
          );
        } else {
          lastRun.execution_status = ExecutionStatusEnum.Running;
          await this.entityManager.save(lastRun);
        }

        const data = await this.BBCSConnectorService.fetchDonorsDonationsData(
          limit,
          nextStart,
          nextDate
        );

        isNext = data?.isNext;
        donationsInfo = data?.data;
        nextDate = data?.nextDate || '';
        nextStart = data?.nextStart;

        let donors: any = await this.donorsRepository.find({
          where: {
            donor_number: In(
              donationsInfo.map((donation) => donation.donorNumber)
            ),
            tenant_id: tenantId,
          },
          relations: ['created_by'],
        });

        const donorAccounts = await this.accountRepository.findBy({
          becs_code: In(
            donationsInfo
              .map((donation) => donation?.group)
              .filter((group) => group && group != '')
          ),
          tenant_id: tenantId,
        });

        const { successInserts, failures } = await this.processDonationJobBatch(
          procedures,
          donationsInfo,
          donors,
          donorAccounts,
          queryRunner
        );

        lastRun = await this.getLastRunDonorSync(cronType, tenantId);
        if (lastRun?.execution_status !== ExecutionStatusEnum.Stopped)
          lastRun.execution_status = ExecutionStatusEnum.Completed;
        lastRun.next_start = nextStart;
        lastRun.inserted_count = successInserts;
        // lastRun.updated_count = successUpdates;
        lastRun.total_count = donationsInfo.length;
        if (failures > 0) {
          lastRun.is_failed = true;
          lastRun.attempt++;
        }
        lastRun.updated_date = new Date(nextDate);
        lastRun.end_date = new Date();
        lastRun.job_end = new Date();
        await this.entityManager.save(lastRun);
        console.log(
          'CRON: Donor Donation History Assertion - Job Finished _______________________________',
          moment().format()
        );
      }
    } catch (error) {
      lastRun.execution_status = ExecutionStatusEnum.Stopped;
      await this.entityManager.save(lastRun);
      console.log(`Exception occured: ${error}`);
    } finally {
      console.log('CRON Completed');
    }
  }
}
