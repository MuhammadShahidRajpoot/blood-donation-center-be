import {
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, ILike, Repository } from 'typeorm';

import { User } from '../../../tenants-administration/user-administration/user/entity/user.entity';
import { CreateLeaveTypeDto } from '../dto/leaves-types.dto';
import { LeavesTypes } from '../entities/leave-types.entity';
import { GetAllLeavesTypesInterface } from '../interface/leaves-types.interface';
import { LeavesTypesHistory } from '../entities/leaves-types-history.entity';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { resError } from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';

@Injectable()
export class LeavesTypesServices {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(LeavesTypes)
    private readonly leavesTypesRepository: Repository<LeavesTypes>,

    @InjectRepository(LeavesTypesHistory)
    private readonly leavesTypesHisotryRepository: Repository<LeavesTypesHistory>,

    private readonly entityManager: EntityManager
  ) {}

  /**
   * check entity exist in database
   * @param repository
   * @param query
   * @param entityName
   * @returns {object}
   */
  async entityExist<T>(
    repository: Repository<T>,
    query,
    entityName
  ): Promise<T> {
    const entityObj = await repository.findOne(query);
    if (!entityObj) {
      resError(
        `${entityName} not found.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }

    return entityObj;
  }

  async findAll(getAllLeavesInterface: GetAllLeavesTypesInterface) {
    const sortName = getAllLeavesInterface?.sortName;
    const sortBy = getAllLeavesInterface?.sortOrder;

    if ((sortName && !sortBy) || (sortBy && !sortName)) {
      return resError(
        `When selecting sort SortBy & SortName is required.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }

    const sorting: { [key: string]: 'ASC' | 'DESC' } = {};
    if (sortName && sortBy) {
      sorting[sortName] = sortBy.toUpperCase() as 'ASC' | 'DESC';
    } else {
      sorting['id'] = 'DESC';
    }

    const limit: number = getAllLeavesInterface?.limit
      ? +getAllLeavesInterface.limit
      : +process.env.PAGE_SIZE;

    const page = getAllLeavesInterface?.page ? +getAllLeavesInterface.page : 1;

    const [response, count] = await this.leavesTypesRepository.findAndCount({
      where: {
        is_archived: false,
        ...(getAllLeavesInterface?.status && {
          status: getAllLeavesInterface?.status,
        }),
        ...(getAllLeavesInterface?.keyword && {
          name: ILike(`%${getAllLeavesInterface?.keyword}%`),
        }),
        tenant_id: this.request?.user?.tenant?.id,
      },
      take: limit,
      skip: (page - 1) * limit,
      order: sorting,
      relations: ['created_by'],
    });

    return {
      status: HttpStatus.OK,
      response: 'Leaves Fetched Successfully',
      count: count,
      data: response,
    };
  }

  async findOne(id: any) {
    const message = 'Leave';
    const query = {
      where: {
        id,
      },
      relations: ['created_by'],
    };
    const leave: any = await this.entityExist(
      this.leavesTypesRepository,
      query,
      message
    );
    if (leave) {
      const modifiedData: any = await getModifiedDataDetails(
        this.leavesTypesHisotryRepository,
        id,
        this.userRepository
      );

      const modified_at = modifiedData?.created_at;
      const modified_by = modifiedData?.created_by;
      leave.modified_by = leave.created_by;
      leave.modified_at = leave.created_at;
      leave.created_at = modified_at ? modified_at : leave.created_at;
      leave.created_by = modified_by ? modified_by : leave.created_by;
    }
    return {
      status: HttpStatus.OK,
      message: `${message} Fetched Successfully`,
      data: { ...leave },
    };
  }

  async create(createLeaveDto: CreateLeaveTypeDto) {
    await this.entityExist(
      this.userRepository,
      { where: { id: createLeaveDto?.created_by } },
      'User'
    );
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const createLeave = new LeavesTypes();
      const keys = Object.keys(createLeaveDto);
      for (const key of keys) {
        createLeave[key] = createLeaveDto?.[key];
      }
      // createLeave.created_at = new Date();
      createLeave.tenant_id = this.request?.user?.tenant?.id;
      // Save the Leave entity
      const savedLeave = await queryRunner.manager.save(createLeave);
      await queryRunner.commitTransaction();
      return {
        status: 'success',
        response: 'Leave created successfully',
        status_code: 201,
        data: savedLeave,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(
        error.message,
        ErrorConstants.Error,
        HttpStatus.BAD_REQUEST
      );
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: any, updateLeaveDto: CreateLeaveTypeDto) {
    const query = {
      where: {
        id,
      },
    };

    const leave = await this.entityExist(
      this.leavesTypesRepository,
      query,
      'Industry Category'
    );
    await this.entityExist(
      this.userRepository,
      { where: { id: updateLeaveDto?.created_by } },
      'User'
    );
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      Object.assign(leave, {
        ...updateLeaveDto,
        created_by: this.request?.user,
        created_at: new Date(),
      });

      const savedLeave = await this.leavesTypesRepository.save(leave);
      return {
        status: HttpStatus.NO_CONTENT,
        message: 'Leave updated successfully',
        data: {},
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException('Failed to update leaves data.');
    } finally {
      await queryRunner.release();
    }
  }

  async archive(id: any, updated_by: any) {
    const query = {
      where: {
        id,
      },
    };

    const leave: any = await this.entityExist(
      this.leavesTypesRepository,
      query,
      'Industry Category'
    );
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      leave.is_archived = true;
      leave.created_at = new Date();
      leave.created_by = this.request?.user;
      Object.assign(leave, CreateLeaveTypeDto);
      const savedLeave = await this.leavesTypesRepository.save(leave);

      return {
        status: HttpStatus.NO_CONTENT,
        message: 'Leave archived successfully',
        data: null,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      throw new InternalServerErrorException('Failed to update leaves data.');
    } finally {
      await queryRunner.release();
    }
  }
}
