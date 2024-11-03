import { HttpStatus, Inject, Injectable, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Schedule, ScheduleStatusEnum } from '../entities/schedules.entity';
import {
  Between,
  Brackets,
  EntityManager,
  EntityRepository,
  In,
  LessThan,
  MoreThan,
  Repository,
} from 'typeorm';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity'; // Update with the actual path
import { OperationsStatus } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { Drives } from 'src/api/operations-center/operations/drives/entities/drives.entity';
import { Sessions } from 'src/api/operations-center/operations/sessions/entities/sessions.entity';
import { NonCollectionEvents } from 'src/api/operations-center/operations/non-collection-events/entities/oc-non-collection-events.entity';
import { ScheduleOperationStatus } from '../entities/schedule-operation-status.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { ShiftsRoles } from 'src/api/crm/crm-non-collection-profiles/blueprints/entities/shifts-roles.entity';
import { ShiftsProjectionsStaff } from 'src/api/shifts/entities/shifts-projections-staff.entity';
import { StaffConfig } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/StaffConfig.entity';
import { ShiftsVehicles } from 'src/api/shifts/entities/shifts-vehicles.entity';
import { ShiftsDevices } from 'src/api/shifts/entities/shifts-devices.entity';
import { StaffAssignments } from 'src/api/crm/contacts/staff/staffSchedule/entity/self-assignment.entity';
import { GetSchedulesOptionalParamDto } from '../dto/query-params.dto';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { PublishDto } from '../dto/publish-schedule.dto';
import { GetRtdDto } from '../dto/get-rtd.dto';
import { Directions } from 'src/api/crm/locations/directions/entities/direction.entity';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';
import { UpdateDataRtdIndividualDto } from '../dto/update-data-rtd-individual-dto';
import { CommonFunction } from 'src/api/crm/contacts/common/common-functions';
import moment from 'moment';
import { ScheduleOperation } from '../entities/schedule_operation.entity';
import { GetAvailableDevicesParamsDto } from '../dto/get-available-devices';
import { UpdateHomeBaseDto } from '../dto/update-home-base-dto';
import { StaffAssignmentsDrafts } from '../entities/staff-assignments-drafts';
import { VehiclesAssignmentsDrafts } from '../entities/vehicles-assignment-drafts.entity';
import { DeviceAssignmentsDrafts } from '../entities/devices-assignment-drafts.entity';
import { HomeBaseEnum } from '../enums/home-base.enum';
import { DeviceAssignments } from '../entities/devices-assignment.entity';
import { VehiclesAssignments } from '../entities/vehicles-assignment.entity';
import { GetAvailableVehiclesParamsDto } from '../dto/get-available-vehicles';
import { CreateStaffAssignmentDto } from '../dto/create-staff-assignment.dto';
import { CrmLocationsHistory } from 'src/api/crm/locations/entities/crm-locations-history';
import { ShiftsHistory } from 'src/api/shifts/entities/shifts-history.entity';
import { DrivesHistory } from 'src/api/operations-center/operations/drives/entities/drives-history.entity';
import { NonCollectionEventsHistory } from 'src/api/operations-center/operations/non-collection-events/entities/oc-non-collection-events-history.entity';
import { SessionsHistory } from 'src/api/operations-center/operations/sessions/entities/sessions-history.entity';
import { OperationsStatusHistory } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status_history.entity';
import { CrmLocations } from 'src/api/crm/locations/entities/crm-locations.entity';
import { AddDeviceAssignmentParamsDto } from '../dto/add-device-assignment';
import { AddVehicleAssignmentParamsDto } from '../dto/add-vehicle-assignment';
import { Notifications } from '../entities/notifications.entity';
import { NotificationsStaff } from '../entities/notifications-staff.entity';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { NotifyStaffDto } from '../dto/notify-staff.dto';
import { Device } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device.entity';
import { Vehicle } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle.entity';
import { ContactsRoles } from 'src/api/system-configuration/tenants-administration/crm-administration/contacts/role/entities/contacts-role.entity';
import { Staff } from 'src/api/crm/contacts/staff/entities/staff.entity';
import { ShiftsVehiclesHistory } from 'src/api/shifts/entities/shifts-vehicles-history.entity';
import { ShiftsDevicesHistory } from 'src/api/shifts/entities/shifts-devices-history.entity';
import { ShiftsStaffSetups } from 'src/api/shifts/entities/shifts-staffsetups.entity';
import { ShiftsStaffSetupsHistory } from 'src/api/shifts/entities/shifts-staffsetups-history.entity';

