import { InjectRepository } from '@nestjs/typeorm';
import {
  Brackets,
  EntityManager,
  ILike,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { User } from '../entity/user.entity';
import {
  SearchInterface,
  ResetPasswordInterface,
} from '../interface/user.interface';
import {
  HttpStatus,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { keyCloakAdmin } from '../../../../../../config/keycloak.config';
import { Roles } from '../../../../platform-administration/roles-administration/role-permissions/entities/role.entity';
import { UserBusinessUnits } from '../entity/user-business-units.entity';
import { UserBusinessUnitsHistory } from '../entity/user-business-units-history.entity';
import { UserHistory } from '../entity/userhistory.entity';
import { Tenant } from '../../../../platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { BusinessUnits } from '../../../organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { resError, resSuccess } from '../../../../helpers/response';
import { SuccessConstants } from '../../../../constants/success.constants';
import { ErrorConstants } from '../../../../constants/error.constants';
import { getModifiedDataDetails } from '../../../../../../common/utils/modified_by_detail';
import { Permissions } from 'src/api/system-configuration/platform-administration/roles-administration/role-permissions/entities/permission.entity';
import { OrganizationalLevels } from '../../../organizational-administration/hierarchy/organizational-levels/entities/organizational-level.entity';
import { pagination } from 'src/common/utils/pagination';
import { UserRequest } from 'src/common/interface/request';
import { REQUEST } from '@nestjs/core';
import { CommunicationService } from 'src/api/crm/contacts/volunteer/communication/services/communication.service';
import { HistoryReason } from 'src/common/enums/history_reason.enum';
import {
  MessageType,
  getDSTemplates,
  sendDSEmail,
} from 'src/api/common/services/dailyStory.service';
import { QueryRunner } from 'typeorm/browser';
import { customSort } from 'src/api/utils/sorting';
import { organizationalLevelWhere } from 'src/api/common/services/organization.service';
import { getRawCount } from 'src/api/common/utils/query';
import { CreateKCUsersDto } from '../dto/create-user.dto';
import { generateRandomString } from 'src/api/utils/generateRandomString';
import { decryptSecretKey } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/utils/encryption';

dotenv.config();
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserHistory)
    private readonly userHistoryRepository: Repository<UserHistory>,
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
    @InjectRepository(UserBusinessUnits)
    private readonly userBusinessUnitsRepository: Repository<UserBusinessUnits>,
    @InjectRepository(UserBusinessUnitsHistory)
    private readonly userBusinessUnitsHistoryRepository: Repository<UserBusinessUnitsHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(BusinessUnits)
    private readonly businessRepository: Repository<BusinessUnits>,
    @InjectRepository(OrganizationalLevels)
    private readonly organizationalLevelRepository: Repository<OrganizationalLevels>,
    @InjectRepository(Permissions)
    private readonly permissionsRepository: Repository<Permissions>,
    private readonly entityManager: EntityManager,
    private readonly communicationService: CommunicationService,
    @Inject(REQUEST)
    private request: UserRequest
  ) {}

  async addUser(createUserDto: any, subdomain: string) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      const userData = await this.userRepository.findOne({
        where: { email: createUserDto?.email },
        withDeleted: true,
      });

      if (createUserDto?.role) {
        const roleData = await this.rolesRepository.findOne({
          where: { id: createUserDto?.role, is_archived: false },
        });
        const isTenantAdminExists = await this.userRepository.exist({
          where: {
            is_archived: false,
            role: {
              id: createUserDto?.role,
            },
          },
        });

        if (!roleData) {
          throw new NotFoundException('Role not found');
        } else if (
          roleData.cc_role_name == 'tenant-admin' &&
          isTenantAdminExists
        ) {
          throw new NotFoundException(
            `There can be only one ${roleData.name} in each tenant.`
          );
        }
      }

      if (createUserDto?.business_units) {
        const businessUnits = await this.businessRepository.find({
          where: { id: In(createUserDto?.business_units), is_archived: false },
        });

        if (!businessUnits.length) {
          throw new NotFoundException('Business units not found');
        }
      }
      if (userData || userData?.deleted_at) {
        return resError(
          'Email already exists!',
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }

      if (createUserDto?.unique_identifier) {
        const dupUniqueIden = await this.userRepository.findOne({
          where: { unique_identifier: createUserDto?.unique_identifier },
          withDeleted: true,
        });

        if (dupUniqueIden) {
          return resError(
            `Unique identifier already exists`,
            ErrorConstants.Error,
            HttpStatus.CONFLICT
          );
        }
      }
      const user = await this.userRepository.findOne({
        where: { id: createUserDto?.created_by },
        relations: ['tenant'],
      });

      await queryRunner.connect();
      await queryRunner.startTransaction();

      if (createUserDto?.role) {
        const roleData = await this.rolesRepository.findOne({
          where: { id: createUserDto?.role, is_archived: false },
        });

        if (!roleData) {
          // throw new NotFoundException('User not found');
          return resError('Role not found', ErrorConstants.Error, 400);
        }
      }

      if (createUserDto?.business_unit) {
        const businessData = await this.businessRepository.findOne({
          where: { id: createUserDto?.business_unit },
        });

        if (!businessData) {
          // throw new NotFoundException('Business not found');
          return resError(
            'There can be only one ${roleData.name} in each tenant.',
            ErrorConstants.Error,
            400
          );
        }
      }

      if (userData || userData?.deleted_at) {
        return resError(
          `Email already exists`,
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }

      if (createUserDto?.unique_identifier) {
        const dupUniqueIden = await this.userRepository.findOne({
          where: { unique_identifier: createUserDto?.unique_identifier },
          withDeleted: true,
        });

        if (dupUniqueIden) {
          return resError(
            `Unique identifier already exists`,
            ErrorConstants.Error,
            HttpStatus.CONFLICT
          );
        }
      }

      const passwordHash = await bcrypt.hash(
        createUserDto.password,
        +process.env.BCRYPT_SALT_ROUNDS ?? 10
      );

      const newUser = new User();

      newUser.first_name = createUserDto.first_name;
      newUser.last_name = createUserDto.last_name;
      newUser.last_permissions_updated = new Date();
      newUser.unique_identifier = createUserDto.unique_identifier;
      newUser.email = createUserDto.email.toLowerCase();
      newUser.date_of_birth = createUserDto.date_of_birth;
      newUser.gender = createUserDto.gender;
      newUser.home_phone_number = createUserDto?.home_phone_number;
      newUser.work_phone_number = createUserDto?.work_phone_number;
      newUser.work_phone_extension = createUserDto?.work_phone_extension;
      newUser.address_line_1 = createUserDto?.address_line_1;
      newUser.address_line_2 = createUserDto?.address_line_2;
      newUser.zip_code = createUserDto?.zip_code;
      newUser.city = createUserDto?.city;
      newUser.state = createUserDto?.state;
      newUser.role = createUserDto?.role;
      newUser.mobile_number = createUserDto?.mobile_number;
      newUser.is_manager = createUserDto?.is_manager;
      newUser.hierarchy_level = createUserDto?.hierarchy_level;
      newUser.assigned_manager = createUserDto?.assigned_manager;
      newUser.override = createUserDto?.override;
      newUser.adjust_appointment_slots =
        createUserDto?.adjust_appointment_slots;
      newUser.resource_sharing = createUserDto?.resource_sharing;
      newUser.edit_locked_fields = createUserDto?.edit_locked_fields;
      newUser.account_state = createUserDto?.account_state;
      newUser.tenant_id = user?.tenant?.id as any;
      // (newUser.created_at = new Date()),
      // newUser.updated_at = new Date(),
      newUser.password = passwordHash;
      newUser.tenant_id = createUserDto?.tenant_id;
      newUser.keycloak_username = createUserDto.email.toLowerCase();
      if (createUserDto?.created_by)
        newUser.created_by = createUserDto?.created_by;
      newUser.is_active = createUserDto.is_active ?? false;
      newUser.all_hierarchy_access =
        createUserDto.all_hierarchy_access ?? false;

      const savedUser = await queryRunner.manager.save(newUser);
      console.log(createUserDto?.business_units);

      const promises = [];
      if (
        createUserDto?.business_units &&
        createUserDto.business_units.length > 0
      ) {
        for (const businessUnit of createUserDto?.business_units) {
          const newUserBusinessUnit = new UserBusinessUnits();
          newUserBusinessUnit.user_id = savedUser.id;
          newUserBusinessUnit.tenant_id = createUserDto?.tenant_id;
          newUserBusinessUnit.business_unit_id = businessUnit;
          newUserBusinessUnit.created_by = createUserDto?.created_by;
          promises.push(
            queryRunner.manager
              .getRepository(UserBusinessUnits)
              .insert(newUserBusinessUnit)
          );
        }
      }
      await Promise.all(promises);

      await createKeyCloakUser(subdomain, createUserDto.password, {
        ...createUserDto,
      });

      // ********* Sending Email to new user *************
      const requestTenant = this.request.user.tenant;

      if (
        requestTenant?.dailystory_token &&
        requestTenant?.dailystory_token != ''
      ) {
        const emailTemplate = await getDSTemplates(
          requestTenant?.dailystory_campaign_id,
          decryptSecretKey(requestTenant?.dailystory_token)
        );
        await sendDSEmail(
          emailTemplate?.Response?.emails?.[0]?.emailId,
          createUserDto.email,
          {
            email_body: `Hi ${createUserDto.first_name} ${createUserDto.last_name},

          Welcome to Degree37. Your new account comes with access to platform Admin.
          
          Email: ${createUserDto.email}
          
          Password: ${createUserDto.password}
          
          For login to Degree37, please click here`,
            subject: `${createUserDto.first_name} ${createUserDto.last_name} , Welcome to ${requestTenant.tenant_name}`,
            from: requestTenant.email,
            messageType: MessageType.email,
          },
          decryptSecretKey(requestTenant?.dailystory_token)
        );
      }
      // ********************************************************

      await queryRunner.commitTransaction();

      return resSuccess(
        'User Created Successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedUser
      );
    } catch (error) {
      console.log(error, 'error');
      await queryRunner.rollbackTransaction();
      console.log('<<<<<<<<<<<<<<<<<<<<<<< User add >>>>>>>>>>>>>>>>>>>>>>>>>');
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async getCallCenterUserAgents(getAllUserAgentsInterface, user = null) {
    const limit = parseInt(
      getAllUserAgentsInterface?.limit?.toString() ??
        process.env.PAGE_SIZE ??
        '10'
    );
    let page = getAllUserAgentsInterface?.page
      ? +getAllUserAgentsInterface?.page
      : 1;
    if (page < 1) {
      page = 1;
    }

    const userQuery = this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect(
        'user.role',
        'role',
        "role.is_archived = false and role.cc_role_name = 'agent' "
      )
      .leftJoinAndSelect('user.tenant', 'tenant')
      .leftJoinAndSelect(
        'user.assigned_manager',
        'manager',
        'manager.is_archived = false'
      )
      .leftJoin('user.business_units', 'bus', 'bus.is_archived = false')
      .leftJoin(
        'business_units',
        'bu',
        'bus.business_unit_id = bu.id AND bu.is_archived = false'
      )
      .leftJoinAndSelect('user.hierarchy_level', 'ol', 'ol.is_archived = false')
      .leftJoinAndSelect(
        'call_jobs_agents',
        'agent',
        `agent.user_id = user.id ${
          getAllUserAgentsInterface?.assignedAgentDate
            ? 'AND agent.date = :date'
            : ''
        } `,
        {
          date: new Date(
            getAllUserAgentsInterface?.assignedAgentDate
          ).toLocaleDateString(),
        }
      )
      .select([
        'user.id AS id',
        'user.first_name AS first_name',
        'user.last_name AS last_name',
        'user.last_name AS last_name',
        'role.name AS role',
        "(CASE WHEN user.is_manager THEN 'Yes' ELSE 'No' END) AS is_manager",
        'manager.first_name AS assigned_manager',
        'ol.name AS hierarchy_level',
        "STRING_AGG(bu.name, ',') AS business_unit",
        "(CASE WHEN user.account_state THEN 'Unlocked' ELSE 'Locked' END) AS account_state",
        'user.work_phone_number AS work_phone_number',
        'user.mobile_number AS mobile_number',
        'user.is_active AS is_active',
        'user.tenant_id AS tenant_id',
        'sum(agent.assigned_calls) as total_calls',
      ])
      .where('user.is_archived = false')
      .groupBy('user.id, role.id, tenant.id, manager.id, ol.id')
      .orderBy({ 'user.id': 'DESC' });

    if (user) {
      userQuery.andWhere('tenant.id = :tenant_id', {
        tenant_id: user?.tenant?.id,
      });
    }

    if (getAllUserAgentsInterface?.keyword) {
      userQuery.andWhere(
        new Brackets((subQb) => {
          subQb
            .where("(user.first_name || ' ' || user.last_name) ILIKE :name", {
              name: `%${getAllUserAgentsInterface?.keyword}%`,
            })
            .orWhere('user.email ILIKE :email', {
              email: `%${getAllUserAgentsInterface?.keyword}%`,
            })
            .orWhere('user.mobile_number ILIKE :mobile_number', {
              mobile_number: `%${getAllUserAgentsInterface?.keyword.replace(
                /%/g,
                ' '
              )}%`,
            })
            .orWhere('role.name ILIKE :roleName', {
              roleName: `%${getAllUserAgentsInterface?.keyword}%`,
            })
            .orWhere(
              "(manager.first_name || ' ' || manager.last_name) ILIKE :managerName",
              {
                managerName: `%${getAllUserAgentsInterface?.keyword}%`,
              }
            );
        })
      );
    }
    userQuery.andWhere('user.is_active = :status', {
      status: true,
    });

    if (getAllUserAgentsInterface?.sortBy) {
      const sortByMap = {
        name: 'user.first_name',
        total_calls: 'sum(agent.assigned_calls)',
        collection_operation_name: 'ol.name',
      };
      const sortName = sortByMap[getAllUserAgentsInterface.sortBy];
      userQuery.orderBy({
        [sortName ? sortName : `user.${getAllUserAgentsInterface.sortBy}`]:
          getAllUserAgentsInterface.sortOrder === 'DESC' ? 'DESC' : 'ASC',
      });
    }

    const count = await getRawCount(this.entityManager, userQuery);

    if (limit && page) {
      const { skip, take } = pagination(page, limit);
      userQuery.limit(take).offset(skip);
    }

    const records = await userQuery.getRawMany();

    const newRecordType: (User & { roleName?: string })[] = [];
    for (const user of records) {
      const roleData = await this.rolesRepository.findOneBy({
        id: user?.id,
      });
      delete user.password;
      newRecordType.push({ ...user, roleName: roleData?.name });
    }

    return { total_records: count, page_number: page, data: newRecordType };
  }

  async getUsers(getAllUsersInterface, user = null) {
    const limit = parseInt(
      getAllUsersInterface?.limit?.toString() ?? process.env.PAGE_SIZE ?? '10'
    );
    let page = getAllUsersInterface?.page ? +getAllUsersInterface?.page : 1;
    if (page < 1) {
      page = 1;
    }

    const userQuery = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role', 'role.is_archived = false')
      .leftJoinAndSelect('user.tenant', 'tenant')
      .leftJoinAndSelect(
        'user.assigned_manager',
        'manager',
        'manager.is_archived = false'
      )
      .leftJoin('user.business_units', 'bus', 'bus.is_archived = false')
      .leftJoin(
        'business_units',
        'bu',
        'bus.business_unit_id = bu.id AND bu.is_archived = false'
      )
      .leftJoinAndSelect('user.hierarchy_level', 'ol', 'ol.is_archived = false')
      .select([
        'user.id AS id',
        'user.first_name AS first_name',
        'user.last_name AS last_name',
        'user.last_name AS last_name',
        'role.name AS role',
        "(CASE WHEN user.is_manager THEN 'Yes' ELSE 'No' END) AS is_manager",
        'manager.first_name AS assigned_manager',
        'ol.name AS hierarchy_level',
        "STRING_AGG(bu.name, ',') AS business_unit",
        "(CASE WHEN user.account_state THEN 'Unlocked' ELSE 'Locked' END) AS account_state",
        'user.work_phone_number AS work_phone_number',
        'user.mobile_number AS mobile_number',
        'user.is_active AS is_active',
        'user.tenant_id AS tenant_id',
      ])
      .where('user.is_archived = false')
      .groupBy('user.id, role.id, tenant.id, manager.id, ol.id')
      .orderBy({ 'user.id': 'DESC' });

    if (user) {
      userQuery.andWhere('tenant.id = :tenant_id', {
        tenant_id: user?.tenant?.id,
      });
    }
    if (getAllUsersInterface?.roleId) {
      userQuery.andWhere('role.id = :role_id', {
        role_id: getAllUsersInterface?.roleId,
      });
    }
    if (getAllUsersInterface?.assignedManager) {
      userQuery.andWhere('manager.id = :manager_id', {
        manager_id: getAllUsersInterface?.assignedManager,
      });
    }
    if (getAllUsersInterface?.keyword) {
      userQuery.andWhere(
        new Brackets((subQb) => {
          subQb
            .where("(user.first_name || ' ' || user.last_name) ILIKE :name", {
              name: `%${getAllUsersInterface?.keyword}%`,
            })
            .orWhere('user.email ILIKE :email', {
              email: `%${getAllUsersInterface?.keyword}%`,
            })
            .orWhere('user.mobile_number ILIKE :mobile_number', {
              mobile_number: `%${getAllUsersInterface?.keyword.replace(
                /%/g,
                ' '
              )}%`,
            })
            .orWhere('role.name ILIKE :roleName', {
              roleName: `%${getAllUsersInterface?.keyword}%`,
            })
            .orWhere(
              "(manager.first_name || ' ' || manager.last_name) ILIKE :managerName",
              {
                managerName: `%${getAllUsersInterface?.keyword}%`,
              }
            );
        })
      );
    }
    if (getAllUsersInterface?.organizational_levels) {
      userQuery.andWhere(
        organizationalLevelWhere(
          getAllUsersInterface.organizational_levels,
          'bu.id',
          'user.id'
        )
      );
    }
    if (
      getAllUsersInterface?.status !== undefined &&
      getAllUsersInterface?.status !== '' &&
      getAllUsersInterface?.status !== 'undefined'
    ) {
      userQuery.andWhere('user.is_active = :status', {
        status: getAllUsersInterface?.status,
      });
    }
    if (getAllUsersInterface?.sortBy) {
      const sortByMap = {
        assigned_manager: 'manager.first_name',
        role: 'role.name',
        business_unit: 'bu.name',
        hierarchy_level: 'ol.name',
      };
      const sortName = sortByMap[getAllUsersInterface.sortBy];
      userQuery.orderBy({
        [sortName ? sortName : `user.${getAllUsersInterface.sortBy}`]:
          getAllUsersInterface.sortOrder === 'DESC' ? 'DESC' : 'ASC',
      });
    }

    const count = await getRawCount(this.entityManager, userQuery);

    if (limit && page) {
      const { skip, take } = pagination(page, limit);
      userQuery.limit(take).offset(skip);
    }

    const records = await userQuery.getRawMany();

    const newRecordType: (User & { roleName?: string })[] = [];
    for (const user of records) {
      const roleData = await this.rolesRepository.findOneBy({
        id: user?.id,
      });
      delete user.password;
      newRecordType.push({ ...user, roleName: roleData?.name });
    }

    return { total_records: count, page_number: page, data: newRecordType };
  }

  async getOwner(user: any, id: any) {
    try {
      const collectionOperations = id.split(',');

      const where: any = { is_archived: false };

      const parentIds: any = id.split(',');

      const childCollectionOperations = await this.businessRepository.find({
        where: {
          parent_level: {
            id: In(collectionOperations),
          },
        },
      });

      const childCollectionOperationIds = childCollectionOperations.map(
        (co) => co?.id
      );

      const allCollectionOperationIds =
        childCollectionOperationIds?.length > 0
          ? [...parentIds, ...childCollectionOperationIds]
          : parentIds;

      const users = await this.userRepository.find({
        where: {
          ...where,
          business_units: {
            business_unit_id: {
              id: In(allCollectionOperationIds),
            },
          },
          tenant: {
            id: user?.tenant?.id,
          },
        },
        relations: [
          'role',
          'tenant',
          'assigned_manager',
          'business_units',
          'business_units.business_unit_id',
          'hierarchy_level',
        ],
      });

      return resSuccess(
        SuccessConstants.SUCCESS,
        'Recruiters fetched.',
        HttpStatus.OK,
        users
      );
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< User get owner >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getManagers(user = null, query?: any) {
    try {
      const sort = customSort(query);

      let where: any = {
        is_archived: false,
        is_manager: true,
        is_active: true,
        is_impersonateable_user: false,
      };
      if (user) {
        where = {
          ...where,
          account_state: true,
          tenant: { id: user?.tenant?.id },
        };
      }
      const managerData: any = await this.userRepository.find({
        where,
        order: sort,
        // relations: ['tenant'],
      });

      return resSuccess(
        SuccessConstants.SUCCESS,
        'Mangers found successfully',
        HttpStatus.OK,
        managerData
      );
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< User get manager >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async deleteUser(id: any, subdomain: string, req: any) {
    const user: any = await this.userRepository.findOne({
      where: { id, is_archived: false },
      relations: ['role', 'tenant'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    } else if (user.role.is_auto_created) {
      return resError(
        `You cannot archive tenant admin`,
        ErrorConstants.Error,
        HttpStatus.FORBIDDEN
      );
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      const user: any = await this.userRepository.findOne({
        where: { id, is_archived: false },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await queryRunner.connect();
      await queryRunner.startTransaction();

      user.is_archived = true;
      user.created_at = new Date();
      user.created_by = this.request?.user;
      const archivedUser: any = await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
      return {
        status: 'success',
        response: 'User Archived.',
        status_code: 204,
        data: null,
      };
    } catch (error) {
      console.error(error);
      await queryRunner.rollbackTransaction();
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getUser(id: any) {
    try {
      const userData: any = await this.userRepository.findOne({
        where: { id, is_archived: false },
        relations: [
          'role',
          'created_by',
          'assigned_manager',
          'business_units',
          'business_units.business_unit_id',
          'hierarchy_level',
          'tenant',
        ],
      });

      const { tenant, ...user } = userData;
      let created_by = null;
      if (tenant?.has_superadmin) {
        created_by = {
          ...user,
          tenant_id: this.request.user.tenant?.id,
        };
      } else {
        created_by = {
          ...user,
        };
      }
      delete user?.password;
      if (!user) {
        throw new NotFoundException('User not found');
      }

      delete created_by?.created_by;
      if (user) {
        const modifiedData: any = await getModifiedDataDetails(
          this.userHistoryRepository,
          id,
          this.userRepository,
          this.request?.user?.tenant?.id
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        user.modified_by = created_by;
        user.modified_at = user.created_at;
        user.created_at = modified_at ? modified_at : user.created_at;
        user.created_by = modified_by ? modified_by : created_by;
      }
      return resSuccess(
        SuccessConstants.SUCCESS,
        'User found Successfully',
        HttpStatus.OK,
        { ...user }
      );
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< User getUser >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getCurrentUser(id: any) {
    const userData: any = await this.userRepository.findOne({
      where: { id, is_archived: false },
      relations: [
        'role',
        'created_by',
        'assigned_manager',
        'business_units',
        'business_units.business_unit_id',
        'hierarchy_level',
      ],
    });

    delete userData?.password;
    if (!userData) {
      throw new NotFoundException('User not found');
    }
    const { tenant, ...user } = userData;
    if (userData) {
      let created_by = null;
      if (tenant?.has_superadmin) {
        created_by = {
          ...user,
          tenant_id: this.request.user.tenant?.id,
        };
      } else {
        created_by = {
          ...user,
        };
      }

      const {
        role,
        created_by: created,
        assigned_manager,
        business_unit,
        business_units,
        hierarchy_level,
        ...rest
      } = created_by;

      created_by = rest;
      const modifiedData: any = await getModifiedDataDetails(
        this.userHistoryRepository,
        id,
        this.userRepository,
        this.request.user?.tenant?.id
      );
      const modified_at = modifiedData?.created_at;
      const modified_by = modifiedData?.created_by;
      user.modified_by = created_by;
      user.modified_at = user.created_at;
      user.created_at = modified_at ? modified_at : user.created_at;
      user.created_by = modified_by ? modified_by : created_by;
    }

    return resSuccess(
      SuccessConstants.SUCCESS,
      'User found Successfully',
      HttpStatus.OK,
      { ...user }
    );
  }

  async searchUsers(searchInterface: SearchInterface) {
    try {
      const limit: number = searchInterface?.limit
        ? +searchInterface?.limit
        : process.env.PAGE_SIZE
        ? +process.env.PAGE_SIZE
        : 10;
      const page = searchInterface?.page ? +searchInterface?.page : 1;

      const where = [
        {
          email: ILike(`%${searchInterface?.search}%`),
          first_name: ILike(`%${searchInterface?.search}%`),
          last_name: ILike(`%${searchInterface?.search}%`),
        },

        { is_archived: false },
        { is_impersonateable_user: false },
        { unique_identifier: Not(IsNull()) },
      ];

      const [records, count] = await this.userRepository.findAndCount({
        where,
        skip: (page - 1) * limit || 0,
        take: limit,
        relations: ['role'],
      });

      return { total_records: count, page_number: page, data: records };
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< User search user >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(userInterface: any, subdomain: string, req: any) {
    const userId = userInterface?.id;
    const user: any = await this.userRepository.findOne({
      where: { id: userId, is_archived: false },
      relations: [
        'created_by',
        'role',
        'business_units',
        'business_units.business_unit_id',
      ],
    });
    const userBusinessUnitIds = user?.business_units?.map(
      (bu) => bu.business_unit_id.id
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (userInterface?.existingTenantRoleId) {
      const tenantUser = await this.userRepository.findOne({
        where: {
          id: userInterface?.existingTenantRoleUserId,
          is_archived: false,
        },
        relations: ['created_by', 'role', 'tenant'],
      });

      const anyUser: any = tenantUser;

      const tenantId = anyUser.tenant?.id;

      const currentTenant = await this.tenantRepository.findOne({
        where: {
          id: tenantId,
        },
      });

      await this.tenantRepository.update(
        { id: tenantId },
        { ...currentTenant, email: user.email }
      );

      subdomain = (tenantUser.tenant as any).admin_domain;
      subdomain = subdomain?.split('/')?.[2]?.split('.')?.[0];

      const updatedTenantAdminUser = {
        ...tenantUser,
        role: userInterface?.existingTenantRoleId,
        is_auto_created: false,
      };

      await this.userRepository.update(
        { id: userInterface?.existingTenantRoleUserId },
        { ...updatedTenantAdminUser }
      );
    }

    if (userInterface?.role) {
      const roleData = await this.rolesRepository.findOne({
        where: { id: userInterface?.role, is_archived: false },
      });
      const isTenantAdminExists = await this.userRepository.exist({
        where: {
          id: Not(userId),
          is_archived: false,
          is_active: true,
          role: {
            id: userInterface?.role,
          },
        },
      });

      if (!roleData) {
        throw new NotFoundException('Role not found');
      } else if (
        roleData.cc_role_name == 'tenant-admin' &&
        isTenantAdminExists
      ) {
        throw new NotFoundException(
          `There can be only one ${roleData.name} in each tenant.`
        );
      }
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      const userId = userInterface?.id;
      const user = await this.userRepository.findOne({
        where: { id: userId, is_archived: false },
        relations: ['created_by', 'role'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (userInterface?.role) {
        const roleData = await this.rolesRepository.findOne({
          where: { id: userInterface?.role, is_archived: false },
        });

        if (!roleData) {
          throw new NotFoundException('Role not found');
        }
      }

      if (userInterface?.business_unit) {
        const businessData = await this.businessRepository.findOne({
          where: { id: userInterface?.business_unit },
        });

        if (!businessData) {
          throw new NotFoundException('Business not found');
        }
      }

      await queryRunner.connect();
      await queryRunner.startTransaction();

      const updatedUser = {
        // updated_by: userInterface?.updated_by,
        first_name: userInterface?.first_name,
        last_name: userInterface?.last_name,
        keycloak_username: userInterface?.email,
        email: userInterface?.email,
        last_permissions_updated: new Date(),
        date_of_birth: userInterface?.date_of_birth,
        gender: userInterface?.gender,
        home_phone_number: userInterface?.home_phone_number,
        work_phone_number: userInterface?.work_phone_number,
        work_phone_extension: userInterface?.work_phone_extension,
        address_line_1: userInterface?.address_line_1,
        address_line_2: userInterface?.address_line_2,
        zip_code: userInterface?.zip_code,
        city: userInterface?.city,
        state: userInterface?.state,
        is_active: userInterface?.is_active,
        all_hierarchy_access: userInterface?.all_hierarchy_access,
        role: userInterface?.role,
        mobile_number: userInterface?.mobile_number,
        is_manager: userInterface?.is_manager,
        hierarchy_level: userInterface?.hierarchy_level,
        assigned_manager: userInterface?.assigned_manager,
        override: userInterface?.override,
        adjust_appointment_slots: userInterface?.adjust_appointment_slots,
        resource_sharing: userInterface?.resource_sharing,
        edit_locked_fields: userInterface?.edit_locked_fields,
        account_state: userInterface?.account_state,
        is_auto_created: userInterface?.existingTenantRoleId ? true : false,
        created_at: new Date(),
        created_by: this.request?.user,
        // updated_at: new Date(),
      };
      await this.userRepository.update({ id: userId }, { ...updatedUser });

      const where: any = {
        is_archived: false,
        user_id: { id: userId },
        business_unit_id: { id: Not(In(userInterface?.business_units)) },
      };

      const businessUnitsToRemove: any =
        await this.userBusinessUnitsRepository.find({
          where: where,
          relations: ['business_unit_id', 'user_id'],
        });

      let promises = [];
      // for (const businessUnitToRemove of businessUnitsToRemove) {
      //   promises.push(
      //     queryRunner.manager.getRepository(UserBusinessUnitsHistory).insert({
      //       ...businessUnitToRemove,
      //       history_reason: HistoryReason.D,
      //       business_unit_id: businessUnitToRemove.business_unit_id.id,
      //       user_id: businessUnitToRemove.user_id.id,
      //       created_by: req?.user?.id,
      //     })
      //   );
      // }
      // await Promise.all(promises);

      await queryRunner.manager
        .getRepository(UserBusinessUnits)
        .remove(businessUnitsToRemove);

      promises = [];
      for (const businessUnit of userInterface?.business_units) {
        if (!userBusinessUnitIds.includes(businessUnit)) {
          const newUserBusinessUnits = new UserBusinessUnits();
          newUserBusinessUnits.user_id = userId;
          newUserBusinessUnits.business_unit_id = businessUnit;
          newUserBusinessUnits.tenant_id = req?.user?.tenant?.id;
          newUserBusinessUnits.created_by = req?.user?.id;
          promises.push(
            queryRunner.manager
              .getRepository(UserBusinessUnits)
              .insert(newUserBusinessUnits)
          );
        }
      }
      await Promise.all(promises);

      await updateKeyCloakUser(subdomain, user.keycloak_username, updatedUser);

      await queryRunner.commitTransaction();
      return {
        status: 'success',
        response: 'Changes Saved.',
        status_code: 204,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(`Exception occured: ${error} ${error?.stack}`);
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async updateManager(userInterface: any, subdomain: string, userData: any) {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      const userId = userInterface?.id;
      const user = await this.userRepository.findOne({
        where: { id: userId, is_archived: false },
        relations: ['created_by', 'role'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await queryRunner.connect();
      await queryRunner.startTransaction();

      const updatedUser = {
        assigned_manager: userInterface?.assigned_manager,
        created_at: new Date(),
        created_by: this.request?.user,
      };

      await this.userRepository.update({ id: userId }, { ...updatedUser });

      await queryRunner.commitTransaction();
      return {
        status: 'success',
        response: 'Changes Saved.',
        status_code: 204,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to update user data.');
    } finally {
      await queryRunner.release();
    }
  }

  async updatePassword(
    id: any,
    resetPasswordInterface: ResetPasswordInterface,
    subdomain: string,
    req: any
  ) {
    const userId = id;
    const user: any = await this.userRepository.findOne({
      where: { id: userId, is_archived: false },
      relations: ['tenant'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const url = user?.tenant?.admin_domain;
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    const keycloakDomain = parts.length > 3 ? parts[1] : parts[0];
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      const userId = id;
      const user: any = await this.userRepository.findOne({
        where: { id: userId, is_archived: false },
        relations: ['tenant'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      const url = user?.tenant?.admin_domain;
      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      const keycloakDomain = parts.length > 3 ? parts[1] : parts[0];

      await queryRunner.connect();
      await queryRunner.startTransaction();
      const passwordHash = await bcrypt.hash(
        resetPasswordInterface.password,
        +process.env.BCRYPT_SALT_ROUNDS ?? 10
      );
      await this.userRepository.update(
        { id: userId },
        {
          password: passwordHash,
          // updated_by:resetPasswordInterface?.updated_by
          created_at: new Date(),
          created_by: this.request?.user,
        }
      );

      // const tenant: Tenant = await this.tenantRepository.findOne({where: {id: user?.tenant?.id}});
      // subdomain = getSubdomain(tenant?.admin_domain) ?? subdomain;
      const isPasswordUpdated = await updateKeyCloakPassword(
        keycloakDomain,
        user.keycloak_username,
        resetPasswordInterface.password
      );

      if (!isPasswordUpdated) {
        const userData = await this.userRepository.findOne({
          where: {
            id: userId,
          },
        });

        await createKeyCloakUser(
          keycloakDomain,
          resetPasswordInterface.password,
          userData
        );
      }
      await queryRunner.commitTransaction();
      // Return a success response
      return {
        status: 'success',
        response: 'Changes Saved.',
        status_code: 204,
      };
    } catch (error) {
      // Rollback the transaction in case of any errors
      await queryRunner.rollbackTransaction();
      console.log(error);

      throw new InternalServerErrorException('Failed to update user data.');
    } finally {
      // Release the queryRunner, whether the transaction succeeded or failed
      await queryRunner.release();
    }
  }

  async updateAccountSate(id: any, accountState) {
    try {
      const user: any = await this.userRepository.findOne({
        where: { id, is_archived: false },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      user.account_state = accountState?.account_state;
      user.created_at = new Date();
      user.created_by = this.request?.user;
      await this.userRepository.save(user);
      return resSuccess(
        'Resource update',
        SuccessConstants.SUCCESS,
        HttpStatus.NO_CONTENT,
        null
      );
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< User update account state >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['tenant'],
    });
  }
  findDeletedUser(email: string) {
    return this.userRepository.findOne({
      withDeleted: true,
      where: { email, deleted_at: Not(IsNull()) },
    });
  }
  async findByKCUsername(username: string) {
    try {
      const user: any = await this.userRepository.findOne({
        where: { keycloak_username: username },
        relations: ['tenant', 'tenant.tenant_time_zones', 'role'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      let permissions: any = [];
      if (user?.role?.id) {
        permissions = await this.permissionsRepository.find({
          where: {
            rolePermissions: {
              role: {
                id: user.role.id,
              },
            },
          },
          relations: ['rolePermissions.role', 'application', 'module'],
        });
      }
      const module = [],
        application = [];
      if (permissions?.length) {
        permissions = permissions.map((permission) => {
          if (permission?.module) {
            const mod = module.find((mod) => mod === permission?.module?.code);
            if (!mod) {
              module.push(permission?.module?.code);
            }
          }
          if (permission?.application) {
            const app = application.find(
              (app) => app === permission?.application?.name
            );
            if (!app) {
              application.push(permission?.application?.name);
            }
          }
          return permission.code;
        });
      }
      user.permissions = permissions;
      user.application = application;
      user.module = module;
      // console.log({ permissions });
      return user;
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< User findByKCUsername >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log(error);
      return {
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      };
    }
  }

  async getRecruiters(user = null) {
    try {
      let where: any = {
        is_archived: false,
        is_active: true,
        is_impersonateable_user: false,
      };
      if (user) {
        where = {
          ...where,
          tenant: { id: user?.tenant?.id },
          role: {
            is_recruiter: true,
            is_active: true,
            is_archived: false,
            tenant_id: user?.tenant?.id,
          },
        };
      }

      const managerData: any = await this.userRepository.find({
        where,
        relations: [
          'role',
          'business_units',
          'business_units.business_unit_id',
        ],
        order: { ['last_name']: 'ASC' },
      });

      const result = managerData?.map((item) => {
        return {
          ...item,
          business_units: item?.business_units?.map((bItem) => {
            return {
              ...bItem,
              tenant_id: this.request.user?.tenant?.id,
            };
          }),
        };
      });

      return resSuccess(
        SuccessConstants.SUCCESS,
        'Recruiter found successfully',
        HttpStatus.OK,
        result
      );
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< User get recruiter >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getBusinessUnitRecruiters(user = null, id = null) {
    try {
      const userData: any = await this.userRepository.findOne({
        where: {
          id: user?.id,
        },
        relations: [
          'role',
          'tenant',
          'assigned_manager',
          'business_units',
          'business_units.business_unit_id',
          'hierarchy_level',
        ],
      });
      const where: any = { is_archived: false, is_active: true };
      const userBusinessUnitIds = userData?.business_units?.map(
        (bu) => bu.business_unit_id?.id
      );

      let businessUnitId = id && id !== 'undefined' ? id : null;
      let businessUnitIds: any = [];

      if (businessUnitId) {
        businessUnitIds.push(businessUnitId);

        while (true) {
          const businessUnitData = await this.businessRepository.findOne({
            where: {
              ...where,
              tenant: { id: userData?.tenant?.id },
              id: businessUnitId,
            },
            relations: ['parent_level', 'tenant', 'organizational_level_id'],
          });
          if (businessUnitData && businessUnitData?.parent_level) {
            if (
              businessUnitData?.parent_level?.id !== userData?.business_unit?.id
            ) {
              businessUnitId = businessUnitData?.parent_level?.id;
              businessUnitIds.push(businessUnitId);
            } else {
              businessUnitIds.push(businessUnitData?.parent_level?.id);
              break;
            }
          } else {
            // businessUnitIds = [];
            break;
          }
        }
      } else if (userBusinessUnitIds.length) {
        let parentBusinessUnits = userBusinessUnitIds;
        businessUnitIds = userBusinessUnitIds;

        while (true) {
          const businessUnitData = await this.businessRepository.find({
            where: {
              ...where,
              tenant: { id: userData?.tenant?.id },
              parent_level: In(parentBusinessUnits),
            },
            relations: ['parent_level', 'tenant', 'organizational_level_id'],
          });
          const businessUnitMappedIds = businessUnitData.map(
            (businessUnit) => businessUnit.id
          );
          if (
            businessUnitData.length &&
            !businessUnitMappedIds.some((bu) => businessUnitIds.includes(bu))
          ) {
            businessUnitIds = businessUnitIds.concat(businessUnitMappedIds);
            const collectionOperations = businessUnitData.map(
              (businessUnit) =>
                businessUnit.organizational_level_id.is_collection_operation
            );
            if (collectionOperations.includes(true)) {
              break;
            } else {
              parentBusinessUnits = businessUnitIds;
            }
          } else {
            break;
          }
        }
      }

      const recruiters: any = await this.userRepository.find({
        where: {
          ...where,
          role: { is_recruiter: true },
          tenant: { id: userData?.tenant?.id },
          is_impersonateable_user: false,
          business_units: {
            business_unit_id: {
              id: In(businessUnitIds),
            },
          },
        },
        relations: [
          'role',
          'tenant',
          'assigned_manager',
          'business_units',
          'business_units.business_unit_id',
          'hierarchy_level',
        ],
      });

      return resSuccess(
        SuccessConstants.SUCCESS,
        'Recruiters fetched.',
        HttpStatus.OK,
        recruiters
      );
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< User getBusinessUnitRecruiters >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getAllUsers(user = null) {
    try {
      let where: any = {
        is_archived: false,
        is_active: true,
        is_impersonateable_user: false,
      };
      if (user) {
        where = { ...where, tenant: { id: user?.tenant?.id } };
      }
      const usersData: any = await this.userRepository.find({
        where,
        relations: ['tenant'],
        order: { last_name: 'ASC' },
      });

      return resSuccess(
        SuccessConstants.SUCCESS,
        'Users found successfully',
        HttpStatus.OK,
        usersData
      );
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< User get all >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async createKCUsers(dto: CreateKCUsersDto) {
    try {
      const tenant_id: any = dto?.tenant_id;
      const dsTemplateId: any = dto?.template_id;

      if (!tenant_id) {
        console.log(
          `Run using "yarn command create-kc-users tenant_id template_id" Tenant Id is missing in Arg 1`
        );
        return;
      }

      if (!dsTemplateId) {
        console.log(
          `Run using "yarn command create-kc-users tenant_id template_id" DS Template Id is missing in Arg 2`
        );
        return;
      }

      console.log(
        `Running for tenant with ID ${tenant_id} and DS Template ID ${dsTemplateId}`
      );

      const kcAdmin = await keyCloakAdmin();
      const tenantQuery = `select * from public.tenant where id=${tenant_id}`;
      const tenantData = await this.entityManager.query(tenantQuery);

      if (!tenantData || !tenantData?.length) {
        console.log(`Tenant not found`);
        return;
      }
      const url = tenantData?.[0]?.admin_domain;

      console.log({ url });

      if (!url) {
        console.log(`Admin Domain not found`);
        return;
      }

      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      const subdomain = parts.length > 3 ? parts[1] : parts[0];
      const realms = await kcAdmin.realms.find();
      const realm = realms.find((realm: any) => realm.realm === subdomain);
      if (!realm) {
        console.log(`Realm not exists!!`);
        return;
      }

      const realmName = realm.realm;
      console.log(`Realm name is ${realmName}`);

      const token = decryptSecretKey(tenantData?.[0]?.dailystory_token);
      if (!token) {
        console.log(`DS Config not found`);
        return;
      }
      console.log(`DS Token ${token}`);

      const userList = await this.entityManager.query(
        `select * from public.user where tenant_id=${tenant_id} and is_archived=false`
      );
      console.log(`Iterating ${userList.length} users`);

      for (const user of userList) {
        // const email = 'user@gmail.com'; // dev
        const email = user.email;
        const kcUser = await kcAdmin.users.findOne({
          realm: realmName,
          username: email,
        });
        console.log({ kcUser });

        if (!kcUser || !kcUser.length) {
          const password = generateRandomString(12);
          console.log(
            `Createing KC User with Email ${email} and Password => ${password}`
          );
          const createdUser = await kcAdmin.users.create({
            realm: realmName,
            username: email.toLowerCase(),
            email: email,
            enabled: true,
            attributes: user,
          });

          await kcAdmin.users.resetPassword({
            realm: realmName,
            id: createdUser.id,
            credential: {
              temporary: false,
              value: password,
            },
          });

          await this.updateUser(password, user.id, tenant_id);
          await sendDSEmail(
            dsTemplateId,
            email,
            {
              firstname: user.first_name,
              user_name: email,
              user_password: password,
            } as any,
            token
          );
          console.log({ createdUser });
        } else {
          console.log(`User with ID ${user.id} exists in KC, Skipping`);
        }
      }
    } catch (error) {
      console.error(`Exception occured: ${error}`);
    } finally {
      console.log(`Done Creating users`);
    }
  }

  async updateUser(password, id, tenant_id) {
    const query = `update public.user set password='${password}' where id=${id} and tenant_id=${tenant_id}`;
    await this.entityManager.query(query);
  }
  // async getCollectionOperationOwner(user: any, ids: any) {
  //   try {
  //     const collection_operation_ids: any = await JSON.parse(ids);

  //     const businessUnitsData: any = await this.businessRepository.findOne({
  //       where: {
  //         id: In(collection_operation_ids),
  //       },
  //       relations: ['organizational_level_id'],
  //     });
  //     const where: any = { is_archived: false, is_active: true };
  //     let owners: any = [];

  //     if (businessUnitsData?.organizational_level_id?.is_collection_operation) {
  //       owners = await this.userRepository.find({
  //         where: {
  //           ...where,
  //           tenant: { id: user?.tenant?.id },
  //           business_units: {
  //             id: In(collection_operation_ids),
  //           },
  //         },
  //         relations: ['tenant', 'business_units'],
  //       });
  //     } else {
  //       const childOrganizationLevels =
  //         await this.organizationalLevelRepository.find({
  //           where: {
  //             parent_level: {
  //               id: businessUnitsData?.organizational_level_id?.id,
  //             },
  //           },
  //           relations: ['parent_level'],
  //         });

  //       const childOrganizationLevelIds = childOrganizationLevels.map(
  //         (level) => level.id
  //       );

  //       const businessUnits = await this.businessRepository.find({
  //         where: {
  //           organizational_level_id: {
  //             id: In(childOrganizationLevelIds),
  //           },
  //         },
  //         relations: ['organizational_level_id'],
  //       });

  //       const businessUnitsIds = businessUnits.map((level) => level.id);
  //       owners = await this.userRepository.find({
  //         where: {
  //           ...where,
  //           tenant: { id: user?.tenant?.id },
  //           business_units: {
  //             id: In(businessUnitsIds),
  //           },
  //         },
  //         relations: ['tenant', 'business_units'],
  //       });
  //     }

  //     return resSuccess(
  //       SuccessConstants.SUCCESS,
  //       'Owners fetched.',
  //       HttpStatus.OK,
  //       owners
  //     );
  //   } catch (error) {
  //     console.log(
  //       '<<<<<<<<<<<<<<<<<<<<<<< User get collection operation owner >>>>>>>>>>>>>>>>>>>>>>>>>'
  //     );
  //     console.log(error);
  //     return resError(error.message, ErrorConstants.Error, error.status);
  //   }
  // }

  async getCollectionOperationOwner(user: any, ids: any) {
    try {
      const collection_operation_ids: any = await JSON.parse(ids);
      let owners: any = [];
      const ownersQuery = await this.userBusinessUnitsRepository
        .createQueryBuilder('user-business-units')
        .select([
          '(user.id) AS id',
          '(user.first_name) AS first_name',
          '(user.last_name) AS last_name',
        ])
        .leftJoin('user', 'user', 'user-business-units.user_id = user.id')
        .where(
          `user-business-units.is_archived =false AND user-business-units.business_unit_id IN (${collection_operation_ids})`
        )
        .groupBy('user.id')
        .getQuery();
      owners = await this.userBusinessUnitsRepository.query(ownersQuery);
      return resSuccess(
        SuccessConstants.SUCCESS,
        'Owners fetched.',
        HttpStatus.OK,
        owners
      );
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< User get collection operation owner >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getUserByEmail(email: string) {
    try {
      const workEmail = email?.trim()?.toLowerCase();
      const userData: any = await this.userRepository.findOne({
        where: {
          email: workEmail,
          is_archived: false,
          tenant_id: this.request.user?.tenant?.id,
        },
        relations: [
          'role',
          'created_by',
          'assigned_manager',
          'business_units',
          'business_units.business_unit_id',
          'hierarchy_level',
        ],
      });
      delete userData?.password;
      if (!userData) {
        throw new NotFoundException('User not found');
      }
      const userId = Number(userData.id);
      const { tenant, ...user } = userData;
      let created_by = null;
      if (tenant?.has_superadmin) {
        created_by = {
          ...user,
          tenant_id: this.request.user.tenant?.id,
        };
      } else {
        created_by = {
          ...user,
        };
      }

      const {
        role,
        created_by: created,
        assigned_manager,
        business_unit,
        business_units,
        hierarchy_level,
        ...rest
      } = created_by;

      created_by = rest;
      if (user) {
        const modifiedData: any = await getModifiedDataDetails(
          this.userHistoryRepository,
          userId,
          this.userRepository,
          this.request?.user?.tenant?.id
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.modified_by;
        user.modified_at = user.created_at;
        user.modified_by = created_by;
        user.created_at = modified_at ? modified_at : user.created_at;
        user.created_by = modified_by ? modified_by : created_by;
      }
      return resSuccess(
        SuccessConstants.SUCCESS,
        'User found Successfully',
        HttpStatus.OK,
        { ...user }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async getAdminUser(tenantId) {
    try {
      const tenant: any = await this.tenantRepository.findOne({
        where: {
          id: tenantId,
        },
      });
      if (!tenant) {
        throw new NotFoundException('tenant not found');
      }
      const where: any = {
        tenant: {
          id: tenant.id,
        },
        is_impersonateable_user: true,
      };
      const user = await this.userRepository.findOne({
        where,
        relations: ['tenant'],
      });
      if (!user) {
        throw new NotFoundException('Admin user not found');
      }
      return resSuccess(
        SuccessConstants.SUCCESS,
        'Admin user found Successfully',
        HttpStatus.OK,
        user
      );
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< User getAdminUser >>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}

async function createKeyCloakUser(
  realmName: string,
  password: string,
  userData: any = {}
) {
  try {
    const kcAdmin = await keyCloakAdmin();
    if (realmName) {
      const user = await kcAdmin.users.create({
        realm: realmName,
        username: userData.email.toLowerCase(),
        email: userData.email,
        enabled: true,
        attributes: userData,
      });
      await kcAdmin.users.resetPassword({
        realm: realmName,
        id: user.id,
        credential: {
          temporary: false,
          value: password,
        },
      });

      return 'User created successfully';
    } else {
      throw new Error('Provide input');
    }
  } catch (err) {
    return resError('Iternal', ErrorConstants.Error, 400);
  }
}

async function updateKeyCloakUser(
  realmName: string,
  userName: string,
  userData: any = {}
) {
  try {
    const kcAdmin = await keyCloakAdmin();
    if (realmName && userName) {
      const user = await kcAdmin.users.findOne({
        realm: realmName,
        username: userName,
      });

      if (!user) {
        throw new Error('User not found in Keycloak');
      }

      const response = await fetch(
        `${kcAdmin.baseUrl}/admin/realms/${realmName}/users/${user[0].id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${kcAdmin.accessToken}`,
          },
          body: JSON.stringify({
            attributes: userData,
            email: userData.email,
            username: userData.email,
          }),
        }
      );

      if (response.status === 204)
        return 'User archived successfully in Keycloak';
      else throw new Error('User not updated');
    } else {
      throw new Error('Provide input');
    }
  } catch (error) {
    console.log(
      '<<<<<<<<<<<<<<<<<<<<<<< User updating Keycloak user >>>>>>>>>>>>>>>>>>>>>>>>>'
    );
    console.error({ error });
    // throw new Error('Failed to update Keycloak user.');
  }
}

async function archiveKeyCloakUser(realmName: string, user: User) {
  const kcAdmin = await keyCloakAdmin();
  if (kcAdmin) {
    try {
      const kcUser = await kcAdmin.users.findOne({
        realm: realmName,
        username: user.email,
      });
      if (kcUser) {
        const response = await fetch(
          `${kcAdmin.baseUrl}/admin/realms/${realmName}/users/${kcUser[0].id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${kcAdmin.accessToken}`,
            },
            body: JSON.stringify({ enabled: false }),
          }
        );
        if (response.status === 204)
          return 'User archived successfully in Keycloak';
        else throw new Error('User not updated');
      } else {
        throw new Error('User not found in Keycloak');
      }
    } catch (error) {
      throw error;
    }
  }
}

async function updateKeyCloakPassword(
  realmName: string,
  email: string,
  newPassword: string
) {
  const kcAdmin = await keyCloakAdmin();
  if (kcAdmin) {
    try {
      const kcUser = await kcAdmin.users.find({
        realm: realmName,
      });
      if (kcUser) {
        const existingUser = kcUser.find(
          (user: any) => user.username === email
        );
        if (existingUser) {
          await kcAdmin.users.resetPassword({
            realm: realmName,
            id: existingUser.id,
            credential: {
              temporary: false,
              value: newPassword,
            },
          });
          return true;
        }
      }

      return false;
    } catch (error) {
      throw error;
    }
  }
}
