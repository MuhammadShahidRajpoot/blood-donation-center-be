import {
  HttpStatus,
  Injectable,
  Inject,
  Scope,
  BadRequestException,
} from '@nestjs/common';
import { CreateTaskManagementDto } from '../dto/create-task-management.dto';
import { UpdateTaskManagementDto } from '../dto/update-task-management.dto';
import { EntityManager, Repository, ILike, In, Raw } from 'typeorm';
import { TaskManagement } from '../entities/task-management.entity';
import { SuccessConstants } from '../../../../../../system-configuration/constants/success.constants';
import {
  resError,
  resSuccess,
} from '../../../../../../system-configuration/helpers/response';
import { ErrorConstants } from '../../../../../../system-configuration/constants/error.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRequest } from '../../../../../../../common/interface/request';
import { REQUEST } from '@nestjs/core';
import { TaskManagementHistory } from '../entities/task-management-history.entity';
import { HistoryService } from '../../../../../../common/services/history.service';
import { User } from '../../../../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { getModifiedDataDetails } from '../../../../../../../common/utils/modified_by_detail';
import { TaskCollectionOperation } from '../entities/task-management-collection-operation.entity';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';

@Injectable({ scope: Scope.REQUEST })
export class TaskManagementService extends HistoryService<TaskManagementHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    private readonly entityManager: EntityManager,
    @InjectRepository(TaskManagement)
    private readonly taskManagementRepository: Repository<TaskManagement>,
    @InjectRepository(TaskManagementHistory)
    private readonly taskManagementHistoryRepository: Repository<TaskManagementHistory>,
    @InjectRepository(BusinessUnits)
    private readonly businessUnitsRepository: Repository<BusinessUnits>,
    @InjectRepository(TaskCollectionOperation)
    private readonly taskCollectionOperationRepository: Repository<TaskCollectionOperation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {
    super(taskManagementHistoryRepository);
  }

  async create(createTaskManagementDto: CreateTaskManagementDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const user = await this.userRepository.findOne({
        where: { id: createTaskManagementDto.created_by },
      });
      let task = new TaskManagement();
      const collecOpArray = [
        ...createTaskManagementDto.collection_operation_id,
      ];
      delete createTaskManagementDto.collection_operation_id;
      task = {
        ...task,
        ...createTaskManagementDto,
        created_by: user,
        tenant_id: this.request?.user?.tenant?.id,
      };

      const savedTask = await queryRunner.manager.save(TaskManagement, task);
      // const savedTask = await this.taskManagementRepository.save(task);
      const promises = [];
      for (const collectionOperationId of collecOpArray) {
        const taskManagementCollectionOperation = new TaskCollectionOperation();
        const collectionOperationExist =
          await this.businessUnitsRepository.findOne({
            where: {
              id: collectionOperationId,
              tenant: { id: this.request?.user?.tenant?.id },
            },
          });
        if (!collectionOperationExist) {
          throw new BadRequestException(
            `Collection Operation with id: ${collectionOperationId} not found`
          );
        }
        taskManagementCollectionOperation.task_id = savedTask;
        taskManagementCollectionOperation.collection_operation_id =
          collectionOperationExist;
        taskManagementCollectionOperation.created_by = user;
        taskManagementCollectionOperation.tenant_id =
          this.request.user?.tenant?.id;
        promises.push(
          queryRunner.manager.save(
            TaskCollectionOperation,
            taskManagementCollectionOperation
          )
        );
      }
      await Promise.all(promises);

      await queryRunner.commitTransaction();

      return resSuccess(
        'Task Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedTask
      );
    } catch (error) {
      // Rollback the transaction if an error occurs
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
    }
  }

  async findAll(
    page: number,
    limit: number,
    is_active: string,
    owner: string,
    applies_to: string,
    keyword: string,
    collection_operation: string,
    sort_name: string,
    sort_order: string,
    collection_operation_sort: string
  ) {
    try {
      const sortName = sort_name;
      const sortOrder = sort_order;
      if ((sortName && !sortOrder) || (sortOrder && !sortName)) {
        return resError(
          `When selecting sort SortOrder & SortName is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      limit = limit ? +limit : +process.env.PAGE_SIZE;

      page = page ? +page : 1;

      if (page < 1) {
        page = 1;
      }

      const where = { tenant_id: this.request?.user?.tenant?.id };
      if (keyword) {
        Object.assign(where, {
          name: ILike(`%${keyword}%`),
        });
      }

      if (is_active == 'true' || is_active == 'false') {
        Object.assign(where, {
          is_active: is_active,
        });
      }

      if (owner) {
        const ownerValues = owner.split(',').map((item) => item.trim());

        if (ownerValues.length > 0) {
          // Use the array directly with In operator
          Object.assign(where, {
            owner: In(ownerValues),
          });
        } else {
          // Use the single value without wrapping it in an array
          Object.assign(where, {
            owner: owner,
          });
        }
      }
      if (collection_operation) {
        const collectionOperations = collection_operation.split(',');

        let taskIds = [];
        const qb = this.taskCollectionOperationRepository
          .createQueryBuilder('collectionOperation')
          .select('collectionOperation.task_id', 'task_id')
          .where(
            'collectionOperation.collection_operation_id IN (:...collectionOperations)',
            { collectionOperations }
          );

        const result = await qb.getRawMany();
        taskIds = result.map((row) => row.task_id);

        Object.assign(where, {
          id: In(taskIds),
        });
      }

      if (applies_to) {
        const appliesToValues = applies_to
          .split(',')
          .map((item) => item.trim());

        if (appliesToValues.length > 0) {
          // Use the array directly with In operator
          Object.assign(where, {
            applies_to: In(appliesToValues),
          });
        } else {
          // Use the single value without wrapping it in an array
          Object.assign(where, {
            applies_to: applies_to,
          });
        }
      }

      Object.assign(where, {
        is_archive: false,
      });

      let tasks;
      if (sortName == 'name' || sortName == 'description') {
        tasks = this.taskManagementRepository
          .createQueryBuilder('task')
          .take(limit)
          .skip((page - 1) * limit)
          .orderBy(`LOWER(task.${sortName})`, sortOrder as 'ASC' | 'DESC')
          .where(where);
      } else if (sortName == 'applies_to') {
        tasks = this.taskManagementRepository
          .createQueryBuilder('task')
          .take(limit)
          .skip((page - 1) * limit)
          .orderBy(`LOWER(task.${sortName}::text)`, sortOrder as 'ASC' | 'DESC')
          .where(where);
      } else if (sortName !== 'collection_operations') {
        tasks = this.taskManagementRepository
          .createQueryBuilder('task')
          .take(limit)
          .skip((page - 1) * limit)
          .orderBy(`(task.${sortName})`, sortOrder as 'ASC' | 'DESC')
          .where(where);
      } else {
        tasks = this.taskManagementRepository
          .createQueryBuilder('task')
          .take(limit)
          .skip((page - 1) * limit)
          .orderBy('task.created_at', 'DESC')
          .where(where);
      }

      const countQuery = tasks;

      const data = await tasks.getMany();
      const count = await countQuery.getCount();
      const updatedTasks = [];

      for (const item of data) {
        const collectionOperations =
          await this.taskCollectionOperationRepository
            .createQueryBuilder('collectionOperation')
            .where('collectionOperation.task_id IN (:...ids)', {
              ids: [item.id],
            })
            .leftJoinAndSelect('collectionOperation.task_id', 'task_id')
            .leftJoinAndSelect(
              'collectionOperation.collection_operation_id',
              'collection_operation_id'
            )
            .orderBy(
              `ASCII(LOWER(SUBSTRING(collection_operation_id.name FROM 1 FOR 1)))`,
              collection_operation_sort?.toUpperCase() === 'DESC'
                ? 'DESC'
                : 'ASC'
            )
            .getMany();

        updatedTasks.push({
          ...item,
          collectionOperations,
        });
      }

      return {
        status: HttpStatus.OK,
        message: 'Tasks Fetched Succesfuly',
        count: count,
        data: updatedTasks,
      };
    } catch (error) {
      console.log(error);

      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findOne(id: any) {
    try {
      const task: any = await this.taskManagementRepository.findOne({
        where: { id: id },
        relations: ['created_by', 'tenant'],
      });

      if (!task) {
        return resError(
          `Task not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const collectionOperations =
        await this.taskCollectionOperationRepository.find({
          where: {
            task_id: In([task.id]),
          },
          relations: ['collection_operation_id'],
        });
      if (task) {
        const modifiedData: any = await getModifiedDataDetails(
          this.taskManagementHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        task.modified_by = task.created_by;
        task.modified_at = task.created_at;
        task.created_at = modified_at ? modified_at : task.created_at;
        task.created_by = modified_by ? modified_by : task.created_by;
      }

      return resSuccess('', SuccessConstants.SUCCESS, HttpStatus.OK, {
        ...task,
        collection_operation: collectionOperations
          .map((bco) => bco.collection_operation_id.name)
          .join(', '),
        collection_operations_data: collectionOperations,
      });
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(
    id: bigint,
    updateTaskManagementDto: UpdateTaskManagementDto,
    req: any
  ) {
    try {
      const existingTask: any = await this.taskManagementRepository.findOne({
        where: { id: id },
        relations: ['created_by'],
      });
      const user = await this.userRepository.findOne({
        where: { id: req?.user?.id },
      });
      if (!existingTask) {
        return resError(
          `Task not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      if (!user) {
        return resError(
          `User not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const collecOpArray = [
        ...updateTaskManagementDto.collection_operation_id,
      ];
      delete updateTaskManagementDto.collection_operation_id;
      Object.assign(existingTask, updateTaskManagementDto);
      existingTask.created_at = new Date();
      existingTask.created_by = this.request?.user;
      const updatedTask = await this.taskManagementRepository.save(
        existingTask
      );

      const oldCollectionOperations: any =
        await this.taskCollectionOperationRepository.find({
          where: {
            task_id: In([id]),
          },
          relations: ['collection_operation_id'],
        });

      const collectionOperationsToDelete = oldCollectionOperations.filter(
        (operation) => {
          return !collecOpArray?.includes(
            operation?.collection_operation_id.id
          );
        }
      );
      const collectionOperationsToAdd = collecOpArray.filter((id) => {
        return !oldCollectionOperations.some(
          (operation) => operation.collection_operation_id.id === id
        );
      });

      for (const operationToDelete of collectionOperationsToDelete) {
        await this.taskCollectionOperationRepository.remove(operationToDelete);
      }

      const promises = [];
      for (const collectionOperationId of collectionOperationsToAdd) {
        const taskManagementCollectionOperation: any =
          new TaskCollectionOperation();
        const collectionOperationExist =
          await this.businessUnitsRepository.findOne({
            where: {
              id: collectionOperationId,
              tenant: { id: this.request?.user?.tenant?.id },
            },
          });
        if (!collectionOperationExist) {
          throw new BadRequestException(
            `Collection Operation with id: ${collectionOperationId} not found`
          );
        }
        taskManagementCollectionOperation.task_id = updatedTask;
        taskManagementCollectionOperation.collection_operation_id =
          collectionOperationExist;
        taskManagementCollectionOperation.created_by = user;
        taskManagementCollectionOperation.tenant_id =
          this.request.user?.tenant?.id;
        taskManagementCollectionOperation.created_at = () =>
          'CURRENT_TIMESTAMP';
        promises.push(
          this.taskCollectionOperationRepository.save(
            taskManagementCollectionOperation
          )
        );
      }
      await Promise.all(promises);
      delete updatedTask?.created_by?.tenant;
      return resSuccess(
        'Changes Saved',
        SuccessConstants.SUCCESS,
        HttpStatus.NO_CONTENT,
        updatedTask
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async archive(id: bigint, is_archive: boolean, req: any) {
    try {
      const task: any = await this.taskManagementRepository.findOne({
        where: { id: id },
        relations: ['created_by'],
      });

      if (!task) {
        return resError(
          `Task not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      task.is_archive = !task.is_archive;
      task.created_at = new Date();
      task.created_by = this.request?.user;
      const updatedTask = await this.taskManagementRepository.save(task);
      const oldCollectionOperations: any =
        await this.taskCollectionOperationRepository.find({
          where: {
            task_id: In([id]),
          },
          relations: ['collection_operation_id'],
        });

      for (const operationToDelete of oldCollectionOperations) {
        await this.taskCollectionOperationRepository.remove(operationToDelete);
      }
      return resSuccess(
        'Task Archived.',
        SuccessConstants.SUCCESS,
        HttpStatus.NO_CONTENT,
        null
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
