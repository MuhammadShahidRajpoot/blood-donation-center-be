import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import {
  ArchiveDto,
  CreateContactsRoleDto,
} from '../dto/create-contacts-role.dto';
import { UpdateContactsRoleDto } from '../dto/update-contacts-role.dto';
import { ContactsRoles } from '../entities/contacts-role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, ILike, Repository, Not } from 'typeorm';
import { User } from '../../../../user-administration/user/entity/user.entity';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { GetAllRolesInterface } from '../interface/contact-role.interface';
import { ContactsRolesHistory } from '../entities/contact-role-history.entity';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { customSort } from 'src/api/utils/sorting';
import { FunctionTypeEnum } from 'src/api/common/enums/polymorphic-type.enum';
import { AccountContacts } from 'src/api/crm/accounts/entities/accounts-contacts.entity';

@Injectable({ scope: Scope.REQUEST })
export class ContactsRoleService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(ContactsRoles)
    private readonly contactsRolesRepository: Repository<ContactsRoles>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ContactsRolesHistory)
    private readonly contactsRolesHistoryRepo: Repository<ContactsRolesHistory>,
    @InjectRepository(AccountContacts)
    private readonly accountContactRepository: Repository<AccountContacts>,
    private readonly entityManager: EntityManager
  ) {}

  async create(createContactsRoleDto: CreateContactsRoleDto) {
    try {
      const user = await this.userRepository.findOneBy({
        id: createContactsRoleDto?.created_by,
      });

      if (!user) {
        resError(`User not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }
      const short_name = await this.contactsRolesRepository.findOneBy({
        short_name: createContactsRoleDto?.short_name,
      });

      if (short_name) {
        resError(
          `Short Name duplicate already exists.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const role_name = await this.contactsRolesRepository.findOneBy({
        name: ILike(createContactsRoleDto?.name.trim()),
        is_archived: false,
        tenant_id: this?.request?.user?.tenant?.id,
      });

      if (role_name) {
        resError(
          `Role Name duplicate already exists.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const createContactRole = new ContactsRoles();
      const keys = Object.keys(createContactsRoleDto);

      for (const key of keys) {
        createContactRole[key] = createContactsRoleDto?.[key];
      }

      const savedContactRole = await this.contactsRolesRepository.save({
        ...createContactRole,
        tenant_id: this?.request?.user?.tenant?.id,
      });

      return resSuccess(
        'Contact roles Created Successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedContactRole
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findVolunteerContactRoles(user: any, query?: any) {
    try {
      console.log(query);
      const sort = customSort(query);
      const functionId: any = FunctionTypeEnum.VOLUNTEERS;
      const roles: any = await this.contactsRolesRepository.find({
        where: {
          is_archived: false,
          function_id: functionId,
          tenant_id: user.tenant.id,
          status: true,
        },
        order: sort,
      });
      return resSuccess(
        'Volunteer roles found successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        roles
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAll(
    getAllrolesInterface: GetAllRolesInterface,
    user: any
  ): Promise<any> {
    try {
      const fetchAll = getAllrolesInterface?.fetchAll === 'true';
      const limit: number = getAllrolesInterface?.limit
        ? +getAllrolesInterface?.limit
        : +process.env.PAGE_SIZE;

      let page = getAllrolesInterface?.page ? +getAllrolesInterface?.page : 1;

      if (page < 1) {
        page = 1;
      }

      const where = { is_archived: false };

      if (getAllrolesInterface?.function_id !== undefined) {
        // Filter based on both status and is_archived
        where['function_id'] = +getAllrolesInterface.function_id;
        Object.assign(where, {
          is_archived: 'false',
          status: 'true',
        });
      }
      if (getAllrolesInterface?.status !== undefined) {
        // Filter based on both status and is_archived
        where['status'] = getAllrolesInterface.status;
      }

      if (getAllrolesInterface?.staffable !== undefined) {
        // Filter based on both status and is_archived
        where['staffable'] = getAllrolesInterface.staffable;
      }

      if (getAllrolesInterface?.name) {
        Object.assign(where, {
          name: ILike(`%${getAllrolesInterface?.name}%`),
        });
      }

      if (getAllrolesInterface?.short_name) {
        Object.assign(where, {
          short_name: ILike(`%${getAllrolesInterface?.short_name}%`),
        });
      }
      Object.assign(where, {
        tenant: { id: user?.tenant?.id },
      });

      let order: any = { id: 'DESC' }; // Default order

      if (getAllrolesInterface?.sortBy) {
        // Allow sorting by different columns
        const orderBy = getAllrolesInterface.sortBy;
        const orderDirection = getAllrolesInterface.sortOrder || 'DESC';
        order = { [orderBy]: orderDirection };
      }
      let response: any;
      let count: any;

      if (fetchAll) {
        [response, count] = await this.contactsRolesRepository.findAndCount({
          where,
          order,
        });
      } else {
        [response, count] = await this.contactsRolesRepository.findAndCount({
          where,
          take: limit,
          skip: (page - 1) * limit,
          order,
        });
      }
      response.sort((a, b) => a.name.localeCompare(b.name));

      return {
        status: HttpStatus.OK,
        message: 'Roles Fetched Successfully',
        count: count,
        data: response,
      };
    } catch (error) {
      console.log('Error while fetching contacts roles ', error);

      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: any) {
    try {
      const contactRole: any = await this.contactsRolesRepository.findOne({
        where: { id: id, is_archived: false },
        relations: ['created_by'],
      });

      if (!contactRole) {
        resError(`Role not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }
      if (contactRole) {
        const modifiedData: any = await getModifiedDataDetails(
          this.contactsRolesHistoryRepo,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        contactRole.modified_by = contactRole.created_by;
        contactRole.modified_at = contactRole.created_at;
        contactRole.created_at = modified_at
          ? modified_at
          : contactRole.created_at;
        contactRole.created_by = modified_by
          ? modified_by
          : contactRole.created_by;
      }

      return resSuccess(
        'Role found successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        contactRole
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(id: any, updateContactsRoleDto: UpdateContactsRoleDto) {
    try {
      const contactRole: any = await this.contactsRolesRepository.findOne({
        where: {
          id: id,
          is_archived: false,
        },
        relations: ['tenant'],
      });

      if (!contactRole) {
        resError(`Role not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }
      const user = await this.userRepository.findOneBy({
        id: updateContactsRoleDto?.created_by,
      });
      const beforeUpdate = { ...contactRole };

      if (!user) {
        resError(`User not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }
      const updateData: any = { ...updateContactsRoleDto };
      updateData.created_at = new Date();
      updateData.created_by = this.request?.user;
      // delete updateData.created_by;

      if (contactRole?.short_name != updateContactsRoleDto?.short_name) {
        const short_name = await this.contactsRolesRepository.findOneBy({
          short_name: updateData?.short_name,
        });
        if (short_name) {
          resError(
            `Short Name duplicate already exists.`,
            ErrorConstants.Error,
            HttpStatus.NOT_FOUND
          );
        }
      }

      const role_name = await this.contactsRolesRepository.findOneBy({
        name: ILike(updateContactsRoleDto?.name.trim()),
        is_archived: false,
        tenant_id: this?.request?.user?.tenant?.id,
        id: Not(contactRole.id),
      });

      if (role_name) {
        resError(
          `Role Name duplicate already exists.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      Object.assign(contactRole, updateData);

      // Save the updated contact role entity
      const updatedContactRole = await this.contactsRolesRepository.save(
        contactRole
      );
      return resSuccess(
        'Role updated',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        null
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async archive(id: any, archiveDto: ArchiveDto): Promise<any> {
    try {
      const contactRole: any = await this.contactsRolesRepository.findOne({
        where: { id: id, is_archived: false },
        relations: ['tenant'],
      });

      if (!contactRole) {
        resError(`Role not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }

      const user = await this.userRepository.findOneBy({
        id: archiveDto?.updated_by,
      });

      if (!user) {
        resError(`User not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }
      const beforeUpdate: any = { ...contactRole };

      const inUse = await this.accountContactRepository.findOne({
        where: { role_id: { id: id }, is_archived: false },
      });

      if (inUse)
        return resError(
          'Currently in use by account',
          'currently_in_use',
          HttpStatus.BAD_REQUEST
        );

      contactRole.is_archived = archiveDto?.is_archived;
      contactRole.created_at = new Date();
      contactRole.created_by = this.request?.user;
      const data = await this.contactsRolesRepository.save(contactRole);

      return resSuccess(
        'Role Archived',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        null
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
