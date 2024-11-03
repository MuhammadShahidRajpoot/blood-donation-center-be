import { HttpStatus, Injectable, Param, Query } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Schedule } from '../../entities/schedules.entity';
import {
  Between,
  Brackets,
  EntityManager,
  FindOperator,
  ILike,
  In,
  Like,
  Repository,
  getManager,
} from 'typeorm';
import { Drives } from 'src/api/operations-center/operations/drives/entities/drives.entity';
import { Sessions } from 'src/api/operations-center/operations/sessions/entities/sessions.entity';
import { NonCollectionEvents } from 'src/api/operations-center/operations/non-collection-events/entities/oc-non-collection-events.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { ShiftsProjectionsStaff } from 'src/api/shifts/entities/shifts-projections-staff.entity';
import { StaffConfig } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/StaffConfig.entity';
import { ShiftsRoles } from 'src/api/crm/crm-non-collection-profiles/blueprints/entities/shifts-roles.entity';
import { StaffSetup } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/entity/staffSetup.entity';
import { StaffAssignments } from 'src/api/crm/contacts/staff/staffSchedule/entity/self-assignment.entity';
import { ShiftsDevices } from 'src/api/shifts/entities/shifts-devices.entity';
import { ShiftsVehicles } from 'src/api/shifts/entities/shifts-vehicles.entity';
import { DeviceAssignments } from '../../entities/devices-assignment.entity';
import { VehiclesAssignments } from '../../entities/vehicles-assignment.entity';
import { ScheduleOperation } from '../../entities/schedule_operation.entity';
import { GetOperationsOptionalParamDto } from '../../dto/opeation-list-queryparams.dto';
import { UnAssignStaffParamDto } from '../../dto/unassign-staff-requestparams.dto';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { ReAssignStaffParamDto } from '../../dto/reassign-staff-requestparams.dto';
import { StaffRolesMapping } from 'src/api/crm/contacts/staff/staffRolesMapping/entities/staff-roles-mapping.entity';
import { Staff } from 'src/api/crm/contacts/staff/entities/staff.entity';
import { Directions } from 'src/api/crm/locations/directions/entities/direction.entity';
import { UpdateAssignStaffParamDto } from '../../dto/update-staffassigned.dto';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity.js';
import { STATUS_CODES } from 'http';
import { ContactsRoles } from 'src/api/system-configuration/tenants-administration/crm-administration/contacts/role/entities/contacts-role.entity';
import { DrivesCertifications } from 'src/api/operations-center/operations/drives/entities/drives-certifications.entity';
import { Certification } from 'src/api/system-configuration/tenants-administration/staffing-administration/certification/entity/certification.entity';
import { VehicleType } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicle-type/entities/vehicle-type.entity';
import { Vehicle } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle.entity';
import { UnAssignVehicleParamDto } from '../../dto/unassign-vehicle.dto';
import { Device } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device.entity';
import { DeviceType } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/device-type/entity/device-type.entity';
import { UnassignDeviceParamDto } from '../../dto/unassign-device.dto';
import { ScheduleOperationStatus } from '../../entities/schedule-operation-status.entity';
import { ReAssignVehicleParamDto } from '../../dto/reassign-vehicle-requestparams.dto';
import { UpdateAssignVehicleParamDto } from '../../dto/update-vehicleassigned.dto';
import { UpdateAssignDeviceParamDto } from '../../dto/update-device-assigned.dto';
import { StaffAssignmentsDrafts } from '../../entities/staff-assignments-drafts';
import { HomeBaseEnum } from '../../enums/home-base.enum';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { VehiclesAssignmentsDrafts } from '../../entities/vehicles-assignment-drafts.entity';
import { ShiftsSlots } from 'src/api/shifts/entities/shifts-slots.entity';
import { DeviceAssignmentsDrafts } from '../../entities/devices-assignment-drafts.entity';
import { UnassignOperationParamDto } from '../../dto/unassign-operation.dto';
import { assign } from 'lodash';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

