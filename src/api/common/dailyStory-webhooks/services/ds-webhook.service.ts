import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, MoreThan, Not, Repository } from 'typeorm';

import moment from 'moment';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { HistoryService } from 'src/api/common/services/history.service';
import { ContactPreferences } from 'src/api/crm/contacts/common/contact-preferences/entities/contact-preferences';
import { DonorsEligibilities } from 'src/api/crm/contacts/donor/entities/donor_eligibilities.entity';
import { Staff } from 'src/api/crm/contacts/staff/entities/staff.entity';
import { Communications } from 'src/api/crm/contacts/volunteer/communication/entities/communication.entity';
import { CRMVolunteer } from 'src/api/crm/contacts/volunteer/entities/crm-volunteer.entity';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { OrderByConstants } from 'src/api/system-configuration/constants/order-by.constants';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { ProcedureTypesService } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/services/procedure-types.service';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { UserRequest } from 'src/common/interface/request';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { communication_status_enum } from 'src/database/migrations/1698151791827-CreateCommunicationTable';
import {
  CommonFunction,
  isUUID,
} from '../../../crm/contacts/common/common-functions';
import { Contacts } from '../../../crm/contacts/common/entities/contacts.entity';
import { ExportService } from '../../../crm/contacts/common/exportData.service';
import { DonorCenterCodes } from '../../../crm/contacts/donor/entities/donor-center-codes.entity';
import { DonorGroupCodes } from '../../../crm/contacts/donor/entities/donor-group-codes.entity';
import { DonorsAssertionCodes } from '../../../crm/contacts/donor/entities/donors-assertion-codes.entity';
import { DonorsHistory } from '../../../crm/contacts/donor/entities/donors-history.entity';
import { Donors } from '../../../crm/contacts/donor/entities/donors.entity';
import {
  DonationDate,
  GetAllDonorsInterface,
} from '../../../crm/contacts/donor/interface/donors.interface';
import { DSDonorsViewList } from '../entities/ds-webhook-donors-view';
import { WebHookAlerts } from '../entities/ds-webhook.entity';

@Injectable()
export class DSWebhookService extends HistoryService<DonorsHistory> {
  private message = 'Donors';
  constructor(
    @InjectRepository(Donors)
    private entityRepository: Repository<Donors>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(CRMVolunteer)
    private crmVolunteerRepository: Repository<CRMVolunteer>,
    @InjectRepository(Contacts)
    private contactsRepository: Repository<Contacts>,
    @InjectRepository(ContactPreferences)
    private contactsPreferenceRepository: Repository<ContactPreferences>,
    @InjectRepository(DonorsHistory)
    private readonly entityHistoryRepository: Repository<DonorsHistory>,
    @InjectRepository(DonorCenterCodes)
    private readonly donorCenterCodesRepository: Repository<DonorCenterCodes>,
    @InjectRepository(DonorGroupCodes)
    private readonly donorGroupCodesRepository: Repository<DonorGroupCodes>,
    @InjectRepository(DonorsAssertionCodes)
    private readonly donorsAssertionCodesRepository: Repository<DonorsAssertionCodes>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DonorsEligibilities)
    private readonly donorsEligilibityRepository: Repository<DonorsEligibilities>,
    @InjectRepository(Communications)
    private readonly communicationRepository: Repository<Communications>,
    @InjectRepository(WebHookAlerts)
    private readonly webHookRepository: Repository<WebHookAlerts>,
    @InjectRepository(DSDonorsViewList)
    private readonly dsDonorsViewRepository: Repository<DSDonorsViewList>,

