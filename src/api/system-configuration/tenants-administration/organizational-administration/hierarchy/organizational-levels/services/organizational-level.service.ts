import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, ILike, Repository } from 'typeorm';
import { OrganizationalLevels } from '../entities/organizational-level.entity';
import { OrganizationalLevelDto } from '../dto/organizational-level.dto';
import { User } from '../../../../../tenants-administration/user-administration/user/entity/user.entity';
import { resError } from '../../../../../../system-configuration/helpers/response';
import { ErrorConstants } from '../../../../../../system-configuration/constants/error.constants';
import { GetAllOrganizationalLevelsInterface } from '../interface/organizational-level.interface';
import { SuccessConstants } from '../../../../../../system-configuration/constants/success.constants';
import { Tenant } from '../../../../../platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { HistoryService } from '../../../../../../common/services/history.service';
import { OrganizationalLevelsHistory } from '../entities/organizational-level-history.entity';
import { getModifiedDataDetails } from '../../../../../../../common/utils/modified_by_detail';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';

@Injectable()
export class OrganizationalLevelService extends HistoryService<OrganizationalLevelsHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(OrganizationalLevels)
    private readonly organizationalLevelsRepository: Repository<OrganizationalLevels>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(OrganizationalLevelsHistory)
    private readonly organizationalLevelsHistoryRepository: Repository<OrganizationalLevelsHistory>
  ) {
    super(organizationalLevelsHistoryRepository);
  }

  async create(createOrganizationalLevelDto: OrganizationalLevelDto) {
    try {
      const user = await this.userRepository.findOneBy({
        id: createOrganizationalLevelDto?.created_by,
      });
      if (!user) {
        resError(`User not found`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }

      const tenant = await this.tenantRepository.findOneBy({
        id: createOrganizationalLevelDto?.tenant_id,
      });

      if (!tenant) {
        resError(
          `Tenant not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      let parentLevel = null;
      if (createOrganizationalLevelDto?.parent_level_id) {
        parentLevel = await this.organizationalLevelsRepository.findOne({
          where: { id: createOrganizationalLevelDto?.parent_level_id },
        });
      }

      const organizationalLevel: any = new OrganizationalLevels();
      organizationalLevel.name = createOrganizationalLevelDto.name;
      organizationalLevel.short_label =
        createOrganizationalLevelDto.short_label;
      organizationalLevel.description =
        createOrganizationalLevelDto.description;
      organizationalLevel.is_active = createOrganizationalLevelDto.is_active;
      organizationalLevel.created_by = createOrganizationalLevelDto.created_by;
      organizationalLevel.parent_level = parentLevel;
      organizationalLevel.tenant_id = tenant?.id;

      // Save the Organizational Levels entity
      const savedOrganizationalLevel =
        await this.organizationalLevelsRepository.save(organizationalLevel);

      return {
        status: SuccessConstants.SUCCESS,
        response: 'Organizational Level Created Successfully',
        status_code: HttpStatus.CREATED,
        data: savedOrganizationalLevel,
      };
    } catch (error) {
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAll(
    getAllOrganizationalLevelsInterface: GetAllOrganizationalLevelsInterface
  ) {
    let where: any = {};
    let records: OrganizationalLevels[] = [];
    let count = 0;
    let page = 0;
    where = {
      tenant: { id: getAllOrganizationalLevelsInterface.tenant_id },
    };

    let order: any = { id: 'DESC' }; // Default order

    if (
      getAllOrganizationalLevelsInterface.limit &&
      getAllOrganizationalLevelsInterface.page
    ) {
      if (getAllOrganizationalLevelsInterface.collectionOperation === 'false') {
        where.is_collection_operation = Equal(false);
      }
      // If the keyword is provided, add the name search condition
      if (getAllOrganizationalLevelsInterface.keyword?.length > 1) {
        where.name = ILike(`%${getAllOrganizationalLevelsInterface.keyword}%`);
      }

      // If the status is provided, add the is_active condition
      if (getAllOrganizationalLevelsInterface.status) {
        where.is_active = getAllOrganizationalLevelsInterface.status;
      }

      // If parent_level_id is provided, add the parent_level search condition
      if (getAllOrganizationalLevelsInterface.parent_level_id) {
        where.parent_level = {
          id: +getAllOrganizationalLevelsInterface.parent_level_id,
        };
      }
      where.is_archived = false;

      if (getAllOrganizationalLevelsInterface?.sortBy) {
        if (
          getAllOrganizationalLevelsInterface?.sortBy === 'parent_level_name'
        ) {
          const orderDirection =
            getAllOrganizationalLevelsInterface.sortOrder?.toUpperCase() ===
            'ASC'
              ? 'ASC'
              : 'DESC';
          order = { parent_level: { name: orderDirection } };
        } else if (getAllOrganizationalLevelsInterface.sortBy === 'status') {
          const orderDirection =
            getAllOrganizationalLevelsInterface.sortOrder?.toUpperCase() ===
            'ASC'
              ? 'ASC'
              : 'DESC';

          // If sorting by status, prioritize active items first, then inactive (or vice versa)
          order = { is_active: orderDirection };
        } else {
          const orderBy = getAllOrganizationalLevelsInterface.sortBy;
          const orderDirection =
            getAllOrganizationalLevelsInterface.sortOrder?.toUpperCase() ===
            'ASC'
              ? 'ASC'
              : 'DESC';
          order = { [orderBy]: orderDirection };
        }
      }
      // Apply pagination options
      const limit: number = parseInt(
        getAllOrganizationalLevelsInterface.limit.toString() ??
          process.env.PAGE_SIZE ??
          '10'
      );
      page = getAllOrganizationalLevelsInterface.page
        ? +getAllOrganizationalLevelsInterface.page
        : 1;
      [records, count] = await this.organizationalLevelsRepository.findAndCount(
        {
          where,
          skip: (page - 1) * limit || 0,
          take: limit,
          relations: ['parent_level'],
          order: order,
        }
      );
    } else {
      // If limit and page are not provided, fetch all records without pagination, but whose status is activ

      where = {
        is_active: true,
        is_archived: false,
        tenant: { id: getAllOrganizationalLevelsInterface.tenant_id },
      };

      if (getAllOrganizationalLevelsInterface.collectionOperation === 'false') {
        where.is_collection_operation = Equal(false);
      }

      // If parent_level_id is provided, add the parent_level search condition
      if (getAllOrganizationalLevelsInterface.parent_level_id) {
        where.parent_level = {
          id: +getAllOrganizationalLevelsInterface.parent_level_id,
        };
      }

      records = await this.organizationalLevelsRepository.find({
        where,
        order: order,
        relations: ['parent_level'],
      });
      count = records.length;
    }
    return { total_records: count, page_number: page, data: records };
  }

  async update(id: any, updateOrganizationalLevelDto: OrganizationalLevelDto) {
    try {
      const organizationalLevel =
        await this.organizationalLevelsRepository.findOneBy({
          id: id,
        });
      if (!organizationalLevel) {
        resError(
          `Organizational Level not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const user = await this.userRepository.findOneBy({
        id: updateOrganizationalLevelDto?.created_by,
      });
      if (!user) {
        resError(`User not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }

      let parentLevel = null;
      if (updateOrganizationalLevelDto?.parent_level_id) {
        parentLevel = await this.organizationalLevelsRepository.findOne({
          where: { id: updateOrganizationalLevelDto?.parent_level_id },
        });
      }

      const dataToUpdate = {
        name: updateOrganizationalLevelDto.name,
        short_label: updateOrganizationalLevelDto.short_label,
        description: updateOrganizationalLevelDto.description,
        is_active: updateOrganizationalLevelDto.is_active,
        parent_level: parentLevel,
        created_at: new Date(),
        created_by: this?.request?.user,
      };

      // Save the Organizational Levels entity
      await this.organizationalLevelsRepository.update(
        {
          id: id as any,
        },
        dataToUpdate as any
      );

      return {
        status: SuccessConstants.SUCCESS,
        response: 'Organizational Level Updated Successfully',
        status_code: HttpStatus.OK,
        data: {
          // ...dataToUpdate,
          // tenant_id: organizationalLevel?.tenant_id,
        },
      };
    } catch (error) {
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findOne(id: any) {
    try {
      const organizationalLevel: any =
        await this.organizationalLevelsRepository.findOne({
          where: { id: id },
          relations: ['parent_level', 'created_by', 'tenant'],
        });
      if (!organizationalLevel) {
        resError(
          `Organizational Level not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      Object.assign(organizationalLevel, {
        tenant_id: organizationalLevel?.tenant?.id,
      });

      if (organizationalLevel) {
        const modifiedData: any = await getModifiedDataDetails(
          this.organizationalLevelsHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        organizationalLevel.modified_by = organizationalLevel.created_by;
        organizationalLevel.modified_at = organizationalLevel.created_at;
        organizationalLevel.created_at = modified_at
          ? modified_at
          : organizationalLevel.created_at;
        organizationalLevel.created_by = modified_by
          ? modified_by
          : organizationalLevel.created_by;
      }
      delete organizationalLevel.tenant;
      organizationalLevel.created_by.tenant_id = await this.request?.user
        ?.tenant?.id;
      organizationalLevel.modified_by.tenant_id = await this.request?.user
        ?.tenant?.id;
      return {
        status: SuccessConstants.SUCCESS,
        response: 'Organizational Level Found Successfully',
        status_code: HttpStatus.FOUND,
        data: { ...organizationalLevel },
      };
    } catch (error) {
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async archive(id: any, user: any) {
    try {
      const organizationalLevel: any =
        await this.organizationalLevelsRepository.findOne({
          where: {
            id: id,
            tenant: {
              id: user.tenant.id,
            },
          },
          relations: ['tenant'],
        });
      if (!organizationalLevel) {
        resError(
          `Organizational Level not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      if (organizationalLevel?.is_collection_operation) {
        resError(
          `Collection operations cannot be archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      organizationalLevel.is_archived = true;
      organizationalLevel.created_at = new Date();
      organizationalLevel.created_by = this.request?.user;
      const savedOrganizationalLevel =
        await this.organizationalLevelsRepository.save(organizationalLevel);
      // const savedOrganizationalLevel:any =
      //   await this.organizationalLevelsRepository.save({
      //     organizationalLevel
      //   });

      // const savedOrganizationalLevel:any =
      // await this.organizationalLevelsRepository.update({
      //    {id: organizationalLevel?.id } ,
      //   organizationalLevel
      // });

      // Object.assign(savedOrganizationalLevel, {
      //   tenant_id: savedOrganizationalLevel?.tenant?.id,
      // });

      return {
        status: SuccessConstants.SUCCESS,
        response: 'Organizational Level Archived Successfully',
        status_code: HttpStatus.OK,
        data: null,
      };
    } catch (error) {
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