@Injectable()
export class OperationListService {
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
    @InjectRepository(Shifts)
    private readonly shiftsRepository: Repository<Shifts>,
    @InjectRepository(ShiftsProjectionsStaff)
    private readonly shiftsProjectionsStaffRepository: Repository<ShiftsProjectionsStaff>,
    @InjectRepository(StaffConfig)
    private readonly staffConfigRepository: Repository<StaffConfig>,
    @InjectRepository(ShiftsRoles)
    private readonly shiftRolesRepository: Repository<ShiftsRoles>,
    @InjectRepository(StaffAssignments)
    private readonly staffAssignmentRepository: Repository<StaffAssignments>,
    @InjectRepository(StaffAssignmentsDrafts)
    private readonly staffAssignmentDraftsRepository: Repository<StaffAssignmentsDrafts>,
    @InjectRepository(ShiftsDevices)
    private readonly shiftDevicesRepository: Repository<ShiftsDevices>,
    @InjectRepository(ShiftsVehicles)
    private readonly shiftVehiclesRepository: Repository<ShiftsVehicles>,
    @InjectRepository(DeviceAssignments)
    private readonly deviceAssignmentRepository: Repository<DeviceAssignments>,
    @InjectRepository(VehiclesAssignments)
    private readonly vehicleAssignmentRepository: Repository<VehiclesAssignments>,
    @InjectRepository(VehiclesAssignmentsDrafts)
    private readonly vehicleAssignmentDraftRepository: Repository<VehiclesAssignmentsDrafts>,
    @InjectRepository(ScheduleOperation)
    private readonly scheduleOperationRepository: Repository<ScheduleOperation>,
    @InjectRepository(Directions)
    private readonly directionRepository: Repository<Directions>,
    @InjectRepository(DrivesCertifications)
    private readonly drivesCerticationsRepository: Repository<DrivesCertifications>,
    @InjectRepository(Certification)
    private readonly certicationRepository: Repository<Certification>,
    @InjectRepository(ShiftsVehicles)
    private readonly shiftsVehiclesRepository: Repository<ShiftsVehicles>,
    @InjectRepository(ScheduleOperationStatus)
    private readonly scheduleOperationStatusRepository: Repository<ScheduleOperationStatus>,
    @InjectRepository(StaffAssignmentsDrafts)
    private readonly staffAssignmentsDraftsRepository: Repository<StaffAssignmentsDrafts>,
    @InjectRepository(DeviceAssignmentsDrafts)
    private readonly deviceAssignmentsDraftsRepository: Repository<DeviceAssignmentsDrafts>,
    @InjectRepository(VehiclesAssignmentsDrafts)
    private readonly vehiclesAssignmentsDraftsRepository: Repository<VehiclesAssignmentsDrafts>
  ) {}

  async getData(
    scheduleId: any,
    @Query() query: GetOperationsOptionalParamDto
  ): Promise<any> {
    const limit: number = query?.limit ? +query?.limit : +process.env.PAGE_SIZE;
    let page = query?.page ? +query?.page : 1;
    if (page < 1) {
      page = 1;
    }
    const skip = (page - 1) * limit;
    let queryBuilder = this.scheduleOperationRepository
      .createQueryBuilder('scheduleOperation')
      .where('scheduleOperation.schedule_id = :scheduleId', { scheduleId });

    if (query.in_sync === ('true' || true)) {
      queryBuilder = queryBuilder
        .andWhere(
          'scheduleOperation.pending_assignment = :pending_assignment',
          { pending_assignment: false }
        )
        .andWhere('scheduleOperation.in_sync = :in_sync', { in_sync: true });
    } else {
      queryBuilder = queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where(
            'scheduleOperation.pending_assignment = :pending_assignment',
            { pending_assignment: true }
          ).orWhere('scheduleOperation.in_sync = :in_sync', { in_sync: false });
        })
      );
    }

    const scheduleOperations = await queryBuilder.getMany();
    const drive = scheduleOperations
      .filter((d) => d.operation_type === PolymorphicType.OC_OPERATIONS_DRIVES)
      .map((val) => {
        return val.operation_id;
      });

    const session = scheduleOperations
      .filter(
        (s) => s.operation_type === PolymorphicType.OC_OPERATIONS_SESSIONS
      )
      .map((val) => {
        return val.operation_id;
      });

    const nce = scheduleOperations
      .filter(
        (nce) =>
          nce.operation_type ===
          PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
      )
      .map((val) => {
        return val.operation_id;
      });
    const statusNumber: any = +query.status; // Convert to number
    const tenantId: any = +query.tenant_id; // Convert to number
    const drives = await this.drivesRepository.find({
      where: {
        id: In(drive),
        is_archived: false,
        date: query.startDate,
        operation_status_id: statusNumber ? statusNumber : null,
        tenant_id: tenantId,
        account: {
          name: query.keyword
            ? (ILike(`%${query.keyword}%`) as FindOperator<string>)
            : null,
        },
      },
      relations: ['account', 'operation_status'], // Assuming you have a relation with the 'account' table
    });

    const sessions = await this.sessionsRepository.find({
      where: {
        id: In(session),
        is_archived: false,
        date: query.startDate,
        operation_status_id: statusNumber ? statusNumber : null,
        tenant_id: tenantId,
        donor_center: {
          name: query.keyword
            ? (ILike(`%${query.keyword}%`) as FindOperator<string>)
            : null,
        },
      },
      relations: ['donor_center', 'operation_status'], // Assuming you have a relation with the 'donorCenter' table
    });

    const nonCollectionEvents = await this.nonCollectionEventsRepository.find({
      where: {
        id: In(nce),
        is_archived: false,
        date: query.startDate,
        status_id: statusNumber ? statusNumber : null,
        tenant_id: tenantId,
        non_collection_profile_id: {
          profile_name: query.keyword ? ILike(`%${query.keyword}%`) : null,
        },
      },
      relations: ['non_collection_profile_id', 'status_id'],
    });

    const getNotificationStatus = async (shifts: any[]) => {
      const shiftIds = shifts.map((shift) => shift.id);
      const unnotifiedStaffs =
        await this.staffAssignmentsDraftsRepository.exist({
          where: {
            shift_id: In(shiftIds),
            is_notify: false,
          },
        });

      if (unnotifiedStaffs) {
        return false;
      }

      const unnotifiedDevices =
        await this.deviceAssignmentsDraftsRepository.exist({
          where: {
            shift_id: In(shiftIds),
            is_notify: false,
          },
        });

      if (unnotifiedDevices) {
        return false;
      }

      const unnotifiedVehicles =
        await this.vehiclesAssignmentsDraftsRepository.exist({
          where: {
            shift_id: In(shiftIds),
            is_notify: false,
          },
        });

      if (unnotifiedVehicles) {
        return false;
      }

      return true;
    };

    const getShifts = async (operationId: bigint, operationType: string) => {
      return this.shiftsRepository.find({
        where: {
          shiftable_id: operationId,
          shiftable_type: operationType,
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
          const shifts = await getShifts(
            operation.id,
            operation.shiftable_type
          );
          const filteredShifts = shifts.filter((shift) => {
            return (
              shift.shiftable_type === PolymorphicType.OC_OPERATIONS_DRIVES ||
              shift.shiftable_type === PolymorphicType.OC_OPERATIONS_SESSIONS ||
              shift.shiftable_type ===
                PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
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
              let requestedDevices: any;
              let assignedDevices: any;
              let requestedVehicles: any;
              let assignedVehicles: any;
              let assignedStaffDraft: any;
              let assignedDevicesDraft: any;
              let assignedVehiclesDraft: any;

              if (
                shift.shiftable_type === PolymorphicType.OC_OPERATIONS_DRIVES ||
                shift.shiftable_type === PolymorphicType.OC_OPERATIONS_SESSIONS
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
                const shiftIds = projections.map(
                  (projection) => projection.shift_id
                );
                assignedStaff = await this.staffAssignmentRepository.find({
                  where: {
                    operation_id: shift.shiftable_id,
                    operation_type: shift.shiftable_type,
                    shift_id: In(shiftIds),
                  },
                });

                assignedStaffDraft = await this.staffAssignmentDraftsRepository
                  .createQueryBuilder()
                  .where({
                    operation_id: shift.shiftable_id,
                    operation_type: shift.shiftable_type,
                    shift_id: In(shiftIds),
                    is_notify: false,
                  })
                  .getRawMany();
                const sanitizedData = assignedStaffDraft.map((obj) =>
                  Object.fromEntries(
                    Object.entries(obj).map(([key, value]) => [
                      key.replace(/^StaffAssignmentsDrafts_/, ''),
                      value,
                    ])
                  )
                );
                const tempData = [];
                sanitizedData.forEach((draft) => {
                  const index = assignedStaff.findIndex(
                    (val) => val.id === draft.staff_assignment_id
                  );
                  if (index > -1) {
                    assignedStaff.splice(index, 1);
                  }
                  if (draft.reason !== 'U') {
                    tempData.push(draft);
                  }
                });

                assignedStaff = [...tempData, ...assignedStaff];
                assignedStaff = assignedStaff.length;
                requestedDevices = await this.shiftDevicesRepository.count({
                  where: {
                    shift_id: In(shiftIds),
                  },
                });
                assignedDevices = await this.deviceAssignmentRepository.find({
                  where: {
                    operation_id: shift.shiftable_id,
                    operation_type: shift.shiftable_type,
                    shift_id: In(shiftIds),
                  },
                });
                assignedDevicesDraft =
                  await this.deviceAssignmentsDraftsRepository
                    .createQueryBuilder()
                    .where({
                      operation_id: shift.shiftable_id,
                      operation_type: shift.shiftable_type,
                      shift_id: In(shiftIds),
                      is_notify: false,
                    })
                    .getRawMany();
                const sanitizedDeviceData = assignedDevicesDraft.map((obj) =>
                  Object.fromEntries(
                    Object.entries(obj).map(([key, value]) => [
                      key.replace(/^DeviceAssignmentsDrafts_/, ''),
                      value,
                    ])
                  )
                );
                const tempDeviceData = [];
                sanitizedDeviceData.forEach((draft) => {
                  const index = assignedDevices.findIndex(
                    (val) => val.id === draft.device_assignment_id
                  );
                  if (index > -1) {
                    assignedDevices.splice(index, 1);
                  }
                  if (draft.reason !== 'U') {
                    tempDeviceData.push(draft);
                  }
                });

                assignedDevices = [...tempDeviceData, ...assignedDevices];
                assignedDevices = assignedDevices.length;
                requestedVehicles = await this.shiftVehiclesRepository.count({
                  where: {
                    shift_id: In(shiftIds),
                  },
                });
                assignedVehicles = await this.vehicleAssignmentRepository.find({
                  where: {
                    operation_id: shift.shiftable_id,
                    operation_type: shift.shiftable_type,
                    shift_id: In(shiftIds),
                  },
                });
                assignedVehiclesDraft =
                  await this.vehicleAssignmentDraftRepository
                    .createQueryBuilder()
                    .where({
                      operation_id: shift.shiftable_id,
                      operation_type: shift.shiftable_type,
                      shift_id: In(shiftIds),
                      is_notify: false,
                    })
                    .getRawMany();

                const sanitizedVehiclesData = assignedVehiclesDraft.map((obj) =>
                  Object.fromEntries(
                    Object.entries(obj).map(([key, value]) => [
                      key.replace(/^VehiclesAssignmentsDrafts_/, ''),
                      value,
                    ])
                  )
                );
                const tempVehicleData = [];
                sanitizedVehiclesData.forEach((draft) => {
                  const index = assignedVehicles.findIndex(
                    (val) => val.id === draft.vehicle_assignment_id
                  );
                  if (index > -1) {
                    assignedVehicles.splice(index, 1);
                  }
                  if (draft.reason !== 'U') {
                    tempVehicleData.push(draft);
                  }
                });

                assignedVehicles = [...tempVehicleData, ...assignedVehicles];
                assignedVehicles = assignedVehicles.length;
              } else if (shift.shiftable_type === 'oc_non_collection_events') {
                requestedStaffQty = await this.shiftRolesRepository.find({
                  where: {
                    shift_id: shift.id,
                  },
                });
                const roles = await this.shiftRolesRepository.find({
                  where: { shift_id: shift.id },
                });
                const roleId = roles.map((role) => role.role_id);
                assignedStaff = await this.staffAssignmentRepository.find({
                  where: {
                    operation_id: shift.shiftable_id,
                    operation_type: shift.shiftable_type,
                    role_id: In(roleId),
                  },
                });
                assignedStaffDraft = await this.staffAssignmentDraftsRepository
                  .createQueryBuilder()
                  .where({
                    operation_id: shift.shiftable_id,
                    operation_type: shift.shiftable_type,
                    role_id: In(roleId),
                    is_notify: false,
                  })
                  .getRawMany();
                const sanitizedData = assignedStaffDraft.map((obj) =>
                  Object.fromEntries(
                    Object.entries(obj).map(([key, value]) => [
                      key.replace(/^StaffAssignmentsDrafts_/, ''),
                      value,
                    ])
                  )
                );
                const tempData = [];
                sanitizedData.forEach((draft) => {
                  const index = assignedStaff.findIndex(
                    (val) => val.id === draft.staff_assignment_id
                  );
                  if (index > -1) {
                    assignedStaff.splice(index, 1);
                  }
                  if (draft.reason !== 'U') {
                    tempData.push(draft);
                  }
                });

                assignedStaff = [...tempData, ...assignedStaff];
                assignedStaff = assignedStaff.length;
                requestedDevices = await this.shiftDevicesRepository.count({
                  where: {
                    shift_id: shift.id,
                  },
                });
                assignedDevices = await this.deviceAssignmentRepository.find({
                  where: {
                    operation_id: shift.shiftable_id,
                    operation_type: shift.shiftable_type,
                    shift_id: shift.id,
                  },
                });
                assignedDevicesDraft =
                  await this.deviceAssignmentsDraftsRepository
                    .createQueryBuilder()
                    .where({
                      operation_id: shift.shiftable_id,
                      operation_type: shift.shiftable_type,
                      shift_id: shift.id,
                      is_notify: false,
                    })
                    .getRawMany();
                const sanitizedDeviceData = assignedDevicesDraft.map((obj) =>
                  Object.fromEntries(
                    Object.entries(obj).map(([key, value]) => [
                      key.replace(/^DeviceAssignmentsDrafts_/, ''),
                      value,
                    ])
                  )
                );
                const tempDeviceData = [];
                sanitizedDeviceData.forEach((draft) => {
                  const index = assignedDevices.findIndex(
                    (val) => val.id === draft.device_assignment_id
                  );
                  if (index > -1) {
                    assignedDevices.splice(index, 1);
                  }
                  if (draft.reason !== 'U') {
                    tempDeviceData.push(draft);
                  }
                });

                assignedDevices = [...tempDeviceData, ...assignedDevices];
                assignedDevices = assignedDevices.length;
                requestedVehicles = await this.shiftVehiclesRepository.count({
                  where: {
                    shift_id: shift.id,
                  },
                });
                assignedVehicles = await this.vehicleAssignmentRepository.find({
                  where: {
                    operation_id: shift.shiftable_id,
                    operation_type: shift.shiftable_type,
                    shift_id: shift.id,
                  },
                });
                assignedVehiclesDraft =
                  await this.vehicleAssignmentDraftRepository
                    .createQueryBuilder()
                    .where({
                      operation_id: shift.shiftable_id,
                      operation_type: shift.shiftable_type,
                      shift_id: shift.id,
                      is_notify: false,
                    })
                    .getRawMany();

                const sanitizedVehiclesData = assignedVehiclesDraft.map((obj) =>
                  Object.fromEntries(
                    Object.entries(obj).map(([key, value]) => [
                      key.replace(/^VehiclesAssignmentsDrafts_/, ''),
                      value,
                    ])
                  )
                );
                const tempVehicleData = [];
                sanitizedVehiclesData.forEach((draft) => {
                  const index = assignedVehicles.findIndex(
                    (val) => val.id === draft.vehicle_assignment_id
                  );
                  if (index > -1) {
                    assignedVehicles.splice(index, 1);
                  }
                  if (draft.reason !== 'U') {
                    tempVehicleData.push(draft);
                  }
                });

                assignedVehicles = [...tempVehicleData, ...assignedVehicles];
                assignedVehicles = assignedVehicles.length;
              }
              const requestedStaff =
                shift.shiftable_type === PolymorphicType.OC_OPERATIONS_DRIVES ||
                shift.shiftable_type === PolymorphicType.OC_OPERATIONS_SESSIONS
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
              const productYieldSum = projections.reduce(
                (sum, projection) => sum + projection.product_yield,
                0
              );
              const procedureTypeQtySum = projections.reduce(
                (sum, projection) => sum + projection.procedure_type_qty,
                0
              );
              return shift.shiftable_type ===
                PolymorphicType.OC_OPERATIONS_DRIVES ||
                shift.shiftable_type === PolymorphicType.OC_OPERATIONS_SESSIONS
                ? {
                    ...shift,
                    projections: {
                      productYieldSum,
                      procedureTypeQtySum,
                    },
                    staffSetup: {
                      requestedStaff,
                      assignedStaff,
                    },
                    devices: {
                      requestedDevices,
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
                    projections: {
                      productYieldSum,
                      procedureTypeQtySum,
                    },
                    shiftRole: {
                      requestedStaff,
                      assignedStaff,
                    },
                    devices: {
                      requestedDevices,
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
    const drivesWithShiftsAndProjections = await addShiftsToOperations(drives);
    const sessionsWithShiftsAndProjections = await addShiftsToOperations(
      sessions
    );
    const nonCollectionEventsWithShiftsAndProjections =
      await addShiftsToOperations(nonCollectionEvents);
    const formattedDrives = await formatOperationData(
      drivesWithShiftsAndProjections,
      PolymorphicType.OC_OPERATIONS_DRIVES,
      scheduleOperations
    );
    const formattedSessions = await formatOperationData(
      sessionsWithShiftsAndProjections,
      PolymorphicType.OC_OPERATIONS_SESSIONS,
      scheduleOperations
    );
    const formattedNonCollectionEvents = await Promise.all(
      nonCollectionEventsWithShiftsAndProjections.map(
        async (nonCollectionEvent) => ({
          tenant_id: nonCollectionEvent.tenant_id,
          id: nonCollectionEvent.id,
          date: nonCollectionEvent.date,
          name:
            nonCollectionEvent?.non_collection_profile_id.profile_name || '',
          operation_type: PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS,
          shifts: getShiftsForOperation(nonCollectionEvent.shifts),
          is_notify: await getNotificationStatus(nonCollectionEvent.shifts),
          shiftsRole: {
            requestedStaff: nonCollectionEvent.shifts.reduce(
              (sum, shift) => sum + shift.shiftRole.requestedStaff,
              0
            ),
            assignedStaff: nonCollectionEvent.shifts.reduce(
              (sum, shift) => sum + shift.shiftRole.assignedStaff,
              0
            ),
          },
          devices: {
            requestedDevices: nonCollectionEvent.shifts.reduce(
              (sum, shift) => sum + shift.devices.requesteddevices,
              0
            ),
            assignedDevices: nonCollectionEvent.shifts.reduce(
              (sum, shift) => sum + shift.devices.assignedDevices,
              0
            ),
          },
          vehicles: {
            requestedVehicles: nonCollectionEvent.shifts.reduce(
              (sum, shift) => sum + shift.vehicles.requestedVehicles,
              0
            ),
            assignedVehicles: nonCollectionEvent.shifts.reduce(
              (sum, shift) => sum + shift.vehicles.assignedVehicles,
              0
            ),
          },
          operation_status: nonCollectionEvent.status_id?.name,
          pending_assignment: scheduleOperations?.find(
            (id) => id.operation_id === nonCollectionEvent.id
          )?.pending_assignment,
          operation_status_id: nonCollectionEvent.status_id?.id,
        })
      )
    );
    let allFormattedData = [
      ...formattedDrives,
      ...formattedSessions,
      ...formattedNonCollectionEvents,
    ];
    const sortField = query?.sortBy || 'name'; // Default to sorting by name
    const sortOrder: 'ASC' | 'DESC' =
      query?.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    if (
      query?.sortBy === 'staffSetup' ||
      query?.sortBy === 'vehicles' ||
      query?.sortBy === 'devices' ||
      query?.sortBy === 'projections'
    ) {
      allFormattedData.forEach((item) => {
        item['totalStaffAssigned'] = item.shifts.reduce(
          (acc, shift) => acc + shift.staffSetup.assignedStaff,
          0
        );
        item['totalVehiclesAssigned'] = item.shifts.reduce(
          (acc, shift) => acc + shift.vehicles.assignedVehicles,
          0
        );
        item['totalDevicesAssigned'] = item.shifts.reduce(
          (acc, shift) => acc + shift.devices.assignedDevices,
          0
        );
        item['totalProductYieldSum'] = item.shifts.reduce(
          (acc, shift) => acc + shift.projections.productYieldSum,
          0
        );
        item['totalProcedureTypeQtySum'] = item.shifts.reduce(
          (acc, shift) => acc + shift.projections.procedureTypeQtySum,
          0
        );
      });
      switch (query?.sortBy) {
        case 'staffSetup':
          if (query?.sortOrder === 'ASC') {
            allFormattedData.sort(
              (a, b) => a['totalStaffAssigned'] - b['totalStaffAssigned']
            ); // Ascending order
          } else {
            allFormattedData.sort(
              (a, b) => b['totalStaffAssigned'] - a['totalStaffAssigned']
            );
          }
          break;
        case 'vehicles':
          if (query?.sortOrder === 'ASC') {
            allFormattedData.sort(
              (a, b) => a['totalVehiclesAssigned'] - b['totalVehiclesAssigned']
            ); // Ascending order
          } else {
            allFormattedData.sort(
              (a, b) => b['totalVehiclesAssigned'] - a['totalVehiclesAssigned']
            );
          }
          break;
        case 'devices':
          if (query?.sortOrder === 'ASC') {
            allFormattedData.sort(
              (a, b) => a['totalDevicesAssigned'] - b['totalDevicesAssigned']
            );
          } else {
            allFormattedData.sort(
              (a, b) => b['totalDevicesAssigned'] - a['totalDevicesAssigned']
            );
          }
          break;
        case 'projections':
          const firstElement = allFormattedData[0]['totalProductYieldSum'];
          const areAllEqual = allFormattedData.every(
            (value) => value['totalProductYieldSum'] === firstElement
          );
          if (areAllEqual) {
            // sort by totalProcedureTypeQtySum
            if (query?.sortOrder === 'ASC') {
              allFormattedData.sort(
                (a, b) =>
                  a['totalProcedureTypeQtySum'] - b['totalProcedureTypeQtySum']
              );
            } else {
              allFormattedData.sort(
                (a, b) =>
                  b['totalProcedureTypeQtySum'] - a['totalProcedureTypeQtySum']
              );
            }
          } else {
            if (query?.sortOrder === 'ASC') {
              allFormattedData.sort(
                (a, b) => a['totalProductYieldSum'] - b['totalProductYieldSum']
              );
            } else {
              allFormattedData.sort(
                (a, b) => b['totalProductYieldSum'] - a['totalProductYieldSum']
              );
            }
          }

          break;
      }
    } else {
      allFormattedData.sort((a, b) => {
        const fieldA = a[sortField];
        const fieldB = b[sortField];
        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
          // Case-insensitive string comparison
          return sortOrder === 'ASC'
            ? fieldA.localeCompare(fieldB)
            : fieldB.localeCompare(fieldA);
        } else if (fieldA instanceof Date && fieldB instanceof Date) {
          // Date comparison
          return sortOrder === 'ASC'
            ? fieldA.getTime() - fieldB.getTime()
            : fieldB.getTime() - fieldA.getTime();
        } else {
          // Fallback to default comparison
          if (fieldA < fieldB) {
            return sortOrder === 'ASC' ? -1 : 1;
          } else if (fieldA > fieldB) {
            return sortOrder === 'ASC' ? 1 : -1;
          } else {
            return 0;
          }
        }
      });
    }

    if (query?.notify != null && query.notify !== 'null') {
      allFormattedData = allFormattedData.filter(
        (data) => data.is_notify.toString() === query?.notify
      );
    }

    if (query?.getAllData) {
      const pausedAtOperation = scheduleOperations?.find(
        (scheduleOperation) => scheduleOperation.is_paused_at === true
      );
      return {
        items: allFormattedData,
        pausedAtOperation: pausedAtOperation
          ? {
              operation_id: pausedAtOperation.operation_id,
              operation_type: pausedAtOperation.operation_type,
            }
          : null,
      };
    } else {
      const totalItems = allFormattedData.length;
      const totalPages = Math.ceil(totalItems / limit);
      const paginatedData = allFormattedData.slice(skip, skip + limit);
      const pausedAtOperation = scheduleOperations?.find(
        (scheduleOperation) => scheduleOperation.is_paused_at === true
      );

      return {
        items: paginatedData,
        totalItems,
        totalPages,
        currentPage: page,
        pausedAtOperation: pausedAtOperation
          ? {
              operation_id: pausedAtOperation.operation_id,
              operation_type: pausedAtOperation.operation_type,
            }
          : null,
      };
    }

    function getShiftsForOperation(shifts: Shifts[]) {
      // If there are multiple shifts, return the earliest start-time and latest end-time
      if (shifts.length > 1) {
        const earliestStartTime = shifts.reduce(
          (min, shift) => (shift.start_time < min ? shift.start_time : min),
          shifts[0].start_time
        );
        const latestEndTime = shifts.reduce(
          (max, shift) => (shift.end_time > max ? shift.end_time : max),
          shifts[0].end_time
        );
        return { start_time: earliestStartTime, end_time: latestEndTime };
      }
      // If there is only one shift, return its start-time and end-time
      if (shifts.length === 1) {
        const { start_time, end_time } = shifts[0];
        return { start_time, end_time };
      }
      // If there are no shifts, return null or handle it based on your requirement
      return null;
    }
    async function formatOperationData(
      operations: any[],
      operationType: string,
      scheduleOperations?: any[]
    ) {
      return await Promise.all(
        operations.map(async (operation) => ({
          tenant_id: operation.tenant_id,
          id: operation.id,
          date: operation.date,
          name:
            operation.account?.name ||
            operation.donor_center?.name ||
            operation?.non_collection_profile_id?.profile_name ||
            '',
          operation_type: operationType,
          is_notify: await getNotificationStatus(operation.shifts),
          shifts: operation.shifts.map((shift) => ({
            id: shift.id,
            start_time: shift.start_time,
            end_time: shift.end_time,
            projections: {
              productYieldSum: shift.projections.productYieldSum,
              procedureTypeQtySum: shift.projections.procedureTypeQtySum,
            },
            staffSetup: shift.staffSetup,
            devices: shift.devices,
            vehicles: shift.vehicles,
          })),
          operation_status: operation.operation_status?.name,
          pending_assignment: scheduleOperations?.find(
            (scheduleOperation) =>
              scheduleOperation.operation_id === operation.id
          )?.pending_assignment,
          operation_status_id: operation.operation_status?.id,
        }))
      );
    }
  }

  async unassignOperation(operationId: any, query: UnassignOperationParamDto) {
    try {
      const tenantId: any = +query.tenant_id; // Convert to number

      await this.staffAssignmentDraftsRepository
        .createQueryBuilder('sad')
        .delete()
        .where(
          'operation_id = :OID AND operation_type =:OPType AND tenant_id =:tenant_id',
          {
            OID: operationId,
            OPType: query.operation_type,
            tenant_id: tenantId,
          }
        )
        .execute();
      await this.vehicleAssignmentDraftRepository
        .createQueryBuilder('vad')
        .delete()
        .where(
          'operation_id = :OID AND operation_type =:OPType AND tenant_id =:tenant_id',
          {
            OID: operationId,
            OPType: query.operation_type,
            tenant_id: tenantId,
          }
        )
        .execute();
      await this.deviceAssignmentsDraftsRepository
        .createQueryBuilder('dad')
        .delete()
        .where(
          'operation_id = :OID AND operation_type =:OPType AND tenant_id =:tenant_id',
          {
            OID: operationId,
            OPType: query.operation_type,
            tenant_id: tenantId,
          }
        )
        .execute();
      await this.staffAssignmentRepository
        .createQueryBuilder('sa')
        .delete()
        .where(
          'operation_id = :OID AND operation_type =:OPType AND tenant_id =:tenant_id',
          {
            OID: operationId,
            OPType: query.operation_type,
            tenant_id: tenantId,
          }
        )
        .execute();

      await this.vehicleAssignmentRepository
        .createQueryBuilder('sa')
        .delete()
        .where(
          'operation_id = :OID AND operation_type =:OPType AND tenant_id =:tenant_id',
          {
            OID: operationId,
            OPType: query.operation_type,
            tenant_id: tenantId,
          }
        )
        .execute();

      await this.deviceAssignmentRepository
        .createQueryBuilder('sa')
        .delete()
        .where(
          'operation_id = :OID AND operation_type =:OPType AND tenant_id =:tenant_id',
          {
            OID: operationId,
            OPType: query.operation_type,
            tenant_id: tenantId,
          }
        )
        .execute();
      return resSuccess(
        'Resource Removed.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async getShiftStatuesForSingleOperation(
    operationId: any,
    operationType: any,
    tenantId: any
  ): Promise<any> {
    let operation: any;

    switch (operationType) {
      case PolymorphicType.OC_OPERATIONS_DRIVES:
        operation = await this.drivesRepository.findOne({
          where: {
            id: operationId,
            tenant_id: tenantId,
          },
          relations: ['account', 'operation_status'],
        });
        break;

      case PolymorphicType.OC_OPERATIONS_SESSIONS:
        operation = await this.sessionsRepository.findOne({
          where: {
            id: operationId,
            tenant_id: tenantId,
          },
          relations: ['donor_center', 'operation_status'],
        });
        break;

      case PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS:
        operation = await this.nonCollectionEventsRepository.findOne({
          where: {
            id: operationId,
            tenant_id: tenantId,
          },
          relations: ['non_collection_profile_id', 'status'],
        });
        break;

      default:
        // Handle the case where the provided operationType is not recognized
        break;
    }

    const getShifts = async (operationId: bigint, operationType: string) => {
      return this.shiftsRepository.find({
        where: {
          shiftable_id: operationId,
          shiftable_type: operationType,
          tenant_id: tenantId,
        },
        order: {
          start_time: 'ASC',
          end_time: 'DESC',
        },
      });
    };

    const shifts = await getShifts(operationId, operationType);
    const shiftsWithProjections = await Promise.all(
      shifts.map(async (shift) => {
        const projections: any[] =
          await this.shiftsProjectionsStaffRepository.find({
            where: { shift_id: shift.id },
          });

        let requestedStaffQty: any;
        let assignedStaff: any;
        let assignedStaffDraft: any;
        let requestedDevices: any;
        let assignedDevices: any;
        let assignedDevicesDraft: any;
        let requestedVehicles: any;
        let assignedVehicles: any;
        let assignedVehiclesDraft: any;

        if (
          shift.shiftable_type === PolymorphicType.OC_OPERATIONS_DRIVES ||
          shift.shiftable_type === PolymorphicType.OC_OPERATIONS_SESSIONS
        ) {
          const staffSetups = projections.map(
            (projection) => projection.staff_setup_id
          );
          const staff = [...staffSetups];
          requestedStaffQty = await this.staffConfigRepository.find({
            where: {
              staff_setup_id: In(staff),
              tenant_id: tenantId,
            },
          });
          const shiftIds = projections.map((projection) => projection.shift_id);

          assignedStaff = await this.staffAssignmentRepository.find({
            where: {
              operation_id: shift.shiftable_id,
              operation_type: shift.shiftable_type,
              shift_id: In(shiftIds),
              tenant_id: tenantId,
            },
          });
          assignedStaffDraft = await this.staffAssignmentDraftsRepository
            .createQueryBuilder()
            .where({
              operation_id: shift.shiftable_id,
              operation_type: shift.shiftable_type,
              shift_id: In(shiftIds),
              is_notify: false,
              tenant_id: tenantId,
            })
            .getRawMany();
          const sanitizedData = assignedStaffDraft.map((obj) =>
            Object.fromEntries(
              Object.entries(obj).map(([key, value]) => [
                key.replace(/^StaffAssignmentsDrafts_/, ''),
                value,
              ])
            )
          );
          const tempData = [];
          sanitizedData.forEach((draft) => {
            const index = assignedStaff.findIndex(
              (val) => val.id === draft.staff_assignment_id
            );
            if (index > -1) {
              assignedStaff.splice(index, 1);
            }
            if (draft.reason !== 'U') {
              tempData.push(draft);
            }
          });

          assignedStaff = [...tempData, ...assignedStaff];
          assignedStaff = assignedStaff.length;

          requestedDevices = await this.shiftDevicesRepository.count({
            where: {
              shift_id: In(shiftIds),
            },
          });
          assignedDevices = await this.deviceAssignmentRepository.find({
            where: {
              operation_id: shift.shiftable_id,
              operation_type: shift.shiftable_type,
              shift_id: In(shiftIds),
              tenant_id: tenantId,
            },
          });
          assignedDevicesDraft = await this.deviceAssignmentsDraftsRepository
            .createQueryBuilder()
            .where({
              operation_id: shift.shiftable_id,
              operation_type: shift.shiftable_type,
              shift_id: shift.id,
              is_notify: false,
              tenant_id: tenantId,
            })
            .getRawMany();
          const sanitizedDeviceData = assignedDevicesDraft.map((obj) =>
            Object.fromEntries(
              Object.entries(obj).map(([key, value]) => [
                key.replace(/^DeviceAssignmentsDrafts_/, ''),
                value,
              ])
            )
          );
          const tempDeviceData = [];
          sanitizedDeviceData.forEach((draft) => {
            const index = assignedDevices.findIndex(
              (val) => val.id === draft.device_assignment_id
            );
            if (index > -1) {
              assignedDevices.splice(index, 1);
            }
            if (draft.reason !== 'U') {
              tempDeviceData.push(draft);
            }
          });

          assignedDevices = [...tempDeviceData, ...assignedDevices];
          assignedDevices = assignedDevices.length;

          requestedVehicles = await this.shiftVehiclesRepository.count({
            where: {
              shift_id: In(shiftIds),
            },
          });
          assignedVehicles = await this.vehicleAssignmentRepository.find({
            where: {
              operation_id: shift.shiftable_id,
              operation_type: shift.shiftable_type,
              shift_id: In(shiftIds),
              tenant_id: tenantId,
            },
          });
          assignedVehiclesDraft = await this.vehicleAssignmentDraftRepository
            .createQueryBuilder()
            .where({
              operation_id: shift.shiftable_id,
              operation_type: shift.shiftable_type,
              shift_id: shift.id,
              is_notify: false,
              tenant_id: tenantId,
            })
            .getRawMany();

          const sanitizedVehiclesData = assignedVehiclesDraft.map((obj) =>
            Object.fromEntries(
              Object.entries(obj).map(([key, value]) => [
                key.replace(/^VehiclesAssignmentsDrafts_/, ''),
                value,
              ])
            )
          );
          const tempVehicleData = [];
          sanitizedVehiclesData.forEach((draft) => {
            const index = assignedVehicles.findIndex(
              (val) => val.id === draft.vehicle_assignment_id
            );
            if (index > -1) {
              assignedVehicles.splice(index, 1);
            }
            if (draft.reason !== 'U') {
              tempVehicleData.push(draft);
            }
          });

          assignedVehicles = [...tempVehicleData, ...assignedVehicles];
          assignedVehicles = assignedVehicles.length;
        } else if (shift.shiftable_type === 'oc_non_collection_events') {
          requestedStaffQty = await this.shiftRolesRepository.find({
            where: {
              shift_id: shift.id,
            },
          });
          const roles = await this.shiftRolesRepository.find({
            where: { shift_id: shift.id },
          });
          //
          const roleId = roles.map((role) => role.role_id);

          assignedStaff = await this.staffAssignmentRepository.find({
            where: {
              operation_id: shift.shiftable_id,
              operation_type: shift.shiftable_type,
              role_id: In(roleId),
              tenant_id: tenantId,
            },
          });
          assignedStaffDraft = await this.staffAssignmentDraftsRepository
            .createQueryBuilder()
            .where({
              operation_id: shift.shiftable_id,
              operation_type: shift.shiftable_type,
              role_id: In(roleId),
              is_notify: false,
              tenant_id: tenantId,
            })
            .getRawMany();
          const sanitizedData = assignedStaffDraft.map((obj) =>
            Object.fromEntries(
              Object.entries(obj).map(([key, value]) => [
                key.replace(/^StaffAssignmentsDrafts_/, ''),
                value,
              ])
            )
          );
          const tempData = [];
          sanitizedData.forEach((draft) => {
            const index = assignedStaff.findIndex(
              (val) => val.id === draft.staff_assignment_id
            );
            if (index > -1) {
              assignedStaff.splice(index, 1);
            }
            if (draft.reason !== 'U') {
              tempData.push(draft);
            }
          });

          assignedStaff = [...tempData, ...assignedStaff];
          assignedStaff = assignedStaff.length;
          requestedDevices = await this.shiftDevicesRepository.count({
            where: {
              shift_id: shift.id,
            },
          });
          assignedDevices = await this.deviceAssignmentRepository.find({
            where: {
              operation_id: shift.shiftable_id,
              operation_type: shift.shiftable_type,
              shift_id: shift.id,
              tenant_id: tenantId,
            },
          });
          assignedDevicesDraft = await this.deviceAssignmentsDraftsRepository
            .createQueryBuilder()
            .where({
              operation_id: shift.shiftable_id,
              operation_type: shift.shiftable_type,
              shift_id: shift.id,
              is_notify: false,
              tenant_id: tenantId,
            })
            .getRawMany();
          const sanitizedDeviceData = assignedDevicesDraft.map((obj) =>
            Object.fromEntries(
              Object.entries(obj).map(([key, value]) => [
                key.replace(/^DeviceAssignmentsDrafts_/, ''),
                value,
              ])
            )
          );
          const tempDeviceData = [];
          sanitizedDeviceData.forEach((draft) => {
            const index = assignedDevices.findIndex(
              (val) => val.id === draft.device_assignment_id
            );
            if (index > -1) {
              assignedDevices.splice(index, 1);
            }
            if (draft.reason !== 'U') {
              tempDeviceData.push(draft);
            }
          });

          assignedDevices = [...tempDeviceData, ...assignedDevices];
          assignedDevices = assignedDevices.length;
          requestedVehicles = await this.shiftVehiclesRepository.count({
            where: {
              shift_id: shift.id,
            },
          });
          assignedVehicles = await this.vehicleAssignmentRepository.find({
            where: {
              operation_id: shift.shiftable_id,
              operation_type: shift.shiftable_type,
              shift_id: shift.id,
              tenant_id: tenantId,
            },
          });
          assignedVehiclesDraft = await this.vehicleAssignmentDraftRepository
            .createQueryBuilder()
            .where({
              operation_id: shift.shiftable_id,
              operation_type: shift.shiftable_type,
              shift_id: shift.id,
              is_notify: false,
              tenant_id: tenantId,
            })
            .getRawMany();

          const sanitizedVehiclesData = assignedVehiclesDraft.map((obj) =>
            Object.fromEntries(
              Object.entries(obj).map(([key, value]) => [
                key.replace(/^VehiclesAssignmentsDrafts_/, ''),
                value,
              ])
            )
          );
          const tempVehicleData = [];
          sanitizedVehiclesData.forEach((draft) => {
            const index = assignedVehicles.findIndex(
              (val) => val.id === draft.vehicle_assignment_id
            );
            if (index > -1) {
              assignedVehicles.splice(index, 1);
            }
            if (draft.reason !== 'U') {
              tempVehicleData.push(draft);
            }
          });

          assignedVehicles = [...tempVehicleData, ...assignedVehicles];
          assignedVehicles = assignedVehicles.length;
        }

        const requestedStaff =
          shift.shiftable_type === PolymorphicType.OC_OPERATIONS_DRIVES ||
          shift.shiftable_type === PolymorphicType.OC_OPERATIONS_SESSIONS
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
        const productYieldSum = projections.reduce(
          (sum, projection) => sum + projection.product_yield,
          0
        );
        const procedureTypeQtySum = projections.reduce(
          (sum, projection) => sum + projection.procedure_type_qty,
          0
        );

        return shift.shiftable_type === PolymorphicType.OC_OPERATIONS_DRIVES ||
          shift.shiftable_type === PolymorphicType.OC_OPERATIONS_SESSIONS
          ? {
              ...shift,
              projections: {
                productYieldSum,
                procedureTypeQtySum,
              },
              staffSetup: {
                requestedStaff,
                assignedStaff,
              },
              devices: {
                requestedDevices,
                assignedDevices,
              },
              vehicles: {
                requestedVehicles,
                assignedVehicles,
              },
              status: this.getShiftStatus(
                { assigned: assignedStaff, requested: requestedStaff },
                { assigned: assignedVehicles, requested: requestedVehicles },
                { assigned: assignedDevices, requested: requestedDevices }
              ),
            }
          : shift.shiftable_type === 'oc_non_collection_events'
          ? {
              ...shift,
              projections: {
                productYieldSum,
                procedureTypeQtySum,
              },
              shiftRole: {
                requestedStaff,
                assignedStaff,
              },
              devices: {
                requestedDevices,
                assignedDevices,
              },
              vehicles: {
                requestedVehicles,
                assignedVehicles,
              },
              status: this.getShiftStatus(
                null,
                { assigned: assignedVehicles, requested: requestedVehicles },
                { assigned: assignedDevices, requested: requestedDevices }
              ),
            }
          : null;
      })
    );

    return { ...operation, shifts: shiftsWithProjections };
  }

  getShiftStatus(
    staff: { assigned: any; requested: any },
    vehicles: { assigned: any; requested: any },
    devices: { assigned: any; requested: any }
  ): string {
    if (!staff) {
      // Shift status for NCE
      const allDevicesAssigned =
        devices.assigned === devices.requested && devices.requested !== 0;
      const allVehiclesAssigned =
        vehicles.assigned === vehicles.requested && vehicles.requested !== 0;
      const noDevicesAssigned = devices.assigned === 0;
      const noVehiclesAssigned = vehicles.assigned === 0;
      // everything requested is assigned
      const complete =
        (allVehiclesAssigned && allDevicesAssigned) ||
        (allVehiclesAssigned && devices.requested == 0) ||
        (allDevicesAssigned && vehicles.requested == 0);
      // nothing is assigned
      const notStarted = noVehiclesAssigned && noDevicesAssigned;
      if (complete) return 'Complete';
      else if (notStarted) return 'Not Started';
      else return 'Incomplete';
    } else {
      // Shift status for Drives or Sessions
      const allStaffAssigned =
        staff.assigned === staff.requested && staff.requested !== 0;
      const allDevicesAssigned =
        devices.assigned === devices.requested && devices.requested !== 0;
      const allVehiclesAssigned =
        vehicles.assigned === vehicles.requested && vehicles.requested !== 0;
      const noStaffAssigned = staff.assigned === 0;
      const noDevicesAssigned = devices.assigned === 0;
      const noVehiclesAssigned = vehicles.assigned === 0;
      // everything requested is assigned
      const complete =
        (allStaffAssigned && allVehiclesAssigned && allDevicesAssigned) ||
        (allStaffAssigned && allVehiclesAssigned && devices.requested == 0) ||
        (allStaffAssigned && allDevicesAssigned && vehicles.requested == 0) ||
        (allVehiclesAssigned && allDevicesAssigned && staff.requested == 0) ||
        (allStaffAssigned &&
          vehicles.requested == 0 &&
          devices.requested == 0) ||
        (allVehiclesAssigned &&
          staff.requested == 0 &&
          devices.requested == 0) ||
        (allDevicesAssigned && staff.requested == 0 && vehicles.requested == 0);
      // nothing is assigned
      const notStarted =
        noStaffAssigned && noVehiclesAssigned && noDevicesAssigned;
      if (complete) return 'Complete';
      else if (notStarted) return 'Not Started';
      else return 'Incomplete';
    }
  }
  async getStaffData(
    operationId: any,
    shiftId: any,
    operationType: any,
    schedule_id: any,
    tenantId: any
  ): Promise<any> {
    try {
      const schedule = await this.scheduleRepository.findOne({
        where: {
          id: schedule_id,
        },
      });
      let assignedStaffData: any;
      assignedStaffData = await this.staffAssignmentRepository
        .createQueryBuilder('staff_assignments')
        .leftJoin(Staff, 'st', 'st.id = staff_assignments.staff_id')
        .leftJoin(ContactsRoles, 'cr', 'cr.id = staff_assignments.role_id')
        .where(
          'staff_assignments.shift_id = :shiftId AND staff_assignments.tenant_id = :tenant_id',
          {
            shiftId: shiftId,
            tenant_id: tenantId,
          }
        )
        .select([
          'staff_assignments.tenant_id as tenant_id',
          'st.id as staff_id',
          'staff_assignments.role_id as role_id',
          'cr.name as role_name',
          'st.first_name as staff_name',
          'staff_assignments.is_additional as is_additional',
          'staff_assignments.home_base as home_base',
          'staff_assignments.id as assignment_id',
          'staff_assignments.pending_assignment as pending_assignment',
        ])
        .getRawMany();
      const assignmentIDs = assignedStaffData.map((val) => {
        return val.assignment_id;
      });

      const draftAssignments = await this.staffAssignmentDraftsRepository
        .createQueryBuilder('staff_assignments')

        .leftJoin(Staff, 'st', 'st.id = staff_assignments.staff_id')
        .leftJoin(ContactsRoles, 'cr', 'cr.id = staff_assignments.role_id')
        .where(
          'staff_assignments.shift_id = :shiftId AND ' +
            'staff_assignments.is_notify = :isNotify AND ' +
            'staff_assignments.tenant_id = :tenant_id AND ' +
            'staff_assignments.is_archived = :isArchived ',
          {
            shiftId: shiftId,
            isNotify: false,
            isArchived: false,
            tenant_id: tenantId,
          }
        )
        .select([
          'staff_assignments.tenant_id as tenant_id',
          'st.id as staff_id',
          'staff_assignments.role_id as role_id',
          'staff_assignments.split_shift as split_shift',
          'cr.name as role_name',
          'st.first_name as staff_name',
          'staff_assignments.is_additional as is_additional',
          'staff_assignments.reason as reason',
          'staff_assignments.home_base as home_base',
          'staff_assignments.staff_assignment_id as assignment_id',
          'staff_assignments.id as draft_assignment_id',
          'staff_assignments.is_notify as is_notify',
          'staff_assignments.pending_assignment as pending_assignment',
        ])
        .getRawMany();
      const tempData = [];
      draftAssignments.forEach((draft) => {
        const index = assignedStaffData.findIndex(
          (val) => val.assignment_id == draft.assignment_id
        );
        if (index > -1) {
          assignedStaffData.splice(index, 1);
        }
        if (draft.reason !== 'U') {
          tempData.push(draft);
        }
      });
      assignedStaffData = [...tempData, ...assignedStaffData];
      const requestedStaffData = await this.shiftsProjectionsStaffRepository
        .createQueryBuilder('shifts_projections_staff')
        .leftJoin(
          StaffConfig,
          'staff_config',
          'staff_config.staff_setup_id = shifts_projections_staff.staff_setup_id'
        )
        .leftJoin(
          ContactsRoles,
          'contacts_roles',
          'contacts_roles.id = staff_config.contact_role_id'
        )
        .leftJoin(
          Shifts,
          'shift',
          'shift.id = shifts_projections_staff.shift_id'
        )
        .where('shifts_projections_staff.shift_id = :shiftId', {
          shiftId: shiftId,
        })
        .select([
          'staff_config.staff_setup_id',
          'staff_config.contact_role_id',
          'contacts_roles.name as role_name',
          'staff_config.qty',
          'SUM(shifts_projections_staff.procedure_type_qty) as p',
          '(EXTRACT(EPOCH FROM shift.end_time) - EXTRACT(EPOCH FROM shift.start_time)) / 3600 AS total_hours',
        ])
        .groupBy(
          'shift.end_time,shift.start_time,staff_config.staff_setup_id,staff_config.contact_role_id,contacts_roles.name,staff_config.qty'
        )
        .getRawMany();

      if (requestedStaffData.length != 0) {
        var p = requestedStaffData[0].p;

        var h = requestedStaffData[0].total_hours;

        var s = assignedStaffData.length;
      }
      const totalRequiredStaff = [];

      requestedStaffData.forEach((item) => {
        for (let i = 0; i < item.staff_config_qty; i++) {
          totalRequiredStaff.push({
            role_name: item.role_name,
            staff_setup_id: item.staff_setup_id,
            contact_role_id: item.contact_role_id,
          });
        }
      });
      assignedStaffData.forEach((element2) => {
        const index = totalRequiredStaff.findIndex(
          (element) => element.contact_role_id === element2.role_id
        );
        if (index !== -1) {
          totalRequiredStaff.splice(index, 1);
        }
      });

      totalRequiredStaff.forEach((item) => {
        assignedStaffData.push({
          staff_id: null,
          role_id: item.contact_role_id,
          role_name: item.role_name,
          staff_name: null,
          is_additional: false,
          assignment_id: null,
          home_base: '',
        });
      });
      const oef = p / h / s;
      return { Staffed_OEF: oef.toFixed(2), assignedStaffData };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async unassignStaff(
    operationId: any,
    shiftId: any,
    scheduleId: any,
    @Query() query: UnAssignStaffParamDto,
    tenant_id: any
  ) {
    try {
      let data: any;
      const schedule_status = await this.scheduleRepository
        .createQueryBuilder('schedule')
        .select('schedule_status')
        .where(
          'schedule.id = :scheduleId and schedule.tenant_id = :tenant_id',
          {
            scheduleId,
            tenant_id,
          }
        )
        .execute();
      if (schedule_status[0].schedule_status == 'Draft') {
        data = await this.staffAssignmentRepository
          .createQueryBuilder('staff_assignments')
          .delete()
          .where(
            'staff_assignments.operation_id = :operationId and staff_assignments.tenant_id = :tenant_id ',
            {
              operationId,
              tenant_id,
            }
          )
          .andWhere('staff_assignments.shift_id = :shiftId', { shiftId })
          .andWhere('staff_assignments.operation_type = :operationType', {
            operationType: query.operation_type,
          })
          .andWhere('staff_assignments.staff_id = :staffId', {
            staffId: query.staff_id,
          })
          .andWhere('staff_assignments.role_id = :roleId', {
            roleId: query.role_id,
          })
          .execute();
        const val = await this.scheduleOperationRepository
          .createQueryBuilder('schedule_operation')
          .select(['pending_assignment'])
          .where('operation_id = :operationId', { operationId })
          .getRawOne();
        if (val) {
          if (val.pending_assignment === true) {
            const assignedCount = await this.staffAssignmentRepository
              .createQueryBuilder('staff_assignments')
              .select('COUNT(id)', 'count')
              .where('operation_id = :operationId and tenant_id = :tenant_id', {
                operationId,
                tenant_id,
              })
              .getRawOne();
            if (assignedCount.count == 0) {
              await this.scheduleOperationRepository
                .createQueryBuilder('schedule_operation')
                .update(ScheduleOperation)
                .set({
                  pending_assignment: false,
                  to_be_removed: true,
                })
                .where('operation_id = :operationId', { operationId })
                .execute();
            }
          }
        }
      } else {
        const deletedData = await this.staffAssignmentDraftsRepository
          .createQueryBuilder('staff_assignments_drafts')
          .delete()
          .where(
            'staff_assignments_drafts.operation_id = :operationId and staff_assignments_drafts.tenant_id = :tenant_id',
            {
              operationId,
              tenant_id,
            }
          )
          .andWhere('staff_assignments_drafts.shift_id = :shiftId', { shiftId })
          .andWhere(
            'staff_assignments_drafts.operation_type = :operationType',
            {
              operationType: query.operation_type,
            }
          )
          .andWhere('staff_assignments_drafts.staff_id = :staffId', {
            staffId: query.staff_id,
          })
          .andWhere('staff_assignments_drafts.role_id = :roleId', {
            roleId: query.role_id,
          })
          .execute();

        const data = await this.staffAssignmentRepository
          .createQueryBuilder('staff_assignments')
          .where(
            'staff_assignments.operation_id = :operationId and staff_assignments.tenant_id = :tenant_id',
            {
              operationId,
              tenant_id,
            }
          )
          .andWhere('staff_assignments.shift_id = :shiftId', { shiftId })
          .andWhere('staff_assignments.operation_type = :operationType', {
            operationType: query.operation_type,
          })
          .andWhere('staff_assignments.staff_id = :staffId', {
            staffId: query.staff_id,
          })
          .andWhere('staff_assignments.role_id = :roleId', {
            roleId: query.role_id,
          })
          .getRawMany();
        if (data.length > 0) {
          const sanitizedData = data.map((obj) =>
            Object.fromEntries(
              Object.entries(obj).map(([key, value]) => [
                key.replace(/^staff_assignments_/, ''),
                value,
              ])
            )
          );
          sanitizedData[0].staff_assignment_id = sanitizedData[0].id;
          sanitizedData[0].reason = 'U';
          const staffAssignmentDraft = Object.assign(
            new StaffAssignmentsDrafts(),
            sanitizedData[0]
          );

          // // Save the entity to the database
          const savedDraft = await this.staffAssignmentDraftsRepository.save(
            staffAssignmentDraft
          );
        }

        if (deletedData.affected) {
          await this.updatePendingAssignment(
            shiftId,
            query,
            'Staff',
            tenant_id
          );
        }

        return resSuccess(
          deletedData.affected > 0 ? 'Resource Removed.' : 'No Resource Found',
          SuccessConstants.SUCCESS,
          HttpStatus.OK
        );
      }
      return resSuccess(
        data.affected > 0 ? 'Resource Removed.' : 'No Resource Found',
        SuccessConstants.SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async reassignStaff(@Query() query: ReAssignStaffParamDto, tenantId) {
    try {
      const schedule = await this.scheduleRepository
        .createQueryBuilder()
        .select('id')
        .where('collection_operation_id = :COID and tenant_id = :tenantId', {
          COID: query.collection_operation_id,
          tenantId,
        })
        .andWhere(':date BETWEEN start_date AND end_date', { date: query.date })
        .andWhere('is_archived=false')
        .execute();
      if (schedule.length !== 0) {
        var scheduleId = schedule[0].id;
      }
      const operationData = await this.scheduleOperationRepository
        .createQueryBuilder()
        .select('operation_id , operation_type')
        .where('schedule_id = :SID', { SID: scheduleId })
        .execute();
      const driveIds = operationData
        .filter(
          (d) => d.operation_type === PolymorphicType.OC_OPERATIONS_DRIVES
        )
        .map((val) => {
          return val.operation_id;
        });

      const sessionIds = operationData
        .filter(
          (s) => s.operation_type === PolymorphicType.OC_OPERATIONS_SESSIONS
        )
        .map((val) => {
          return val.operation_id;
        });

      const nceIds = operationData
        .filter(
          (nce) =>
            nce.operation_type ===
            PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
        )
        .map((val) => {
          return val.operation_id;
        });
      const statusNumber: any[] = Array.isArray(query.operation_status)
        ? query.operation_status.map(Number)
        : [+query.operation_status];
      const collectionOperationId: any = +query.collection_operation_id;
      const sessions = await this.sessionsRepository
        .createQueryBuilder('session')
        .leftJoin('session.donor_center', 'dc')
        .where({
          is_archived: false,
          id: In(sessionIds),
          operation_status_id: In(statusNumber),
          tenant_id: tenantId,
        })
        .andWhere('date = :date', { date: query.date })
        .select([
          'session.tenant_id',
          'session.id',
          'session.date',
          'dc.name', // Assuming 'name' is the column in the 'facility' table
        ])
        .getMany();
      if (driveIds.length !== 0) {
        var drives = await this.drivesRepository
          .createQueryBuilder('drive')
          .select([
            'drive.tenant_id',
            'drive.id',
            'drive.date',
            'location.name',
            'drive.location_id',
          ])
          .leftJoin('drive.account', 'account')
          .leftJoin('drive.location', 'location')
          .where('drive.id IN (:...ID) and drive.tenant_id = :tenant_id', {
            ID: driveIds,
            tenant_id: tenantId,
          }) // Adjusted parameter syntax
          .andWhere('drive.is_archived = false')
          .andWhere('date = :date', { date: query.date })
          .andWhere('drive.operation_status_id IN (:...operationStatus)', {
            operationStatus: statusNumber,
          })
          .getMany();
      }
      const nce = await this.nonCollectionEventsRepository
        .createQueryBuilder('nce')
        .leftJoin('nce.location_id', 'location')
        .where({
          is_archived: false,
          id: In(nceIds),
          status_id: In(statusNumber),
          tenant_id: tenantId,
        })
        .andWhere('date = :date', { date: query.date })
        .select(['nce.tenant_id', 'nce.id', 'nce.date', 'location.name'])
        .getMany();

      const getShifts = async (operationId: bigint, operationType: any) => {
        return this.shiftsRepository.find({
          where: {
            shiftable_id: operationId,
            shiftable_type: operationType,
            tenant_id: tenantId,
          },
          order: {
            start_time: 'ASC',
            end_time: 'DESC',
          },
        });
      };

      const addShiftsToOperations = async (operations: any[], type: any) => {
        return Promise.all(
          operations.map(async (operation) => {
            operation.schedule_id = scheduleId;
            const shifts = await getShifts(operation.id, type);
            const filteredShifts = shifts.filter((shift) => {
              return (
                shift.shiftable_type === PolymorphicType.OC_OPERATIONS_DRIVES ||
                shift.shiftable_type ===
                  PolymorphicType.OC_OPERATIONS_SESSIONS ||
                shift.shiftable_type ===
                  PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
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
                let times: any;
                let loc: any;
                let roles: any;

                times = await this.shiftsProjectionsStaffRepository
                  .createQueryBuilder('shifts_projections_staff')
                  .innerJoin(
                    StaffConfig,
                    'sc',
                    'sc.staff_setup_id = shifts_projections_staff.staff_setup_id AND sc.contact_role_id = :roleId',
                    { roleId: query.role_id }
                  )

                  .select([
                    'sc.lead_time',
                    'sc.setup_time',
                    'sc.breakdown_time',
                    'sc.wrapup_time',
                  ])
                  .where('shifts_projections_staff.shift_id = :shiftId', {
                    shiftId: shift.id,
                  })
                  .getRawMany();

                roles = await this.shiftsProjectionsStaffRepository
                  .createQueryBuilder('shifts_projections_staff')
                  .innerJoin(
                    StaffConfig,
                    'sc',
                    'sc.staff_setup_id = shifts_projections_staff.staff_setup_id '
                  )
                  .innerJoin(ContactsRoles, 'r', 'r.id = sc.contact_role_id')
                  .select(['sc.contact_role_id, r.name'])
                  .where('shifts_projections_staff.shift_id = :shiftId', {
                    shiftId: shift.id,
                  })
                  .getRawMany();
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
                      tenant_id: tenantId,
                    },
                  });

                  const shiftids = projections.map(
                    (projection) => projection.shift_id
                  );

                  if (
                    shift.shiftable_type ===
                    PolymorphicType.OC_OPERATIONS_DRIVES
                  ) {
                    loc = await this.directionRepository
                      .createQueryBuilder('location_directions')
                      .select(['location_directions.minutes'])
                      .where(
                        'collection_operation_id = :collection and tenant_id = :tenantId',
                        {
                          collection: query.collection_operation_id,
                          tenantId,
                        }
                      )
                      .andWhere('location_id = :loc', {
                        loc: operation.location_id,
                      })
                      .getOne();
                  }
                  assignedStaff = await this.staffAssignmentRepository.count({
                    where: {
                      operation_id: shift.shiftable_id,
                      operation_type: shift.shiftable_type,
                      shift_id: In(shiftids),
                      tenant_id: tenantId,
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
                  assignedStaff = await this.staffAssignmentRepository.count({
                    where: {
                      operation_id: shift.shiftable_id,
                      operation_type: shift.shiftable_type,
                      role_id: In(roleId),
                      tenant_id: tenantId,
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
                const productYieldSum = projections.reduce(
                  (sum, projection) => sum + projection.product_yield,
                  0
                );
                const procedureTypeQtySum = projections.reduce(
                  (sum, projection) => sum + projection.procedure_type_qty,
                  0
                );
                if (times[0]) {
                  times[0]['travel_from'] = loc?.minutes;
                }
                return shift.shiftable_type ===
                  PolymorphicType.OC_OPERATIONS_DRIVES ||
                  shift.shiftable_type ===
                    PolymorphicType.OC_OPERATIONS_SESSIONS
                  ? {
                      ...shift,
                      projections: {
                        productYieldSum,
                        procedureTypeQtySum,
                      },
                      staffSetup: {
                        requestedStaff,
                        assignedStaff,
                      },
                      times,
                      roles,
                    }
                  : shift.shiftable_type === 'oc_non_collection_events'
                  ? {
                      ...shift,
                      projections: {
                        productYieldSum,
                        procedureTypeQtySum,
                      },
                      shiftRole: {
                        requestedStaff,
                        assignedStaff,
                      },
                      times: 0,
                    }
                  : null;
              })
            );
            return { ...operation, shifts: shiftsWithProjections };
          })
        );
      };
      if (driveIds.length !== 0) {
        var drivesWithShiftsAndProjections = await addShiftsToOperations(
          drives,
          'drives'
        );
      } else {
        var drivesWithShiftsAndProjections = [];
      }
      const sessionsWithShiftsAndProjections = await addShiftsToOperations(
        sessions,
        'sessions'
      );
      const nonCollectionEventsWithShiftsAndProjections =
        await addShiftsToOperations(nce, 'oc_non_collection_events');
      const data = {
        drive: drivesWithShiftsAndProjections,
        session: sessionsWithShiftsAndProjections,
        nce: nonCollectionEventsWithShiftsAndProjections,
      };
      return data;
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async splitShifts(
    assignment_id: any,
    assignment_type: any,
    schedule_id: any,
    tenantId: any
  ) {
    const scheduleStatus = await this.scheduleRepository
      .createQueryBuilder()
      .select('schedule_status')
      .where('id =:scheduleId AND tenant_id = :TID', {
        scheduleId: schedule_id,
        TID: tenantId,
      })
      .execute();
    if (scheduleStatus.length > 0) {
      var status = scheduleStatus[0].schedule_status;
    }

    if (status == 'Draft') {
      try {
        const staff = await this.staffAssignmentRepository.findOne({
          where: {
            id: assignment_id,
            tenant_id: tenantId,
          },
        });
        staff.split_shift = true;
        const staff_with_split_shift =
          await this.staffAssignmentRepository.save(staff);
        return staff_with_split_shift;
      } catch (error) {
        return resError(
          error.message,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
    } else {
      try {
        let staffAssignmentDraft = null;
        if (assignment_type === 'Draft') {
          // Means the record is present in staff_assignment_draft table but not in staff_assignment table
          const staffAssignmentData = await this.staffAssignmentDraftsRepository
            .createQueryBuilder()
            .where('id = :id AND tenant_id =:TID', {
              id: assignment_id,
              TID: tenantId,
            })
            .execute();
          const sanitizedData = staffAssignmentData.map((obj) =>
            Object.fromEntries(
              Object.entries(obj).map(([key, value]) => [
                key.replace(/^StaffAssignmentsDrafts_/, ''),
                value,
              ])
            )
          );
          sanitizedData[0].split_shift = true;
          staffAssignmentDraft = Object.assign(
            new StaffAssignmentsDrafts(),
            sanitizedData[0]
          );
        } else {
          const staffAssignmentData = await this.staffAssignmentRepository
            .createQueryBuilder()
            .where('id = :assignmentId AND tenant_id = :TID', {
              assignmentId: assignment_id,
              TID: tenantId,
            })
            .execute();
          const sanitizedData = staffAssignmentData.map((obj) =>
            Object.fromEntries(
              Object.entries(obj).map(([key, value]) => [
                key.replace(/^StaffAssignments_/, ''),
                value,
              ])
            )
          );
          sanitizedData[0].staff_assignment_id = sanitizedData[0].id;
          sanitizedData[0].reason = 'C';
          sanitizedData[0].split_shift = true;
          staffAssignmentDraft = Object.assign(
            new StaffAssignmentsDrafts(),
            sanitizedData[0]
          );
        }
        await this.staffAssignmentDraftsRepository.save(staffAssignmentDraft);
      } catch (error) {
        return resError(
          error.message,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
    }
  }
  async updateStaffAssignment(
    query: UpdateAssignStaffParamDto,
    tenant_id: any
  ) {
    const newshiftId = +query.updated_shift_id;
    const newRoleId = +query.updated_role_id;
    const schedule_id = +query.schedule_id;
    const operationId = +query.operation_id;
    const userId = +query.userId;
    const operationType = query.operation_type;

    try {
      const schedule = await this.scheduleRepository.findOne({
        where: {
          id: schedule_id,
          tenant_id: tenant_id,
        },
      });
      if (schedule.schedule_status === 'Published') {
        let assignmentData: any = [];
        if (query.staff_assignment_id != 0) {
          assignmentData = await this.staffAssignmentRepository
            .createQueryBuilder('staffAssignment')
            .where(
              'staffAssignment.id = :staffId and staffAssignment.tenant_id = :tenant_id',
              {
                staffId: query.staff_assignment_id,
                tenant_id,
              }
            )
            .getRawOne();

          const user = new User();
          user.id = BigInt(query.userId);

          const shiftSlots = new ShiftsSlots();
          shiftSlots.id = BigInt(newshiftId);

          const contactRole = new ContactsRoles();
          contactRole.id = BigInt(newRoleId);
          const staffAssignment = new StaffAssignmentsDrafts();
          const staffAssignmentOld = new StaffAssignmentsDrafts();

          staffAssignment.staff_assignment_id = null;
          staffAssignment.reason = 'C';
          staffAssignment.operation_id = BigInt(operationId);
          staffAssignment.operation_type = operationType;
          staffAssignment.shift_id = shiftSlots;
          staffAssignment.shift_start_time =
            assignmentData.staffAssignment_shift_start_time;
          staffAssignment.shift_end_time =
            assignmentData.staffAssignment_shift_end_time;
          staffAssignment.role_id = contactRole;
          staffAssignment.staff_id = assignmentData.staffAssignment_staff_id;
          staffAssignment.is_additional =
            assignmentData.staffAssignment_is_additional;
          staffAssignment.home_base = assignmentData.staffAssignment_home_base;
          staffAssignment.is_travel_time_included =
            assignmentData.staffAssignment_is_travel_time_included;
          staffAssignment.pending_assignment =
            assignmentData.staffAssignment_pending_assignment;
          staffAssignment.lead_time = assignmentData.staffAssignment_lead_time;
          staffAssignment.travel_to_time =
            assignmentData.staffAssignment_travel_to_time;
          staffAssignment.setup_time =
            assignmentData.staffAssignment_setup_time;
          staffAssignment.breakdown_time =
            assignmentData.staffAssignment_breakdown_time;
          staffAssignment.travel_from_time =
            assignmentData.staffAssignment_travel_from_time;
          staffAssignment.wrapup_time =
            assignmentData.staffAssignment_wrapup_time;
          staffAssignment.clock_in_time =
            assignmentData.staffAssignment_clock_in_time;
          staffAssignment.clock_out_time =
            assignmentData.staffAssignment_clock_out_time;
          staffAssignment.total_hours =
            assignmentData.staffAssignment_total_hours;
          staffAssignment.reassign_by = Number(userId);
          staffAssignment.created_by = user;
          staffAssignment.is_notify = false;
          staffAssignment.is_archived =
            assignmentData.staffAssignment_is_archived;
          staffAssignment.tenant_id = assignmentData.staffAssignment_tenant_id;

          for (const key in assignmentData) {
            if (Object.hasOwnProperty.call(assignmentData, key)) {
              const newKey = key.replace('staffAssignment_', ''); // Remove the prefix
              staffAssignmentOld[newKey] = assignmentData[key];
            }
          }
          staffAssignmentOld.reason = 'U';
          const abc = assignmentData.staffAssignment_id;

          staffAssignmentOld['staff_assignment_id'] = abc;
          await this.staffAssignmentDraftsRepository.save(staffAssignmentOld);
          await this.staffAssignmentDraftsRepository.save(staffAssignment);
          // TODO: Calculate to send old staff_id and role_id
          // query.staffId = assignmentData.staffAssignment_staff_id;
          // this.updatePendingAssignment(newshiftId, query, 'Staff', tenant_id);
        } else {
          assignmentData = await this.staffAssignmentDraftsRepository
            .createQueryBuilder('staffAssignment')
            .where(
              'staffAssignment.id = :staffId and staffAssignment.tenant_id = :tenant_id',
              {
                staffId: query.staff_draft_assignment_id,
                tenant_id,
              }
            )
            .getRawOne();
          const user = new User();
          user.id = BigInt(query.userId);

          const shiftSlots = new ShiftsSlots();
          shiftSlots.id = BigInt(newshiftId);

          const contactRole = new ContactsRoles();
          contactRole.id = BigInt(newRoleId);
          const staffAssignment = new StaffAssignmentsDrafts();
          const staffAssignmentOld = new StaffAssignmentsDrafts();

          staffAssignment.staff_assignment_id = null;
          staffAssignment.reason = 'C';
          staffAssignment.operation_id = BigInt(operationId);
          staffAssignment.operation_type = operationType;
          staffAssignment.shift_id = shiftSlots;
          staffAssignment.shift_start_time =
            assignmentData.staffAssignment_shift_start_time;
          staffAssignment.shift_end_time =
            assignmentData.staffAssignment_shift_end_time;
          staffAssignment.role_id = contactRole;
          staffAssignment.staff_id = assignmentData.staffAssignment_staff_id;
          staffAssignment.is_additional =
            assignmentData.staffAssignment_is_additional;
          staffAssignment.home_base = assignmentData.staffAssignment_home_base;
          staffAssignment.is_travel_time_included =
            assignmentData.staffAssignment_is_travel_time_included;
          staffAssignment.pending_assignment =
            assignmentData.staffAssignment_pending_assignment;
          staffAssignment.lead_time = assignmentData.staffAssignment_lead_time;
          staffAssignment.travel_to_time =
            assignmentData.staffAssignment_travel_to_time;
          staffAssignment.setup_time =
            assignmentData.staffAssignment_setup_time;
          staffAssignment.breakdown_time =
            assignmentData.staffAssignment_breakdown_time;
          staffAssignment.travel_from_time =
            assignmentData.staffAssignment_travel_from_time;
          staffAssignment.wrapup_time =
            assignmentData.staffAssignment_wrapup_time;
          staffAssignment.clock_in_time =
            assignmentData.staffAssignment_clock_in_time;
          staffAssignment.clock_out_time =
            assignmentData.staffAssignment_clock_out_time;
          staffAssignment.total_hours =
            assignmentData.staffAssignment_total_hours;
          staffAssignment.reassign_by = Number(userId);
          staffAssignment.created_by = user;
          staffAssignment.is_notify = false;
          staffAssignment.is_archived =
            assignmentData.staffAssignment_is_archived;
          staffAssignment.tenant_id = assignmentData.staffAssignment_tenant_id;

          for (const key in assignmentData) {
            if (Object.hasOwnProperty.call(assignmentData, key)) {
              const newKey = key.replace('staffAssignment_', ''); // Remove the prefix
              staffAssignmentOld[newKey] = assignmentData[key];
            }
          }
          staffAssignmentOld.reason = 'U';

          const Uquery = await this.staffAssignmentDraftsRepository
            .createQueryBuilder('staff_assignments_drafts')
            .where(
              'staff_assignments_drafts.operation_id = :operationId and staff_assignments_drafts.tenant_id = :tenant_id',
              {
                operationId,
                tenant_id,
              }
            )
            .andWhere('staff_assignments_drafts.shift_id = :shiftId', {
              shiftId: newshiftId,
            })
            .andWhere(
              'staff_assignments_drafts.operation_type = :operationType',
              {
                operationType: query.operation_type,
              }
            )
            .andWhere('staff_assignments_drafts.staff_id = :staffId', {
              staffId: staffAssignment.staff_id,
            })
            .andWhere('staff_assignments_drafts.role_id = :roleId', {
              roleId: newRoleId,
            });

          const data = await Uquery.execute();
          Uquery.delete().execute();
          if (data.length > 0) {
            if (
              staffAssignment.shift_id !=
                data[0].staff_assignments_drafts_shift_id &&
              staffAssignment.role_id !=
                data[0].staff_assignments_drafts_role_id &&
              staffAssignment.staff_id !=
                data[0].staff_assignments_drafts_staff_id
            ) {
              await this.staffAssignmentDraftsRepository.save(staffAssignment);
            } else {
              await this.staffAssignmentDraftsRepository
                .createQueryBuilder('staff_assignments_drafts')
                .delete()
                .where(
                  'staff_assignments_drafts.operation_id = :operationId and staff_assignments_drafts.tenant_id = :tenant_id',
                  {
                    operationId: staffAssignmentOld.operation_id,
                    tenant_id,
                  }
                )
                .andWhere('staff_assignments_drafts.shift_id = :shiftId', {
                  shiftId: staffAssignmentOld.shift_id,
                })
                .andWhere(
                  'staff_assignments_drafts.operation_type = :operationType',
                  {
                    operationType: staffAssignmentOld.operation_type,
                  }
                )
                .andWhere('staff_assignments_drafts.staff_id = :staffId', {
                  staffId: staffAssignmentOld.staff_id,
                })
                .andWhere('staff_assignments_drafts.role_id = :roleId', {
                  roleId: staffAssignmentOld.role_id,
                })
                .andWhere('staff_assignments_drafts.is_notify = false')
                .execute();
            }

            if (
              staffAssignmentOld.shift_id !=
                data[0].staff_assignments_drafts_shift_id &&
              staffAssignmentOld.role_id !=
                data[0].staff_assignments_drafts_role_id &&
              staffAssignmentOld.staff_id !=
                data[0].staff_assignments_drafts_staff_id
            ) {
              await this.staffAssignmentDraftsRepository.save(
                staffAssignmentOld
              );
            }
          } else {
            await this.staffAssignmentDraftsRepository
              .createQueryBuilder('staff_assignments_drafts')
              .delete()
              .where(
                'staff_assignments_drafts.operation_id = :operationId and staff_assignments_drafts.tenant_id = :tenant_id ',
                {
                  operationId: staffAssignmentOld.operation_id,
                  tenant_id,
                }
              )
              .andWhere('staff_assignments_drafts.shift_id = :shiftId', {
                shiftId: staffAssignmentOld.shift_id,
              })
              .andWhere(
                'staff_assignments_drafts.operation_type = :operationType',
                {
                  operationType: staffAssignmentOld.operation_type,
                }
              )
              .andWhere('staff_assignments_drafts.staff_id = :staffId', {
                staffId: staffAssignmentOld.staff_id,
              })
              .andWhere('staff_assignments_drafts.role_id = :roleId', {
                roleId: staffAssignmentOld.role_id,
              })
              .andWhere('staff_assignments_drafts.is_notify = false')
              .execute();
            await this.staffAssignmentDraftsRepository.save(staffAssignment);
          }
        }
        return resSuccess(
          'Resource Updated.',
          SuccessConstants.SUCCESS,
          HttpStatus.OK
        );
      } else {
        if (
          query.staff_assignment_id == 0 &&
          query.staff_draft_assignment_id != 0
        ) {
          await this.staffAssignmentRepository
            .createQueryBuilder('staff_assignments_drafts')
            .update(StaffAssignmentsDrafts)
            .set({
              shift_id: BigInt(
                newshiftId
              ) as unknown as QueryDeepPartialEntity<StaffAssignmentsDrafts>['shift_id'],
              role_id: BigInt(
                newRoleId
              ) as unknown as QueryDeepPartialEntity<StaffAssignmentsDrafts>['role_id'],
              operation_id: BigInt(
                operationId
              ) as unknown as QueryDeepPartialEntity<StaffAssignmentsDrafts>['operation_id'],
              operation_type: operationType.toString(),
            })
            .where(
              'staff_assignments_drafts.id = :staffId and staff_assignments_drafts.tenant_id = :tenant_id',
              {
                staffId: query.staff_draft_assignment_id,
                tenant_id,
              }
            )
            .execute();
        } else {
          await this.staffAssignmentRepository
            .createQueryBuilder('staff_assignments')
            .update(StaffAssignments)
            .set({
              shift_id: BigInt(
                newshiftId
              ) as unknown as QueryDeepPartialEntity<StaffAssignments>['shift_id'],
              role_id: BigInt(
                newRoleId
              ) as unknown as QueryDeepPartialEntity<StaffAssignments>['role_id'],
              operation_id: BigInt(
                operationId
              ) as unknown as QueryDeepPartialEntity<StaffAssignments>['operation_id'],
              operation_type: operationType.toString(),
            })
            .where(
              'staff_assignments.id = :staffId and staff_assignments.tenant_id = :tenant_id',
              {
                staffId: query.staff_assignment_id,
                tenant_id,
              }
            )
            .execute();
        }

        return resSuccess(
          'Resource Updated.',
          SuccessConstants.SUCCESS,
          HttpStatus.OK
        );
      }
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getScheduleData(
    operation_id: any,
    operation_type: any,
    schedule_id: any,
    tenantId: any
  ) {
    try {
      const scheduleData = await this.scheduleRepository
        .createQueryBuilder('schedule')
        .where('schedule.id = :id AND schedule.tenant_id = :TID', {
          id: schedule_id,
          TID: tenantId,
        })
        .getRawOne();
      const schedule = {
        tenant_id: scheduleData.schedule_tenant_id,
        id: scheduleData.schedule_id,
        start_date: scheduleData.schedule_start_date,
        end_date: scheduleData.schedule_end_date,
        collection_operation_id: scheduleData.schedule_collection_operation_id,
        operation_status: [],
      };
      if (scheduleData) {
        const scheduleOperation = await this.scheduleOperationStatusRepository
          .createQueryBuilder('schedule_operation_status')
          .where('schedule_id = schedule_id')
          .select(['operation_status_id'])
          .getRawMany();
        schedule.operation_status = scheduleOperation.map(
          (val) => val.operation_status_id
        );
        let operation: any;
        switch (operation_type) {
          case PolymorphicType.OC_OPERATIONS_DRIVES:
            const drives = await this.drivesRepository.findOne({
              where: {
                id: operation_id,
                tenant_id: tenantId,
              },
            });
            operation = {
              tenant_id: drives.tenant_id,
              id: drives.id,
              date: drives.date,
              operation_status: drives.operation_status_id,
              type: PolymorphicType.OC_OPERATIONS_DRIVES,
            };
            break;
          case PolymorphicType.OC_OPERATIONS_SESSIONS:
            const sessions = await this.sessionsRepository.findOne({
              where: {
                id: operation_id,
                tenant_id: tenantId,
              },
            });
            operation = {
              tenant_id: sessions.tenant_id,
              id: sessions.id,
              date: sessions.date,
              operation_status: sessions.operation_status_id,
              type: PolymorphicType.OC_OPERATIONS_SESSIONS,
            };
            break;
          case 'oc_non_collection_events':
            const nce = await this.nonCollectionEventsRepository.findOne({
              where: {
                id: operation_id,
                tenant_id: tenantId,
              },
            });
            operation = {
              tenant_id: nce.tenant_id,
              id: nce.id,
              date: nce.date,
              operation_status: nce.status_id,
              type: 'oc_non_collection_events',
            };
            break;
          default:
            break;
        }
        return { schedule, operation };
      }
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getCertification(operation_id: any, tenantId: any) {
    try {
      const certifications = await this.drivesCerticationsRepository.find({
        where: {
          drive_id: operation_id,
        },
      });

      const ids = certifications.map((val: any) => val.certification_id);

      const certified = await this.certicationRepository.find({
        where: {
          id: In(ids),
          tenant_id: tenantId,
        },
      });
      return certified;
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, 404);
    }
  }
  async getVehiclesData(
    operationId: any,
    shiftId: any,
    operationType: any,
    schduled_status: any,
    tenant_id: any
  ): Promise<any> {
    try {
      let assignedVehiclesData;

      const isPublished = schduled_status === 'Draft' ? false : true;

      const query = this.queryForGetVehiclesData(shiftId, false, tenant_id);
      assignedVehiclesData = await query.getRawMany();

      if (isPublished) {
        const query = this.queryForGetVehiclesData(
          shiftId,
          isPublished,
          tenant_id
        );
        const assignedVehiclesDraftData = await query.getRawMany();

        if (assignedVehiclesDraftData.length > 0) {
          assignedVehiclesDraftData.forEach((item) => {
            item.vehicle_assignment_draft_id = item.vehicle_assignment_id;
            item.vehicle_assignment_id = null;
          });
        }
        assignedVehiclesData = assignedVehiclesData.concat(
          assignedVehiclesDraftData
        );
      }

      const requestedVehiclesData = await this.shiftsVehiclesRepository
        .createQueryBuilder('sv')
        .leftJoin(
          Vehicle,
          'v',
          `sv.vehicle_id = v.id AND v.is_archived = false AND v.tenant_id = ${tenant_id}`
        )
        .leftJoin(
          VehicleType,
          'vt',
          `v.vehicle_type_id = vt.id AND vt.is_archived = false AND vt.tenant_id = ${tenant_id}`
        )
        .where('sv.shift_id = :shiftId AND sv.is_archived =  false', {
          shiftId: shiftId,
        })
        .select([
          'v.id as requested_vehicle_id',
          'v.tenant_id as tenant_id',
          'vt.id as requested_vehicle_type_id',
          'vt.name as requested_vehicle_type',
        ])
        .getRawMany();

      const totalRequiredVehicles = [];
      requestedVehiclesData.forEach((item) => {
        totalRequiredVehicles.push({
          requested_vehicle_type_id: item.requested_vehicle_type_id,
          requested_vehicle_type_name: item.requested_vehicle_type,
          tenant_id: item.tenant_id,
        });
      });
      assignedVehiclesData.forEach((element2) => {
        const index = totalRequiredVehicles.findIndex(
          (element) =>
            element.requested_vehicle_type_id ==
            element2.requested_vehicle_type_id
        );
        if (index !== -1) {
          totalRequiredVehicles.splice(index, 1);
        }
      });

      totalRequiredVehicles.forEach((item) => {
        assignedVehiclesData.push({
          vehicle_assignment_id: null,
          tenant_id: item.tenant_id,
          vehicle_assignment_draft_id: null,
          requested_vehicle_id: item.requested_vehicle_type_id,
          requested_vehicle_type: item.requested_vehicle_type_name,
          assigned_vehicle_id: null,
          assigned_vehicle: null,
          is_additional: false,
          pending_assignment: false,
          schedule_dates: null,
        });
      });
      return assignedVehiclesData;
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  queryForGetVehiclesData(shiftId, isPublished = false, tenant_id) {
    const whereCondition = isPublished
      ? `va.shift_id = ${shiftId} and va.is_notify = false and va.tenant_id = ${tenant_id}`
      : `va.shift_id = ${shiftId} and va.tenant_id = ${tenant_id}`;

    const baseTable = isPublished
      ? this.vehicleAssignmentDraftRepository
      : this.vehicleAssignmentRepository;

    const query = baseTable
      .createQueryBuilder('va')
      .leftJoin(Vehicle, 'v', 'v.id=va.assigned_vehicle_id')
      .leftJoin(VehicleType, 'vt', 'vt.id = va.requested_vehicle_type_id')
      .leftJoin(
        Sessions,
        'se',
        `se.id = va.operation_id AND va.operation_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'`
      )
      .leftJoin(
        Drives,
        'dr',
        `dr.id = va.operation_id AND va.operation_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'`
      )
      .leftJoin(
        NonCollectionEvents,
        'ne',
        `ne.id = va.operation_id AND va.operation_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'`
      )
      .select([
        'va.id as vehicle_assignment_id',
        'va.tenant_id as tenant_id',
        'null as vehicle_assignment_draft_id',
        'va.requested_vehicle_type_id as requested_vehicle_id',
        'vt.name as requested_vehicle_type',
        'va.assigned_vehicle_id as assigned_vehicle_id',
        'v.name as assigned_vehicle',
        'va.is_additional as is_additional',
        'va.pending_assignment as pending_assignment',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select(
            'ARRAY_AGG(DISTINCT COALESCE(DATE(se.date), DATE(dr.date), DATE(ne.date)))',
            'scheduled_dates'
          )
          .from('vehicles_assignments_drafts', 'sub_va')
          .leftJoin(
            Sessions,
            'se',
            `se.id = sub_va.operation_id AND sub_va.operation_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'`
          )
          .leftJoin(
            Drives,
            'dr',
            `dr.id = sub_va.operation_id AND sub_va.operation_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'`
          )
          .leftJoin(
            NonCollectionEvents,
            'ne',
            `ne.id = sub_va.operation_id AND sub_va.operation_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'`
          )
          .where('sub_va.assigned_vehicle_id = va.assigned_vehicle_id');
      }, 'scheduled_dates')
      .where(whereCondition);

    return query;
  }

  async unassignVehicle(
    operationId: any,
    shiftId: any,
    @Query() query: UnAssignVehicleParamDto,
    tenant_id: any
  ) {
    try {
      if (query.vehicle_assignment_draft_id !== null) {
        await this.vehicleAssignmentDraftRepository
          .createQueryBuilder('vehicles_assignments_drafts')
          .delete()
          .from('vehicles_assignments_drafts')
          .where(
            'id = :vehicle_assignment_draft_id and tenant_id = :tenant_id',
            {
              vehicle_assignment_draft_id: query.vehicle_assignment_draft_id,
              tenant_id,
            }
          )
          .execute();
        await this.updatePendingAssignment(shiftId, null, 'Vehicle', tenant_id);
      } else if (query.vehicle_assignment_id !== null) {
        await this.vehicleAssignmentRepository
          .createQueryBuilder('vehicles_assignments')
          .delete()
          .from('vehicles_assignments')
          .where('id = :vehicle_assignment_id and tenant_id = :tenant_id', {
            vehicle_assignment_id: query.vehicle_assignment_id,
            tenant_id,
          })
          .execute();
        await this.updatePendingAssignment(shiftId, null, 'Vehicle', tenant_id);
      }
      return resSuccess(
        'Resource Removed.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  //#region  Implementation for device endpoints

  async getDevicesData(
    operationId: any,
    shiftId: any,
    operationType: any,
    schduled_status: any,
    tenantId: any
  ): Promise<any> {
    let assignedDevicesData;

    const isPublished = schduled_status === 'Draft' ? false : true;

    const query = this.queryForGetDevicesData(shiftId, false, tenantId);
    assignedDevicesData = await query.getRawMany();

    if (isPublished) {
      const query = this.queryForGetDevicesData(shiftId, isPublished, tenantId);
      const assignedDevicesDraftData = await query.getRawMany();

      if (assignedDevicesDraftData.length > 0) {
        assignedDevicesDraftData.forEach((item) => {
          item.device_assignment_draft_id = item.device_assignment_id;
          item.device_assignment_id = null;
        });
      }
      assignedDevicesData = assignedDevicesData.concat(
        assignedDevicesDraftData
      );
    }
    const requestedDevicesData = await this.shiftDevicesRepository
      .createQueryBuilder('sd')
      .leftJoin(
        Device,
        'd',
        `sd.device_id = d.id AND d.is_archived = false AND d.tenant_id = ${tenantId}`
      )
      .leftJoin(
        DeviceType,
        'dt',
        `d.device_type_id = dt.id AND dt.is_archive = false AND dt.tenant_id = ${tenantId}`
      )
      .where('sd.shift_id = :shiftId AND sd.is_archived =  false', {
        shiftId: shiftId,
      })
      .select([
        'd.id as requested_device_id',
        'd.tenant_id as tenant_id',
        'dt.id as requested_device_type_id',
        'dt.name as requested_device_type',
      ])
      .getRawMany();
    const totalRequiredDevices = [];
    requestedDevicesData.forEach((item) => {
      totalRequiredDevices.push({
        requested_device_type_id: item.requested_device_type_id,
        requested_device_type_name: item.requested_device_type,
        tenant_id: item.tenant_id,
      });
    });
    assignedDevicesData.forEach((element2) => {
      const index = totalRequiredDevices.findIndex(
        (element) =>
          element.requested_device_type_id == element2.requested_device_type_id
      );
      if (index !== -1) {
        totalRequiredDevices.splice(index, 1);
      }
    });
    totalRequiredDevices.forEach((item) => {
      assignedDevicesData.push({
        device_assignment_id: null,
        tenant_id: item.tenant_id,
        device_assignment_draft_id: null,
        requested_device_id: item.requested_device_type_id,
        requested_device_type: item.requested_device_type_name,
        assigned_device_id: null,
        assigned_device: null,
        is_additional: false,
        pending_assignment: false,
        schedule_dates: null,
      });
    });
    return assignedDevicesData;
  }

  queryForGetDevicesData(shiftId, isPublished = false, tenantId) {
    const whereCondition = isPublished
      ? `da.shift_id = ${shiftId} and da.is_notify = false and da.tenant_id = ${tenantId}`
      : `da.shift_id = ${shiftId} and da.tenant_id = ${tenantId}`;

    const baseTable = isPublished
      ? this.deviceAssignmentsDraftsRepository
      : this.deviceAssignmentRepository;

    const query = baseTable
      .createQueryBuilder('da')
      .leftJoin(Device, 'd', 'd.id=da.assigned_device_id')
      .leftJoin(DeviceType, 'dt', 'dt.id = da.requested_device_type_id')
      .leftJoin(
        Sessions,
        'se',
        `se.id = da.operation_id AND da.operation_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'`
      )
      .leftJoin(
        Drives,
        'dr',
        `dr.id = da.operation_id AND da.operation_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'`
      )
      .leftJoin(
        NonCollectionEvents,
        'ne',
        `ne.id = da.operation_id AND da.operation_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'`
      )
      .select([
        'da.tenant_id as tenant_id',
        'da.id as device_assignment_id',
        'null as device_assignment_draft_id',
        'da.requested_device_type_id as requested_device_id',
        'dt.name as requested_device_type',
        'da.assigned_device_id as assigned_device_id',
        'd.name as assigned_device',
        'da.is_additional as is_additional',
        'da.pending_assignment as pending_assignment',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select(
            'ARRAY_AGG(DISTINCT COALESCE(DATE(se.date), DATE(dr.date), DATE(ne.date)))',
            'scheduled_dates'
          )
          .from('devices_assignments_drafts', 'sub_da')
          .leftJoin(
            Sessions,
            'se',
            `se.id = sub_da.operation_id AND sub_da.operation_type = '${PolymorphicType.OC_OPERATIONS_SESSIONS}'`
          )
          .leftJoin(
            Drives,
            'dr',
            `dr.id = sub_da.operation_id AND sub_da.operation_type = '${PolymorphicType.OC_OPERATIONS_DRIVES}'`
          )
          .leftJoin(
            NonCollectionEvents,
            'ne',
            `ne.id = sub_da.operation_id AND sub_da.operation_type = '${PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS}'`
          )
          .where('sub_da.assigned_device_id = da.assigned_device_id');
      }, 'scheduled_dates')
      .where(whereCondition);

    return query;
  }

  async unassignDevice(
    operationId: any,
    shiftId: any,
    @Query() query: UnassignDeviceParamDto
  ) {
    try {
      if (query.device_assignment_draft_id !== null) {
        await this.deviceAssignmentsDraftsRepository
          .createQueryBuilder('devices_assignments_drafts')
          .delete()
          .from('devices_assignments_drafts')
          .where('id = :device_assignment_draft_id AND tenant_id = :TID', {
            device_assignment_draft_id: query.device_assignment_draft_id,
            TID: query.tenant_id,
          })
          .execute();
        await this.updatePendingAssignment(
          shiftId,
          null,
          'Device',
          query.tenant_id
        );
      } else if (query.device_assignment_id !== null) {
        await this.deviceAssignmentRepository
          .createQueryBuilder('devices_assignments')
          .delete()
          .from('devices_assignments')
          .where('id = :device_assignment_id AND tenant_id = :TID', {
            device_assignment_id: query.device_assignment_id,
            TID: query.tenant_id,
          })
          .execute();
        await this.updatePendingAssignment(
          shiftId,
          null,
          'Device',
          query.tenant_id
        );
      }
      return resSuccess(
        'Resource Removed.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async reassignDevice(@Query() query: ReAssignVehicleParamDto) {
    try {
      const schedule = await this.scheduleRepository
        .createQueryBuilder()
        .select('id')
        .where('collection_operation_id = :COID', {
          COID: query.collection_operation_id,
          tenantId: query.tenant_id,
        })
        .andWhere(':date BETWEEN start_date AND end_date', { date: query.date })
        .andWhere('is_archived=false')
        .execute();

      if (schedule.length !== 0) {
        var scheduleId = schedule[0].id;
      }

      const operationStatus = await this.scheduleRepository
        .createQueryBuilder('sch')
        .leftJoin(ScheduleOperationStatus, 'sos', 'sos.schedule_id = sch.id')
        .select(['sos.operation_status_id'])
        .where({
          collection_operation_id: query.collection_operation_id,
          tenant_id: query.tenant_id,
        })
        .getRawMany();

      const status: any[] = operationStatus.map(
        (val) => +val.operation_status_id
      );
      const getSchedules = await this.scheduleRepository
        .createQueryBuilder('sc')
        .leftJoin(
          ScheduleOperation,
          'so',
          'so.schedule_id = sc.id AND so.in_sync = true'
        )
        .select(['operation_id', 'operation_type'])
        .where('collection_operation_id = :COID', {
          COID: query.collection_operation_id,
        })
        .getRawMany();

      const drive = getSchedules
        .filter(
          (d) => d.operation_type === PolymorphicType.OC_OPERATIONS_DRIVES
        )
        .map((val) => {
          return val.operation_id;
        });
      const session = getSchedules
        .filter(
          (d) => d.operation_type === PolymorphicType.OC_OPERATIONS_SESSIONS
        )
        .map((val) => {
          return val.operation_id;
        });
      const nce1 = getSchedules
        .filter(
          (d) =>
            d.operation_type ===
            PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
        )
        .map((val) => {
          return val.operation_id;
        });
      let drives: any, sessions: any, nce: any;
      if (drive.length > 0) {
        drives = await this.drivesRepository
          .createQueryBuilder('drive')
          .leftJoinAndSelect('drive.location', 'location')
          .where('drive.id IN (:...IDS) AND drive.tenant_id = :TID', {
            IDS: drive,
            TID: query.tenant_id,
          })
          .andWhere('drive.is_archived = :isArchived', { isArchived: false })
          .andWhere('drive.date = :date', { date: new Date(query.date) })
          .andWhere('drive.operation_status_id IN (:...status)', { status })
          .select([
            'drive.tenant_id as tenant_id',
            'drive.id as id',
            'drive.date',
            'location.name',
            'drive.location_id as location_id',
          ])
          .getRawMany();
      }
      if (session.length > 0) {
        sessions = await this.sessionsRepository
          .createQueryBuilder('session')
          .leftJoinAndSelect('session.donor_center', 'dc')
          .where('session.id IN (:...IDS) AND session.tenant_id = :TID', {
            IDS: session,
            TID: query.tenant_id,
          })
          .andWhere('session.is_archived = :isArchived', { isArchived: false })
          .andWhere('session.date = :date', { date: new Date(query.date) })
          .andWhere('session.operation_status_id IN (:...status)', { status })
          .select([
            'session.tenant_id as tenant_id',
            'session.id as id',
            'session.date',
            'dc.name',
          ])
          .getRawMany();
      }
      if (nce1.length > 0) {
        nce = await this.nonCollectionEventsRepository
          .createQueryBuilder('nce')
          .leftJoinAndSelect('nce.location_id', 'location')
          .where('nce.id IN (:...IDS) AND nce.tenant_id = :TID', {
            IDS: nce1,
            TID: query.tenant_id,
          })
          .andWhere('nce.is_archived = :isArchived', { isArchived: false })
          .andWhere('nce.date = :date', { date: new Date(query.date) })
          .andWhere('nce.status_id IN (:...status)', { status })
          .select([
            'nce.tenant_id as tenant_id',
            'nce.id as id',
            'nce.date',
            'location.name',
            'nce.location_id as location_id',
          ])
          .getRawMany();
      }
      const getShifts = async (operationId: bigint, operationType: any) => {
        return this.shiftsRepository.find({
          where: {
            shiftable_id: operationId,
            shiftable_type: operationType,
          },
          order: {
            start_time: 'ASC',
            end_time: 'DESC',
          },
          select: [
            'id',
            'start_time',
            'end_time',
            'shiftable_type',
            'oef_procedures',
            'oef_products',
            'tenant_id',
          ],
        });
      };
      const addShiftsToOperations = async (operations: any[], type: any) => {
        return Promise.all(
          operations.map(async (operation) => {
            operation.schedule_id = scheduleId;
            const shifts = await getShifts(operation.id, type);
            const shiftsWithProjections = await Promise.all(
              shifts.map(async (shift) => {
                const projections: any[] =
                  await this.shiftsProjectionsStaffRepository.find({
                    where: { shift_id: shift.id },
                  });
                const ssIds = await projections.map(
                  (val) => val.staff_setup_id
                );

                const times: any = await this.staffConfigRepository
                  .createQueryBuilder('sc')
                  .where({
                    staff_setup_id: In(ssIds),
                  })
                  .select('MAX(breakdown_time)')
                  .getRawMany();
                let loc: any;
                if (
                  shift.shiftable_type ===
                    PolymorphicType.OC_OPERATIONS_DRIVES ||
                  shift.shiftable_type ===
                    PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
                ) {
                  loc = await this.directionRepository
                    .createQueryBuilder('location_directions')
                    .where(
                      'collection_operation_id = :collection AND tenant_id = :TID',
                      {
                        collection: query.collection_operation_id,
                        TID: query.tenant_id,
                      }
                    )
                    .andWhere('location_id = :loc', {
                      loc: operation.location_id,
                    })
                    .select(
                      'location_directions.minutes',
                      'location_directions.tenant_id'
                    )
                    .getRawOne();
                } else {
                  loc = 0;
                }
                const productYieldSum = projections.reduce(
                  (sum, projection) => sum + projection.product_yield,
                  0
                );

                const procedureTypeQtySum = projections.reduce(
                  (sum, projection) => sum + projection.procedure_type_qty,
                  0
                );
                const shiftStartTime = new Date(shift.start_time);
                const minutesToSubtract = loc?.location_directions_minutes; // Assuming loc contains the minutes value

                // Subtract minutes from the shift start time
                shiftStartTime.setMinutes(
                  shiftStartTime.getMinutes() - minutesToSubtract
                );

                // Format the resulting time
                const formattedTime = shiftStartTime.toLocaleTimeString(
                  'en-US',
                  {
                    hour12: false,
                    hour: 'numeric',
                    minute: 'numeric',
                  }
                );
                const shiftEndTime = new Date(shift.end_time);
                const minutesToAdd = loc?.location_directions_minutes;
                shiftEndTime.setMinutes(
                  shiftEndTime.getMinutes() + minutesToAdd
                );

                // Format the resulting time
                const formattedTime2 = shiftEndTime.toLocaleTimeString(
                  'en-US',
                  {
                    hour12: false,
                    hour: 'numeric',
                    minute: 'numeric',
                  }
                );
                return shift.shiftable_type ===
                  PolymorphicType.OC_OPERATIONS_DRIVES ||
                  shift.shiftable_type ===
                    PolymorphicType.OC_OPERATIONS_SESSIONS
                  ? {
                      ...shift,
                      projections: {
                        productYieldSum,
                        procedureTypeQtySum,
                      },
                      staffSetup: {
                        depart_time: formattedTime,
                        return_hours: formattedTime2,
                      },
                    }
                  : shift.shiftable_type === 'oc_non_collection_events'
                  ? {
                      ...shift,
                      shift_roles_qty: {
                        depart_time: formattedTime,
                        return_hours: formattedTime2,
                      },
                    }
                  : null;
              })
            );
            return { ...operation, shifts: shiftsWithProjections };
          })
        );
      };
      let drivess: any, sessionss: any, nonCollectionEvents: any;
      if (drives !== undefined) {
        drivess = await addShiftsToOperations(
          drives,
          PolymorphicType.OC_OPERATIONS_DRIVES
        );
      }
      if (sessions !== undefined) {
        sessionss = await addShiftsToOperations(
          sessions,
          PolymorphicType.OC_OPERATIONS_SESSIONS
        );
      }
      if (nce !== undefined) {
        nonCollectionEvents = await addShiftsToOperations(
          nce,
          PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
        );
      }

      const data = {
        drive: drivess,
        session: sessionss,
        nce: nonCollectionEvents,
      };
      return data;
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async updateAssignDevice(query: UpdateAssignDeviceParamDto) {
    try {
      const isDraftLogicFullyImplemented = true;

      if (isDraftLogicFullyImplemented) {
        if (
          query.device_assignment_draft_id.toString() === 'null' ||
          query.device_assignment_draft_id.toString() === 'undefined'
        ) {
          await this.deviceAssignmentRepository
            .createQueryBuilder('da')
            .update(DeviceAssignments)
            .set({
              shift_id: query.updated_shift_id,
              operation_id: query.updated_operation_id,
              operation_type: query.updated_operation_type,
            })
            .where('id = :device_assignment_id AND tenant_id = :TID', {
              device_assignment_id: query.device_assignment_id,
              TID: query.tenant_id,
            })
            .execute();
        } else {
          await this.deviceAssignmentsDraftsRepository
            .createQueryBuilder('da')
            .update(DeviceAssignmentsDrafts)
            .set({
              shift_id: query.updated_shift_id,
              operation_id: query.updated_operation_id,
              operation_type: query.updated_operation_type,
            })
            .where('id = :device_assignment_draft_id AND tenant_id = :TID', {
              device_assignment_draft_id: query.device_assignment_draft_id,
              TID: query.tenant_id,
            })
            .execute();
        }
      } else {
        const data = await this.deviceAssignmentRepository
          .createQueryBuilder('da')
          .update(DeviceAssignments)
          .set({
            shift_id: query.updated_shift_id,
            operation_id: query.updated_operation_id,
            operation_type: query.updated_operation_type,
          })
          .where(
            'shift_id = :shiftId AND requested_device_type_id = :RDID AND assigned_device_id = :ADID AND tenant_id = :TID',
            {
              shiftId: query.old_shift_id,
              RDID: query.requested_device_id,
              ADID: query.assigned_device_id,
              TID: query.tenant_id,
            }
          )
          .execute();
      }

      return resSuccess(
        'Resource Updated.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  //#endregion

  async reassignVehicle(
    @Query() query: ReAssignVehicleParamDto,
    tenant_id: any
  ) {
    try {
      const schedule = await this.scheduleRepository
        .createQueryBuilder()
        .select('id')
        .where('collection_operation_id = :COID', {
          COID: query.collection_operation_id,
        })
        .andWhere(':date BETWEEN start_date AND end_date', { date: query.date })
        .andWhere('is_archived=false')
        .execute();

      if (schedule.length !== 0) {
        var scheduleId = schedule[0].id;
      }
      const operationStatus = await this.scheduleRepository
        .createQueryBuilder('sch')
        .leftJoin(ScheduleOperationStatus, 'sos', 'sos.schedule_id = sch.id')
        .select(['sos.operation_status_id'])
        .where({
          collection_operation_id: query.collection_operation_id,
          tenant_id: tenant_id,
        })
        .getRawMany();

      const status: any[] = operationStatus.map(
        (val) => +val.operation_status_id
      );
      const getSchedules = await this.scheduleRepository
        .createQueryBuilder('sc')
        .leftJoin(
          ScheduleOperation,
          'so',
          'so.schedule_id = sc.id AND so.in_sync = true'
        )
        .select(['operation_id', 'operation_type'])
        .where(
          'collection_operation_id = :COID and sc.tenant_id = :tenant_id',
          {
            COID: query.collection_operation_id,
            tenant_id,
          }
        )
        .getRawMany();

      const drive = getSchedules
        .filter(
          (d) => d.operation_type === PolymorphicType.OC_OPERATIONS_DRIVES
        )
        .map((val) => {
          return val.operation_id;
        });
      const session = getSchedules
        .filter(
          (d) => d.operation_type === PolymorphicType.OC_OPERATIONS_SESSIONS
        )
        .map((val) => {
          return val.operation_id;
        });
      const nce1 = getSchedules
        .filter(
          (d) =>
            d.operation_type ===
            PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
        )
        .map((val) => {
          return val.operation_id;
        });
      let drives: any, sessions: any, nce: any;
      if (drive.length > 0) {
        drives = await this.drivesRepository
          .createQueryBuilder('drive')
          .leftJoinAndSelect('drive.location', 'location')
          .leftJoin('drive.account', 'account')
          .where('drive.id IN (:...IDS) and drive.tenant_id = :tenant_id', {
            IDS: drive,
            tenant_id,
          })
          .andWhere('drive.is_archived = :isArchived', { isArchived: false })
          .andWhere('drive.date = :date', { date: new Date(query.date) })
          .andWhere('drive.operation_status_id IN (:...status)', { status })
          .andWhere('account.collection_operation = :collectionOperationId', {
            collectionOperationId: query.collection_operation_id,
          })
          .select([
            'drive.tenant_id as tenant_id',
            'drive.id as id',
            'drive.date',
            'location.name',
            'drive.location_id as location_id',
          ])
          .getRawMany();
      }
      if (session.length > 0) {
        sessions = await this.sessionsRepository
          .createQueryBuilder('session')
          .leftJoinAndSelect('session.donor_center', 'dc')
          .where('session.id IN (:...IDS)', { IDS: session })
          .andWhere('session.is_archived = :isArchived', { isArchived: false })
          .andWhere('session.date = :date', { date: new Date(query.date) })
          .andWhere('session.operation_status_id IN (:...status)', { status })
          .andWhere(
            'session.collection_operation_id =:collectionOperationId and session.tenant_id = :tenant_id',
            {
              collectionOperationId: query.collection_operation_id,
              tenant_id,
            }
          )
          .select([
            'session.tenant_id as tenant_id',
            'session.id as id',
            'session.date',
            'dc.name',
          ])
          .getRawMany();
      }
      if (nce1.length > 0) {
        nce = await this.nonCollectionEventsRepository
          .createQueryBuilder('nce')
          .innerJoin(
            'nce_collection_operations',
            'nceco',
            'nceco.nce_id = nce.id AND nceco.business_unit_id = :businessUnitId and nce.tenant_id = :tenant_id',
            { businessUnitId: query.collection_operation_id, tenant_id }
          )
          .leftJoinAndSelect('nce.location_id', 'location')
          .where('nce.id IN (:...IDS)', { IDS: nce1 })
          .andWhere('nce.is_archived = :isArchived', { isArchived: false })
          .andWhere('nce.date = :date', { date: new Date(query.date) })
          .andWhere('nce.status_id IN (:...status)', { status })
          .select([
            'nce.tenant_id as tenant_id',
            'nce.id as id',
            'nce.date',
            'location.name',
            'nce.location_id as location_id',
          ])
          .getRawMany();
      }
      const getShifts = async (operationId: bigint, operationType: any) => {
        return this.shiftsRepository.find({
          where: {
            shiftable_id: operationId,
            shiftable_type: operationType,
          },
          order: {
            start_time: 'ASC',
            end_time: 'DESC',
          },
          select: [
            'id',
            'start_time',
            'end_time',
            'shiftable_type',
            'oef_procedures',
            'oef_products',
            'tenant_id',
          ],
        });
      };
      const addShiftsToOperations = async (operations: any[], type: any) => {
        return Promise.all(
          operations.map(async (operation) => {
            operation.schedule_id = scheduleId;
            const shifts = await getShifts(operation.id, type);
            const shiftsWithProjections = await Promise.all(
              shifts.map(async (shift) => {
                const projections: any[] =
                  await this.shiftsProjectionsStaffRepository.find({
                    where: { shift_id: shift.id },
                  });
                const ssIds = await projections.map(
                  (val) => val.staff_setup_id
                );

                const times: any = await this.staffConfigRepository
                  .createQueryBuilder('sc')
                  .where({
                    staff_setup_id: In(ssIds),
                  })
                  .select('MAX(breakdown_time)')
                  .getRawMany();
                let loc: any;
                if (
                  shift.shiftable_type ===
                    PolymorphicType.OC_OPERATIONS_DRIVES ||
                  shift.shiftable_type ===
                    PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS
                ) {
                  loc = await this.directionRepository
                    .createQueryBuilder('location_directions')
                    .where('collection_operation_id = :collection', {
                      collection: query.collection_operation_id,
                    })
                    .andWhere('location_id = :loc', {
                      loc: operation.location_id,
                    })
                    .select('location_directions.minutes')
                    .getRawOne();
                } else {
                  loc = 0;
                }
                const productYieldSum = projections.reduce(
                  (sum, projection) => sum + projection.product_yield,
                  0
                );

                const procedureTypeQtySum = projections.reduce(
                  (sum, projection) => sum + projection.procedure_type_qty,
                  0
                );
                const shiftStartTime = new Date(shift.start_time);
                const minutesToSubtract = loc?.location_directions_minutes; // Assuming loc contains the minutes value

                // Subtract minutes from the shift start time
                shiftStartTime.setMinutes(
                  shiftStartTime.getMinutes() - minutesToSubtract
                );

                // Format the resulting time
                const formattedTime = shiftStartTime.toLocaleTimeString(
                  'en-US',
                  {
                    hour12: false,
                    hour: 'numeric',
                    minute: 'numeric',
                  }
                );
                const shiftEndTime = new Date(shift.end_time);
                const minutesToAdd = loc?.location_directions_minutes;
                shiftEndTime.setMinutes(
                  shiftEndTime.getMinutes() + minutesToAdd
                );

                // Format the resulting time
                const formattedTime2 = shiftEndTime.toLocaleTimeString(
                  'en-US',
                  {
                    hour12: false,
                    hour: 'numeric',
                    minute: 'numeric',
                  }
                );
                return shift.shiftable_type ===
                  PolymorphicType.OC_OPERATIONS_DRIVES ||
                  shift.shiftable_type ===
                    PolymorphicType.OC_OPERATIONS_SESSIONS
                  ? {
                      ...shift,
                      projections: {
                        productYieldSum,
                        procedureTypeQtySum,
                      },
                      staffSetup: {
                        depart_time: formattedTime,
                        return_hours: formattedTime2,
                      },
                    }
                  : shift.shiftable_type === 'oc_non_collection_events'
                  ? {
                      ...shift,
                      shift_roles_qty: {
                        depart_time: formattedTime,
                        return_hours: formattedTime2,
                      },
                    }
                  : null;
              })
            );
            return { ...operation, shifts: shiftsWithProjections };
          })
        );
      };
      let drivess: any, sessionss: any, nonCollectionEvents: any;
      if (drives !== undefined) {
        drivess = await addShiftsToOperations(
          drives,
          PolymorphicType.OC_OPERATIONS_DRIVES
        );
      }
      if (sessions !== undefined) {
        sessionss = await addShiftsToOperations(
          sessions,
          PolymorphicType.OC_OPERATIONS_SESSIONS
        );
      }
      if (nce !== undefined) {
        nonCollectionEvents = await addShiftsToOperations(
          nce,
          'oc_non_collection_events'
        );
      }

      const data = {
        drive: drivess,
        session: sessionss,
        nce: nonCollectionEvents,
      };
      return data;
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async updateAssignVehicle(
    query: UpdateAssignVehicleParamDto,
    tenant_id: any
  ) {
    try {
      const schedule = await this.scheduleRepository.findOne({
        where: {
          id: Number(query.schedule_id),
          tenant_id: tenant_id,
        },
      });
      if (schedule.schedule_status === 'Published') {
        const assignmentData = await this.vehicleAssignmentRepository
          .createQueryBuilder('vehiclesAssignment')
          .where(
            'vehiclesAssignment.id = :vehicleId and vehicleAssignment.tenant_id = :tenant_id',
            {
              vehicleId: query.vehicle_assignment_id,
              tenant_id,
            }
          )
          .getRawOne();

        const user = new User();
        user.id = BigInt(query.userId);

        await this.vehicleAssignmentDraftRepository
          .createQueryBuilder('va')
          .update(VehiclesAssignmentsDrafts)
          .set({
            shift_id: query.shift_id as unknown as bigint,
            operation_id: query.updated_operation_id as unknown as bigint,
            operation_type: query.updated_operation_type,
            created_by: user,
            reassign_by: query.userId as unknown as bigint,
          })
          .where('id = :vehicle_assignment_draft_id', {
            vehicle_assignment_draft_id: query.vehicle_assignment_id,
          })
          .execute();

        return resSuccess(
          'Resource Updated.',
          SuccessConstants.SUCCESS,
          HttpStatus.OK
        );
      } else {
        const data = await this.vehicleAssignmentRepository
          .createQueryBuilder('va')
          .update(VehiclesAssignments)
          .set({
            shift_id: BigInt(query.shift_id),
            operation_id: BigInt(query.updated_operation_id),
            operation_type: query.updated_operation_type,
          })
          .where({
            id: query.vehicle_assignment_id,
            tenant_id: tenant_id,
          })
          .execute();

        return resSuccess(
          'Resource Updated.',
          SuccessConstants.SUCCESS,
          HttpStatus.OK
        );
      }
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  private async updatePendingAssignment(shiftId, query, type, tenantId) {
    if (type === 'Staff') {
      let staffAssignment = await this.staffAssignmentRepository.findOne({
        where: {
          shift_id: { id: shiftId },
          staff_id: { id: query.staff_id },
          pending_assignment: true,
          tenant_id: tenantId,
        },
      });

      if (!staffAssignment) {
        staffAssignment = await this.staffAssignmentRepository.findOne({
          where: {
            shift_id: { id: shiftId },
            role_id: { id: query.role_id },
            pending_assignment: true,
            tenant_id: tenantId,
          },
        });
      }

      if (staffAssignment) {
        staffAssignment.pending_assignment = false;
        await this.staffAssignmentRepository.save(staffAssignment);
        // Update staffAssignmentDraft pending_assignment to false where staff_assignment_id = staffAssignment
        await this.staffAssignmentDraftsRepository.update(
          { staff_assignment_id: staffAssignment } as any,
          { pending_assignment: false }
        );
        await this.updateSchedulePendingAssignment(shiftId, tenantId);
      } else {
        const staffAssignmentDraft =
          await this.staffAssignmentDraftsRepository.findOne({
            where: {
              shift_id: { id: shiftId },
              role_id: { id: query.role_id },
              pending_assignment: true,
              tenant_id: tenantId,
            },
            relations: ['staff_assignment_id'],
          });

        if (staffAssignmentDraft) {
          staffAssignmentDraft.pending_assignment = false;
          await this.staffAssignmentDraftsRepository.save(staffAssignmentDraft);
          staffAssignmentDraft.staff_assignment_id &&
            (await this.staffAssignmentRepository.update(
              { id: staffAssignmentDraft.staff_assignment_id.id },
              { pending_assignment: false }
            ));
          await this.updateSchedulePendingAssignment(shiftId, tenantId);
        }
      }
    } else if (type === 'Device') {
      const deviceAssignment = await this.deviceAssignmentRepository.findOne({
        where: {
          shift_id: shiftId,
          pending_assignment: true,
          tenant_id: tenantId,
        },
      });

      if (deviceAssignment) {
        deviceAssignment.pending_assignment = false;
        await this.deviceAssignmentRepository.save(deviceAssignment);
        // Update deviceAssignmentDraft pending_assignment to false where device_assignment_id = deviceAssignment
        await this.deviceAssignmentsDraftsRepository.update(
          { devices_assignment_id: deviceAssignment.id },
          { pending_assignment: false }
        );
        await this.updateSchedulePendingAssignment(shiftId, tenantId);
      } else {
        const deviceAssignmentDraft =
          await this.deviceAssignmentsDraftsRepository.findOne({
            where: {
              shift_id: shiftId,
              pending_assignment: true,
              tenant_id: tenantId,
            },
          });

        if (deviceAssignmentDraft) {
          deviceAssignmentDraft.pending_assignment = false;
          await this.deviceAssignmentsDraftsRepository.save(
            deviceAssignmentDraft
          );
          deviceAssignmentDraft.devices_assignment_id &&
            (await this.deviceAssignmentRepository.update(
              { id: deviceAssignmentDraft.devices_assignment_id },
              { pending_assignment: false }
            ));
          await this.updateSchedulePendingAssignment(shiftId, tenantId);
        }
      }
    } else if (type === 'Vehicle') {
      const vehicleAssignment = await this.vehicleAssignmentRepository.findOne({
        where: {
          shift_id: shiftId,
          pending_assignment: true,
          tenant_id: tenantId,
        },
      });

      if (vehicleAssignment) {
        vehicleAssignment.pending_assignment = false;
        await this.vehicleAssignmentRepository.save(vehicleAssignment);
        // Update vehicleAssignmentDraft pending_assignment to false where vehicle_assignment_id = vehicleAssignment
        await this.vehicleAssignmentDraftRepository.update(
          { vehicle_assignment_id: vehicleAssignment.id },
          { pending_assignment: false }
        );
        await this.updateSchedulePendingAssignment(shiftId, tenantId);
      } else {
        const vehicleAssignmentDraft =
          await this.vehicleAssignmentDraftRepository.findOne({
            where: {
              shift_id: shiftId,
              pending_assignment: true,
              tenant_id: tenantId,
            },
          });

        if (vehicleAssignmentDraft) {
          vehicleAssignmentDraft.pending_assignment = false;
          await this.vehicleAssignmentDraftRepository.save(
            vehicleAssignmentDraft
          );
          vehicleAssignmentDraft.vehicle_assignment_id &&
            (await this.vehicleAssignmentRepository.update(
              { id: vehicleAssignmentDraft.vehicle_assignment_id },
              { pending_assignment: false }
            ));
          await this.updateSchedulePendingAssignment(shiftId, tenantId);
        }
      }
    }
  }

  private async updateSchedulePendingAssignment(shiftId, tenantId) {
    const shift = await this.shiftsRepository.findOne({
      where: {
        id: shiftId,
        tenant_id: tenantId,
      },
    });
    const shifts = await this.shiftsRepository.find({
      where: {
        shiftable_id: shift.shiftable_id,
        shiftable_type: shift.shiftable_type,
        tenant_id: tenantId,
      },
    });

    let isPendingAssignment = false;
    await Promise.all(
      shifts.map(async (shift) => {
        // Check if pending_assignment is true for any record where shiftId = shift.id from staffAssignment, staffAssignmentDrafts, vehicleAssignment, vehicleAssignmentDrafts, deviceAssignmnet, and deviceAssignmnetDraft tables.
        const pendingAssignments = await Promise.allSettled([
          this.staffAssignmentRepository.findOne({
            where: {
              shift_id: { shift: shift } as any,
              pending_assignment: true,
            },
          }),
          this.staffAssignmentDraftsRepository.findOne({
            where: {
              shift_id: { shift: shift } as any,
              pending_assignment: true,
              staff_assignment_id: null,
            },
          }),
          this.vehicleAssignmentRepository.findOne({
            where: { shift_id: shift.id, pending_assignment: true },
          }),
          this.vehicleAssignmentDraftRepository.findOne({
            where: {
              shift_id: shift.id,
              pending_assignment: true,
              vehicle_assignment_id: null,
            },
          }),
          this.deviceAssignmentRepository.findOne({
            where: { shift_id: shift.id, pending_assignment: true },
          }),
          this.deviceAssignmentsDraftsRepository.findOne({
            where: {
              shift_id: shift.id,
              pending_assignment: true,
              devices_assignment_id: null,
            },
          }),
        ]);

        if (pendingAssignments) {
          isPendingAssignment = true;
        }
      })
    );

    if (!isPendingAssignment) {
      const scheduleOperation = await this.scheduleOperationRepository.findOne({
        where: {
          operation_id: shift.shiftable_id,
          operation_type: shift.shiftable_type,
        },
      });
      scheduleOperation.pending_assignment = false;
      await this.scheduleOperationRepository.save(scheduleOperation);
    }
  }
}
