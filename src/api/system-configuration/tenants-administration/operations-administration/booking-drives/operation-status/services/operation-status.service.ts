import { Inject, Injectable, Scope, HttpStatus } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, ILike, Raw } from 'typeorm';
import { UserRequest } from '../../../../../../../common/interface/request';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { OperationsStatus } from '../entities/operations_status.entity';
import { resError } from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import {
  OperationStatusDto,
  UpdateOperationStatusDto,
} from '../dto/oepration-status.dto';
import { OperationStatusInterface } from '../interface/operation-status.interface';
import { OperationsStatusHistory } from '../entities/operations_status_history.entity';
import { getModifiedDataDetails } from '../../../../../../../common/utils/modified_by_detail';
import { NonCollectionEvents } from 'src/api/operations-center/operations/non-collection-events/entities/oc-non-collection-events.entity';
import { Drives } from 'src/api/operations-center/operations/drives/entities/drives.entity';
import { Sessions } from 'src/api/operations-center/operations/sessions/entities/sessions.entity';
import { FlaggedOperationService } from 'src/api/staffing-management/build-schedules/operation-list/service/flagged-operation.service';

@Injectable({ scope: Scope.REQUEST })
export class OperationStatusService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(OperationsStatus)
    private readonly operationStatusRepository: Repository<OperationsStatus>,
    @InjectRepository(OperationsStatusHistory)
    private readonly operationStatusHistoryRepository: Repository<OperationsStatusHistory>,
    private readonly entityManager: EntityManager,
    @InjectRepository(NonCollectionEvents)
    private readonly nceRepository: Repository<NonCollectionEvents>,
    @InjectRepository(Drives)
    private readonly drivesRepository: Repository<Drives>,
    @InjectRepository(Sessions)
    private readonly sessionsRepository: Repository<Sessions>,
    private readonly flaggedOperationService: FlaggedOperationService
  ) {}

  async create(operationStatusDto: OperationStatusDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const user = await this.userRepository.findOneBy({
        id: operationStatusDto?.created_by,
      });
      if (!user) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const operationStatus = new OperationsStatus();
      operationStatus.name = operationStatusDto.name;
      operationStatus.applies_to = operationStatusDto.applies_to;
      operationStatus.schedulable = operationStatusDto.schedulable;
      operationStatus.hold_resources = operationStatusDto.hold_resources;
      operationStatus.contribute_to_scheduled =
        operationStatusDto.contribute_to_scheduled;
      operationStatus.requires_approval = operationStatusDto.requires_approval;
      operationStatus.description = operationStatusDto.description;
      operationStatus.chip_color = operationStatusDto.chip_color;
      operationStatus.is_active = operationStatusDto.is_active;
      operationStatus.created_by = operationStatusDto.created_by;
      operationStatus.tenant_id = this.request?.user?.tenant?.id;

      const savedOperationStatus = await queryRunner.manager.save(
        operationStatus
      );
      await queryRunner.commitTransaction();

      return {
        status: 'success',
        response: 'Operation Status Created Successfully',
        status_code: 201,
        data: savedOperationStatus,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async getAllOperationStatus(
    operationStatusInterface: OperationStatusInterface,
    user
  ): Promise<any> {
    try {
      const sortName = operationStatusInterface?.sortName;
      const sortBy = operationStatusInterface?.sortOrder;

      if ((sortName && !sortBy) || (sortBy && !sortName)) {
        return resError(
          `When selecting sort SortBy & SortName is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      let response;
      let count;

      const sorting: { [key: string]: 'ASC' | 'DESC' } = {};
      if (sortName && sortBy) {
        sorting[sortName] = sortBy.toUpperCase() as 'ASC' | 'DESC';
      } else {
        sorting['name'] = 'ASC';
      }

      const limit: number = operationStatusInterface?.limit
        ? +operationStatusInterface.limit
        : +process.env.PAGE_SIZE;

      const page = operationStatusInterface?.page
        ? +operationStatusInterface.page
        : 1;

      if (operationStatusInterface.fetch_all) {
        [response, count] = await this.operationStatusRepository.findAndCount({
          relations: ['tenant'],
          where: {
            tenant_id: user.tenant_id,
          },
          order: { name: 'ASC' },
        });
      } else {
        const query = this.operationStatusRepository
          .createQueryBuilder('os')
          .where(this.buildWhereClause(operationStatusInterface))
          .take(limit)
          .skip((page - 1) * limit)
          .orderBy(sorting);

        // if (operationStatusInterface?.appliesTo) {
        //   query = query.andWhere(':appliesTo = ANY (os.applies_to)', {
        //     appliesTo: operationStatusInterface?.appliesTo,
        //   });
        // }

        [response, count] = await query.getManyAndCount();
      }

      return {
        status: HttpStatus.OK,
        response: 'Operation Status Fetched Successfully',
        count: count,
        data: response,
      };
    } catch {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async archive(id: any, updatedBy: any) {
    try {
      const operationStatus = await this.operationStatusRepository.findOneBy({
        id: id,
      });

      if (!operationStatus) {
        return resError(
          `Procedure not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const isArchive = !operationStatus.is_archived;
      const updatedRequest: any = {
        ...operationStatus,
        is_archived: isArchive,
        created_at: new Date(),
        created_by: this.request?.user,
      };

      // return updatedRequest;
      const updatedOperationStatus = await this.operationStatusRepository.save(
        updatedRequest
      );

      return {
        status: 'Success',
        response: 'Resource Archived',
        status_code: HttpStatus.OK,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findOne(id: any): Promise<any> {
    try {
      const operationStatus: any = await this.operationStatusRepository.findOne(
        {
          where: { id: id },
          relations: ['created_by', 'tenant'],
        }
      );

      if (!operationStatus) {
        return resError(
          `Operation Status not found`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      if (operationStatus) {
        const modifiedData: any = await getModifiedDataDetails(
          this.operationStatusHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        operationStatus.modified_by = operationStatus.created_by;
        operationStatus.modified_at = operationStatus.created_at;
        operationStatus.created_at = modified_at
          ? modified_at
          : operationStatus.created_at;
        operationStatus.created_by = modified_by
          ? modified_by
          : operationStatus.created_by;
      }

      return {
        status: HttpStatus.OK,
        message: 'Operation Status Fetched Succesfuly',
        data: { ...operationStatus },
      };
    } catch {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Helper method to build the 'where' object based on the interface properties
  private buildWhereClause(operationStatusInterface: OperationStatusInterface) {
    const where = { tenant_id: this.request?.user?.tenant?.id };

    if (operationStatusInterface?.name) {
      Object.assign(where, {
        name: ILike(`%${operationStatusInterface.name}%`),
      });
    }

    if (operationStatusInterface?.status) {
      Object.assign(where, {
        is_active: operationStatusInterface.status,
      });
    }

    if (operationStatusInterface?.appliesTo) {
      const appliesToValues = operationStatusInterface.appliesTo
        .split(',')
        .map((item) => item.trim());
      Object.assign(where, {
        applies_to: Raw(
          (alias) =>
            `(${appliesToValues
              .map(
                (value, index) =>
                  `${alias} @> ARRAY[:enumValue${index}]::operations_status_applies_to_enum[]`
              )
              .join(' OR ')})`,
          appliesToValues.reduce((values, value, index) => {
            values[`enumValue${index}`] = value;
            return values;
          }, {})
        ),
      });
    }

    Object.assign(where, {
      is_archived: false,
    });

    return where;
  }

  async update(id: any, updateOperationStatusDto: UpdateOperationStatusDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const operationStatus: any =
        await this.operationStatusRepository.findOneBy({
          id: id,
        });

      if (!operationStatus) {
        return resError(
          `Operation Status not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const user = await this.userRepository.findOneBy({
        id: updateOperationStatusDto?.created_by,
      });

      if (!user) {
        return resError(
          `User not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      operationStatus.name = updateOperationStatusDto.name;
      operationStatus.applies_to = updateOperationStatusDto.applies_to;
      operationStatus.schedulable = updateOperationStatusDto.schedulable;
      operationStatus.hold_resources = updateOperationStatusDto.hold_resources;
      operationStatus.contribute_to_scheduled =
        updateOperationStatusDto.contribute_to_scheduled;
      operationStatus.requires_approval =
        updateOperationStatusDto.requires_approval;
      operationStatus.description = updateOperationStatusDto.description;
      operationStatus.chip_color = updateOperationStatusDto.chip_color;
      operationStatus.is_active = updateOperationStatusDto.is_active;
      operationStatus.created_by = this.request?.user;
      operationStatus.created_at = new Date();

      const updatedOperationStatus = await this.operationStatusRepository.save(
        operationStatus
      );

      await queryRunner.commitTransaction();
      this.flaggedOperationService.flaggedOperationOperationStatusChange(
        id,
        this.request?.user?.tenanat_id
      );
      return {
        status: 'Success',
        response: 'Resource updated',
        status_code: HttpStatus.NO_CONTENT,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async findAssociations(id: any): Promise<any> {
    try {
      const operationStatus = await this.operationStatusRepository.findOne({
        where: { id: id },
        relations: ['created_by', 'tenant'],
      });
      if (!operationStatus) {
        return resError(
          `Operation Status not found`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const nceExistance = await this.nceRepository.find({
        where: {
          is_archived: false,
          status_id: {
            id: id,
          },
        },
        relations: ['status_id'],
      });

      const driveExistance = await this.drivesRepository.find({
        where: {
          is_archived: false,
          operation_status: {
            id: id,
          },
        },
        relations: ['operation_status'],
      });

      const sessionsExistance = await this.sessionsRepository.find({
        where: {
          is_archived: false,
          operation_status: {
            id: id,
          },
        },
        relations: ['operation_status'],
      });

      const result: any = {
        is_associated_with: '',
      };
      if (
        sessionsExistance.length ||
        driveExistance.length ||
        nceExistance.length
      ) {
        result.is_associated_with = true;
        return {
          status: HttpStatus.OK,
          message: 'Operation Status Fetched Succesfuly',
          data: result,
        };
      }
      result.is_associated_with = false;
      return {
        status: HttpStatus.OK,
        message: 'Operation Status Fetched Succesfuly',
        data: result,
      };
    } catch (error) {
      console.log('error', error);
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
