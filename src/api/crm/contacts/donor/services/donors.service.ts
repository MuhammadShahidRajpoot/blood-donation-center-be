import { HttpStatus, Inject, Injectable, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  EntityManager,
  ILike,
  Between,
  Brackets,
  MoreThanOrEqual,
  Not,
  In,
  IsNull,
} from 'typeorm';
import { GetAllAccountsInterface } from 'src/api/crm/accounts/interface/accounts.interface';
import { CronTime, CronJob } from 'cron';
import { DonorsHistory } from '../entities/donors-history.entity';
import { OrderByConstants } from 'src/api/system-configuration/constants/order-by.constants';
import { HistoryService } from 'src/api/common/services/history.service';
import {
  CreateDonorsDto,
  FindDonorBBCSDto,
  UpdateDonorsDto,
} from '../dto/create-donors.dto';
import { Donors } from '../entities/donors.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import {
  GetAllDonorsAppointments,
  GetAllDonorsInterface,
  GetAppointmentCreateDetailsInterface,
  GetAppointmentsCreateListingInterface,
  GetStartTimeCreateDetailsInterface,
} from '../interface/donors.interface';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { DonationDate } from '../interface/donors.interface';
import { Contacts } from '../../common/entities/contacts.entity';
import { CommonFunction } from '../../common/common-functions';
import { AddressService } from '../../common/address.service';
import { ContactsService } from '../../common/contacts.service';
import { ContactTypeEnum } from '../../common/enums';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { ExportService } from '../../common/exportData.service';
import { saveCustomFields } from 'src/api/common/services/saveCustomFields.service';
import { CustomFields } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-field.entity';
import { DonorsAppointments } from '../entities/donors-appointments.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { ShiftsSlots } from 'src/api/shifts/entities/shifts-slots.entity';
import { Drives } from 'src/api/operations-center/operations/drives/entities/drives.entity';
import { Sessions } from 'src/api/operations-center/operations/sessions/entities/sessions.entity';
import moment from 'moment';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { DonorsAppointmentsHistory } from '../entities/donors-appointments-history.entity';
import { CreateDonorAppointmentDto } from '../dto/create-donors-appointment.dto';
import {
  cancelDonorAppointmentDto,
  updateDonorAppointmentDto,
} from '../dto/update-donors-appointment.dto';
import { BBCSConnector } from 'src/connector/bbcsconnector';
import { BBCSDonorType } from '../enum/bbcs-donor-type.enum';
import { enumKeyByValue } from 'src/common/utils/enum';
import { getTenantConfig } from 'src/api/common/utils/tenantConfig';
import { TenantConfigurationDetail } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenantConfigurationDetail';
import { trimPhone } from 'src/common/utils/phone';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { DonorDonations } from '../donorDonationHistory/entities/donor-donations.entity';
import { DonorCenterCodes } from '../entities/donor-center-codes.entity';
import { DonorGroupCodes } from '../entities/donor-group-codes.entity';
import { DonorsAssertionCodes } from '../entities/donors-assertion-codes.entity';
import { v4 as uuidv4 } from 'uuid';
import { CRMVolunteer } from '../../volunteer/entities/crm-volunteer.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { DonorsEligibilities } from '../entities/donor_eligibilities.entity';
import { BloodGroups } from '../entities/blood-group.entity';
import { BecsRaces } from '../entities/becs-race.entity';
import { ProcedureTypes } from 'src/api/system-configuration/tenants-administration/organizational-administration/products-procedures/procedure-types/entities/procedure-types.entity';
import { DonorsViewList } from '../entities/donors_list_view.entity';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import {
  createDSContact,
  getTenantData,
} from 'src/api/common/services/dailyStory.service';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { decryptSecretKey } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/utils/encryption';
@Injectable()
export class DonorsService extends HistoryService<DonorsHistory> {
  private message = 'Donors';
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Donors)
    private entityRepository: Repository<Donors>,
    @InjectRepository(CRMVolunteer)
    private volunteerRepository: Repository<CRMVolunteer>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Contacts)
    private contactsRepository: Repository<Contacts>,
    @InjectRepository(DonorsHistory)
    private readonly entityHistoryRepository: Repository<DonorsHistory>,
    @InjectRepository(DonorsViewList)
    private readonly viewDonorsRepository: Repository<DonorsViewList>,
    @InjectRepository(DonorDonations)
    private readonly donorDonationsRepository: Repository<DonorDonations>,
    @InjectRepository(DonorsEligibilities)
    private readonly donorsEligibilitiesRepository: Repository<DonorsEligibilities>,
    @InjectRepository(DonorsAppointments)
    private readonly entityDonorsAppointmentsRepository: Repository<DonorsAppointments>,
    @InjectRepository(DonorCenterCodes)
    private readonly donorCenterCodesRepository: Repository<DonorCenterCodes>,
    @InjectRepository(DonorGroupCodes)
    private readonly donorGroupCodesRepository: Repository<DonorGroupCodes>,
    @InjectRepository(DonorsAssertionCodes)
    private readonly donorsAssertionCodesRepository: Repository<DonorsAssertionCodes>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Shifts)
    private readonly shiftsRepository: Repository<Shifts>,
    @InjectRepository(ProcedureTypes)
    private readonly procedureTypeRepository: Repository<ProcedureTypes>,
    @InjectRepository(ShiftsSlots)
    private readonly shiftsSlotsRepository: Repository<ShiftsSlots>,

    @InjectRepository(Drives)
    private readonly drivesRepository: Repository<Drives>,

    @InjectRepository(Sessions)
    private readonly sessionsRepository: Repository<Sessions>,

    @InjectRepository(CustomFields)
    private readonly customFieldsRepository: Repository<CustomFields>,
    @InjectRepository(DonorsAppointmentsHistory)
    private readonly donorsAppointmentsHistoryRepository: Repository<DonorsAppointmentsHistory>,
    @InjectRepository(TenantConfigurationDetail)
    private readonly tenantConfigRepository: Repository<TenantConfigurationDetail>,
    @InjectRepository(BloodGroups)
    private readonly bloodGroupsRepository: Repository<BloodGroups>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(BecsRaces)
    private readonly becsRaceRepository: Repository<BecsRaces>,
    private readonly commonFunction: CommonFunction,
    private readonly entityManager: EntityManager,
    private readonly BBCSConnectorService: BBCSConnector,
    private readonly addressService: AddressService,
    private readonly contactsService: ContactsService,
    private readonly exportService: ExportService,
    private readonly bbcsConnector: BBCSConnector,
    private readonly schedulerRegistry: SchedulerRegistry
  ) {
    super(entityHistoryRepository);
  }

  /**
   * create new entity
   * @param createDto
   * @returns
   */
  async create(createdDto: CreateDonorsDto, user: User) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    let donor: Donors, bbcsDonor;
    let isSynced = true;
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await this.commonFunction.entityExist(
        this.userRepository,
        { where: { id: createdDto?.created_by } },
        'User'
      );
      const tenantConfig = await getTenantConfig(
        this.tenantConfigRepository,
        (user.tenant as any).id
      );
      const {
        address,
        contact,
        uuid: inputUUID,
        bbcs_type,
        donor_number,
        ...createDto
      } = createdDto;

      if (inputUUID)
        try {
          bbcsDonor = await this.BBCSConnectorService.findDonorByUUIDBBCS({
            externalId: inputUUID,
            config: tenantConfig,
          });
        } catch (e) {
          isSynced = false;
        }

      if (!inputUUID && !bbcs_type) isSynced = false;
      if (
        bbcs_type &&
        (bbcs_type === BBCSDonorType.EXACT ||
          bbcs_type === BBCSDonorType.MULTIEXACT ||
          bbcs_type === BBCSDonorType.LASTONLY) &&
        inputUUID
      ) {
        const donorContact = await queryRunner.manager.findOne(Contacts, {
          where: {
            data: contact.find(
              (c) => c.is_primary && [4, 5, 6].includes(c.contact_type)
            )?.data,
            contactable_type: PolymorphicType.CRM_CONTACTS_DONORS,
            contact_type: In([
              ContactTypeEnum.PERSONAL_EMAIL,
              ContactTypeEnum.WORK_EMAIL,
              ContactTypeEnum.OTHER_EMAIL,
            ]),
          },
        });

        if (donorContact) {
          donor = await queryRunner.manager.findOne(Donors, {
            where: {
              id: donorContact.contactable_id,
            },
          });
          const phoneContacts = contact.filter((c) =>
            [1, 2, 3].includes(c.contact_type)
          );
          await this.contactsService.updateContacts(
            donor.id,
            phoneContacts,
            PolymorphicType.CRM_CONTACTS_DONORS
          );
          address.addressable_id = donor.id;
          address.created_by = createdDto?.created_by;
          address.tenant_id = createdDto?.tenant_id;
          address.coordinates = `(${createdDto?.address?.latitude}, ${createdDto?.address?.longitude})`;
          address.short_state = createDto.state_bbcs;
          await this.addressService.updateAddress(address);
          await this.BBCSConnectorService.donorAddressUpdateBBCS(
            {
              city: address.city,
              addressLineOne: address.address1,
              zipCode: address.zip_code,
              uuid: inputUUID,
              addressLineTwo: address.address2,
              user: createDto.created_by,
            },
            tenantConfig
          );
          await this.BBCSConnectorService.donorCommunicationUpdateBBCS(
            {
              homePhone: contact.find(
                (c) => c.contact_type === ContactTypeEnum.OTHER_PHONE
              )?.data,
              uuid: inputUUID,
              email: contact.find(
                (c) => c.is_primary && [4, 5, 6].includes(c.contact_type)
              )?.data,
              user: createDto.created_by,
              workPhone: contact.find(
                (c) => c.contact_type === ContactTypeEnum.WORK_PHONE
              )?.data,
              cellPhone: contact.find(
                (c) => c.contact_type === ContactTypeEnum.MOBILE_PHONE
              )?.data,
            },
            'workPhone',
            tenantConfig
          );
          donor.is_synced = true;
          donor.donor_number = donor_number;
          donor.bbcs_donor_type = bbcs_type;
          donor.external_id = inputUUID;
          await queryRunner.manager.save(donor);
          await queryRunner.commitTransaction();
          return {
            status: HttpStatus.CREATED,
            message: `${this.message} Created Successfully`,
            data: donor,
          };
        }
      } else if (bbcsDonor) {
        createDto.first_name = bbcsDonor.firstName;
        createDto.last_name = bbcsDonor.lastName;
        createDto.birth_date = moment(
          bbcsDonor.birthDate,
          'yyyy-MM-DD'
        ).toDate();
        await this.BBCSConnectorService.donorCommunicationUpdateBBCS(
          {
            homePhone: contact.find(
              (c) => c.contact_type === ContactTypeEnum.OTHER_PHONE
            ).data,
            uuid: inputUUID,
            email: bbcsDonor.email,
            user: createDto.created_by,
            workPhone: contact
              .find((c) => c.contact_type === ContactTypeEnum.WORK_PHONE)
              .data?.replace(/[^\d]/g, ''),
            cellPhone: contact
              .find((c) => c.contact_type === ContactTypeEnum.MOBILE_PHONE)
              .data?.replace(/[^\d]/g, ''),
          },
          'workPhone',
          tenantConfig
        );
        isSynced = true;
      }

      const create = new Donors();

      const keys = Object.keys(createDto);

      //set values in create obj
      for (const key of keys) {
        if (key == 'blood_group_id') {
          let bloodGroup: any;
          if (createDto?.[key]) {
            bloodGroup = await this.bloodGroupsRepository.findOne({
              where: {
                id: createDto?.[key] as any,
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

          create[key] = bloodGroup ?? null;
        } else if (key == 'race_id') {
          let becsRace: any;
          if (createDto?.[key]) {
            becsRace = await this.becsRaceRepository.findOne({
              where: {
                id: createDto?.[key] as any,
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

          create[key] = becsRace ?? null;
        } else {
          create[key] = createDto?.[key];
        }
      }
      // Save entity
      const saveObj = await queryRunner.manager.save(create);
      const tenantData = await getTenantData(
        this.request?.user?.tenant_id,
        this.tenantRepository
      );
      const token = await decryptSecretKey(tenantData?.data?.dailystory_token);

      const dailyStoryContact = await createDSContact(
        contact[1]?.data,
        saveObj?.first_name,
        saveObj?.last_name,
        contact[0]?.data,
        saveObj?.id,
        'donor',
        token,
        saveObj?.contact_uuid
      );

      const dailyStoryContactId = dailyStoryContact?.Response?.id;

      saveObj.dsid = dailyStoryContactId;
      await queryRunner.manager.save(saveObj);

      saveObj.is_synced = isSynced;
      saveObj.donor_number = donor_number;
      if (bbcs_type) {
        saveObj.bbcs_donor_type = bbcs_type;
      }

      const donorCustomFieds = [];

      await saveCustomFields(
        this.customFieldsRepository,
        queryRunner,
        saveObj,
        user,
        user.tenant,
        createDto,
        donorCustomFieds
      );
      address.addressable_id = saveObj.id;
      address.created_by = createdDto?.created_by;
      address.tenant_id = createdDto?.tenant_id;
      address.coordinates = `(${createdDto?.address?.latitude}, ${createdDto?.address?.longitude})`;

      let uuid = inputUUID;
      if (bbcs_type === BBCSDonorType.NOMATCH) {
        try {
          uuid = await this.BBCSConnectorService.createDonorBBCS(
            {
              firstName: createdDto.first_name,
              lastName: createdDto.last_name,
              birthDate: moment(createdDto.birth_date).format('yyyy-MM-DD'),
              gender: '',
              addressLineOne: address.address1,
              addressLineTwo: address?.address2,
              city: address.city,
              state: createDto.state_bbcs,
              zipCode: address.zip_code,
              homePhone: contact
                .find((c) => c?.contact_type === 3)
                ?.data?.replace(/[^\d]/g, ''),
              workPhone: contact
                .find((c) => c?.contact_type === 1)
                ?.data?.replace(/[^\d]/g, ''),
              email: contact.find(
                (c) => c.is_primary && [4, 5, 6].includes(c.contact_type)
              ).data,
              cellPhone: contact
                .find((c) => c?.contact_type === 2)
                ?.data?.replace(/[^\d]/g, ''),
              user: user.id,
            },
            tenantConfig
          );

          bbcsDonor = await this.BBCSConnectorService.findDonorByUUIDBBCS({
            externalId: uuid,
            config: tenantConfig,
          });
          console.log({ bbcsDonor });
        } catch (e) {
          console.log(e);
        }
      }

      const updatedDonor = await queryRunner.manager
        .createQueryBuilder()
        .update(Donors)
        .set({
          external_id: uuid || null,
          bbcs_donor_type: bbcs_type || null,
          donor_number: bbcsDonor?.donorNumber || null,
        })
        .where('id = :donorId', { donorId: saveObj.id })
        .returning('*')
        .execute();

      await this.addressService.createAddress(address);
      await this.contactsService.createContacts(createdDto, saveObj.id);
      await queryRunner.commitTransaction();

      return {
        status: HttpStatus.CREATED,
        message: `${this.message} Created Successfully!!!!`,
        data: updatedDonor?.raw?.[0] || saveObj,
      };
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      console.log('releasing runner');
      await queryRunner.release();
    }
  }

  async findDonorBBCS(findDonorBBCSDto: FindDonorBBCSDto, user: any) {
    try {
      const config = await getTenantConfig(
        this.tenantConfigRepository,

        user.tenant.id
      );

      const BBCSFindDonor = await this.BBCSConnectorService.findDonorBBCS(
        {
          firstName: findDonorBBCSDto.first_name,
          lastNames: findDonorBBCSDto.last_name,
          birthDate: moment(findDonorBBCSDto.birth_date).format('yyyy-MM-DD'),
          email: findDonorBBCSDto.email,
          start: '0',
          limit: 10,
        },
        config
      );

      const insertTenantId = (obj: any, tenantId: any) => {
        if (obj && typeof obj === 'object') {
          obj['tenant_id'] = tenantId;

          if (Array.isArray(obj)) {
            obj.forEach((item) => {
              insertTenantId(item, tenantId);
            });
          } else {
            for (const key in obj) {
              if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'object' && obj[key] !== null) {
                  insertTenantId(obj[key], tenantId);
                }
                if (key === 'groups' && obj[key] == '') {
                  obj[key] = [];
                }
              }
            }

            obj['tenant_id'] = tenantId;
          }
        }
      };

      if (BBCSFindDonor && BBCSFindDonor?.data) {
        BBCSFindDonor?.data?.forEach((item: any) => {
          insertTenantId(item, user.tenant.id);

          if (item?.groups && Array.isArray(item.groups)) {
            item.groups = item.groups.map((group: string) => ({
              value: group,
              tenant_id: user?.tenant?.id,
            }));
          }
        });
      }

      const responseData = {
        limit: BBCSFindDonor?.limit,
        nextStart: BBCSFindDonor?.nextStart,
        isNext: BBCSFindDonor?.isNext,
        type: BBCSFindDonor?.type,
        count: BBCSFindDonor?.count,
        tenant_id: user?.tenant?.id,
        data: BBCSFindDonor?.data,
      };
      return { data: responseData };
    } catch (error) {
      console.log(error);

      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async updateToBBCS(
    donor: Donors,
    updatedDto: UpdateDonorsDto,
    external_id?: string
  ) {
    /**
     * The function `isUpdate` checks if there are any differences between the properties of two
     * objects.
     * @param {any} src - The `src` parameter is an object that represents the source data.
     * @param {any} dest - The `dest` parameter is the destination object that you want to compare with
     * the `src` object.
     * @param {string[]} [keys] - The `keys` parameter is an optional array of strings. It represents
     * the specific keys that should be checked for updates. If this parameter is provided, only the
     * keys in the `src` object that are present in the `keys` array will be considered for comparison.
     * @returns a boolean value.
     */
    const isUpdate = (src: any, dest: any, keys?: string[]): boolean => {
      if (!src) return false;
      else if (!dest) return true;

      let truthy = false;
      const srcKeys = keys && keys.length ? keys : Object.keys(src);
      srcKeys.forEach((key) => {
        if (src[key] !== dest[key]) {
          truthy = true;
          return;
        }
      });

      return truthy;
    };

    // tenant configs
    const tenantConfig = await getTenantConfig(
      this.tenantConfigRepository,
      donor.tenant.id
    );

    const address = updatedDto.address;
    if (
      isUpdate(
        address,
        await this.addressRepository.findOneBy({ id: address.id }),
        [
          'address1',
          'address2',
          'zip_code',
          'city',
          'state',
          'country',
          'latitude',
          'longitude',
        ]
      )
    ) {
      // update address of donor into BBCS
      console.log(
        `Donor ${donor.id} address "${JSON.stringify(
          address
        )}" needs to be updated in BBCS`
      );
      await this.bbcsConnector.modifyDonor(
        {
          addressLineOne: address.address1,
          addressLineTwo: address.address2,
          city: address.city,
          state: address.state,
          zipCode: address.zip_code,
          uuid: donor.external_id,
          user: 'D37',
        },
        tenantConfig
      );
    }

    const email = updatedDto.contact.find(
      (c) => c.contact_type >= 4 && c.contact_type <= 6 && c.is_primary === true
    );
    const donorBBCSData = await this.bbcsConnector.findDonorByUUIDBBCS({
      externalId: external_id,
      config: tenantConfig,
    });

    if (
      email &&
      (isUpdate(
        email,
        await this.contactsRepository.findOneBy({
          data: email.data,
          is_archived: false,
        }),
        ['data']
      ) ||
        email?.data !== donorBBCSData?.emailContacts?.[0]?.email)
    ) {
      // update email of donor into BBCS
      console.log(
        `Donor ${donor.id} email "${email.data}" needs to be updated in BBCS`
      );

      await this.bbcsConnector.modifyDonor(
        {
          email: email.data,
          uuid: donor.external_id,
          user: 'D37',
        },
        tenantConfig
      );
    }

    const phones = updatedDto.contact.filter(
      (c) => c.contact_type >= 1 && c.contact_type <= 3
    );

    const deletePhones = await this.contactsRepository.findBy({
      data: Not(In(phones.map((p) => p.data))),
      contactable_type: PolymorphicType.CRM_CONTACTS_DONORS,
      contactable_id: donor.id,
      contact_type: Between(1, 3),
      is_archived: false,
    });

    for (const phone of deletePhones) {
      // delete phone of donor into BBCS
      console.log(
        `Donor ${donor.id} ${enumKeyByValue(
          ContactTypeEnum,
          phone.contact_type
        )} "${phone.data}" needs to be deleted in BBCS`
      );

      await this.bbcsConnector.modifyDonor(
        {
          ...(phone.contact_type === 1 && { workPhone: '' }),
          ...(phone.contact_type === 2 && { cellPhone: '' }),
          ...(phone.contact_type === 3 && { homePhone: '' }),
          uuid: donor.external_id,
          user: 'D37',
        },
        tenantConfig
      );
    }

    for (const phone of phones) {
      const storedPhone = await this.contactsRepository.findOneBy({
        data: phone.data,
        contactable_type: PolymorphicType.CRM_CONTACTS_DONORS,
        contactable_id: donor.id,
        contact_type: phone.contact_type,
        is_archived: false,
      });
      if (phone?.id && storedPhone && phone?.data === storedPhone?.data) {
        continue;
      }

      // update phone of donor into BBCS
      console.log(
        `Donor ${donor.id} ${enumKeyByValue(
          ContactTypeEnum,
          phone.contact_type
        )} "${phone.data}" needs to be updated in BBCS`
      );

      await this.bbcsConnector.modifyDonor(
        {
          ...(phone.contact_type === 1 && { workPhone: trimPhone(phone.data) }),
          ...(phone.contact_type === 2 && { cellPhone: trimPhone(phone.data) }),
          ...(phone.contact_type === 3 && { homePhone: trimPhone(phone.data) }),
          uuid: donor.external_id,
          user: 'D37',
        },
        tenantConfig
      );
    }
  }

  /**
   * update record
   * insert data in history table
   * @param id
   * @param updateDto
   * @returns
   */
  async update(id: any, updatedDto: UpdateDonorsDto, myUser: User) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      delete updatedDto.blood_group_id;
      const { address, ...updateDto } = updatedDto;
      const user = await this.commonFunction.entityExist(
        this.userRepository,
        { where: { id: updatedDto?.created_by } },
        'User'
      );

      const entity = await this.commonFunction.entityExist(
        this.entityRepository,
        {
          relations: ['created_by', 'tenant'],
          where: { id },
        },
        this.message
      );

      // updating custom fields
      const donorsCustomFileds = [];
      await saveCustomFields(
        this.customFieldsRepository,
        queryRunner,
        entity,
        myUser,
        myUser.tenant,
        updatedDto,
        donorsCustomFileds
      );

      // store donor history
      // const saveHistory = new DonorsHistory();
      // Object.assign(saveHistory, entity);
      // saveHistory.history_reason = 'C';
      // saveHistory.created_by = user.id;
      // saveHistory.tenant_id = entity.tenant.id;
      // delete saveHistory?.created_at;
      // await this.createHistory(saveHistory);

      // update donor into BBCS
      if (entity?.external_id)
        await this.updateToBBCS(entity, updatedDto, entity?.external_id);

      // update donor details
      Object.assign(entity, updateDto);
      entity.created_at = new Date();
      entity.created_by = this.request?.user;
      const updatedData = await this.entityRepository.save(entity);

      // update address details

      const { tenant, ...createdByWithoutTenant } = this.request?.user;
      address.created_by = createdByWithoutTenant;
      address.created_at = new Date();
      // address.created_by = this.request?.user;
      address.tenant_id = updateDto?.tenant_id;
      address.coordinates = `(${updatedDto?.address?.latitude}, ${updatedDto?.address?.longitude})`;
      await this.addressService.updateAddress(address);

      // update contact details
      await this.contactsService.updateContacts(
        id,
        updatedDto,
        PolymorphicType.CRM_CONTACTS_DONORS
      );
      // commit all changes
      await queryRunner.commitTransaction();
      return {
        status: HttpStatus.CREATED,
        message: `${this.message} update successfully`,
        data: {},
      };
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   *
   * @param id
   * @returns
   */
  async archive(id: any, updatedBy: any) {
    try {
      const user = await this.commonFunction.entityExist(
        this.userRepository,
        { where: { id: updatedBy } },
        'User'
      );
      const query = {
        relations: ['created_by', 'tenant'],
        where: {
          id,
          is_archived: false,
        },
      };
      const entity = await this.commonFunction.entityExist(
        this.entityRepository,
        query,
        this.message
      );
      // const saveHistory = new DonorsHistory();
      // Object.assign(saveHistory, entity);
      // saveHistory.created_by = user.id;
      // saveHistory.tenant_id = entity.tenant.id;
      // saveHistory.history_reason = 'D';
      // delete saveHistory?.created_at;
      // await this.createHistory(saveHistory);
      entity['is_archived'] = !entity.is_archived;
      entity.created_at = new Date();
      // entity.created_by = this.request?.user;
      await this.entityRepository.save(entity);
      return {
        status: HttpStatus.NO_CONTENT,
        message: `${this.message} Archive Successfully`,
        data: null,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async addDonorAppointment(
    createDonorAppointmentDto: CreateDonorAppointmentDto,
    user: any
  ) {
    try {
      const userData = await this.userRepository.findOneBy({
        id: createDonorAppointmentDto?.created_by,
      });
      if (!userData) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const appointment = new DonorsAppointments();
      appointment.appointmentable_id =
        createDonorAppointmentDto?.appointmentable_id;
      appointment.appointmentable_type =
        createDonorAppointmentDto?.appointmentable_type;
      appointment.slot_id = createDonorAppointmentDto.slot_id;
      appointment.created_by = createDonorAppointmentDto.created_by;
      appointment.tenant_id = user?.tenant?.id;
      appointment.status = createDonorAppointmentDto?.status || '1';
      appointment.donor_id = createDonorAppointmentDto?.donor_id;
      appointment.note = createDonorAppointmentDto?.note;
      appointment.procedure_type_id =
        createDonorAppointmentDto?.procedure_type_id;
      const savedAppointment =
        await this.entityDonorsAppointmentsRepository.save(appointment);
      return resSuccess(
        'Donor Appointment Created.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedAppointment
      );
    } catch (error) {
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async updateDonorAppointment(
    userId: any,
    donorId: bigint,
    appointmentId: bigint,
    updateDonorAppointmentDto: updateDonorAppointmentDto
  ) {
    try {
      const existingAppointment =
        await this.entityDonorsAppointmentsRepository.findOneBy({
          donor_id: donorId,
          id: appointmentId,
        });
      if (!existingAppointment) {
        return resError(
          `Appointment not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      // const appointment = new DonorsAppointmentsHistory();
      // appointment.appointmentable_id = existingAppointment?.appointmentable_id;
      // appointment.appointmentable_type =
      //   existingAppointment?.appointmentable_type;
      // appointment.slot_id = existingAppointment.slot_id;
      // appointment.created_by = userId;
      // appointment.tenant_id = existingAppointment?.tenant_id;
      // appointment.status = existingAppointment?.status;
      // appointment.donor_id = existingAppointment?.donor_id;
      // appointment.id = existingAppointment?.id;
      // appointment.history_reason = 'C';
      // appointment.procedure_type_id = existingAppointment?.procedure_type_id;

      // await this.donorsAppointmentsHistoryRepository.save(appointment);
      const updatedDto = {
        ...updateDonorAppointmentDto,
        created_at: new Date(),
        created_by: this.request?.user,
      };
      const updatedAppointment: any =
        await this.entityDonorsAppointmentsRepository.update(
          { id: appointmentId },
          updatedDto
        );
      return resSuccess(
        'Donor Appointment Updated.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        { ...updatedAppointment, tenant_id: this.request.user?.tenant?.id }
      );
    } catch (error) {
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async cancelDonorAppointment(
    userId: any,
    donorId: bigint,
    appointmentId: bigint,
    cancelDonorAppointmentDto: cancelDonorAppointmentDto
  ) {
    try {
      const existingAppointment =
        await this.entityDonorsAppointmentsRepository.findOneBy({
          donor_id: donorId,
          id: appointmentId,
        });
      if (!existingAppointment) {
        return resError(
          `Appointment not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      // const appointment = new DonorsAppointmentsHistory();
      // appointment.appointmentable_id = existingAppointment?.appointmentable_id;
      // appointment.appointmentable_type =
      //   existingAppointment?.appointmentable_type;
      // appointment.slot_id = existingAppointment.slot_id;
      // appointment.created_by = userId;
      // appointment.tenant_id = existingAppointment?.tenant_id;
      // appointment.status = existingAppointment?.status;
      // appointment.donor_id = existingAppointment?.donor_id;
      // appointment.id = existingAppointment?.id;
      // appointment.history_reason = 'C';
      // appointment.procedure_type_id = existingAppointment?.procedure_type_id;

      // await this.donorsAppointmentsHistoryRepository.save(appointment);
      const updatedDto = {
        ...cancelDonorAppointmentDto,
        created_at: new Date(),
        created_by: this.request?.user,
      };

      const updatedAppointment =
        await this.entityDonorsAppointmentsRepository.update(
          { id: appointmentId },
          updatedDto
        );
      return resSuccess(
        'Donor Appointment Cancelled.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        updatedAppointment
      );
    } catch (error) {
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findBySlotAndProcedureType(data: any) {
    try {
      const res = await this.entityDonorsAppointmentsRepository.find({
        where: {
          slot_id: data?.slot_id,
          procedure_type_id: data?.procedure_type_id,
          is_archived: false,
        },
        relations: ['created_by', 'tenant'],
      });
      return {
        status: HttpStatus.OK,
        message: `${this.message} found successfully`,
        data: res,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  /**
   * fetch single record
   * @param id
   * @returns {object}
   */
  async findOne(id: any, req: any, uuid?: any) {
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
            tenant_id: this.request.user?.tenant?.id,
          },
        }
      );
      const entity: any = await this.commonFunction.entityExist(
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
        },
      });

      const contacts = await this.contactsRepository.find({
        where: {
          contactable_type: PolymorphicType.CRM_CONTACTS_DONORS,
          contactable_id: entity.id,
          is_archived: false,
        },
      });

      entity['address'] = address ?? null;
      entity['contact'] = contacts ?? null;

      const modifiedData = {};

      if (id) {
        if (entity) {
          const modifiedData: any = await getModifiedDataDetails(
            this.entityHistoryRepository,
            id,
            this.userRepository
          );
          const modified_at = modifiedData?.created_at;
          const modified_by = modifiedData?.created_by;
          entity.modified_by = entity.created_by;
          entity.modified_at = entity.created_at;
          entity.created_at = modified_at ? modified_at : entity.created_at;
          entity.created_by = modified_by ? modified_by : entity.created_by;
        }
      }

      return {
        status: HttpStatus.OK,
        message: `${this.message} fetched successfully.`,
        data: {
          ...entity,
          blood_group_id: {
            ...entity?.blood_group_id,
            tenant_id: this.request.user?.tenant?.id,
          },
          race_id: {
            ...entity?.race_id,
            tenant_id: this.request.user?.tenant?.id,
          },
        },
      };
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< Contact Donors findOne >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getEligibilities(id, req: UserRequest) {
    const eligibilitiesBBCS = [];
    try {
      const donor = await this.commonFunction.entityExist(
        this.entityRepository,
        {
          where: {
            id,
            is_archived: false,
            tenant_id: this.request.user?.tenant?.id,
          },
        },
        this.message
      );
      const procedure_types = {};
      (
        await this.procedureTypeRepository.findBy({
          becs_product_category: Not(IsNull()),
          tenant_id: req.user?.tenant?.id,
          is_active: true,
          is_archive: false,
        })
      ).forEach((proc) => {
        if (!proc.becs_product_category) return;
        procedure_types[proc.becs_product_category] = proc.name;
      });

      const tenantConfig = await getTenantConfig(
        this.tenantConfigRepository,
        req.user?.tenant?.id
      );
      const eligibilities = await this.BBCSConnectorService.getDonorEligibility(
        [`${donor.external_id}`],
        moment(),
        tenantConfig
      );
      if (eligibilities && Object.values(eligibilities))
        for (const keyEligibility in eligibilities) {
          const nestedObject = eligibilities[keyEligibility];
          for (const key in nestedObject) {
            const item = nestedObject[key];
            eligibilitiesBBCS.push({
              name: procedure_types[key],
              next_eligibility_date: item?.nextEligibleDate,
              tenant_id: this.request.user?.tenant?.id,
            });
          }
        }
      return {
        status: HttpStatus.OK,
        message: `${this.message} fetched successfully.`,
        data: {
          eligibilities: eligibilitiesBBCS,
          tenant_id: this.request.user?.tenant?.id,
        },
      };
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< No Eligibilities Found for Donor >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return eligibilitiesBBCS;
    }
  }

  /**
   * get all records
   * @param getAllInterface
   * @returns {objects}
   * @deprecated
   */
  async findAll(getAllInterface: GetAllDonorsInterface) {
    try {
      const {
        name,
        limit = parseInt(process.env.PAGE_SIZE),
        page = 1,
        sortBy = 'id',
        sortOrder = OrderByConstants.DESC,
      } = getAllInterface;
      const { skip, take } = this.commonFunction.pagination(limit, page);
      const order = { [sortBy]: sortOrder };

      const where = {
        is_archived: false,
      };

      Object.assign(where, {
        tenant: { id: getAllInterface['tenant_id'] },
      });

      if (name) {
        Object.assign(where, {
          first_name: ILike(`%${name}%`),
        });
      }

      const [data, count] = await this.entityRepository.findAndCount({
        relations: ['created_by', 'tenant', 'prefix_id', 'suffix_id'],
        where,
        skip,
        take,
        order,
      });
      const entities = [];
      for (const entity of data) {
        const data = await this.commonFunction.createObj(
          PolymorphicType.CRM_CONTACTS_DONORS,
          entity
        );
        entities.push({ ...data });
      }
      return {
        status: HttpStatus.OK,
        message: `${this.message} fetched successfully.`,
        count: count,
        data: entities,
      };
    } catch (error) {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * get all filtered records
   * @param getAllInterface
   * @returns {objects}
   */
  async findAllFiltered(getAllInterface: GetAllDonorsInterface) {
    try {
      const {
        name,
        limit = parseInt(process.env.PAGE_SIZE),
        page = 1,
        sortBy = 'donor.id',
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
      const donorIds = [];

      if (getAllInterface?.center_code) {
        const center_code: any = getAllInterface.center_code;
        const centerCodeItems = center_code.split(',');
        const centerCodeQb = this.donorCenterCodesRepository
          .createQueryBuilder('centerCode')
          .select('centerCode.donor_id', 'donor_id')
          .where('centerCode.center_code_id IN (:...centerCodeItems)', {
            centerCodeItems,
          });

        const result = await centerCodeQb.getRawMany();
        donorIds.push(...result.map((item) => item.donor_id));
      }

      if (getAllInterface?.group_code) {
        const group_code: any = getAllInterface.group_code;
        const groupCodeItems = group_code.split(',');
        const groupCodeQb = this.donorGroupCodesRepository
          .createQueryBuilder('groupCode')
          .select('groupCode.donor_id', 'donor_id')
          .where('groupCode.group_code_id IN (:...groupCodeItems)', {
            groupCodeItems,
          });

        const result = await groupCodeQb.getRawMany();
        donorIds.push(...result.map((item) => item.donor_id));
      }

      if (getAllInterface?.assertions) {
        const assertions_code: any = getAllInterface.assertions;
        const assertionsCodeItems = assertions_code.split(',');
        const assertionsCodeQb = this.donorsAssertionCodesRepository
          .createQueryBuilder('assertionsCode')
          .select('assertionsCode.donor_id', 'donor_id')
          .where(
            'assertionsCode.assertion_code_id IN (:...assertionsCodeItems)',
            {
              assertionsCodeItems,
            }
          );

        const result = await assertionsCodeQb.getRawMany();
        donorIds.push(...result.map((item) => item.donor_id));
      }
      let donorQuery = this.entityRepository
        .createQueryBuilder('donor')
        .addSelect('updated_at')
        .leftJoinAndSelect(
          'address',
          'address',
          `address.addressable_id = donor.id AND (address.addressable_type = '${PolymorphicType.CRM_CONTACTS_DONORS}')`
        )
        .leftJoinAndSelect(
          'contacts',
          'phone',
          `phone.contactable_id = donor.id AND (phone.is_primary = true AND phone.contactable_type = '${PolymorphicType.CRM_CONTACTS_DONORS}' AND phone.contact_type >= '${ContactTypeEnum.WORK_PHONE}' AND phone.contact_type <= '${ContactTypeEnum.OTHER_PHONE}')`
        )
        .leftJoinAndSelect(
          'contacts',
          'email',
          `email.contactable_id = donor.id AND (email.is_primary = true AND email.contactable_type = '${PolymorphicType.CRM_CONTACTS_DONORS}' AND email.contact_type >= '${ContactTypeEnum.WORK_EMAIL}' AND email.contact_type <= '${ContactTypeEnum.OTHER_EMAIL}')`
        )
        .leftJoinAndSelect(
          'blood_groups',
          'blood_groups',
          `blood_groups.id = donor.blood_group_id`
        )
        .leftJoinAndSelect(
          (subQuery) => {
            return subQuery
              .from(DonorDonations, 'donors_donations')
              .select([
                'donors_donations.donor_id',
                'MAX(donation_date) as newest_donation_date',
              ])
              .groupBy('donors_donations.donor_id');
          },
          'donation',
          'donor.id = donation.donor_id'
        )
        .where({
          is_archived: false,
          tenant: { id: getAllInterface['tenant_id'] },
        })
        .select([
          'donor.id AS donor_id',
          'donor.donor_number AS donor_number',
          "concat(donor.first_name, ' ', donor.last_name) AS name",
          'donor.first_name AS first_name',
          'donor.last_name AS last_name',
          'address.city AS address_city',
          'address.county AS address_county',
          'address.state AS address_state',
          'phone.data AS primary_phone',
          'address.address1 AS address1',
          'address.address2 AS address2',
          'address.zip_code AS zip_code',
          'email.data AS primary_email',
          'donor.contact_uuid AS contact_uuid',
          'external_id',
          'blood_groups.name AS blood_group',
          'donor.last_donation_date AS last_donation',
          'donor.tenant_id AS tenant_id',
          /**
           * TODO: we need to fetch it from other service in future.
           */
          // 'donation.newest_donation_date As last_donation',
        ]);

      let exportData;
      const isFetchAll = fetchAll ? fetchAll.trim() === 'true' : false;
      if (isFetchAll) {
        exportData = await donorQuery.getRawMany();
      }
      if (name) {
        donorQuery = donorQuery.andWhere(`email.data ILIKE :data`, {
          data: `%${name}%`,
        });
        donorQuery = donorQuery.orWhere(`external_id ILIKE :external_id`, {
          external_id: `%${name}%`,
        });
        donorQuery = donorQuery.andWhere('donor.tenant_id = :tenant_id', {
          tenant_id: getAllInterface['tenant_id'],
        });

        donorQuery = donorQuery.andWhere('donor.is_archived = :is_archived', {
          is_archived: false,
        });
        donorQuery = donorQuery.orWhere(`phone.data ILIKE :data`, {
          data: `%${name}%`,
        });
        donorQuery = donorQuery.andWhere('donor.tenant_id = :tenant_id', {
          tenant_id: getAllInterface['tenant_id'],
        });
        donorQuery = donorQuery.andWhere('donor.is_archived = :is_archived', {
          is_archived: false,
        });
        donorQuery = donorQuery.orWhere(
          `concat(donor.first_name, ' ', donor.last_name) ILIKE :name`,
          {
            name: `%${name}%`,
          }
        );
        donorQuery = donorQuery.andWhere('donor.tenant_id = :tenant_id', {
          tenant_id: getAllInterface['tenant_id'],
        });
        donorQuery = donorQuery.andWhere('donor.is_archived = :is_archived', {
          is_archived: false,
        });
      }
      // Check if assertions, group_code, and center_code exist
      if (
        getAllInterface?.assertions ||
        getAllInterface?.group_code ||
        getAllInterface?.center_code
      ) {
        donorQuery = donorQuery.andWhere(
          donorIds.length > 0 ? 'donor.id IN (:...donorIds)' : '1=0',
          {
            donorIds,
          }
        );
      }

      if (getAllInterface?.blood_group) {
        const donorBloodGroups = getAllInterface.blood_group
          .split(',')
          .map((type) => type.trim());
        donorQuery = donorQuery.andWhere(
          donorBloodGroups.length > 0
            ? 'donor.blood_group_id IN (:...donorBloodGroups)'
            : '1=0',
          {
            donorBloodGroups,
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
      if (getAllInterface?.city) {
        const cities = getAllInterface.city.split(',');
        donorQuery = donorQuery.andWhere(`address.city ILIKE ANY(:cities)`, {
          cities: cities.map((city) => `%${city.trim()}%`),
        });
      }
      if (getAllInterface?.state) {
        const states = getAllInterface.state.split(',');
        donorQuery = donorQuery.andWhere(`address.state ILIKE ANY(:states)`, {
          states: states.map((state) => `%${state.trim()}%`),
        });
      }
      if (getAllInterface?.county) {
        const counties = getAllInterface.county.split(',');
        donorQuery = donorQuery.andWhere(
          `address.county ILIKE ANY(:counties)`,
          {
            counties: counties.map((county) => `%${county.trim()}%`),
          }
        );
      }
      if (getAllInterface?.keyword) {
        const keywordCondition = `%${getAllInterface.keyword}%`;

        donorQuery = donorQuery.andWhere(
          new Brackets((qb) => {
            qb.where(`donor.external_id ILIKE :external_id`, {
              external_id: keywordCondition,
            })

              .orWhere(`email.data ILIKE :email`, { email: keywordCondition })
              .orWhere(
                "(donor.first_name || ' ' || donor.last_name) ILIKE :name",
                {
                  name: `%${keywordCondition}%`,
                }
              )
              .orWhere(
                `CAST(donor.donor_number AS VARCHAR) ILIKE :donor_number`,
                {
                  donor_number: `%${keywordCondition}%`,
                }
              );
          })
        );

        donorQuery = donorQuery.orWhere(`phone.data ILIKE :data`, {
          data: `%${getAllInterface?.keyword.replace(/%/g, ' ')}%`,
        });
      }

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
      if (!isFetchAll) {
        exportData = await donorQuery.getRawMany();
      }
      if (page && limit && !donorSchedule) {
        const { skip, take } = this.commonFunction.pagination(limit, page);
        donorQuery = donorQuery.limit(take).offset(skip);
      }

      let records = await donorQuery.getRawMany();

      if (donorSchedule) {
        records = await donorQuery.getRawMany();
      }
      let url;
      if (getAllInterface?.exportType && getAllInterface.downloadType) {
        const columnsToFilter = new Set(
          getAllInterface.tableHeaders.split(',')
        );
        const filteredData = exportData.map((obj) => {
          const newObj = {};
          columnsToFilter.forEach((key) => {
            const name =
              key === 'address_city'
                ? 'city'
                : key === 'address_state'
                ? 'state'
                : key === 'external_id'
                ? 'donor_id'
                : key;
            newObj[name] = obj[key];
          });

          return newObj;
        });
        const prefixName = getAllInterface?.selectedOptions
          ? getAllInterface?.selectedOptions.trim()
          : 'Donors';
        url = await this.exportService.exportDataToS3(
          filteredData,
          getAllInterface,
          prefixName,
          'Donors'
        );
      }
      return {
        status: HttpStatus.OK,
        message: `${this.message} fetched successfully.`,
        count,
        data: records,
        url,
      };
    } catch (error) {
      console.error(error);
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAllFilteredNew(getAllInterface: GetAllDonorsInterface) {
    try {
      const {
        name,
        limit = parseInt(process.env.PAGE_SIZE),
        page = 1,
        sortBy = 'last_name',
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

      let donorQuery = this.viewDonorsRepository
        .createQueryBuilder('donors_lists_view')
        .select([
          'donors_lists_view.donor_id AS donor_id',
          'donors_lists_view.donor_number AS donor_number',
          'donors_lists_view.name AS name',
          'donors_lists_view.first_name AS first_name',
          'donors_lists_view.last_name AS last_name',
          'donors_lists_view.address_city AS address_city',
          'donors_lists_view.address_state AS address_state',
          'donors_lists_view.address_county AS address_county',
          'donors_lists_view.primary_phone AS primary_phone',
          'donors_lists_view.address1 AS address1',
          'donors_lists_view.address2 AS address2',
          'donors_lists_view.zip_code AS zip_code',
          'donors_lists_view.primary_email AS primary_email',
          'donors_lists_view.donor_uuid AS contact_uuid',
          'donors_lists_view.donor_uuid AS external_id',
          'donors_lists_view.last_donation AS last_donation',
          'donors_lists_view.blood_group AS blood_group',
          'donors_lists_view.tenant_id AS tenant_id',
          'donors_lists_view.donor_updated_at AS updated_at',
          'COUNT(*) OVER() AS total_count',
          // 'donation.newest_donation_date As last_donation',
        ])
        .where({
          is_archived: false,
          tenant_id: getAllInterface['tenant_id'],
        })
        .distinct(true);

      /**
       * We need to get the export data as whole before applying any filters, that's why placing this before where conditions.
       */
      let exportData;
      let count;

      const isFetchAll = fetchAll ? fetchAll.trim() === 'true' : false;
      if (isFetchAll) {
        exportData = await donorQuery.getRawMany();
      }

      /**
       * Filter By : Name
       */
      if (name) {
        donorQuery = donorQuery.andWhere(
          `CONCAT(donors_lists_view.first_name, ' ', donors_lists_view.last_name) ILIKE :data`,
          {
            data: `%${name}%`,
          }
        );
      }

      /**
       * Filter By : assertions
       */
      if (getAllInterface?.assertions) {
        const assertionsArray = getAllInterface.assertions
          .split(',')
          .map(Number);

        donorQuery = donorQuery.andWhere(
          'donors_lists_view.assertion_code_id IN (:...assertions)',
          {
            assertions: assertionsArray,
          }
        );
      }

      /**
       * Filter By : group_code
       */
      if (getAllInterface?.group_code) {
        const groupCodeArray = getAllInterface.group_code
          .split(',')
          .map(Number);
        donorQuery = donorQuery.andWhere(
          'donors_lists_view.group_code_id IN (:...group_codes)',
          {
            group_codes: groupCodeArray,
          }
        );
      }

      /**
       * Filter By : center_code
       */
      if (getAllInterface?.center_code) {
        const centerCodeArray = getAllInterface.center_code
          .split(',')
          .map(Number);
        donorQuery = donorQuery.andWhere(
          'donors_lists_view.center_code_id IN (:...center_code)',
          {
            center_code: centerCodeArray,
          }
        );
      }

      /**
       * Filter By : blood_group
       */
      if (getAllInterface?.blood_group) {
        const donorBloodGroups = getAllInterface.blood_group
          .split(',')
          .map((type) => type.trim());
        donorQuery = donorQuery.andWhere(
          donorBloodGroups.length > 0
            ? 'donors_lists_view.blood_group IN (:...donorBloodGroups)'
            : '1=0',
          {
            donorBloodGroups,
          }
        );
      }
      /**
       * Filter By : blood_group
       */
      if (last_donation_start && last_donation_end) {
        donorQuery = donorQuery.andWhere(
          'donors_lists_view.last_donation BETWEEN :start AND :end',
          {
            start: last_donation_start,
            end: last_donation_end,
          }
        );
      }
      /**
       * Filter By : city
       */
      if (getAllInterface?.city) {
        const cities = getAllInterface.city.split(',');
        donorQuery = donorQuery.andWhere(
          `donors_lists_view.address_city ILIKE ANY(:cities)`,
          {
            cities: cities.map((city) => `%${city.trim()}%`),
          }
        );
      }

      /**
       * Filter By : county
       */
      if (getAllInterface?.county) {
        const counties = getAllInterface.county.split(',');
        donorQuery = donorQuery.andWhere(
          `donors_lists_view.address_county ILIKE ANY(:counties)`,
          {
            counties: counties.map((county) => `%${county.trim()}%`),
          }
        );
      }
      /**
       * Filter By : state
       */
      if (getAllInterface?.state) {
        const states = getAllInterface.state.split(',');
        donorQuery = donorQuery.andWhere(
          `donors_lists_view.address_state ILIKE ANY(:states)`,
          {
            states: states.map((state) => `%${state.trim()}%`),
          }
        );
      }
      /**
       * Filter By : keyword
       */
      if (getAllInterface?.keyword) {
        const keywordCondition = `%${getAllInterface.keyword}%`;
        donorQuery = donorQuery.andWhere(
          '(donors_lists_view.primary_email ILIKE :data OR donors_lists_view.name ILIKE :data OR CAST(donors_lists_view.donor_number AS TEXT) ILIKE :data OR donors_lists_view.primary_phone ILIKE :formattedData) AND donors_lists_view.is_archived = false AND donors_lists_view.tenant_id = :tenant_id',
          {
            data: `%${keywordCondition}%`,
            formattedData: `%${getAllInterface?.keyword.replace(/%/g, ' ')}%`,
            tenant_id: getAllInterface['tenant_id'],
          }
        );
      }

      if (sortBy && sortOrder) {
        donorQuery = donorQuery.orderBy({
          [sortBy]: sortOrder === 'DESC' ? 'DESC' : 'ASC',
        });
      }
      if (min_updated_at) {
        donorQuery = donorQuery.andWhere(
          `donors_lists_view.updated_at > :min_updated_at `,
          {
            min_updated_at,
          }
        );
      }

      // const count = await donorQuery.getCount();

      if (page && limit && !donorSchedule) {
        const { skip, take } = this.commonFunction.pagination(limit, page);
        donorQuery = donorQuery.limit(take).offset(skip);
      }
      if (!isFetchAll) {
        exportData = await donorQuery.getRawMany();
      }
      let url;
      if (getAllInterface?.exportType && getAllInterface.downloadType) {
        const columnsToFilter = new Set(
          getAllInterface.tableHeaders.split(',')
        );

        const filteredData = exportData.map((obj) => {
          const newObj = {};
          columnsToFilter.forEach((key) => {
            const name =
              key === 'address_city'
                ? 'address_city'
                : key === 'address_state'
                ? 'address_state'
                : key === 'external_id'
                ? 'donor_id'
                : key;
            newObj[name] = obj[key];
          });

          return newObj;
        });
        const prefixName = getAllInterface?.selectedOptions
          ? getAllInterface?.selectedOptions.trim()
          : 'Donors';
        url = await this.exportService.exportDataToS3(
          filteredData,
          getAllInterface,
          prefixName,
          'Donors'
        );
      }

      /**
       * If FE has already required fetchAll in upper block, then we don't have to query db again.
       */

      return {
        status: HttpStatus.OK,
        message: `${this.message} fetched successfully.`,
        count: exportData[0]?.total_count || 0,
        data: exportData,
        url,
      };
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async fetchDonorAppointments(
    getAppointmentsInterface: GetAllDonorsAppointments
  ) {
    try {
      let { sortBy, sortOrder } = getAppointmentsInterface;
      const {
        page,
        limit,
        status,
        procedure_type,
        locationType,
        search,
        dateRange,
        donor_id,
      } = getAppointmentsInterface;
      const donor = await this.entityRepository.find({
        where: {
          id: getAppointmentsInterface.donor_id,
          tenant: { id: getAppointmentsInterface.tenant_id },
        },
      });
      if (!donor || donor.length === 0) {
        console.log('in if condition');
        return resError(
          'Donor not found',
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      if (sortBy) {
        if (sortBy === 'slot_start_time') {
          sortBy = `(SELECT MIN(EXTRACT(HOUR FROM shifts_slots.start_time)*60 + EXTRACT(MINUTE FROM shifts_slots.start_time)) FROM shifts_slots WHERE donor_appointment.slot_id = shifts_slots.id)`;
          sortOrder = sortOrder?.toUpperCase();
        }
        if (sortBy === 'status') {
          sortBy = 'donor_appointment.status';
          sortOrder = sortOrder?.toUpperCase();
        }
        if (sortBy === 'note') {
          sortBy = 'donor_appointment.note';
          sortOrder = sortOrder?.toUpperCase();
        }
        if (sortBy === 'donation_type') {
          sortBy = `(
          SELECT procedure_types.name
          FROM procedure_types 
          WHERE donor_appointment.procedure_type = procedure_types.id)`;
          sortOrder = sortOrder?.toUpperCase();
        }
        if (sortBy === 'date') {
          sortBy = `(
            SELECT COALESCE(
              (
                SELECT sessions.date 
                FROM sessions 
                WHERE "donor_appointment"."appointmentable_id" = sessions.id 
                AND "donor_appointment"."appointmentable_type" = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
              ),
              (
                SELECT drives.date
                FROM drives 
                WHERE "donor_appointment"."appointmentable_id" = drives.id 
                AND "donor_appointment"."appointmentable_type" = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
              )
            )
          )`;
          sortOrder = sortOrder?.toUpperCase();
        }
        if (sortBy === 'location') {
          sortBy = `(
            SELECT COALESCE(
              (
                SELECT facility.name
                FROM facility 
                WHERE facility.id = (
                  SELECT sessions.donor_center_id
                  FROM sessions
                  WHERE "donor_appointment"."appointmentable_id" = sessions.id
                  AND "donor_appointment"."appointmentable_type" = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
                )
              ),
              (
                SELECT crm_locations.name
                FROM crm_locations
                WHERE crm_locations.id = (
                  SELECT drives.location_id
                  FROM drives
                  WHERE "donor_appointment"."appointmentable_id" = drives.id
                  AND "donor_appointment"."appointmentable_type" = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
                )
              )
            )
          )`;
          sortOrder = sortOrder?.toUpperCase();
        }
      }
      const query = this.entityDonorsAppointmentsRepository
        .createQueryBuilder('donor_appointment')
        .select(
          `(JSON_BUILD_OBJECT('id',donor_appointment.id, 'status', donor_appointment.status, 
          'note', donor_appointment.note, 'type', donor_appointment.appointmentable_type, 'tenant_id', donor_appointment.tenant_id)) 
          as donor_appointment`
        )
        .addSelect(
          `(  SELECT COALESCE(
            (SELECT JSON_BUILD_OBJECT('date', sessions.date, 'tenant_id', sessions.tenant_id, 'location', (
                SELECT JSON_BUILD_OBJECT(
                    'id', dc.id,'created_at', dc.created_at, 'location', dc.name, 'tenant_id', dc.tenant_id
                )
                FROM facility dc
                WHERE dc.id = sessions.donor_center_id
            )) 
            FROM sessions 
            WHERE "donor_appointment"."appointmentable_id" = sessions.id AND "donor_appointment"."appointmentable_type" = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
            ),
            (SELECT JSON_BUILD_OBJECT('date', drives.date, 'tenant_id', drives.tenant_id, 'location', (
                SELECT JSON_BUILD_OBJECT(
                    'id', loc.id, 'location', loc.name, 'account_id', drives.account_id, 'tenant_id', drives.tenant_id
                )
                FROM crm_locations loc
                WHERE loc.id = drives.location_id
            )) 
            FROM drives 
            WHERE "donor_appointment"."appointmentable_id" = drives.id 
            AND "donor_appointment"."appointmentable_type" = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
            )
        ))`,
          'date'
        )
        .addSelect(
          `(SELECT JSON_BUILD_OBJECT('slot_start_time', shifts_slots.start_time,'slot_end_time', shifts_slots.end_time, 'tenant_id', donor_appointment.tenant_id ) 
          FROM shifts_slots WHERE donor_appointment.slot_id = shifts_slots.id
            )`,
          'shifts_slots'
        )
        .addSelect(
          `(SELECT JSON_BUILD_OBJECT('donation_type', procedure_types.name, 'donation_id', procedure_types.id, 'tenant_id', procedure_types.tenant_id) 
          FROM procedure_types 
          WHERE donor_appointment.procedure_type = procedure_types.id
            )`,
          'procedure_types'
        )
        .addSelect([`donor_appointment.tenant_id AS tenant_id`])
        .leftJoin('donor_appointment.procedure_type', 'procedure_type')
        .leftJoin('donor_appointment.slot_id', 'slot_id')
        .leftJoin('donor_appointment.donor_id', 'donor_id')
        .orderBy(
          sortBy || 'donor_appointment.id',
          (sortOrder as 'ASC' | 'DESC') || 'DESC'
        )
        .where(
          `donor_appointment.is_archived = false AND donor_appointment.donor_id = ${donor_id} AND donor_appointment.tenant_id = ${this.request.user.tenant.id}`
        )
        .getQuery();
      let withWhereQuery = query.split('ORDER BY')[0];
      const orderQuery = query.split('ORDER BY')[1];
      if (procedure_type) {
        withWhereQuery += ` AND "donor_appointment"."procedure_type_id" = ${procedure_type}`;
      }
      withWhereQuery += ` AND "donor_appointment"."donor_id" = ${getAppointmentsInterface.donor_id}`;

      if (status) {
        withWhereQuery += ` AND "donor_appointment"."status" = '${status}'`;
      }

      if (locationType) {
        withWhereQuery += ` AND (SELECT COALESCE(
          (
            SELECT facility.name
            FROM facility 
            WHERE facility.id = (
              SELECT sessions.donor_center_id
              FROM sessions
              WHERE "donor_appointment"."appointmentable_id" = sessions.id
              AND "donor_appointment"."appointmentable_type" = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
            )
          ),
          (
            SELECT crm_locations.name
            FROM crm_locations
            WHERE crm_locations.id = (
              SELECT drives.location_id
              FROM drives
              WHERE "donor_appointment"."appointmentable_id" = drives.id
              AND "donor_appointment"."appointmentable_type" = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
            )
          )
        )
      ) = '${locationType}'`;
      }
      if (dateRange) {
        const startDate = dateRange?.split(' ')[0];
        const endDate = dateRange?.split(' ')[1];
        const queryDate = ` AND (SELECT COALESCE(
        (
            SELECT sessions.date
            FROM sessions
            WHERE "donor_appointment"."appointmentable_id" = sessions.id
            AND "donor_appointment"."appointmentable_type" = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
        ),
        (
            SELECT drives.date
            FROM drives
            WHERE "donor_appointment"."appointmentable_id" = drives.id
            AND "donor_appointment"."appointmentable_type" = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
          )
      )
    )`;
        withWhereQuery += queryDate + ` >= DATE '${startDate}'`;
        withWhereQuery += queryDate + ` <= DATE '${endDate}'`;
      }

      if (search) {
        withWhereQuery += ` AND (SELECT COALESCE(
            (
              SELECT facility.name
              FROM facility 
              WHERE facility.id = (
                SELECT sessions.donor_center_id
                FROM sessions
                WHERE "donor_appointment"."appointmentable_id" = sessions.id
                AND "donor_appointment"."appointmentable_type" = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
              )
            ),
            (
              SELECT crm_locations.name
              FROM crm_locations
              WHERE crm_locations.id = (
                SELECT drives.location_id
                FROM drives
                WHERE "donor_appointment"."appointmentable_id" = drives.id
                AND "donor_appointment"."appointmentable_type" = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
              )
            )
          ) ILIKE '%${search}%' OR (
            SELECT procedure_types.name
            FROM procedure_types 
            WHERE donor_appointment.procedure_type_id = procedure_types.id) ILIKE '%${search}%')`;
      }

      const count = await this.entityDonorsAppointmentsRepository.query(
        ` SELECT COUNT(*) OVER()
        FROM (${withWhereQuery} ORDER BY ${orderQuery}) as subquery`
      );

      const appointments = await this.entityDonorsAppointmentsRepository.query(
        withWhereQuery +
          ' ORDER BY ' +
          orderQuery +
          ` LIMIT ${limit} OFFSET ${(page - 1) * limit}`
      );

      return {
        status: HttpStatus.OK,
        message: `Donor schedule fetched successfully.`,
        count: count?.[0]?.count,
        data: appointments,
      };
    } catch (error) {
      console.log(error);

      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  async getDonorAppointment(id: any) {
    try {
      const query = this.entityDonorsAppointmentsRepository
        .createQueryBuilder('donor_appointment')
        .select(
          `(JSON_BUILD_OBJECT(
            'id',donor_appointment.id, 
            'status', donor_appointment.status, 
            'note', donor_appointment.note,
            'tenant_id', donor_appointment.tenant_id,
            'created_at', donor_appointment.created_at,
            'created_by',donor_appointment.created_by)) as donor_appointment`
        )
        .addSelect(
          `(  SELECT COALESCE(
            (SELECT JSON_BUILD_OBJECT(
            'date', sessions.date,
            'tenant_id', sessions.tenant_id,
            'location', (
                SELECT JSON_BUILD_OBJECT(
                    'id', dc.id,
                    'created_at', dc.created_at, 
                    'location', dc.name,
                    'tenant_id', dc.tenant_id
                )
                FROM facility dc
                WHERE dc.id = sessions.donor_center_id
            )) 
            FROM sessions
            WHERE "donor_appointment"."appointmentable_id" = sessions.id AND "donor_appointment"."appointmentable_type" = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
            ),
            (SELECT JSON_BUILD_OBJECT(
              'date', drives.date,
              'tenant_id', drives.tenant_id,
              'location', (
                SELECT JSON_BUILD_OBJECT(
                    'id', loc.id,
                    'location', loc.name,
                    'tenant_id', loc.tenant_id
                )
                FROM crm_locations loc
                WHERE loc.id = drives.location_id
            )) 
            FROM drives 
            WHERE "donor_appointment"."appointmentable_id" = drives.id AND "donor_appointment"."appointmentable_type" = '${PolymorphicType.OC_OPERATIONS_DRIVES}'
            )
        ))`,
          'date'
        )
        .addSelect(
          `(SELECT JSON_BUILD_OBJECT(
            
            'slot_start_time', shifts_slots.start_time,
            'tenant_id', donor_appointment.tenant_id

            ) 

            FROM shifts_slots 
            WHERE donor_appointment.slot_id = shifts_slots.id
            )`,
          'shifts_slots'
        )
        .addSelect(
          `(SELECT JSON_BUILD_OBJECT(
            
            'first_name', "user"."first_name" ,
            'last_name', "user"."last_name" ,
            'tenant_id', "user"."tenant_id") 

            FROM "user" 
            WHERE "donor_appointment"."created_by" = "user"."id"
            )`,
          'created_by'
        )
        .addSelect(
          `(SELECT JSON_BUILD_OBJECT(

            'donation_type', procedure_types.name,
            'tenant_id', procedure_types.tenant_id) 

            FROM procedure_types 
            WHERE donor_appointment.procedure_type = procedure_types.id
            )`,
          'procedure_types'
        )
        .leftJoin('donor_appointment.procedure_type', 'procedure_type')
        .leftJoin('donor_appointment.slot_id', 'slot_id')
        .where(`donor_appointment.id = ${id}`)
        .andWhere(`donor_appointment.is_archived = false`)
        .andWhere(
          `donor_appointment.tenant_id = ${this.request.user?.tenant?.id}`
        )
        .getQuery();

      const appointments = await this.entityDonorsAppointmentsRepository.query(
        query
      );

      if (appointments) {
        const modifiedData: any = await getModifiedDataDetails(
          this.donorsAppointmentsHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        appointments.modified_by = appointments.created_by;
        appointments.modified_at = appointments.created_at;
        appointments.created_at = modified_at
          ? modified_at
          : appointments.created_at;
        appointments.created_by = modified_by
          ? modified_by
          : appointments.created_by;
      }
      if (appointments?.[0])
        appointments[0].tenant_id = this.request.user?.tenant?.id;

      return {
        status: HttpStatus.OK,
        message: `Donor schedule fetched successfully.`,
        data: appointments,
      };
    } catch (error) {
      console.log(error);

      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getSingleAppointment(id: any) {
    const result = await this.entityDonorsAppointmentsRepository.findOne({
      where: { id: id },
      relations: ['donor_id', 'slot_id', 'procedure_type', 'tenant'],
    });
    if (!result) {
      return resError(
        `Appointment not found.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }

    const slots: any = result?.slot_id || {};
    const data = {
      ...result,
      slot_id: {
        ...slots,
        tenant_id: this.request.user?.tenant?.id,
      },
    };

    return {
      status: HttpStatus.OK,
      message: `Appointment fetched successfully.`,
      data,
    };
  }

  async getDonorAppointmentFilters(tenant_id: bigint) {
    try {
      // Getting procedure types filter
      const procedureTypes = await this.entityManager.query(`
      SELECT procedure.name AS label, procedure.id AS value, procedure.tenant_id 
      FROM procedure_types procedure
      WHERE procedure.id IN (
          SELECT shifts_projections_staff.procedure_type_id 
          FROM shifts_projections_staff
          WHERE shifts_projections_staff.shift_id IN (
              SELECT shifts.id 
              FROM shifts
              WHERE shiftable_type ILIKE '${PolymorphicType.OC_OPERATIONS_SESSIONS}' OR shiftable_type ILIKE '${PolymorphicType.OC_OPERATIONS_DRIVES}'
          )
      ) AND procedure.tenant_id = ${tenant_id} AND procedure.is_archive = false`);

      // Getting account filters
      const accounts = await this.drivesRepository
        .createQueryBuilder('drive')
        .select([
          'account.name as label',
          'account.id as value',
          'account.tenant_id as tenant_id',
        ])
        .innerJoin('drive.account', 'account')
        .where({
          tenant: { id: tenant_id },
          is_archived: false,
        })
        .andWhere(`account.is_archived = false`)
        .andWhere('drive.date >= CURRENT_DATE')
        .groupBy('account.id, account.name')
        .getRawMany();

      // Getting donor centers filters
      const donorCenters = await this.sessionsRepository
        .createQueryBuilder('sessions')
        .select([
          'donor_center.name as label',
          'donor_center.id as value',
          'donor_center.tenant_id as tenant_id',
        ])
        .innerJoin('sessions.donor_center', 'donor_center')
        .where({ tenant: { id: tenant_id }, is_archived: false })
        .andWhere(`donor_center.is_archived = false`)
        .andWhere('sessions.date >= CURRENT_DATE')
        .groupBy('donor_center.id, donor_center.name')
        .getRawMany();

      return {
        status: HttpStatus.OK,
        message: `Schedule donor filter fetched successfully.`,
        data: { procedureTypes, accounts, donorCenters, tenant_id },
      };
    } catch (error) {
      console.log(error);

      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  async createDonorListing(
    id: bigint,
    getAppointmentsCreateListingInterface: GetAppointmentsCreateListingInterface,
    tenant_id: bigint
  ) {
    try {
      const {
        page,
        limit,
        procedureType,
        accountType,
        dateRange,
        donorCenter,
        earlierThan,
        laterThan,
        sortBy,
        sortOrder,
        radius,
      } = getAppointmentsCreateListingInterface;
      let newSort = '';
      const radiusIds = {
        drives: [],
        sessions: [],
      };
      const latLongDonor = await this.addressRepository.findOne({
        where: {
          addressable_type: PolymorphicType.CRM_CONTACTS_DONORS,
          addressable_id: id,
        },
        select: ['latitude', 'longitude', 'tenant_id'],
      });
      let testDebugRes;
      if (radius) {
        const resAdd = await this.addressRepository.query(`SELECT
        a.id,
        a.addressable_type,
        a.addressable_id,
        a.coordinates,
        a.latitude,
        a.longitude,
        COALESCE(s.id, d.id) as temp_id
         FROM
           address a
         LEFT JOIN
           facility f ON f.id = a.addressable_id AND a.addressable_type = '${PolymorphicType.SC_ORG_ADMIN_FACILITY}' AND f.donor_center = true
         LEFT JOIN
           sessions s ON s.donor_center_id = f.id
         LEFT JOIN
           crm_locations cl ON cl.id = a.addressable_id AND a.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'
        LEFT JOIN
           drives d ON d.location_id = cl.id
         WHERE
        a.tenant_id = ${tenant_id}
        AND (f.id IS NOT NULL OR a.addressable_type = '${PolymorphicType.CRM_LOCATIONS}')
        AND a.latitude IS NOT NULL
        AND a.longitude IS NOT NULL;`);

        testDebugRes = { alladdresses: resAdd, latLongDonor };

        if (!latLongDonor?.latitude || !latLongDonor?.longitude) {
          radiusIds.drives.push(0);
          radiusIds.sessions.push(0);
        } else {
          resAdd?.map((singleAdd) => {
            if (
              this.getDistanceFromLatLonInMiles(
                Number(singleAdd.latitude),
                Number(singleAdd.longitude),
                Number(latLongDonor.latitude),
                Number(latLongDonor.longitude)
              ) &&
              this.getDistanceFromLatLonInMiles(
                Number(singleAdd.latitude),
                Number(singleAdd.longitude),
                Number(latLongDonor.latitude),
                Number(latLongDonor.longitude)
              ) <= radius
            ) {
              if (singleAdd.addressable_type === PolymorphicType.CRM_LOCATIONS)
                radiusIds.drives.push(Number(singleAdd.temp_id));
              else radiusIds.sessions.push(Number(singleAdd.temp_id));
            }
          });
          if (!(radiusIds.drives.length > 0)) radiusIds.drives.push(0);
          if (!(radiusIds.sessions.length > 0)) radiusIds.sessions.push(0);
        }
      }

      const startDate = dateRange?.split(' ')[0];
      const endDate = dateRange?.split(' ')[1];
      const earlyTime = moment(earlierThan).format('HH:mm:ss');
      const laterTime = moment(laterThan).format('HH:mm:ss');
      let queryBuilder: any;
      let queryBuilderDrive: any;
      const isCombined = !donorCenter && !accountType;

      if (donorCenter && accountType) {
        return {
          status: HttpStatus.OK,
          message: `Donor drives and sessions fetched successfully.`,
          count: 0,
          data: [],
        };
      }

      if ((donorCenter && !accountType) || isCombined) {
        queryBuilder = this.sessionsRepository
          .createQueryBuilder('sessions')
          .select([
            'DATE(sessions.date) as date',
            'sessions.id as id',
            'sessions.tenant_id as tenant_id',
            'sessions.created_at as created_at',
            `'${PolymorphicType.OC_OPERATIONS_SESSIONS}' as type`,
          ])
          .addSelect(
            `(
              SELECT dc.name
              FROM facility dc 
              WHERE dc.id = sessions.donor_center_id
              )`,
            'location'
          )
          .addSelect(
            `(SELECT p.name
              FROM promotion_entity p 
              WHERE p.id = (
                SELECT sp.promotion_id
                FROM sessions_promotions sp
                WHERE sp.session_id = sessions.id
                ORDER BY sp.created_at DESC
                LIMIT 1
              )
            ) AS "promotions"`
          )
          .addSelect(
            `(
              SELECT MAX(shifts.end_time)
              FROM shifts
              WHERE shifts.shiftable_type ILIKE '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
                AND shifts.shiftable_id = sessions.id
            ) AS "earlier_than"`
          )
          .addSelect(
            `(
              SELECT MIN(shifts.start_time)
              FROM shifts
              WHERE shifts.shiftable_type ILIKE '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
                AND shifts.shiftable_id = sessions.id
            ) AS "later_than"`
          )
          .innerJoin('sessions.donor_center', 'donor_center')
          .where({ tenant: { id: tenant_id }, is_archived: false });

        if (startDate && endDate) {
          queryBuilder = queryBuilder.andWhere({
            date: Between(new Date(startDate), new Date(endDate)),
          });
        } else
          queryBuilder = queryBuilder.andWhere({
            date: MoreThanOrEqual(new Date()),
          });
        if (earlierThan) {
          queryBuilder = queryBuilder.andWhere(`(
            SELECT MAX(CAST(shifts.end_time AS TIME))
            FROM shifts
            WHERE shifts.shiftable_type ILIKE '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
              AND shifts.shiftable_id = sessions.id
          ) >= '${earlyTime}'`);
        }
        if (radius) {
          queryBuilder = queryBuilder.andWhere(`
            sessions.id IN (${radiusIds.sessions})
          `);
        }
        if (procedureType)
          queryBuilder = queryBuilder.andWhere(
            ` 
        ${procedureType} IN (
          SELECT shifts_projections_staff.procedure_type_id
          FROM shifts_projections_staff
          WHERE shifts_projections_staff.shift_id IN (
            SELECT shifts.id
            FROM shifts
            WHERE shifts.shiftable_type ILIKE '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
              AND shifts.shiftable_id = sessions.id 
              AND shifts.is_archived = false
          )
        )
      `
          );
        if (laterThan) {
          queryBuilder = queryBuilder.andWhere(`(
            SELECT MIN(CAST(shifts.start_time AS TIME))
            FROM shifts
            WHERE shifts.shiftable_type ILIKE '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
              AND shifts.shiftable_id = sessions.id
          ) >= CAST('${laterTime}' AS TIME) `);
        }
        if (donorCenter)
          queryBuilder = queryBuilder.andWhere(
            `sessions.donor_center_id = ${donorCenter}`
          );

        if (sortBy) {
          if (sortBy === 'date') {
            newSort = `DATE(sessions.date)`;
          } else if (sortBy === 'location') {
            newSort = `(
              SELECT dc.name
              FROM facility dc 
              WHERE dc.id = sessions.donor_center_id
              )`;
          } else if (sortBy === 'promotions') {
            newSort = `(SELECT p.name
                FROM promotion_entity p 
                WHERE p.id = (
                  SELECT sp.promotion_id
                  FROM sessions_promotions sp
                  WHERE sp.session_id = sessions.id
                  ORDER BY sp.created_at DESC
                  LIMIT 1
                )
              )`;
          } else if (sortBy === 'appointmentTime') {
            newSort = `(
              SELECT CAST(shifts.start_time AS TIME)
              FROM shifts
              WHERE shifts.shiftable_type ILIKE '${PolymorphicType.OC_OPERATIONS_SESSIONS}'
                AND shifts.shiftable_id = sessions.id
            )`;
          }
        }
      }

      if ((!donorCenter && accountType) || isCombined) {
        queryBuilderDrive = this.drivesRepository
          .createQueryBuilder('drives')
          .select([
            'DATE(drives.date) as date',
            'drives.id as id',
            'drives.tenant_id as tenant_id',
            'drives.created_at as created_at',
            `'${PolymorphicType.OC_OPERATIONS_DRIVES}' as type`,
          ])
          .addSelect(
            ` (
            SELECT crm_locations.name
            FROM crm_locations
            WHERE crm_locations.id = drives.location_id
          )`,
            'location'
          )
          .addSelect(
            `(SELECT promotion_entity.name
              FROM promotion_entity
              WHERE promotion_entity.id = drives.promotion_id
            ) AS "promotions"`
          )
          .addSelect(
            `(
              SELECT MAX(shifts.end_time)
              FROM shifts
              WHERE shifts.shiftable_type ILIKE '${PolymorphicType.OC_OPERATIONS_DRIVES}'
                AND shifts.shiftable_id = drives.id
            ) AS "earlier_than"`
          )
          .addSelect(
            `(
              SELECT MIN(shifts.start_time)
              FROM shifts
              WHERE shifts.shiftable_type ILIKE '${PolymorphicType.OC_OPERATIONS_DRIVES}'
                AND shifts.shiftable_id = drives.id
            ) AS "later_than"`
          )
          .leftJoin('drives.promotion', 'promotion_entity')
          .innerJoin('drives.location', 'crm_locations')
          .where({ tenant: { id: tenant_id }, is_archived: false });

        if (startDate && endDate) {
          queryBuilderDrive = queryBuilderDrive.andWhere({
            date: Between(new Date(startDate), new Date(endDate)),
          });
        } else
          queryBuilderDrive = queryBuilderDrive.andWhere({
            date: MoreThanOrEqual(new Date()),
          });
        if (procedureType)
          queryBuilderDrive = queryBuilderDrive.andWhere(
            `${procedureType} IN (
            SELECT shifts_projections_staff.procedure_type_id
            FROM shifts_projections_staff
            WHERE shifts_projections_staff.shift_id IN (
              SELECT shifts.id
              FROM shifts
              WHERE shifts.shiftable_type ILIKE '${PolymorphicType.OC_OPERATIONS_DRIVES}'
                AND shifts.shiftable_id = drives.id
                AND shifts.is_archived = false
            )
          )
        `
          );

        if (accountType)
          queryBuilderDrive = queryBuilderDrive.andWhere(`
            drives.account = ${accountType}
          `);

        if (radius) {
          queryBuilderDrive = queryBuilderDrive.andWhere(`
            drives.id IN (${radiusIds.drives})
          `);
        }
        if (earlierThan) {
          queryBuilderDrive = queryBuilderDrive.andWhere(`(
            SELECT MAX(CAST(shifts.end_time AS TIME))
            FROM shifts
            WHERE shifts.shiftable_type ILIKE '${PolymorphicType.OC_OPERATIONS_DRIVES}'
              AND shifts.shiftable_id = drives.id
          ) >= '${earlyTime}'`);
        }
        if (laterThan) {
          queryBuilderDrive = queryBuilderDrive.andWhere(`(
            SELECT MIN(CAST(shifts.start_time AS TIME))
            FROM shifts
            WHERE shifts.shiftable_type ILIKE '${PolymorphicType.OC_OPERATIONS_DRIVES}'
              AND shifts.shiftable_id = drives.id
          ) >= CAST('${laterTime}' AS TIME) `);
        }

        if (sortBy) {
          if (sortBy === 'date') {
            newSort = `DATE(drives.date)`;
          } else if (sortBy === 'location') {
            newSort = `(
              SELECT crm_locations.name
              FROM crm_locations
              WHERE crm_locations.id = drives.location_id
            )`;
          } else if (sortBy === 'promotions') {
            newSort = `(SELECT promotion_entity.name
              FROM promotion_entity
              WHERE promotion_entity.id = drives.promotion_id
            )`;
          } else if (sortBy === 'appointmentTime') {
            newSort = `(
              SELECT CAST(shifts.start_time AS TIME)
              FROM shifts
              WHERE shifts.shiftable_type ILIKE '${PolymorphicType.OC_OPERATIONS_DRIVES}'
                AND shifts.shiftable_id = drives.id
            )`;
          }
        }
      }

      if (queryBuilder && !isCombined) {
        const [data, count] = await Promise.all([
          queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy(
              newSort || `sessions.id`,
              (sortOrder?.toUpperCase() as 'ASC' | 'DESC') || 'DESC'
            )
            .getRawMany(),
          queryBuilder.getCount(),
        ]);
        return {
          testDebugRes,

          status: HttpStatus.OK,
          message: `Donor drives and sessions fetched successfully.`,
          count: count,
          data: data,
        };
      }
      if (queryBuilderDrive && !isCombined) {
        const [data, count] = await Promise.all([
          queryBuilderDrive
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy(
              newSort || `drives.id`,
              (sortOrder?.toUpperCase() as 'ASC' | 'DESC') || 'DESC'
            )
            .getRawMany(),
          queryBuilderDrive.getCount(),
        ]);
        return {
          status: HttpStatus.OK,
          message: `Donor drives and sessions fetched successfully.`,
          count: count,
          testDebugRes,
          data: data,
        };
      } else {
        const baseParams: (bigint | boolean | Date | string[])[] = [
          tenant_id,
          false,
        ];

        if (dateRange) {
          baseParams.push(new Date(startDate), new Date(endDate));
        } else baseParams.push(new Date());

        if (sortBy === 'date') {
          newSort = 'DATE(date)';
        }
        if (sortBy === 'location') {
          newSort = 'location';
        }

        if (sortBy === 'promotions') {
          newSort = 'promotions';
        }
        if (sortBy === 'appointmentTime') {
          newSort = 'later_than';
        }

        let newQuery =
          queryBuilder?.getSql() +
          ' UNION ' +
          queryBuilderDrive?.getSql() +
          ` ORDER BY ${newSort || 'created_at'} ${
            sortOrder?.toUpperCase() || 'DESC'
          }`;

        const count = await this.entityManager.query(
          ` SELECT COUNT(*) OVER()
            FROM (${newQuery}) as subquery LIMIT 1`,
          baseParams
        );

        newQuery = newQuery + ` LIMIT ${limit} OFFSET ${(page - 1) * limit}`;

        const result = await this.entityManager.query(newQuery, baseParams);
        return {
          status: HttpStatus.OK,
          message: `Donor create schedule fetched successfully.`,
          count: count?.[0]?.count,
          data: result,
          testDebugRes,
        };
      }
    } catch (error) {
      console.log(error);

      return resError(
        `error in fetching filters.`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async archiveDonorAppointment(id: any, user) {
    try {
      const appointment: any =
        await this.entityDonorsAppointmentsRepository.findOne({
          where: {
            id: id,
          },
          relations: ['donor_id', 'slot_id', 'procedure_type'],
        });
      if (!appointment) {
        return resError(
          `Appointment not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (appointment.is_archived) {
        return resError(
          `Appointment is already archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      appointment.is_archived = true;
      appointment.created_at = new Date();
      appointment.created_by = this.request?.user;
      const archivedAppointment =
        await this.entityDonorsAppointmentsRepository.save(appointment);

      // const appointmentHistory: any = new DonorsAppointmentsHistory();
      // appointmentHistory.id = appointment.id;
      // appointmentHistory.appointmentable_id = appointment?.appointmentable_id;
      // appointmentHistory.appointmentable_type =
      //   appointment?.appointmentable_type;
      // appointmentHistory.created_by = user.id;
      // appointment.tenant_id = appointment?.tenant_id;
      // appointmentHistory.donor_id = appointment.donor_id.id;
      // appointmentHistory.slot_id = appointment.slot_id.id;
      // appointmentHistory.procedure_type_id = appointment.procedure_type.id;
      // appointmentHistory.status = appointment.status;
      // appointmentHistory.is_archived = true;
      // appointmentHistory.history_reason = 'C';
      // await this.donorsAppointmentsHistoryRepository.save(appointmentHistory);
      // const appointmentHistoryD: any = new DonorsAppointmentsHistory();
      // appointmentHistoryD.id = appointment.id;
      // appointmentHistoryD.appointmentable_id = appointment?.appointmentable_id;
      // appointmentHistoryD.appointmentable_type =
      //   appointment?.appointmentable_type;
      // appointmentHistoryD.created_by = user.id;
      // appointment.tenant_id = appointment?.tenant_id;
      // appointmentHistoryD.donor_id = appointment.donor_id.id;
      // appointmentHistoryD.slot_id = appointment.slot_id.id;
      // appointmentHistoryD.procedure_type_id = appointment.procedure_type.id;
      // appointmentHistoryD.status = appointment.status;
      // appointmentHistoryD.is_archived = true;
      // appointmentHistoryD.history_reason = 'D';
      // await this.donorsAppointmentsHistoryRepository.save(appointmentHistoryD);

      return resSuccess(
        'Appointment archived successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        null
      );
    } catch (error) {
      console.log(
        '<================== Donor archiveDonorAppointment ==================> '
      );
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getDonationTypeAppointmentCreateDetails(
    getAppointmentCreateDetailsInterface: GetAppointmentCreateDetailsInterface,
    tenant_id: any
  ) {
    try {
      const { id, type } = getAppointmentCreateDetailsInterface;

      const result = await this.entityManager.query(`
        SELECT DISTINCT ON (procedure_types.id) procedure_types.id as value, 
        procedure_types.name as label, 
        procedure_types.tenant_id as tenant_id, 
        shifts_projections_staff.shift_id as shift_id
        FROM procedure_types
        JOIN shifts_projections_staff ON procedure_types.id = shifts_projections_staff.procedure_type_id
        WHERE procedure_types.id IN ( SELECT shifts_projections_staff.procedure_type_id
        FROM shifts_projections_staff
        WHERE shifts_projections_staff.shift_id IN (SELECT shifts.id
        FROM shifts
        WHERE shifts.shiftable_id = ${id}  ${
        tenant_id ? 'AND shifts.tenant_id = ' + tenant_id : ''
      } AND shifts.shiftable_type ILIKE '${
        type === PolymorphicType.OC_OPERATIONS_DRIVES
          ? PolymorphicType.OC_OPERATIONS_DRIVES
          : PolymorphicType.OC_OPERATIONS_SESSIONS
      }')) ORDER BY procedure_types.id, procedure_types.name DESC`);

      const locationDate =
        type === PolymorphicType.OC_OPERATIONS_DRIVES
          ? await this.entityManager.query(`
        SELECT drives.date as date, crm_locations.name as location,
        crm_locations.tenant_id as tenant_id 
        FROM drives
        INNER JOIN crm_locations ON drives.location_id = crm_locations.id
        WHERE drives.id = ${id}`)
          : await this.entityManager.query(`
        SELECT sessions.date as date, facility.name as location
        FROM sessions
        INNER JOIN facility ON sessions.donor_center_id = facility.id
        WHERE sessions.id = ${id}`);

      return {
        status: HttpStatus.OK,
        message: `Donoation type fetched successfully.`,
        data: {
          donationType: result,
          locationDate,
          tenant_id: this.request.user.tenant?.id,
        },
      };
    } catch (error) {
      console.log(error);

      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getStartTimeAppointmentCreateDetails(
    getStartTimeCreateDetailsInterface: GetStartTimeCreateDetailsInterface
  ) {
    try {
      const { slotId, shiftId, id, type, isCancelled } =
        getStartTimeCreateDetailsInterface;

      const compare =
        type === PolymorphicType.OC_OPERATIONS_DRIVES
          ? PolymorphicType.OC_OPERATIONS_DRIVES
          : PolymorphicType.OC_OPERATIONS_SESSIONS;

      const allShifts = await this.shiftsRepository.query(`
        SELECT shifts.id 
        FROM shifts 
        WHERE shifts.shiftable_type ILIKE '${compare}' AND shifts.shiftable_id = ${id}
      `);

      const shifts = allShifts?.map((shif) => shif?.id);

      const alreadyBooked = await this.entityDonorsAppointmentsRepository
        .query(`SELECT slots.id
        FROM shifts_slots slots
        LEFT JOIN donors_appointments appointments ON slots.id = appointments.slot_id
        WHERE slots.procedure_type_id = ${shiftId} 
        ${shifts ? `AND slots.shift_id IN (${shifts})` : ''} 
        ${slotId && isCancelled === 'false' ? `AND slots.id <> ${slotId}` : ''}
        AND appointments.status != '4'
        GROUP BY slots.id
        HAVING EXISTS (
            SELECT 1
            FROM donors_appointments AS da
            WHERE da.slot_id = slots.id AND da.is_archived = false AND da.status != '4'
        );
      `);

      const ids = alreadyBooked?.map((single) => single.id).join(',');
      const procedure_types = await this.shiftsSlotsRepository
        .query(`SELECT DISTINCT ON (slots.id)
      JSON_BUILD_OBJECT ('label', slots.start_time) as time,
      slots.id as value,
      slots.procedure_type_id as procedure
      FROM shifts_slots slots
      WHERE slots.procedure_type_id = ${shiftId} AND slots.is_archived = false     
      ${
        shifts
          ? `AND slots.shift_id IN (${shifts})  AND slots.is_archived = false`
          : ''
      } 
      ${
        ids ? `AND slots.id NOT IN (${ids}) AND slots.is_archived = false` : ''
      }`);

      const data = procedure_types?.map((item) => {
        return {
          ...item,
          tenant_id: this.request.user?.tenant?.id,
          time: {
            ...item.time,
            tenant_id: this.request.user?.tenant?.id,
          },
        };
      });

      return {
        status: HttpStatus.OK,
        message: `Donoation type fetched successfully.`,
        data,
      };
    } catch (error) {
      console.log(error);

      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  getDistanceFromLatLonInMiles(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d * 0.621371;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
  /**
   * Changes the cron expression of the specified cron job.
   *
   * This function attempts to find and modify a cron job registered in the SchedulerRegistry.
   * If the job is found, it stops the current job, sets a new time based on the provided expression,
   * and then restarts the job. If the job is not found, it throws an error.
   *
   * @param {CronExpression} expression - The new cron expression to set for the job.
   * @returns {boolean} - Returns true if the cron expression was successfully changed.
   * @throws Will throw an error if no job with the specified name is found.
   */
  changeBBCSSyncCronExpression(expression: CronExpression): boolean | never {
    console.log(expression);
    let job = null;
    try {
      job = this.schedulerRegistry.getCronJob('triggerBBCSDonorsSync');
    } catch (e) {
      throw {
        message: 'Unable to reschedule cron job (No such job found)',
      };
    }
    if (!job) {
      throw {
        message: 'Unable to reschedule cron job (No such job found)',
      };
    }
    job.stop(); // Stop the current cron job
    job.setTime(new CronTime(expression)); // Set the new expression
    job.start(); // Start the cron job with the new expression
    return true;
  }
  getBBCSSyncCronSchedule() {
    let job: CronJob = null;
    try {
      job = this.schedulerRegistry.getCronJob('triggerBBCSDonorsSync');
    } catch (e) {
      throw {
        message: 'Unable to reschedule cron job (No such job found)',
      };
    }
    if (!job) {
      throw {
        message: 'Unable to reschedule cron job (No such job found)',
      };
    }
    return job.nextDate();
  }
  async getUnSyncedDonors() {
    let result = [];
    try {
      result = await this.entityRepository.find({
        where: {
          bbcs_donor_type: In([
            BBCSDonorType.LASTONLY,
            BBCSDonorType.MULTIEXACT,
          ]),
          is_synced: false,
        },
      });
    } catch (e) {
      return resError(
        e.message,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    return {
      status: HttpStatus.OK,
      message: `Donors fetched successfully.`,
      data: result,
    };
  }
  async syncDonorWithBBCS(id: number, bbcsUUID: string) {
    const donor = await this.entityRepository.findOne({
      where: { id: id as any },
      relations: {
        tenant_id: true,
      },
    });
    const tenantConfig = await this.tenantConfigRepository.findOne({
      where: { id: donor.tenant.id },
    });
    const BBCSDonor = await this.BBCSConnectorService.findDonorByUUIDBBCS({
      externalId: bbcsUUID,
      config: tenantConfig,
    });
    const contacts = await this.contactsRepository.find({
      where: {
        contactable_type: PolymorphicType.CRM_CONTACTS_DONORS,
        contact_type: In([4, 5, 6]),
        contactable_id: donor.id,
      },
    });
    const address = await this.addressRepository.findOne({
      where: {
        addressable_id: donor.id,
        addressable_type: PolymorphicType.CRM_CONTACTS_DONORS,
      },
    });
    await this.BBCSConnectorService.donorAddressUpdateBBCS(
      {
        city: address.city,
        addressLineOne: address.address1,
        zipCode: address.zip_code,
        uuid: bbcsUUID,
        addressLineTwo: address.address2,
        user: donor.created_by.id,
      },
      tenantConfig
    );
    if (contacts.find((c) => c.contact_type === ContactTypeEnum.WORK_PHONE))
      await this.BBCSConnectorService.donorCommunicationUpdateBBCS(
        {
          homePhone: contacts.find(
            (c) => c.contact_type === ContactTypeEnum.OTHER_PHONE
          )?.data,
          uuid: bbcsUUID,
          email: contacts.find(
            (c) => c.is_primary && [4, 5, 6].includes(c.contact_type)
          )?.data,
          user: donor.created_by.id,
          workPhone: contacts.find(
            (c) => c.contact_type === ContactTypeEnum.WORK_PHONE
          )?.data,
          cellPhone: contacts.find(
            (c) => c.contact_type === ContactTypeEnum.MOBILE_PHONE
          )?.data,
        },
        'workPhone',
        tenantConfig
      );
    if (contacts.find((c) => c.contact_type === ContactTypeEnum.OTHER_PHONE))
      await this.BBCSConnectorService.donorCommunicationUpdateBBCS(
        {
          homePhone: contacts.find(
            (c) => c.contact_type === ContactTypeEnum.OTHER_PHONE
          )?.data,
          uuid: bbcsUUID,
          email: contacts.find(
            (c) => c.is_primary && [4, 5, 6].includes(c.contact_type)
          )?.data,
          user: donor.created_by.id,
          workPhone: contacts.find(
            (c) => c.contact_type === ContactTypeEnum.WORK_PHONE
          )?.data,
          cellPhone: contacts.find(
            (c) => c.contact_type === ContactTypeEnum.MOBILE_PHONE
          )?.data,
        },
        'homePhone',
        tenantConfig
      );
    if (contacts.find((c) => c.contact_type === ContactTypeEnum.MOBILE_PHONE))
      await this.BBCSConnectorService.donorCommunicationUpdateBBCS(
        {
          homePhone: contacts.find(
            (c) => c.contact_type === ContactTypeEnum.OTHER_PHONE
          )?.data,
          uuid: bbcsUUID,
          email: contacts.find(
            (c) => c.is_primary && [4, 5, 6].includes(c.contact_type)
          )?.data,
          user: donor.created_by.id,
          workPhone: contacts.find(
            (c) => c.contact_type === ContactTypeEnum.WORK_PHONE
          )?.data,
          cellPhone: contacts.find(
            (c) => c.contact_type === ContactTypeEnum.MOBILE_PHONE
          )?.data,
        },
        'cellPhone',
        tenantConfig
      );
    donor.bbcs_donor_type = BBCSDonor.type;
    donor.external_id = bbcsUUID;
    donor.is_synced = true;
    await this.entityRepository.save(donor);
  }

  async generateUUIDsForAllContacts() {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      // updating donors
      const donors = await this.entityRepository
        .createQueryBuilder('donors')
        .where(
          'donors.contact_uuid IS NULL OR donors.contact_uuid = :emptyString',
          {
            emptyString: '',
          }
        )
        .getMany();
      for (const donor of donors) {
        const uniqueId = uuidv4();
        donor.contact_uuid = uniqueId;
      }
      await queryRunner.manager.save(donors);

      // updating volunteers
      const volunteers = await this.volunteerRepository
        .createQueryBuilder('crm_volunteer')
        .where(
          'crm_volunteer.contact_uuid IS NULL OR crm_volunteer.contact_uuid = :emptyString',
          {
            emptyString: '',
          }
        )
        .getMany();
      for (const volunteer of volunteers) {
        const uniqueId = uuidv4();
        volunteer.contact_uuid = uniqueId;
      }
      await queryRunner.manager.save(volunteers);

      // updating staff
      const staff = await this.staffRepository
        .createQueryBuilder('staff')
        .where(
          'staff.contact_uuid IS NULL OR staff.contact_uuid = :emptyString',
          {
            emptyString: '',
          }
        )
        .getMany();
      for (const el of staff) {
        const uniqueId = uuidv4();
        el.contact_uuid = uniqueId;
      }
      await queryRunner.manager.save(staff);

      return {
        status: HttpStatus.OK,
        message: `Donors, Staff, Volunteers updated successfully with contact_uuids`,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, 500);
    }
  }

  async getBloodGroups() {
    try {
      const bloodGroups: any = await this.bloodGroupsRepository.find({
        order: { name: 'ASC' },
      });

      return resSuccess(
        'Donor Blood Groups Fetched Successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        bloodGroups
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, 500);
    }
  }

  async getDonorsSeedData(user: any, queryParams: GetAllAccountsInterface) {
    try {
      const cities: any = await this.addressRepository
        .createQueryBuilder('address')
        .select('DISTINCT address.city', 'city')
        .where({
          addressable_type: PolymorphicType.CRM_CONTACTS_DONORS,
          tenant_id: queryParams.tenant_id,
        })
        .getRawMany();

      const states: any = await this.addressRepository
        .createQueryBuilder('address')
        .select('DISTINCT address.state', 'state')
        .where({
          addressable_type: PolymorphicType.CRM_CONTACTS_DONORS,
          tenant_id: queryParams.tenant_id,
        })
        .getRawMany();

      const counties: any = await this.addressRepository
        .createQueryBuilder('address')
        .select('DISTINCT address.county', 'county')
        .where({
          addressable_type: PolymorphicType.CRM_CONTACTS_DONORS,
          tenant_id: queryParams.tenant_id,
        })
        .getRawMany();
      return {
        status: HttpStatus.OK,
        response: 'Donors Seed Data Fetched.',
        data: {
          cities: cities || [],
          states: states || [],
          counties: counties || [],
          tenant_id: queryParams.tenant_id,
        },
      };
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
