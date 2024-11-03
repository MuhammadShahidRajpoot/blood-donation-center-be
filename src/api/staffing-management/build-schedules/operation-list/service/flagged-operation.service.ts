import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Drives } from 'src/api/operations-center/operations/drives/entities/drives.entity';
import { NonCollectionEvents } from 'src/api/operations-center/operations/non-collection-events/entities/oc-non-collection-events.entity';
import { Sessions } from 'src/api/operations-center/operations/sessions/entities/sessions.entity';
import { EntityManager, Not, Repository } from 'typeorm';
import { ScheduleOperation } from '../../entities/schedule_operation.entity';
import { Schedule, ScheduleStatusEnum } from '../../entities/schedules.entity';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { ScheduleOperationStatus } from '../../entities/schedule-operation-status.entity';
import { BuildSchedulesService } from '../../services/build-schedules.service';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
@Injectable()
export class FlaggedOperationService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Drives)
    private readonly drivesRepository: Repository<Drives>,
    @InjectRepository(Sessions)
    private readonly sessionsRepository: Repository<Sessions>,
    @InjectRepository(NonCollectionEvents)
    private readonly nonCollectionEventsRepository: Repository<NonCollectionEvents>,
    @InjectRepository(ScheduleOperation)
    private readonly scheduleOperationRepository: Repository<ScheduleOperation>,
    @InjectRepository(ScheduleOperationStatus)
    private readonly scheduleOperationStatusRepository: Repository<ScheduleOperationStatus>,
    private readonly buildScheduleService: BuildSchedulesService
  ) {}

  async flaggedOperationLocationChange(locationId: any, tenantId) {
    const scheduleOperations = await this.scheduleOperationRepository.find({
      where: {
        operation_type: Not(PolymorphicType.OC_OPERATIONS_SESSIONS),
      },
    });

    scheduleOperations.map(async (scheduleOperation) => {
      if (
        scheduleOperation.operation_type ===
        PolymorphicType.OC_OPERATIONS_DRIVES
      ) {
        const drive = await this.drivesRepository.find({
          where: {
            id: scheduleOperation.operation_id,
            location_id: locationId,
          },
        });
        if (drive?.length > 0) {
          await this.flaggedOperation(
            scheduleOperation.operation_id,
            scheduleOperation.operation_type,
            tenantId
          );
        }
      } else if (
        scheduleOperation.operation_type ===
        PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
      ) {
        const nonCollectionEvent =
          await this.nonCollectionEventsRepository.find({
            where: {
              id: scheduleOperation.operation_id,
              location_id: locationId,
            },
          });
        if (nonCollectionEvent?.length > 0) {
          await this.flaggedOperation(
            scheduleOperation.operation_id,
            scheduleOperation.operation_type,
            tenantId
          );
        }
      }
    });
  }

  async flaggedOperationOperationStatusChange(
    operationStatusId: any,
    tenantId
  ) {
    const scheduleOperations = await this.scheduleOperationRepository.find();

    scheduleOperations.map(async (scheduleOperation) => {
      if (
        scheduleOperation.operation_type ===
        PolymorphicType.OC_OPERATIONS_DRIVES
      ) {
        const drive = await this.drivesRepository.find({
          where: {
            id: scheduleOperation.operation_id,
            operation_status_id: operationStatusId,
          },
        });
        if (drive?.length > 0) {
          await this.flaggedOperation(
            scheduleOperation.operation_id,
            scheduleOperation.operation_type,
            tenantId
          );
        }
      } else if (
        scheduleOperation.operation_type ===
        PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
      ) {
        const nonCollectionEvent =
          await this.nonCollectionEventsRepository.find({
            where: {
              id: scheduleOperation.operation_id,
              status_id: { id: operationStatusId },
            },
          });
        if (nonCollectionEvent?.length > 0) {
          await this.flaggedOperation(
            scheduleOperation.operation_id,
            scheduleOperation.operation_type,
            tenantId
          );
        }
      } else if (
        scheduleOperation.operation_type ===
        PolymorphicType.OC_OPERATIONS_SESSIONS
      ) {
        const session = await this.sessionsRepository.find({
          where: {
            id: scheduleOperation.operation_id,
            operation_status_id: operationStatusId,
          },
        });
        if (session?.length > 0) {
          await this.flaggedOperation(
            scheduleOperation.operation_id,
            scheduleOperation.operation_type,
            tenantId
          );
        }
      }
    });
  }

  /**
   * Entry function to check for flagged operations
   * @param operation_id
   * @param operation_type
   */
  async flaggedOperation(operation_id: any, operation_type: any, tenant_id) {
    try {
      const operation = await this.checkOperation(
        operation_id,
        operation_type,
        tenant_id
      );
      const isEdited = await this.IsNewOrEdited(operation[0], tenant_id);
      return isEdited;
    } catch (error) {
      return resError(
        'Failed to check Operations',
        'failed',
        HttpStatus.PRECONDITION_FAILED
      );
    }
  }

  /**
   * Get Operations Data
   * @param operation_id
   * @param operation_type
   */
  async checkOperation(operation_id: any, operation_type: any, tenant_id) {
    try {
      let operation: any;
      switch (operation_type) {
        case PolymorphicType.OC_OPERATIONS_DRIVES:
          const drives = await this.drivesRepository
            .createQueryBuilder('drives')
            .select()
            .leftJoinAndSelect('drives.account', 'account')
            .where(
              'drives.id = :id AND drives.is_archived = false AND drives.tenant_id = :tenant_id',
              {
                id: operation_id,
                tenant_id,
              }
            )
            .getRawMany();

          operation = drives.map((drive: any) => {
            return {
              tenant_id: drive.drives_tenant_id,
              id: drive.drives_id,
              type: PolymorphicType.OC_OPERATIONS_DRIVES,
              date: drive.drives_date,
              collection_operation: drive.account_collection_operation,
              operation_status: drive.drives_operation_status_id,
            };
          });

          break;
        case PolymorphicType.OC_OPERATIONS_SESSIONS:
          const sessions = await this.sessionsRepository.find({
            where: {
              id: operation_id,
              is_archived: false,
              tenant_id: tenant_id,
            },
          });
          operation = sessions.map((session: any) => {
            return {
              tenant_id: session.tenant_id,
              id: session.id,
              type: PolymorphicType.OC_OPERATIONS_SESSIONS,
              date: session.date,
              collection_operation: session.collection_operation_id,
              operation_status: session.operation_status_id,
            };
          });
          break;
        case PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS:
          const nce = await this.nonCollectionEventsRepository.find({
            where: {
              id: operation_id,
              is_archived: false,
              tenant_id: tenant_id,
            },
            select: [
              'tenant_id',
              'id',
              'date',
              'collection_operation_id',
              'status_id',
              'tenant_id',
            ],
            relations: ['collection_operation_id', 'status_id'],
          });
          operation = nce.map((event: any) => {
            return {
              tenant_id: event.tenant_id,
              id: event.id,
              type: 'oc_non_collection_events',
              date: event.date,
              collection_operation: event.collection_operation_id[0].id,
              operation_status: event.status_id.id,
            };
          });
          break;
        default:
          break;
      }
      return operation;
    } catch (error) {
      return resError(
        error?.message || `Cannot Get Operation data: ${error}`,
        'failed',
        HttpStatus.PRECONDITION_FAILED
      );
    }
  }

  /**
   * Check if Operation is Created or Edited
   * @param operation_id
   * @param operation_type
   */
  async IsNewOrEdited(operations: any, tenant_id) {
    try {
      const schedule = await this.scheduleOperationRepository
        .createQueryBuilder('schedule_operation')
        .where(
          'schedule_operation.operation_id = :operationID AND schedule_operation.operation_type = :operationType ',
          { operationID: operations.id, operationType: operations.type }
        )
        .getRawOne();
      return schedule === (null || undefined)
        ? this.operationDoesNotExistsInSchedule(operations, tenant_id)
        : this.operationExistsInSchedule(operations, schedule, tenant_id);
    } catch (error) {
      return resError(
        error?.message || `Cannot Check if Edited or Created: ${error}`,
        'failed',
        HttpStatus.PRECONDITION_FAILED
      );
    }
  }

  /**
   * if schedule is found then the operation is edited
   * @param operations
   * @param scheduleOP
   */
  async operationExistsInSchedule(operations: any, scheduleOP: any, tenant_id) {
    try {
      const schedule = await this.scheduleRepository
        .createQueryBuilder('schedule')
        .select()
        .where('schedule.id = :id and schedule.tenant_id = :tenant_id', {
          id: scheduleOP.schedule_operation_schedule_id,
          tenant_id,
        })
        .getRawOne();

      if(schedule?.schedule_schedule_status !== ScheduleStatusEnum.Published) {
        return resSuccess(
          `Schedule is not Published`,
          'Skipped',
          HttpStatus.NO_CONTENT
        );
      }
      // check if the edited operation's date still lie between the schedule date range
      if (
        (schedule.schedule_start_date <= operations.date &&
          schedule.schedule_end_date >= operations.date) ||
        schedule.schedule_start_date === operations.date ||
        schedule.schedule_end_date === operations.date
      ) {
        const scheduleOperationStatus =
          await this.scheduleOperationStatusRepository
            .createQueryBuilder('opStatus')
            .where(
              'opStatus.schedule_id = :id AND opStatus.operation_status_id = :opId',
              { id: schedule.schedule_id, opId: operations.operation_status }
            )
            .select()
            .getRawMany();

        // if operation lies between the date range then check if it belongs to operation status of the schedule
        if (scheduleOperationStatus !== (null || undefined)) {
          const flagChanges: any =
            await this.buildScheduleService.flagOperationAndGetChangeSummaryData(
              operations.id,
              operations.type,
              true
            );
          if (flagChanges.flagged) {
            const flaggedSchedule = await this.updateScheduletoFlag(
              schedule,
              tenant_id
            );
            const flaggedScheduleOperation = await this.updateScheduleOptoFlag(
              schedule,
              operations
            );

            return { flaggedSchedule, flaggedScheduleOperation };
          }
          return null;
        } else {
          const flaggedScheduleOperation =
            await this.scheduleOperationRepository.findOne({
              where: {
                schedule_id: schedule.schedule_id,
                operation_id: operations.operation_id,
                operation_type: operations.operation_type,
              },
            });

          flaggedScheduleOperation.in_sync = false;
          const flagOp = this.scheduleOperationRepository.save(
            flaggedScheduleOperation
          );
          return flagOp;
        }
      } else {
        const flaggedScheduleOperation =
          await this.scheduleOperationRepository.findOne({
            where: {
              schedule_id: schedule.schedule_id,
              operation_id: operations.operation_id,
              operation_type: operations.operation_type,
            },
          });

        flaggedScheduleOperation.in_sync = false;
        const flagOp = this.scheduleOperationRepository.save(
          flaggedScheduleOperation
        );
        return flagOp;
      }
    } catch (error) {
      return resError(
        error?.message || `Cannot update Existing Schedule Operation: ${error}`,
        'failed',
        HttpStatus.EXPECTATION_FAILED
      );
    }
  }

  /**
   * if no schedule is found then it is a new operation
   * @param operations
   */
  async operationDoesNotExistsInSchedule(operations: any, tenant_id) {
    try {
      const scheduleData = await this.scheduleRepository
        .createQueryBuilder('schedule')
        .select()
        .where('schedule.collection_operation_id = :collectionID', {
          collectionID: operations.collection_operation,
        })
        .andWhere(
          '((:date BETWEEN schedule.start_date AND schedule.end_date) OR (:date = schedule.start_date) OR (:date = schedule.end_date))',
          {
            date: operations.date,
          }
        )
        .getRawOne();
      if (scheduleData !== (null || undefined)) {
        if(scheduleData.schedule_schedule_status !== ScheduleStatusEnum.Published) {
          return resSuccess(
            `Schedule is not Published`,
            'Skipped',
            HttpStatus.NO_CONTENT
          );
        }
        const schedule_operation = new ScheduleOperation();
        schedule_operation.operation_id = operations.id;
        schedule_operation.operation_type = operations.type;
        schedule_operation.schedule_id = scheduleData.schedule_id;
        schedule_operation.pending_assignment = false;
        schedule_operation.in_sync = false;
        schedule_operation.to_be_removed = false;
        schedule_operation.created_by = scheduleData.schedule_created_by;
        const newSchedule =
          this.scheduleOperationRepository.create(schedule_operation);
        const scheduleOperation = await this.scheduleOperationRepository.save(
          newSchedule
        );

        // update the is_flagged of schedule as well
        const flaggedSchedule = await this.updateScheduletoFlag(
          scheduleData,
          tenant_id
        );

        return { flaggedSchedule };
      } else {
        return resSuccess(
          `Operation does not belong to any Schedule`,
          'Skipped',
          HttpStatus.NO_CONTENT
        );
      }
    } catch (error) {
      return resError(
        error?.message || `Cannot Add new Operation: ${error}`,
        'failed',
        HttpStatus.EXPECTATION_FAILED
      );
    }
  }

  /**
   * If schedule exists for the expected date range update the flagged to true
   * @param schedule
   * @returns
   */
  async updateScheduletoFlag(schedules: any, tenant_id) {
    try {
      const schedule: any = await this.scheduleRepository.findOne({
        where: {
          id: schedules.schedule_id,
          is_archived: false,
          tenant_id: tenant_id,
        },
        relations: ['created_by', 'collection_operation_id'],
      });
      schedule.is_flagged = true;
      const flagged = this.scheduleRepository.create(schedule);
      const flaggedSchedule = await this.scheduleRepository.save(schedule);
      return flaggedSchedule;
    } catch (error) {
      return resError(
        error?.message || `Failed to Flag a Schedule: ${error}`,
        'failed',
        HttpStatus.EXPECTATION_FAILED
      );
    }
  }

  /**
   * Change the in_sync of operation to false
   * @param schedule
   * @returns
   */
  async updateScheduleOptoFlag(schedules: any, operation: any) {
    try {
      const scheduleOp: any = await this.scheduleOperationRepository.findOne({
        where: {
          schedule_id: schedules.schedule_id,
          operation_id: operation.operation_id,
          operation_type: operation.operation_type,
        },
      });
      scheduleOp.in_sync = false;
      const flagged = this.scheduleOperationRepository.create(scheduleOp);
      const flaggedSchedule = await this.scheduleOperationRepository.save(
        scheduleOp
      );
      return flaggedSchedule;
    } catch (error) {
      return resError(
        error?.message || `Failed to Flag a Schedule Operation: ${error}`,
        'failed',
        HttpStatus.EXPECTATION_FAILED
      );
    }
  }
}
