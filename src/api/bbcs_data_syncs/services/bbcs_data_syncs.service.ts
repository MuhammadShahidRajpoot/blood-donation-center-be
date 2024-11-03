import { InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, In, IsNull, Not, Repository } from 'typeorm';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import {
  resError,
  resSuccess,
} from '../../system-configuration/helpers/response';
import { ErrorConstants } from '../../system-configuration/constants/error.constants';
import { Donors } from 'src/api/crm/contacts/donor/entities/donors.entity';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { Contacts } from 'src/api/crm/contacts/common/entities/contacts.entity';
import { BBCSConnector } from 'src/connector/bbcsconnector';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { ContactTypeEnum } from 'src/api/crm/contacts/common/enums';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { ContactPreferences } from 'src/api/crm/contacts/common/contact-preferences/entities/contact-preferences';
import { DataSyncBatchOperations } from '../entities/data_sync_batch_operations.entity';
import { DonorsEligibilities } from 'src/api/crm/contacts/donor/entities/donor_eligibilities.entity';
import { Accounts } from 'src/api/crm/accounts/entities/accounts.entity';
import { IndustryCategories } from 'src/api/system-configuration/tenants-administration/crm-administration/account/industry-categories/entities/industry-categories.entity';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { getTenantConfig } from 'src/api/common/utils/tenantConfig';
import { TenantConfigurationDetail } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenantConfigurationDetail';
import { CapitalizeName } from 'src/api/utils/capitalizeName';
import { findPrimaryContact } from 'src/api/crm/contacts/donor/common/common-functions';
import { BloodGroups } from 'src/api/crm/contacts/donor/entities/blood-group.entity';
import { BecsRaces } from 'src/api/crm/contacts/donor/entities/becs-race.entity';
import { Suffixes } from 'src/api/crm/contacts/common/suffixes/entities/suffixes.entity';
import moment from 'moment';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { DataSyncOperationTypeEnum } from 'src/api/scheduler/enum/data_sync_operation_type.enum';
import { DataSyncDirectioneEnum } from 'src/api/scheduler/enum/data_sync_direction.enum';
import { ExecutionStatusEnum } from 'src/api/scheduler/enum/execution_status.enum';
import { DataSyncRecordExceptions } from '../entities/data_sync_record_exceptions.entity';

dotenv.config();

