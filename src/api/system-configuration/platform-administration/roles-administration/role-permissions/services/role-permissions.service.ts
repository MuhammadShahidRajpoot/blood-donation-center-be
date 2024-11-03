import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  CreateRolePermissionDto,
  CreateTenantRolePermissionDto,
} from '../dto/create-role-permission.dto';
import { UpdateRolePermissionDto } from '../dto/update-role-permission.dto';
import { ILike, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Modules } from '../entities/module.entity';
import {
  GetAllPermissionsInterface,
  GetAllRolesInterface,
  RemovePermissionsInterface,
} from '../interface/rolePermission.interface';
import { Permissions } from '../entities/permission.entity';
import { RolePermission } from '../entities/rolePermission.entity';
import { Roles } from '../entities/role.entity';
import { ArchiveRoleInterface } from '../interface/archiveRole.interface';
import { resError, resSuccess } from '../../../../helpers/response';
import { SuccessConstants } from '../../../../constants/success.constants';
import { ErrorConstants } from '../../../../constants/error.constants';
import { User } from '../../../../tenants-administration/user-administration/user/entity/user.entity';
import { RolesHistory } from '../entities/roleHistory';
import { TenantRole } from '../entities/tenantRole.entity';
import { Tenant } from '../../../tenant-onboarding/tenant/entities/tenant.entity';
import { getModifiedDataDetails } from '../../../../../../common/utils/modified_by_detail';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
@Injectable()
export class RolePermissionsService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Modules)
    private readonly moduleRepository: Repository<Modules>,
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantRole)
    private readonly tenantRoleRepository: Repository<TenantRole>,
    @InjectRepository(Permissions)
    private readonly permissionsRepository: Repository<Permissions>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
    @InjectRepository(RolesHistory)
    private readonly rolesHistoryRepository: Repository<RolesHistory>
  ) {}

  async checkIfRecruiterRoleExists(roleData: Roles, tenantId: bigint) {
    function isTenant(obj: any): obj is Tenant {
      return obj instanceof Tenant;
    }
    if (
      roleData?.is_recruiter &&
      isTenant(roleData?.tenant) &&
      roleData?.tenant.id == tenantId
    ) {
      return true;
    } else {
      return false;
    }
  }

  async create(createRolePermissionDto: CreateRolePermissionDto, user) {
    try {
      await this.checkIfUserExists(createRolePermissionDto?.created_by);
      const whereCondition: any = {
        name: createRolePermissionDto?.name,
        tenant: {
          id: user?.tenant?.id,
        },
      };
      let roleData: any = await this.rolesRepository.findOne({
        where: whereCondition,
        relations: ['tenant'],
      });
      if (roleData) {
        if (await this.checkIfRecruiterRoleExists(roleData, user?.tenant?.id)) {
          resError(
            `Recruiter role already exists.`,
            ErrorConstants.Error,
            HttpStatus.CONFLICT
          );
        } else {
          resError(
            `Role already exists.`,
            ErrorConstants.Error,
            HttpStatus.CONFLICT
          );
        }
      }

      const permissions = await this.permissionsRepository.findBy({
        code: In(createRolePermissionDto?.permissions),
      });
      if (permissions && !permissions.length) {
        resError(
          `Permissions not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      roleData = new Roles();
      roleData.name = createRolePermissionDto.name;
      roleData.description = createRolePermissionDto?.description ?? null;
      roleData.created_by = createRolePermissionDto?.created_by;
      roleData.is_active = createRolePermissionDto?.is_active ?? true;
      roleData.tenant_id = user.tenant?.id;
      const savedRole = await this.rolesRepository.save(roleData);
      const rolePermission = [];
      for (const permission of permissions) {
        rolePermission.push({
          permission: permission.id,
          role: savedRole.id,
          created_by: savedRole.created_by,
        });
      }
      await this.rolePermissionRepository.save(rolePermission);
      return resSuccess(
        '',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedRole
      );
    } catch (e) {
      return resError(e.message, ErrorConstants.Error, e.status);
    }
  }

  async createRoleByTenant(
    createRolePermissionDto: CreateTenantRolePermissionDto,
    user
  ) {
    try {
      const whereCondition: any = {
        name: createRolePermissionDto?.name,
        tenant: {
          id: user?.tenant?.id,
        },
      };
      await this.checkIfUserExists(user.id);
      let roleData = await this.rolesRepository.findOne({
        where: whereCondition,
        relations: ['tenant'],
      });
      if (roleData) {
        if (await this.checkIfRecruiterRoleExists(roleData, user?.tenant?.id)) {
          resError(
            `Recruiter role already exists.`,
            ErrorConstants.Error,
            HttpStatus.CONFLICT
          );
        } else {
          resError(
            `Role already exists.`,
            ErrorConstants.Error,
            HttpStatus.CONFLICT
          );
        }
      }

      const tenant = await this.tenantRepository.findOneBy({
        id: user.tenant.id,
      });
      if (!tenant) {
        resError(
          `Tenant does not exist.`,
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }
      const permissions = await this.permissionsRepository.findBy({
        code: In(createRolePermissionDto?.permissions),
      });
      if (permissions && !permissions.length) {
        resError(
          `Permissions not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      roleData = new Roles();
      roleData.name = createRolePermissionDto.name;
      roleData.description = createRolePermissionDto?.description ?? null;
      roleData.created_by = user.id;
      roleData.is_active = createRolePermissionDto?.is_active ?? true;
      roleData.is_recruiter = createRolePermissionDto?.is_recruiter;
      roleData.tenant_id = tenant?.id;

      const savedRole = await this.rolesRepository.save(roleData);

      const tenantRole = new TenantRole();
      tenantRole.role = roleData;
      tenantRole.tenant_id = tenant?.id;
      await this.tenantRoleRepository.save(tenantRole);
      const rolePermission = [];
      console.log(permissions, 'f');
      for (const permission of permissions) {
        rolePermission.push({
          permission: permission.id,
          role: savedRole.id,
          created_by: savedRole.created_by,
        });
      }
      await this.rolePermissionRepository.save(rolePermission);
      return resSuccess(
        '',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedRole
      );
    } catch (e) {
      console.log(e);
      return resError(e.message, ErrorConstants.Error, e.status);
    }
  }

  async findAll(
    getAllPermissionsInterface: GetAllPermissionsInterface
  ): Promise<any> {
    try {
      const where = {
        permissions: {
          is_super_admin_permission:
            getAllPermissionsInterface?.isSuperAdminPermission || false,
        },
        // is_impersonateable_role: false,
        // is_auto_created: false,
      };
      if (getAllPermissionsInterface?.name) {
        Object.assign(where, {
          name: ILike(`%${getAllPermissionsInterface?.name}%`),
        });
      }
      const modules = await this.moduleRepository.find({
        where,
        relations: ['permissions', 'child_modules', 'application'],
        order: { id: 'ASC', permissions: { id: 'ASC' } },
      });

      const fetchChildrenRecursively = async (
        module: Modules
      ): Promise<Modules> => {
        module.child_modules = await this.moduleRepository.find({
          where: {
            parent_id: module.id,
          },
          relations: ['permissions', 'child_modules'],
          order: {
            permissions: { id: 'ASC' },
          },
        });

        for (const childModule of module.child_modules) {
          await fetchChildrenRecursively(childModule);
        }

        return module;
      };

      const rootModulesWithChildren = [];
      for (const rootModule of modules) {
        const result = await fetchChildrenRecursively(rootModule);
        if (result !== null) {
          const applicationName = rootModule.application?.name;
          const nameAlreadyExists = rootModulesWithChildren.some(
            (application) => application.name === applicationName
          );

          if (applicationName && !nameAlreadyExists) {
            const application = {
              name: applicationName,
              modules: [result],
            };
            rootModulesWithChildren.push(application);
          } else {
            for (let i = 0; i < rootModulesWithChildren.length; i++) {
              if (rootModulesWithChildren[i].name === applicationName) {
                rootModulesWithChildren[i].modules.push(result);
              }
            }
          }
        }
      }
      const response = {
        application: [...rootModulesWithChildren],
      };

      return resSuccess(
        'Permissions Fetched Successfully', // message
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        response
      );
    } catch (error) {
      console.log('error', error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async fetchChildrenRecursively(
    module: Modules,
    permissionIds: number[],
    tenant_id?: number
  ): Promise<Modules | null> {
    module.child_modules = await this.moduleRepository.find({
      where: { parent_id: module.id },
      relations: ['permissions', 'child_modules'],
    });

    let hasDesiredPermissions = module.permissions.some((permission) =>
      permissionIds.includes(Number(permission.id))
    );

    const nestedChildPromises = module.child_modules.map(
      async (childModule) => {
        const result = await this.fetchChildrenRecursively(
          childModule,
          permissionIds,
          tenant_id
        );

        if (result !== null) {
          hasDesiredPermissions = true;
          return { ...result, tenant_id: tenant_id };
        }
        return null;
      }
    );

    const nestedChildModules = await Promise.all(nestedChildPromises);
    module.child_modules = nestedChildModules.filter(
      (childModule) => childModule !== null
    );
    module.permissions = module.permissions
      .map((per) => ({ ...per, tenant_id }))
      .filter((permission) => permissionIds.includes(Number(permission.id)));

    return hasDesiredPermissions ? module : null;
  }

  async findAllRoles(getAllRolesInterface: GetAllRolesInterface, user) {
    try {
      if (getAllRolesInterface.fetchAll) {
        let searchOptions = {};

        if (getAllRolesInterface?.isActive !== '') {
          searchOptions = {
            is_active: getAllRolesInterface?.isActive,
          };
        }

        searchOptions = {
          ...searchOptions,
          tenant: {
            id: getAllRolesInterface.tenant_id
              ? getAllRolesInterface.tenant_id
              : user?.tenant?.id,
          },
          is_impersonateable_role: false,
        };
        const [roles, count] = await this.rolesRepository.findAndCount({
          relations: ['rolePermissions.permission', 'tenant'],
          where: {
            is_archived: false,
            ...searchOptions,
          },
        });
        return {
          status: SuccessConstants.SUCCESS,
          response: 'Roles Fetched Successfully',
          code: HttpStatus.OK,
          count: count,
          data: roles,
        };
      }

      const limit: number = getAllRolesInterface?.limit
        ? +getAllRolesInterface?.limit
        : +process.env.PAGE_SIZE;

      let page = getAllRolesInterface?.page ? +getAllRolesInterface?.page : 1;

      if (page < 1) {
        page = 1;
      }

      let searchOptions = {};

      if (getAllRolesInterface?.isActive !== '') {
        searchOptions = {
          is_active: getAllRolesInterface?.isActive,
        };
      }
      const responseData = [];

      searchOptions = {
        ...searchOptions,
        tenant: {
          id: getAllRolesInterface.tenant_id
            ? getAllRolesInterface.tenant_id
            : user?.tenant?.id,
        },
        is_impersonateable_role: false,
      };

      const [roles, count] = await this.rolesRepository.findAndCount({
        relations: ['rolePermissions.permission', 'tenant'],
        where: {
          is_archived: false,
          ...searchOptions,
        },
        take: limit,
        skip: (page - 1) * limit,
        order: { id: 'DESC' },
      });

      for (const role of roles) {
        const permissionIds = role.rolePermissions.map((permission) =>
          Number(permission?.permission?.id)
        );

        const modules = await this.moduleRepository.find({
          relations: ['permissions', 'child_modules', 'application'],
          order: { id: 'ASC' },
        });

        const rootModulesWithChildren = [];

        for (const rootModule of modules) {
          const result = await this.fetchChildrenRecursively(
            rootModule,
            permissionIds,
            Number(role.tenant.id)
          );

          if (result !== null) {
            const applicationName = rootModule.application?.name;
            const nameAlreadyExists = rootModulesWithChildren.some(
              (application) => application.name === applicationName
            );
            if (applicationName && !nameAlreadyExists) {
              const application = {
                name: applicationName,
                tenant_id: role.tenant.id,
                modules: [{ ...result, tenant_id: role.tenant.id }],
              };
              rootModulesWithChildren.push(application);
            } else {
              for (let i = 0; i < rootModulesWithChildren.length; i++) {
                if (rootModulesWithChildren[i].name === applicationName) {
                  rootModulesWithChildren[i].modules.push({
                    ...result,
                    tenant_id: role.tenant.id,
                  });
                }
              }
            }
          }
        }

        const data = {
          id: role.id,
          name: role.name,
          permission: {
            tenant_id: role.tenant.id,
            application: [...rootModulesWithChildren],
          },
          tenant_id: role.tenant.id,
        };
        responseData.push(data);
      }

      return {
        status: SuccessConstants.SUCCESS,
        response: 'Roles Fetched Successfully',
        code: HttpStatus.OK,
        count: count,
        data: responseData,
      };
    } catch (error) {
      console.log({ error });
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAllTenantRoles(getAllRolesInterface: GetAllRolesInterface, user) {
    try {
      const limit: number = getAllRolesInterface?.limit
        ? +getAllRolesInterface?.limit
        : +process.env.PAGE_SIZE;
      let page = getAllRolesInterface?.page ? +getAllRolesInterface?.page : 1;

      if (page < 1) {
        page = 1;
      }

      let orderObject = {};
      if (getAllRolesInterface?.sortBy) {
        const sortKey = getAllRolesInterface.sortBy;
        const sortOrder = getAllRolesInterface.sortOrder ?? 'DESC';
        orderObject = {
          role: { [sortKey === 'status' ? 'is_active' : sortKey]: sortOrder },
        };
      } else {
        orderObject = { id: 'DESC' };
      }

      const searchOptions = {};
      if (getAllRolesInterface?.search) {
        Object.assign(searchOptions, {
          name: ILike(`%${getAllRolesInterface.search}%`),
        });
      }

      if (getAllRolesInterface?.isActive !== '') {
        Object.assign(searchOptions, {
          is_active: getAllRolesInterface?.isActive,
        });
      }

      const [roles, count] = await this.tenantRoleRepository.findAndCount({
        relations: [
          'role',
          // 'tenant'
        ],
        where: {
          tenant: { id: user.tenant.id },
          role: {
            is_archived: false,
            ...searchOptions,
          },
        },
        take: limit,
        skip: (page - 1) * limit,
        order: { ...orderObject },
      });
      return {
        status: SuccessConstants.SUCCESS,
        response: 'Roles Fetched Successfully',
        code: HttpStatus.OK,
        count: count,
        data: roles,
      };
    } catch (error) {
      console.log({ error });
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOneRole(id: any) {
    try {
      const role: any = await this.rolesRepository.findOne({
        where: { id: id },
        relations: ['rolePermissions.permission', 'created_by'],
      });

      if (!role) {
        return resSuccess(
          'No data found',
          SuccessConstants.SUCCESS,
          HttpStatus.NOT_FOUND,
          null
        );
      }

      if (role?.is_archived) {
        return resSuccess(
          'Role is archived',
          SuccessConstants.SUCCESS,
          HttpStatus.NOT_FOUND,
          null
        );
      }

      const permissionIds = role?.rolePermissions?.map((permission) =>
        Number(permission.permission?.id)
      );
      const modules = await this.moduleRepository.find({
        relations: ['permissions', 'child_modules', 'application'],
        order: { id: 'ASC' },
      });

      const rootModulesWithChildren = [];

      for (const rootModule of modules) {
        const result = await this.fetchChildrenRecursively(
          rootModule,
          permissionIds
        );
        if (result !== null) {
          const applicationName = rootModule.application?.name;
          const nameAlreadyExists = rootModulesWithChildren.some(
            (application) => application.name === applicationName
          );

          if (applicationName && !nameAlreadyExists) {
            const application = {
              name: applicationName,
              modules: [result],
            };
            rootModulesWithChildren.push(application);
          } else {
            for (let i = 0; i < rootModulesWithChildren.length; i++) {
              if (rootModulesWithChildren[i].name === applicationName) {
                rootModulesWithChildren[i].modules.push(result);
              }
            }
          }
        }
      }

      if (role) {
        const modifiedData: any = await getModifiedDataDetails(
          this.rolesHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        role.modified_by = role.created_by;
        role.modified_at = role.created_at;
        role.created_at = modified_at ? modified_at : role.created_at;
        role.created_by = modified_by ? modified_by : role.created_by;
      }
      const data = {
        id: role?.id,
        name: role?.name,
        created_by: role?.created_by,
        // modified_by: modifiedData?.modified_by,
        description: role?.description,
        is_active: role?.is_active,
        is_archived: role?.is_archived,
        permission: {
          application: [...rootModulesWithChildren],
        },
        created_at: role?.created_at,
        modified_at: role?.modified_at,
        modified_by: role?.modified_by,
      };
      // return data;
      return resSuccess(
        'Role Found Successfuly',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        data
      );
    } catch (err) {
      console.log({ err });
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOneTenantRole(id: any, req: UserRequest) {
    try {
      const role: any = await this.rolesRepository.findOne({
        where: { id: id, tenant_id: req?.user?.tenant?.id },
        relations: ['rolePermissions.permission', 'created_by', 'tenant'],
      });

      if (!role) {
        return resSuccess(
          'No data found',
          SuccessConstants.SUCCESS,
          HttpStatus.NOT_FOUND,
          null
        );
      }

      if (role?.is_archived) {
        return resSuccess(
          'Role is archived',
          SuccessConstants.SUCCESS,
          HttpStatus.NOT_FOUND,
          null
        );
      }

      if (role) {
        const modifiedData: any = await getModifiedDataDetails(
          this.rolesHistoryRepository,
          id,
          this.userRepository,
          req?.user?.tenant?.id
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        role.modified_by = role.created_by;
        role.modified_at = role.created_at;
        role.created_at = modified_at ? modified_at : role.created_at;
        role.created_by = modified_by ? modified_by : role.created_by;
      }

      const permissionIds = role?.rolePermissions?.map(
        (permission) => permission.permission?.code
      );

      const data = {
        id: role?.id,
        name: role?.name,
        created_by: role?.created_by,
        description: role?.description,
        is_active: role?.is_active,
        is_archived: role?.is_archived,
        is_recruiter: role?.is_recruiter,
        is_auto_created: role?.is_auto_created,
        permission: permissionIds,
        created_at: role?.created_at,
        tenant_id: req?.user?.tenant?.id,
        modified_at: role?.modified_at,
        modified_by: role?.modified_by,
        cc_role_name: role.cc_role_name,
      };
      return resSuccess(
        'Role Found Successfuly',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        data
      );
    } catch (err) {
      console.log({ err });
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  async findAssignedTenantRole(
    getAllRolesInterface: GetAllRolesInterface,
    id: any
  ) {
    try {
      const limit: number = getAllRolesInterface?.limit
        ? +getAllRolesInterface?.limit
        : +process.env.PAGE_SIZE;
      let page = getAllRolesInterface?.page ? +getAllRolesInterface?.page : 1;

      if (page < 1) {
        page = 1;
      }

      const query: any = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .leftJoinAndSelect('user.assigned_manager', 'assigned_manager')
        .leftJoinAndSelect('user.hierarchy_level', 'hierarchy_level')
        .where({
          is_archived: false,
          role: { id: id },
        });

      if (getAllRolesInterface?.isActive !== '') {
        query.andWhere({
          is_active: getAllRolesInterface?.isActive,
        });
      }

      if (getAllRolesInterface?.search) {
        query.andWhere(
          "CONCAT(user.first_name, ' ', user.last_name) ILIKE :full_name",
          { full_name: `%${getAllRolesInterface?.search}%` }
        );
      }

      let orderObject = {};
      if (getAllRolesInterface?.sortBy) {
        const sortKey = getAllRolesInterface.sortBy;
        const sortOrder = getAllRolesInterface.sortOrder ?? 'DESC';
        if (sortKey === 'last_name') {
          orderObject = { 'user.last_name': sortOrder };
        } else if (sortKey === 'status') {
          orderObject = { 'role.is_active': sortOrder };
        }
      } else {
        orderObject = { 'user.id': 'DESC' };
      }
      const usersWithRoleId = await query
        .orderBy(orderObject)
        .take(limit)
        .skip((page - 1) * limit)
        .getMany();

      return resSuccess(
        'Users Fetch with this role',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        usersWithRoleId
      );
    } catch (e) {
      return resError(e.message, ErrorConstants.Error, e.status);
    }
  }
  async archiveRole(id: any, archiveRoleInterface: ArchiveRoleInterface) {
    try {
      const roleToUpdate = await this.rolesRepository.findOne({
        where: { id: id },
        relations: ['tenant'],
      });

      if (!roleToUpdate) {
        return resSuccess(
          'Role not found',
          SuccessConstants.SUCCESS,
          HttpStatus.NOT_FOUND,
          null
        );
      }

      if (archiveRoleInterface?.is_archived) {
        let archivedRole: any;
        if (roleToUpdate.is_archived === false) {
          roleToUpdate.is_archived = true;
          archivedRole = await this.rolesRepository.save(roleToUpdate);
        }

        Object.assign(archivedRole, {
          tenant_id: archivedRole?.tenant?.id,
        });
        return resSuccess(
          'Role archived successfully',
          SuccessConstants.SUCCESS,
          HttpStatus.OK,
          null
        );
      } else {
        let unArchivedRole: any;
        if (roleToUpdate.is_archived === true) {
          roleToUpdate.is_archived = false;
          unArchivedRole = await this.rolesRepository.save(roleToUpdate);
        }

        Object.assign(unArchivedRole, {
          tenant_id: unArchivedRole?.tenant?.id,
        });
        return resSuccess(
          'Role unarchived successfully',
          SuccessConstants.SUCCESS,
          HttpStatus.OK,
          null
        );
      }
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} rolePermission`;
  }

  async updateRole(id: any, updateRolePermissionDto: UpdateRolePermissionDto) {
    try {
      const roleToUpdate: any = await this.rolesRepository.findOne({
        where: {
          id: id,
        },
        relations: ['created_by'],
      });

      if (!roleToUpdate) {
        resError(`Role not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }

      this.checkIfRoleArchived(roleToUpdate);

      const {
        name,
        description,
        is_active,
        created_by,
        permissions,
        is_recruiter,
        updated_by,
      } = updateRolePermissionDto;

      if (created_by) {
        await this.checkIfUserExists(created_by);
      }

      this.updateRoleFields(
        roleToUpdate,
        name,
        description,
        is_active,
        created_by,
        is_recruiter,
        updated_by
      );

      if (permissions && permissions.length > 0) {
        await this.updateRolePermissions(roleToUpdate, permissions);
      }
      roleToUpdate.created_by = this.request?.user;
      roleToUpdate.created_at = new Date();
      const updatedRole = await this.rolesRepository.save(roleToUpdate);
      const usersWithRoleId: any = await this.userRepository.find({
        relations: ['role'],
      });
      for (const user of usersWithRoleId) {
        if (user?.role && user?.role?.id === id) {
          console.log(user, user.role);
          await this.userRepository.update(user.id, {
            last_permissions_updated: new Date(),
          });
        }
      }
      delete updatedRole?.created_by;
      return resSuccess(
        'Role updated successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        updatedRole
      );
    } catch (e) {
      return resError(e.message, ErrorConstants.Error, e.status);
    }
  }
  async getAllRoles(user) {
    try {
      const searchOptions: any = {
        tenant: { id: user?.tenant?.id },
      };
      const roles: any = await this.rolesRepository.find({
        where: {
          is_archived: false,
          is_active: true,
          ...searchOptions,
        },
      });
      return {
        status: SuccessConstants.SUCCESS,
        response: 'Roles Fetched Successfully',
        code: HttpStatus.OK,
        data: roles,
      };
    } catch (error) {
      console.log(
        '<<<<<<<<<<<<<<<<<<<<<<< Role and Permissions  getAllRoles>>>>>>>>>>>>>>>>>>>>>>>>>'
      );
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async getAllTenantRole(user) {
    try {
      const [roles, count] = await this.tenantRoleRepository.findAndCount({
        where: {
          tenant: { id: user.tenant.id },
          role: {
            is_archived: false,
            is_active: true,
            tenant_id: user.tenant.id,
          },
        },
        relations: ['role'],
      });
      return {
        status: SuccessConstants.SUCCESS,
        response: 'Roles Fetched Successfully',
        code: HttpStatus.OK,
        count: count,
        data: roles,
      };
    } catch (error) {
      console.log({ error });
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  // Helper function to check if the role is archived and throw an error if it is.
  checkIfRoleArchived(role: any) {
    if (role?.is_archived) {
      resError(
        `Role is archived and cannot be updated`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }
  }

  // Helper function to check if the user exists and throw an error if not found.
  async checkIfUserExists(userId: any) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      resError(`User not found`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
    }
  }

  // Helper function to get the tenant id from the User
  async getTenantIdFromUser(userId: any) {
    const user = await this.userRepository.findOneBy({ id: userId });
    console.log({ user });

    return user ? user?.tenant : null;
  }

  // Helper function to update the role fields based on the provided values.
  updateRoleFields(
    role: any,
    name: string,
    description: string,
    is_active: boolean,
    created_by: any,
    is_recruiter: boolean,
    updated_by: any
  ) {
    role.name = name ?? role.name;
    role.updated_by =
      Number(created_by) !== 0 && created_by !== null
        ? created_by
        : role?.created_by?.id;
    role.created_by =
      updated_by && Number(updated_by) !== 0 && updated_by !== null
        ? updated_by
        : role?.created_by?.id;
    role.description = description ?? role.description;
    role.is_active = is_active ?? role.is_active;
    role.is_recruiter = is_recruiter ?? role.is_recruiter;
    // role.created_at = new Date(
  }

  // Helper function to update role permissions and handle missing permissions.
  async updateRolePermissions(role: any, permissions: any[]) {
    const permissionsFound = await this.permissionsRepository.findBy({
      code: In(permissions),
    });

    if (permissionsFound && !permissionsFound.length) {
      resError(
        `Some permissions not found.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }

    const rolePermission = [];
    for (const permission of permissionsFound) {
      rolePermission.push({
        permission: permission.id,
        role: role.id,
        created_by: role.created_by,
      });
    }

    await this.rolePermissionRepository.delete({ role: role.id });
    await this.rolePermissionRepository.save(rolePermission);
  }

  async updateRolePermissionHistory(data: any, action: string) {
    const roleHistoryC: RolesHistory = new RolesHistory();
    roleHistoryC.history_reason = 'C';
    roleHistoryC.role_name = data?.name;
    roleHistoryC.role_description = data?.description;
    roleHistoryC.id = data?.id;
    roleHistoryC.created_by = data?.created_by;
    roleHistoryC.is_active = data?.is_active;
    roleHistoryC.is_auto_created = data?.is_auto_created;
    await this.rolesHistoryRepository.save(roleHistoryC);

    if (action === 'D') {
      const roleHistoryD: RolesHistory = new RolesHistory();
      roleHistoryD.history_reason = 'D';
      roleHistoryD.role_name = data?.name;
      roleHistoryD.role_description = data?.description;
      roleHistoryD.id = data?.id;
      roleHistoryD.created_by = data?.created_by;
      roleHistoryD.is_active = data?.is_active;
      roleHistoryD.is_auto_created = data?.is_auto_created;
      await this.rolesHistoryRepository.save(roleHistoryD);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} rolePermission`;
  }

  async removePermission(
    removePermissionsInterface: RemovePermissionsInterface
  ) {
    const role: any = await this.rolesRepository.findOne({
      where: {
        id: removePermissionsInterface.roleId,
      },
      relations: ['created_by'],
    });

    if (!role) {
      resError(`Role not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
    }

    const permission: any = await this.permissionsRepository.findOne({
      where: {
        code: removePermissionsInterface.permissionId,
      },
    });

    if (!permission) {
      resError(
        `Permission not found.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }
    console.log({
      role: role.id,
      permission: permission.id,
    });

    const result = await this.rolePermissionRepository
      .createQueryBuilder('role_permission')
      .delete()
      .from('role_permission')
      .where('role = :role', { role: role.id })
      .andWhere('permission = :permission', { permission: permission.id })
      .execute();

    return resSuccess(
      'Permission removed successfully',
      SuccessConstants.SUCCESS,
      HttpStatus.OK,
      {}
    );
  }
}