@Injectable()
@EntityRepository(Schedule)
export class BuildSchedulesService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BusinessUnits)
    private readonly businessUnitsRepository: Repository<BusinessUnits>,
    @InjectRepository(OperationsStatus)
    private readonly operationsStatusRepository: Repository<OperationsStatus>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(ScheduleOperationStatus)
    private readonly scheduleOperationStatusRepository: Repository<ScheduleOperationStatus>,
    @InjectRepository(Drives)
    private readonly driveRepository: Repository<Drives>,
    @InjectRepository(Sessions)
    private readonly sessionRepository: Repository<Sessions>,
    @InjectRepository(NonCollectionEvents)
    private readonly nonCollectionEventsRepository: Repository<NonCollectionEvents>,
    @InjectRepository(StaffConfig)
    private readonly staffConfigRepository: Repository<StaffConfig>,
    @InjectRepository(Directions)
    private readonly directionRepository: Repository<Directions>,
    @InjectRepository(ShiftsProjectionsStaff)
    private readonly shiftsProjectionsStaffRepository: Repository<ShiftsProjectionsStaff>,
    @InjectRepository(Shifts)
    private readonly shiftsRepository: Repository<Shifts>,
    @InjectRepository(ScheduleOperation)
    private readonly scheduleOperationRepository: Repository<ScheduleOperation>,
    @InjectRepository(StaffAssignments)
    private readonly staffAssignmentsRepository: Repository<StaffAssignments>,
    @InjectRepository(VehiclesAssignments)
    private readonly vehiclesAssignmentsRepository: Repository<VehiclesAssignments>,
    @InjectRepository(DeviceAssignments)
    private readonly deviceAssignmentsRepository: Repository<DeviceAssignments>,
    @InjectRepository(StaffAssignmentsDrafts)
    private readonly staffAssignmentsDraftsRepository: Repository<StaffAssignmentsDrafts>,
    @InjectRepository(VehiclesAssignmentsDrafts)
    private readonly vehiclesAssignmentsDraftsRepository: Repository<VehiclesAssignmentsDrafts>,
    @InjectRepository(DeviceAssignmentsDrafts)
    private readonly deviceAssignmentsDraftsRepository: Repository<DeviceAssignmentsDrafts>,
    @InjectRepository(ShiftsDevices)
    private readonly shiftDevicesRepository: Repository<ShiftsDevices>,
    @InjectRepository(ShiftsVehicles)
    private readonly shiftVehiclesRepository: Repository<ShiftsVehicles>,
    @InjectRepository(ShiftsRoles)
    private readonly shiftRolesRepository: Repository<ShiftsRoles>,
    @InjectRepository(CrmLocationsHistory)
    private readonly crmLocationsHistoryRepository: Repository<CrmLocationsHistory>,
    @InjectRepository(ShiftsHistory)
    private readonly shiftsHistoryRepository: Repository<ShiftsHistory>,
    @InjectRepository(DrivesHistory)
    private readonly drivesHistoryRepository: Repository<DrivesHistory>,
    @InjectRepository(NonCollectionEventsHistory)
    private readonly nonCollectionEventsHistoryRepository: Repository<NonCollectionEventsHistory>,
    @InjectRepository(SessionsHistory)
    private readonly sessionsHistoryRepository: Repository<SessionsHistory>,
    @InjectRepository(OperationsStatusHistory)
    private readonly operationsStatusHistoryRepository: Repository<OperationsStatusHistory>,
    @InjectRepository(CrmLocations)
    private readonly crmLocationsRepository: Repository<CrmLocations>,
    @InjectRepository(Notifications)
    private readonly notificationsRepository: Repository<Notifications>,
    @InjectRepository(NotificationsStaff)
    private readonly notificationsStaffRepository: Repository<NotificationsStaff>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(ContactsRoles)
    private readonly contactsRolesRepository: Repository<ContactsRoles>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(ShiftsVehiclesHistory)
    private readonly shiftVehiclesHistoryRepository: Repository<ShiftsVehiclesHistory>,
    @InjectRepository(ShiftsDevicesHistory)
    private readonly shiftDevicesHistoryRepository: Repository<ShiftsDevicesHistory>,
    @InjectRepository(ShiftsStaffSetups)
    private readonly shiftsStaffSetupsRepository: Repository<ShiftsStaffSetups>,
    @InjectRepository(ShiftsStaffSetupsHistory)
    private readonly shiftsStaffSetupsHistoryRepository: Repository<ShiftsStaffSetupsHistory>,
    private readonly commonFunction: CommonFunction
  ) {}

  async checkScheduleExists(
    start_date: any,
    end_date: any,
    collection_operation_id: any,
    user: any
  ) {
    try {
      const dataExists = await this.scheduleRepository
        .createQueryBuilder('schedule')
        .where('schedule.collection_operation_id = :collection_operation_id', {
          collection_operation_id,
        })
        .getCount();

      let scheduleDataExists: any = 0;

      if (dataExists > 0) {
        scheduleDataExists = await this.scheduleRepository
          .createQueryBuilder('schedule')
          .where(
            ' (schedule.collection_operation_id = :collection_operation_id) AND (schedule.is_archived = false) AND ( (schedule.start_date >= :start_date AND schedule.start_date <= :end_date) OR (schedule.end_date >= :start_date AND schedule.end_date <= :end_date) ) and schedule.tenant_id = :tenant_id',
            {
              start_date: new Date(start_date),
              end_date: new Date(end_date),
              collection_operation_id: collection_operation_id,
              tenant_id: user.tenant_id,
            }
          )
          .getRawMany();
      }
      return scheduleDataExists.length;
    } catch (error) {
      return resError(
        'Schedule Overlaps with another schedule',
        ErrorConstants.Error,
        HttpStatus.PRECONDITION_FAILED
      );
    }
  }

  async createSchedule(createScheduleDto: any, user: any) {
    if (!createScheduleDto) {
      throw new Error('Invalid schedule data');
    }
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const schedule = new Schedule();
      schedule.start_date = createScheduleDto.start_date;
      schedule.end_date = createScheduleDto.end_date;
      schedule.schedule_status = createScheduleDto.schedule_status;
      schedule.collection_operation_id =
        createScheduleDto.collection_operation_id;
      schedule.is_archived = createScheduleDto.is_archived;
      schedule.is_flagged = createScheduleDto.is_flagged;
      schedule.is_paused = createScheduleDto.is_paused;
      schedule.is_locked = createScheduleDto.is_locked;
      schedule.created_by = createScheduleDto.created_by;
      schedule.tenant_id = user?.tenant?.id;
      const newSchedule = this.scheduleRepository.create(schedule);
      const scheduleData = await this.scheduleRepository.save(newSchedule);
      const operations = await this.createScheduleOperation(
        createScheduleDto,
        scheduleData.id
      );

      const some = await this.saveData(
        scheduleData.id,
        createScheduleDto.created_by,
        createScheduleDto.operation_status,
        createScheduleDto.collection_operation_id
      );
      scheduleData.operation_status = operations;
      return { scheduleData, some };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(
        error?.message || `Invalid Schedule Data: ${error}`,
        'failed',
        HttpStatus.BAD_REQUEST
      );
    } finally {
      await queryRunner.release();
    }
  }
  async createScheduleOperation(createScheduleDto: any, scheduleId: any) {
    if (!createScheduleDto) {
      throw new Error('Invalid schedule data');
    }
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const promises: any[] = [];
      for (const status of createScheduleDto.operation_status) {
        const scheduleOperation = new ScheduleOperationStatus();
        scheduleOperation.is_archived = createScheduleDto.is_archived;
        scheduleOperation.created_by = createScheduleDto.created_by;
        scheduleOperation.schedule_id = scheduleId;
        scheduleOperation.operation_status_id = status;
        const newObj =
          this.scheduleOperationStatusRepository.create(scheduleOperation);
        const promise = this.scheduleOperationStatusRepository.save(newObj);
        promises.push(promise);
      }
      const savedEntries: any = await Promise.all(promises);
      await queryRunner.commitTransaction();
      return savedEntries;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(
        error?.message || `Cannot Get Operation data: ${error}`,
        'failed',
        HttpStatus.PRECONDITION_FAILED
      );
    } finally {
      await queryRunner.release();
    }
  }
  async saveData(
    scheduleId: any,
    userId: any,
    operationStatus: any,
    collection_operation_id: any
  ) {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    const drives = await this.driveRepository
      .createQueryBuilder('drives')
      .innerJoin('accounts', 'a', 'a.id = drives.account_id')
      .where('drives.operation_status_id IN (:...status)', {
        status: operationStatus,
      })
      .andWhere('(drives.date Between :startDate AND :endDate)', {
        startDate: schedule.start_date,
        endDate: schedule.end_date,
      })
      .andWhere('drives.is_archived = false')
      .andWhere('a.collection_operation = :collection_operation', {
        collection_operation: collection_operation_id,
      })
      .getRawMany();

    const sessions = await this.sessionRepository.find({
      where: {
        date: Between(schedule.start_date, schedule.end_date),
        operation_status_id: In(operationStatus),
        is_archived: false,
        collection_operation_id: collection_operation_id,
      },
      select: ['id', 'tenant_id'],
    });

    const nonCollectionEvents = await this.nonCollectionEventsRepository
      .createQueryBuilder('nce')
      .innerJoin(
        'nce_collection_operations',
        'nceco',
        'nceco.nce_id = nce.id AND nceco.business_unit_id = :businessUnitId',
        { businessUnitId: collection_operation_id }
      )
      .where({
        is_archived: false,
        date: Between(schedule.start_date, schedule.end_date),
        status_id: In(operationStatus),
      })
      .select(['nce.id'])
      .getMany();

    const driveIds = drives.map((drive) => drive.drives_id);
    const sessionIds = sessions.map((session) => session.id);
    const nonCollectionEventIds = nonCollectionEvents.map((event) => event.id);
    const driveShifts = await this.shiftsRepository.find({
      where: {
        shiftable_id: In(driveIds),
        shiftable_type: PolymorphicType.OC_OPERATIONS_DRIVES,
      },
      select: ['shiftable_id', 'shiftable_type', 'tenant_id'],
    });

    // Find shifts for sessions
    const sessionShifts = await this.shiftsRepository.find({
      where: {
        shiftable_id: In(sessionIds),
        shiftable_type: PolymorphicType.OC_OPERATIONS_SESSIONS,
      },
      select: ['shiftable_id', 'shiftable_type', 'tenant_id'],
    });
    // Find shifts for non-collection events
    const nonCollectionEventShifts = await this.shiftsRepository.find({
      where: {
        shiftable_id: In(nonCollectionEventIds),
        shiftable_type: 'oc_non_collection_events',
      },
      select: ['shiftable_id', 'shiftable_type', 'tenant_id'],
    });
    // Concatenate the results
    const allShifts = [
      ...driveShifts,
      ...sessionShifts,
      ...nonCollectionEventShifts,
    ];
    const uniqueShifts = allShifts.reduce((unique, shift) => {
      const isUnique = !unique.some(
        (s) => s.shiftable_id === shift.shiftable_id
      );
      return isUnique ? [...unique, shift] : unique;
    }, []);
    const promises: any[] = [];
    for (const [key, value] of Object.entries(uniqueShifts)) {
      const queryRunner = this.entityManager.connection.createQueryRunner();
      try {
        await queryRunner.connect();
        await queryRunner.startTransaction();
        const schedule_operation = new ScheduleOperation();
        schedule_operation.operation_id = value.shiftable_id;
        schedule_operation.operation_type = value.shiftable_type;
        schedule_operation.schedule_id = scheduleId;
        schedule_operation.pending_assignment = false;
        schedule_operation.in_sync = true;
        schedule_operation.to_be_removed = false;
        schedule_operation.created_by = userId;
        const newSchedule =
          this.scheduleOperationRepository.create(schedule_operation);
        const scheduleData = await this.scheduleOperationRepository.save(
          newSchedule
        );
        promises.push(scheduleData);
      } catch (error) {
        await queryRunner.rollbackTransaction();
        return resError(
          error?.message || `Failed to create Schedule: ${error}`,
          'failed',
          HttpStatus.PRECONDITION_FAILED
        );
      } finally {
        await queryRunner.release();
      }
    }
    const savedEntries: any = await Promise.all(promises);
    return savedEntries;
  }
  async calculateTotalOperations(schedule: any): Promise<number> {
    try {
      const totalOperations = await this.scheduleOperationRepository.count({
        where: {
          schedule_id: schedule.schedule_id,
        },
      });
      return totalOperations;
    } catch (error) {
      return error.message, ErrorConstants.Error, error.status;
    }
  }

  async calculateFullyStaff(schedule: any): Promise<number> {
    try {
      const operations = await this.scheduleOperationRepository.find({
        where: {
          schedule_id: schedule.schedule_id,
        },
      });
      const getShifts = async (operation: any) => {
        return this.shiftsRepository.find({
          where: {
            shiftable_id: operation.operation_id,
            shiftable_type: operation.operation_type,
          },
          order: {
            start_time: 'ASC',
            end_time: 'DESC',
          },
        });
      };

      const addShiftsToOperations = async (operations: any[]) => {
        return Promise.all(
          operations.map(async (operation) => {
            const shifts = await getShifts(operation);
            const filteredShifts = shifts.filter((shift) => {
              return (
                shift.shiftable_type === PolymorphicType.OC_OPERATIONS_DRIVES ||
                shift.shiftable_type ===
                  PolymorphicType.OC_OPERATIONS_SESSIONS ||
                shift.shiftable_type === 'oc_non_collection_events'
              );
            });
            const shiftsWithProjections = await Promise.all(
              filteredShifts.map(async (shift) => {
                const projections: any[] =
                  await this.shiftsProjectionsStaffRepository.find({
                    where: { shift_id: shift.id },
                  });
                let requestedStaffQty: any;
                let assignedStaff: any;
                let requesteddevices: any;
                let assignedDevices: any;
                let requestedVehicles: any;
                let assignedVehicles: any;
                if (
                  shift.shiftable_type ===
                    PolymorphicType.OC_OPERATIONS_DRIVES ||
                  shift.shiftable_type ===
                    PolymorphicType.OC_OPERATIONS_SESSIONS
                ) {
                  const staffSetups = projections.map(
                    (projection) => projection.staff_setup_id
                  );
                  const staff = [...staffSetups];
                  requestedStaffQty = await this.staffConfigRepository.find({
                    where: {
                      staff_setup_id: In(staff),
                    },
                  });
                  const shiftids = projections.map(
                    (projection) => projection.shift_id
                  );
                  assignedStaff = await this.staffAssignmentsRepository.count({
                    where: {
                      operation_id: shift.shiftable_id,
                      operation_type: shift.shiftable_type,
                      shift_id: In(shiftids),
                    },
                  });
                  requesteddevices = await this.shiftDevicesRepository.count({
                    where: {
                      shift_id: In(shiftids),
                    },
                  });
                  assignedDevices =
                    await this.deviceAssignmentsRepository.count({
                      where: {
                        operation_id: shift.shiftable_id,
                        operation_type: shift.shiftable_type,
                        shift_id: In(shiftids),
                      },
                    });
                  requestedVehicles = await this.shiftVehiclesRepository.count({
                    where: {
                      shift_id: In(shiftids),
                    },
                  });
                  assignedVehicles =
                    await this.vehiclesAssignmentsRepository.count({
                      where: {
                        operation_id: shift.shiftable_id,
                        operation_type: shift.shiftable_type,
                        shift_id: In(shiftids),
                      },
                    });
                } else if (
                  shift.shiftable_type === 'oc_non_collection_events'
                ) {
                  requestedStaffQty = await this.shiftRolesRepository.find({
                    where: {
                      shift_id: shift.id,
                    },
                  });
                  const roleids = await this.shiftRolesRepository.find({
                    where: { shift_id: shift.id },
                  });
                  const roleId = roleids.map((roleid) => roleid.role_id);
                  assignedStaff = await this.staffAssignmentsRepository.count({
                    where: {
                      operation_id: shift.shiftable_id,
                      operation_type: shift.shiftable_type,
                      role_id: In(roleId),
                    },
                  });
                  requesteddevices = await this.shiftDevicesRepository.count({
                    where: {
                      shift_id: shift.id,
                    },
                  });
                  assignedDevices =
                    await this.deviceAssignmentsRepository.count({
                      where: {
                        operation_id: shift.shiftable_id,
                        operation_type: shift.shiftable_type,
                        shift_id: shift.id,
                      },
                    });
                  requestedVehicles = await this.shiftVehiclesRepository.count({
                    where: {
                      shift_id: shift.id,
                    },
                  });
                  assignedVehicles =
                    await this.vehiclesAssignmentsRepository.count({
                      where: {
                        operation_id: shift.shiftable_id,
                        operation_type: shift.shiftable_type,
                        shift_id: shift.id,
                      },
                    });
                }
                const requestedStaff =
                  shift.shiftable_type ===
                    PolymorphicType.OC_OPERATIONS_DRIVES ||
                  shift.shiftable_type ===
                    PolymorphicType.OC_OPERATIONS_SESSIONS
                    ? requestedStaffQty.reduce(
                        (sum: any, staffQty: any) => sum + staffQty.qty,
                        0
                      )
                    : shift.shiftable_type === 'oc_non_collection_events'
                    ? requestedStaffQty.reduce(
                        (sum: any, staffQty: any) => sum + staffQty.quantity,
                        0
                      )
                    : null;
                return shift.shiftable_type ===
                  PolymorphicType.OC_OPERATIONS_DRIVES ||
                  shift.shiftable_type ===
                    PolymorphicType.OC_OPERATIONS_SESSIONS
                  ? {
                      ...shift,
                      staffSetup: {
                        requestedStaff,
                        assignedStaff,
                      },
                      devices: {
                        requesteddevices,
                        assignedDevices,
                      },
                      vehicles: {
                        requestedVehicles,
                        assignedVehicles,
                      },
                    }
                  : shift.shiftable_type === 'oc_non_collection_events'
                  ? {
                      ...shift,
                      shiftRole: {
                        requestedStaff,
                        assignedStaff,
                      },
                      devices: {
                        requesteddevices,
                        assignedDevices,
                      },
                      vehicles: {
                        requestedVehicles,
                        assignedVehicles,
                      },
                    }
                  : null;
              })
            );
            return { ...operation, shifts: shiftsWithProjections };
          })
        );
      };
      const shiftsAndProjections = await addShiftsToOperations(operations);
      const totalStaff: any = shiftsAndProjections.map((val) => {
        val.totalStaffCount = 0;
        val.totalVehiclesCount = 0;
        val.totalDevicesCount = 0;
        val.operation_type = val.shifts[0]?.shiftable_type || null;
        let requestedStaff = 0;
        let assignedStaff = 0;
        let requestedDevices = 0;
        let assignedDevices = 0;
        let requestedVehicles = 0;
        let assignedVehicles = 0;
        val.shifts.forEach((shift: any) => {
          requestedDevices += shift.requesteddevices;
          assignedDevices += shift.assignedDevices;
          requestedVehicles += shift.requestedVehicles;
          assignedVehicles += shift.assignedVehicles;
          if (shift.staffSetup !== (null || undefined)) {
            requestedStaff += shift.staffSetup.requestedStaff;
            assignedStaff += shift.staffSetup.assignedStaff;
          } else if (shift.shiftRole !== (null || undefined)) {
            requestedStaff += shift.shiftRole.requestedStaff;
            assignedStaff += shift.shiftRole.assignedStaff;
          }
        });
        assignedStaff >= requestedStaff && requestedStaff !== 0
          ? val.totalStaffCount++
          : 0;
        assignedDevices >= requestedDevices && requestedDevices !== 0
          ? val.totalDevicesCount++
          : 0;
        assignedVehicles >= requestedVehicles && requestedVehicles !== 0
          ? val.totalVehiclesCount++
          : 0;
        return val;
      });
      let fullyStaffed = 0;
      totalStaff.map((val) => {
        val.totalStaffCount === 1 ? fullyStaffed++ : 0;
      });
      return fullyStaffed;
    } catch (error) {
      return error.message, ErrorConstants.Error, error.status;
    }
  }

  async getAllSchedules(
    @Query() query: GetSchedulesOptionalParamDto,
    user: any
  ) {
    try {
      // code for pagination
      const limit: number = query?.limit
        ? +query?.limit
        : +process.env.PAGE_SIZE;
      let page = query?.page ? +query?.page : 1;

      if (page < 1) {
        page = 1;
      }
      let queryBuilder = this.scheduleRepository
        .createQueryBuilder('schedule')
        .leftJoinAndSelect('schedule.collection_operation_id', 'businessUnit')
        .select([
          'schedule.id',
          'schedule.start_date',
          'schedule.end_date',
          'schedule.schedule_status',
          'schedule.is_archived',
          'schedule.is_flagged',
          'schedule.is_locked',
          'schedule.locked_by',
          'schedule.is_paused',
          'schedule.tenant_id as tenant_id',
          'schedule.created_by',
          'schedule.created_at',
          'businessUnit.name',
          'businessUnit.id',
        ])
        .andWhere(
          `schedule.is_archived = false and schedule.tenant_id = ${user.tenant.id}`
        );
      if (query.flagged !== undefined) {
        queryBuilder.andWhere('schedule.is_flagged = :isFlagged', {
          isFlagged: query.flagged,
        });
      }
      if (query.status) {
        queryBuilder.andWhere('schedule.schedule_status = :status', {
          status: query.status,
        });
      }
      if (query.startDate) {
        queryBuilder.andWhere('schedule.start_date = :startDate', {
          startDate: query.startDate,
        });
      }
      if (query.collectionOperation) {
        if (Array.isArray(query.collectionOperation)) {
          queryBuilder.andWhere(
            'schedule.collection_operation_id IN (:...collectionOperation)',
            {
              collectionOperation: query.collectionOperation,
            }
          );
        } else {
          queryBuilder.andWhere(
            'schedule.collection_operation_id = :collectionOperation',
            {
              collectionOperation: query.collectionOperation,
            }
          );
        }
      }
      if (query?.keyword) {
        queryBuilder.andWhere(
          '(businessUnit.name ILIKE :keyword or CAST(schedule.start_date AS TEXT) ILIKE :keyword or schedule.schedule_status::text ILIKE :keyword)',
          {
            keyword: `%${query.keyword}%`,
          }
        );
      }

      const sortOrder =
        query.sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      let sortBy = query.sortBy;
      if (query?.sortBy) {
        switch (sortBy) {
          case 'businessUnit_name':
            sortBy = 'businessUnit.name';
            break;
          case 'schedule_start_date':
            sortBy = 'schedule.start_date';
            break;
          case 'schedule_end_date':
            sortBy = 'schedule.end_date';
            break;
          case 'schedule_schedule_status':
            sortBy = 'schedule.schedule_status';
            break;
          default:
            sortBy = '';
        }
        queryBuilder.orderBy(sortBy, sortOrder);
      }

      // Pagination
      /* if sort by is total operations or fully staff, do not apply page/limit
       * first fetch all schedules, calculate total operations and fully staff
       * sort it
       * then apply page/limit
       */
      if (query.sortBy == 'totalOperations' || query.sortBy == 'fullyStaffed') {
        // Fetch ALL schedules
        const schedules = await queryBuilder.getRawMany();
        // Perform additional calculations on retrieved schedules
        const results = await Promise.all(
          schedules.map(async (schedule) => {
            const totalOperations = await this.calculateTotalOperations(
              schedule
            );
            const fullyStaffed = await this.calculateFullyStaff(schedule);
            let scheduleLockedBy = null;
            if (schedule.schedule_is_locked) {
              scheduleLockedBy = await this.userRepository.findOne({
                where: {
                  id: schedule.schedule_locked_by,
                },
              });
            }
            return {
              schedule,
              totalOperations,
              fullyStaffed,
              tenant_id: schedule.tenant_id,
              locked_by: scheduleLockedBy,
            };
          })
        );
        if (query.sortBy == 'totalOperations') {
          if (sortOrder === 'DESC') {
            results.sort((a, b) => b.totalOperations - a.totalOperations);
          }
          if (sortOrder === 'ASC') {
            results.sort((a, b) => a.totalOperations - b.totalOperations);
          }
        }
        if (query.sortBy == 'fullyStaffed') {
          if (sortOrder === 'DESC') {
            results.sort((a, b) => b.fullyStaffed - a.fullyStaffed);
          }
          if (sortOrder === 'ASC') {
            results.sort((a, b) => a.fullyStaffed - b.fullyStaffed);
          }
        }
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const totalRecords = results.length;
        return {
          count: totalRecords,
          data: results.slice(startIndex, endIndex),
        };
      } else {
        const totalRecords = await queryBuilder.getCount();
        const startIndex = (page - 1) * limit;
        queryBuilder = queryBuilder.limit(limit).offset(startIndex);

        // Fetch schedules
        const schedules = await queryBuilder.getRawMany();
        // Perform additional calculations on retrieved schedules
        const results = await Promise.all(
          schedules.map(async (schedule) => {
            const totalOperations = await this.calculateTotalOperations(
              schedule
            );
            const fullyStaffed = await this.calculateFullyStaff(schedule);
            let scheduleLockedBy = null;
            if (schedule.schedule_is_locked) {
              scheduleLockedBy = await this.userRepository.findOne({
                where: {
                  id: schedule.schedule_locked_by,
                },
              });
            }
            return {
              schedule,
              totalOperations,
              fullyStaffed,
              tenant_id: schedule.tenant_id,
              locked_by: scheduleLockedBy,
            };
          })
        );
        return {
          count: totalRecords,
          data: results,
        };
      }
    } catch (error) {
      return error.message, ErrorConstants.Error, error.status;
    }
  }
  async editSchedule(schedule_id: any, user_id: any) {
    try {
      const data = await this.scheduleRepository
        .createQueryBuilder('sch')
        .where('id = :SID AND is_archived = false', { SID: schedule_id })
        .getRawMany();

      if (data.length > 0 && data[0].sch_is_locked === false) {
        // Update the sch_is_locked value to true
        await this.scheduleRepository
          .createQueryBuilder()
          .update()
          .set({
            is_locked: true,
            locked_by: user_id,
            created_by: user_id,
          })
          .where('id = :SID', { SID: schedule_id })
          .execute();

        return {
          msg: 'this schedule is edited by first time',
          value: 1,
        };
      } else {
        if (data.length > 0 && data[0].sch_is_paused === false) {
          return {
            msg: 'already in edit mode',
            value: 2,
          };
        } else {
          const data = await this.scheduleRepository
            .createQueryBuilder()
            .where('id = :SID', { SID: schedule_id })
            .select('locked_by')
            .getRawMany();
          if (data[0].locked_by == user_id) {
            return {
              msg: 'legal user',
              value: 3,
            };
          } else {
            return {
              msg: 'this user not allowed',
              value: 4,
            };
          }
        }
      }
    } catch (error) {
      return error.message, ErrorConstants.Error, error.status;
    }
  }
  async archiveSchedule(user: any, id: any) {
    try {
      const schedule: any = await this.scheduleRepository.findOne({
        where: { id, is_archived: false },
        relations: ['created_by', 'collection_operation_id'],
      });
      const scheduleOperationStatuses =
        await this.scheduleOperationStatusRepository.query(
          `
        SELECT sos.*
        FROM schedule_operation_status sos
        JOIN schedule s ON sos.schedule_id = s.id
        WHERE s.id = $1
        `,
          [id]
        );
      // Process the queryResult as needed
      if (!schedule) {
        throw new Error('Schedule not found.');
      }
      if (!scheduleOperationStatuses) {
        throw new Error('Schedule Operation Status not found.');
      }

      schedule.is_archived = true;
      const archivedSchedule = await this.scheduleRepository.save(schedule);
      await this.archiveScheduleOperation(scheduleOperationStatuses, user);
      return resSuccess(
        'Schedule Archived.',
        SuccessConstants.SUCCESS,
        HttpStatus.GONE,
        null
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async archiveScheduleOperation(scheduleOperationStatus: any, user: any) {
    if (!scheduleOperationStatus) {
      throw new Error('Invalid schedule operation data');
    }
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const promises: any[] = [];
      for (const status of scheduleOperationStatus) {
        status.is_archived = true;
        await this.scheduleOperationStatusRepository.save(status);
      }
      const savedEntries: any = await Promise.all(promises);
      await queryRunner.commitTransaction();
      return savedEntries;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Failed to archive:', error);
      return resError(
        error?.message || `Failed to archive: ${error}`,
        'failed',
        HttpStatus.PRECONDITION_FAILED
      );
    } finally {
      await queryRunner.release();
    }
  }
  async getUserCollectionOperations(user: any, id = null, isFilter = null) {
    try {
      const recruiterId = id && id !== undefined ? id : user?.id;
      const userData: any = await this.userRepository.findOne({
        where: {
          id: recruiterId,
          tenant_id: user?.tenant_id,
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
      const where: any = { is_archived: false };
      if (!isFilter) {
        where['is_active'] = true;
      }
      let uniqueBusiness: any = [];
      if(userData?.all_hierarchy_access || userData?.role?.is_auto_created) {
        // Tenant Admin
        uniqueBusiness = await this.businessUnitsRepository.find({
          where: {
            ...where,
            tenant: { id: userData?.tenant?.id },
          },
          relations: ['tenant'],
        });
      } else {
        const businessUnits: any = [];
        const userBusinessUnitIds = userData?.business_units?.map(
          (bu: any) => bu.business_unit_id.id
        );
        if (userBusinessUnitIds.length) {
          let parentBusinessUnits = userBusinessUnitIds;
          while (parentBusinessUnits.length) {
            const businessUnitData = await this.businessUnitsRepository.find({
              where: {
                ...where,
                tenant: { id: userData?.tenant?.id },
                parent_level: In(parentBusinessUnits),
              },
              relations: ['parent_level', 'tenant', 'organizational_level_id'],
            });
            // Check if any child is a collection operation
            const hasCollectionChild = businessUnitData.some(
              (businessUnit) =>
                businessUnit.organizational_level_id.is_collection_operation
            );
            if (hasCollectionChild) {
              // If no collection child, add the current business unit to the result
              businessUnits.push(...businessUnitData);
            } else {
              // Update parentBusinessUnits for the next iteration
              parentBusinessUnits = businessUnitData.map(
                (businessUnit) => businessUnit.id
              );
            }
            // Check and add user's business unit to the result
            userData?.business_units.forEach((unit: any) => {
              const exists = businessUnits.some(
                (val) =>
                  val.parent_level &&
                  unit.business_unit_id &&
                  val.parent_level.id === unit.business_unit_id.id
              );
              if (!exists) {
                businessUnits.push(unit.business_unit_id);
              }
            });
            uniqueBusiness = businessUnits.filter(
              (obj: any, index: any, self: any) =>
                self.findIndex((o) => o.id === obj.id) === index
            );
  
            break;
          }
        }
      }
      return resSuccess(
        SuccessConstants.SUCCESS,
        'Collection Operations fetched',
        HttpStatus.OK,
        uniqueBusiness
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async stopPauseSchedule(action: any, id: any, operationId: any, user: User) {
    try {
      const schedule: any = await this.scheduleRepository.findOne({
        where: { id, is_archived: false },
        relations: ['collection_operation_id'],
      });

      if (!schedule) {
        throw new Error('Schedule not found.');
      }

      let scheduleOperations = await this.scheduleOperationRepository.find({
        where: {
          schedule_id: schedule.schedule_id,
        },
      });

      if (action === 'stop') {
        schedule.is_locked = false;
        schedule.is_paused = false;
        schedule.created_by = user.id;
        schedule.locked_by = null;
        schedule.created_at = new Date();

        // set all is_paused_at = false
        scheduleOperations = scheduleOperations.map((scheduleOperation) => {
          return { ...scheduleOperation, is_paused_at: true };
        });
      } else if (action === 'pause') {
        schedule.is_paused = true;
        schedule.created_by = user.id;
        schedule.locked_by = user.id;
        schedule.created_at = new Date();
        // first check if any other operations of this schedule have is_paused_at = true and set it to false
        // then set the current operation id to is_paused_at = true
        scheduleOperations = scheduleOperations.map((scheduleOperation) => {
          if (scheduleOperation.operation_id == operationId) {
            return { ...scheduleOperation, is_paused_at: true };
          } else {
            return { ...scheduleOperation, is_paused_at: false };
          }
        });
      }
      await this.scheduleOperationRepository.save(scheduleOperations);
      const updatedSchedule = await this.scheduleRepository.save(schedule);

      return resSuccess(
        'Schedule Stopped.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        updatedSchedule
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getRoleTimes(rtdDto: GetRtdDto, user: any) {
    try {
      // Get all roles for the given shift
      const staffSetupIdsSubquery: any = this.shiftsProjectionsStaffRepository
        .createQueryBuilder('sps')
        .select('sps.staff_setup_id')
        .where('sps.shift_id = :shiftId', { shiftId: rtdDto.shift_id })
        .groupBy(
          ['sps.shift_id', 'sps.staff_setup_id', 'sps.procedure_type_id'].join(
            ', '
          )
        );

      let staffSetupIds = await staffSetupIdsSubquery.getMany();
      staffSetupIds = staffSetupIds?.map((staffSetupId) => {
        return staffSetupId.staff_setup_id;
      });
      const query = this.staffConfigRepository
        .createQueryBuilder('staffConfig')
        .select('staffConfig.contact_role_id as role_id')
        .where(
          'staffConfig.staff_setup_id IN (:...staffSetupIds) and staffConfig.tenant_id = :TID',
          {
            staffSetupIds: staffSetupIds,
            TID: user?.tenant_id,
          }
        );

      const roles = await query.getRawMany();
      // Get roles from staff assignments and draft entities
      const uniqueRoleIdsA = await this.staffAssignmentsRepository
        .createQueryBuilder('sa')
        .select('DISTINCT(sa.role_id)')
        .where('sa.shift_id = :shiftId and sa.tenant_id = :TID', {
          shiftId: rtdDto.shift_id,
          TID: user?.tenant_id,
        })
        .getRawMany();

      const uniqueRoleIdsB = await this.staffAssignmentsDraftsRepository
        .createQueryBuilder('sad')
        .select('DISTINCT(sad.role_id)')
        .where('sad.shift_id = :shiftId and sad.tenant_id = :TID', {
          shiftId: rtdDto.shift_id,
          TID: user?.tenant_id,
        })
        .getRawMany();

      const combinedArray = [roles, uniqueRoleIdsA, uniqueRoleIdsB]
        .filter((arr) => arr !== null)
        .flat();

      // Combine and deduplicate role_ids
      const uniqueRoleIds = [
        ...new Set(combinedArray?.map((row) => row.role_id)),
      ];
      const allStaffConfigs = [];
      let staffConfigs;
      if (uniqueRoleIds.length > 0) {
        staffConfigs = await this.staffConfigRepository
          .createQueryBuilder('sc')
          .innerJoinAndSelect(
            'contacts_roles',
            'cr',
            'sc.contact_role_id = cr.id'
          )
          .select([
            'sc.*',
            'cr.name as role_name',
            'cr.short_name as role_short_name',
          ])
          .where(
            'sc.contact_role_id IN (:...roleIds) and sc.tenant_id = :TID',
            {
              roleIds: uniqueRoleIds,
              TID: user?.tenant_id,
            }
          )
          .getRawMany();
      }

      await Promise.all(
        uniqueRoleIds?.map(async (role_id) => {
          const staffConfig = staffConfigs?.find(
            (config) => config.contact_role_id === role_id
          );
          if (staffConfig) {
            allStaffConfigs.push(staffConfig);
          } else {
            // Create default config
            const defaultStaffConfig = {};
            defaultStaffConfig['breakdown_time'] = 0;
            defaultStaffConfig['contact_role_id'] = role_id;
            defaultStaffConfig['lead_time'] = 0;
            defaultStaffConfig['qty'] = 0;
            defaultStaffConfig['setup_time'] = 0;
            defaultStaffConfig['wrapup_time'] = 0;
            const role = await this.contactsRolesRepository.findOne({
              where: {
                id: role_id,
                tenant_id: user?.tenant_id,
              },
            });
            defaultStaffConfig['role_name'] = role?.name;
            defaultStaffConfig['role_short_name'] = role?.short_name;
            allStaffConfigs.push(defaultStaffConfig);
          }
        })
      );

      if (!allStaffConfigs || allStaffConfigs.length == 0) {
        return {}; // Return
      }

      const schedule: any = await this.scheduleRepository.findOne({
        where: {
          id: Number(rtdDto.schedule_id),
          tenant_id: user?.tenant_id,
        },
        relations: ['collection_operation_id'],
      });

      if (!schedule) {
        return {}; // Return
      }

      const shift = await this.shiftsRepository.findOne({
        where: {
          id: rtdDto.shift_id as any,
          tenant_id: user?.tenant_id,
        },
      });

      let locationId = null;

      if (rtdDto.operation_type === PolymorphicType.OC_OPERATIONS_DRIVES) {
        const drive = await this.driveRepository.findOne({
          where: {
            id: rtdDto.operation_id as any,
            tenant_id: user?.tenant_id,
          },
        });
        locationId = drive?.location_id;
      } else if (
        rtdDto.operation_type ===
        PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
      ) {
        const nce = await this.nonCollectionEventsRepository.findOne({
          where: {
            id: rtdDto.operation_id as any,
            tenant_id: user?.tenant_id,
          },
        });
        locationId = nce?.location_id;
      }

      // Right now we don't have staff_assignments Repo, so we assume that we have one and go ahead
      const data = await Promise.all(
        allStaffConfigs.map(async (staffConfig) => {
          let staffAssignments = [];
          // Get staff assignments for specific role and shift
          let rolesStaffAssignments: any = await this.staffAssignmentsRepository
            .createQueryBuilder('staffAssignments')
            .where(
              'staffAssignments.role_id = :roleId and staffAssignments.tenant_id =:TID',
              {
                roleId: staffConfig.contact_role_id,
                TID: user?.tenant_id,
              }
            )
            .andWhere('staffAssignments.shift_id = :shiftId', {
              shiftId: rtdDto.shift_id,
            })
            .getMany();
          if (schedule.schedule_status === ScheduleStatusEnum.Published) {
            if (rolesStaffAssignments.length === 0) {
              rolesStaffAssignments =
                await this.staffAssignmentsDraftsRepository
                  .createQueryBuilder('staffAssignments')
                  .where(
                    'staffAssignments.role_id = :roleId and staffAssignments.tenant_id = :TID',
                    {
                      roleId: staffConfig.contact_role_id,
                      TID: user?.tenant_id,
                    }
                  )
                  .andWhere('staffAssignments.shift_id = :shiftId', {
                    shiftId: rtdDto.shift_id,
                  })
                  .getMany();
            }
            await Promise.all(
              rolesStaffAssignments.map(async (rolesStaffAssignment) => {
                // Get staffAssignments from staff_assignment_draft table
                const draftQuery = this.staffAssignmentsDraftsRepository
                  .createQueryBuilder('sad')
                  .where('sad.is_notify = false and sad.tenant_id = :TID', {
                    TID: user?.tenant_id,
                  });
                if (rolesStaffAssignment.reason) {
                  // Means its draft table
                  if (rolesStaffAssignment.staff_assignment_id) {
                    draftQuery.andWhere(
                      'sad.staff_assignment_id = :staff_assignment_id',
                      {
                        staff_assignment_id:
                          rolesStaffAssignment.staff_assignment_id,
                      }
                    );
                  }
                } else {
                  draftQuery.andWhere(
                    'sad.staff_assignment_id = :staff_assignment_id',
                    {
                      staff_assignment_id: rolesStaffAssignment.id,
                    }
                  );
                }
                const staffAssignmentsDraft = await draftQuery
                  .select(['sad.*'])
                  .orderBy('sad.id', 'DESC')
                  .take(1)
                  .getOne();

                if (staffAssignmentsDraft) {
                  staffAssignments.push(staffAssignmentsDraft);
                } else {
                  staffAssignments.push(rolesStaffAssignment);
                }
              })
            );
          } else {
            staffAssignments = rolesStaffAssignments;
          }

          // Compare each time value from the staffAssignment for the specific role and check if all are same or do we need default values
          let isLeadTimeSame = false;
          let isSetupTimeSame = false;
          let isBreakdownTimeSame = false;
          let isWrapupTimeSame = false;
          let isTravelTimeSame = false;
          let isTravelToTimeSame = false;
          let isTravelFromTimeSame = false;

          if (staffAssignments?.length > 0) {
            const firstLeadTime = staffAssignments[0].lead_time;
            const firstSetupTime = staffAssignments[0].setup_time;
            const firstBreakdownTime = staffAssignments[0].breakdown_time;
            const firstWrapupTime = staffAssignments[0].wrapup_time;
            const firstTravelTime = staffAssignments[0].travel_to_time;
            const firstTravelToTime = staffAssignments[0].travel_to_time;
            const firstTravelFromTime = staffAssignments[0].travel_from_time;

            isLeadTimeSame = staffAssignments.every(
              (staffAssignment) => staffAssignment.lead_time === firstLeadTime
            );
            isSetupTimeSame = staffAssignments.every(
              (staffAssignment) => staffAssignment.setup_time === firstSetupTime
            );
            isBreakdownTimeSame = staffAssignments.every(
              (staffAssignment) =>
                staffAssignment.breakdown_time === firstBreakdownTime
            );
            isWrapupTimeSame = staffAssignments.every(
              (staffAssignment) =>
                staffAssignment.wrapup_time === firstWrapupTime
            );
            isTravelTimeSame = staffAssignments.every(
              (staffAssignment) =>
                staffAssignment.travel_to_time === firstTravelTime
            );
            isTravelToTimeSame = staffAssignments.every(
              (staffAssignment) =>
                staffAssignment.travel_to_time === firstTravelToTime
            );
            isTravelFromTimeSame = staffAssignments.every(
              (staffAssignment) =>
                staffAssignment.travel_from_time === firstTravelFromTime
            );

            const result = {};

            result['lead_time'] = isLeadTimeSame
              ? staffAssignments[0].lead_time ?? 0
              : staffConfig.lead_time ?? 0;
            result['setup_time'] = isSetupTimeSame
              ? staffAssignments[0].setup_time ?? 0
              : staffConfig.setup_time ?? 0;
            result['breakdown_time'] = isBreakdownTimeSame
              ? staffAssignments[0].breakdown_time ?? 0
              : staffConfig.breakdown_time ?? 0;
            result['wrapup_time'] = isWrapupTimeSame
              ? staffAssignments[0].wrapup_time ?? 0
              : staffConfig.wrapup_time ?? 0;
            result['role'] = staffConfig.role_short_name
              ? staffConfig.role_short_name
              : staffConfig.role_name ?? 'NA';
            result['minutes'] = isTravelTimeSame
              ? staffAssignments[0].travel_to_time ?? 0
              : 0;
            result['travel_to_time'] = isTravelToTimeSame
              ? staffAssignments[0].travel_to_time ?? 0
              : 0;
            result['travel_from_time'] = isTravelFromTimeSame
              ? staffAssignments[0].travel_from_time ?? 0
              : 0;
            result['tenant_id'] = staffConfig.tenant_id;
            if ((!isTravelTimeSame || !isTravelFromTimeSame || !isTravelToTimeSame) && locationId) {
              const direction = await this.directionRepository
                .createQueryBuilder('direction')
                .where(
                  'direction.location_id = :location_id and direction.tenant_id = :TID',
                  {
                    location_id: locationId,
                    TID: user?.tenant_id,
                  }
                )
                .andWhere(
                  'direction.collection_operation_id = :collection_operation_id',
                  {
                    collection_operation_id:
                      schedule.collection_operation_id?.id,
                  }
                )
                .getOne();
              !isTravelTimeSame && (result['minutes'] = direction ? direction?.minutes ?? 0 : 0);
              !isTravelToTimeSame && (result['travel_to_time'] = direction ? direction?.minutes ?? 0 : 0);
              !isTravelFromTimeSame && (result['travel_from_time'] = direction ? direction?.minutes ?? 0 : 0);
            }

            return result;
          }
        })
      );
      // it will return undefined for roles which don't have staff assigned, we don't want those
      const filteredData = data.filter((item) => item !== undefined);
      return resSuccess(
        SuccessConstants.SUCCESS,
        'Roles Times fetched',
        HttpStatus.OK,
        {
          ...shift,
          rtd: filteredData,
        }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async publishSchedule(id: any, user: any, publishDto: PublishDto) {
    try {
      let schedule: any = await this.scheduleRepository.findOne({
        where: { id, is_archived: false },
        relations: ['collection_operation_id'],
      });

      if (!schedule) {
        throw new Error('Schedule not found.');
      }

      const isDraft: boolean =
        schedule.schedule_status === ScheduleStatusEnum.Draft;

      if (!isDraft) {
        throw new Error('Schedule status is not draft.');
      }

      // Check if it not flagged
      if (schedule.is_flagged) {
        // Means that draft schedule needs to be published but it is flagged. If already published but still flagged, we will just notify the staff
        throw new Error('Schedule is flagged.');
      }

      const notifyStaffDto: NotifyStaffDto = new NotifyStaffDto();

      schedule.is_locked = false;
      schedule.is_paused = false;
      schedule.schedule_status = ScheduleStatusEnum.Published;
      schedule = await this.scheduleRepository.save(schedule);

      const scheduleOperations = await this.scheduleOperationRepository.find({
        where: {
          schedule_id: schedule.id,
        },
      });

      const operationsMap = scheduleOperations.map((so) => {
        return {
          operation_id: so.operation_id,
          operation_type: so.operation_type,
        };
      });

      notifyStaffDto.content =
        'A new schedule has been published beginning {Schedule Start Date}. Please click here to review the schedule';
      notifyStaffDto.subject = 'New Schedule Published';
      notifyStaffDto.schedule_id = schedule.id;
      notifyStaffDto.operations = operationsMap;
      await this.notifyStaff(notifyStaffDto, true);

      return resSuccess(
        'Schedule Published.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        schedule
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getDataForShiftInformationAboutTab(req, user) {
    let query;
    if (req.operation_type === PolymorphicType.OC_OPERATIONS_DRIVES) {
      query = this.shiftsRepository
        .createQueryBuilder('sh')
        .innerJoinAndSelect(
          'booking_rules',
          'br',
          'br.tenant_id = sh.tenant_id'
        )
        .innerJoinAndSelect(
          'shifts_projections_staff',
          'sps',
          'sps.shift_id = sh.id'
        )
        .innerJoinAndSelect('drives', 'd', `d.id = ${req.operation_id}`)
        .innerJoinAndSelect('crm_locations', 'cl', 'cl.id = d.location_id')
        .innerJoinAndSelect(
          'address',
          'ad',
          `ad.addressable_id = cl.id AND ad.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'`
        )
        .innerJoinAndSelect('user', 'u', 'd.recruiter_id = u.id')
        .innerJoinAndSelect('accounts', 'acc', 'd.account_id = acc.id')
        .innerJoinAndSelect(
          'business_units',
          'bu',
          'acc.collection_operation = bu.id'
        )
        .leftJoinAndSelect(
          'linked_drives',
          'ld',
          'ld.current_drive_id = d.id AND d.is_linked = true'
        )
        .select([
          `d.id as operation_id`,
          `acc.name AS account_name`,
          `acc.id AS account_id`,
          `cl.name AS location_name`,
          `(ad.city || ', ' || ad.state) AS location_address`,
          `sh.start_time AS shift_start_time`,
          `sh.end_time AS shift_end_time`,
          `CASE 
  		    WHEN br.oef_block_on_product = true THEN sh.oef_products
		      ELSE sh.oef_procedures
  	     END AS oef`,
          `sps.procedure_type_qty AS sum_of_procedure_shifts`,
          `CASE 
          WHEN (d.is_linked = true)
          THEN (SELECT accs.name FROM accounts as accs inner join drives as dr on dr.account_id = accs.id where dr.id = ld.prospective_drive_id)
          ELSE null
         END AS prospective_drive_name`,
          `CASE 
         WHEN (d.is_linked = true)
         THEN (SELECT id FROM drives as dr where dr.id = ld.prospective_drive_id)
         ELSE null
         END AS prospective_drive_id`,
          `(u.first_name || ' ' || u.last_name) as user_name`,
          `bu.name AS collection_operation_status`,
          `cl.id AS location_id`,
          `sh.tenant_id as tenant_id`,
        ])
        .where(
          `d.id = ${req.operation_id} AND sh.id = ${req.shift_id} AND sh.tenant_id = ${user.tenant_id}`
        )
        .groupBy(
          'acc.id, cl.id, d.id, acc.name, cl.name, ad.city, ad.state, sh.start_time, sh.end_time, br.oef_block_on_product, sh.oef_products, sh.oef_procedures, sps.procedure_type_qty, d.is_linked, ld.prospective_drive_id, u.first_name, u.last_name, bu.name, sh.tenant_id'
        )
        .limit(1);
    } else if (req.operation_type === PolymorphicType.OC_OPERATIONS_SESSIONS) {
      query = this.shiftsRepository
        .createQueryBuilder('sh')
        .innerJoinAndSelect(
          'booking_rules',
          'br',
          'br.tenant_id = sh.tenant_id'
        )
        .innerJoinAndSelect(
          'shifts_projections_staff',
          'sps',
          'sps.shift_id = sh.id'
        )
        .innerJoinAndSelect('sessions', 'se', `se.id = ${req.operation_id}`)
        .innerJoinAndSelect('facility', 'f', 'se.donor_center_id = f.id')
        .innerJoinAndSelect(
          'address',
          'ad',
          `ad.addressable_id = f.id AND ad.addressable_type = '${PolymorphicType.SC_ORG_ADMIN_FACILITY}'`
        )
        .innerJoinAndSelect('crm_locations', 'cl', 'cl.id = ad.addressable_id')
        .innerJoinAndSelect(
          'business_units',
          'bu',
          'se.collection_operation_id = bu.id'
        )
        .select([
          `se.id as operation_id`,
          `sh.tenant_id as tenant_id`,
          `f.name AS account_name`,
          `f.id AS account_id`,
          `cl.name AS location_name`,
          `(ad.city || ', ' || ad.state) AS location_address`,
          `sh.start_time AS shift_start_time`,
          `sh.end_time AS shift_end_time`,
          `CASE 
  		    WHEN br.oef_block_on_product = true THEN sh.oef_products
		      ELSE sh.oef_procedures
  	     END AS oef`,
          `sps.procedure_type_qty AS sum_of_procedure_shifts`,
          `bu.name AS collection_operation_status`,
          `cl.id AS location_id`,
        ])
        .where(
          `se.id = ${req.operation_id} AND sh.id = ${req.shift_id} AND sh.tenant_id = ${user.tenant_id}`
        )
        .groupBy(
          'sh.tenant_id,f.id, cl.id, se.id, f.name, cl.name, ad.city, ad.state, sh.start_time, sh.end_time, br.oef_block_on_product, sh.oef_products, sh.oef_procedures, sps.procedure_type_qty, bu.name'
        )
        .limit(1);
    } else if (req.operation_type === 'non-collection-events') {
      query = this.shiftsRepository
        .createQueryBuilder('sh')
        .innerJoinAndSelect(
          'booking_rules',
          'br',
          'br.tenant_id = sh.tenant_id'
        )
        .innerJoinAndSelect(
          'shifts_projections_staff',
          'sps',
          'sps.shift_id = sh.id'
        )
        .innerJoinAndSelect(
          'oc_non_collection_events',
          'once',
          `once.id = ${req.operation_id}`
        )
        .innerJoinAndSelect('crm_locations', 'cl', 'cl.id = once.location_id')
        .innerJoinAndSelect(
          'address',
          'ad',
          `ad.addressable_id = cl.id AND ad.addressable_type= '${PolymorphicType.CRM_LOCATIONS}'`
        )
        .innerJoinAndSelect('user', 'u', 'once.owner_id = u.id')
        .innerJoinAndSelect(
          'ncp_collection_operations',
          'nco',
          'nco.ncp_id = once.non_collection_profile_id'
        )
        .innerJoinAndSelect(
          'business_units',
          'bu',
          'nco.business_unit_id = bu.id'
        )
        .innerJoinAndSelect(
          'organizational_levels',
          'ol',
          'bu.organizational_level_id = ol.id AND ol.is_collection_operation = true'
        )
        .select([
          `once.id as operation_id`,
          `sh.tenant_id as tenant_id`,
          `once.event_name AS account_name`,
          `once.non_collection_profile_id AS account_id`,
          `cl.name AS location_name`,
          `(ad.city || ', ' || ad.state) AS location_address`,
          `TO_CHAR(sh.start_time, 'HH12:MI AM') AS shift_start_time`,
          `TO_CHAR(sh.end_time, 'HH12:MI AM') AS shift_end_time`,
          `CASE 
  		    WHEN br.oef_block_on_product = true THEN sh.oef_products
		      ELSE sh.oef_procedures
  	     END AS oef`,
          `sps.procedure_type_qty AS sum_of_procedure_shifts`,
          `(u.first_name || ' ' || u.last_name) as user_name`,
          `bu.name AS collection_operation_status`,
          `cl.id AS location_id`,
        ])
        .where(
          `once.id = ${req.operation_id} AND sh.id = ${req.shift_id} AND sh.tenant_id = ${user.tenant_id}`
        )
        .groupBy(
          'sh.tenant_id,once.non_collection_profile_id, cl.id, once.id, once.event_name, cl.name, ad.city, ad.state, sh.start_time, sh.end_time, br.oef_block_on_product, sh.oef_products, sh.oef_procedures, sps.procedure_type_qty, u.first_name, u.last_name, bu.name'
        )
        .limit(1);
    }
    let records;

    if (query) {
      records = await query.getRawMany();
    } else {
      records = [];
    }
    return {
      status: 'success',
      response: '',
      code: HttpStatus.OK,
      data: records,
    };
  }

  async getDataForShiftInformtionModifyRtd(
    operation_id,
    operation_type,
    shift_id,
    schduled_status,
    tenant_id
  ) {
    let individualValues;
    let byRoleValues;

    const isPublished = schduled_status === 'Draft' ? false : true;
    const removedDuplicates = [];
    try {
      const individualValuesQuery = this.queryForShiftInformtionModifyRtdGetData(
        operation_id,
        operation_type,
        shift_id,
        tenant_id,
        false
      );

      individualValues = await individualValuesQuery.getRawMany();

      if (isPublished) {
        const individualValuesDraftQuery =
          this.queryForShiftInformtionModifyRtdGetData(
            operation_id,
            operation_type,
            shift_id,
            tenant_id,
            isPublished
          );

        const individualDraftValues =
          await individualValuesDraftQuery.getRawMany();
        individualDraftValues.forEach((draft) => {
          const index = individualValues.findIndex(
            (val) => val.staff_assignment_id === draft.staff_assignment_id_fk
          );
          if (index > -1) {
            individualValues.splice(index, 1);
          }
        });
        individualValues = [...individualDraftValues, ...individualValues];
      }

      if (individualValues.length > 0) {
        const roleIds = individualValues.map((iv) => iv.role_id);
        const uniqueRoleSet = new Set(roleIds);
        const uniqueRoleIds = [...uniqueRoleSet];

        const byRoleValuesQuery =
          this.queryForShiftInformationModifyRtdByRolesGetData(
            uniqueRoleIds.join(','),
            operation_id,
            operation_type,
            shift_id,
            tenant_id,
            false
          );
        byRoleValues = await byRoleValuesQuery.getRawMany();

        if (isPublished) {
          const byRoleValuesDraftQuery =
            this.queryForShiftInformationModifyRtdByRolesGetData(
              uniqueRoleIds.join(','),
              operation_id,
              operation_type,
              shift_id,
              tenant_id,
              isPublished
            );

          const byRoleDraftValues = await byRoleValuesDraftQuery.getRawMany();

          byRoleValues = byRoleValues.concat(byRoleDraftValues);
        }

        for (let i = 0; i < byRoleValues.length; i++) {
          const individualValuesByRole = individualValues.filter(
            (iv) => iv.role_id === byRoleValues[i].role_id
          );

          const duplicates = removedDuplicates.filter(
            (rd) => rd.role_id === byRoleValues[i].role_id
          );

          if (removedDuplicates.length == 0 || duplicates.length == 0) {
            byRoleValues[i].shift_start_time = individualValuesByRole.every(
              (iv) =>
                iv.shift_start_time === individualValuesByRole[0].shift_start_time
            )
              ? individualValuesByRole[0].shift_start_time
              : byRoleValues[i].shift_start_time;
            byRoleValues[i].shift_end_time = individualValuesByRole.every(
              (iv) =>
                iv.shift_end_time === individualValuesByRole[0].shift_end_time
            )
              ? individualValuesByRole[0].shift_end_time
              : byRoleValues[i].shift_end_time;
            byRoleValues[i].lead_time = individualValuesByRole.every(
              (iv) => iv.lead_time === individualValuesByRole[0].lead_time
            )
              ? individualValuesByRole[0].lead_time
              : byRoleValues[i].lead_time;
            byRoleValues[i].travel_to_time = individualValuesByRole.every(
              (iv) =>
                iv.travel_to_time === individualValuesByRole[0].travel_to_time
            )
              ? individualValuesByRole[0].travel_to_time
              : byRoleValues[i].travel_to_time;
            byRoleValues[i].setup_time = individualValuesByRole.every(
              (iv) => iv.setup_time === individualValuesByRole[0].setup_time
            )
              ? individualValuesByRole[0].setup_time
              : byRoleValues[i].setup_time;
            byRoleValues[i].breakdown_time = individualValuesByRole.every(
              (iv) =>
                iv.breakdown_time === individualValuesByRole[0].breakdown_time
            )
              ? individualValuesByRole[0].breakdown_time
              : byRoleValues[i].breakdown_time;
            byRoleValues[i].travel_from_time = individualValuesByRole.every(
              (iv) =>
                iv.travel_from_time === individualValuesByRole[0].travel_from_time
            )
              ? individualValuesByRole[0].travel_from_time
              : byRoleValues[i].travel_from_time;
            byRoleValues[i].wrapup_time = individualValuesByRole.every(
              (iv) => iv.wrapup_time === individualValuesByRole[0].wrapup_time
            )
              ? individualValuesByRole[0].wrapup_time
              : byRoleValues[i].wrapup_time;

            removedDuplicates.push(byRoleValues[i]);
          }
        }
      }

      const records = {
        tenant_id: tenant_id,
        individual_values: individualValues,
        by_role_values: removedDuplicates,
      };

      return {
        status: 'success',
        response: '',
        code: HttpStatus.OK,
        data: records,
      };

    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  queryForShiftInformtionModifyRtdGetData(
    operationId,
    operationType,
    shiftId,
    tenant_id,
    isPublished = false
  ) {
    const whereCondition = isPublished
      ? `sa.operation_id = ${operationId} and sa.shift_id = ${shiftId} and sa.operation_type = '${operationType}' and sa.tenant_id = ${tenant_id} and sa.is_notify = false and sa.reason <> 'U'`
      : `sa.operation_id = ${operationId} and sa.shift_id = ${shiftId} and sa.operation_type = '${operationType}' and sa.tenant_id = ${tenant_id}`;

    const baseTable = isPublished
      ? this.staffAssignmentsDraftsRepository
      : this.staffAssignmentsRepository;
    const query = baseTable
      .createQueryBuilder('sa')
      .innerJoinAndSelect('staff', 's', 'sa.staff_id = s.id')
      .innerJoinAndSelect('contacts_roles', 'cr', 'sa.role_id = cr.id')
      .innerJoinAndSelect('shifts', 'sh', 'sa.shift_id = sh.id')
      .select([
        `${
          !isPublished ? 'sa.id' : 'null'
        } as staff_assignment_id`,
        `${
          isPublished ? 'sa.id' : 'null'
        } as staff_assignment_draft_id`,
        `${
          isPublished ? 'sa.staff_assignment_id' : 'null'
        } as staff_assignment_id_fk`,
        `sh.id as shift_id`,
        `(s.first_name || ' ' || s.last_name) as staff_name`,
        `cr.id as role_id`,
        `cr.name as role_name`,
        `cr.short_name as role_short_name`,
        `CASE 
        WHEN sa.shift_start_time is null
        THEN TO_CHAR(sh.start_time, 'HH12:MI AM')
        ELSE TO_CHAR(sa.shift_start_time, 'HH12:MI AM')
      END AS shift_start_time`,
        `CASE 
        WHEN sa.shift_end_time is null
        THEN TO_CHAR(sh.end_time, 'HH12:MI AM')
        ELSE TO_CHAR(sa.shift_end_time, 'HH12:MI AM')
      END AS shift_end_time`,
        `sa.lead_time as lead_time`,
        `sa.travel_to_time as travel_to_time`,
        `sa.setup_time as setup_time`,
        `sa.breakdown_time as breakdown_time`,
        `sa.travel_from_time as travel_from_time`,
        `sa.wrapup_time as wrapup_time`,
        `TO_CHAR(sa.clock_in_time, 'HH12:MI AM') AS clock_in_time`,
        `TO_CHAR(sa.clock_out_time, 'HH12:MI AM') AS clock_out_time`,
        `ROUND(sa.total_hours, 2) as total_hours`,
      ])
      .where(whereCondition);

    return query;
  }

  queryForShiftInformationModifyRtdByRolesGetData(
    roleIds,
    operationId,
    operationType,
    shiftId,
    tenant_id,
    isPublished
  ) {
    const baseTable = isPublished
      ? this.staffAssignmentsDraftsRepository
      : this.staffAssignmentsRepository;

    const query = baseTable
      .createQueryBuilder('sa')
      .innerJoinAndSelect('staff', 's', 'sa.staff_id = s.id')
      .innerJoinAndSelect('contacts_roles', 'cr', 'sa.role_id = cr.id')
      .innerJoinAndSelect('shifts', 'sh', 'sa.shift_id = sh.id')
      .leftJoinAndSelect('staff_config', 'sc', 'sc.contact_role_id = cr.id')
      .leftJoinAndSelect('staff_setup', 'ss', `sc.staff_setup_id = ss.id`)
      .leftJoinAndSelect(
        'shifts_projections_staff',
        'sps',
        'sps.shift_id = sh.id AND sps.staff_setup_id = ss.id'
      )
      .leftJoinAndSelect(
        'location_directions',
        'ld',
        'ld.collection_operation_id = s.collection_operation_id'
      )
      .select([
        `sc.id as config_id`,
        `cr.id as role_id`,
        `cr.name as role_name`,
        `TO_CHAR(sh.start_time, 'HH12:MI AM') AS shift_start_time`,
        `TO_CHAR(sh.end_time, 'HH12:MI AM') AS shift_end_time`,
        `sc.lead_time as lead_time`,
        `ld.minutes as travel_to_time`,
        `sc.setup_time as setup_time`,
        `sc.breakdown_time as breakdown_time`,
        `ld.minutes as travel_from_time`,
        `sc.wrapup_time as wrapup_time`,
      ])
      .where(
        `sa.operation_id = ${operationId} AND sa.operation_type = '${operationType}' AND sh.id = ${shiftId} AND sh.is_Archived = false and cr.id in (${roleIds}) and sh.tenant_id = ${tenant_id}`
      )
      .groupBy(
        'cr.id, cr.name, sh.start_time, sh.end_time, sc.id, sc.lead_time, ld.minutes, sc.setup_time, sc.breakdown_time, sc.wrapup_time'
      )
      .orderBy('sc.id', 'ASC');

    return query;
  }

  async modifyShiftInformtionRtd(updateDtos: UpdateDataRtdIndividualDto[]) {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const staffAssignments = [];
      const staffAssignmentsDrafts = [];

      for (let i = 0; i < updateDtos.length; i++) {
        let entityForUpdating = null;

        if (updateDtos[i].staff_assignment_draft_id !== null) {
          entityForUpdating = await this.commonFunction.entityExist(
            this.staffAssignmentsDraftsRepository,
            { where: { id: updateDtos[i].staff_assignment_draft_id } },
            'Staff Assignments Drafts'
          );
          entityForUpdating.reason = 'C';
        } else {
          entityForUpdating = await this.commonFunction.entityExist(
            this.staffAssignmentsRepository,
            { where: { id: updateDtos[i].staff_assignment_id } },
            'Staff Assignments'
          );
        }

        if (
          entityForUpdating.shift_end_time === null ||
          entityForUpdating.shift_start_time === null
        ) {
          const shifts = await this.commonFunction.entityExist(
            this.shiftsRepository,
            { where: { id: updateDtos[i].shift_id } },
            'Shifts'
          );

          entityForUpdating.shift_end_time =
            entityForUpdating.shift_end_time === null
              ? shifts.end_time
              : entityForUpdating.shift_end_time;
          entityForUpdating.shift_start_time =
            entityForUpdating.shift_start_time === null
              ? shifts.start_time
              : entityForUpdating.shift_start_time;
        }

        entityForUpdating.lead_time = updateDtos[i].lead_time;
        entityForUpdating.travel_to_time = updateDtos[i].travel_to_time;
        entityForUpdating.setup_time = updateDtos[i].setup_time;
        entityForUpdating.breakdown_time = updateDtos[i].breakdown_time;
        entityForUpdating.travel_from_time = updateDtos[i].travel_from_time;
        entityForUpdating.wrapup_time = updateDtos[i].wrapup_time;
        entityForUpdating.total_hours = updateDtos[i].total_hours;

        let dateObject = this.GetYearMonthAndDay(
          entityForUpdating.clock_in_time
        );
        let newDate = `${dateObject.year}-${dateObject.month}-${
          dateObject.day
        } ${moment(updateDtos[i].clock_in_time, ['h:mm A']).format('HH:mm')}`;
        entityForUpdating.clock_in_time = new Date(newDate);

        dateObject = this.GetYearMonthAndDay(entityForUpdating.clock_out_time);
        newDate = `${dateObject.year}-${dateObject.month}-${
          dateObject.day
        } ${moment(updateDtos[i].clock_out_time, ['h:mm A']).format('HH:mm')}`;
        entityForUpdating.clock_out_time = new Date(newDate);

        dateObject = this.GetYearMonthAndDay(
          entityForUpdating.shift_start_time
        );
        newDate = `${dateObject.year}-${dateObject.month}-${
          dateObject.day
        } ${moment(updateDtos[i].shift_start_time, ['h:mm A']).format(
          'HH:mm'
        )}`;
        entityForUpdating.shift_start_time = new Date(newDate);

        dateObject = this.GetYearMonthAndDay(entityForUpdating.shift_end_time);
        newDate = `${dateObject.year}-${dateObject.month}-${
          dateObject.day
        } ${moment(updateDtos[i].shift_end_time, ['h:mm A']).format('HH:mm')}`;
        entityForUpdating.shift_end_time = new Date(newDate);

        if (updateDtos[i].staff_assignment_draft_id !== null) {
          this.staffAssignmentsDraftsRepository.save(entityForUpdating);
          staffAssignmentsDrafts.push(entityForUpdating);
        } else {
          this.staffAssignmentsRepository.save(entityForUpdating);
          staffAssignments.push(entityForUpdating);
        }
      }
      await Promise.all(staffAssignments);
      await Promise.all(staffAssignmentsDrafts);
      await queryRunner.commitTransaction();

      return {
        status: 'success',
        message: `Resource Updated`,
        code: HttpStatus.OK,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  GetYearMonthAndDay(date: Date) {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }

  async getAvailableDevices(
    getAvailableDevicesParams: GetAvailableDevicesParamsDto,
    user: any
  ) {
    const shift = await this.shiftsRepository.findOne({
      where: {
        id: getAvailableDevicesParams.shift_id as any,
        tenant_id: user?.tenant_id,
      },
    });

    getAvailableDevicesParams.shift_start_time = new Date(shift.start_time)
      .toISOString()
      .split('T')[0];
    getAvailableDevicesParams.shift_end_time = new Date(shift.end_time)
      .toISOString()
      .split('T')[0];

    const query = this.queryForGetDeviceAvailable(getAvailableDevicesParams);

    const result = await query.getRawMany();

    result.forEach((item) => {
      if (item.already_scheduled == null) {
        const resultsForOneDevice = result.filter(
          (r) => r.device_id == item.device_id
        );
        if (resultsForOneDevice.every((r) => r.already_scheduled == null)) {
          item.already_scheduled = false;
        }
      }
    });

    const formattedArray = [];

    result.forEach((item) => {
      const device = formattedArray.find((d) => d.device_id == item.device_id);

      if (device === undefined) {
        formattedArray.push(item);
      } else {
        device.scheduled_dates = [
          ...new Set(device.scheduled_dates.concat(item.scheduled_dates)),
        ];
        device.already_scheduled = item.already_scheduled
          ? item.already_scheduled
          : device.already_scheduled;

        const index = formattedArray.findIndex(
          (fa) => fa.vehicle_id == item.vehicle_id
        );

        if (index !== -1) {
          formattedArray.splice(index, 1);
          formattedArray.push(device);
        }
      }
    });

    return {
      status: 'success',
      response: '',
      code: HttpStatus.OK,
      record_count: formattedArray.length,
      data: formattedArray,
    };
  }

  queryForGetDeviceAvailable(getAvailableDevicesParams) {
    const whereCondition = `device.device_type_id = ${getAvailableDevicesParams.device_type_id} and device.collection_operation = ${getAvailableDevicesParams.collection_operation_id} and device.status = true`;

    const query = this.deviceRepository
      .createQueryBuilder('device')
      .innerJoin(
        'device_type',
        'device_type',
        'device.device_type_id = device_type.id'
      )
      .leftJoin(
        'devices_assignments',
        'devices_assignments',
        `devices_assignments.assigned_device_id = device.id`
      )
      .leftJoin(
        'devices_assignments_drafts',
        'devices_assignments_drafts',
        `devices_assignments_drafts.assigned_device_id = device.id and devices_assignments_drafts.is_notify = false`
      )
      .leftJoin(
        'device_maintenance',
        'device_maintenance',
        'device_maintenance.device = device.id'
      )
      .leftJoin(
        'sessions',
        'sessions',
        `(devices_assignments.operation_id = sessions.id AND devices_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}') OR (devices_assignments_drafts.operation_id = sessions.id AND devices_assignments_drafts.operation_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}')`
      )
      .leftJoin(
        'drives',
        'drive',
        `(devices_assignments.operation_id = drive.id AND devices_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}') OR (devices_assignments_drafts.operation_id = drive.id AND devices_assignments_drafts.operation_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}')`
      )
      .leftJoin(
        'oc_non_collection_events',
        'oc_non_collection_event',
        `(devices_assignments.operation_id = oc_non_collection_event.id AND devices_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}') OR (devices_assignments_drafts.operation_id = oc_non_collection_event.id AND devices_assignments_drafts.operation_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}')`
      )
      .select([
        '(CAST(device.id as int)) as device_id',
        '(device.name) as device_name',
        '(device.device_type_id) as device_type_id',
        '(device_type.name) as device_type_name',
        '(device.collection_operation) as collection_operation',
        `CASE
          WHEN device_maintenance.start_date_time <> NULL AND device_maintenance.end_date_time <> NULL
          THEN CAST('${getAvailableDevicesParams.shift_end_time}' AS DATE)  < DATE(device_maintenance.start_date_time) OR CAST('${getAvailableDevicesParams.shift_start_time}' AS DATE) > DATE(device_maintenance.end_date_time)
          ELSE true
        END AS is_available`,
        `CASE
                WHEN COALESCE(drive.date, sessions.date, oc_non_collection_event.date) IS NOT NULL
                THEN  (CAST(COALESCE(drive.date, sessions.date, oc_non_collection_event.date) AS DATE)) = '${getAvailableDevicesParams.operationDate}'
                ELSE NULL
          END as already_scheduled`,
        `(ARRAY_AGG(DISTINCT COALESCE(DATE(sessions.date), DATE(drive.date), DATE(oc_non_collection_event.date)))) as scheduled_dates`,
        `device.tenant_id as tenant_id`,
      ])
      .where(whereCondition)
      .groupBy(
        'drive.date, sessions.date, oc_non_collection_event.date, device.id, device.name, device.device_type_id, device_type.name, device.collection_operation, device_maintenance.start_date_time, device_maintenance.end_date_time'
      );

    return query;
  }

  async getAvailableVehicles(
    getAvailableVehiclesParams: GetAvailableVehiclesParamsDto
  ) {
    const shift = await this.shiftsRepository.findOne({
      where: {
        id: getAvailableVehiclesParams.shift_id as any,
      },
    });
    getAvailableVehiclesParams.shift_start_time = new Date(shift.start_time)
      .toISOString()
      .split('T')[0];
    getAvailableVehiclesParams.shift_end_time = new Date(shift.end_time)
      .toISOString()
      .split('T')[0];

    const query = this.queryForGetVehicleAvailable(getAvailableVehiclesParams);

    const result = await query.getRawMany();

    result.forEach((item) => {
      if (item.already_scheduled == null) {
        const reslutsForOneVehicle = result.filter(
          (r) => r.vehicle_id == item.vehicle_id
        );
        if (reslutsForOneVehicle.every((r) => r.already_scheduled == null)) {
          item.already_scheduled = false;
        }
      }
    });

    const formattedArray = [];

    result.forEach((item) => {
      const vehicle = formattedArray.find(
        (v) => v.vehicle_id == item.vehicle_id
      );

      if (vehicle === undefined) {
        formattedArray.push(item);
      } else {
        vehicle.scheduled_dates = [
          ...new Set(vehicle.scheduled_dates.concat(item.scheduled_dates)),
        ];
        vehicle.already_scheduled = item.already_scheduled
          ? item.already_scheduled
          : vehicle.already_scheduled;
        const index = formattedArray.findIndex(
          (fa) => fa.vehicle_id == item.vehicle_id
        );

        if (index !== -1) {
          formattedArray.splice(index, 1);
          formattedArray.push(vehicle);
        }
      }
    });

    return {
      status: 'success',
      response: '',
      code: HttpStatus.OK,
      record_count: formattedArray.length,
      data: formattedArray,
    };
  }

  queryForGetVehicleAvailable(getAvailableDevicesParams) {
    const whereCondition = `vehicle.vehicle_type_id = ${getAvailableDevicesParams.vehicle_type_id} and vehicle.collection_operation = ${getAvailableDevicesParams.collection_operation_id} and vehicle.is_active = true`;

    const query = this.vehicleRepository
      .createQueryBuilder('vehicle')
      .innerJoin(
        'vehicle_type',
        'vehicle_type',
        'vehicle.vehicle_type_id = vehicle_type.id'
      )
      .innerJoin(
        'vehicle_certification',
        'vehicle_certification',
        'vehicle.id = vehicle_certification.vehicle_id'
      )
      .innerJoin(
        'certification',
        'certification',
        'vehicle_certification.certification_id = certification.id'
      )
      .leftJoin(
        'vehicles_assignments',
        'vehicles_assignments',
        `vehicles_assignments.assigned_vehicle_id = vehicle.id`
      )
      .leftJoin(
        'vehicles_assignments_drafts',
        'vehicles_assignments_drafts',
        `vehicles_assignments_drafts.assigned_vehicle_id = vehicle.id and vehicles_assignments_drafts.is_notify = false`
      )
      .leftJoin(
        'vehicle_maintenance',
        'vehicle_maintenance',
        `vehicle_maintenance.vehicle_id = vehicle.id`
      )
      .leftJoin(
        'sessions',
        'sessions',
        `(vehicles_assignments.operation_id = sessions.id AND vehicles_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}') OR (vehicles_assignments_drafts.operation_id = sessions.id AND vehicles_assignments_drafts.operation_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}')`
      )
      .leftJoin(
        'drives',
        'drive',
        `(vehicles_assignments.operation_id = drive.id AND vehicles_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}') OR (vehicles_assignments_drafts.operation_id = drive.id AND vehicles_assignments_drafts.operation_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}')`
      )
      .leftJoin(
        'oc_non_collection_events',
        'oc_non_collection_event',
        `(vehicles_assignments.operation_id = oc_non_collection_event.id AND vehicles_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}') OR (vehicles_assignments_drafts.operation_id = oc_non_collection_event.id AND vehicles_assignments_drafts.operation_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}')`
      )
      .select([
        '(CAST(vehicle.id as int)) as vehicle_id',
        '(vehicle.name) as vehicle_name',
        '(vehicle.vehicle_type_id) as vehicle_type_id',
        '(vehicle_type.name) as vehicle_type_name',
        '(vehicle.collection_operation) as collection_operation',
        `CASE
          WHEN vehicle_maintenance.start_date_time <> NULL AND vehicle_maintenance.end_date_time <> NULL
          THEN CAST('${getAvailableDevicesParams.shift_end_time}' AS DATE)  < DATE(vehicle_maintenance.start_date_time) OR CAST('${getAvailableDevicesParams.shift_start_time}' AS DATE) > DATE(vehicle_maintenance.end_date_time)
          ELSE true
        END  AS is_available`,
        `CASE
          WHEN COALESCE(drive.date, sessions.date, oc_non_collection_event.date) IS NOT NULL
          THEN  (CAST(COALESCE(drive.date, sessions.date, oc_non_collection_event.date) AS DATE)) = '${getAvailableDevicesParams.operationDate}'
          ELSE NULL
        END as already_scheduled`,
        `(ARRAY_AGG(DISTINCT COALESCE(DATE(sessions.date), DATE(drive.date), DATE(oc_non_collection_event.date)))) as scheduled_dates`,
        `vehicle.tenant_id as tenant_id`,
        '(ARRAY_AGG(certification.name)) as certifications',
      ])
      .where(whereCondition)
      .groupBy(
        'drive.date, sessions.date, oc_non_collection_event.date, vehicle.id, vehicle.name, vehicle.vehicle_type_id, vehicle_type.name, vehicle.collection_operation, vehicle_maintenance.start_date_time, vehicle_maintenance.end_date_time, vehicle.tenant_id'
      );

    return query;
  }

  async getSharedDevices(
    getAvailableDevicesParams: GetAvailableDevicesParamsDto
  ) {
    const query = this.queryForGetDeviceShared(getAvailableDevicesParams);

    const result = await query.getRawMany();
    result.forEach((item) => {
      if (item.already_scheduled == null) {
        const resultsForOneDevice = result.filter(
          (r) => r.device_id == item.device_id
        );
        if (resultsForOneDevice.every((r) => r.already_scheduled == null)) {
          item.already_scheduled = false;
        }
      }
    });

    const formattedArray = [];

    result.forEach((item) => {
      const device = formattedArray.find((d) => d.device_id == item.device_id);

      if (device === undefined) {
        formattedArray.push(item);
      } else {
        device.scheduled_dates = [
          ...new Set(device.scheduled_dates.concat(item.scheduled_dates)),
        ];
        device.already_scheduled = item.already_scheduled
          ? item.already_scheduled
          : device.already_scheduled;

        const index = formattedArray.findIndex(
          (fa) => fa.vehicle_id == item.vehicle_id
        );

        if (index !== -1) {
          formattedArray.splice(index, 1);
          formattedArray.push(device);
        }
      }
    });
    return {
      status: 'success',
      response: '',
      code: HttpStatus.OK,
      record_count: formattedArray.length,
      data: formattedArray,
    };
  }

  queryForGetDeviceShared(getAvailableDevicesParams) {
    const query = this.deviceRepository
      .createQueryBuilder('device')
      .innerJoin(
        'device_type',
        'device_type',
        'device.device_type_id = device_type.id'
      )
      .leftJoin(
        'resource_sharings',
        'resource_sharings',
        `resource_sharings.from_collection_operation_id = device.collection_operation`
      )
      .leftJoin(
        'devices_assignments_drafts',
        'devices_assignments_drafts',
        'devices_assignments_drafts.assigned_device_id = device.id and devices_assignments_drafts.is_notify = false'
      )
      .leftJoin(
        'devices_assignments',
        'devices_assignments',
        'devices_assignments.assigned_device_id = device.id'
      )
      .leftJoin(
        'device_maintenance',
        'device_maintenance',
        'device_maintenance.device = device.id'
      )
      .leftJoin(
        'sessions',
        'sessions',
        `(devices_assignments.operation_id = sessions.id AND devices_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}') OR (devices_assignments_drafts.operation_id = sessions.id AND devices_assignments_drafts.operation_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}')`
      )
      .leftJoin(
        'drives',
        'drive',
        `(devices_assignments.operation_id = drive.id AND devices_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}') OR (devices_assignments_drafts.operation_id = drive.id AND devices_assignments_drafts.operation_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}')`
      )
      .leftJoin(
        'oc_non_collection_events',
        'oc_non_collection_event',
        `(devices_assignments.operation_id = oc_non_collection_event.id AND devices_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}') OR (devices_assignments_drafts.operation_id = oc_non_collection_event.id AND devices_assignments_drafts.operation_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}')`
      )
      .select([
        '(CAST(device.id as int)) as device_id',
        '(device.name) as device_name',
        '(device.device_type_id) as device_type_id',
        '(device_type.name) as device_type_name',
        '(device.collection_operation) as collection_operation',
        `(ARRAY_AGG(DISTINCT COALESCE(DATE(sessions.date), DATE(drive.date), DATE(oc_non_collection_event.date)))) as scheduled_dates`,
        `device.tenant_id as tenant_id`,
      ])
      .where(
        `device.status = true and resource_sharings.to_collection_operation_id = ${getAvailableDevicesParams.collection_operation_id} AND device.is_archived = false`
      )
      .andWhere('resource_sharings.share_type = 1')
      .andWhere('resource_sharings.is_archived = false')
      .andWhere(
        `'${getAvailableDevicesParams.date}' BETWEEN resource_sharings.start_date AND resource_sharings.end_date`
      )
      .groupBy(
        'device.id, device.name, device.device_type_id, device_type.name, device.collection_operation, device.tenant_id'
      );

    return query;
  }

  async getSharedVehicles(
    getAvailableVehiclesParams: GetAvailableVehiclesParamsDto
  ) {
    const query = this.queryForGetVehicleShared(getAvailableVehiclesParams);

    const result = await query.getRawMany();

    result.forEach((item) => {
      if (item.already_scheduled == null) {
        const reslutsForOneVehicle = result.filter(
          (r) => r.vehicle_id == item.vehicle_id
        );
        if (reslutsForOneVehicle.every((r) => r.already_scheduled == null)) {
          item.already_scheduled = false;
        }
      }
    });

    const formattedArray = [];

    result.forEach((item) => {
      const vehicle = formattedArray.find(
        (v) => v.vehicle_id == item.vehicle_id
      );

      if (vehicle === undefined) {
        formattedArray.push(item);
      } else {
        vehicle.scheduled_dates = [
          ...new Set(vehicle.scheduled_dates.concat(item.scheduled_dates)),
        ];
        vehicle.already_scheduled = item.already_scheduled
          ? item.already_scheduled
          : vehicle.already_scheduled;
        const index = formattedArray.findIndex(
          (fa) => fa.vehicle_id == item.vehicle_id
        );

        if (index !== -1) {
          formattedArray.splice(index, 1);
          formattedArray.push(vehicle);
        }
      }
    });

    return {
      status: 'success',
      response: '',
      code: HttpStatus.OK,
      record_count: formattedArray.length,
      data: formattedArray,
    };
  }

  queryForGetVehicleShared(getAvailableDevicesParams) {
    const query = this.vehicleRepository
      .createQueryBuilder('vehicle')
      .innerJoin(
        'vehicle_type',
        'vehicle_type',
        'vehicle.vehicle_type_id = vehicle_type.id'
      )
      .leftJoin(
        'resource_sharings',
        'resource_sharings',
        `resource_sharings.from_collection_operation_id = vehicle.collection_operation`
      )
      .innerJoin(
        'vehicle_certification',
        'vehicle_certification',
        'vehicle.id = vehicle_certification.vehicle_id'
      )
      .innerJoin(
        'certification',
        'certification',
        'vehicle_certification.certification_id = certification.id'
      )
      .leftJoin(
        'vehicles_assignments_drafts',
        'vehicles_assignments_drafts',
        'vehicles_assignments_drafts.assigned_vehicle_id = vehicle.id AND vehicles_assignments_drafts.is_notify = false'
      )
      .leftJoin(
        'vehicles_assignments',
        'vehicles_assignments',
        'vehicles_assignments.assigned_vehicle_id = vehicle.id'
      )
      .leftJoin(
        'vehicle_maintenance',
        'vehicle_maintenance',
        'vehicle_maintenance.vehicle_id = vehicle.id'
      )
      .leftJoin(
        'sessions',
        'sessions',
        `(vehicles_assignments.operation_id = sessions.id AND vehicles_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}') OR (vehicles_assignments_drafts.operation_id = sessions.id AND vehicles_assignments_drafts.operation_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}')`
      )
      .leftJoin(
        'drives',
        'drive',
        `(vehicles_assignments.operation_id = drive.id AND vehicles_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}') OR (vehicles_assignments_drafts.operation_id = drive.id AND vehicles_assignments_drafts.operation_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}')`
      )
      .leftJoin(
        'oc_non_collection_events',
        'oc_non_collection_event',
        `(vehicles_assignments.operation_id = oc_non_collection_event.id AND vehicles_assignments.operation_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}') OR (vehicles_assignments_drafts.operation_id = oc_non_collection_event.id AND vehicles_assignments_drafts.operation_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}')`
      )
      .select([
        '(CAST(vehicle.id as int)) as vehicle_id',
        '(vehicle.name) as vehicle_name',
        '(vehicle.vehicle_type_id) as vehicle_type_id',
        '(vehicle_type.name) as vehicle_type_name',
        '(vehicle.collection_operation) as collection_operation',
        '(ARRAY_AGG(certification.name)) as certifications',
        `(ARRAY_AGG(DISTINCT COALESCE(DATE(sessions.date), DATE(drive.date), DATE(oc_non_collection_event.date)))) as scheduled_dates`,
        `vehicle.tenant_id as tenant_id`,
      ])
      .where(
        `resource_sharings.to_collection_operation_id = ${getAvailableDevicesParams.collection_operation_id} AND vehicle.is_active = true AND vehicle.is_archived = false`
      )
      .andWhere('resource_sharings.share_type = 3')
      .andWhere('resource_sharings.is_archived = false')
      .andWhere(
        `'${getAvailableDevicesParams.date}' BETWEEN resource_sharings.start_date AND resource_sharings.end_date`
      )
      .groupBy(
        'vehicle.id, vehicle.name, vehicle.vehicle_type_id, vehicle_type.name, vehicle.collection_operation, vehicle.tenant_id'
      );

    return query;
  }

  async getDataForUpdateHomeBase(
    operation_id,
    operation_type,
    shift_id,
    schduled_status,
    user
  ) {
    let data;

    const isPublished = schduled_status === 'Draft' ? false : true;
    const individualValuesQuery = this.queryForUpdateHomeBaseMainTableGetData(
      operation_id,
      operation_type,
      shift_id,
      false,
      user.tenant_id
    );

    data = await individualValuesQuery.getRawMany();

    if (isPublished) {
      const individualValuesDraftQuery =
        this.queryForUpdateHomeBaseMainTableGetData(
          operation_id,
          operation_type,
          shift_id,
          isPublished,
          user.tenant_id
        );

      const draftData = await individualValuesDraftQuery.getRawMany();

      if (draftData.length > 0) {
        draftData.forEach((item) => {
          item.staff_assignment_draft_id = item.staff_assignment_id;
          item.staff_assignment_id = null;
        });
      }

      data = data.concat(draftData);
    }

    if (data.length > 0) {
      const operationCoollectionOperationQuery =
        this.getOperationCollectionOperationData(
          operation_id,
          operation_type,
          user.tenant_id
        );
      const operationCoollectionOperationData =
        await operationCoollectionOperationQuery.getRawOne();

      if (operationCoollectionOperationData !== undefined) {
        data.forEach((item) => {
          item.operation_collection_operation =
            operationCoollectionOperationData.name;
          item.oco_coordinates = operationCoollectionOperationData.coordinates;
        });
      }

      for (let i = 0; i < data.length; i++) {
        for (let j = 1; j < 4; j++) {
          const staffCollectionOperationQuery =
            this.getStaffCollectionOperationData(
              data[i].staff_id,
              j,
              user.tenant_id
            );
          const staffCollectionOperationData =
            await staffCollectionOperationQuery.getRawOne();

          if (staffCollectionOperationData !== undefined) {
            data[i].staff_collection_operation =
              staffCollectionOperationData.name;
            data[i].sco_coordinates = staffCollectionOperationData.coordinates;
            j = 4;
          }
        }
      }
    }
    return data;
  }

  queryForUpdateHomeBaseMainTableGetData(
    operationId,
    operationType,
    shiftId,
    isPublished,
    tenantId
  ) {
    let query;

    const whereCondition = isPublished
      ? `sa.operation_id = ${operationId} and sa.shift_id = ${shiftId} and sa.operation_type = '${operationType}' and is_notify = false`
      : `sa.operation_id = ${operationId} and sa.shift_id = ${shiftId} and sa.operation_type = '${operationType}'`;

    if (operationType === PolymorphicType.OC_OPERATIONS_DRIVES) {
      query = this.driveRepository
        .createQueryBuilder('d')
        .innerJoinAndSelect(
          isPublished ? 'staff_assignments_drafts' : 'staff_assignments',
          'sa',
          'sa.operation_id = d.id'
        )
        .innerJoinAndSelect('contacts_roles', 'cr', 'cr.id = sa.role_id')
        .innerJoinAndSelect('staff', 's', 's.id = sa.staff_id')
        .innerJoinAndSelect(
          'address',
          'ad',
          `ad.addressable_id = d.location_id AND ad.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'`
        )
        .innerJoinAndSelect('accounts', 'acc', 'acc.id = d.account_id')
        .innerJoinAndSelect(
          'business_units',
          'bu',
          'bu.id = acc.collection_operation'
        )
        .select([
          'sa.staff_id as staff_id',
          `sa.id as staff_assignment_id`,
          `null as staff_assignment_draft_id`,
          `ad.coordinates as destination_coordinates`,
          `cr.name as role_name`,
          `cr.short_name as role_short_name`,
          `(s.first_name || ' ' || s.last_name) as staff_name`,
          `sa.home_base as home_base_enum`,
          `(select address1 from address where addressable_id = s.id and addressable_type = '${PolymorphicType.CRM_CONTACTS_STAFF}') as staff_home_address`,
          `(select coordinates  from address where addressable_id = s.id and addressable_type = '${PolymorphicType.CRM_CONTACTS_STAFF}') as sha_coordinates`,
          'null as operation_collection_operation',
          'null as oco_coordinates',
          'null as staff_collection_operation',
          'null as sco_coordinates',
          `sa.is_travel_time_included as is_travel_time_included`,
          `sa.tenant_id as tenant_id`,
        ])
        .where(whereCondition)
        .andWhere(`d.tenant_id = ${tenantId}`);
    } else if (operationType === PolymorphicType.OC_OPERATIONS_SESSIONS) {
      query = this.sessionRepository
        .createQueryBuilder('se')
        .innerJoinAndSelect(
          isPublished ? 'staff_assignments_drafts' : 'staff_assignments',
          'sa',
          'sa.operation_id = se.id'
        )
        .innerJoinAndSelect('contacts_roles', 'cr', 'cr.id = sa.role_id')
        .innerJoinAndSelect('staff', 's', 's.id = sa.staff_id')
        .innerJoinAndSelect(
          'facility',
          'f',
          'f.id = se.donor_center_id AND donor_center = true'
        )
        .innerJoinAndSelect(
          'address',
          'ad',
          `ad.addressable_id = f.id AND ad.addressable_type = '${PolymorphicType.SC_ORG_ADMIN_FACILITY}'`
        )
        .innerJoinAndSelect(
          'business_units',
          'bu',
          'bu.id = se.collection_operation_id'
        )
        .select([
          'sa.staff_id as staff_id',
          `sa.id as staff_assignment_id`,
          `null as staff_assignment_draft_id`,
          `ad.coordinates as destination_coordinates`,
          `cr.name as role_name`,
          `(s.first_name || ' ' || s.last_name) as staff_name`,
          `sa.home_base as home_base_enum`,
          `(select address1 from address where addressable_id = s.id and addressable_type = '${PolymorphicType.CRM_CONTACTS_STAFF}') as staff_home_address`,
          `(select coordinates  from address where addressable_id = s.id and addressable_type = '${PolymorphicType.CRM_CONTACTS_STAFF}') as sha_coordinates`,
          `sa.is_travel_time_included as is_travel_time_included`,
          `sa.tenant_id as tenant_id`,
        ])
        .where(whereCondition)
        .andWhere(`se.tenant_id = ${tenantId}`);
    } else if (operationType === 'non-collection-events') {
      query = this.nonCollectionEventsRepository
        .createQueryBuilder('once')
        .innerJoinAndSelect(
          isPublished ? 'staff_assignments_drafts' : 'staff_assignments',
          'sa',
          'sa.operation_id = once.id'
        )
        .innerJoinAndSelect('contacts_roles', 'cr', 'cr.id = sa.role_id')
        .innerJoinAndSelect('staff', 's', 's.id = sa.staff_id')
        .innerJoinAndSelect(
          'address',
          'ad',
          `ad.addressable_id = once.location_id AND ad.addressable_type = '${PolymorphicType.CRM_LOCATIONS}'`
        )
        .innerJoinAndSelect(
          'ncp_collection_operations',
          'nco',
          'nco.ncp_id = once.non_collection_profile_id'
        )
        .innerJoinAndSelect(
          'business_units',
          'bu',
          'nco.business_unit_id = bu.id'
        )
        .innerJoinAndSelect(
          'organizational_levels',
          'ol',
          'bu.organizational_level_id = ol.id AND ol.is_collection_operation = true'
        )
        .select([
          `sa.id as staff_assignment_id`,
          `null as staff_assignment_draft_id`,
          `ad.coordinates as destination_coordinates`,
          `cr.name as role_name`,
          `(s.first_name || ' ' || s.last_name) as staff_name`,
          `sa.home_base as home_base_enum`,
          `(select address1 from address where addressable_id = s.id and addressable_type = '${PolymorphicType.CRM_CONTACTS_STAFF}') as staff_home_address`,
          `(select coordinates  from address where addressable_id = s.id and addressable_type = '${PolymorphicType.CRM_CONTACTS_STAFF}') as sha_coordinates`,
          `sa.is_travel_time_included as is_travel_time_included`,
          `sa.tenant_id as tenant_id`,
        ])
        .where(whereCondition)
        .andWhere(`once.tenant_id = ${tenantId}`);
    }

    return query;
  }

  getOperationCollectionOperationData(operationId, operationType, tenantId) {
    let query;

    if (operationType === 'drives') {
      query = this.driveRepository
        .createQueryBuilder('d')
        .innerJoinAndSelect('accounts', 'acc', 'acc.id = d.account_id')
        .innerJoinAndSelect(
          'facility',
          'f',
          'f.collection_operation = acc.collection_operation and f.staging_site = true and f.is_archived = false'
        )
        .innerJoinAndSelect(
          'business_units',
          'bu',
          'f.collection_operation = bu.id'
        )
        .innerJoinAndSelect(
          'address',
          'ad',
          `ad.addressable_id = f.id and ad.addressable_type = 'facility'`
        )
        .select(['bu.name as name', 'ad.coordinates as coordinates'])
        .where(`d.id = ${operationId} and d.tenant_id = ${tenantId}`);
    }

    if (operationType === 'sessions') {
      query = this.sessionRepository
        .createQueryBuilder('se')
        .innerJoinAndSelect(
          'facility',
          'f',
          'f.id = se.donor_center_id and f.is_archived = false'
        )
        .innerJoinAndSelect(
          'business_units',
          'bu',
          'f.collection_operation = bu.id'
        )
        .innerJoinAndSelect(
          'address',
          'ad',
          `ad.addressable_id = f.id and ad.addressable_type = 'facility'`
        )
        .select(['bu.name as name', 'ad.coordinates as coordinates'])
        .where(`se.id = ${operationId} and se.tenant_id = ${tenantId}`);
    }

    if (operationType === 'non-collection-events') {
      query = this.nonCollectionEventsRepository
        .createQueryBuilder('once')
        .innerJoinAndSelect(
          'ncp_collection_operations',
          'nco',
          'nco.ncp_id = once.non_collection_profile_id'
        )
        .innerJoinAndSelect(
          'facility',
          'f',
          'f.collection_operation = nco.business_unit_id and f.is_archived = false'
        )
        .innerJoinAndSelect(
          'business_units',
          'bu',
          'f.collection_operation = bu.id'
        )
        .innerJoinAndSelect(
          'address',
          'ad',
          `ad.addressable_id = f.id and ad.addressable_type = 'facility'`
        )
        .select(['bu.name as name', 'ad.coordinates as coordinates'])
        .where(`once.id = ${operationId} and once.tenant_id = ${tenantId}`);
    }

    return query;
  }

  getStaffCollectionOperationData(staffId, numberOfRetries, tenantId) {
    let query;

    if (numberOfRetries == 1) {
      query = this.staffRepository
        .createQueryBuilder('s')
        .innerJoinAndSelect(
          'facility',
          'f',
          's.collection_operation_id = f.collection_operation and f.staging_site = true and f.is_archived = false'
        )
        .innerJoinAndSelect(
          'business_units',
          'bu',
          'f.collection_operation = bu.id'
        )
        .innerJoinAndSelect(
          'address',
          'ad',
          `ad.addressable_id = f.id and ad.addressable_type = 'facility'`
        )
        .select([
          's.id as staff_id',
          's.tenant_id as tenant_id',
          'bu.name as name',
          'ad.coordinates as coordinates',
        ])
        .where(`s.id = ${staffId} and s.tenant_id = ${tenantId}`);
    }

    if (numberOfRetries == 2) {
      query = this.staffRepository
        .createQueryBuilder('s')
        .innerJoinAndSelect(
          'staff_donor_centers_mapping',
          'sd',
          'sd.staff_id = s.id and sd.is_primary = true'
        )
        .innerJoinAndSelect(
          'facility',
          'f',
          's.collection_operation_id = f.collection_operation and f.staging_site = true and f.is_archived = false'
        )
        .innerJoinAndSelect(
          'business_units',
          'bu',
          'f.collection_operation = bu.id'
        )
        .innerJoinAndSelect(
          'address',
          'ad',
          `ad.addressable_id = f.id and ad.addressable_type = 'facility'`
        )
        .select([
          's.id as staff_id',
          's.tenant_id as tenant_id',
          'bu.name as name',
          'ad.coordinates as coordinates',
        ])
        .where(`s.id = ${staffId} and s.tenant_id = ${tenantId}`);
    }

    if (numberOfRetries == 3) {
      query = this.staffRepository
        .createQueryBuilder('s')
        .innerJoinAndSelect(
          'staff_donor_centers_mapping',
          'sd',
          'sd.staff_id = s.id'
        )
        .innerJoinAndSelect(
          'business_units',
          'bu',
          'f.collection_operation = bu.id'
        )
        .innerJoinAndSelect(
          'facility',
          'f',
          's.collection_operation_id = f.collection_operation and f.staging_site = true and f.is_archived = false'
        )
        .innerJoinAndSelect(
          'address',
          'ad',
          `ad.addressable_id = f.id and ad.addressable_type = 'facility'`
        )
        .select([
          's.id as staff_id',
          's.tenant_id as tenant_id',
          'bu.name as name',
          'ad.coordinates as coordinates',
        ])
        .where(`s.id = ${staffId} and s.tenant_id = ${tenantId}`);
    }

    return query;
  }

  async staffRequestedUpdateHomeBase(
    operation_id,
    operation_type,
    shift_id,
    updateDtos: UpdateHomeBaseDto[]
  ) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const staffAssignments = [];
      const staffAssignmentsDrafts = [];

      for (let i = 0; i < updateDtos.length; i++) {
        let entityForUpdating = null;

        if (updateDtos[i].staff_assignment_draft_id !== null) {
          entityForUpdating = await this.commonFunction.entityExist(
            this.staffAssignmentsDraftsRepository,
            { where: { id: updateDtos[i].staff_assignment_draft_id } },
            'Staff Assignments Drafts'
          );
          entityForUpdating.reason = 'C';
        } else {
          entityForUpdating = await this.commonFunction.entityExist(
            this.staffAssignmentsRepository,
            { where: { id: updateDtos[i].staff_assignment_id } },
            'Staff Assignments'
          );
        }

        if (
          entityForUpdating.shift_start_time === null ||
          entityForUpdating.shift_end_time === null
        ) {
          const shifts = await this.commonFunction.entityExist(
            this.shiftsRepository,
            { where: { id: entityForUpdating.shift_id } },
            'Shifts'
          );

          entityForUpdating.shift_end_time =
            entityForUpdating.shift_end_time === null
              ? shifts.end_time
              : entityForUpdating.shift_end_time;
          entityForUpdating.shift_start_time =
            entityForUpdating.shift_start_time === null
              ? shifts.start_time
              : entityForUpdating.shift_start_time;
        }

        if (!updateDtos[i].is_travel_time_included) {
          entityForUpdating = this.calculateAndMapHomeBaseValuesForUpdating(
            0,
            0,
            entityForUpdating
          );
        } else {
          if (operation_type === PolymorphicType.OC_OPERATIONS_SESSIONS) {
            entityForUpdating = this.calculateAndMapHomeBaseValuesForUpdating(
              updateDtos[i].minutes,
              updateDtos[i].minutes,
              entityForUpdating
            );
          } else {
            //for drives and nce
            if (
              updateDtos[i].home_base_enum === HomeBaseEnum.STAFF_HOME_ADDRESS
            ) {
              entityForUpdating = this.calculateAndMapHomeBaseValuesForUpdating(
                updateDtos[i].minutes,
                updateDtos[i].minutes,
                entityForUpdating
              );
            } else {
              const direction = await this.commonFunction.entityExist(
                this.directionRepository,
                {
                  where: {
                    collection_operation_id:
                      entityForUpdating.collection_operation_id,
                  },
                },
                'There is no directions for one of those staff'
              );

              entityForUpdating = this.calculateAndMapHomeBaseValuesForUpdating(
                direction.minutes,
                direction.minutes,
                entityForUpdating
              );
            }
          }
        }

        entityForUpdating.home_base = updateDtos[i].home_base_enum;
        entityForUpdating.is_travel_time_included =
          updateDtos[i].is_travel_time_included;

        if (updateDtos[i].staff_assignment_draft_id !== null) {
          this.staffAssignmentsDraftsRepository.save(entityForUpdating);
          staffAssignmentsDrafts.push(entityForUpdating);
        } else {
          this.staffAssignmentsRepository.save(entityForUpdating);
          staffAssignments.push(entityForUpdating);
        }
      }
      await Promise.all(staffAssignments);
      await Promise.all(staffAssignmentsDrafts);
      await queryRunner.commitTransaction();

      return {
        status: 'success',
        message: `Resource Updated`,
        code: HttpStatus.OK,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async createStaffAssignment(
    createStaffAssignmentDto: CreateStaffAssignmentDto,
    isPublished = false,
    shift_id
  ) {
    if (!createStaffAssignmentDto) {
      throw new Error('Invalid Staff Assignment Data.');
    }
    const shift = await this.shiftsRepository
      .createQueryBuilder()
      .select(['start_time', 'end_time'])
      .where('id = :shiftId', { shiftId: shift_id })
      .execute();
    const startTime = shift[0].start_time;
    const endTime = shift[0].end_time;

    if (shift) {
      createStaffAssignmentDto.shift_start_time = startTime;
      createStaffAssignmentDto.shift_end_time = endTime;
    }

    const defaultValuesQuery = this.getDefaultTimeValuesByRole(
      createStaffAssignmentDto.role_id,
      shift_id
    );

    const defaultValues = await defaultValuesQuery.getRawOne();

    if (defaultValues !== undefined) {
      createStaffAssignmentDto.lead_time = defaultValues.lead_time;
      createStaffAssignmentDto.breakdown_time = defaultValues.breakdown_time;
      createStaffAssignmentDto.setup_time = defaultValues.setup_time;
      createStaffAssignmentDto.wrapup_time = defaultValues.wrapup_time;

      const minutes = await this.staffRepository
        .createQueryBuilder('s')
        .innerJoinAndSelect(
          'location_directions',
          'ld',
          'ld.collection_operation_id = s.collection_operation_id'
        )
        .select('ld.minutes as minutes')
        .where('s.id = :staffId', {
          staffId: createStaffAssignmentDto.staff_id,
        })
        .getRawOne();

      createStaffAssignmentDto.travel_from_time =
        minutes === undefined ? 0 : minutes.minutes;
      createStaffAssignmentDto.travel_to_time =
        minutes === undefined ? 0 : minutes.minutes;
      createStaffAssignmentDto.clock_in_time = new Date(
        createStaffAssignmentDto.clock_in_time
      );
      createStaffAssignmentDto.clock_out_time = new Date(
        createStaffAssignmentDto.clock_out_time
      );

      //Calculate clock_in_time, clock_out_time, total_hours
      this.calculateAndMapHomeBaseValuesForUpdating(
        createStaffAssignmentDto.travel_from_time,
        createStaffAssignmentDto.travel_to_time,
        createStaffAssignmentDto
      );
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      let queryData;
      let staffAssignmentData;

      //Todo: come back to these values as the staff_assignments_drafts table is not mentioned in the docs.
      if (isPublished) {
        const existingDataquery = await this.staffAssignmentsDraftsRepository
          .createQueryBuilder()
          .where('operation_id = :operationId', {
            operationId: createStaffAssignmentDto.operation_id,
          })
          .andWhere('shift_id = :shiftId', {
            shiftId: createStaffAssignmentDto.shift_id,
          })
          .andWhere('operation_type = :operationType', {
            operationType: createStaffAssignmentDto.operation_type,
          })
          .andWhere('staff_id = :staffId', {
            staffId: createStaffAssignmentDto.staff_id,
          })
          .andWhere('role_id = :roleId', {
            roleId: createStaffAssignmentDto.role_id,
          })
          .andWhere('is_notify= false');

        queryData = await existingDataquery.execute();
        if (queryData.length > 0) {
          await existingDataquery.delete().execute();
        } else {
          createStaffAssignmentDto.reason = 'C';
          createStaffAssignmentDto.home_base =
            HomeBaseEnum.COLLECTION_OPERATION_OF_STAFF;
          const staffAssignment = isPublished
            ? new StaffAssignmentsDrafts()
            : new StaffAssignments();
          Object.assign(staffAssignment, createStaffAssignmentDto);
          const newStaffAssignment = isPublished
            ? this.staffAssignmentsDraftsRepository.create(staffAssignment)
            : this.staffAssignmentsRepository.create(staffAssignment);

          staffAssignmentData = isPublished
            ? await this.staffAssignmentsDraftsRepository.save(
                newStaffAssignment
              )
            : await this.staffAssignmentsRepository.save(newStaffAssignment);

          await queryRunner.commitTransaction();
        }
      } else {
        createStaffAssignmentDto.reason = 'C';
        createStaffAssignmentDto.home_base =
          HomeBaseEnum.COLLECTION_OPERATION_OF_STAFF;
        const staffAssignment = isPublished
          ? new StaffAssignmentsDrafts()
          : new StaffAssignments();
        Object.assign(staffAssignment, createStaffAssignmentDto);
        const newStaffAssignment = isPublished
          ? this.staffAssignmentsDraftsRepository.create(staffAssignment)
          : this.staffAssignmentsRepository.create(staffAssignment);

        staffAssignmentData = isPublished
          ? await this.staffAssignmentsDraftsRepository.save(newStaffAssignment)
          : await this.staffAssignmentsRepository.save(newStaffAssignment);

        await queryRunner.commitTransaction();
      }
      return resSuccess(
        `Staff Assignment created successfully.`,
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        staffAssignmentData,
        1
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(
        error?.message || `Failed to create staff assignment: ${error}`,
        'failed',
        HttpStatus.PRECONDITION_FAILED
      );
    } finally {
      await queryRunner.release();
    }
  }

  getDefaultTimeValuesByRole(roleId, shiftId) {
    const query = this.contactsRolesRepository
      .createQueryBuilder('cr')
      .innerJoinAndSelect('staff_config', 'sc', 'sc.contact_role_id = cr.id')
      .innerJoinAndSelect('staff_setup', 'ss', `sc.staff_setup_id = ss.id`)
      .innerJoinAndSelect(
        'shifts_projections_staff',
        'sps',
        `sps.shift_id = ${shiftId} AND sps.staff_setup_id = ss.id`
      )
      .select([
        `sc.lead_time as lead_time`,
        `sc.setup_time as setup_time`,
        `sc.breakdown_time as breakdown_time`,
        `sc.wrapup_time as wrapup_time`,
      ])
      .where(`cr.id = ${roleId}`)
      .groupBy(
        'sc.lead_time, sc.setup_time, sc.breakdown_time, sc.wrapup_time'
      );

    return query;
  }
  calculateAndMapHomeBaseValuesForUpdating(
    travelToTime,
    travelFromTime,
    entityForUpdating
  ) {
    entityForUpdating.travel_from_time = +travelFromTime;
    entityForUpdating.travel_to_time = +travelToTime;

    let minutesIn =
      entityForUpdating.shift_start_time.getHours() * 60 +
      entityForUpdating.shift_start_time.getMinutes();
    minutesIn =
      minutesIn - +entityForUpdating.lead_time - +entityForUpdating.setup_time - +travelToTime;

    let dateObject = this.GetYearMonthAndDay(entityForUpdating.clock_in_time);
    let newDate = `${dateObject.year}-${dateObject.month}-${
      dateObject.day
    } ${Math.floor(minutesIn / 60 > 24 ? 23 : minutesIn / 60)}:${
      minutesIn % 60
    }`;
    entityForUpdating.clock_in_time = new Date(newDate);

    let minutesOut =
      entityForUpdating.shift_end_time.getHours() * 60 +
      entityForUpdating.shift_end_time.getMinutes();
    minutesOut =
      +minutesOut +
      +entityForUpdating.breakdown_time +
      +entityForUpdating.wrapup_time + +travelFromTime;

    dateObject = this.GetYearMonthAndDay(entityForUpdating.clock_out_time);
    newDate = `${dateObject.year}-${dateObject.month}-${
      dateObject.day
    } ${Math.floor(minutesOut / 60 > 24 ? 23 : minutesOut / 60)}:${
      minutesOut % 60
    }`;
    entityForUpdating.clock_out_time = new Date(newDate);

    entityForUpdating.total_hours = (minutesOut - minutesIn) / 60;

    return entityForUpdating;
  }

  async flagOperationAndGetChangeSummaryData(
    operation_id: any,
    operation_type: any,
    getFlaggedOperationsOnly: boolean = false
  ) {
    try {
      let latestCreatedAt = null;
      const operationShifts = await this.shiftsRepository.find({
        where: {
          shiftable_id: operation_id,
          shiftable_type: operation_type,
          is_archived: false,
        },
      });
      await Promise.all(
        operationShifts.map(async (shift) => {
          // Get latest date of staffing app changes
          const latestChangeResult = await this.entityManager.connection
            .query(` 
          SELECT MAX(latestCreatedAt) AS latestCreatedAt FROM (
            SELECT created_at AS latestCreatedAt FROM (
              SELECT created_at FROM staff_assignments 
              WHERE shift_id = ${shift.id}
              GROUP BY created_at
              ORDER BY created_at DESC
              LIMIT 1
            ) AS t1
          
            UNION
          
            SELECT created_at AS latestCreatedAt FROM (
              SELECT created_at FROM devices_assignments 
              WHERE shift_id = ${shift.id}
              GROUP BY created_at
              ORDER BY created_at DESC
              LIMIT 1
            ) AS t2
          
            UNION
          
            SELECT created_at AS latestCreatedAt FROM (
              SELECT created_at FROM vehicles_assignments 
              WHERE shift_id = ${shift.id}
              GROUP BY created_at
              ORDER BY created_at DESC
              LIMIT 1
            ) AS t3
            
            UNION
            
            SELECT created_at AS latestCreatedAt FROM (
              SELECT created_at FROM staff_assignments_drafts 
              WHERE shift_id = ${shift.id}
              GROUP BY created_at
              ORDER BY created_at DESC
              LIMIT 1
            ) AS t4
          
            UNION
          
            SELECT created_at AS latestCreatedAt FROM (
              SELECT created_at FROM devices_assignments_drafts 
              WHERE shift_id = ${shift.id}
              GROUP BY created_at
              ORDER BY created_at DESC
              LIMIT 1
            ) AS t5
          
            UNION
          
            SELECT created_at AS latestCreatedAt FROM (
              SELECT created_at FROM vehicles_assignments_drafts 
              WHERE shift_id = ${shift.id}
              GROUP BY created_at
              ORDER BY created_at DESC
              LIMIT 1
            ) AS t6
          ) AS subquery;
        `);

          if (latestChangeResult) {
            if (latestCreatedAt) {
              if (latestChangeResult[0].latestcreatedat > latestCreatedAt) {
                latestCreatedAt = latestChangeResult[0].latestcreatedat;
              }
            } else {
              latestCreatedAt = latestChangeResult[0].latestcreatedat;
            }
          }
        })
      );

      if (!latestCreatedAt) {
        const scheduleOperation = await this.scheduleOperationRepository.findOne({
          where: {
            operation_id: operation_id,
            operation_type: operation_type,
          }
        });
        latestCreatedAt = scheduleOperation.created_at;
      }

      const flagChanges = {
        flagged: false,
        operationDate: false,
        operationStatus: false,
        locationType: false,
        shiftTime: false,
        vehicles: false,
        devices: false,
        staffs: false,
        changes: [],
      };

      if (operation_type === PolymorphicType.OC_OPERATIONS_DRIVES) {
        const driveChanges = [];
        // Drive changes
        const changedDrive: any = await this.driveRepository.findOne({
          where: {
            id: operation_id,
            is_archived: false,
          },
          relations: ['created_by', 'operation_status', 'location'],
        });

        const changedDriveData: any = await this.driveRepository.findOne({
          where: {
            id: operation_id,
            is_archived: false,
          },
          relations: ['created_by', 'operation_status', 'location'],
        });

        if (changedDrive?.created_at > latestCreatedAt) {
          // Means drive changed
          const originalDrive: any = await this.drivesHistoryRepository
            .createQueryBuilder('drive_history')
            .leftJoinAndSelect(
              'crm_locations',
              'location',
              'drive_history.location_id = location.id'
            )
            .leftJoinAndSelect(
              'operations_status',
              'operations_status',
              'drive_history.operation_status_id = operations_status.id'
            )
            .where(`drive_history.id = ${operation_id}`)
            .andWhere(`drive_history.created_at < :date`, {
              date: latestCreatedAt,
            })
            .andWhere(`drive_history.history_reason = 'C'`)
            .select()
            .orderBy('drive_history.rowkey', 'DESC')
            .take(1)
            .getRawOne();

          // Operation Date Change
          if (
            originalDrive?.drive_history_date.getTime() !==
            new Date(changedDriveData?.date).getTime()
          ) {
            // Means there is a change in drive's date
            flagChanges.operationDate = true;
            flagChanges.flagged = true;
            if (!getFlaggedOperationsOnly) {
              // Get blame
              const driveHistoryDateChange = await this.drivesHistoryRepository
                .createQueryBuilder('drive_history')
                .leftJoinAndSelect(
                  'user',
                  'user',
                  'drive_history.created_by = user.id'
                )
                .select()
                .addSelect(
                  '(LAG(drive_history.date) OVER (ORDER BY drive_history.rowkey))',
                  'prev_drive_history_date'
                )
                .where(`drive_history.id = :operationId`, {
                  operationId: operation_id,
                })
                .andWhere(`drive_history.created_at > :date`, {
                  date: latestCreatedAt,
                })
                .andWhere(`drive_history.history_reason = 'C'`)
                .orderBy('drive_history.rowkey', 'ASC')
                .getRawMany();

              const filteredDriveHistoryDateChange = driveHistoryDateChange
                .filter(
                  (driveHistory) =>
                    driveHistory.drive_history_date.getTime() === new Date(changedDrive.date).getTime() &&
                    (driveHistory.prev_drive_history_date === null ||
                      driveHistory.prev_drive_history_date.getTime() !==
                        new Date(changedDrive.date).getTime())
                )
                .slice(0, 1);

              if (filteredDriveHistoryDateChange.length > 0) {
                // Means we need to use created_at and created_by of driveHistoryDateChange object
                driveChanges.push({
                  what: 'Date',
                  requested: changedDriveData.date,
                  original: originalDrive.drive_history_date,
                  changeAt:
                    filteredDriveHistoryDateChange[0].drive_history_created_at,
                  changeBy:
                    filteredDriveHistoryDateChange[0].user_first_name +
                    ' ' +
                    filteredDriveHistoryDateChange[0].user_last_name,
                });
              } else {
                // Otherwise we need to use created_at and created_by of changedDrive object
                driveChanges.push({
                  what: 'Date',
                  requested: changedDriveData.date,
                  original: originalDrive.drive_history_date,
                  changeAt: changedDriveData.created_at,
                  changeBy:
                    changedDriveData.created_by.first_name +
                    ' ' +
                    changedDriveData.created_by.last_name,
                });
              }
            }
          }

          // Operation Status Change
          // Get original operation status
          let originalOperationStatus: any =
            await this.operationsStatusRepository.findOne({
              where: {
                id: originalDrive?.operations_status_id,
              },
            });

          if (originalOperationStatus?.created_at > latestCreatedAt) {
            // Means operation status also changed, now get the original status from operationsStatusHistory table
            originalOperationStatus = await this.operationsStatusHistoryRepository
              .createQueryBuilder('operation_status_history')
              .where(
                `operation_status_history.id = ${originalOperationStatus.id}`
              )
              .andWhere(`operation_status_history.created_at < :date`, {
                date: latestCreatedAt,
              })
              .andWhere(`operation_status_history.history_reason = 'C'`)
              .select()
              .orderBy('operation_status_history.rowkey', 'DESC')
              .take(1)
              .getOne();
          }
          if (originalOperationStatus?.schedulable) {
            // Checking if original operation status is already not unscheduleable, so we don't mark operation as status change to unscheduleable.
            // But if original operation status is scheduleable then we need to check further for the status change
            if (!changedDriveData.operation_status?.schedulable) {
              flagChanges.operationStatus = true;
              flagChanges.flagged = true;
              // Means that drive's operation_status is changed to unscheduleable
              if (!getFlaggedOperationsOnly) {
                // Get blame
                const blameDriveHistory: any =
                  await this.drivesHistoryRepository
                    .createQueryBuilder('drive_history')
                    .leftJoinAndSelect(
                      'user',
                      'user',
                      'drive_history.created_by = user.id'
                    )
                    .where(`drive_history.id = :operationId`, {
                      operationId: operation_id,
                    })
                    .andWhere(`drive_history.created_at > :date`, {
                      date: latestCreatedAt,
                    })
                    .andWhere(`drive_history.history_reason = 'C'`)
                    .select()
                    .addSelect(
                      '(LAG(drive_history.operation_status_id) OVER (ORDER BY drive_history.rowkey))',
                      'prev_drive_history_operation_status_id'
                    )
                    .orderBy('drive_history.rowkey', 'ASC')
                    .getRawMany();

                const filteredBlameDriveHistory = blameDriveHistory
                  .filter(
                    (driveHistory) =>
                      driveHistory.drive_history_operation_status_id ===
                        changedDrive.operation_status?.id &&
                      (driveHistory.prev_drive_history_operation_status_id ===
                        null ||
                        driveHistory.prev_drive_history_operation_status_id !==
                          changedDrive.operation_status?.id)
                  )
                  .slice(0, 1);

                const blameOperationStatusHistory: any =
                  await this.operationsStatusHistoryRepository
                    .createQueryBuilder('operation_status_history')
                    .leftJoinAndSelect(
                      'user',
                      'user',
                      'operation_status_history.created_by = user.id'
                    )
                    .where(`operation_status_history.id = :operationStatusId`, {
                      operationStatusId: changedDrive.operation_status?.id,
                    })
                    .andWhere(`operation_status_history.created_at > :date`, {
                      date: latestCreatedAt,
                    })
                    .andWhere(`operation_status_history.history_reason = 'C'`)
                    .select()
                    .addSelect(
                      '(LAG(operation_status_history.schedulable) OVER (ORDER BY operation_status_history.rowkey))',
                      'prev_operation_status_schedulable'
                    )
                    .orderBy('operation_status_history.rowkey', 'ASC')
                    .getRawMany();

                const filteredBlameOperationStatusHistory =
                  blameOperationStatusHistory
                    .filter(
                      (operationStatusHistory) =>
                        operationStatusHistory.operation_status_history_schedulable ===
                          changedDrive.operation_status?.schedulable &&
                        (operationStatusHistory.prev_operation_status_schedulable ===
                          null ||
                          operationStatusHistory.prev_operation_status_schedulable !==
                            changedDrive.operation_status?.schedulable)
                    )
                    .slice(0, 1);

                if (filteredBlameDriveHistory.length > 0) {
                  if (
                    filteredBlameOperationStatusHistory.length === 0 ||
                    filteredBlameDriveHistory[0].drive_history_created_at >
                      filteredBlameOperationStatusHistory[0]
                        ?.operation_status_history_created_at
                  ) {
                    // Means we need to use created_at and created_by of blameDriveHistory object
                    driveChanges.push({
                      what: 'Operation Status',
                      requested: 'Unschedulable',
                      original: 'Schedulable',
                      changeAt:
                        filteredBlameDriveHistory[0].drive_history_created_at,
                      changeBy:
                        filteredBlameDriveHistory[0].user_first_name +
                        ' ' +
                        filteredBlameDriveHistory[0].user_last_name,
                    });
                  } else {
                    // Otherwise we need to use created_at and created_by of blameOperationStatusHistory object
                    driveChanges.push({
                      what: 'Operation Status',
                      requested: 'Unschedulable',
                      original: 'Schedulable',
                      changeAt:
                        filteredBlameOperationStatusHistory[0]
                          .operation_status_history_created_at,
                      changeBy:
                        filteredBlameOperationStatusHistory[0].user_first_name +
                        ' ' +
                        filteredBlameOperationStatusHistory[0].user_last_name,
                    });
                  }
                } else {
                  if (
                    filteredBlameOperationStatusHistory.length === 0 ||
                    changedDrive.created_at >
                      filteredBlameOperationStatusHistory[0]
                        ?.operation_status_history_created_at
                  ) {
                    // Means we need to use created_at and created_by of changedDrive object
                    driveChanges.push({
                      what: 'Operation Status',
                      requested: 'Unschedulable',
                      original: 'Schedulable',
                      changeAt: changedDriveData.created_at,
                      changeBy:
                        changedDriveData.created_by.first_name +
                        ' ' +
                        changedDriveData.created_by.last_name,
                    });
                  } else {
                    // Otherwise we need to use created_at and created_by of blameOperationStatusHistory object
                    driveChanges.push({
                      what: 'Operation Status',
                      requested: 'Unschedulable',
                      original: 'Schedulable',
                      changeAt:
                        filteredBlameOperationStatusHistory[0]
                          .operation_status_history_created_at,
                      changeBy:
                        filteredBlameOperationStatusHistory[0].user_first_name +
                        ' ' +
                        filteredBlameOperationStatusHistory[0].user_last_name,
                    });
                  }
                }
              }
            }
          }

          // Location Type Change
          // Get original location
          let originalLocation: any = await this.crmLocationsRepository.findOne(
            {
              where: {
                id: originalDrive?.location_id,
              },
            }
          );

          if (originalLocation?.created_at > latestCreatedAt) {
            // Means location also changed, now get the original location from crmLocationsHistory table
            originalLocation = await this.crmLocationsHistoryRepository
              .createQueryBuilder('location_history')
              .where(`location_history.id = ${originalLocation.id}`)
              .andWhere(`location_history.created_at < :date`, {
                date: latestCreatedAt,
              })
              .andWhere(`location_history.history_reason = 'C'`)
              .select()
              .orderBy('location_history.rowkey', 'DESC')
              .take(1)
              .getOne();
          }
          if (
            changedDriveData.location.site_type?.toLocaleLowerCase() !==
            originalLocation?.site_type?.toLocaleLowerCase()
          ) {
            // Means that drive's location type is changed
            flagChanges.locationType = true;
            flagChanges.flagged = true;

            if (!getFlaggedOperationsOnly) {
              // Get blame
              const blameDriveHistory: any = await this.drivesHistoryRepository
                .createQueryBuilder('drive_history')
                .leftJoinAndSelect(
                  'user',
                  'user',
                  'drive_history.created_by = user.id'
                )
                .where(`drive_history.id = :operationId`, {
                  operationId: operation_id,
                })
                .andWhere(`drive_history.created_at > :date`, {
                  date: latestCreatedAt,
                })
                .andWhere(`drive_history.history_reason = 'C'`)
                .andWhere(
                  `drive_history.location_id = :locationId `,
                  { locationId: changedDrive.location?.id }
                )
                .select()
                .addSelect(
                  '(LAG(drive_history.location_id) OVER (ORDER BY drive_history.id))',
                  'prev_drive_history_location_id'
                )
                .orderBy('drive_history.rowkey', 'ASC')
                .getRawMany();

              const filteredBlameDriveHistory = blameDriveHistory
                .filter(
                  (driveHistory) =>
                    driveHistory.drive_history_location_id ===
                      changedDrive.location?.id &&
                    (driveHistory.prev_drive_history_location_id === null ||
                      driveHistory.prev_drive_history_location_id !==
                        changedDrive.location?.id)
                )
                .slice(0, 1);

              const blameLocationHistory: any =
                await this.crmLocationsHistoryRepository
                  .createQueryBuilder('location_history')
                  .leftJoinAndSelect(
                    'user',
                    'user',
                    'location_history.created_by = user.id'
                  )
                  .where(`location_history.id = :locationId`, {
                    locationId: changedDrive.location?.id,
                  })
                  .andWhere(`location_history.created_at > :date`, {
                    date: latestCreatedAt,
                  })
                  .andWhere(`location_history.history_reason = 'C'`)
                  .andWhere(
                    `LOWER(location_history.site_type) = LOWER(:siteType) `,
                    { siteType: changedDrive.location?.site_type }
                  )
                  .select()
                  .addSelect(
                    '(LAG(location_history.site_type) OVER (ORDER BY location_history.id))',
                    'prev_location_site_type'
                  )
                  .orderBy('location_history.rowkey', 'ASC')
                  .getRawMany();

              const filteredBlameLocationHistory = blameLocationHistory
                .filter(
                  (locationHistory) =>
                    locationHistory.location_history_site_type ===
                      changedDrive.location?.site_type &&
                    (locationHistory.prev_location_site_type === null ||
                      locationHistory.prev_location_site_type !==
                        changedDrive.location?.site_type)
                )
                .slice(0, 1);

              if (filteredBlameDriveHistory.length > 0) {
                if (
                  filteredBlameLocationHistory.length === 0 ||
                  filteredBlameDriveHistory[0].drive_history_created_at >
                    filteredBlameLocationHistory[0]?.location_history_created_at
                ) {
                  // Means we need to use created_at and created_by of blameDriveHistory object
                  driveChanges.push({
                    what: 'Location Type',
                    requested: changedDriveData.location.site_type,
                    original: originalLocation?.site_type,
                    changeAt:
                      filteredBlameDriveHistory[0].drive_history_created_at,
                    changeBy:
                      filteredBlameDriveHistory[0].user_first_name +
                      ' ' +
                      filteredBlameDriveHistory[0].user_last_name,
                  });
                } else {
                  // Otherwise we need to use created_at and created_by of blameLocationHistory object
                  driveChanges.push({
                    what: 'Location Type',
                    requested: changedDriveData.location.site_type,
                    original: originalLocation?.site_type,
                    changeAt:
                      filteredBlameLocationHistory[0]
                        .location_history_created_at,
                    changeBy:
                      filteredBlameLocationHistory[0].user_first_name +
                      ' ' +
                      filteredBlameLocationHistory[0].user_last_name,
                  });
                }
              } else {
                if (
                  filteredBlameLocationHistory.length === 0 ||
                  changedDrive.created_at >
                    filteredBlameLocationHistory[0]?.location_history_created_at
                ) {
                  // Means we need to use created_at and created_by of changedDrive object
                  driveChanges.push({
                    what: 'Location Type',
                    requested: changedDriveData.location.site_type,
                    original: originalLocation?.site_type,
                    changeAt: changedDriveData.created_at,
                    changeBy:
                      changedDriveData.created_by.first_name +
                      ' ' +
                      changedDriveData.created_by.last_name,
                  });
                } else {
                  // Otherwise we need to use created_at and created_by of blameLocationHistory object
                  driveChanges.push({
                    what: 'Location Type',
                    requested: changedDriveData.location.site_type,
                    original: originalLocation?.site_type,
                    changeAt:
                      filteredBlameLocationHistory[0]
                        .location_history_created_at,
                    changeBy:
                      filteredBlameLocationHistory[0].user_first_name +
                      ' ' +
                      filteredBlameLocationHistory[0].user_last_name,
                  });
                }
              }
            }
          }
        }

        // Now we will compare operationStatus and location from their respective tables
        // Get changed operation status
        let changedOperationStatus: any =
          await this.operationsStatusRepository.findOne({
            where: {
              id: changedDrive?.operations_status?.id,
              created_at: MoreThan(latestCreatedAt),
              schedulable: false,
            },
            relations: ['created_by'],
          });

        if (changedOperationStatus) {

          const originalOperationStatus =
            await this.operationsStatusHistoryRepository
              .createQueryBuilder('operation_status_history')
              .where(
                `operation_status_history.id = ${changedOperationStatus.id}`
              )
              .andWhere(`operation_status_history.created_at < :date`, {
                date: latestCreatedAt,
              })
              .andWhere(`operation_status_history.history_reason = 'C'`)
              // .andWhere(`LOWER(operation_status_history.name) <> LOWER(${changedOperationStatus.name})`)
              .select()
              .orderBy('operation_status_history.rowkey', 'DESC')
              .take(1)
              .getOne();

          if (originalOperationStatus?.schedulable !== changedOperationStatus.schedulable) {
            flagChanges.operationStatus = true;
            flagChanges.flagged = true;
            // Means that operation status is being changed

            if (!getFlaggedOperationsOnly) {
              const blameOperationStatusHistory: any =
                await this.operationsStatusHistoryRepository
                  .createQueryBuilder('operation_status_history')
                  .leftJoinAndSelect(
                    'user',
                    'user',
                    'operation_status_history.created_by = user.id'
                  )
                  .where(`operation_status_history.id = :operationStatusId`, {
                    operationStatusId: changedDrive.operation_status?.id,
                  })
                  .andWhere(`operation_status_history.created_at > :date`, {
                    date: latestCreatedAt,
                  })
                  .andWhere(`operation_status_history.history_reason = 'C'`)
                  .select()
                  .addSelect(
                    '(LAG(operation_status_history.schedulable) OVER (ORDER BY operation_status_history.rowkey))',
                    'prev_operation_status_schedulable'
                  )
                  .orderBy('operation_status_history.rowkey', 'ASC')
                  .getRawMany();

              const filteredBlameOperationStatusHistory =
                blameOperationStatusHistory
                  .filter(
                    (operationStatusHistory) =>
                      operationStatusHistory.operation_status_history_schedulable ===
                        changedOperationStatus.schedulable &&
                      (operationStatusHistory.prev_operation_status_schedulable ===
                        null ||
                        operationStatusHistory.prev_operation_status_schedulable !==
                          changedOperationStatus.schedulable)
                  )
                  .slice(0, 1);

              if (filteredBlameOperationStatusHistory?.lenght > 0) {
                // We need to use created_at and created_by of filteredBlameOperationStatusHistory object
                driveChanges.push({
                  what: 'Operation Status',
                  requested: 'Unschedulable',
                  original: 'Schedulable',
                  changeAt:
                    filteredBlameOperationStatusHistory[0]
                      .operation_status_history_created_at,
                  changeBy:
                    filteredBlameOperationStatusHistory[0].user_first_name +
                    ' ' +
                    filteredBlameOperationStatusHistory[0].user_last_name,
                });
              } else {
                // We need to use created_at and created_by of changedOperationStatus object
                driveChanges.push({
                  what: 'Operation Status',
                  requested: 'Unschedulable',
                  original: 'Schedulable',
                  changeAt: changedOperationStatus.created_at,
                  changeBy:
                    changedOperationStatus.first_name +
                    ' ' +
                    changedOperationStatus.last_name,
                });
              }
            }
          }
        }

        // Get changed location
        let changedlocation: any = await this.crmLocationsRepository.findOne({
          where: {
            id: changedDrive?.location?.id,
            created_at: MoreThan(latestCreatedAt),
          },
        });

        if (changedlocation) {

          const originalLocation = await this.crmLocationsHistoryRepository
            .createQueryBuilder('location_history')
            .where(`location_history.id = ${changedlocation.id}`)
            .andWhere(`location_history.created_at < :date`, {
              date: latestCreatedAt,
            })
            .andWhere(`location_history.history_reason = 'C'`)
            .select()
            .orderBy('location_history.rowkey', 'DESC')
            .take(1)
            .getOne();
          if (
            originalLocation?.site_type.toLocaleLowerCase() !== changedlocation.site_type.toLocaleLowerCase()
          ) {
            if (changedlocation.site_type.toLocaleLowerCase() !== 'Inside / Outside') {
              flagChanges.locationType = true;
              flagChanges.flagged = true;
              // Means that location site type is being changed

              if (!getFlaggedOperationsOnly) {
                const blameLocationHistory: any =
                  await this.crmLocationsHistoryRepository
                    .createQueryBuilder('location_history')
                    .leftJoinAndSelect(
                      'user',
                      'user',
                      'location_history.created_by = user.id'
                    )
                    .where(`location_history.id = :locationId`, {
                      locationId: changedDrive.location?.id,
                    })
                    .andWhere(`location_history.created_at > :date`, {
                      date: latestCreatedAt,
                    })
                    .andWhere(`location_history.history_reason = 'C'`)
                    .andWhere(
                      `LOWER(location_history.site_type) = LOWER(:siteType) `,
                      { siteType: changedlocation.site_type }
                    )
                    .select()
                    .addSelect(
                      '(LAG(location_history.site_type) OVER (ORDER BY location_history.rowkey))',
                      'prev_location_site_type'
                    )
                    .orderBy('location_history.rowkey', 'ASC')
                    .getRawMany();

                const filteredBlameLocationHistory = blameLocationHistory
                  .filter(
                    (locationHistory) =>
                      locationHistory.location_history_site_type ===
                        changedlocation?.site_type &&
                      (locationHistory.prev_location_site_type === null ||
                        locationHistory.prev_location_site_type !==
                          changedlocation?.site_type)
                  )
                  .slice(0, 1);

                if (filteredBlameLocationHistory?.length > 0) {
                  // We need to use created_at and created_by of filteredBlameLocationHistory object
                  driveChanges.push({
                    what: 'Location Type',
                    requested: changedlocation.site_type.toLocaleLowerCase(),
                    original: originalLocation?.site_type,
                    changeAt:
                      filteredBlameLocationHistory[0]
                        .location_history_created_at,
                    changeBy:
                      filteredBlameLocationHistory[0].user_first_name +
                      ' ' +
                      filteredBlameLocationHistory[0].user_last_name,
                  });
                } else {
                  // We need to use created_at and created_by of changedlocation object
                  driveChanges.push({
                    what: 'Location Type',
                    requested: changedlocation.site_type.toLocaleLowerCase(),
                    original: originalLocation?.site_type,
                    changeAt: changedlocation.created_at,
                    changeBy:
                      changedlocation.first_name +
                      ' ' +
                      changedlocation.last_name,
                  });
                }
              }
            }
          }
        }

        flagChanges.changes.push({
          header: 'Drive',
          rows: driveChanges,
        });
      } else if (
        operation_type === PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
      ) {
        const nceChanges = [];
        // NCE changes
        const changedNCE: any =
          await this.nonCollectionEventsRepository.findOne({
            where: {
              id: operation_id,
              is_archived: false,
            },
            relations: ['created_by', 'status_id', 'location_id'],
          });

        const changedNCEData: any =
          await this.nonCollectionEventsRepository.findOne({
            where: {
              id: operation_id,
              is_archived: false,
            },
            relations: ['created_by', 'status_id', 'location_id'],
          });

        if (changedNCE?.nce_history_created_at > latestCreatedAt) {
          // Means nce changed
          const originalNCE: any =
            await this.nonCollectionEventsHistoryRepository
              .createQueryBuilder('nce_history')
              .leftJoinAndSelect(
                'crm_locations',
                'location',
                'nce_history.location_id = location.id'
              )
              .leftJoinAndSelect(
                'operations_status',
                'operations_status',
                'nce_history.status_id = operations_status.id'
              )
              .where(`nce_history.id = ${operation_id}`)
              .andWhere(`nce_history.created_at < :date`, {
                date: latestCreatedAt,
              })
              .andWhere(`nce_history.history_reason = 'C'`)
              .select()
              .orderBy('nce_history.rowkey', 'DESC')
              .take(1)
              .getRawOne();

          // Operation Date Change
          if (
            originalNCE?.nce_history_date.getTime() !== new Date(changedNCEData?.date).getTime()
          ) {
            // Means there is a change in nce's date
            flagChanges.operationDate = true;
            flagChanges.flagged = true;
            if (!getFlaggedOperationsOnly) {
              // Get blame
              const nceHistoryDateChange =
                await this.nonCollectionEventsHistoryRepository
                  .createQueryBuilder('nce_history')
                  .leftJoinAndSelect(
                    'user',
                    'user',
                    'nce_history.created_by = user.id'
                  )
                  .select()
                  .addSelect(
                    '(LAG(nce_history.date) OVER (ORDER BY nce_history.rowkey))',
                    'prev_nce_history_date'
                  )
                  .where(`nce_history.id = :operationId`, {
                    operationId: operation_id,
                  })
                  .andWhere(`nce_history.created_at > :date`, {
                    date: latestCreatedAt,
                  })
                  .andWhere(`nce_history.history_reason = 'C'`)
                  .orderBy('nce_history.rowkey', 'ASC')
                  .getRawMany();

              const filteredNceHistoryDateChange = nceHistoryDateChange
                .filter(
                  (nceHistory) =>
                    nceHistory.nce_history_date.getTime() === new Date(changedNCE.date).getTime() &&
                    (nceHistory.prev_nce_history_date === null ||
                      nceHistory.prev_nce_history_date.getTime() !== new Date(changedNCE.date).getTime())
                )
                .slice(0, 1);

              if (filteredNceHistoryDateChange.length > 0) {
                // Means we need to use created_at and created_by of nceHistoryDateChange object
                nceChanges.push({
                  what: 'Date',
                  requested: changedNCEData.date,
                  original: originalNCE.nce_history_date,
                  changeAt:
                    filteredNceHistoryDateChange[0].nce_history_created_at,
                  changeBy:
                    filteredNceHistoryDateChange[0].user_first_name +
                    ' ' +
                    filteredNceHistoryDateChange[0].user_last_name,
                });
              } else {
                // Otherwise we need to use created_at and created_by of changedNCE object
                nceChanges.push({
                  what: 'Date',
                  requested: changedNCEData.date,
                  original: originalNCE.nce_history_date,
                  changeAt: changedNCEData.created_at,
                  changeBy:
                    changedNCEData.created_by.first_name +
                    ' ' +
                    changedNCEData.created_by.last_name,
                });
              }
            }
          }

          // Operation Status Change
          // Get original operation status
          let originalOperationStatus: any =
            await this.operationsStatusRepository.findOne({
              where: {
                id: originalNCE?.operations_status_id,
              },
            });

          if (originalOperationStatus?.created_at > latestCreatedAt) {
            // Means operation status also changed, now get the original status from operationsStatusHistory table
            originalOperationStatus = await this.operationsStatusHistoryRepository
              .createQueryBuilder('operation_status_history')
              .where(
                `operation_status_history.id = ${originalOperationStatus.id}`
              )
              .andWhere(`operation_status_history.created_at < :date`, {
                date: latestCreatedAt,
              })
              .andWhere(`operation_status_history.history_reason = 'C'`)
              .select()
              .orderBy('operation_status_history.rowkey', 'DESC')
              .take(1)
              .getOne();
          }
          if (originalOperationStatus?.schedulable) {
            // Means if original operation status is already Cancel then it can't be changed to cancel
            // So we don't mark operation as status change to Cancel.
            // But if original operation status is not Cancel then we need to check further for the status change
            if (!changedNCEData.status_id?.schedulable) {
              // Means that nce's operation_status is changed to unscheduleable
              flagChanges.operationStatus = true;
              flagChanges.flagged = true;
              if (!getFlaggedOperationsOnly) {
                // Get blame
                const blameNCEHistory: any =
                  await this.nonCollectionEventsHistoryRepository
                    .createQueryBuilder('nce_history')
                    .leftJoinAndSelect(
                      'user',
                      'user',
                      'nce_history.created_by = user.id'
                    )
                    .where(`nce_history.id = :operationId`, {
                      operationId: operation_id,
                    })
                    .andWhere(`nce_history.created_at > :date`, {
                      date: latestCreatedAt,
                    })
                    .andWhere(`nce_history.history_reason = 'C'`)
                    .select()
                    .addSelect(
                      '(LAG(nce_history.operation_status_id) OVER (ORDER BY nce_history.rowkey))',
                      'prev_nce_history_operation_status_id'
                    )
                    .orderBy('nce_history.rowkey', 'ASC')
                    .getRawMany();

                const filteredBlameNCEHistory = blameNCEHistory
                  .filter(
                    (nceHistory) =>
                      nceHistory.nce_history_operation_status_id ===
                        changedNCE.status_id?.id &&
                      (nceHistory.prev_nce_history_operation_status_id ===
                        null ||
                        nceHistory.prev_nce_history_operation_status_id !==
                          changedNCE.status_id?.id)
                  )
                  .slice(0, 1);

                const blameOperationStatusHistory: any =
                  await this.operationsStatusHistoryRepository
                    .createQueryBuilder('operation_status_history')
                    .leftJoinAndSelect(
                      'user',
                      'user',
                      'operation_status_history.created_by = user.id'
                    )
                    .where(`operation_status_history.id = :operationStatusId`, {
                      operationStatusId: changedNCE.status_id?.id,
                    })
                    .andWhere(`operation_status_history.created_at > :date`, {
                      date: latestCreatedAt,
                    })
                    .andWhere(`operation_status_history.history_reason = 'C'`)
                    .select()
                    .addSelect(
                      '(LAG(operation_status_history.schedulable) OVER (ORDER BY operation_status_history.rowkey))',
                      'prev_operation_status_schedulable'
                    )
                    .orderBy('operation_status_history.rowkey', 'ASC')
                    .getRawMany();

                const filteredBlameOperationStatusHistory =
                  blameOperationStatusHistory
                    .filter(
                      (operationStatusHistory) =>
                        operationStatusHistory.operation_status_history_schedulable ===
                          changedNCE.status_id?.schedulable &&
                        (operationStatusHistory.prev_operation_status_schedulable ===
                          null ||
                          operationStatusHistory.prev_operation_status_schedulable !==
                            changedNCE.status_id?.schedulable)
                    )
                    .slice(0, 1);

                if (filteredBlameNCEHistory.length > 0) {
                  if (
                    filteredBlameOperationStatusHistory.length === 0 ||
                    filteredBlameNCEHistory[0].nce_history_created_at >
                      filteredBlameOperationStatusHistory[0]
                        ?.operation_status_history_created_at
                  ) {
                    // Means we need to use created_at and created_by of blameNCEHistory object
                    nceChanges.push({
                      what: 'Operation Status',
                      requested: 'Unschedulable',
                      original: 'Schedulable',
                      changeAt:
                        filteredBlameNCEHistory[0].nce_history_created_at,
                      changeBy:
                        filteredBlameNCEHistory[0].user_first_name +
                        ' ' +
                        filteredBlameNCEHistory[0].user_last_name,
                    });
                  } else {
                    // Otherwise we need to use created_at and created_by of blameOperationStatusHistory object
                    nceChanges.push({
                      what: 'Operation Status',
                      requested: 'Unschedulable',
                      original: 'Schedulable',
                      changeAt:
                        filteredBlameOperationStatusHistory[0]
                          .operation_status_history_created_at,
                      changeBy:
                        filteredBlameOperationStatusHistory[0].user_first_name +
                        ' ' +
                        filteredBlameOperationStatusHistory[0].user_last_name,
                    });
                  }
                } else {
                  if (
                    filteredBlameOperationStatusHistory.length === 0 ||
                    changedNCE.created_at >
                      filteredBlameOperationStatusHistory[0]
                        ?.operation_status_history_created_at
                  ) {
                    // Means we need to use created_at and created_by of changedNCE object
                    nceChanges.push({
                      what: 'Operation Status',
                      requested: 'Unschedulable',
                      original: 'Schedulable',
                      changeAt: changedNCEData.created_at,
                      changeBy:
                        changedNCEData.created_by.first_name +
                        ' ' +
                        changedNCEData.created_by.last_name,
                    });
                  } else {
                    // Otherwise we need to use created_at and created_by of blameOperationStatusHistory object
                    nceChanges.push({
                      what: 'Operation Status',
                      requested: 'Unschedulable',
                      original: 'Schedulable',
                      changeAt:
                        filteredBlameOperationStatusHistory[0]
                          .operation_status_history_created_at,
                      changeBy:
                        filteredBlameOperationStatusHistory[0].user_first_name +
                        ' ' +
                        filteredBlameOperationStatusHistory[0].user_last_name,
                    });
                  }
                }
              }
            }
          }

          // Location Type Change
          // Get original location
          let originalLocation: any = await this.crmLocationsRepository.findOne(
            {
              where: {
                id: originalNCE?.location_id,
              },
            }
          );

          if (originalLocation?.created_at > latestCreatedAt) {
            // Means location also changed, now get the original location from crmLocationsHistory table
            originalLocation = await this.crmLocationsHistoryRepository
              .createQueryBuilder('location_history')
              .where(`location_history.id = ${originalLocation.id}`)
              .andWhere(`location_history.created_at < :date`, {
                date: latestCreatedAt,
              })
              .andWhere(`location_history.history_reason = 'C'`)
              .select()
              .orderBy('location_history.rowkey', 'DESC')
              .take(1)
              .getOne();
          }
          if (
            changedNCEData.location_id?.site_type?.toLocaleLowerCase() !==
            originalLocation?.site_type?.toLocaleLowerCase()
          ) {
            // Means that nce's location type is changed
            flagChanges.locationType = true;
            flagChanges.flagged = true;
            if (!getFlaggedOperationsOnly) {
              // Get blame
              const blameNCEHistory: any =
                await this.nonCollectionEventsHistoryRepository
                  .createQueryBuilder('nce_history')
                  .leftJoinAndSelect(
                    'user',
                    'user',
                    'nce_history.created_by = user.id'
                  )
                  .where(`nce_history.id = :operationId`, {
                    operationId: operation_id,
                  })
                  .andWhere(`nce_history.created_at > :date`, {
                    date: latestCreatedAt,
                  })
                  .andWhere(`nce_history.history_reason = 'C'`)
                  .andWhere(
                    `nce_history.location_id = :locationId `,
                    { locationId: changedNCE.location_id?.id }
                  )
                  .select()
                  .addSelect(
                    '(LAG(nce_history.location_id) OVER (ORDER BY nce_history.rowkey))',
                    'prev_nce_history_location_id'
                  )
                  .orderBy('nce_history.rowkey', 'ASC')
                  .getRawMany();

              const filteredBlameNCEHistory = blameNCEHistory
                .filter(
                  (nceHistory) =>
                    nceHistory.nce_history_location_id ===
                      changedNCE.location_id?.id &&
                    (nceHistory.prev_nce_history_location_id === null ||
                      nceHistory.prev_nce_history_location_id !==
                        changedNCE.location_id?.id)
                )
                .slice(0, 1);

              const blameLocationHistory: any =
                await this.crmLocationsHistoryRepository
                  .createQueryBuilder('location_history')
                  .leftJoinAndSelect(
                    'user',
                    'user',
                    'location_history.created_by = user.id'
                  )
                  .where(`location_history.id = :locationId`, {
                    locationId: changedNCE.location_id?.id,
                  })
                  .andWhere(`location_history.created_at > :date`, {
                    date: latestCreatedAt,
                  })
                  .andWhere(`location_history.history_reason = 'C'`)
                  .andWhere(
                    `LOWER(location_history.site_type) = LOWER(:siteType) `,
                    { siteType: changedNCE.location_id?.site_type }
                  )
                  .select()
                  .addSelect(
                    '(LAG(location_history.site_type) OVER (ORDER BY location_history.rowkey))',
                    'prev_location_site_type'
                  )
                  .orderBy('location_history.rowkey', 'ASC')
                  .getRawMany();

              const filteredBlameLocationHistory = blameLocationHistory
                .filter(
                  (locationHistory) =>
                    locationHistory.location_history_site_type ===
                      changedNCE.location_id?.site_type &&
                    (locationHistory.prev_location_site_type === null ||
                      locationHistory.prev_location_site_type !==
                        changedNCE.location_id?.site_type)
                )
                .slice(0, 1);

              if (filteredBlameNCEHistory.length > 0) {
                if (
                  filteredBlameLocationHistory.length === 0 ||
                  filteredBlameNCEHistory[0].nce_history_created_at >
                    filteredBlameLocationHistory[0]?.location_history_created_at
                ) {
                  // Means we need to use created_at and created_by of blameNCEHistory object
                  nceChanges.push({
                    what: 'Location Type',
                    requested: changedNCEData.location.site_type,
                    original: originalLocation?.site_type,
                    changeAt: filteredBlameNCEHistory[0].nce_history_created_at,
                    changeBy:
                      filteredBlameNCEHistory[0].user_first_name +
                      ' ' +
                      filteredBlameNCEHistory[0].user_last_name,
                  });
                } else {
                  // Otherwise we need to use created_at and created_by of blameLocationHistory object
                  nceChanges.push({
                    what: 'Location Type',
                    requested: changedNCEData.location.site_type,
                    original: originalLocation?.site_type,
                    changeAt:
                      filteredBlameLocationHistory[0]
                        .location_history_created_at,
                    changeBy:
                      filteredBlameLocationHistory[0].user_first_name +
                      ' ' +
                      filteredBlameLocationHistory[0].user_last_name,
                  });
                }
              } else {
                if (
                  filteredBlameLocationHistory.length === 0 ||
                  changedNCE.created_at >
                    filteredBlameLocationHistory[0]?.location_history_created_at
                ) {
                  // Means we need to use created_at and created_by of changedNCE object
                  nceChanges.push({
                    what: 'Location Type',
                    requested: changedNCEData.location.site_type,
                    original: originalLocation?.site_type,
                    changeAt: changedNCEData.created_at,
                    changeBy:
                      changedNCEData.created_by.first_name +
                      ' ' +
                      changedNCEData.created_by.last_name,
                  });
                } else {
                  // Otherwise we need to use created_at and created_by of blameLocationHistory object
                  nceChanges.push({
                    what: 'Location Type',
                    requested: changedNCEData.location.site_type,
                    original: originalLocation?.site_type,
                    changeAt:
                      filteredBlameLocationHistory[0]
                        .location_history_created_at,
                    changeBy:
                      filteredBlameLocationHistory[0].user_first_name +
                      ' ' +
                      filteredBlameLocationHistory[0].user_last_name,
                  });
                }
              }
            }
          }
        }

        // Now we will compare operationStatus and location from their respective tables
        // Get changed operation status

        let changedOperationStatus: any =
          await this.operationsStatusRepository.findOne({
            where: {
              id: changedNCE?.status_id?.id,
              created_at: MoreThan(latestCreatedAt),
              schedulable: false,
            },
            relations: ['created_by'],
          });

        if (changedOperationStatus) {

          const originalOperationStatus =
            await this.operationsStatusHistoryRepository
              .createQueryBuilder('operation_status_history')
              .where(
                `operation_status_history.id = ${changedOperationStatus.id}`
              )
              .andWhere(`operation_status_history.created_at < :date`, {
                date: latestCreatedAt,
              })
              .andWhere(`operation_status_history.history_reason = 'C'`)
              // .andWhere(`LOWER(operation_status_history.name) <> LOWER(${changedOperationStatus.name})`)
              .select()
              .orderBy('operation_status_history.rowkey', 'DESC')
              .take(1)
              .getOne();
          if (originalOperationStatus?.schedulable !== changedOperationStatus.schedulable) {
            flagChanges.operationStatus = true;
            flagChanges.flagged = true;
            // Means that operation status is being changed
            if (!getFlaggedOperationsOnly) {
              const blameOperationStatusHistory: any =
                await this.operationsStatusHistoryRepository
                  .createQueryBuilder('operation_status_history')
                  .leftJoinAndSelect(
                    'user',
                    'user',
                    'operation_status_history.created_by = user.id'
                  )
                  .where(`operation_status_history.id = :operationStatusId`, {
                    operationStatusId: changedNCE.status_id?.id,
                  })
                  .andWhere(`operation_status_history.created_at > :date`, {
                    date: latestCreatedAt,
                  })
                  .andWhere(`operation_status_history.history_reason = 'C'`)
                  .select()
                  .addSelect(
                    '(LAG(operation_status_history.schedulable) OVER (ORDER BY operation_status_history.rowkey))',
                    'prev_operation_status_schedulable'
                  )
                  .orderBy('operation_status_history.rowkey', 'ASC')
                  .getRawMany();

              const filteredBlameOperationStatusHistory =
                blameOperationStatusHistory
                  .filter(
                    (operationStatusHistory) =>
                      operationStatusHistory.operation_status_history_schedulable ===
                        changedOperationStatus?.schedulable &&
                      (operationStatusHistory.prev_operation_status_schedulable ===
                        null ||
                        operationStatusHistory.prev_operation_status_schedulable !==
                          changedOperationStatus?.schedulable)
                  )
                  .slice(0, 1);
                  
              if (filteredBlameOperationStatusHistory?.length > 0) {
                // We need to use created_at and created_by of filteredBlameOperationStatusHistory object
                nceChanges.push({
                  what: 'Operation Status',
                  requested: 'Unschedulable',
                  original: 'Schedulable',
                  changeAt:
                    filteredBlameOperationStatusHistory[0]
                      .operation_status_history_created_at,
                  changeBy:
                    filteredBlameOperationStatusHistory[0].user_first_name +
                    ' ' +
                    filteredBlameOperationStatusHistory[0].user_last_name,
                });
              } else {
                // We need to use created_at and created_by of changedOperationStatus object
                nceChanges.push({
                  what: 'Operation Status',
                  requested: 'Unschedulable',
                  original: 'Schedulable',
                  changeAt: changedOperationStatus.created_at,
                  changeBy:
                    changedOperationStatus.first_name +
                    ' ' +
                    changedOperationStatus.last_name,
                });
              }
            }
          }
        }

        // Get changed location
        let changedlocation: any = await this.crmLocationsRepository.findOne({
          where: {
            id: changedNCE?.location_id?.id,
            created_at: MoreThan(latestCreatedAt),
          },
        });

        if (changedlocation) {

          const originalLocation = await this.crmLocationsHistoryRepository
            .createQueryBuilder('location_history')
            .where(`location_history.id = ${changedlocation.id}`)
            .andWhere(`location_history.created_at < :date`, {
              date: latestCreatedAt,
            })
            .andWhere(`location_history.history_reason = 'C'`)
            // .andWhere(`LOWER(location_history.site_type) <> LOWER(${changedlocation.site_type})`)
            .select()
            .orderBy('location_history.rowkey', 'DESC')
            .take(1)
            .getOne();
          if (
            originalLocation?.site_type.toLocaleLowerCase() !== changedlocation.site_type.toLocaleLowerCase()
          ) {
            if (changedlocation.site_type.toLocaleLowerCase() !== 'Inside / Outside') {
              flagChanges.locationType = true;
              flagChanges.flagged = true;
              // Means that location site type is being changed
              if (!getFlaggedOperationsOnly) {
                const blameLocationHistory: any =
                await this.crmLocationsHistoryRepository
                  .createQueryBuilder('location_history')
                  .leftJoinAndSelect(
                    'user',
                    'user',
                    'location_history.created_by = user.id'
                  )
                  .where(`location_history.id = :locationId`, {
                    locationId: changedNCE.location_id?.id,
                  })
                  .andWhere(`location_history.created_at > :date`, {
                    date: latestCreatedAt,
                  })
                  .andWhere(`location_history.history_reason = 'C'`)
                  .andWhere(
                    `LOWER(location_history.site_type) = LOWER(:siteType) `,
                    { siteType: changedlocation?.site_type }
                  )
                  .select()
                  .addSelect(
                    '(LAG(location_history.site_type) OVER (ORDER BY location_history.rowkey))',
                    'prev_location_site_type'
                  )
                  .orderBy('location_history.rowkey', 'ASC')
                  .getRawMany();

              const filteredBlameLocationHistory = blameLocationHistory
                .filter(
                  (locationHistory) =>
                    locationHistory.location_history_site_type ===
                      changedlocation?.site_type &&
                    (locationHistory.prev_location_site_type === null ||
                      locationHistory.prev_location_site_type !==
                        changedlocation?.site_type)
                )
                .slice(0, 1);

                if (filteredBlameLocationHistory?.length > 0) {
                  // We need to use created_at and created_by of filteredBlameLocationHistory object
                  nceChanges.push({
                    what: 'Location Type',
                    requested: changedlocation.site_type.toLocaleLowerCase(),
                    original: originalLocation?.site_type,
                    changeAt:
                      filteredBlameLocationHistory[0]
                        .location_history_created_at,
                    changeBy:
                      filteredBlameLocationHistory[0].user_first_name +
                      ' ' +
                      filteredBlameLocationHistory[0].user_last_name,
                  });
                } else {
                  // We need to use created_at and created_by of changedlocation object
                  nceChanges.push({
                    what: 'Location Type',
                    requested: changedlocation.site_type.toLocaleLowerCase(),
                    original: originalLocation?.site_type,
                    changeAt: changedOperationStatus.created_at,
                    changeBy:
                      changedOperationStatus.first_name +
                      ' ' +
                      changedOperationStatus.last_name,
                  });
                }
              }
            }
          }
        }

        flagChanges.changes.push({
          header: 'Non Collection Event',
          rows: nceChanges,
        });
      } else {
        const sessionChanges = [];
        // Session changes
        const changedSession: any = await this.sessionRepository.findOne({
          where: {
            id: operation_id,
            is_archived: false,
          },
          relations: ['created_by', 'operation_status'],
        });

        if (changedSession?.created_at > latestCreatedAt) {
          // Means session changed
          const originalSession: any = await this.sessionsHistoryRepository
            .createQueryBuilder('session_history')
            .leftJoinAndSelect(
              'operations_status',
              'operations_status',
              'session_history.operation_status_id = operations_status.id'
            )
            .where(`session_history.id = ${operation_id}`)
            .andWhere(`session_history.created_at < :date`, {
              date: latestCreatedAt,
            })
            .andWhere(`session_history.history_reason = 'C'`)
            .select()
            .orderBy('session_history.rowkey', 'DESC')
            .take(1)
            .getRawOne();

          // Operation Date Change
          if (originalSession?.session_history_date.getTime() !== changedSession?.date.getTime()) {
            // Means there is a change in session's date
            flagChanges.operationDate = true;
            flagChanges.flagged = true;
            if (!getFlaggedOperationsOnly) {
              // Get blame
              const sessionHistoryDateChange =
                await this.sessionsHistoryRepository
                  .createQueryBuilder('session_history')
                  .leftJoinAndSelect(
                    'user',
                    'user',
                    'session_history.created_by = user.id'
                  )
                  .select()
                  .addSelect(
                    '(LAG(session_history.date) OVER (ORDER BY session_history.rowkey))',
                    'prev_session_history_date'
                  )
                  .where(`session_history.id = :operationId`, {
                    operationId: operation_id,
                  })
                  .andWhere(`session_history.created_at > :date`, {
                    date: latestCreatedAt,
                  })
                  .andWhere(`session_history.history_reason = 'C'`)
                  .orderBy('session_history.rowkey', 'ASC')
                  .getRawMany();

              const filteredSessionHistoryDateChange = sessionHistoryDateChange
                .filter(
                  (sessionHistory) =>
                    sessionHistory.session_history_date.getTime() ===
                      changedSession.date.getTime() &&
                    (sessionHistory.prev_session_history_date === null ||
                      sessionHistory.prev_session_history_date.getTime() !==
                        changedSession.date.getTime())
                )
                .slice(0, 1);

              if (filteredSessionHistoryDateChange.length > 0) {
                // Means we need to use created_at and created_by of sessionHistoryDateChange object
                sessionChanges.push({
                  what: 'Date',
                  requested: changedSession.date,
                  original: originalSession.session_history_date,
                  changeAt:
                    filteredSessionHistoryDateChange[0]
                      .session_history_created_at,
                  changeBy:
                    filteredSessionHistoryDateChange[0].user_first_name +
                    ' ' +
                    filteredSessionHistoryDateChange[0].user_last_name,
                });
              } else {
                // Otherwise we need to use created_at and created_by of changedSession object
                sessionChanges.push({
                  what: 'Date',
                  requested: changedSession.date,
                  original: originalSession.session_history_date,
                  changeAt: changedSession.created_at,
                  changeBy:
                    changedSession.created_by.first_name +
                    ' ' +
                    changedSession.created_by.last_name,
                });
              }
            }
          }

          // Operation Status Change
          // Get original operation status
          let originalOperationStatus: any =
            await this.operationsStatusRepository.findOne({
              where: {
                id: originalSession?.operations_status_id,
              },
            });

          if (originalOperationStatus?.created_at > latestCreatedAt) {
            // Means operation status also changed, now get the original status from operationsStatusHistory table
            originalOperationStatus = await this.operationsStatusHistoryRepository
              .createQueryBuilder('operation_status_history')
              .where(
                `operation_status_history.id = ${originalOperationStatus.id}`
              )
              .andWhere(`operation_status_history.created_at < :date`, {
                date: latestCreatedAt,
              })
              .andWhere(`operation_status_history.history_reason = 'C'`)
              .select()
              .orderBy('operation_status_history.rowkey', 'DESC')
              .take(1)
              .getOne();
          }
          if (originalOperationStatus?.schedulable) {
            // Checking if original operation status is already not unscheduleable, so we don't mark operation as status change to unscheduleable.
            // But if original operation status is scheduleable then we need to check further for the status change
            if (!changedSession.operation_status?.schedulable) {
              flagChanges.operationStatus = true;
              flagChanges.flagged = true;
              // Means that session's operation_status is changed to unscheduleable
              if (!getFlaggedOperationsOnly) {
                // Get blame
                const blameSessionHistory: any =
                  await this.sessionsHistoryRepository
                    .createQueryBuilder('session_history')
                    .leftJoinAndSelect(
                      'user',
                      'user',
                      'session_history.created_by = user.id'
                    )
                    .where(`session_history.id = :operationId`, {
                      operationId: operation_id,
                    })
                    .andWhere(`session_history.created_at > :date`, {
                      date: latestCreatedAt,
                    })
                    .andWhere(`session_history.history_reason = 'C'`)
                    .select()
                    .addSelect(
                      '(LAG(session_history.operation_status_id) OVER (ORDER BY session_history.rowkey))',
                      'prev_session_history_operation_status_id'
                    )
                    .orderBy('session_history.rowkey', 'ASC')
                    .getRawMany();

                const filteredBlameSessionHistory = blameSessionHistory
                  .filter(
                    (sessionHistory) =>
                      sessionHistory.session_history_operation_status_id ===
                        changedSession.operation_status?.id &&
                      (sessionHistory.prev_session_history_operation_status_id ===
                        null ||
                        sessionHistory.prev_session_history_operation_status_id !==
                          changedSession.operation_status?.id)
                  )
                  .slice(0, 1);

                const blameOperationStatusHistory: any =
                  await this.operationsStatusHistoryRepository
                    .createQueryBuilder('operation_status_history')
                    .leftJoinAndSelect(
                      'user',
                      'user',
                      'operation_status_history.created_by = user.id'
                    )
                    .where(`operation_status_history.id = :operationStatusId`, {
                      operationStatusId: changedSession.operation_status?.id,
                    })
                    .andWhere(`operation_status_history.created_at > :date`, {
                      date: latestCreatedAt,
                    })
                    .andWhere(`operation_status_history.history_reason = 'C'`)
                    .select()
                    .addSelect(
                      '(LAG(operation_status_history.schedulable) OVER (ORDER BY operation_status_history.rowkey))',
                      'prev_operation_status_schedulable'
                    )
                    .orderBy('operation_status_history.rowkey', 'ASC')
                    .getRawMany();

                const filteredBlameOperationStatusHistory =
                  blameOperationStatusHistory
                    .filter(
                      (operationStatusHistory) =>
                        operationStatusHistory.operation_status_history_schedulable ===
                          changedSession.operation_status?.schedulable &&
                        (operationStatusHistory.prev_operation_status_schedulable ===
                          null ||
                          operationStatusHistory.prev_operation_status_schedulable !==
                            changedSession.operation_status?.schedulable)
                    )
                    .slice(0, 1);

                if (filteredBlameSessionHistory.length > 0) {
                  if (
                    filteredBlameOperationStatusHistory.length === 0 ||
                    filteredBlameSessionHistory[0].session_history_created_at >
                      filteredBlameOperationStatusHistory[0]
                        ?.operation_status_history_created_at
                  ) {
                    // Means we need to use created_at and created_by of blameSessionHistory object
                    sessionChanges.push({
                      what: 'Operation Status',
                      requested: 'Unschedulable',
                      original: 'Schedulable',
                      changeAt:
                        filteredBlameSessionHistory[0]
                          .session_history_created_at,
                      changeBy:
                        filteredBlameSessionHistory[0].user_first_name +
                        ' ' +
                        filteredBlameSessionHistory[0].user_last_name,
                    });
                  } else {
                    // Otherwise we need to use created_at and created_by of blameOperationStatusHistory object
                    sessionChanges.push({
                      what: 'Operation Status',
                      requested: 'Unschedulable',
                      original: 'Schedulable',
                      changeAt:
                        filteredBlameOperationStatusHistory[0]
                          .operation_status_history_created_at,
                      changeBy:
                        filteredBlameOperationStatusHistory[0].user_first_name +
                        ' ' +
                        filteredBlameOperationStatusHistory[0].user_last_name,
                    });
                  }
                } else {
                  if (
                    filteredBlameOperationStatusHistory.length === 0 ||
                    changedSession.created_at >
                      filteredBlameOperationStatusHistory[0]
                        ?.operation_status_history_created_at
                  ) {
                    // Means we need to use created_at and created_by of changedSession object
                    sessionChanges.push({
                      what: 'Operation Status',
                      requested: 'Unschedulable',
                      original: 'Schedulable',
                      changeAt: changedSession.created_at,
                      changeBy:
                        changedSession.created_by.first_name +
                        ' ' +
                        changedSession.created_by.last_name,
                    });
                  } else {
                    // Otherwise we need to use created_at and created_by of blameOperationStatusHistory object
                    sessionChanges.push({
                      what: 'Operation Status',
                      requested: 'Unschedulable',
                      original: 'Schedulable',
                      changeAt:
                        filteredBlameOperationStatusHistory[0]
                          .operation_status_history_created_at,
                      changeBy:
                        filteredBlameOperationStatusHistory[0].user_first_name +
                        ' ' +
                        filteredBlameOperationStatusHistory[0].user_last_name,
                    });
                  }
                }
              }
            }
          }
        }

        // Now we will compare operationStatus from its respective table
        // Get changed operation status
        let changedOperationStatus: any =
          await this.operationsStatusRepository.findOne({
            where: {
              id: changedSession?.operation_status?.id,
              created_at: MoreThan(latestCreatedAt),
              schedulable: false,
            },
            relations: ['created_by'],
          });

        if (changedOperationStatus) {

          const originalOperationStatus =
            await this.operationsStatusHistoryRepository
              .createQueryBuilder('operation_status_history')
              .where(
                `operation_status_history.id = ${changedOperationStatus.id}`
              )
              .andWhere(`operation_status_history.created_at < :date`, {
                date: latestCreatedAt,
              })
              .andWhere(`operation_status_history.history_reason = 'C'`)
              // .andWhere(`LOWER(operation_status_history.name) <> LOWER(${changedOperationStatus.name})`)
              .select()
              .orderBy('operation_status_history.rowkey', 'DESC')
              .take(1)
              .getOne();
          if (originalOperationStatus?.schedulable !== changedOperationStatus.schedulable) {
            flagChanges.operationStatus = true;
            flagChanges.flagged = true;
            // Means that operation status is being changed
            if (!getFlaggedOperationsOnly) {
              const blameOperationStatusHistory: any =
                await this.operationsStatusHistoryRepository
                  .createQueryBuilder('operation_status_history')
                  .leftJoinAndSelect(
                    'user',
                    'user',
                    'operation_status_history.created_by = user.id'
                  )
                  .where(`operation_status_history.id = :operationStatusId`, {
                    operationStatusId: changedSession.operation_status?.id,
                  })
                  .andWhere(`operation_status_history.created_at > :date`, {
                    date: latestCreatedAt,
                  })
                  .andWhere(`operation_status_history.history_reason = 'C'`)
                  .select()
                  .addSelect(
                    '(LAG(operation_status_history.schedulable) OVER (ORDER BY operation_status_history.rowkey))',
                    'prev_operation_status_schedulable'
                  )
                  .orderBy('operation_status_history.rowkey', 'ASC')
                  .getRawMany();

              const filteredBlameOperationStatusHistory =
                blameOperationStatusHistory
                  .filter(
                    (operationStatusHistory) =>
                      operationStatusHistory.operation_status_history_schedulable ===
                        changedOperationStatus?.schedulable &&
                      (operationStatusHistory.prev_operation_status_schedulable ===
                        null ||
                        operationStatusHistory.prev_operation_status_schedulable !==
                          changedOperationStatus?.schedulable)
                  )
                  .slice(0, 1);
                  
              if (filteredBlameOperationStatusHistory?.lenght > 0) {
                // We need to use created_at and created_by of filteredBlameOperationStatusHistory object
                sessionChanges.push({
                  what: 'Operation Status',
                  requested: 'Unschedulable',
                  original: 'Schedulable',
                  changeAt:
                    filteredBlameOperationStatusHistory[0]
                      .operation_status_history_created_at,
                  changeBy:
                    filteredBlameOperationStatusHistory[0].user_first_name +
                    ' ' +
                    filteredBlameOperationStatusHistory[0].user_last_name,
                });
              } else {
                // We need to use created_at and created_by of changedOperationStatus object
                sessionChanges.push({
                  what: 'Operation Status',
                  requested: 'Unschedulable',
                  original: 'Schedulable',
                  changeAt: changedOperationStatus.created_at,
                  changeBy:
                    changedOperationStatus.first_name +
                    ' ' +
                    changedOperationStatus.last_name,
                });
              }
            }
          }
        }

        flagChanges.changes.push({
          header: 'Session',
          rows: sessionChanges,
        });
      }

      // Get all shifts of an operation
      const shifts = await this.shiftsRepository.find({
        where: {
          shiftable_id: operation_id,
          shiftable_type: operation_type,
          is_archived: false,
        },
        relations: ['created_by'],
      });

      await Promise.all(
        shifts.map(async (shift, index) => {
          const shiftChanges = [];
          if (shift.created_at > latestCreatedAt) {
            // Means there is a change in shift
            // Check shift's start and end times changes
            const originalShift = await this.shiftsHistoryRepository.findOne({
              where: {
                id: shift.id,
                created_at: LessThan(latestCreatedAt),
                history_reason: 'C',
              },
              order: {
                rowkey: 'DESC',
              },
            });

            if (
              originalShift?.start_time.getHours() !==
                shift.start_time.getHours() ||
              originalShift?.start_time.getMinutes() !==
                shift.start_time.getMinutes()
            ) {
              // Means there is a change in start_time
              flagChanges.shiftTime = true;
              flagChanges.flagged = true;

              if (!getFlaggedOperationsOnly) {
                const shiftHistoryST = await this.shiftsHistoryRepository
                  .createQueryBuilder('shift_history')
                  .leftJoinAndSelect(
                    'user',
                    'user',
                    'shift_history.created_by = user.id'
                  )
                  .where(`shift_history.id = ${shift.id}`)
                  .andWhere(`shift_history.created_at > :date`, {
                    date: latestCreatedAt,
                  })
                  .andWhere(`shift_history.history_reason = 'C'`)
                  .andWhere(`shift_history.start_time = :startTime`, {
                    startTime: shift.start_time,
                  })
                  .select()
                  .orderBy('shift_history.rowkey', 'ASC')
                  .take(1)
                  .getRawOne();

                if (shiftHistoryST) {
                  // Means we need to use created_at and created_by of shiftHistoryST object
                  shiftChanges.push({
                    what: 'Start Time',
                    requested: shift.start_time,
                    original: originalShift?.start_time,
                    changeAt: shiftHistoryST.shift_history_created_at,
                    changeBy:
                      shiftHistoryST.user_first_name +
                      ' ' +
                      shiftHistoryST.user_last_name,
                  });
                } else {
                  // Otherwise we need to use created_at and created_by of shift object
                  shiftChanges.push({
                    what: 'Start Time',
                    requested: shift.start_time,
                    original: originalShift?.start_time,
                    changeAt: shift.created_at,
                    changeBy:
                      shift.created_by.first_name +
                      ' ' +
                      shift.created_by.last_name,
                  });
                }
              }
            }

            if (
              originalShift?.end_time.getHours() !== shift.end_time.getHours() ||
              originalShift?.end_time.getMinutes() !==
                shift.end_time.getMinutes()
            ) {
              // Means there is a change in end_time
              flagChanges.shiftTime = true;
              flagChanges.flagged = true;
              if (!getFlaggedOperationsOnly) {
                const shiftHistoryET = await this.shiftsHistoryRepository
                  .createQueryBuilder('shift_history')
                  .leftJoinAndSelect(
                    'user',
                    'user',
                    'shift_history.created_by = user.id'
                  )
                  .where(`shift_history.id = ${shift.id}`)
                  .andWhere(`shift_history.created_at > :date`, {
                    date: latestCreatedAt,
                  })
                  .andWhere(`shift_history.history_reason = 'C'`)
                  .andWhere(`shift_history.end_time = :endTime`, {
                    endTime: shift.end_time,
                  })
                  .select()
                  .orderBy('shift_history.rowkey', 'ASC')
                  .take(1)
                  .getRawOne();

                if (shiftHistoryET) {
                  // Means we need to use created_at and created_by of shiftHistoryET object
                  shiftChanges.push({
                    what: 'End Time',
                    requested: shift.end_time,
                    original: originalShift?.end_time,
                    changeAt: shiftHistoryET.shift_history_created_at,
                    changeBy:
                      shiftHistoryET.user_first_name +
                      ' ' +
                      shiftHistoryET.user_last_name,
                  });
                } else {
                  // Otherwise we need to use created_at and created_by of shift object
                  shiftChanges.push({
                    what: 'End Time',
                    requested: shift.end_time,
                    original: originalShift?.end_time,
                    changeAt: shift.created_at,
                    changeBy:
                      shift.created_by.first_name +
                      ' ' +
                      shift.created_by.last_name,
                  });
                }
              }
            }
          }

          // Vehicle increase/descrease

          // TO = Get current count of main table
          const toVehicle = await this.shiftVehiclesRepository.count({
            where: {
              shift_id: shift.id,
            },
          });

          // FROM = Get Main table count where created_at < latestCreatedAt + Get History table count where created_at > latestCreatedAt
          const mainTableCountVehicle =
            await this.shiftVehiclesRepository.count({
              where: {
                shift_id: shift.id,
                created_at: LessThan(latestCreatedAt),
              },
            });

          const hisotryTableCountVehicle =
            await this.shiftVehiclesHistoryRepository
              .createQueryBuilder('shiftVehiclesHistory')
              .select(
                'COUNT(DISTINCT shiftVehiclesHistory.vehicle_id)',
                'count'
              )
              .where('shiftVehiclesHistory.shift_id = :id', { id: shift.id })
              .andWhere('shiftVehiclesHistory.created_at > :latestCreatedAt', {
                latestCreatedAt,
              })
              .getRawOne();

          const fromVehicle =
            mainTableCountVehicle + +hisotryTableCountVehicle.count;

          if (fromVehicle !== toVehicle) {
            // Calculate blame
            flagChanges.vehicles = true;
            flagChanges.flagged = true;

            if (!getFlaggedOperationsOnly) {
              const shiftVehicleHistory =
                await this.shiftVehiclesHistoryRepository
                  .createQueryBuilder('svh')
                  .leftJoinAndSelect('user', 'user', 'svh.created_by = user.id')
                  .where(`svh.shift_id = ${shift.id}`)
                  .select()
                  .orderBy('svh.rowkey', 'DESC')
                  .take(1)
                  .getRawOne();

              const shiftVehicle = await this.shiftVehiclesRepository.findOne({
                where: {
                  shift_id: shift.id,
                },
                order: {
                  created_at: 'DESC',
                },
                relations: ['created_by'],
              });

              if (
                !shiftVehicleHistory || shiftVehicle?.created_at > shiftVehicleHistory?.svh_created_at
              ) {
                // Means we need to use created_at and created_by of shiftVehicle object
                shiftChanges.push({
                  what: 'Vehicle',
                  requested: toVehicle,
                  original: fromVehicle,
                  changeAt: shiftVehicle.created_at,
                  changeBy:
                    shiftVehicle.created_by.first_name +
                    ' ' +
                    shiftVehicle.created_by.last_name,
                });
              } else {
                // Means we need to use created_at and created_by of shiftVehicleHistory object
                shiftChanges.push({
                  what: 'Vehicle',
                  requested: toVehicle,
                  original: fromVehicle,
                  changeAt: shiftVehicleHistory.svh_created_at,
                  changeBy:
                    shiftVehicleHistory.user_first_name +
                    ' ' +
                    shiftVehicleHistory.user_last_name,
                });
              }
            }
          }

          // Device increase/descrease
          // TO = Get current count of main table
          const toDevice = await this.shiftDevicesRepository.count({
            where: {
              shift_id: shift.id,
            },
          });

          // FROM = Get Main table count where created_at < latestCreatedAt + Get History table count where created_at > latestCreatedAt
          const mainTableCountDevice = await this.shiftDevicesRepository.count({
            where: {
              shift_id: shift.id,
              created_at: LessThan(latestCreatedAt),
            },
          });

          const hisotryTableCountDevice =
            await this.shiftDevicesHistoryRepository
              .createQueryBuilder('shiftDevicesHistory')
              .select('COUNT(DISTINCT shiftDevicesHistory.device_id)', 'count')
              .where('shiftDevicesHistory.shift_id = :id', { id: shift.id })
              .andWhere('shiftDevicesHistory.created_at > :latestCreatedAt', {
                latestCreatedAt,
              })
              .getRawOne();

          const fromDevice =
            mainTableCountDevice + +hisotryTableCountDevice.count;

          if (fromDevice !== toDevice) {
            // Calculate blame
            flagChanges.devices = true;
            flagChanges.flagged = true;

            if (!getFlaggedOperationsOnly) {
              const shiftDeviceHistory =
                await this.shiftDevicesHistoryRepository
                  .createQueryBuilder('sdh')
                  .leftJoinAndSelect('user', 'user', 'sdh.created_by = user.id')
                  .where(`sdh.shift_id = ${shift.id}`)
                  .select()
                  .orderBy('sdh.rowkey', 'DESC')
                  .take(1)
                  .getRawOne();

              const shiftDevice = await this.shiftDevicesRepository.findOne({
                where: {
                  shift_id: shift.id,
                },
                order: {
                  created_at: 'DESC',
                },
                relations: ['created_by'],
              });

              if (
                !shiftDeviceHistory || shiftDevice?.created_at > shiftDeviceHistory?.sdh_created_at
              ) {
                // Means we need to use created_at and created_by of shiftDevice object
                shiftChanges.push({
                  what: 'Device',
                  requested: toDevice,
                  original: fromDevice,
                  changeAt: shiftDevice.created_at,
                  changeBy:
                    shiftDevice.created_by.first_name +
                    ' ' +
                    shiftDevice.created_by.last_name,
                });
              } else {
                // Means we need to use created_at and created_by of shiftDeviceHistory object
                shiftChanges.push({
                  what: 'Device',
                  requested: toDevice,
                  original: fromDevice,
                  changeAt: shiftDeviceHistory.sdh_created_at,
                  changeBy:
                    shiftDeviceHistory.user_first_name +
                    ' ' +
                    shiftDeviceHistory.user_last_name,
                });
              }
            }
          }

          // Staff-setup per role increase/descrease
          let fromCounts, toCounts;
          if(operation_type === PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS) {
            // Query 'from' counts from the main table
            const fromCountsMain = await this.entityManager
              .createQueryBuilder()
              .select("cr.name", "role")
              .addSelect("cr.id", "role_id")
              .addSelect("DATE(s.created_at)", "at")
              .addSelect("MIN(s.created_at)", "changeAt")
              .addSelect("s.created_by", "by")
              .addSelect("SUM(s.quantity)", "count")
              .from("shifts_roles", "s")
              .innerJoin("contacts_roles", "cr", "s.role_id = cr.id")
              .where("s.shift_id = :shiftId", { shiftId: shift.id })
              .andWhere("s.created_at < :latestCreatedAt", { latestCreatedAt })
              .groupBy("cr.id")
              .addGroupBy("DATE(s.created_at)")
              .addGroupBy("s.created_by")
              .getRawMany();

            // Query 'from' counts from the history table
            const fromCountsHistory = await this.entityManager
              .createQueryBuilder()
              .select("cr.name", "role")
              .addSelect("cr.id", "role_id")
              .addSelect("DATE(sh.created_at)", "at")
              .addSelect("MIN(sh.created_at)", "changeAt")
              .addSelect("sh.created_by", "by")
              .addSelect("SUM(sh.quantity)", "count")
              .from("shifts_roles_history", "sh")
              .innerJoin("contacts_roles", "cr", "sh.role_id = cr.id")
              .where("sh.shift_id = :shiftId", { shiftId: shift.id })
              .andWhere("sh.created_at > :latestCreatedAt", { latestCreatedAt })
              .groupBy("cr.id")
              .addGroupBy("DATE(sh.created_at)")
              .addGroupBy("sh.created_by")
              .getRawMany();

            // Combine 'from' counts from both main and history tables
            fromCounts = [...fromCountsMain, ...fromCountsHistory];

            // Query 'to' counts from the main table
            toCounts = await this.entityManager
              .createQueryBuilder()
              .select("cr.name", "role")
              .addSelect("cr.id", "role_id")
              .addSelect("DATE(s.created_at)", "at")
              .addSelect("MAX(s.created_at)", "changeAt")
              .addSelect("s.created_by", "by")
              .addSelect("SUM(s.quantity)", "count")
              .from("shifts_roles", "s")
              .innerJoin("contacts_roles", "cr", "s.role_id = cr.id")
              .where("s.shift_id = :shiftId", { shiftId: shift.id })
              .groupBy("cr.id")
              .addGroupBy("DATE(s.created_at)")
              .addGroupBy("s.created_by")
              .getRawMany();
          } else {
            // Query 'from' counts from the main table
            const fromCountsMain = await this.entityManager
              .createQueryBuilder()
              .select("cr.name", "role")
              .addSelect("cr.id", "role_id")
              .addSelect("DATE(s.created_at)", "at")
              .addSelect("MIN(s.created_at)", "changeAt")
              .addSelect("s.created_by", "by")
              .addSelect("SUM(sc.qty)", "count")
              .from("shifts_projections_staff", "s")
              .innerJoin("staff_config", "sc", "s.staff_setup_id = sc.staff_setup_id")
              .innerJoin("contacts_roles", "cr", "sc.contact_role_id = cr.id")
              .where("s.shift_id = :shiftId", { shiftId: shift.id })
              .andWhere("s.created_at < :latestCreatedAt", { latestCreatedAt })
              .groupBy("cr.id")
              .addGroupBy("DATE(s.created_at)")
              .addGroupBy("s.created_by")
              .getRawMany();
  
            // Query 'from' counts from the history table
            const fromCountsHistory = await this.entityManager
              .createQueryBuilder()
              .select("cr.name", "role")
              .addSelect("cr.id", "role_id")
              .addSelect("DATE(sh.created_at)", "at")
              .addSelect("MIN(sh.created_at)", "changeAt")
              .addSelect("sh.created_by", "by")
              .addSelect("SUM(sc.qty)", "count")
              .from("shifts_projections_staff_history", "sh")
              .innerJoin("staff_config", "sc", "sh.staff_setup_id = sc.staff_setup_id")
              .innerJoin("contacts_roles", "cr", "sc.contact_role_id = cr.id")
              .where("sh.shift_id = :shiftId", { shiftId: shift.id })
              .andWhere("sh.created_at > :latestCreatedAt", { latestCreatedAt })
              .groupBy("cr.id")
              .addGroupBy("DATE(sh.created_at)")
              .addGroupBy("sh.created_by")
              .getRawMany();
  
            // Combine 'from' counts from both main and history tables
            fromCounts = [...fromCountsMain, ...fromCountsHistory];
  
            // Query 'to' counts from the main table
            toCounts = await this.entityManager
              .createQueryBuilder()
              .select("cr.name", "role")
              .addSelect("cr.id", "role_id")
              .addSelect("DATE(s.created_at)", "at")
              .addSelect("MAX(s.created_at)", "changeAt")
              .addSelect("s.created_by", "by")
              .addSelect("SUM(sc.qty)", "count")
              .from("shifts_projections_staff", "s")
              .innerJoin("staff_config", "sc", "s.staff_setup_id = sc.staff_setup_id")
              .innerJoin("contacts_roles", "cr", "sc.contact_role_id = cr.id")
              .where("s.shift_id = :shiftId", { shiftId: shift.id })
              .groupBy("cr.id")
              .addGroupBy("DATE(s.created_at)")
              .addGroupBy("s.created_by")
              .getRawMany();
          }

          
          // Utility function to create a unique key for combining counts
          const createKey = ({ role_id, role, at, by }) => `${role_id}-${role}-${at}-${by}`;

          // Prepare maps for efficient lookup and aggregation
          const fromCountsMap = new Map();
          const toCountsMap = new Map();

          // Populate 'fromCountsMap' with data from both main and history 'from' counts
          fromCounts.forEach(({ role, role_id, at, by, count }) => {
            const key = createKey({ role_id, role, at, by });
            const existingCount = fromCountsMap.get(key) || 0;
            fromCountsMap.set(key, existingCount + parseInt(count, 10));
          });

          // Populate 'toCountsMap' with 'to' counts
          toCounts.forEach(({ role, role_id, at, by, count }) => {
            const key = createKey({ role_id, role, at, by });
            toCountsMap.set(key, parseInt(count, 10));
          });

          // Combine 'from' and 'to' counts into 'combinedResults'
          const combinedResults = [];

          // First, iterate over 'fromCountsMap' to construct the base structure of the combined results
          fromCountsMap.forEach((fromCount, key) => {
            const [role_id, role, at, by] = key.split("-");
            const toCount = toCountsMap.get(key) || 0; // Default to 0 if no matching 'to' count

            // Find the specific 'time' associated with this key from either 'fromCounts' or 'toCounts'
            const changeAt = fromCounts.find(entry => createKey(entry) === key)?.changeAt ||
                              toCounts.find(entry => createKey(entry) === key)?.changeAt;

            combinedResults.push({
              role,
              role_id,
              from: fromCount,
              to: toCount,
              at,
              by,
              changeAt,
            });

            // Remove the entry from 'toCountsMap' to avoid duplication
            toCountsMap.delete(key);
          });

          // Add remaining entries from 'toCountsMap' that didn't have a corresponding 'from' count
          toCountsMap.forEach((toCount, key) => {
            const [role_id, role, at, by] = key.split("-");

            const changeAt = toCounts.find(entry => createKey(entry) === key)?.changeAt;

            combinedResults.push({
              role,
              role_id,
              from: 0, // No 'from' count exists for these entries
              to: toCount,
              at,
              by,
              changeAt,
            });
          });
          
          // Initialize a map to hold the net count for each role
          const netCountPerRole = new Map();

          // Iterate over the combined results to calculate net counts
          combinedResults.forEach(({ role_id, from, to }) => {
            // Get the current net count for the role, defaulting to 0 if not yet present
            const currentNetCount = netCountPerRole.get(role_id) || 0;
            
            // Calculate the new net count by adding the difference of 'to' and 'from' to the current net count
            const newNetCount = currentNetCount + (to - from);
            
            // Update the map with the new net count for the role
            netCountPerRole.set(role_id, newNetCount);
          });

          combinedResults.forEach(async ({ role, role_id, from, to, at, by, changeAt }) => {
            // If the net count for the role is non-zero, add it to the changes
            const netDifference = netCountPerRole.get(role_id);
            if (netDifference !== 0) {
              flagChanges.staffs = true;
              flagChanges.flagged = true;

              if(!getFlaggedOperationsOnly) {
                const user = await this.userRepository.findOne({
                  where: {
                    id: by,
                  }
                });
                shiftChanges.push({
                  what: role,
                  role,
                  requested: to,
                  original: from,
                  changeAt,
                  changeBy: user.first_name + ' ' + user.last_name,
                });
              }
            }
          });

          netCountPerRole.forEach((difference, role_id) => {
            if (difference !== 0) {
              shiftChanges.push({
                what: 'Net Staff Setup',
                role_id,
                difference
              });
            }
          });

          flagChanges.changes.push({
            header: 'Shift ' + (index + 1),
            shift_id: shift.id,
            rows: shiftChanges,
          });
        })
      );

      const scheduleOperation = await this.scheduleOperationRepository.findOne({
        where: {
          operation_id,
          operation_type,
        }
      });

      flagChanges['inSync'] = scheduleOperation?.in_sync;

      return flagChanges;
    } catch (error) {
      if (getFlaggedOperationsOnly) {
        throw error;
      } else {
        return resError(error.message, ErrorConstants.Error, error.status);
      }
    }
  }

  async addDeviceAssignment(
    addDeviceAssignmentParams: AddDeviceAssignmentParamsDto,
    userId: User
  ) {
    if (!addDeviceAssignmentParams) {
      throw new Error('Invalid Device Assignment Data.');
    }
    const user = await this.commonFunction.entityExist(
      this.userRepository,
      { where: { id: userId } },
      'User'
    );
    addDeviceAssignmentParams.created_by = user;

    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const deviceAssignment = addDeviceAssignmentParams.is_published
        ? new DeviceAssignmentsDrafts()
        : new DeviceAssignments();

      if (addDeviceAssignmentParams.is_published) {
        addDeviceAssignmentParams.reason = 'C';
      }

      Object.assign(deviceAssignment, addDeviceAssignmentParams);
      const newDeviceAssignment = addDeviceAssignmentParams.is_published
        ? this.deviceAssignmentsDraftsRepository.create(deviceAssignment)
        : this.deviceAssignmentsRepository.create(deviceAssignment);

      const deviceAssignmentData = addDeviceAssignmentParams.is_published
        ? await this.deviceAssignmentsDraftsRepository.save(newDeviceAssignment)
        : await this.deviceAssignmentsRepository.save(newDeviceAssignment);

      await queryRunner.commitTransaction();

      return resSuccess(
        `Device Assignment created successfully.`,
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        deviceAssignmentData,
        1
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(
        error?.message || `Failed to create device assignment: ${error}`,
        'failed',
        HttpStatus.PRECONDITION_FAILED
      );
    } finally {
      await queryRunner.release();
    }
  }

  async addVehicleAssignment(
    addVehicleAssignmentParams: AddVehicleAssignmentParamsDto,
    userId: User
  ) {
    if (!addVehicleAssignmentParams) {
      throw new Error('Invalid Vehicle Assignment Data.');
    }
    const user = await this.commonFunction.entityExist(
      this.userRepository,
      { where: { id: userId } },
      'User'
    );
    addVehicleAssignmentParams.created_by = user;

    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const vehicleAssignment = addVehicleAssignmentParams.is_published
        ? new VehiclesAssignmentsDrafts()
        : new VehiclesAssignments();

      if (addVehicleAssignmentParams.is_published) {
        addVehicleAssignmentParams.reason = 'C';
      }

      Object.assign(vehicleAssignment, addVehicleAssignmentParams);
      const newVehicleAssignment = addVehicleAssignmentParams.is_published
        ? this.vehiclesAssignmentsDraftsRepository.create(vehicleAssignment)
        : this.vehiclesAssignmentsRepository.create(vehicleAssignment);

      const deviceAssignmentData = addVehicleAssignmentParams.is_published
        ? await this.vehiclesAssignmentsDraftsRepository.save(
            newVehicleAssignment
          )
        : await this.vehiclesAssignmentsRepository.save(newVehicleAssignment);

      await queryRunner.commitTransaction();

      return resSuccess(
        `Vehicle Assignment created successfully.`,
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        deviceAssignmentData,
        1
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(
        error?.message || `Failed to create vehicle assignment: ${error}`,
        'failed',
        HttpStatus.PRECONDITION_FAILED
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Send notifications to all the affected staff members within operations
   * @param notifyAll is true means an operation is just published and we need to notify all staffs
   */
  async notifyStaff(notifyStaffDto: NotifyStaffDto, notifyAll = false) {
    const tenantId = this.request?.user?.tenant?.id;
    // Confirm if schedule is published
    const schedule = await this.scheduleRepository.findOne({
      where: {
        id: +notifyStaffDto.schedule_id,
        is_archived: false,
        tenant_id: tenantId,
      },
    });

    if (!schedule) {
      throw new Error('Schedule does not exists!');
    } else if (schedule.schedule_status === ScheduleStatusEnum.Draft) {
      throw new Error(
        'Not able to notify staff while schedule is in status Draft!'
      );
    }
    const content = notifyStaffDto.content.replace(
      '{Schedule Start Date}',
      schedule.start_date.toISOString().split('T')[0]
    );

    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      // Send notification for affected staff members
      await Promise.all(
        notifyStaffDto.operations.map(async (operation) => {
          // Get all shifts for the given operation
          const shifts = await this.shiftsRepository.find({
            where: {
              shiftable_id: operation.operation_id,
              shiftable_type: operation.operation_type,
              is_archived: false,
              tenant_id: tenantId,
            },
          });

          await Promise.all(
            shifts.map(async (shift: any) => {
              if (notifyAll) {
                // Means schedule is published first time and we only need to notify staffs only
                const staffAssignemnts =
                  await this.staffAssignmentsRepository.find({
                    where: {
                      shift_id: { id: shift.id },
                      tenant_id: tenantId,
                    },
                    relations: ['staff_id'],
                  });

                await Promise.all(
                  staffAssignemnts?.map(async (staffAssignemnt) => {
                    await this.sendNotification(
                      staffAssignemnt.staff_id.id,
                      notifyStaffDto.subject,
                      content,
                      schedule.id
                    );
                  })
                );
              } else {
                const staffAssignmentDrafts =
                  await this.staffAssignmentsDraftsRepository.find({
                    where: {
                      shift_id: { id: shift.id },
                      is_notify: false,
                      is_archived: false,
                      tenant_id: tenantId,
                    },
                    relations: [
                      'staff_id',
                      'staff_assignment_id',
                      'role_id',
                      'shift_id',
                    ],
                  });

                const syncedStaffAssignments: Map<bigint, any[]> = new Map(); // staffAssignmentId, staffAssignmentDraft[] (drafts are sorted by created_at)
                const freshStaffAssignments: Map<bigint, any[]> = new Map(); // roleId, staffAssignmentDraft[] (drafts are sorted by created_at)

                // Notify
                await Promise.all(
                  staffAssignmentDrafts?.map(async (staffAssignmentDraft) => {
                    // TODO: Cater reassign
                    await this.sendNotification(
                      staffAssignmentDraft.staff_id.id,
                      notifyStaffDto.subject,
                      content,
                      schedule.id
                    );

                    if (staffAssignmentDraft.staff_assignment_id) {
                      if (
                        !syncedStaffAssignments.has(
                          staffAssignmentDraft.staff_assignment_id.id
                        )
                      ) {
                        syncedStaffAssignments.set(
                          staffAssignmentDraft.staff_assignment_id.id,
                          []
                        );
                      }
                      syncedStaffAssignments
                        .get(staffAssignmentDraft.staff_assignment_id.id)!
                        .push(staffAssignmentDraft);
                    } else {
                      if (
                        !freshStaffAssignments.has(
                          staffAssignmentDraft.role_id?.id
                        )
                      ) {
                        freshStaffAssignments.set(
                          staffAssignmentDraft.role_id?.id,
                          []
                        );
                      }
                      freshStaffAssignments
                        .get(staffAssignmentDraft.role_id?.id)!
                        .push(staffAssignmentDraft);
                    }
                  })
                );

                // Sync
                syncedStaffAssignments.forEach((arr, key) => {
                  arr.sort(
                    (a, b) => b.created_at.getTime() - a.created_at.getTime()
                  );
                });
                freshStaffAssignments.forEach((arr, key) => {
                  arr.sort(
                    (a, b) => b.created_at.getTime() - a.created_at.getTime()
                  );
                });

                for (const [key, arr] of freshStaffAssignments.entries()) {
                  if (arr && arr[0].reason === 'C') {
                    const staffAssignment: StaffAssignments =
                      new StaffAssignments();
                    Object.assign(staffAssignment, arr[0]);
                    staffAssignment.created_at = new Date();
                    staffAssignment.created_by = this.request?.user;
                    staffAssignment.tenant_id = tenantId;
                    const dbStaffAssignment =
                      await this.staffAssignmentsRepository.save(
                        staffAssignment
                      );
                    arr[0].staff_assignment_id = dbStaffAssignment;
                    await this.staffAssignmentsDraftsRepository.save(arr[0]);
                  }
                }

                for (const [key, arr] of syncedStaffAssignments.entries()) {
                  if (arr[0]?.reason === 'C') {
                    const staffAssignment: StaffAssignments =
                      new StaffAssignments();
                    Object.assign(staffAssignment, arr[0].staff_assignment_id);
                    staffAssignment.created_at = new Date();
                    staffAssignment.created_by = this.request?.user;
                    staffAssignment.tenant_id = tenantId;
                    await this.staffAssignmentsRepository.save(staffAssignment);
                  } else if (arr[0]?.reason === 'U') {
                    await this.staffAssignmentsDraftsRepository
                      .createQueryBuilder()
                      .delete()
                      .where('id = :id', { id: arr[0].id })
                      .andWhere('tenant_id = :tenant_id', {tenant_id: tenantId})
                      .execute();
                    if (arr[0].staff_assignment_id) {
                      await this.staffAssignmentsRepository
                        .createQueryBuilder()
                        .delete()
                        .where('id = :id', {
                          id: arr[0].staff_assignment_id.id,
                        })
                        .andWhere('tenant_id = :tenant_id', {tenant_id: tenantId})
                        .execute();
                    }
                  }
                }

                await this.staffAssignmentsDraftsRepository.update(
                  { 
                    shift_id: { id: shift.id },
                    tenant_id: tenantId,
                  },
                  {
                    is_notify: true,
                  }
                );

                const deviceAssignmentDrafts =
                  await this.deviceAssignmentsDraftsRepository.find({
                    where: {
                      shift_id: shift.id,
                      is_notify: false,
                      tenant_id: tenantId,
                    },
                  });

                const syncedDeviceAssignments: Map<bigint, any[]> = new Map(); // deviceAssignmentId, deviceAssignmentDraft[] (drafts are sorted by created_at)
                const freshDeviceAssignments: any[] = []; // deviceAssignmentDraft[]

                deviceAssignmentDrafts?.forEach((deviceAssignmentDraft) => {
                  if (deviceAssignmentDraft.devices_assignment_id) {
                    if (
                      !syncedDeviceAssignments.has(
                        deviceAssignmentDraft.devices_assignment_id
                      )
                    ) {
                      syncedDeviceAssignments.set(
                        deviceAssignmentDraft.devices_assignment_id,
                        []
                      );
                    }
                    syncedDeviceAssignments
                      .get(deviceAssignmentDraft.devices_assignment_id)!
                      .push(deviceAssignmentDraft);
                  } else {
                    freshDeviceAssignments.push(deviceAssignmentDraft);
                  }
                });

                syncedDeviceAssignments.forEach((arr, key) => {
                  arr.sort(
                    (a, b) => b.created_at.getTime() - a.created_at.getTime()
                  );
                });

                for (const val of freshDeviceAssignments) {
                  if (val.reason === 'C') {
                    const deviceAssignment: DeviceAssignments =
                      new DeviceAssignments();
                    Object.assign(deviceAssignment, val);
                    deviceAssignment.created_by = this.request?.user;
                    deviceAssignment.tenant_id = tenantId;
                    const dbDeviceAssignment =
                      await this.deviceAssignmentsRepository.save(
                        deviceAssignment
                      );
                    val.devices_assignment_id = dbDeviceAssignment.id;
                    await this.deviceAssignmentsDraftsRepository.save(val);
                  }
                }

                for (const [key, arr] of syncedDeviceAssignments.entries()) {
                  if (arr[0]?.reason === 'C') {
                    const deviceAssignment: DeviceAssignments =
                      await this.deviceAssignmentsRepository.findOne({
                        where: {
                          id: arr[0].devices_assignment_id,
                          tenant_id: tenantId,
                        },
                      });
                    Object.assign(deviceAssignment, arr[0].staff_assignment_id);
                    deviceAssignment.id = arr[0].devices_assignment_id;
                    deviceAssignment.created_by = this.request?.user;
                    deviceAssignment.tenant_id = tenantId;
                    await this.deviceAssignmentsRepository.save(
                      deviceAssignment
                    );
                  } else if (arr[0]?.reason === 'U') {
                    await this.deviceAssignmentsDraftsRepository
                      .createQueryBuilder()
                      .delete()
                      .where(`id = ${arr[0].id}`)
                      .andWhere('tenant_id = :tenant_id', {tenant_id: tenantId})
                      .execute();
                    if (arr[0].devices_assignment_id) {
                      await this.deviceAssignmentsRepository
                        .createQueryBuilder()
                        .delete()
                        .where(`id = ${arr[0].devices_assignment_id.id}`)
                        .andWhere('tenant_id = :tenant_id', {tenant_id: tenantId})
                        .execute();
                    }
                  }
                }

                await this.deviceAssignmentsDraftsRepository.update(
                  { 
                    shift_id: shift.id,
                    tenant_id: tenantId,
                  },
                  {
                    is_notify: true,
                  }
                );

                const vehicleAssignmentDrafts =
                  await this.vehiclesAssignmentsDraftsRepository.find({
                    where: {
                      shift_id: shift.id,
                      is_notify: false,
                      tenant_id: tenantId,
                    },
                  });

                const syncedVehicleAssignments: Map<bigint, any[]> = new Map(); // vehicleAssignmentId, vehicleAssignmentDraft[] (drafts are sorted by created_at)
                const freshVehicleAssignments: any[] = []; // vehicleAssignmentDraft[]

                vehicleAssignmentDrafts?.forEach((vehicleAssignmentDraft) => {
                  if (vehicleAssignmentDraft.vehicle_assignment_id) {
                    if (
                      !syncedVehicleAssignments.has(
                        vehicleAssignmentDraft.vehicle_assignment_id
                      )
                    ) {
                      syncedVehicleAssignments.set(
                        vehicleAssignmentDraft.vehicle_assignment_id,
                        []
                      );
                    }
                    syncedVehicleAssignments
                      .get(vehicleAssignmentDraft.vehicle_assignment_id)!
                      .push(vehicleAssignmentDraft);
                  } else {
                    freshVehicleAssignments.push(vehicleAssignmentDraft);
                  }
                });

                syncedVehicleAssignments.forEach((arr, key) => {
                  arr.sort(
                    (a, b) => b.created_at.getTime() - a.created_at.getTime()
                  );
                });

                for (const val of freshVehicleAssignments) {
                  if (val.reason === 'C') {
                    const vehicleAssignment: VehiclesAssignments =
                      new VehiclesAssignments();
                    Object.assign(vehicleAssignment, val);
                    vehicleAssignment.created_by = this.request?.user;
                    vehicleAssignment.tenant_id = tenantId;
                    const dbVehicleAssignment =
                      await this.vehiclesAssignmentsRepository.save(
                        vehicleAssignment
                      );
                    val.vehicle_assignment_id = dbVehicleAssignment.id;
                    await this.vehiclesAssignmentsDraftsRepository.save(val);
                  }
                }

                for (const [key, arr] of syncedVehicleAssignments.entries()) {
                  if (arr[0]?.reason === 'C') {
                    const vehicleAssignment: VehiclesAssignments =
                      await this.vehiclesAssignmentsRepository.findOne({
                        where: {
                          id: arr[0].vehicle_assignment_id,
                          tenant_id: tenantId,
                        },
                      });
                    Object.assign(
                      vehicleAssignment,
                      arr[0].staff_assignment_id
                    );
                    vehicleAssignment.id = arr[0].vehicle_assignment_id;
                    vehicleAssignment.created_by = this.request?.user;
                    vehicleAssignment.tenant_id = tenantId;
                    await this.vehiclesAssignmentsRepository.save(
                      vehicleAssignment
                    );
                  } else if (arr[0]?.reason === 'U') {
                    await this.vehiclesAssignmentsDraftsRepository
                      .createQueryBuilder()
                      .delete()
                      .where(`id = ${arr[0].id}`)
                      .andWhere('tenant_id = :tenant_id', {tenant_id: tenantId})
                      .execute();
                    if (arr[0].vehicle_assignment_id) {
                      await this.vehiclesAssignmentsRepository
                        .createQueryBuilder()
                        .delete()
                        .where(`id = ${arr[0].vehicle_assignment_id.id}`)
                        .andWhere('tenant_id = :tenant_id', {tenant_id: tenantId})
                        .execute();
                    }
                  }
                }

                await this.vehiclesAssignmentsDraftsRepository.update(
                  { 
                    shift_id: shift.id,
                    tenant_id: tenantId, 
                  },
                  {
                    is_notify: true,
                  }
                );
              }
            })
          );
        })
      );

      await queryRunner.commitTransaction();

      return resSuccess(
        `Staffs notified.`,
        SuccessConstants.SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(
        error?.message || `Failed to notify staff: ${error}`,
        'failed',
        HttpStatus.PRECONDITION_FAILED
      );
    } finally {
      await queryRunner.release();
    }
  }

  async sendNotification(
    staffId: any,
    subject: string,
    content: string,
    scheduleId: any
  ) {
    let notification: Notifications = new Notifications();
    notification.content = content;
    notification.created_by = this?.request?.user;
    notification.tenant_id = this?.request?.user?.tenant?.id;
    notification.schedule_id = scheduleId;
    notification.subject = subject;

    notification = await this.notificationsRepository.save(notification);

    const notificationsStaff: NotificationsStaff = new NotificationsStaff();
    notificationsStaff.created_by = this?.request?.user;
    notificationsStaff.notification_id = notification.id;
    notificationsStaff.staff_id = staffId;
    notificationsStaff.tenant_id = this?.request?.user?.tenant?.id;

    return await this.notificationsStaffRepository.save(notificationsStaff);
  }

  async synchronizeOperation(operation_id: bigint, operation_type: string) {
    let pendingAssignments: boolean = false;
    try {
      // Get flag operations
      const flaggedValue: any = await this.flagOperationAndGetChangeSummaryData(operation_id, operation_type, false);

      // Get all shifts
      const shifts = await this.shiftsRepository.find({
        where: {
          shiftable_id: operation_id,
          shiftable_type: operation_type,
          is_archived: false
        }
      });

      // Check if location type changed
      if (flaggedValue.locationType) {
        // Unassign vehicles
        this.unassignAllVehicles(shifts);
      }
      
      // Check if operation status or date changed
      if(flaggedValue.operationStatus || flaggedValue.operationDate) {
        // Unassign vehicles
        await this.unassignAllVehicles(shifts);
        // Unassign devices
        await this.unassignAllDevices(shifts);

        // Count all staff assignments and drafts
        const staffAssignmentsCount = await this.staffAssignmentsRepository.count({
          where: {
            shift_id: In(shifts.map(shift => shift.id))
          }
        });

        const staffAssignmentsDraftsCount = await this.staffAssignmentsDraftsRepository.count({
          where: {
            shift_id: In(shifts.map(shift => shift.id))
          }
        });

        if(staffAssignmentsCount + staffAssignmentsDraftsCount > 0) {
          pendingAssignments = true;
          // Set schedule operation status to pending
          await this.scheduleOperationRepository
            .createQueryBuilder('schedule_operation')
            .update()
            .set({
              pending_assignment: true
            })
            .where(
              'schedule_operation.operation_id = :operation_id AND schedule_operation.operation_type = :operation_type',
              {
                operation_id: operation_id,
                operation_type: operation_type
              }
            )
            .execute();

          // Set Staff assignments to pending
          await Promise.all(shifts.map(async (shift) => {
            await this.staffAssignmentsRepository
              .createQueryBuilder('staff_assignments')
              .update()
              .set({
                pending_assignment: true
              })
              .where(
                'staff_assignments.shift_id = :shift_id',
                {
                  shift_id: shift.id,
                }
              )
              .execute();
            await this.staffAssignmentsDraftsRepository
              .createQueryBuilder()
              .update()
              .set({
                pending_assignment: true
              })
              .where(
                'shift_id = :shift_id',
                {
                  shift_id: shift.id,
                }
              )
              .execute();
          }));
        }
      }

      await Promise.all(shifts.map(async (shift) => {
        for(const change of flaggedValue.changes) {
          if(change.header.includes('Shift') && change.shift_id === shift.id) {
            await Promise.all(change.rows?.map((async (shiftChange) => {
              const what = shiftChange.what;
              const requested = shiftChange.requested;
              const original = shiftChange.original;
              const difference = requested - original;
  
              // Check if start time changed
  
              // Check if end time changed
  
              // Check if vehicle count changed
              if(what === 'Vehicle' && difference < 0) {
                // Means vehicle decrease
                // Get all vehicle assignments
                const vehicleAssignments = await this.vehiclesAssignmentsRepository.find({
                  where: {
                    shift_id: shift.id
                  }
                });
  
                // Get all vehicle assignments drafts
                const vehicleAssignmentsDrafts = await this.vehiclesAssignmentsDraftsRepository.find({
                  where: {
                    shift_id: shift.id
                  }
                });
  
                let countPendingAssignments = 0;
                await Promise.all(vehicleAssignments.map(async (vehicleAssignment) => {
                  if(countPendingAssignments < difference) {
                    vehicleAssignment.pending_assignment = true;
                    await this.vehiclesAssignmentsRepository.save(vehicleAssignment);
                    countPendingAssignments++;
                  }
                }));
  
                if(countPendingAssignments < difference) {
                  await Promise.all(vehicleAssignmentsDrafts.map(async (vehicleAssignmentDraft) => {
                    if(countPendingAssignments < difference && vehicleAssignmentDraft.reason === 'C') {
                      vehicleAssignmentDraft.pending_assignment = true;
                      await this.vehiclesAssignmentsDraftsRepository.save(vehicleAssignmentDraft);
                      if(!vehicleAssignmentDraft.vehicle_assignment_id) {
                        // Means that this draft is not synced with main table, that's why we treat it as a seperate vehicle assignment
                        countPendingAssignments++;
                      }
                    }
                  }));
                }
  
                if(countPendingAssignments > 0) {
                  pendingAssignments = true;
                  // Set schedule operation status to pending
                  await this.scheduleOperationRepository
                    .createQueryBuilder('schedule_operation')
                    .update()
                    .set({
                      pending_assignment: true
                    })
                    .where(
                      'schedule_operation.operation_id = :operation_id AND schedule_operation.operation_type = :operation_type',
                      {
                        operation_id: operation_id,
                        operation_type: operation_type
                      }
                    )
                    .execute();
                }
              }
  
              // Check if device count changed
              if(what === 'Device' && difference < 0) {
                // Means device decrease
                // Get all device assignments
                const deviceAssignments = await this.deviceAssignmentsRepository.find({
                  where: {
                    shift_id: shift.id
                  }
                });
  
                // Get all device assignments drafts
                const deviceAssignmentsDrafts = await this.deviceAssignmentsDraftsRepository.find({
                  where: {
                    shift_id: shift.id
                  }
                });
  
                let countPendingAssignments = 0;
                await Promise.all(deviceAssignments.map(async (deviceAssignment) => {
                  if(countPendingAssignments < difference) {
                    deviceAssignment.pending_assignment = true;
                    await this.deviceAssignmentsRepository.save(deviceAssignment);
                    countPendingAssignments++;
                  }
                }));
  
                if(countPendingAssignments < difference) {
                  await Promise.all(deviceAssignmentsDrafts.map(async (deviceAssignmentDraft) => {
                    if(countPendingAssignments < difference && deviceAssignmentDraft.reason === 'C') {
                      deviceAssignmentDraft.pending_assignment = true;
                      await this.deviceAssignmentsDraftsRepository.save(deviceAssignmentDraft);
                      if(!deviceAssignmentDraft.devices_assignment_id) {
                        // Means that this draft is not synced with main table, that's why we treat it as a seperate device assignment
                        countPendingAssignments++;
                      }
                    }
                  }));
                }
  
                if(countPendingAssignments > 0) {
                  pendingAssignments = true;
                  // Set schedule operation status to pending
                  await this.scheduleOperationRepository
                    .createQueryBuilder('schedule_operation')
                    .update()
                    .set({
                      pending_assignment: true
                    })
                    .where(
                      'schedule_operation.operation_id = :operation_id AND schedule_operation.operation_type = :operation_type',
                      {
                        operation_id: operation_id,
                        operation_type: operation_type
                      }
                    )
                    .execute();
                }
              }
  
              // Check if staff count changed
              if(what === 'Net Staff Setup') {
                let roleId = shiftChange.role_id;
                let difference = shiftChange.difference;

                if(difference < 0) {
                  // Staff setup for roleId decrease
                  // Get all staff assignments
                  const staffAssignments = await this.staffAssignmentsRepository.find({
                    where: {
                      shift_id: {id: shift.id},
                      role_id: {id: roleId}
                    }
                  });

                  // Get all staff assignments drafts
                  const staffAssignmentsDrafts = await this.staffAssignmentsDraftsRepository.find({
                    where: {
                      shift_id: {id: shift.id},
                      role_id: {id: roleId}
                    }
                  });

                  let countPendingAssignments = 0;
                  await Promise.all(staffAssignments.map(async (staffAssignment) => {
                    if(countPendingAssignments < difference) {
                      staffAssignment.pending_assignment = true;
                      await this.staffAssignmentsRepository.save(staffAssignment);
                      countPendingAssignments++;
                    }
                  }));

                  if(countPendingAssignments < difference) {
                    await Promise.all(staffAssignmentsDrafts.map(async (staffAssignmentDraft) => {
                      if(countPendingAssignments < difference && staffAssignmentDraft.reason === 'C') {
                        staffAssignmentDraft.pending_assignment = true;
                        await this.staffAssignmentsDraftsRepository.save(staffAssignmentDraft);
                        if(!staffAssignmentDraft.staff_assignment_id) {
                          // Means that this draft is not synced with main table, that's why we treat it as a seperate staff assignment
                          countPendingAssignments++;
                        }
                      }
                    }));
                  }

                  if(countPendingAssignments > 0) {
                    pendingAssignments = true;
                    // Set schedule operation status to pending
                    await this.scheduleOperationRepository
                      .createQueryBuilder('schedule_operation')
                      .update()
                      .set({
                        pending_assignment: true
                      })
                      .where(
                        'schedule_operation.operation_id = :operation_id AND schedule_operation.operation_type = :operation_type',
                        {
                          operation_id: operation_id,
                          operation_type: operation_type
                        }
                      )
                      .execute();
                  }                  
                }
              }
  
            })));
          } 
        }
      
      }));

      await this.scheduleOperationRepository
        .createQueryBuilder('schedule_operation')
        .update()
        .set({
          in_sync: true
        })
        .where(
          'schedule_operation.operation_id = :operation_id AND schedule_operation.operation_type = :operation_type',
          {
            operation_id: operation_id,
            operation_type: operation_type
          }
        )
        .execute();

      return pendingAssignments;
    } catch(error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
    
  }

  private async unassignAllVehicles(shifts: any) {
    // Unassign all vehicles
    await Promise.all(shifts.map(async (shift) => {
      await this.vehiclesAssignmentsRepository
        .createQueryBuilder('vehicles_assignments')
        .delete()
        .from('vehicles_assignments')
        .where(
          'vehicles_assignments.shift_id = :shift_id',
          {
            shift_id: shift.id,
          }
        )
        .execute();
      await this.vehiclesAssignmentsDraftsRepository
        .createQueryBuilder('vehicles_assignments_drafts')
        .delete()
        .from('vehicles_assignments_drafts')
        .where(
          'vehicles_assignments_drafts.shift_id = :shift_id',
          {
            shift_id: shift.id,
          }
        )
        .execute();
    }));
  }

  private async unassignAllDevices(shifts: any) {
    // Unassign all devices
    await Promise.all(shifts.map(async (shift) => {
      await this.deviceAssignmentsRepository
        .createQueryBuilder('devices_assignments')
        .delete()
        .from('devices_assignments')
        .where(
          'devices_assignments.shift_id = :shift_id',
          {
            shift_id: shift.id,
          }
        )
        .execute();
      
      await this.deviceAssignmentsDraftsRepository
        .createQueryBuilder('devices_assignments_drafts')
        .delete()
        .from('devices_assignments_drafts')
        .where(
          'devices_assignments_drafts.shift_id = :shift_id',
          {
            shift_id: shift.id,
          }
        )
        .execute();
    }));
  }
}