    private readonly procedureTypeService: ProcedureTypesService,
    private readonly commonFunction: CommonFunction,
    private readonly exportService: ExportService,
    private readonly entityManager: EntityManager
  ) {
    super(entityHistoryRepository);
  }
  /**
   * fetch single record
   * @param id
   * @returns {object}
   */
  async findSingleDonor(id: any, req: UserRequest, uuid?: any) {
    try {
      const query = Object.assign(
        {},
        {
          relations: [
            'created_by',
            'tenant',
            'prefix_id',
            'suffix_id',
            'blood_group_id',
            'race_id',
          ],
          where: {
            ...(id ? { id } : {}),
            ...(uuid ? { contact_uuid: uuid } : {}),
            is_archived: false,
            tenant: { id: req.user.tenant.id },
          },
        }
      );
      const entity = await this.commonFunction.entityExist(
        this.entityRepository,
        query,
        this.message
      );

      if (!entity) {
        return resError(
          'Donor Not found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const address: any = await this.addressRepository.findOne({
        where: {
          addressable_id: entity.id,
          addressable_type: PolymorphicType.CRM_CONTACTS_DONORS,
          tenant: { id: req.user.tenant.id },
        },
      });

      const contacts = await this.contactsRepository.find({
        where: {
          contactable_type: PolymorphicType.CRM_CONTACTS_DONORS,
          contactable_id: entity.id,
          is_archived: false,
          tenant: { id: req.user.tenant.id },
        },
      });

      entity['address'] = address ?? null;
      entity['contact'] = contacts ?? null;

      let modifiedData = {};

      if (id) {
        modifiedData = await getModifiedDataDetails(
          this.entityHistoryRepository,
          id,
          this.userRepository,
          req.user.tenant.id
        );
      }

      const eligibilities = await this.donorsEligilibityRepository.find({
        where: {
          donor_id: entity.id,
          tenant: { id: req.user.tenant.id },
        },
        relations: ['donation_type'],
      });

      const contactPreference = await this.contactsPreferenceRepository.findOne(
        {
          where: {
            id: entity.id,
            tenant: { id: req.user.tenant.id },
          },
        }
      );
      return {
        status: HttpStatus.OK,
        message: `${this.message} fetched successfully.`,
        data: {
          ...entity,
          ...modifiedData,
          eligibilities: eligibilities,
          ...contactPreference,
        },
      };
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  /**
   * get all filtered records
   * @param getAllInterface
   * @returns {objects}
   */
  async findAllDonors(getAllInterface: GetAllDonorsInterface, tenant?: any) {
    try {
      const {
        name,
        keyword,
        limit = parseInt(process.env.PAGE_SIZE),
        page = 1,
        sortBy = 'donor_id',
        sortOrder = OrderByConstants.DESC,
        fetchAll,
        donorSchedule,
        min_updated_at,
      } = getAllInterface;
      const lastDonation = getAllInterface?.last_donation;

      let last_donation_start: string | undefined;
      let last_donation_end: string | undefined;

      if (typeof lastDonation === 'string') {
        const parsedLastDonation = JSON.parse(
          lastDonation || '{}'
        ) as DonationDate;
        last_donation_start = parsedLastDonation.startDate;
        last_donation_end = parsedLastDonation.endDate;
      } else if (typeof lastDonation === 'object' && lastDonation !== null) {
        last_donation_start = lastDonation.startDate;
        last_donation_end = lastDonation.endDate;
      }

      let donorQuery = this.dsDonorsViewRepository
        .createQueryBuilder('donors')
        .select([
          'donor_id as donor_id',
          'donor_number as donor_number',
          'name as name',
          'first_name as first_name',
          'last_name as last_name',
          'geo_code as geo_code',
          'gender as gender',
          'appointment_date as appointment_date',
          'next_recruit_date as next_recruit_date',
          'address_city as address_city',
          'address_county AS address_county',
          'address_state as address_state',
          'address_country as address_country',
          'primary_phone as primary_phone',
          'address1 as address1',
          'address2 as address2',
          "concat(address1, ', ', address2) AS complete_address",
          'is_optout_email as is_optout_email',
          'is_optout_sms as is_optout_sms',
          'is_optout_push as is_optout_push',
          'is_optout_call as is_optout_call',
          'zip_code as zip_code',
          'primary_email as primary_email',
          'contact_uuid AS contact_uuid',
          'external_id as external_id',
          'blood_group as blood_group',
          'last_donation as last_donation',
          'tenant_id as tenant_id',
          'status as status',

          'donor_uuid as donor_uuid',
          'updated_at as updated_at',
          'birth_date as birth_date',
          'is_archived as is_archived',

          '"wholeBloodEligibilityDate" as "wholeBloodEligibilityDate"',
          '"wholeBloodLastDonatedDate" as "wholeBloodLastDonatedDate"',
          '"wholeBloodDonationsLifetime" as "wholeBloodDonationsLifetime"',
          '"wholeBloodDonationsYearTodate" as "wholeBloodDonationsYearTodate"',
          '"wholeBloodDonationsLastyear" as "wholeBloodDonationsLastyear"',
          '"wholeBloodDonationsNextEligibilityDate" as "wholeBloodDonationsNextEligibilityDate"',
          '"plateletEligibilityDate" as "plateletEligibilityDate"',
          '"plateletLastDonatedDate" as "plateletLastDonatedDate"',
          '"plateletDonationsLifetime" as "plateletDonationsLifetime"',
          '"plateletDonationsYearTodate" as "plateletDonationsYearTodate"',
          '"plateletDonationsLastyear" as "plateletDonationsLastyear"',
          '"plateletDonationsNextEligibilityDate" as "plateletDonationsNextEligibilityDate"',
          '"dredEligibilityDate" as "dredEligibilityDate"',
          '"dredLastDonatedDate" as "dredLastDonatedDate"',
          '"dredDonationsLifetime" as "dredDonationsLifetime"',
          '"dredDonationsYearTodate" as "dredDonationsYearTodate"',
          '"dredDonationsLastyear" as "dredDonationsLastyear"',
          '"dredDonationsNextEligibilityDate" as "dredDonationsNextEligibilityDate"',
          '"ccpEligibilityDate" as "ccpEligibilityDate"',
          '"ccpLastDonatedDate" as "ccpLastDonatedDate"',
          '"ccpDonationsLifetime" as "ccpDonationsLifetime"',
          '"ccpDonationsYearTodate" as "ccpDonationsYearTodate"',
          '"ccpDonationsLastyear" as "ccpDonationsLastyear"',
          '"ccpDonationsNextEligibilityDate" as "ccpDonationsNextEligibilityDate"',
        ])
        .where([
          {
            is_archived: false,
            tenant_id: tenant?.id,
            last_donation: MoreThan(moment().subtract(2, 'year').toDate()),
            wholeBloodDonationsNextEligibilityDate: Not(
              new Date('9999-09-09T00:00:00')
            ),
            plateletDonationsNextEligibilityDate: Not(
              new Date('9999-09-09T00:00:00')
            ),
          },
          {
            is_archived: false,
            tenant_id: tenant?.id,
            last_donation: MoreThan(moment().subtract(2, 'year').toDate()),
            wholeBloodDonationsNextEligibilityDate: IsNull(),
            plateletDonationsNextEligibilityDate: IsNull(),
          },
        ]);
      const query = await donorQuery.getQuery();
      console.log(tenant?.id, query);
      let exportData;
      const isFetchAll = fetchAll ? fetchAll.trim() === 'true' : false;
      if (isFetchAll) {
        exportData = await donorQuery.getRawMany();
      }
      if (name || keyword) {
        donorQuery = donorQuery.andWhere(`primary_email ILIKE :data`, {
          data: `%${name || keyword}%`,
        });
        donorQuery = donorQuery.orWhere(`external_id ILIKE :external_id`, {
          external_id: `%${name || keyword}%`,
        });
        donorQuery = donorQuery.orWhere(`primary_phone ILIKE :data`, {
          data: `%${name || keyword}%`,
        });
        donorQuery = donorQuery.orWhere(
          `concat(donors.first_name, ' ', donors.last_name) ILIKE :name`,
          {
            name: `%${name || keyword}%`,
          }
        );
      }

      if (last_donation_start && last_donation_end) {
        donorQuery = donorQuery.andWhere(
          'donation.newest_donation_date BETWEEN :start AND :end',
          {
            start: last_donation_start,
            end: last_donation_end,
          }
        );
      }
      if (getAllInterface?.city)
        donorQuery = donorQuery.andWhere(`address_city ILIKE :city`, {
          city: `%${getAllInterface.city}%`,
        });
      if (getAllInterface?.state)
        donorQuery = donorQuery.andWhere(`address_state ILIKE :state`, {
          state: `%${getAllInterface.state}%`,
        });

      if (sortBy && sortOrder)
        donorQuery = donorQuery.orderBy({
          [sortBy]: sortOrder === 'DESC' ? 'DESC' : 'ASC',
        });
      if (min_updated_at) {
        donorQuery = donorQuery.andWhere(`updated_at > :min_updated_at `, {
          min_updated_at,
        });
      }
      const count = await donorQuery.getCount();

      if (page && limit && !donorSchedule) {
        const { skip, take } = this.commonFunction.pagination(limit, page);
        donorQuery = donorQuery.limit(take).offset(skip);
      }

      const records = await donorQuery.getRawMany();
      console.log(records);

      return {
        status: HttpStatus.OK,
        message: `${this.message} fetched successfully.`,
        count,
        data: records,
        // url,
      };
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async emailStatusBounced(emailBouncedStatus: any, apiData: any, req: any) {
    const { messageid, is_spam_complaint, ...rest } = emailBouncedStatus;
    const webhookErrorsAlert = new WebHookAlerts();
    webhookErrorsAlert.api = apiData?.url;
    webhookErrorsAlert.webhookType = apiData?.type;
    webhookErrorsAlert.payload = emailBouncedStatus;
    webhookErrorsAlert.tenant_id = req.tenant?.id;

    if (is_spam_complaint) {
      webhookErrorsAlert.reason = 'Its a spam complaint';
      webhookErrorsAlert.success = false;
      await this.saveAlerts(webhookErrorsAlert);

      return resSuccess('Its a spam complaint', 'success', HttpStatus.OK, {});
    }
    const communication = await this.communicationRepository.findOne({
      where: {
        dailystory_message_id: messageid,
        tenant_id: req?.tenant?.id,
      },
    });

    if (!communication) {
      webhookErrorsAlert.reason = 'Communication not found';
      webhookErrorsAlert.success = false;
      await this.saveAlerts(webhookErrorsAlert);

      return resError('Communication not found', ErrorConstants.Error, 404);
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const updatedCommunication = {
        status: communication_status_enum.BOUNCED,
      };

      await this.communicationRepository.update(
        { dailystory_message_id: messageid, tenant_id: req?.tenant?.id },
        updatedCommunication
      );
      await queryRunner.commitTransaction();
      webhookErrorsAlert.reason = 'Processed';
      webhookErrorsAlert.success = true;
      await this.saveAlerts(webhookErrorsAlert);

      return resSuccess(
        'Communication Updated Successfully',
        'success',
        HttpStatus.OK,
        {}
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      webhookErrorsAlert.reason = error.message;
      webhookErrorsAlert.success = false;
      await this.saveAlerts(webhookErrorsAlert);
      return resError(
        'Internel Server Error',
        ErrorConstants.Error,
        error.status
      );
    } finally {
      await queryRunner.release();
    }
  }

  async emailStatusClickedOpened(
    emailClickedOpened: any,
    apiData: any,
    req: any
  ) {
    const { emailid, dsid, ...rest } = emailClickedOpened;
    const webhookErrorsAlert = new WebHookAlerts();
    webhookErrorsAlert.api = apiData?.url;
    webhookErrorsAlert.webhookType = apiData?.type;
    webhookErrorsAlert.payload = emailClickedOpened;
    webhookErrorsAlert.tenant_id = req.tenant?.id;

    const communication = await this.communicationRepository.findOne({
      where: {
        dailystory_message_id: emailid,
        tenant_id: req?.tenant?.id,
      },
    });

    if (!communication) {
      webhookErrorsAlert.reason = 'Communication not found';
      webhookErrorsAlert.success = false;
      await this.saveAlerts(webhookErrorsAlert);
      return resError('Communication not found', ErrorConstants.Error, 404);
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const updatedCommunication = {
        status: communication_status_enum.DELIVERED,
      };

      await this.communicationRepository.update(
        { dailystory_message_id: emailid, tenant_id: req?.tenant?.id },
        updatedCommunication
      );
      await queryRunner.commitTransaction();
      webhookErrorsAlert.reason = 'Processed';
      webhookErrorsAlert.success = true;
      await this.saveAlerts(webhookErrorsAlert);
      return resSuccess(
        'Communication Updated Successfully',
        'success',
        HttpStatus.OK,
        {}
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      webhookErrorsAlert.reason = error.message;
      webhookErrorsAlert.success = false;
      await this.saveAlerts(webhookErrorsAlert);
      return resError(
        'Internel Server Error',
        ErrorConstants.Error,
        error.status
      );
    } finally {
      await queryRunner.release();
    }
  }

  async optInSms(optInSmsStatus: any, apiData: any, req: any) {
    const { dsid, ...rest } = optInSmsStatus;
    const webhookErrorsAlert = new WebHookAlerts();
    webhookErrorsAlert.api = apiData?.url;
    webhookErrorsAlert.webhookType = apiData?.type;
    webhookErrorsAlert.payload = optInSmsStatus;
    webhookErrorsAlert.tenant_id = req?.tenant?.id;
    let contact;
    contact = await this.crmVolunteerRepository.findOne({
      where: {
        dsid: dsid,
        is_archived: false,
        tenant_id: req?.tenant?.id,
      },
    });
    if (!contact) {
      contact = await this.staffRepository.findOne({
        where: {
          dsid: dsid,
          is_archived: false,
          tenant_id: req?.tenant?.id,
        },
      });
    }
    if (!contact) {
      contact = await this.entityRepository.findOne({
        where: {
          dsid: dsid,
          is_archived: false,
          tenant_id: req?.tenant?.id,
        },
      });
    }

    if (!contact) {
      webhookErrorsAlert.reason = 'Contact not found';
      webhookErrorsAlert.success = false;
      await this.saveAlerts(webhookErrorsAlert);
      return resError('Contact not found', ErrorConstants.Error, 404);
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const updatedCommunication = {
        is_optout_sms: false,
      };

      await this.contactsPreferenceRepository.update(
        { contact_preferenceable_id: contact.id, tenant_id: req?.tenant?.id },
        updatedCommunication
      );
      await queryRunner.commitTransaction();
      webhookErrorsAlert.reason = 'Processed';
      webhookErrorsAlert.success = true;
      await this.saveAlerts(webhookErrorsAlert);
      return resSuccess(
        'Contact Updated Successfully',
        'success',
        HttpStatus.OK,
        {}
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      webhookErrorsAlert.reason = error.message;
      webhookErrorsAlert.success = false;
      await this.saveAlerts(webhookErrorsAlert);
      return resError(
        'Internel Server Error',
        ErrorConstants.Error,
        error.status
      );
    } finally {
      await queryRunner.release();
    }
  }

  async optOutSms(optOutSmsStatus: any, apiData: any, req: any) {
    const { dsid, ...rest } = optOutSmsStatus;
    const webhookErrorsAlert = new WebHookAlerts();
    webhookErrorsAlert.api = apiData?.url;
    webhookErrorsAlert.webhookType = apiData?.type;
    webhookErrorsAlert.payload = optOutSmsStatus;
    webhookErrorsAlert.tenant_id = req?.tenant?.id;

    let contact;
    contact = await this.crmVolunteerRepository.findOne({
      where: {
        dsid: dsid,
        is_archived: false,
        tenant_id: req?.tenant?.id,
      },
    });
    if (!contact) {
      contact = await this.staffRepository.findOne({
        where: {
          dsid: dsid,
          is_archived: false,
          tenant_id: req?.tenant?.id,
        },
      });
    }
    if (!contact) {
      contact = await this.entityRepository.findOne({
        where: {
          dsid: dsid,
          is_archived: false,
          tenant_id: req?.tenant?.id,
        },
      });
    }

    if (!contact) {
      webhookErrorsAlert.reason = 'Contact not found';
      webhookErrorsAlert.success = false;
      await this.saveAlerts(webhookErrorsAlert);

      return resError('Contact not found', ErrorConstants.Error, 404);
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const updatedCommunication = {
        is_optout_sms: true,
      };

      await this.contactsPreferenceRepository.update(
        { contact_preferenceable_id: contact.id, tenant_id: req?.tenant?.id },
        updatedCommunication
      );
      await queryRunner.commitTransaction();
      webhookErrorsAlert.reason = 'Processed';
      webhookErrorsAlert.success = true;
      await this.saveAlerts(webhookErrorsAlert);
      return resSuccess(
        'Contact Updated Successfully',
        'success',
        HttpStatus.OK,
        {}
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      webhookErrorsAlert.reason = error.message;
      webhookErrorsAlert.success = false;
      await this.saveAlerts(webhookErrorsAlert);
      return resError(
        'Internel Server Error',
        ErrorConstants.Error,
        error.status
      );
    } finally {
      await queryRunner.release();
    }
  }

  async optInEmail(optInEmailStatus: any, apiData: any, req: any) {
    const { dsid, ...rest } = optInEmailStatus;
    const webhookErrorsAlert = new WebHookAlerts();
    webhookErrorsAlert.api = apiData?.url;
    webhookErrorsAlert.webhookType = apiData?.type;
    webhookErrorsAlert.payload = optInEmailStatus;
    webhookErrorsAlert.tenant_id = req?.tenant?.id;

    let contact;
    contact = await this.crmVolunteerRepository.findOne({
      where: {
        dsid: dsid,
        is_archived: false,
        tenant_id: req?.tenant?.id,
      },
    });
    if (!contact) {
      contact = await this.staffRepository.findOne({
        where: {
          dsid: dsid,
          is_archived: false,
          tenant_id: req?.tenant?.id,
        },
      });
    }
    if (!contact) {
      contact = await this.entityRepository.findOne({
        where: {
          dsid: dsid,
          is_archived: false,
          tenant_id: req?.tenant?.id,
        },
      });
    }

    if (!contact) {
      webhookErrorsAlert.reason = 'Contact not found';
      webhookErrorsAlert.success = false;
      await this.saveAlerts(webhookErrorsAlert);
      return resError('Contact not found', ErrorConstants.Error, 404);
    }
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const updatedCommunication = {
        is_optout_email: false,
      };

      await this.contactsPreferenceRepository.update(
        { contact_preferenceable_id: contact.id, tenant_id: req?.tenant?.id },
        updatedCommunication
      );
      await queryRunner.commitTransaction();
      webhookErrorsAlert.reason = 'Processed';
      webhookErrorsAlert.success = true;
      await this.saveAlerts(webhookErrorsAlert);
      return resSuccess(
        'Contact Updated Successfully',
        'success',
        HttpStatus.OK,
        {}
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      webhookErrorsAlert.reason = error.message;
      webhookErrorsAlert.success = false;
      await this.saveAlerts(webhookErrorsAlert);
      return resError(
        'Internel Server Error',
        ErrorConstants.Error,
        error.status
      );
    } finally {
      await queryRunner.release();
    }
  }

  async optOutEmail(optOutEmailStatus: any, apiData: any, req: any) {
    const { dsid, ...rest } = optOutEmailStatus;
    const webhookErrorsAlert = new WebHookAlerts();
    webhookErrorsAlert.api = apiData?.url;
    webhookErrorsAlert.webhookType = apiData?.type;
    webhookErrorsAlert.payload = optOutEmailStatus;
    webhookErrorsAlert.tenant_id = req?.tenant?.id;

    let contact;
    contact = await this.crmVolunteerRepository.findOne({
      where: {
        dsid: dsid,
        is_archived: false,
        tenant_id: req?.tenant?.id,
      },
    });
    if (!contact) {
      contact = await this.staffRepository.findOne({
        where: {
          dsid: dsid,
          is_archived: false,
          tenant_id: req?.tenant?.id,
        },
      });
    }
    if (!contact) {
      contact = await this.entityRepository.findOne({
        where: {
          dsid: dsid,
          is_archived: false,
          tenant_id: req?.tenant?.id,
        },
      });
    }

    if (!contact) {
      webhookErrorsAlert.reason = 'Contact not found';
      webhookErrorsAlert.success = false;
      await this.saveAlerts(webhookErrorsAlert);
      return resError('Contact not found', ErrorConstants.Error, 404);
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const updatedCommunication = {
        is_optout_email: true,
      };

      await this.contactsPreferenceRepository.update(
        { contact_preferenceable_id: contact.id, tenant_id: req?.tenant?.id },
        updatedCommunication
      );
      await queryRunner.commitTransaction();
      webhookErrorsAlert.reason = 'Processed';
      webhookErrorsAlert.success = true;
      await this.saveAlerts(webhookErrorsAlert);
      return resSuccess(
        'Contact Updated Successfully',
        'success',
        HttpStatus.OK,
        {}
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      webhookErrorsAlert.reason = error.message;
      webhookErrorsAlert.success = false;
      await this.saveAlerts(webhookErrorsAlert);
      return resError(
        'Internel Server Error',
        ErrorConstants.Error,
        error.status
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createWebHookLog(
    url,
    type,
    request_type,
    payload,
    tenant_id,
    reason,
    success
  ) {
    const webhookErrorsAlert = new WebHookAlerts();
    webhookErrorsAlert.api = url;
    webhookErrorsAlert.webhookType = type;
    webhookErrorsAlert.request_type = request_type;
    webhookErrorsAlert.payload = payload;
    webhookErrorsAlert.tenant_id = tenant_id;
    webhookErrorsAlert.reason = reason;
    webhookErrorsAlert.success = success;
    await this.saveAlerts(webhookErrorsAlert);
  }
  async newContact(newContactPayload: any, apiData: any, req: any) {
    // request Type other.
    const data = newContactPayload?.contact
      ? JSON.parse(newContactPayload.contact)
      : {};
    const { leadUID, dsId, ...rest } = data;
    await this.createWebHookLog(
      apiData?.url,
      apiData?.type,
      'Other',
      newContactPayload,
      req?.tenant?.id,
      'Webhook Called New Contact',
      true
    );
    const webhookErrorsAlert = new WebHookAlerts();
    webhookErrorsAlert.api = apiData?.url;
    webhookErrorsAlert.webhookType = apiData?.type;
    webhookErrorsAlert.payload = newContactPayload;
    webhookErrorsAlert.tenant_id = req?.tenant?.id;
    webhookErrorsAlert.request_type = 'General';
    if (!isUUID(leadUID)) {
      await this.createWebHookLog(
        apiData?.url,
        apiData?.type,
        'General',
        newContactPayload,
        req?.tenant?.id,
        'Not a valid syntax for contact_uuid',
        false
      );
      return resError(
        'Not a valid syntax for contact_uuid',
        ErrorConstants.Error,
        404
      );
    }

    let contact;
    contact = await this.crmVolunteerRepository.findOne({
      where: {
        contact_uuid: leadUID,
        is_archived: false,
        tenant_id: req?.tenant?.id,
      },
    });
    if (contact) {
      this.commonEntityUpdate(
        leadUID,
        dsId,
        this.crmVolunteerRepository,
        req,
        webhookErrorsAlert
      );
      await this.createWebHookLog(
        apiData?.url,
        apiData?.type,
        'General',
        newContactPayload,
        req?.tenant?.id,
        'Crm Volunteer updated.',
        true
      );
    }
    if (!contact) {
      contact = await this.staffRepository.findOne({
        where: {
          contact_uuid: leadUID,
          is_archived: false,
          tenant_id: req?.tenant?.id,
        },
      });
      this.commonEntityUpdate(
        leadUID,
        dsId,
        this.staffRepository,
        req,
        webhookErrorsAlert
      );
      await this.createWebHookLog(
        apiData?.url,
        apiData?.type,
        'General',
        newContactPayload,
        req?.tenant?.id,
        'Staff updated.',
        true
      );
    }
    if (!contact) {
      contact = await this.entityRepository.findOne({
        where: {
          contact_uuid: leadUID,
          is_archived: false,
          tenant_id: req?.tenant?.id,
        },
      });
      this.commonEntityUpdate(
        leadUID,
        dsId,
        this.entityRepository,
        req,
        webhookErrorsAlert
      );
      await this.createWebHookLog(
        apiData?.url,
        apiData?.type,
        'General',
        newContactPayload,
        req?.tenant?.id,
        'Donor updated.',
        true
      );
    }
    // request Type general for both cases.

    await this.saveAlerts(webhookErrorsAlert);
    if (!contact) {
      await this.createWebHookLog(
        apiData?.url,
        apiData?.type,
        'General',
        newContactPayload,
        req?.tenant?.id,
        'Contact not found',
        false
      );
      return resError('Contact not found', ErrorConstants.Error, 404);
    }
  }

  async commonEntityUpdate(
    leadUID: string,
    dsId: string,
    repository: any,
    req: any,
    webhookErrorsAlert
  ) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const updatedCommunication = {
        dsid: dsId,
      };

      await repository.update(
        {
          contact_uuid: leadUID,
          is_archived: false,
          tenant_id: req?.tenant?.id,
        },
        updatedCommunication
      );
      await queryRunner.commitTransaction();

      webhookErrorsAlert.reason = 'Processed';
      webhookErrorsAlert.success = true;
      await this.saveAlerts(webhookErrorsAlert);

      return resSuccess(
        'Contact Updated Successfully',
        'success',
        HttpStatus.OK,
        {}
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      webhookErrorsAlert.reason = error.message;
      webhookErrorsAlert.success = false;
      await this.saveAlerts(webhookErrorsAlert);
      return resError(
        'Internel Server Error',
        ErrorConstants.Error,
        error.status
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async saveAlerts(data) {
    await this.webHookRepository.save(data);
  }
}
