import { ExportService } from './../../common/exportData.service';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, ILike, Not, Brackets, In } from 'typeorm';
import { OrderByConstants } from 'src/api/system-configuration/constants/order-by.constants';
import { HistoryService } from 'src/api/common/services/history.service';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { resError } from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { Contacts } from '../../common/entities/contacts.entity';
import { CommonFunction } from '../../common/common-functions';
import { AddressService } from '../../common/address.service';
import { ContactsService } from '../../common/contacts.service';
import { CRMVolunteerHistory } from '../entities/crm-volunteer-history.entity';
import { CRMVolunteer } from '../entities/crm-volunteer.entity';
import {
  CreateCRMVolunteerDto,
  UpdateCRMVolunteerDto,
} from '../dto/create-crm-volunteer.dto';
import {
  GetAllCRMVolunteerFilteredInterface,
  GetAllCRMVolunteerInterface,
} from '../interface/crm-volunteer.interface';
import { Prefixes } from '../../common/prefixes/entities/prefixes.entity';
import { Suffixes } from '../../common/suffixes/entities/suffixes.entity';
import { ContactTypeEnum } from '../../common/enums';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { saveCustomFields } from 'src/api/common/services/saveCustomFields.service';
import { CustomFields } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-field.entity';
import { CreateCRMVolunteerActivityLog } from '../dto/create-activity-log.dto';
import { CRMVolunteerActivityLog } from '../entities/crm-volunteer-activity-log.entity';
import { GetAllCRMVolunteerActivityLogInterface } from '../interface/crm-volunteer-activity-log.interface';
import { AccountContacts } from 'src/api/crm/accounts/entities/accounts-contacts.entity';
import { CrmLocations } from 'src/api/crm/locations/entities/crm-locations.entity';
import { CrmLocationsHistory } from 'src/api/crm/locations/entities/crm-locations-history';
import { SiteContactAssociations } from '../../staff/staffContactAssociation/entities/site-contact-associations.entity';
import { constants } from 'fs';
import moment from 'moment';
import { organizationalLevelWhere } from 'src/api/common/services/organization.service';
import { getRawCount } from 'src/api/common/utils/query';
import { UserRequest } from 'src/common/interface/request';
import { REQUEST } from '@nestjs/core';
import { GetAllAccountsInterface } from 'src/api/crm/accounts/interface/accounts.interface';
import { VolunteerListView } from '../entities/crm-volunteer-list-view.entity';
import { distinct } from 'rxjs';
import { ContactPreferences } from '../../common/contact-preferences/entities/contact-preferences';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { getTenantData, createDSContact } from 'src/api/common/services/dailyStory.service';
import { decryptSecretKey } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/utils/encryption';
@Injectable()
export class CRMVolunteerService extends HistoryService<CRMVolunteerHistory> {
  private message = 'CRM Volunteer';
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(CRMVolunteer)
    private entityRepository: Repository<CRMVolunteer>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Contacts)
    private contactsRepository: Repository<Contacts>,
    @InjectRepository(CRMVolunteerHistory)
    private readonly entityHistoryRepository: Repository<CRMVolunteerHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Prefixes)
    private readonly prefixesRepository: Repository<Prefixes>,
    @InjectRepository(CRMVolunteerActivityLog)
    private readonly activityLogRepository: Repository<CRMVolunteerActivityLog>,
    @InjectRepository(Suffixes)
    private readonly suffixesRepository: Repository<Suffixes>,
    @InjectRepository(CustomFields)
    private readonly customFieldsRepository: Repository<CustomFields>,
    @InjectRepository(AccountContacts)
    private readonly accountContactRepository: Repository<AccountContacts>,
    @InjectRepository(CrmLocations)
    private readonly crmLocationsRepository: Repository<CrmLocations>,
    @InjectRepository(ContactPreferences)
    private readonly contactPreferencesRepository: Repository<ContactPreferences>,
    @InjectRepository(CrmLocationsHistory)
    private readonly crmLocationsHistoryRepository: Repository<CrmLocationsHistory>,
    @InjectRepository(SiteContactAssociations)
    private readonly siteContactAssociationRepository: Repository<SiteContactAssociations>,
    @InjectRepository(VolunteerListView)
    private readonly viewVoluteersRepository: Repository<VolunteerListView>,
	@InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly exportService: ExportService,
    private readonly commonFunction: CommonFunction,
    private readonly entityManager: EntityManager,
    private readonly addressService: AddressService,
    private readonly contactsService: ContactsService
  ) {
    super(entityHistoryRepository);
  }

	/**
		* create new entity
		* @param createDto
		* @returns
		*/
	async create(createdDto: CreateCRMVolunteerDto, reqUser: User) {
		const queryRunner = this.entityManager.connection.createQueryRunner();
		try {

			const {contact} = createdDto;
			await queryRunner.connect();
			await queryRunner.startTransaction();

      await this.commonFunction.entityExist(
        this.userRepository,
        { where: { id: createdDto?.created_by } },
        'User'
      );

      const user = await this.commonFunction.entityExist(
        this.userRepository,
        { where: { id: createdDto?.created_by } },
        'User'
      );
      if (createdDto.prefix_id) {
        await this.commonFunction.entityExist(
          this.prefixesRepository,
          { where: { id: createdDto?.prefix_id } },
          'Prefixes'
        );
      }
      if (createdDto.suffix_id) {
        await this.commonFunction.entityExist(
          this.suffixesRepository,
          { where: { id: createdDto?.suffix_id } },
          'Suffixes'
        );
      }

      const { address, ...createDto } = createdDto;

      const create = new CRMVolunteer();
      const keys = Object.keys(createDto);
      //set values in create obj
      for (const key of keys) {
        create[key] = createDto?.[key];
      }
      // Save entity
      const saveObj = await queryRunner.manager.save(create);

			const tenantData = await getTenantData(this.request?.user?.tenant_id,this.tenantRepository)
			const token = decryptSecretKey(tenantData?.data?.dailystory_token);
			
			const dailyStoryContact = await createDSContact(contact[1]?.data,saveObj?.first_name,saveObj?.last_name, contact[0]?.data,saveObj?.id,'volunteer',token,
			saveObj?.contact_uuid
			)
	  
			 const dailyStoryContactId = dailyStoryContact?.Response?.id
	  	  
			 saveObj.dsid = dailyStoryContactId;
			 await queryRunner.manager.save(saveObj)

			const volunteerCustomFieds = [];
			await saveCustomFields(
				this.customFieldsRepository,
				queryRunner,
				saveObj,
				user,
				reqUser?.tenant,
				createDto,
				volunteerCustomFieds
			);

      address.addressable_id = saveObj.id;
      address.created_by = createdDto?.created_by;
      address.tenant_id = createdDto?.tenant_id;
      address.coordinates = `(${createdDto?.address?.latitude}, ${createdDto?.address?.longitude})`;
      await this.addressService.createAddress(address);
      await this.contactsService.createContacts(createdDto, saveObj.id);
      const contactPref = new ContactPreferences();

      contactPref.contact_preferenceable_id = saveObj.id;
      contactPref.contact_preferenceable_type =
        PolymorphicType.CRM_CONTACTS_VOLUNTEERS as any;
      contactPref.is_optout_email = false;
      contactPref.is_optout_sms = false;
      contactPref.is_optout_push = false;
      contactPref.is_optout_call = false;
      contactPref.tenant = reqUser?.tenant;
      contactPref.created_by = user;


      await queryRunner.manager.save(contactPref);

      await queryRunner.commitTransaction();

      return {
        status: HttpStatus.CREATED,
        message: `${this.message} Created Successfully`,
        data: saveObj,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * update record
   * insert data in history table
   * @param id
   * @param updateDto
   * @returns
   */
  async update(id: any, updatedDto: UpdateCRMVolunteerDto, myUser: User) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const { address, ...updateDto } = updatedDto;

      const user = await this.commonFunction.entityExist(
        this.userRepository,
        { where: { id: updatedDto?.created_by } },
        'User'
      );

      const entity = await this.commonFunction.entityExist(
        this.entityRepository,
        {
          where: { id, is_archived: false },
          relations: ['created_by', 'tenant'],
        },
        this.message
      );

      const volunteerCustomFileds = [];
      await saveCustomFields(
        this.customFieldsRepository,
        queryRunner,
        entity,
        myUser,
        myUser.tenant,
        updatedDto,
        volunteerCustomFileds
      );

      Object.assign(entity, updateDto);
      entity.created_at = new Date();
      entity.created_by = this.request?.user;
      const updatedData: any = await this.entityRepository.save(entity);
      const { created_by, tenant, custom_fields, ...rest } = updatedData;
      address.created_by = updateDto?.created_by;
      address.tenant_id = updateDto?.tenant_id;
      address.coordinates = `(${updatedDto?.address?.latitude}, ${updatedDto?.address?.longitude})`;
      address.created_at = new Date();
      address.created_by = this.request?.user;
      await this.addressService.updateAddress(address);

      await this.contactsService.updateContacts(
        id,
        updatedDto,
        PolymorphicType.CRM_CONTACTS_VOLUNTEERS
      );
      await queryRunner.commitTransaction();

      return {
        status: HttpStatus.CREATED,
        message: `${this.message} Update Successfully`,
        data: { ...rest },
      };
    } catch (error) {
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

      const inUse = await this.accountContactRepository.findOne({
        where: { record_id:  id , is_archived: false },
      });

      if (inUse)
        return resError(
          'Currently in use by drive',
          'volunteer_in_use',
          HttpStatus.BAD_REQUEST
        );

      await this.entityRepository.update({ id: id }, { is_archived: true });

      return {
        status: HttpStatus.NO_CONTENT,
        message: `${this.message} Archive Successfully`,
        data: null,
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
  async findOne(id: any, uuid?: string) {
    try {
      const query = Object.assign(
        {},
        {
          relations: ['created_by', 'tenant', 'prefix_id', 'suffix_id'],
          where: {
            ...(id ? { id } : {}),
            ...(uuid ? { contact_uuid: uuid } : {}),
            is_archived: false,
          },
        }
      );
      const entity: any = await this.commonFunction.entityExist(
        this.entityRepository,
        query,
        this.message
      );
      const data = await this.commonFunction.createObj(
        PolymorphicType.CRM_CONTACTS_VOLUNTEERS,
        entity
      );
      // const modifiedData: any = await getModifiedDataDetails(
      // this.entityHistoryRepository,
      // id,
      // this.userRepository
      // );
      if (entity) {
        const modifiedData: any = await getModifiedDataDetails(
          this.entityHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        entity.modified_by = modified_by?.created_by;
        entity.modified_at = entity?.created_at;
        entity.created_at = modified_at ? modified_at : entity?.created_at;
      }
      return {
        status: HttpStatus.OK,
        message: `${this.message} fetched successfully.`,
        data: { ...entity },
      };
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< CRM volunteer find one >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log(error);
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * fetch single record
   * @param id
   * @returns {object}
   */
  async findServiceHistory(id: any) {
    try {
      const andWhere: any = {
        record_id: { id: id },
      };
      const accountContacts = await this.accountContactRepository.find({
        where: {
          is_archived: false,
          ...andWhere,
          contactable_type: PolymorphicType.CRM_ACCOUNTS,
        },
        relations: ['role_id', 'record_id', 'contactable_id'],
      });
      const extractAccountData = accountContacts?.map((item) => {
        const contactableData = item.contactable_id as any;
        const roleAbleData = item.role_id as any;

        return {
          item_id: contactableData?.id,
          item_type: 'accounts',
          account_name: contactableData?.name,
          role_name: roleAbleData?.name,
          start_date: item.created_at,
          closeout_date: item?.closeout_date,
          created_at: item?.created_at,
          tenant_id: contactableData?.tenant_id,
        };
      });

      const locationQuery = this.siteContactAssociationRepository
        .createQueryBuilder('associations')
        .leftJoinAndSelect(
          'crm_locations',
          'location',
          `associations.location_id = location.id`
        )
        .leftJoinAndSelect(
          'crm_volunteer',
          'contact',
          `contact.id = associations.volunteer_id`
        )
        .where({
          volunteer_id: { id: id },
          is_archived: false,
        })
        .select([
          'location.id AS item_id',
          "'locations' as item_type",
          "concat(location.name, ' ', location.room) AS account_name",
          'location.name as account_name  ',
          "concat(contact.first_name, ' ', contact.last_name) AS role_name",
          'associations.start_date as start_date',
          'associations.closeout_date as closeout_date',
          'associations.created_at AS created_at',
          'location.tenant_id AS tenant_id',
        ]);
      const extractLocationData = await locationQuery.getRawMany();

      const combinedData = extractAccountData
        .concat(extractLocationData)
        .sort((a: any, b: any) => b.created_at - a.created_at);

      return {
        status: HttpStatus.OK,
        response: 'Service History fetched successfully.',
        data: combinedData,
      };
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< CRM volunteer find one >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log(error);
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * get all records
   * @param getAllInterface
   * @returns {objects}
   * @deprecated
   */
  async findAll(getAllInterface: GetAllCRMVolunteerInterface) {
    try {
      const {
        name,
        limit = parseInt(process.env.PAGE_SIZE),
        page = 1,
        sortBy = 'id',
        sortOrder = OrderByConstants.DESC,
        tenant_id,
        fetchAll,
        city,
        state,
        status,
      } = getAllInterface;
      const { skip, take } = this.commonFunction.pagination(limit, page);
      const order = { [sortBy]: sortOrder };

      const where = {
        is_archived: false,
      };

      Object.assign(where, {
        tenant: { id: tenant_id },
      });

      if (name) {
        Object.assign(where, {
          first_name: ILike(`%${name}%`),
        });
      }
      if (city) {
        Object.assign(where, {
          city: ILike(`%${city}%`),
        });
      }
      if (status) {
        Object.assign(where, {
          is_active: status,
        });
      }
      if (state) {
        Object.assign(where, {
          state: state,
        });
      }

      let data: any;
      let count: any;
      if (!fetchAll) {
        [data, count] = await this.entityRepository.findAndCount({
          relations: ['created_by', 'tenant', 'prefix_id', 'suffix_id'],
          where,
          skip,
          take,
          order,
        });
      } else {
        [data, count] = await this.entityRepository.findAndCount({
          relations: ['created_by', 'tenant', 'prefix_id', 'suffix_id'],
          where,
          order,
        });
      }

      const entities = [];
      for (const entity of data) {
        const dataObj = await this.commonFunction.createObj(
          PolymorphicType.CRM_CONTACTS_VOLUNTEERS,
          entity
        );
        entities.push(dataObj);
      }
      return {
        status: HttpStatus.OK,
        message: `${this.message} fetched successfully`,
        count: count,
        data: entities,
      };
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< CRM volunteer find all >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log(error);
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * get all records
   * @param getAllInterface
   * @returns {objects}
   */
  async findAllFiltered(getAllInterface: GetAllCRMVolunteerFilteredInterface) {
    try {
      const {
        name,
        limit = parseInt(process.env.PAGE_SIZE),
        page = 1,
        min_updated_at,
        fetchAll = false,
      } = getAllInterface;
      let { sortBy, sortOrder } = getAllInterface;
      const { onlyCurrentUser } = getAllInterface;
      let volunteerQuery = this.entityRepository
        .createQueryBuilder('volunteer')
        .leftJoinAndSelect(
          'address',
          'address',
          `address.addressable_id = volunteer.id AND (address.addressable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}')`
        )
        .leftJoinAndSelect(
          'contacts',
          'phone',
          `phone.contactable_id = volunteer.id AND (phone.is_primary = true AND phone.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND phone.contact_type >= '${ContactTypeEnum.WORK_PHONE}' AND phone.contact_type <= '${ContactTypeEnum.OTHER_PHONE}')`
        )
        .leftJoinAndSelect(
          'contacts',
          'email',
          `email.contactable_id = volunteer.id AND (email.is_primary = true AND email.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND email.contact_type >= '${ContactTypeEnum.WORK_EMAIL}' AND email.contact_type <= '${ContactTypeEnum.OTHER_EMAIL}')`
        )
        .leftJoinAndSelect('volunteer.created_by', 'created_by')
        .where({
          is_archived: false,
          tenant: { id: getAllInterface['tenant_id'] },
        })
        .select([
          'volunteer.id AS volunteer_id',
          'volunteer.tenant_id as tenant_id',
          'volunteer.nick_name AS nick_name',
          "concat(volunteer.first_name, ' ', volunteer.last_name) AS name",
          'volunteer.first_name AS first_name',
          'volunteer.last_name AS last_name',
          'volunteer.birth_date AS birth_date',
          'volunteer.is_active AS status',
          'address.city AS address_city',
          'address.state AS address_state',
          'address.county AS address_county',
          'phone.data AS primary_phone',
          'email.data AS primary_email',
          'volunteer.is_archived',
          'volunteer.contact_uuid as contact_uuid',
          'created_by.id as created_by_id',
          'volunteer.title AS title',
          'volunteer.birth_date AS birth_date',
          'volunteer.employee AS employee',
          "concat(address.address1, ' ', address.address2) AS mailing_address",
          'address.zip_code AS zip_code',
        ]);

      const exportQuery = volunteerQuery.clone();
      if (getAllInterface?.status)
        volunteerQuery = volunteerQuery.andWhere({
          is_active: getAllInterface.status,
        });
      if (getAllInterface?.city) {
        const cities = getAllInterface.city.split(',');
        volunteerQuery = volunteerQuery.andWhere(
          `address.city ILIKE ANY(:cities)`,
          {
            cities: cities.map((city) => `%${city.trim()}%`),
          }
        );
      }
      if (getAllInterface?.state) {
        const states = getAllInterface.state.split(',');
        volunteerQuery = volunteerQuery.andWhere(
          `address.state ILIKE ANY(:states)`,
          {
            states: states.map((state) => `%${state.trim()}%`),
          }
        );
      }
      if (getAllInterface?.county) {
        const counties = getAllInterface.county.split(',');

        volunteerQuery = volunteerQuery.andWhere(
          'address.county ILIKE ANY(:counties)',
          {
            counties: counties.map((county) => `%${county.trim()}%`),
          }
        );
      }
      if (getAllInterface?.account) {
        volunteerQuery = volunteerQuery.andWhere(
          `volunteer.id IN (SELECT DISTINCT record_id FROM account_contacts WHERE contactable_id = :account_id AND contactable_type = '${PolymorphicType.CRM_ACCOUNTS}')`,
          {
            account_id: getAllInterface?.account,
          }
        );
      }
      if (getAllInterface?.organizational_levels) {
        volunteerQuery
          .leftJoin(
            'account_contacts',
            'ac',
            'ac.record_id = volunteer.id AND ac.is_archived = false'
          )
          .leftJoin(
            'accounts',
            'acc',
            'ac.contactable_id = acc.id AND acc.is_archived = false'
          )
          .addSelect(['acc.collection_operation', 'acc.recruiter'])
          .andWhere(
            organizationalLevelWhere(
              getAllInterface.organizational_levels,
              'acc.collection_operation',
              'acc.recruiter'
            )
          );
      }
      if (onlyCurrentUser) {
        volunteerQuery = volunteerQuery.andWhere(`created_by.id = :userId`, {
          userId: getAllInterface['user_id'],
        });
      }
      if (name) {
        volunteerQuery = volunteerQuery.andWhere(
          `concat(volunteer.first_name, ' ', volunteer.last_name) ILIKE :name`,
          {
            name: `%${name}%`,
          }
        );
      }

      if (sortBy === 'first_name') {
        sortBy = `concat(volunteer.first_name, ' ', volunteer.last_name)`;
      } else if (sortBy === 'is_active') {
        sortBy = 'status';
      } else if (!sortBy) {
        sortBy = `volunteer.last_name`;
      }

      sortOrder = sortOrder
        ? (sortOrder.toUpperCase() as 'ASC' | 'DESC')
        : 'DESC';
      if (min_updated_at) {
        volunteerQuery = volunteerQuery.andWhere(
          `volunteer.created_at > :min_updated_at `,
          {
            min_updated_at,
          }
        );
      }

      // console.log(
      // volunteerQuery
      // .orderBy(sortBy, sortOrder)
      // .limit(fetchAll ? undefined : limit)
      // .offset((page - 1) * limit)
      // .getQuery()
      // );

      const [count, records] = await Promise.all([
        getRawCount(this.entityManager, volunteerQuery),
        volunteerQuery
          .orderBy(sortBy, sortOrder, 'NULLS LAST')
          .limit(fetchAll ? undefined : limit)
          .offset((page - 1) * limit)
          .getRawMany(),
      ]);

      let url;
      if (getAllInterface?.exportType && getAllInterface.downloadType) {
        const volunteerExportQuery =
          getAllInterface?.exportType.trim() === 'filtered'
            ? volunteerQuery
            : exportQuery;
        const exportData = await volunteerExportQuery
          .orderBy(sortBy, sortOrder)
          .limit(undefined)
          .offset(undefined)
          .getRawMany();
        const columnsToFilter = new Set(
          getAllInterface.tableHeaders.split(',')
        );
        const filteredData = exportData.map((obj) => {
          const newObj = {};
          columnsToFilter.forEach((key) => {
            const nameKey = key === 'is_active' ? 'status' : key;
            const value =
              nameKey === 'status'
                ? obj[nameKey]
                  ? 'Active'
                  : 'Inactive'
                : obj[nameKey];
            const name =
              nameKey === 'address_city'
                ? 'city'
                : nameKey === 'address_state'
                ? 'state'
                : nameKey;
            newObj[name] = value;
          });
          return newObj;
        });
        const prefixName = getAllInterface?.selectedOptions
          ? getAllInterface?.selectedOptions.trim()
          : 'Volunteer';
        url = await this.exportService.exportDataToS3(
          filteredData,
          getAllInterface,
          prefixName,
          'Volunteer'
        );
      }

      return {
        status: HttpStatus.OK,
        message: `${this.message} fetched successfully.`,
        count,
        searchText: name,
        data: records,
        url,
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

  /**
   * get all records
   * @param getAllInterface
   * @returns {objects}
   */
  async findAllFilteredNew(
    getAllInterface: GetAllCRMVolunteerFilteredInterface
  ) {
    try {
      const {
        name,
        limit = parseInt(process.env.PAGE_SIZE),
        page = 1,
        min_updated_at,
        fetchAll = false,
      } = getAllInterface;
      let { sortBy, sortOrder } = getAllInterface;
      const { onlyCurrentUser } = getAllInterface;
      let volunteerQuery = this.viewVoluteersRepository
        .createQueryBuilder('volunteers_list_view')
        .distinct(true)
        .select([
          'volunteers_list_view.volunteer_id',
          'volunteers_list_view.nick_name',
          'volunteers_list_view.first_name',
          'volunteers_list_view.last_name',
          'volunteers_list_view.name',
          'volunteers_list_view.status',
          'volunteers_list_view.address_city',
          'volunteers_list_view.address_state',
          'volunteers_list_view.address_county',
          'volunteers_list_view.primary_phone',
          'volunteers_list_view.primary_email',
          'volunteers_list_view.status',
          'volunteers_list_view.tenant_id',
        ])
        .where({
          is_archived: false,
          tenant_id: getAllInterface['tenant_id'],
        });

      let exportQuery;
      const isFetchAll = fetchAll ? fetchAll.trim() === 'true' : false;
      if (isFetchAll) {
        exportQuery = volunteerQuery.clone();
      }

      /**
       * Filter By : Status
       */
      if (getAllInterface?.status !== undefined) {
        volunteerQuery = volunteerQuery.andWhere(
          'volunteers_list_view.status = :status',
          {
            status: getAllInterface.status,
          }
        );
      }

      /**
       * Filter By : city
       */
      if (getAllInterface?.city) {
        const cities = getAllInterface.city.split(',');
        volunteerQuery = volunteerQuery.andWhere(
          `volunteers_list_view.address_city ILIKE ANY(:cities)`,
          {
            cities: cities.map((city) => `%${city.trim()}%`),
          }
        );
      }

      /**
       * Filter By : state
       */
      if (getAllInterface?.state) {
        const states = getAllInterface.state.split(',');
        volunteerQuery = volunteerQuery.andWhere(
          `volunteers_list_view.address_state ILIKE ANY(:states)`,
          {
            states: states.map((state) => `%${state.trim()}%`),
          }
        );
      }

      /**
       * Filter By : county
       */
      if (getAllInterface?.county) {
        const counties = getAllInterface.county.split(',');
        volunteerQuery = volunteerQuery.andWhere(
          'volunteers_list_view.address_county ILIKE ANY(:counties)',
          {
            counties: counties.map((county) => `%${county.trim()}%`),
          }
        );
      }

      /**
       * Filter By : created_by
       */
      if (onlyCurrentUser) {
        volunteerQuery = volunteerQuery.andWhere(
          `volunteers_list_view.created_by = :userId`,
          {
            userId: getAllInterface['user_id'],
          }
        );
      }

      /**
       * Filter By : Name
       */
      if (name) {
        volunteerQuery = volunteerQuery.andWhere(
          `volunteers_list_view.name ILIKE :data`,
          {
            data: `%${name}%`,
          }
        );
      }

      /**
       * Filter By : account
       */
      if (getAllInterface?.account) {
        volunteerQuery = volunteerQuery.andWhere(
          `volunteers_list_view.account_contacts_able_id = :account_id AND volunteers_list_view.account_contacts_able_type = '${PolymorphicType.CRM_ACCOUNTS}')`,
          {
            account_id: getAllInterface?.account,
          }
        );
      }

      /**
       * Filter By : organizational_levels
       */
      if (getAllInterface?.organizational_levels) {
        volunteerQuery.andWhere(
          organizationalLevelWhere(
            getAllInterface.organizational_levels,
            'volunteers_list_view.collection_operation',
            'volunteers_list_view.recruiter'
          )
        );
      }

      if (!sortBy) {
        sortBy = 'volunteers_list_view.volunteer_id';
      }

      sortOrder = sortOrder
        ? (sortOrder.toUpperCase() as 'ASC' | 'DESC')
        : 'DESC';

      // if (min_updated_at) {
      //   volunteerQuery = volunteerQuery.andWhere(
      //     `volunteers_list_view.updated_at > :min_updated_at `,
      //     {
      //       min_updated_at,
      //     }
      //   );
      // }

      // Pagination
      let count = await getRawCount(this.entityManager, volunteerQuery);

      if (page && limit) {
        volunteerQuery.limit(limit).offset((page - 1) * limit);
      }

      volunteerQuery.orderBy(sortBy, sortOrder);
      let records = await volunteerQuery.getMany();

      let url;
      if (getAllInterface?.exportType && getAllInterface.downloadType) {
        let exportData;

        if (getAllInterface?.exportType.trim() !== 'filtered') {
          exportData = await exportQuery.orderBy(sortBy, sortOrder).getMany();
        } else {
          exportData = records;
        }

        const columnsToFilter = new Set(
          getAllInterface.tableHeaders.split(',')
        );

        const filteredData = exportData.map((obj) => {
          const newObj = {};
          columnsToFilter.forEach((key) => {
            const nameKey = key === 'is_active' ? 'status' : key;
            const value =
              nameKey === 'status'
                ? obj[nameKey]
                  ? 'Active'
                  : 'Inactive'
                : obj[nameKey];
            const name =
              nameKey === 'address_city'
                ? 'city'
                : nameKey === 'address_state'
                ? 'state'
                : nameKey;
            newObj[name] = value;
          });
          return newObj;
        });
        const prefixName = getAllInterface?.selectedOptions
          ? getAllInterface?.selectedOptions.trim()
          : 'Volunteer';
        url = await this.exportService.exportDataToS3(
          filteredData,
          getAllInterface,
          prefixName,
          'Volunteer'
        );
      }

      return {
        status: HttpStatus.OK,
        message: `${this.message} fetched successfully.`,
        count,
        searchText: name,
        data: records,
        url,
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

  async getAllAccountContacts(
    getAllInterface: GetAllCRMVolunteerFilteredInterface
  ) {
    try {
      const {
        name,
        limit = parseInt(process.env.PAGE_SIZE),
        page = 1,
        onlyCurrentAccount,
        selectedContactsForAccount,
      } = getAllInterface;
      let volunteerQuery = this.entityRepository
        .createQueryBuilder('volunteer')
        .leftJoinAndSelect(
          'address',
          'address',
          `address.addressable_id = volunteer.id AND (address.addressable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}')`
        )
        .leftJoinAndSelect(
          'contacts',
          'phone',
          `phone.contactable_id = volunteer.id AND (phone.is_primary = true AND phone.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND phone.contact_type >= '${ContactTypeEnum.WORK_PHONE}' AND phone.contact_type <= '${ContactTypeEnum.OTHER_PHONE}')`
        )
        .leftJoinAndSelect(
          'contacts',
          'email',
          `email.contactable_id = volunteer.id AND (email.is_primary = true AND email.contactable_type = '${PolymorphicType.CRM_CONTACTS_VOLUNTEERS}' AND email.contact_type >= '${ContactTypeEnum.WORK_EMAIL}' AND email.contact_type <= '${ContactTypeEnum.OTHER_EMAIL}')`
        )
        .leftJoinAndSelect(
          'account_contacts',
          'account_contacts',
          `account_contacts.record_id = volunteer.id AND account_contacts.contactable_id = ${
            getAllInterface?.account
          } AND account_contacts.is_archived = false AND (account_contacts.closeout_date IS NULL OR account_contacts.closeout_date > '${moment(
            new Date()
          ).format('YYYY-MM-DD 00:00:00')}')`
        )
        .leftJoinAndSelect(
          'contacts_roles',
          'roles',
          `roles.id = account_contacts.role_id AND account_contacts.contactable_id = ${getAllInterface?.account} AND account_contacts.is_archived = false`
        )
        .where({
          is_archived: false,
          tenant: { id: getAllInterface['tenant_id'] },
        })
        .select([
          'DISTINCT volunteer.id AS volunteer_id',
          'volunteer.nick_name AS nick_name',
          "concat(volunteer.first_name, ' ', volunteer.last_name) AS name",
          'volunteer.last_name AS last_name',
          'volunteer.is_active AS status',
          'address.city AS address_city',
          'address.state AS address_state',
          'address.county AS address_county',
          'phone.data AS primary_phone',
          'email.data AS primary_email',
          'account_contacts.id AS account_contact_id',
          'account_contacts.is_archived AS is_archived',
          'roles.name  AS role_name',
          'roles.id AS role_id',
          'roles.is_primary_chairperson AS roles_is_primary_chairperson',
          'volunteer.tenant_id as tenant_id',
        ]);
      if (selectedContactsForAccount) {
        volunteerQuery = volunteerQuery.andWhere(
          `account_contacts.id IN (:...contactIds)`,
          {
            contactIds: selectedContactsForAccount.split(','),
          }
        );
      }
      if (getAllInterface?.account && onlyCurrentAccount) {
        volunteerQuery = volunteerQuery.andWhere(
          `volunteer.id IN (SELECT DISTINCT record_id FROM account_contacts WHERE contactable_id = :account_id AND contactable_type = '${
            PolymorphicType.CRM_ACCOUNTS
          }' AND account_contacts.is_archived = false AND (account_contacts.closeout_date IS NULL OR account_contacts.closeout_date > '${moment(
            new Date()
          ).format('YYYY-MM-DD 00:00:00')}'))`,
          {
            account_id: getAllInterface?.account,
          }
        );
      }
      if (name) {
        volunteerQuery = volunteerQuery.andWhere(
          `concat(volunteer.first_name, ' ', volunteer.last_name) ILIKE :name`,
          {
            name: `%${name}%`,
          }
        );
      }
      const count = await volunteerQuery.getCount();
      const records = await volunteerQuery
        .offset((page - 1) * limit)
        .limit(limit)
        .orderBy('volunteer.last_name', 'ASC')
        .getRawMany();
      return {
        status: HttpStatus.OK,
        message: `${this.message} fetched successfully.`,
        count,
        data: records,
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

  async createActivityLog(
    id: any,
    createdActivityDto: CreateCRMVolunteerActivityLog,
    user: any
  ) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      const { activity_title, name, date } = createdActivityDto;

      await queryRunner.connect();
      await queryRunner.startTransaction();

      const userFound = await this.commonFunction.entityExist(
        this.userRepository,
        { where: { id: user?.id } },
        'User'
      );

      if (!userFound) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const entity = await this.commonFunction.entityExist(
        this.entityRepository,
        {
          where: { id },
        },
        this.message
      );

      if (!entity) {
        return resError(
          `Volunteer data not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const createActivity = new CRMVolunteerActivityLog();
      createActivity.volunteer_id = id;
      createActivity.activity_title = activity_title;
      createActivity.name = name;
      createActivity.date = date;
      createActivity.created_by = userFound;
      const saveObj = await queryRunner.manager.save(createActivity);
      await queryRunner.commitTransaction();

      return {
        status: HttpStatus.CREATED,
        message: `Activity Log Created Successfully`,
        data: saveObj,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async findAllActivity(
    id: any,
    getAllInterface: GetAllCRMVolunteerActivityLogInterface
  ) {
    try {
      const {
        limit = parseInt(process.env.PAGE_SIZE),
        page = 1,
        sortBy = 'id',
        sortOrder = OrderByConstants.DESC,
        fetchAll,
      } = getAllInterface;
      const { skip, take } = this.commonFunction.pagination(limit, page);
      const order = { [sortBy]: sortOrder };
      let pagination = {};
      if (!fetchAll) {
        pagination = {
          skip,
          take,
        };
      }
      const [data, count] = await this.activityLogRepository.findAndCount({
        relations: ['created_by'],
        where: {
          volunteer_id: id,
        },
        ...pagination,
        order,
      });

      return {
        status: HttpStatus.OK,
        message: `Activity Logs fetched successfully`,
        count: count,
        data: data,
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
  async getVolunteerSeedData(user: any, queryParams: GetAllAccountsInterface) {
    try {
      const cities: any = await this.addressRepository
        .createQueryBuilder('address')
        .select([
          'DISTINCT address.city as city, address.tenant_id as tenant_id',
        ])
        .where({
          addressable_type: PolymorphicType.CRM_CONTACTS_VOLUNTEERS,
          tenant: { id: queryParams.tenant_id },
        })
        .getRawMany();

      const county: any = await this.addressRepository
        .createQueryBuilder('address')
        .select([
          'DISTINCT address.county as county, address.tenant_id as tenant_id',
        ])
        .where({
          addressable_type: PolymorphicType.CRM_CONTACTS_VOLUNTEERS,
          tenant: { id: queryParams.tenant_id },
        })
        .getRawMany();
      const states: any = await this.addressRepository
        .createQueryBuilder('address')
        .select([
          'DISTINCT address.state as state, address.tenant_id as tenant_id',
        ])
        .where({
          addressable_type: PolymorphicType.CRM_CONTACTS_VOLUNTEERS,
          tenant: { id: queryParams.tenant_id },
        })
        .getRawMany();
      return {
        status: HttpStatus.OK,
        response: 'Volunteer Seed Data Fetched.',
        data: {
          county: county || [],
          cities: cities || [],
          states: states || [],
          tenant_id: queryParams.tenant_id,
        },
      };
    } catch (error) {
      console.log(`Exception occured: ${error}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
