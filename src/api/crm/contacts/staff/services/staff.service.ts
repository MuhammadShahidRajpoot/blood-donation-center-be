import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, ILike, In } from 'typeorm';
import { StaffHistory } from '../entities/staff-history.entity';
import { OrderByConstants } from 'src/api/system-configuration/constants/order-by.constants';
import { HistoryService } from 'src/api/common/services/history.service';
import {
  AssignStaffMembersDto,
  AssignStaffPrimaryTeam,
  CreateStaffDto,
  UpdateStaffDto,
} from '../dto/create-staff.dto';
import { Staff } from '../entities/staff.entity';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import {
  GetAllStaffFilteredInterface,
  GetAllStaffInterface,
} from '../interface/staff.interface';
import { CommonFunction } from '../../common/common-functions';
import { AddressService } from '../../common/address.service';
import { ContactsService } from '../../common/contacts.service';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { StaffingClassification } from 'src/api/system-configuration/tenants-administration/staffing-administration/classifications/entity/classification.entity';
import { TeamStaff } from 'src/api/system-configuration/tenants-administration/staffing-administration/teams/entity/team-staff.entiity';
import { Team } from 'src/api/system-configuration/tenants-administration/staffing-administration/teams/entity/team.entity';
import { ContactTypeEnum } from '../../common/enums';
import { Prefixes } from '../../common/prefixes/entities/prefixes.entity';
import { Suffixes } from '../../common/suffixes/entities/suffixes.entity';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { StaffRolesMapping } from '../staffRolesMapping/entities/staff-roles-mapping.entity';
import { ExportService } from '../../common/exportData.service';
import { saveCustomFields } from 'src/api/common/services/saveCustomFields.service';
import { CustomFields } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-field.entity';
import { StaffClassification } from '../staffClassification/entity/staff-classification.entity';
import { StaffDonorCentersMapping } from '../staffDonorCentersMapping/entities/staff-donor-centers-mapping.entity';
import { StaffCertification } from 'src/api/system-configuration/tenants-administration/staffing-administration/certification/entity/staff-certification.entity';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { UserRequest } from 'src/common/interface/request';
import { REQUEST } from '@nestjs/core';
import { GetAllAccountsInterface } from 'src/api/crm/accounts/interface/accounts.interface';
import { Address } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/address.entity';
import { UserBusinessUnits } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user-business-units.entity';
import { CallJobsAgents } from 'src/api/call-center/call-schedule/call-jobs/entities/call-jobs-agents.entity';
import { StaffListView } from '../entities/staff-list-view.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import {
  createDSContact,
  getTenantData,
} from 'src/api/common/services/dailyStory.service';
import { decryptSecretKey } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/utils/encryption';
@Injectable()
export class StaffService extends HistoryService<StaffHistory> {
  private message = 'Staff';
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Staff)
    private entityRepository: Repository<Staff>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(BusinessUnits)
    private businessUnitsRepository: Repository<BusinessUnits>,
    @InjectRepository(StaffingClassification)
    private staffingClassificationRepository: Repository<StaffingClassification>,
    @InjectRepository(StaffHistory)
    private readonly entityHistoryRepository: Repository<StaffHistory>,
    @InjectRepository(StaffRolesMapping)
    private readonly staffRolesRepository: Repository<StaffRolesMapping>,
    @InjectRepository(StaffDonorCentersMapping)
    private readonly staffDonorCentersRepository: Repository<StaffDonorCentersMapping>,
    @InjectRepository(StaffCertification)
    private readonly staffCertificationsRepository: Repository<StaffCertification>,
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
    @InjectRepository(TeamStaff)
    private readonly teamStaffRepository: Repository<TeamStaff>,
    @InjectRepository(Prefixes)
    private readonly prefixesRepository: Repository<Prefixes>,
    @InjectRepository(Suffixes)
    private readonly suffixesRepository: Repository<Suffixes>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserBusinessUnits)
    private readonly userBusinessUnits: Repository<UserBusinessUnits>,
    @InjectRepository(CustomFields)
    private readonly customFieldsRepository: Repository<CustomFields>,
    @InjectRepository(StaffListView)
    private readonly viewStaffRepository: Repository<StaffListView>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly commonFunction: CommonFunction,
    private readonly entityManager: EntityManager,
    private readonly addressService: AddressService,
    private readonly contactsService: ContactsService,
    private readonly exportService: ExportService
  ) {
    super(entityHistoryRepository);
  }

  /**
   * create new entity
   * @param createDto
   * @returns
   */
  async create(createdDto: CreateStaffDto, user: User) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await this.commonFunction.entityExist(
        this.userRepository,
        { where: { id: createdDto?.created_by } },
        'User'
      );

      await this.commonFunction.entityExist(
        this.businessUnitsRepository,
        { where: { id: createdDto?.collection_operation_id } },
        'Collection Operation'
      );
      await this.commonFunction.entityExist(
        this.staffingClassificationRepository,
        { where: { id: createdDto?.classification_id } },
        'Staff Classification'
      );

      if (createdDto.prefix) {
        await this.commonFunction.entityExist(
          this.prefixesRepository,
          { where: { id: createdDto?.prefix } },
          'Prefixes'
        );
      }
      if (createdDto.suffix) {
        await this.commonFunction.entityExist(
          this.suffixesRepository,
          { where: { id: createdDto?.suffix } },
          'Suffixes'
        );
      }

      const { address, contact, ...createDto } = createdDto;
      const create = new Staff();
      const keys = Object.keys(createDto);
      //set values in create obj
      for (const key of keys) {
        create[key] = createDto?.[key];
      }
      // Save entity
      const saveObj = await queryRunner.manager.save(create);

      const tenantData = await getTenantData(
        this.request?.user?.tenant_id,
        this.tenantRepository
      );
      const token = decryptSecretKey(tenantData?.data?.dailystory_token);

      const dailyStoryContact = await createDSContact(
        contact[1]?.data,
        saveObj?.first_name,
        saveObj?.last_name,
        contact[0]?.data,
        saveObj?.id,
        'staff',
        token,
        saveObj?.contact_uuid
      );

      const dailyStoryContactId = dailyStoryContact?.Response?.id;

      saveObj.dsid = dailyStoryContactId;
      await queryRunner.manager.save(saveObj);

      if (createdDto?.classification_id) {
        const staffingClassification =
          await this.staffingClassificationRepository.findOne({
            where: { id: createdDto?.classification_id, is_archived: false },
            relations: ['staffing_classification_setting'],
          });

        if (staffingClassification?.staffing_classification_setting?.length) {
          const staffClassificationSetting =
            staffingClassification?.staffing_classification_setting[0];
          const staffClassification = new StaffClassification();
          staffClassification.staff_id = saveObj;
          staffClassification.staffing_classification_id =
            staffingClassification;
          staffClassification.target_hours_per_week =
            staffClassificationSetting.target_hours_per_week ?? 0;
          staffClassification.minimum_hours_per_week =
            staffClassificationSetting.minimum_hours_per_week ?? 0;
          staffClassification.maximum_hours_per_week =
            staffClassificationSetting.max_hours_per_week;
          staffClassification.minimum_days_per_week =
            staffClassificationSetting.min_days_per_week;
          staffClassification.maximum_days_per_week =
            staffClassificationSetting.max_days_per_week;
          staffClassification.maximum_consecutive_days_per_week =
            staffClassificationSetting.max_consec_days_per_week;
          staffClassification.maximum_ot_per_week =
            staffClassificationSetting.max_ot_per_week;
          staffClassification.maximum_weekend_hours =
            staffClassificationSetting.max_weekend_hours;
          staffClassification.maximum_consecutive_weekends =
            staffClassificationSetting.max_consec_weekends;
          staffClassification.maximum_weekends_per_month =
            staffClassificationSetting.max_weekends_per_months;
          staffClassification.overtime_threshold =
            staffClassificationSetting.overtime_threshold;
          staffClassification.minimum_recovery_time =
            staffClassificationSetting.min_recovery_time;
          staffClassification.created_by = user;
          staffClassification.tenant_id = user.tenant?.id;
          await queryRunner.manager.save(staffClassification);
        }
      }

      const staffCustomFieds = [];
      await saveCustomFields(
        this.customFieldsRepository,
        queryRunner,
        saveObj,
        user,
        user.tenant,
        createDto,
        staffCustomFieds
      );

      address.addressable_id = saveObj.id;
      address.created_by = createdDto?.created_by;
      address.tenant_id = createdDto?.tenant_id;
      address.coordinates = `(${createdDto?.address?.latitude}, ${createdDto?.address?.longitude})`;
      await this.addressService.createAddress(address);
      await this.contactsService.createContacts(createdDto, saveObj.id);
      await queryRunner.commitTransaction();
      return resSuccess(
        `${this.message} created successfully`,
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        saveObj
      );
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
  async update(id: any, updatedDto: UpdateStaffDto, myUser: User) {
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
          relations: ['created_by', 'tenant'],
          where: { id },
        },
        this.message
      );
      const collectionOperation = await this.commonFunction.entityExist(
        this.entityRepository,
        { where: { id: entity?.id } },
        'Collection Operation'
      );
      const classification = await this.commonFunction.entityExist(
        this.entityRepository,
        { where: { id: entity?.id } },
        'Collection Operation'
      );

      const StaffCustomFileds = [];
      await saveCustomFields(
        this.customFieldsRepository,
        queryRunner,
        entity,
        myUser,
        myUser.tenant,
        updatedDto,
        StaffCustomFileds
      );

      const saveHistory = new StaffHistory();
      Object.assign(saveHistory, entity);
      saveHistory.created_by = user.id;
      saveHistory.tenant_id = entity.tenant.id;
      saveHistory.classification_id = classification.id;
      saveHistory.collection_operation_id = collectionOperation.id;
      saveHistory.history_reason = 'C';
      saveHistory.updated_at = entity.updated_at;
      // delete saveHistory?.created_at;
      await this.createHistory(saveHistory);
      Object.assign(entity, updateDto);
      entity.created_at = new Date();
      entity.created_by = this.request?.user;
      const updatedData: any = await this.entityRepository.save(entity);
      address.created_at = new Date();
      address.created_by = this.request?.user?.id;
      address.tenant_id = updateDto?.tenant_id;
      address.coordinates = `(${updatedDto?.address?.latitude}, ${updatedDto?.address?.longitude})`;
      await this.addressService.updateAddress(address);
      await this.contactsService.updateContacts(
        id,
        updatedDto,
        PolymorphicType.CRM_CONTACTS_STAFF
      );
      await queryRunner.commitTransaction();
      delete updatedData?.created_by;
      delete updatedData?.tenant;
      delete updatedData?.custom_fields;
      return resSuccess(
        `${this.message} update successfully`,
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        updatedData
      );
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
  async archive(id: any, updatedBy: any, tenantId: any) {
    try {
      const user = await this.commonFunction.entityExist(
        this.userRepository,
        { where: { id: updatedBy } },
        'User'
      );
      const query = {
        relations: ['tenant', 'created_by'],
        where: {
          id,
          is_archived: false,
          tenant_id: tenantId,
        },
      };
      const entity = await this.commonFunction.entityExist(
        this.entityRepository,
        query,
        this.message
      );

      entity['is_archived'] = !entity.is_archived;
      entity.created_at = new Date();
      entity.created_by = this.request?.user;
      await this.entityRepository.save(entity);

      return {
        status: HttpStatus.NO_CONTENT,
        message: `${this.message} archive successfully`,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  /**
   * fetch single record
   * @param id
   * @param uuid
   * @returns {object}
   */
  async findOne(id: any, uuid?: string) {
    try {
      const query = Object.assign(
        {},
        {
          relations: [
            'tenant',
            'classification_id',
            'collection_operation_id',
            'prefix',
            'suffix',
            'created_by',
          ],
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
        PolymorphicType.CRM_CONTACTS_STAFF,
        entity
      );
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
      return {
        status: HttpStatus.OK,
        message: `${this.message} fetched successfully.`,
        data: { ...data },
      };
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< CRM Contact staff >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  /**
   * get all records
   * @param getAllInterface
   * @returns {objects}
   * @deprecated
   */
  async findAll(getAllInterface: GetAllStaffInterface) {
    try {
      const {
        name,
        limit = parseInt(process.env.PAGE_SIZE),
        page = 1,
        sortBy = 'id',
        sortOrder = OrderByConstants.DESC,
        tenant_id,
        current_user,
        user_id,
      } = getAllInterface;
      const findAll = getAllInterface?.findAll === 'true';
      const { skip, take } = this.commonFunction.pagination(limit, page);
      const order = { [sortBy]: sortOrder };

      const where = {
        is_archived: false,
        is_active: true,
      };

      if (current_user && user_id) {
        const whereInner = {
          is_archived: false,
          user_id: { id: user_id },
        };
        const collectionUserCollectionOperations: any =
          await this.userBusinessUnits
            .createQueryBuilder('user_business_units')
            .leftJoinAndSelect('user_business_units.user_id', 'user_id')
            .leftJoinAndSelect(
              'user_business_units.business_unit_id',
              'business_unit_id'
            )
            .where({ ...whereInner })
            .getMany();

        Object.assign(where, {
          collection_operation_id: {
            id: In(
              collectionUserCollectionOperations.map(
                (cu) => cu?.business_unit_id?.id
              )
            ),
          },
        });
      }

      Object.assign(where, {
        tenant: { id: tenant_id },
      });

      if (name) {
        Object.assign(where, {
          first_name: ILike(`%${name}%`),
        });
      }
      let data: any;
      let count: any;
      if (findAll) {
        [data, count] = await this.entityRepository.findAndCount({
          relations: [
            'tenant',
            'created_by',
            'classification_id',
            'collection_operation_id',
            'prefix',
            'suffix',
          ],
          where,
          order,
        });
      } else {
        [data, count] = await this.entityRepository.findAndCount({
          relations: [
            'tenant',
            'created_by',
            'classification_id',
            'collection_operation_id',
          ],
          where,
          skip,
          take,
          order,
        });
      }

      const entities = [];
      for (const entity of data) {
        const data = await this.commonFunction.createObj(
          PolymorphicType.CRM_CONTACTS_STAFF,
          entity
        );
        entities.push({ ...data });
      }
      return {
        status: HttpStatus.OK,
        message: `${this.message} fetched successfully`,
        count: count,
        data: entities,
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
   * get all filtered records
   * @param getAllInterface
   * @returns {objects}
   */
  async findAllFiltered(getAllInterface: GetAllStaffFilteredInterface) {
    try {
      const {
        name,
        limit = parseInt(process.env.PAGE_SIZE),
        page = 1,
        sortBy = 'staff.id',
        sortOrder = OrderByConstants.DESC,
        fetchAll,
        min_updated_at,
      } = getAllInterface;

      const params = { tenant_id: getAllInterface['tenant_id'] };
      let where = 'staff.is_archived = false AND staff.tenant_id = :tenant_id';

      const staffTeamsQuery = this.teamStaffRepository
        .createQueryBuilder('teams')
        .leftJoinAndSelect(
          'team',
          'team',
          'team.id = teams.team_id AND (team.is_archived = false)'
        )
        .select([
          `STRING_AGG(team.name, ', ') AS teams`,
          `ARRAY_AGG(team.id) AS team_ids`,
          `"teams"."staff_id" AS staff_id`,
        ])
        .groupBy('teams.staff_id');

      const staffRolesQuery = this.staffRolesRepository
        .createQueryBuilder('staff_roles')
        .leftJoinAndSelect(
          'contacts_roles',
          'staff_role',
          'staff_role.id = staff_roles.role_id AND (staff_role.is_archived = false)'
        )
        .select([
          `STRING_AGG(staff_role.name, ', ') AS roles`,
          `ARRAY_AGG(staff_role.id) AS role_ids`,
          `staff_roles.staff_id AS staff_id`,
        ])
        .where('(staff_roles.is_archived = FALSE)')
        .groupBy('staff_roles.staff_id');

      const staffCertificationsQuery = this.staffCertificationsRepository
        .createQueryBuilder('staff_certifications')
        .leftJoinAndSelect(
          'certification',
          'staff_certification',
          'staff_certification.id = staff_certifications.certificate_id AND (staff_certification.is_archived = false)'
        )
        .select([
          `STRING_AGG(staff_certification.name, ', ') AS certifications`,
          `ARRAY_AGG(staff_certification.id) AS certification_ids`,
          `staff_certifications.staff_id AS staff_id`,
        ])
        .where('(staff_certifications.is_archived = FALSE)')
        .groupBy('staff_certifications.staff_id');

      const staffDonorCentersQuery = this.staffDonorCentersRepository
        .createQueryBuilder('staff_donor_centers')
        .leftJoinAndSelect(
          'facility',
          'staff_facility',
          'staff_facility.id = staff_donor_centers.donor_center_id AND (staff_facility.is_archived = false)'
        )
        .select([
          `ARRAY_AGG(staff_facility.id) AS facility_ids`,
          `staff_donor_centers.staff_id AS staff_id`,
        ])
        .where('(staff_donor_centers.is_archived = FALSE)')
        .groupBy('staff_donor_centers.staff_id');

      const staffPrimaryRolesQuery = this.staffRolesRepository
        .createQueryBuilder('primary_roles')
        .leftJoinAndSelect(
          'contacts_roles',
          'staff_role',
          'staff_role.id = primary_roles.role_id AND (staff_role.is_archived = false) AND (primary_roles.is_primary = true)'
        )
        .select([
          `STRING_AGG(staff_role.name, ', ') AS proles`,
          `ARRAY_AGG(staff_role.id) AS role_ids`,
          `primary_roles.staff_id AS staff_id`,
        ])
        .where(
          '(primary_roles.is_archived = FALSE) AND (primary_roles.is_primary = TRUE)'
        )
        .groupBy('primary_roles.staff_id');

      const staffOtherRolesQuery = this.staffRolesRepository
        .createQueryBuilder('other_roles')
        .leftJoinAndSelect(
          'contacts_roles',
          'staff_role',
          'staff_role.id = other_roles.role_id AND (staff_role.is_archived = false) AND (other_roles.is_primary = false)'
        )
        .select([
          `STRING_AGG(staff_role.name, ', ') AS oroles`,
          `ARRAY_AGG(staff_role.id) AS role_ids`,
          `other_roles.staff_id AS staff_id`,
        ])
        .where(
          '(other_roles.is_archived = FALSE) AND (other_roles.is_primary = FALSE)'
        )
        .groupBy('other_roles.staff_id');

      let staffQuery = this.entityRepository
        .createQueryBuilder('staff')
        .leftJoinAndSelect(
          'staff.collection_operation_id',
          'collection_operation'
        )
        .leftJoinAndSelect(
          'staff.classification_id',
          'classification',
          `classification.is_archived = false`
        )
        .leftJoinAndSelect(
          'address',
          'address',
          `address.addressable_id = staff.id AND (address.addressable_type = '${PolymorphicType.CRM_CONTACTS_STAFF}')`
        )
        .leftJoinAndSelect(
          'contacts',
          'phone',
          `phone.contactable_id = staff.id AND (phone.is_primary = true AND phone.contactable_type = '${PolymorphicType.CRM_CONTACTS_STAFF}' AND phone.contact_type >= '${ContactTypeEnum.WORK_PHONE}' AND phone.contact_type <= '${ContactTypeEnum.OTHER_PHONE}')`
        )
        .leftJoinAndSelect(
          'contacts',
          'email',
          `email.contactable_id = staff.id AND (email.is_primary = true AND email.contactable_type = '${PolymorphicType.CRM_CONTACTS_STAFF}' AND email.contact_type >= '${ContactTypeEnum.WORK_EMAIL}' AND email.contact_type <= '${ContactTypeEnum.OTHER_EMAIL}')`
        )
        .leftJoinAndSelect(
          'call_jobs_agents',
          'agent',
          `agent.staff_id = staff.id ${
            getAllInterface?.assignedAgentDate ? 'AND agent.date = :date' : ''
          } `,
          {
            date: new Date(
              getAllInterface?.assignedAgentDate
            ).toLocaleDateString(),
          }
        )
        .leftJoinAndSelect(
          `(${staffTeamsQuery.getQuery()})`,
          'staff_teams',
          'staff_teams.staff_id = staff.id'
        )
        .leftJoinAndSelect(
          `(${staffRolesQuery.getQuery()})`,
          'staff_roles',
          'staff_roles.staff_id = staff.id'
        )
        .leftJoinAndSelect(
          `(${staffPrimaryRolesQuery.getQuery()})`,
          'primary_roles',
          'primary_roles.staff_id = staff.id'
        )
        .leftJoinAndSelect(
          `(${staffOtherRolesQuery.getQuery()})`,
          'other_roles',
          'other_roles.staff_id = staff.id'
        )
        .leftJoinAndSelect(
          `(${staffDonorCentersQuery.getQuery()})`,
          'staff_donor_centers',
          'staff_donor_centers.staff_id = staff.id'
        )
        .leftJoinAndSelect(
          `(${staffCertificationsQuery.getQuery()})`,
          'staff_certifications',
          'staff_certifications.staff_id = staff.id'
        )
        .select([
          'staff.id AS staff_id',
          "concat(staff.first_name, ' ', staff.last_name) AS name",
          'staff.first_name AS first_name',
          'staff.last_name AS last_name',
          'staff.birth_date AS birth_date',
          `address.city AS address_city`,
          `address.county AS address_county`,
          `address.state AS address_state`,
          `STRING_AGG(phone.data, ', ') AS primary_phone`,
          `STRING_AGG(email.data, ', ') AS primary_email`,
          `STRING_AGG(staff_teams.teams, ', ') AS teams`,
          `STRING_AGG(staff_roles.roles, ', ') AS roles`,
          `STRING_AGG(primary_roles.proles, ', ') AS primary_roles`,
          `STRING_AGG(other_roles.oroles, ', ') AS other_roles`,
          `collection_operation.name AS collection_operation_name`,
          `classification.name AS classification_name`,
          `staff.is_active AS status`,
          'staff.updated_at as updated_at',
          'staff.contact_uuid as contact_uuid',
          'staff.tenant_id as tenant_id',
          'sum(agent.assigned_calls) as total_calls',
        ])
        .where('staff.is_archived = false')
        .andWhere('staff.tenant_id = :tenant_id', params)
        .groupBy(
          'staff.id, address.city, address.county, address.state, collection_operation.name, classification.name'
        );
      let exportData;
      const isFetchAll = fetchAll ? fetchAll.trim() === 'true' : false;
      if (isFetchAll) {
        exportData = await staffQuery
          .orderBy({ [sortBy]: sortOrder === 'DESC' ? 'DESC' : 'ASC' })
          .getRawMany();
      }
      if (name) {
        staffQuery.where(
          `concat(staff.first_name, ' ', staff.last_name) ILIKE :name`,
          {
            name: `%${name}%`,
          }
        );
        staffQuery.orWhere(
          `collection_operation.name  ILIKE :collection_operation_id`,
          {
            collection_operation_id: `%${name}%`,
          }
        );
        staffQuery.orWhere(`teams ILIKE :teams`, {
          teams: `%${name}%`,
        });
        staffQuery.orWhere(`certifications ILIKE :staff_certification_name`, {
          staff_certification_name: `%${name}%`,
        });
        staffQuery.orWhere('roles ILIKE :role ', { role: `%${name}%` });
      }
      if (getAllInterface?.status)
        staffQuery = staffQuery.andWhere(`staff.is_active = :status`, {
          status: getAllInterface.status,
        });

      if (getAllInterface?.city) {
        const cities = getAllInterface.city.split(',');
        staffQuery = staffQuery.andWhere(`address.city ILIKE ANY(:cities)`, {
          cities: cities.map((city) => `%${city.trim()}%`),
        });
      }
      if (getAllInterface?.state) {
        const states = getAllInterface.state.split(',');
        staffQuery = staffQuery.andWhere(`address.state ILIKE ANY(:states)`, {
          states: states.map((state) => `%${state.trim()}%`),
        });
      }

      if (getAllInterface?.county) {
        const counties = getAllInterface.county.split(',');
        staffQuery = staffQuery.andWhere(
          `address.county ILIKE ANY(:counties)`,
          {
            counties: counties.map((county) => `%${county.trim()}%`),
          }
        );
      }

      if (getAllInterface?.collection_operation_id) {
        const collectionOperationIds = getAllInterface.collection_operation_id
          .split(',')
          .map(Number);
        staffQuery = staffQuery.andWhere(
          `collection_operation.id IN (:...collection_operation_id)`,
          {
            collection_operation_id: collectionOperationIds,
          }
        );
      }
      if (getAllInterface?.phone)
        staffQuery = staffQuery.andWhere(`phone.data ILIKE :phone`, {
          phone: `%${getAllInterface.phone}%`,
        });
      if (getAllInterface?.email) {
        staffQuery = staffQuery.andWhere(`email.data ILIKE :email`, {
          email: `%${getAllInterface.email}%`,
        });
      }
      if (getAllInterface?.collection_operation_ids) {
        staffQuery = staffQuery.andWhere(
          'collection_operation.id IN (:...collection_operation_ids)'
        );
        params['collection_operation_ids'] = Array.isArray(
          getAllInterface?.collection_operation_ids
        )
          ? getAllInterface?.collection_operation_ids
          : [getAllInterface?.collection_operation_ids];
      }
      if (getAllInterface?.classification_ids) {
        staffQuery = staffQuery.andWhere(
          'classification.id IN (:...classification_ids)'
        );
        params['classification_ids'] = Array.isArray(
          getAllInterface?.classification_ids
        )
          ? getAllInterface?.classification_ids
          : [getAllInterface?.classification_ids];
      }
      if (getAllInterface?.donor_center_ids) {
        staffQuery = staffQuery.andWhere(
          ':donor_center_ids <@ staff_donor_centers.facility_ids'
        );
        params['donor_center_ids'] = Array.isArray(
          getAllInterface?.donor_center_ids
        )
          ? getAllInterface?.donor_center_ids
          : [getAllInterface?.donor_center_ids];
      }
      if (getAllInterface?.certification_ids) {
        staffQuery = staffQuery.andWhere(
          ':certification_ids <@ staff_certifications.certification_ids'
        );
        params['certification_ids'] = Array.isArray(
          getAllInterface?.certification_ids
        )
          ? getAllInterface?.certification_ids
          : [getAllInterface?.certification_ids];
      }
      if (getAllInterface?.team_ids) {
        staffQuery = staffQuery.andWhere(':team_ids <@ staff_teams.team_ids');
        where += ' AND (staff_teams.teams IS NOT NULL)';
        params['team_ids'] = Array.isArray(getAllInterface?.team_ids)
          ? getAllInterface?.team_ids
          : [getAllInterface?.team_ids];
      }
      if (getAllInterface?.role_ids) {
        staffQuery = staffQuery.andWhere(':role_ids <@ staff_roles.role_ids');
        where += ' AND (staff_roles.roles IS NOT NULL)';
        params['role_ids'] = Array.isArray(getAllInterface?.role_ids)
          ? getAllInterface?.role_ids
          : [getAllInterface?.role_ids];
      }
      if (min_updated_at) {
        staffQuery = staffQuery.andWhere(
          `staff.updated_at > :min_updated_at `,
          {
            min_updated_at,
          }
        );
      }
      staffQuery = staffQuery.andWhere(where, params);

      const count = await staffQuery.getCount();
      if (!isFetchAll && getAllInterface.downloadType) {
        exportData = await staffQuery
          .orderBy({ [sortBy]: sortOrder === 'DESC' ? 'DESC' : 'ASC' })
          .getRawMany();
      }
      if (page && limit) {
        const { skip, take } = this.commonFunction.pagination(limit, page);
        staffQuery = staffQuery.limit(take).offset(skip);
      }

      const records = await staffQuery
        .orderBy({ [sortBy]: sortOrder === 'DESC' ? 'DESC' : 'ASC' })
        .getRawMany();
      let url;
      if (
        getAllInterface?.exportType &&
        getAllInterface.downloadType &&
        exportData.length > 0
      ) {
        const columnsToFilter = new Set(
          getAllInterface.tableHeaders.split(',')
        );
        const filteredData = exportData.map((obj) => {
          const newObj = {};
          columnsToFilter.forEach((key) => {
            const joinedValue =
              typeof obj[key] === 'string' &&
              getAllInterface.downloadType.trim() === 'CSV'
                ? obj[key]?.replace(/,\s*/g, ' | ')
                : key === 'status'
                ? obj[key]
                  ? 'Active'
                  : 'Inactive'
                : obj[key];
            newObj[key] = joinedValue;
          });

          return newObj;
        });

        const prefixName = getAllInterface?.selectedOptions
          ? getAllInterface?.selectedOptions.trim()
          : 'Staff';
        url = await this.exportService.exportDataToS3(
          filteredData,
          getAllInterface,
          prefixName,
          'Staff'
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
      console.log(error);
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
  async findAllFilteredNew(getAllInterface: GetAllStaffFilteredInterface) {
    try {
      let {
        name,
        limit = parseInt(process.env.PAGE_SIZE),
        page = 1,
        sortBy = 'staff_list_view.staff_id',
        sortOrder = OrderByConstants.DESC,
        fetchAll,
        min_updated_at,
      } = getAllInterface;

      const params = { tenant_id: getAllInterface['tenant_id'] };
      let where =
        'staff_list_view.is_archived = false AND staff_list_view.tenant_id = :tenant_id';

      let staffQuery = this.viewStaffRepository
        .createQueryBuilder('staff_list_view')
        .distinct(true)
        .select([
          'staff_list_view.staff_id',
          'staff_list_view.name',
          'staff_list_view.first_name',
          'staff_list_view.last_name',
          'staff_list_view.primary_phone',
          'staff_list_view.primary_email',
          'staff_list_view.collection_operation_name',
          'staff_list_view.teams',
          'staff_list_view.status',
          'staff_list_view.classification_name',
          'staff_list_view.status AS status',
          'staff_list_view.classification_name',
          'staff_list_view.roles',
          'staff_list_view.primary_roles',
          'staff_list_view.other_roles',
          'staff_list_view.tenant_id',
        ]);

      /**
       * Filter By : assignedAgentDate
       */
      if (getAllInterface?.assignedAgentDate) {
        staffQuery = staffQuery.andWhere(`staff_list_view.agent_date = :date`, {
          date: new Date(
            getAllInterface?.assignedAgentDate
          ).toLocaleDateString(),
        });
      }

      let exportQuery;
      const isFetchAll = fetchAll ? fetchAll.trim() === 'true' : false;
      if (isFetchAll) {
        exportQuery = staffQuery.clone();
      }

      if (name) {
        staffQuery.where(`staff_list_view.name ILIKE :name`, {
          name: `%${name}%`,
        });
        staffQuery.orWhere(`staff_list_view.classification_name ILIKE :name`, {
          name: `%${name}%`,
        });
        staffQuery.orWhere(
          `staff_list_view.collection_operation_name  ILIKE :collection_operation_id`,
          {
            collection_operation_id: `%${name}%`,
          }
        );
        staffQuery.orWhere(`staff_list_view.teams ILIKE :teams`, {
          teams: `%${name}%`,
        });
        staffQuery.orWhere(
          `staff_list_view.certifications ILIKE :staff_certification_name`,
          {
            staff_certification_name: `%${name}%`,
          }
        );
        staffQuery.orWhere('staff_list_view.roles ILIKE :role ', {
          role: `%${name}%`,
        });
      }
      if (getAllInterface?.status)
        staffQuery = staffQuery.andWhere(`staff_list_view.status = :status`, {
          status: getAllInterface.status,
        });

      if (getAllInterface?.city) {
        const cities = getAllInterface.city.split(',');
        staffQuery = staffQuery.andWhere(
          `staff_list_view.address_city ILIKE ANY(:cities)`,
          {
            cities: cities.map((city) => `%${city.trim()}%`),
          }
        );
      }
      if (getAllInterface?.state) {
        const states = getAllInterface.state.split(',');
        staffQuery = staffQuery.andWhere(
          `staff_list_view.address_state ILIKE ANY(:states)`,
          {
            states: states.map((state) => `%${state.trim()}%`),
          }
        );
      }

      if (getAllInterface?.county) {
        const counties = getAllInterface.county.split(',');
        staffQuery = staffQuery.andWhere(
          `staff_list_view.address_county ILIKE ANY(:counties)`,
          {
            counties: counties.map((county) => `%${county.trim()}%`),
          }
        );
      }

      if (getAllInterface?.collection_operation_id) {
        const collectionOperationIds = getAllInterface.collection_operation_id
          .split(',')
          .map(Number);
        staffQuery = staffQuery.andWhere(
          `staff_list_view.collection_operation_id IN (:...collection_operation_id)`,
          {
            collection_operation_id: collectionOperationIds,
          }
        );
      }
      if (getAllInterface?.phone)
        staffQuery = staffQuery.andWhere(
          `staff_list_view.primary_phone ILIKE :phone`,
          {
            phone: `%${getAllInterface.phone}%`,
          }
        );
      if (getAllInterface?.email) {
        staffQuery = staffQuery.andWhere(
          `staff_list_view.primary_email ILIKE :email`,
          {
            email: `%${getAllInterface.email}%`,
          }
        );
      }
      if (getAllInterface?.collection_operation_ids) {
        staffQuery = staffQuery.andWhere(
          'staff_list_view.collection_operation_id IN (:...collection_operation_ids)'
        );
        params['collection_operation_ids'] = Array.isArray(
          getAllInterface?.collection_operation_ids
        )
          ? getAllInterface?.collection_operation_ids
          : [getAllInterface?.collection_operation_ids];
      }
      if (getAllInterface?.classification_ids) {
        staffQuery = staffQuery.andWhere(
          'staff_list_view.classification_id IN (:...classification_ids)'
        );
        params['classification_ids'] = Array.isArray(
          getAllInterface?.classification_ids
        )
          ? getAllInterface?.classification_ids
          : [getAllInterface?.classification_ids];
      }
      if (getAllInterface?.donor_center_ids) {
        staffQuery = staffQuery.andWhere(
          ':donor_center_ids <@ staff_list_view.staff_donor_center_facility_ids'
        );
        params['donor_center_ids'] = Array.isArray(
          getAllInterface?.donor_center_ids
        )
          ? getAllInterface?.donor_center_ids
          : [getAllInterface?.donor_center_ids];
      }
      if (getAllInterface?.certification_ids) {
        staffQuery = staffQuery.andWhere(
          ':certification_ids <@ staff_list_view.staff_certification_ids'
        );
        params['certification_ids'] = Array.isArray(
          getAllInterface?.certification_ids
        )
          ? getAllInterface?.certification_ids
          : [getAllInterface?.certification_ids];
      }
      if (getAllInterface?.team_ids) {
        staffQuery = staffQuery.andWhere(
          ':team_ids <@ staff_list_view.team_ids'
        );
        where += ' AND (teams IS NOT NULL)';
        params['team_ids'] = Array.isArray(getAllInterface?.team_ids)
          ? getAllInterface?.team_ids
          : [getAllInterface?.team_ids];
      }
      if (getAllInterface?.role_ids) {
        staffQuery = staffQuery.andWhere(
          ':role_ids <@ staff_list_view.role_ids'
        );
        where += ' AND (staff_list_view.roles IS NOT NULL)';
        params['role_ids'] = Array.isArray(getAllInterface?.role_ids)
          ? getAllInterface?.role_ids
          : [getAllInterface?.role_ids];
      }
      // if (min_updated_at) {
      //   staffQuery = staffQuery.andWhere(
      //     `staff_list_view.updated_at > :min_updated_at `,
      //     {
      //       min_updated_at,
      //     }
      //   );
      // }
      staffQuery = staffQuery.andWhere(where, params);

      const count = await staffQuery.getCount();

      sortOrder = sortOrder
        ? (sortOrder.toUpperCase() as 'ASC' | 'DESC')
        : 'DESC';

      if (page && limit) {
        const { skip, take } = this.commonFunction.pagination(limit, page);
        staffQuery = staffQuery.limit(take).offset(skip);
      }

      const records = await staffQuery.orderBy(sortBy, sortOrder).getMany();

      let url;
      if (getAllInterface?.exportType && getAllInterface.downloadType) {
        let exportData;

        if (getAllInterface?.exportType.trim() !== 'filtered') {
          exportData = await exportQuery
            .where({
              is_archived: false,
              tenant_id: getAllInterface['tenant_id'],
            })
            .orderBy(sortBy, sortOrder)
            .getMany();
        } else {
          exportData = records;
        }

        const columnsToFilter = new Set(
          getAllInterface.tableHeaders.split(',')
        );
        const filteredData = exportData.map((obj) => {
          const newObj = {};
          columnsToFilter.forEach((key) => {
            const joinedValue =
              typeof obj[key] === 'string' &&
              getAllInterface.downloadType.trim() === 'CSV'
                ? obj[key]?.replace(/,\s*/g, ' | ')
                : key === 'status'
                ? obj[key]
                  ? 'Active'
                  : 'Inactive'
                : obj[key];
            newObj[key] = joinedValue;
          });

          return newObj;
        });

        const prefixName = getAllInterface?.selectedOptions
          ? getAllInterface?.selectedOptions.trim()
          : 'Staff';
        url = await this.exportService.exportDataToS3(
          filteredData,
          getAllInterface,
          prefixName,
          'Staff'
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
      console.log(error);
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async assignStaffMembers(
    assignStaffMembersDto: AssignStaffMembersDto,
    created_by: any,
    tenant_id: any
  ) {
    const { staff_id, teams } = assignStaffMembersDto;

    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    await this.commonFunction.entityExist(
      this.userRepository,
      { where: { id: created_by } },
      'User'
    );
    await this.commonFunction.entityExist(
      this.entityRepository,
      {
        where: { id: staff_id },
      },
      this.message
    );

    try {
      for (const team_id of teams) {
        await this.commonFunction.entityExist(
          this.teamRepository,
          {
            where: { id: team_id },
          },
          'Team'
        );

        const teamStaff = new TeamStaff();
        teamStaff.staff_id = BigInt(staff_id);
        teamStaff.created_at = new Date();
        teamStaff.team_id = BigInt(team_id);
        teamStaff.created_by = this.request?.user;
        teamStaff.tenant_id = tenant_id;

        await queryRunner.manager.save(teamStaff);
      }

      await queryRunner.commitTransaction();

      return {
        status: 'success',
        response: 'Staff member assigned to the teams successfully',
        code: 201,
      };
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async setPrimaryTeam(
    assignStaffPrimaryTeam: AssignStaffPrimaryTeam,
    updated_by: any
  ) {
    const { staff_id, team_id } = assignStaffPrimaryTeam;

    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const alreadyExists = await this.commonFunction.entity(
        this.teamStaffRepository,
        {
          where: { staff_id, is_primary: true },
        }
      );
      if (alreadyExists) {
        alreadyExists.is_primary = false;
        await queryRunner.manager.save(alreadyExists);
      }

      const teamStaff = await this.teamStaffRepository
        .createQueryBuilder('teamStaff')
        .leftJoinAndSelect('teamStaff.staff_id', 'staff_id')
        .leftJoinAndSelect('teamStaff.team_id', 'team_id')
        .where({
          team_id: team_id,
          staff_id: staff_id,
        })
        .getOne();

      teamStaff.is_primary = true;
      teamStaff.created_at = new Date();
      teamStaff.created_by = this.request?.user;
      await queryRunner.manager.save(teamStaff);

      await queryRunner.commitTransaction();

      await this.commonFunction.entityExist(
        this.entityRepository,
        { where: { id: staff_id } },
        'Staff'
      );
      const teamStaffList = await this.teamStaffRepository
        .createQueryBuilder('teamStaff')
        .leftJoinAndSelect('teamStaff.team_id', 'team_id')
        .where({ staff_id: staff_id })
        .orderBy('teamStaff.id', 'DESC')
        .getMany();

      return {
        status: 'success',
        code: 204,
        response: teamStaffList,
      };
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async removeTeam(
    assignStaffPrimaryTeam: AssignStaffPrimaryTeam,
    updated_by: any
  ) {
    const { staff_id, team_id } = assignStaffPrimaryTeam;

    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const teamStaff = await this.teamStaffRepository
        .createQueryBuilder('teamStaff')
        .leftJoinAndSelect('teamStaff.staff_id', 'staff_id')
        .leftJoinAndSelect('teamStaff.team_id', 'team_id')
        .where({
          team_id: team_id,
          staff_id: staff_id,
        })
        .getOne();
      if (!teamStaff) {
        return {
          status: 'error',
          code: 404,
          response: 'Team not found.',
        };
      }
      await queryRunner.manager.remove(teamStaff);

      await queryRunner.commitTransaction();

      return {
        status: HttpStatus.OK,
        message: 'success',
        response: 'Team removed.',
      };
    } catch (err) {
      console.log(err);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getStaffTeams(id: any) {
    await this.commonFunction.entityExist(
      this.entityRepository,
      { where: { id } },
      'Staff'
    );
    const teamStaffList = await this.teamStaffRepository
      .createQueryBuilder('teamStaff')
      .leftJoinAndSelect('teamStaff.team_id', 'team_id')
      .where({ staff_id: id })
      .orderBy('teamStaff.id', 'DESC')
      .getMany();

    return {
      status: 'success',
      code: 200,
      response: teamStaffList,
    };
  }

  async getDropdownFilterData(user: any) {
    try {
      const response = await this.entityRepository
        .createQueryBuilder('staff')
        .select([
          '(CAST(staff.id as int)) as id',
          `(staff.first_name || ' ' || staff.last_name) as name`,
          `staff.tenant_id as tenant_id`,
        ])
        .where(`staff.is_archived = ${false} and tenant_id = ${user.tenant.id}`)
        .andWhere(`staff.is_active = ${true}`)
        .getRawMany();

      return resSuccess(
        `${this.message} fetched successfully.`,
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        response,
        response.length
      );
    } catch (exception) {
      return resError(
        exception.message,
        ErrorConstants.Error,
        exception.status
      );
    }
  }

  async getStaffSeedData(user: any, queryParams: GetAllAccountsInterface) {
    try {
      const cities: any = await this.addressRepository
        .createQueryBuilder('address')
        .select('DISTINCT address.city', 'city')
        .where({
          addressable_type: PolymorphicType.CRM_CONTACTS_STAFF,
          tenant: { id: queryParams.tenant_id },
        })
        .getRawMany();

      const county: any = await this.addressRepository
        .createQueryBuilder('address')
        .select('DISTINCT address.county', 'county')
        .where({
          addressable_type: PolymorphicType.CRM_CONTACTS_STAFF,
          tenant: { id: queryParams.tenant_id },
        })
        .getRawMany();
      const states: any = await this.addressRepository
        .createQueryBuilder('address')
        .select('DISTINCT address.state', 'state')
        .where({
          addressable_type: PolymorphicType.CRM_CONTACTS_STAFF,
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