@Injectable()
export class BBCSDataSyncsService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
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
    private readonly BBCSConnectorService: BBCSConnector,
    private readonly entityManager: EntityManager
  ) {}

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

  async syncDonors(queryParams: any) {
    const tenant_id = this.request?.user?.tenant?.id;
    const user = this.request?.user;
    const cronType = DataSyncOperationTypeEnum.Donor;
    console.log('syncDonorsAPI');

    const procedure_types = {};
    (
      await this.procedure_type.findBy({
        becs_product_category: Not(IsNull()),
        tenant_id: this.request?.user?.tenant?.id,
        is_active: true,
        is_archive: false,
      })
    ).forEach((proc) => {
      if (!proc.becs_product_category) return;
      procedure_types[proc.becs_product_category] = proc.id;
    });

    console.log(procedure_types);

    const tenantConfig = await getTenantConfig(
      this.tenantConfigRepository,
      tenant_id
    );
    if (!tenantConfig) return;

    let lastRun = await this.getLastRunDonorSync(
      cronType,
      this.request?.user?.tenant?.id
    );

    try {
      const limit = 350;
      let nextDate = lastRun
        ? lastRun?.updated_date?.toISOString()
        : '1900-01-01T00:00:00Z';
      let nextStart = lastRun ? lastRun?.next_start : '';
      let isNext = true;
      let donorsInfo = [];
      console.log('Start the Job');

      if (lastRun?.execution_status == ExecutionStatusEnum.Stopped) {
        await this.BBCSDataSyncsRepository.update(
          { id: lastRun?.id },
          {
            execution_status: ExecutionStatusEnum.Running,
          }
        );
      }
      while (isNext) {
        lastRun = await this.getLastRunDonorSync(
          cronType,
          this.request?.user?.tenant?.id
        );
        console.log({ lastRun });
        if (lastRun?.execution_status == ExecutionStatusEnum.Stopped) {
          break;
        } else if (
          !lastRun ||
          lastRun?.execution_status == ExecutionStatusEnum.Completed ||
          lastRun?.execution_status == ExecutionStatusEnum.NotStarted
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
        lastRun = await this.getLastRunDonorSync(
          cronType,
          this.request?.user?.tenant?.id
        );
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
      console.log(error);
      lastRun.execution_status = ExecutionStatusEnum.Stopped;
      await this.entityManager.save(lastRun);
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      console.log('CRON Completed');
    }
  }

  async stopSyncDonors(cronType, tenant_id) {
    const lastRun = await this.getLastRunDonorSync(cronType, tenant_id);
    await this.BBCSDataSyncsRepository.update(
      { id: lastRun?.id },
      {
        execution_status: ExecutionStatusEnum.Stopped,
      }
    );
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

  async syncAccounts() {
    try {
      // tenant configs
      const tenantConfig = await getTenantConfig(
        this.tenantConfigRepository,
        this.request?.user?.tenant?.id
      );
      const data = await this.BBCSConnectorService.fetchAccountGroupCodesData(
        tenantConfig
      );
      const groups = data?.groups;

      const [industry_category, collectionOperation] = await Promise.all([
        this.industryCategoriesRepository.find({
          where: {
            tenant_id: this?.request?.user?.tenant?.id,
            is_archive: false,
          },
          order: { id: 'DESC' },
          take: 1,
        }),
        this.businessUnitsRepository.find({
          where: {
            tenant: { id: this?.request?.user?.tenant?.id },
            is_archived: false,
          },
          order: { id: 'DESC' },
          take: 1,
        }),
      ]);

      const recruiter = await this.userRepository.find({
        where: {
          tenant: { id: this?.request?.user?.tenant?.id },
          role: { is_recruiter: true },
          business_unit: { id: collectionOperation?.[0]?.id },
          is_archived: false,
        } as any,
        relations: ['tenant', 'role', 'business_unit'],
        order: { id: 'DESC' },
        take: 1,
      });

      for (const group of groups) {
        const existing = await this.accountRepository.find({
          where: {
            becs_code: group.code,
            is_active: true,
            is_archived: false,
            tenant: { id: this?.request?.user?.tenant?.id },
          } as any,
        });

        if (existing.length == 0) {
          const account = new Accounts();
          account.name = group.description;
          account.alternate_name = '';
          account.phone = '';
          account.website = '';
          account.facebook = '';
          account.industry_category = industry_category?.[0]?.id;
          account.industry_subcategory = null;
          account.stage = null;
          account.source = null;
          account.becs_code = group.code;
          account.collection_operation = collectionOperation?.[0];
          account.recruiter = recruiter?.[0];
          account.territory = null;
          account.population = 0;
          account.is_active = true;
          account.rsmo = false;
          account.tenant_id = this.request?.user?.tenant?.id;
          account.created_by = this.request?.user;
          await this.entityManager.save(account);
        }
      }
      return resSuccess(
        'Accounts Synced from BBCS.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        {}
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
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
            default: // HPHN Home Phone  - BBCS
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
        const donorEligibilityItem =
          existingEligibility || new DonorsEligibilities();
        donorEligibilityItem.donor_id = donorIds[keyEligibility];
        donorEligibilityItem.donation_type = procedure_types[key];
        donorEligibilityItem.donation_date = procedureType.lastDate;
        donorEligibilityItem.next_eligibility_date =
          procedureType.nextEligibleDate;
        donorEligibilityItem.donation_ytd = procedureType.donationYTD;
        donorEligibilityItem.donation_ltd = procedureType.donationLTD;
        donorEligibilityItem.donation_last_year =
          procedureType.donationLastYear;
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
      }
    }
  }
}
