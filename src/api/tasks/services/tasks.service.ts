import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  ILike,
  Raw,
  Repository,
  DataSource,
  In,
  QueryRunner,
  EntityNotFoundError,
  EntityTarget,
  getRepository,
  createQueryBuilder,
  LessThan,
  Between,
} from 'typeorm';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import {
  resError,
  resSuccess,
} from '../../system-configuration/helpers/response';
import { ErrorConstants } from '../../system-configuration/constants/error.constants';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { TasksDto } from '../dto/create-tasks.dto';
import { Tasks } from '../entities/tasks.entity';
import { GetAllTasksInterface } from '../interface/tasks-query.interface';
import { HistoryService } from '../../common/services/history.service';
import { TasksHistory } from '../entities/tasks-history.entity';
import { UpdateTasksDto } from '../dto/update-tasks.dto';
import moment from 'moment';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { TaskDueDateEnumKeys } from '../enum/tasks.enum';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

dotenv.config();

@Injectable()
export class TasksService extends HistoryService<TasksHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Tasks)
    private readonly tasksRepository: Repository<Tasks>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TasksHistory)
    private readonly tasksHistoryRepository: Repository<TasksHistory>,
    private readonly entityManager: EntityManager
  ) {
    super(tasksHistoryRepository);
  }

  async create(
    user: any,
    tasksDto: TasksDto,
    taskable_type = null,
    taskable_id = null
  ) {
    try {
      const assignedTo = await this.userRepository.findOneBy({
        id: tasksDto.assigned_to,
      });
      if (!assignedTo) {
        return resError(
          `Assigned user not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const assignedBy = await this.userRepository.findOneBy({
        id: tasksDto.assigned_by,
      });
      if (!assignedBy) {
        return resError(
          `Assigned by user not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      tasksDto.due_date = new Date(
        moment(tasksDto.due_date, 'MM/DD/YYYY').format('YYYY-MM-DD')
      );
      const tasks = new Tasks();
      tasks.assigned_by = assignedBy;
      tasks.assigned_to = assignedTo;
      tasks.created_by = user;
      tasks.due_date = tasksDto.due_date;
      tasks.task_name = tasksDto.task_name;
      tasks.description = tasksDto.description;
      tasks.status = tasksDto.status;
      tasks.taskable_id = taskable_id ?? null;
      tasks.taskable_type = taskable_type ?? null;
      tasks.tenant_id = user.tenant;
      const savedTasks = await this.tasksRepository.save(tasks);
      delete savedTasks.assigned_by.password;
      delete savedTasks.assigned_to.password;
      delete savedTasks?.created_by;
      return resSuccess(
        'Task Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        {
          ...savedTasks,
          tenant_id: this.request.user?.tenant?.id,
        }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async findOne(id: any) {
    try {
      const task: any = await this.tasksRepository.findOne({
        where: { id: id },
        relations: ['created_by', 'assigned_to', 'assigned_by'],
      });
      if (!task) {
        return resError(
          `Task not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (task?.is_archived) {
        return resError(
          `Task is archived`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      if (task.taskable_type) {
        const selectedColumnsList = `${task.taskable_type}.*`;
        let query = `SELECT ${selectedColumnsList} FROM tasks LEFT JOIN ${task.taskable_type} ON tasks.taskable_id = ${task.taskable_type}.id WHERE tasks.taskable_type = '${task.taskable_type}' AND tasks.taskable_id = ${task.taskable_id}`;
        if (task.taskable_type === PolymorphicType.CRM_DONOR_CENTERS) {
          query = `SELECT facility.* FROM tasks LEFT JOIN facility ON tasks.taskable_id = facility.id WHERE tasks.taskable_type = '${PolymorphicType.CRM_DONOR_CENTERS}' AND tasks.taskable_id = ${task.taskable_id}`;
        }
        const relatedEntity = await this.tasksRepository.query(query);
        if (relatedEntity?.length) {
          task.taskable_id = relatedEntity[0];
        }
      }
      if (task) {
        const modifiedData: any = await getModifiedDataDetails(
          this.tasksHistoryRepository,
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
      delete task.created_by.password;
      delete task.assigned_by.password;
      delete task.assigned_to.password;
      return resSuccess(
        'Task fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        { ...task }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async findAll(user: any, params: GetAllTasksInterface) {
    try {
      if (
        (params?.sortBy && !params?.sortOrder) ||
        (params?.sortOrder && !params?.sortBy)
      ) {
        return resError(
          `When selecting sort sortBy & sortOrder is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const limit: number =
        params?.limit && params?.limit !== undefined
          ? +params?.limit
          : +process.env.PAGE_SIZE ?? 10;

      const page = params?.page ? +params?.page : 1;

      const queryBuilder = this.tasksRepository
        .createQueryBuilder('task')
        .leftJoinAndSelect('task.created_by', 'created_by')
        .leftJoinAndSelect('task.tenant', 'tenant')
        .leftJoinAndSelect('task.assigned_to', 'assigned_to')
        .leftJoinAndSelect('task.assigned_by', 'assigned_by')
        .where('tenant.id = :tenantId', { tenantId: user?.tenant?.id })
        .andWhere('task.is_archived = :isArchived', { isArchived: false });

      if (params?.sortBy && params?.sortOrder) {
        if (params?.sortBy === 'assigned_by') {
          queryBuilder.orderBy(
            'assigned_by.first_name',
            params.sortOrder.toUpperCase() as 'ASC' | 'DESC'
          );
        } else if (params?.sortBy === 'assigned_to') {
          queryBuilder.orderBy(
            'assigned_to.first_name',
            params.sortOrder.toUpperCase() as 'ASC' | 'DESC'
          );
        } else {
          queryBuilder.orderBy(
            `task.${params.sortBy}`,
            params.sortOrder.toUpperCase() as 'ASC' | 'DESC'
          );
        }
      } else {
        queryBuilder.orderBy('task.id', 'DESC');
      }

      if (params?.status) {
        const statusValues = params?.status
          .split(',')
          .map((item) => item.trim());
        if (statusValues.length > 1) {
          queryBuilder.andWhere('task.status IN (:...status)', {
            status: statusValues,
          });
        } else {
          queryBuilder.andWhere('task.status = :status', {
            status: params?.status,
          });
        }
      }

      if (params?.task_name) {
        const fullName = `%${params?.task_name}%`;
        queryBuilder.andWhere(
          '(task.task_name ILIKE :fullName OR CONCAT("assigned_by"."first_name", \' \', "assigned_by"."last_name") ILIKE :fullName)',
          { fullName }
        );
      }

      // Always include taskable_id and taskable_type conditions
      if (params?.taskable_id) {
        queryBuilder.andWhere('task.taskable_id = :taskableId', {
          taskableId: params?.taskable_id,
        });
      }

      if (params?.taskable_type) {
        queryBuilder.andWhere('task.taskable_type = :taskableType', {
          taskableType: params?.taskable_type,
        });
      }
      if (params?.due_date) {
        const dueDateEnum = TaskDueDateEnumKeys[params?.due_date];
        switch (dueDateEnum) {
          case 'Past Due':
            const currentDate = new Date(moment().format('YYYY-MM-DD'));
            queryBuilder.andWhere('task.due_date < :currentDate', {
              currentDate,
            });
            break;

          case 'Due This Week':
            const startOfWeek = new Date(
              moment().startOf('week').add(1, 'day').format('YYYY-MM-DD')
            );
            const endOfWeek = new Date(
              moment().endOf('week').add(1, 'day').format('YYYY-MM-DD')
            );
            queryBuilder.andWhere(
              'task.due_date BETWEEN :startOfWeek AND :endOfWeek',
              { startOfWeek, endOfWeek }
            );
            break;

          case 'Due Next Week':
            const startOfNextWeek = new Date(
              moment()
                .add(1, 'week')
                .startOf('week')
                .add(1, 'day')
                .format('YYYY-MM-DD')
            );
            const endOfNextWeek = new Date(
              moment()
                .add(1, 'week')
                .endOf('week')
                .add(1, 'day')
                .format('YYYY-MM-DD')
            );
            queryBuilder.andWhere(
              'task.due_date BETWEEN :startOfNextWeek AND :endOfNextWeek',
              { startOfNextWeek, endOfNextWeek }
            );
            break;
          case 'All':
            break;
          default:
            break;
        }
      }
      const totalQuery = queryBuilder;
      const total = await totalQuery.getMany();
      const tasks: any = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();
      if (tasks?.length) {
        for (let i = 0; i < tasks.length; i++) {
          tasks[i].taskable_name = 'N/A';
          if (tasks[i].taskable_type) {
            const selectedColumnsList = `${tasks[i].taskable_type}.*`;
            let query = `SELECT ${selectedColumnsList} FROM tasks LEFT JOIN ${tasks[i].taskable_type} ON tasks.taskable_id = ${tasks[i].taskable_type}.id WHERE tasks.taskable_type = '${tasks[i].taskable_type}' AND tasks.taskable_id = ${tasks[i].taskable_id}`;
            if (tasks[i].taskable_type === PolymorphicType.CRM_DONOR_CENTERS) {
              query = `SELECT facility.* FROM tasks LEFT JOIN facility ON tasks.taskable_id = facility.id WHERE tasks.taskable_type = '${PolymorphicType.CRM_DONOR_CENTERS}' AND tasks.taskable_id = ${tasks[i].taskable_id}`;
            }
            const relatedEntity = await this.tasksRepository.query(query);
            if (relatedEntity?.length) {
              if (relatedEntity[0]?.first_name) {
                tasks[i].taskable_name = `${relatedEntity[0]?.first_name} ${
                  relatedEntity[0]?.last_name ?? relatedEntity[0]?.last_name
                }`;
              } else if (relatedEntity[0]?.profile_name) {
                tasks[i].taskable_name = relatedEntity[0]?.profile_name;
              } else if (relatedEntity[0]?.name) {
                tasks[i].taskable_name = relatedEntity[0]?.name;
              } else {
                tasks[i].taskable_name = 'N/A';
              }
            }
          }
        }
      }
      return {
        status: SuccessConstants.SUCCESS,
        message: 'Tasks Fetched successfully',
        status_code: HttpStatus.CREATED,
        total_records: total.length,
        data: tasks,
      };
    } catch (error) {
      // Handle errors
      return {
        status: error.status,
        message: error.message,
        status_code: ErrorConstants.Error,
        data: null,
      };
    }
  }
  async archiveTask(id: any, user: any) {
    try {
      const task: any = await this.tasksRepository.findOne({
        where: { id },
        relations: ['created_by', 'assigned_to', 'assigned_by', 'tenant'],
      });

      if (!task) {
        return resError(
          `Task not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (task.is_archived) {
        return resError(
          `Task is already archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      task.is_archived = true;
      task.created_at = new Date();
      task.created_by = this?.request?.user;
      const archivedTask = await this.tasksRepository.save(task);
      delete archivedTask?.created_by;
      return resSuccess(
        'Task archived successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        null
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async update(id: any, updateTasksDto: UpdateTasksDto, user: any) {
    try {
      const {
        due_date,
        task_name,
        description,
        status,
        assigned_by,
        assigned_to,
      } = updateTasksDto;

      const taskToUpdate: any = await this.tasksRepository.findOne({
        where: { id },
        relations: ['created_by', 'assigned_to', 'assigned_by', 'tenant'],
      });

      if (!taskToUpdate) {
        return resError(
          `Task not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (taskToUpdate.is_archived) {
        return resError(
          `Task is archived and cannot be updated.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (taskToUpdate?.created_by?.id == user?.id) {
        taskToUpdate.task_name = task_name ?? taskToUpdate.task_name;
        taskToUpdate.due_date = due_date
          ? new Date(moment(due_date, 'MM/DD/YYYY').format('YYYY-MM-DD'))
          : taskToUpdate.due_date;
        if (assigned_by) {
          const assignedBy = await this.userRepository.findOneBy({
            id: updateTasksDto.assigned_by,
          });
          if (!assignedBy) {
            return resError(
              `Assigned by user not found.`,
              ErrorConstants.Error,
              HttpStatus.NOT_FOUND
            );
          }
          taskToUpdate.assigned_by = assignedBy;
        }
      }

      if (assigned_to) {
        const assignedTo = await this.userRepository.findOneBy({
          id: updateTasksDto.assigned_to,
        });
        if (!assignedTo) {
          return resError(
            `Assigned user not found.`,
            ErrorConstants.Error,
            HttpStatus.NOT_FOUND
          );
        }

        taskToUpdate.assigned_to = assignedTo;
      }

      taskToUpdate.description = description ?? taskToUpdate.description;
      taskToUpdate.status = status ?? taskToUpdate.status;
      taskToUpdate.created_at = new Date();
      taskToUpdate.created_by = this?.request?.user;

      const updatedTask = await this.tasksRepository.save(taskToUpdate);

      delete updatedTask?.created_by;
      delete updatedTask?.assigned_by?.password;
      delete updatedTask?.assigned_to?.password;

      return resSuccess(
        'Task Updated.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        updatedTask
      );
    } catch (error) {
      return resError(
        error.message,
        ErrorConstants.Error,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
