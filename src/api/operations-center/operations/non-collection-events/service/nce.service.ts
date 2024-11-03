import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  In,
  Not,
  EntityManager,
  ILike,
  MoreThan,
  Between,
} from 'typeorm';
import { User } from '../../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import {
  resError,
  resSuccess,
} from '../../../../system-configuration/helpers/response';
import { SuccessConstants } from '../../../../system-configuration/constants/success.constants';
import { ErrorConstants } from '../../../../system-configuration/constants/error.constants';
import { HistoryService } from '../../../../common/services/history.service';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { CrmLocations } from 'src/api/crm/locations/entities/crm-locations.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { ShiftsVehicles } from 'src/api/shifts/entities/shifts-vehicles.entity';
import { ShiftsDevices } from 'src/api/shifts/entities/shifts-devices.entity';
import { ShiftsHistory } from 'src/api/shifts/entities/shifts-history.entity';
import { Device } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device.entity';
import { Vehicle } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle.entity';
import { ContactsRoles } from 'src/api/system-configuration/tenants-administration/crm-administration/contacts/role/entities/contacts-role.entity';
import { NonCollectionEventInterface } from '../interface/non-collection-event-filter.interface';
import { NonCollectionEvents } from '../entities/oc-non-collection-events.entity';
import { NonCollectionEventsHistory } from '../entities/oc-non-collection-events-history.entity';
import { CreateNCEDto } from '../dto/create-nce.dto';
import { ShiftsRoles } from 'src/api/crm/crm-non-collection-profiles/blueprints/entities/shifts-roles.entity';
import { CrmNonCollectionProfiles } from 'src/api/crm/crm-non-collection-profiles/entities/crm-non-collection-profiles.entity';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { OperationsStatus } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/operation-status/entities/operations_status.entity';
import { UpdateNCEDto } from '../dto/update-nce.dto';
import { Category } from 'src/api/system-configuration/tenants-administration/crm-administration/common/entity/category.entity';
import { CustomFields } from 'src/api/system-configuration/tenants-administration/organizational-administration/custom-fields/entities/custom-field.entity';
import { saveCustomFields } from 'src/api/common/services/saveCustomFields.service';
import _ from 'lodash';
import moment from 'moment';
import {
  FunctionTypeEnum,
  PolymorphicType,
} from 'src/api/common/enums/polymorphic-type.enum';
import { FlaggedOperationService } from 'src/api/staffing-management/build-schedules/operation-list/service/flagged-operation.service';
import { Schedule } from 'src/api/staffing-management/build-schedules/entities/schedules.entity';
import { Drives } from '../../drives/entities/drives.entity';
import { Sessions } from '../../sessions/entities/sessions.entity';
import { ScheduleOperation } from 'src/api/staffing-management/build-schedules/entities/schedule_operation.entity';
import { ScheduleOperationStatus } from 'src/api/staffing-management/build-schedules/entities/schedule-operation-status.entity';
import { ChangeAudits } from 'src/api/crm/contacts/common/entities/change-audits.entity';
import { OperationTypeEnum } from 'src/api/call-center/call-schedule/call-jobs/enums/operation-type.enum';
import { userBusinessUnitHierarchy } from 'src/api/system-configuration/tenants-administration/user-administration/user/utils';
import { UserBusinessUnits } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user-business-units.entity';

@Injectable()
export class NCEService extends HistoryService<NonCollectionEventsHistory> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CrmLocations)
    private readonly crmLocationsRepository: Repository<CrmLocations>,
    @InjectRepository(Shifts)
    private readonly shiftsRepository: Repository<Shifts>,
    @InjectRepository(ShiftsDevices)
    private readonly shiftsDevicesRepository: Repository<ShiftsDevices>,
    @InjectRepository(ShiftsVehicles)
    private readonly shiftsVehiclesRepository: Repository<ShiftsVehicles>,
    @InjectRepository(ShiftsHistory)
    private readonly shiftsHistoryRepository: Repository<ShiftsHistory>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(Vehicle)
    private readonly vehiceRepository: Repository<Vehicle>,
    @InjectRepository(ContactsRoles)
    private readonly contactsRolesRepository: Repository<ContactsRoles>,
    private readonly entityManager: EntityManager,
    @InjectRepository(CrmNonCollectionProfiles)
    private readonly nonCollectionProfilesRepository: Repository<CrmNonCollectionProfiles>,
    @InjectRepository(NonCollectionEvents)
    private readonly nonCollectionEventRepository: Repository<NonCollectionEvents>,
    @InjectRepository(NonCollectionEventsHistory)
    private readonly nonCollectionEventsHistoryRepository: Repository<NonCollectionEventsHistory>,
    @InjectRepository(BusinessUnits)
    private readonly businessUnitsRepository: Repository<BusinessUnits>,
    @InjectRepository(UserBusinessUnits)
    private readonly userBusinessUnitsRepository: Repository<UserBusinessUnits>,
    @InjectRepository(OperationsStatus)
    private readonly operationsStatusRepository: Repository<OperationsStatus>,
    @InjectRepository(ShiftsRoles)
    private readonly shiftsRolesRepository: Repository<ShiftsRoles>,
    @InjectRepository(Category)
    private readonly nceCategoryRepository: Repository<Category>,
    @InjectRepository(CrmLocations)
    private readonly locationRepository: Repository<CrmLocations>,
    @InjectRepository(CustomFields)
    private readonly customFieldsRepository: Repository<CustomFields>,
    @InjectRepository(Drives)
    private readonly drives: Repository<Drives>,
    @InjectRepository(Schedule)
    private readonly sessions: Repository<Sessions>,
    @InjectRepository(Schedule)
    private readonly schedule: Repository<Schedule>,
    @InjectRepository(ChangeAudits)
    private readonly changeAuditsRepo: Repository<ChangeAudits>,
    @InjectRepository(ScheduleOperation)
    private readonly scheduleOperation: Repository<ScheduleOperation>,
    @InjectRepository(ScheduleOperationStatus)
    private readonly scheduleOperationStatus: Repository<ScheduleOperationStatus>,

    private readonly flaggedOperationService: FlaggedOperationService
  ) {
    super(nonCollectionEventsHistoryRepository);
  }

  async create(createNCEDto: CreateNCEDto, user: any) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      let subCategory: any;
      const {
        event_name,
        location_id,
        shifts,
        collection_operation_id,
        non_collection_profile_id,
        status_id,
        approval_status,
        date,
        owner_id,
        event_category_id,
        event_subcategory_id,
      } = createNCEDto;

      const nonCollectionProfile: any =
        await this.nonCollectionProfilesRepository.findOne({
          where: { id: non_collection_profile_id, is_archived: false },
        });

      if (!nonCollectionProfile) {
        resError(
          `Non-Collection profile not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const nonCollectionEvent: any =
        await this.nonCollectionEventRepository.findOne({
          where: { event_name, is_archived: false },
        });

      if (nonCollectionEvent) {
        resError(
          `Non-Collection Event Already Exist`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const businessUnits: any = await this.businessUnitsRepository.find({
        where: {
          id: In(collection_operation_id),
        },
      });
      if (!businessUnits.length) {
        resError(
          `Collection operations not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const crmLocation = await this.crmLocationsRepository.findOne({
        where: { id: location_id, is_archived: false },
      });

      if (!crmLocation) {
        resError(
          `Location not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const owner = await this.userRepository.findOne({
        where: { id: owner_id },
      });

      if (!owner)
        resError(
          `Owner not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );

      const category = await this.nceCategoryRepository.findOneBy({
        id: event_category_id,
      });

      if (!category) {
        resError(
          `Category does not exist!`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (event_subcategory_id) {
        subCategory = await this.nceCategoryRepository.findOne({
          where: { id: event_subcategory_id },
          relations: ['parent_id'],
        });

        if (!subCategory || (subCategory && !subCategory?.parent_id)) {
          resError(
            `Subcategory does not exist!`,
            ErrorConstants.Error,
            HttpStatus.CONFLICT
          );
        }
      }

      const operationsStatus = await this.operationsStatusRepository.findOne({
        where: {
          id: status_id,
        },
      });
      if (!operationsStatus)
        resError(
          `Operation Status not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );

      const nonCollectionEvents = new NonCollectionEvents();
      nonCollectionEvents.created_by = user;
      nonCollectionEvents.owner_id = owner;
      nonCollectionEvents.date = date;
      nonCollectionEvents.tenant_id = user.tenant;
      nonCollectionEvents.event_name = event_name;
      nonCollectionEvents.non_collection_profile_id = nonCollectionProfile;
      nonCollectionEvents.collection_operation_id = businessUnits;
      nonCollectionEvents.location_id = crmLocation;
      nonCollectionEvents.approval_status = approval_status;
      nonCollectionEvents.is_archived = false;
      nonCollectionEvents.status_id = operationsStatus;
      nonCollectionEvents.event_category_id = category;
      nonCollectionEvents.event_subcategory_id = subCategory ?? null;

      const savedNonCollectionEvent = await queryRunner.manager.save(
        nonCollectionEvents
      );

      const nonCollectionEventCustomFields = [];
      await saveCustomFields(
        this.customFieldsRepository,
        queryRunner,
        savedNonCollectionEvent,
        user?.id,
        user?.tenant,
        createNCEDto,
        nonCollectionEventCustomFields
      );

      await this.changeAuditsRepo.save({
        changes_field: 'Non-Collection Event',
        changes_to: 'Non-Collection Event Created',
        changes_from: null,
        created_by: user?.id,
        tenant_id: user.tenant?.id,
        changed_when: user.first_name + ' ' + user.last_name,
        auditable_id: nonCollectionEvents.id as any,
        auditable_type: OperationTypeEnum.NON_COLLECTION_EVENTS as any,
      });

      for (const schedule of shifts) {
        const shift = new Shifts();
        shift.shiftable_id = savedNonCollectionEvent?.id;
        shift.shiftable_type =
          PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS;
        shift.start_time = schedule.start_time;
        shift.end_time = schedule.end_time;
        shift.break_start_time = schedule.break_start_time;
        shift.break_end_time = schedule.break_end_time;
        shift.created_by = user;
        shift.tenant_id = user.tenant;

        const savedShift = await queryRunner.manager.save(shift);

        for (const vehicleId of schedule.vehicles_ids) {
          const vehicle = await this.vehiceRepository.findOne({
            where: {
              id: vehicleId as any,
              is_archived: false,
            },
          });

          if (!vehicle) {
            resError(
              `Vehicle not found`,
              ErrorConstants.Error,
              HttpStatus.NOT_FOUND
            );
          }

          const shiftVehicle = new ShiftsVehicles();
          shiftVehicle.shift_id = savedShift?.id;
          shiftVehicle.vehicle_id = vehicle?.id;
          shiftVehicle.created_by = user;

          await queryRunner.manager.save(shiftVehicle);
        }

        for (const deviceId of schedule.devices_ids) {
          const device = await this.deviceRepository.findOne({
            where: {
              id: deviceId as any,
              is_archived: false,
            },
          });

          if (!device) {
            resError(
              `Device not found`,
              ErrorConstants.Error,
              HttpStatus.NOT_FOUND
            );
          }
          const shiftDevice = new ShiftsDevices();
          shiftDevice.shift_id = savedShift?.id;
          shiftDevice.device_id = device?.id;
          shiftDevice.created_by = user;

          await queryRunner.manager.save(shiftDevice);
        }

        const roleQuantities = {};

        for (const roleObj of schedule?.shift_roles) {
          const roleId = roleObj?.role_id as any;
          roleQuantities[roleId] =
            (roleQuantities[roleId] || 0) + (roleObj?.qty || 0);
        }

        const updatedShiftRoles: any = Object.keys(roleQuantities).map(
          (roleId) => ({
            role_id: parseInt(roleId),
            qty: roleQuantities[roleId],
          })
        );

        for (const roleObj of updatedShiftRoles) {
          const role = await this.contactsRolesRepository.findOne({
            where: {
              id: roleObj?.role_id as any,
              // function_id: FunctionTypeEnum.STAFF as any,
              is_archived: false,
            },
          });

          if (!role) {
            resError(
              `Role not found`,
              ErrorConstants.Error,
              HttpStatus.NOT_FOUND
            );
          }

          const shiftRoles = new ShiftsRoles();
          shiftRoles.shift = savedShift;
          shiftRoles.role_id = roleObj?.role_id;
          shiftRoles.quantity = roleObj?.qty;
          shiftRoles.created_by = user;

          await queryRunner.manager.save(shiftRoles);
        }
      }

      await queryRunner.commitTransaction();
      this.flaggedOperationService.flaggedOperation(
        savedNonCollectionEvent?.id,
        PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS,
        user.tenant?.id
      );
      delete savedNonCollectionEvent?.tenant_id;
      delete savedNonCollectionEvent?.created_by;

      return resSuccess(
        'Non-collection Event created successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedNonCollectionEvent
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: any, updateNCEDto: UpdateNCEDto, user: any) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    let subCategory: any;
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const {
        event_name,
        location_id,
        shifts,
        collection_operation_id,
        non_collection_profile_id,
        status_id,
        approval_status,
        date,
        owner_id,
        event_category_id,
        event_subcategory_id,
      } = updateNCEDto;

      const nonCollectionEvent: any =
        await this.nonCollectionEventRepository.findOne({
          where: { id: id },
          relations: [
            'created_by',
            'collection_operation_id',
            'owner_id',
            'non_collection_profile_id',
            'tenant',
            'location_id',
            'status_id',
            'event_category_id',
            'event_subcategory_id',
          ],
        });

      if (!nonCollectionEvent) {
        resError(
          `Non-Collection Event does not Exist`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const locationCustomFieds = [];
      await saveCustomFields(
        this.customFieldsRepository,
        queryRunner,
        nonCollectionEvent,
        user?.id,
        user?.tenant,
        updateNCEDto,
        locationCustomFieds
      );

      const nceBeforeUpdate = { ...nonCollectionEvent };

      const nonCollectionProfile: any =
        await this.nonCollectionProfilesRepository.findOne({
          where: { id: non_collection_profile_id, is_archived: false },
        });

      if (!nonCollectionProfile) {
        resError(
          `Non-Collection profile not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const nonCollectionEventWithName =
        await this.nonCollectionEventRepository.findOneBy({
          event_name,
          id: Not(id),
        });

      if (nonCollectionEventWithName) {
        resError(
          `Non-Collection Event with this name Already Exist`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const businessUnits: any = await this.businessUnitsRepository.find({
        where: {
          id: In(collection_operation_id),
        },
      });
      if (!businessUnits) {
        resError(
          `Collection operations not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const category = await this.nceCategoryRepository.findOneBy({
        id: event_category_id,
      });

      if (!category) {
        resError(
          `Category does not exist!`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (event_subcategory_id) {
        subCategory = await this.nceCategoryRepository.findOne({
          where: { id: event_subcategory_id },
          relations: ['parent_id'],
        });

        // if (!subCategory || (subCategory && !subCategory?.parent_id)) {
        //   throw new HttpException(
        //     'SubCategory Does not exist!',
        //     HttpStatus.CONFLICT
        //   );
        // }
      }

      const operationsStatus = await this.operationsStatusRepository.findOne({
        where: {
          id: status_id,
        },
      });

      if (!operationsStatus)
        resError(
          `Operation Status not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );

      const crmLocation = await this.crmLocationsRepository.findOne({
        where: { id: location_id, is_archived: false },
      });

      if (!crmLocation) {
        resError(
          `Location not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const owner = await this.userRepository.findOneBy({
        id: owner_id,
      });

      if (!owner) {
        resError(`Owner not found`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }

      // update NCE and save

      nonCollectionEvent.event_name = event_name;
      nonCollectionEvent.location_id = location_id;
      nonCollectionEvent.shifts = shifts;
      nonCollectionEvent.collection_operation_id = businessUnits;
      nonCollectionEvent.non_collection_profile_id = non_collection_profile_id;
      nonCollectionEvent.status_id = status_id;
      nonCollectionEvent.approval_status = approval_status;
      nonCollectionEvent.date = date;
      nonCollectionEvent.owner_id = owner_id;
      nonCollectionEvent.event_category_id = category;
      nonCollectionEvent.event_subcategory_id = subCategory ?? null;
      nonCollectionEvent.created_at = new Date();
      nonCollectionEvent.created_by = user;
      const savedNonCollectionEvent = await queryRunner.manager.save(
        nonCollectionEvent
      );

      const existingShifts: any = await this.shiftsRepository.find({
        where: {
          shiftable_id: id,
          shiftable_type: PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS,
        },
        relations: ['vehicles', 'devices'],
      });
      const shiftsChanges = await this.monitorShiftsChanges(
        existingShifts,
        shifts,
        user
      );

      const generalChanges = await this.monitorGeneralChanges(
        nceBeforeUpdate,
        date,
        event_name,
        non_collection_profile_id,
        nonCollectionProfile,
        location_id,
        crmLocation,
        businessUnits,
        status_id,
        operationsStatus,
        owner_id,
        owner,
        event_subcategory_id,
        subCategory,
        event_category_id,
        category
      );

      const changesOccured = [...shiftsChanges, ...generalChanges];

      if (!existingShifts.length) {
        throw new Error('Shifts not found for the event');
      }

      for (const shiftSchedule of shifts as any) {
        const shift: any = await this.shiftsRepository.findOne({
          where: {
            id: shiftSchedule.id,
            is_archived: false,
          },
        });

        shift.shiftable_id = id;
        shift.shiftable_type =
          PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS;
        shift.start_time = shiftSchedule.start_time;
        shift.end_time = shiftSchedule.end_time;
        shift.break_start_time = shiftSchedule.break_start_time;
        shift.break_end_time = shiftSchedule.break_end_time;
        shift.created_by = user;
        shift.created_at = new Date();
        shift.tenant_id = user.tenant;

        const savedShift = await this.shiftsRepository.save(shift);
        const existingShiftVehicles = await this.shiftsVehiclesRepository.find({
          where: {
            shift_id: shiftSchedule?.id,
            is_archived: false,
          },
        });

        const existingShiftVehiclesIds = existingShiftVehicles.map((item) =>
          Number(item?.vehicle_id)
        );

        const newShiftVehicleIds = shiftSchedule.vehicles_ids;

        const vehiclesToRemove = existingShiftVehiclesIds.filter(
          (item) => !newShiftVehicleIds.includes(item)
        );
        const vehiclesToAdd = newShiftVehicleIds.filter(
          (item) => !existingShiftVehiclesIds.includes(item)
        );

        // adding vehicles

        if (vehiclesToAdd.length > 0) {
          for (const vehicleId of vehiclesToAdd) {
            const vehicle = await this.vehiceRepository.findOne({
              where: {
                id: vehicleId as any,
                is_archived: false,
              },
            });

            if (!vehicle) {
              resError(
                `Vehicle not found`,
                ErrorConstants.Error,
                HttpStatus.NOT_FOUND
              );
            }
            const shiftVehicle: any = new ShiftsVehicles();
            shiftVehicle.shift_id = savedShift?.id;
            shiftVehicle.vehicle_id = vehicleId;
            shiftVehicle.created_by = user;
            shiftVehicle.created_at = new Date();

            await queryRunner.manager.save(shiftVehicle);
          }
        }

        // removing vehicles

        if (vehiclesToRemove.length > 0) {
          for (const vehicleId of vehiclesToRemove as any) {
            await this.shiftsVehiclesRepository.delete({
              vehicle_id: vehicleId,
            });
          }
        }

        // END   *************************

        const existingShiftDevices = await this.shiftsDevicesRepository.find({
          where: {
            shift_id: shiftSchedule?.id,
            is_archived: false,
          },
        });

        const existingShiftDevicesIds = existingShiftDevices.map((item) =>
          Number(item?.device_id)
        );

        const newShiftDeviceIds = shiftSchedule.devices_ids;

        const devicesToRemove = existingShiftDevicesIds.filter(
          (item) => !newShiftDeviceIds.includes(item)
        );
        const devicesToAdd = newShiftDeviceIds.filter(
          (item) => !existingShiftDevicesIds.includes(item)
        );

        // adding devices
        if (devicesToAdd.length > 0) {
          for (const deviceId of devicesToAdd) {
            const device = await this.deviceRepository.findOne({
              where: {
                id: deviceId as any,
                is_archived: false,
              },
            });

            if (!device) {
              resError(
                `Device not found`,
                ErrorConstants.Error,
                HttpStatus.NOT_FOUND
              );
            }

            const shiftDevice: any = new ShiftsDevices();
            shiftDevice.shift_id = savedShift?.id;
            shiftDevice.device_id = device?.id;
            shiftDevice.created_by = user;
            shiftDevice.created_at = new Date();

            await queryRunner.manager.save(shiftDevice);
          }
        }

        // removing devices

        if (devicesToRemove.length > 0) {
          for (const deviceId of devicesToRemove as any) {
            await this.shiftsDevicesRepository.delete({
              device_id: deviceId,
            });
          }
        }

        const existingShiftRoles = await this.shiftsRolesRepository.find({
          where: {
            shift_id: shiftSchedule?.id,
          },
        });

        const newShiftRoles = shiftSchedule?.shift_roles;

        const shiftRolesToUpdate = newShiftRoles?.filter((newObj) => {
          const existingObj = existingShiftRoles.find(
            (existObj) => existObj.role_id == newObj.role_id
          );
          return existingObj && existingObj.quantity !== newObj.qty;
        });

        const existingShiftRolesIds = existingShiftRoles.map((item) =>
          Number(item?.role_id)
        );

        const newShiftRoleIds = shiftSchedule.shift_roles.map(
          (item) => item?.role_id
        );

        const rolesToAdd = newShiftRoleIds.filter(
          (item) => !existingShiftRolesIds.includes(item)
        );

        const rolesToRemove = existingShiftRolesIds.filter(
          (item) => !newShiftRoleIds.includes(item)
        );

        if (rolesToAdd?.length > 0) {
          for (const roleId of rolesToAdd) {
            const roleInfo = await shiftSchedule.shift_roles.find(
              (item) => item.role_id == roleId
            );

            const shiftRoles: any = new ShiftsRoles();
            shiftRoles.shift_id = savedShift?.id;
            shiftRoles.role_id = roleInfo?.role_id;
            shiftRoles.quantity = roleInfo?.qty;
            shiftRoles.created_by = user;
            shiftRoles.created_at = new Date();
            await queryRunner.manager.save(shiftRoles);
          }
        }

        if (rolesToRemove?.length > 0) {
          for (const roleId of rolesToRemove as any) {
            await this.shiftsRolesRepository.delete({
              role_id: roleId,
            });
          }
        }

        if (shiftRolesToUpdate?.length) {
          for (const role of shiftRolesToUpdate) {
            const shiftRole = await this.shiftsRolesRepository.findOne({
              where: {
                role_id: role.role_id,
                is_archived: false,
              },
            });

            shiftRole.quantity = role.qty;

            await this.shiftsRolesRepository.save(shiftRole);
          }
        }
      }

      for (const change of changesOccured) {
        await this.changeAuditsRepo.save({
          changes_field: change?.changes_field || null,
          changes_to: change?.changes_to || null,
          changes_from: change?.changes_from || null,
          created_by: user?.id,
          created_at: new Date(),
          tenant_id: user.tenant?.id,
          changed_when: user?.first_name + ' ' + user?.last_name,
          auditable_id: id,
          auditable_type: OperationTypeEnum.NON_COLLECTION_EVENTS as any,
        });
      }
      await queryRunner.commitTransaction();
      this.flaggedOperationService.flaggedOperation(
        id,
        PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS,
        user.tenant?.id
      );
      delete savedNonCollectionEvent?.tenant_id;
      delete savedNonCollectionEvent?.created_by;

      return resSuccess(
        'Non-collection Event updated successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedNonCollectionEvent
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    nonCollectionEventInterface: NonCollectionEventInterface,
    user: any = null
  ) {
    try {
      let eventWithShiftInfo = null;
      let { page, limit } = nonCollectionEventInterface;
      const {
        keyword,
        date,
        location_id,
        event_subcategory_id,
        event_category_id,
        tenant_id,
        sortBy,
        sortOrder,
        status_id,
        exportType,
        organizational_levels,
        start_date,
        end_date,
      } = nonCollectionEventInterface;

      page = page ? +page : 1;

      limit = limit ? +limit : +process.env.PAGE_SIZE;

      let pagination: any = {
        take: limit,
        skip: (page - 1) * limit,
      };

      let where: any = { is_archived: false, tenant: { id: tenant_id } };

      if (keyword) {
        where = {
          ...where,
          event_name: ILike(`%${keyword}%`),
        };
      }

      if (date) {
        where = {
          ...where,
          date: date,
        };
      }

      if (start_date && end_date) {
        where = {
          ...where,
          date: Between(
            moment(start_date).format('YYYY-MM-DD'),
            moment(end_date).format('YYYY-MM-DD')
          ),
        };
      }

      if (event_category_id) {
        where = {
          ...where,
          event_category_id: {
            id: event_category_id,
          },
        };
      }

      if (event_subcategory_id) {
        where = {
          ...where,
          event_subcategory_id: {
            id: event_subcategory_id,
          },
        };
      }

      if (status_id !== undefined && status_id !== null) {
        where = {
          ...where,
          status_id: {
            id: status_id,
          },
        };
      }

      if (location_id) {
        where = {
          ...where,
          location_id: {
            id: location_id,
          },
        };
      }

      if (organizational_levels) {
        const { collection_operations } = JSON.parse(organizational_levels);
        const whereArr = Object.keys(collection_operations).map((co_id) => ({
          ...where,
          collection_operation_id: { id: co_id },
        }));
        where = whereArr;
      }

      let order: any = { id: 'DESC' };

      if (sortBy && sortBy != 'total_staff') {
        const orderDirection = sortOrder || 'DESC';
        if (sortBy == 'event_category_id') {
          order = { event_category_id: { name: orderDirection } };
        } else if (sortBy == 'event_subcategory_id') {
          order = { event_subcategory_id: { name: orderDirection } };
        } else if (sortBy == 'collection_operation_id') {
          order = { collection_operation_id: { name: orderDirection } };
        } else if (sortBy == 'owner_id') {
          order = { owner_id: { first_name: orderDirection } };
        } else if (sortBy == 'location_id') {
          order = { location_id: { name: orderDirection } };
        } else if (sortBy == 'status_id') {
          order = { status_id: { name: orderDirection } };
        } else {
          const orderBy = sortBy;
          order = { [orderBy]: orderDirection };
        }
      }

      if (exportType === 'all') {
        pagination = {};
      }

      const [response, count] =
        await this.nonCollectionEventRepository.findAndCount({
          where,
          relations: [
            'created_by',
            'tenant',
            'location_id',
            'collection_operation_id',
            'collection_operation_id.organizational_level_id',
            'status_id',
            'event_category_id',
            'event_subcategory_id',
            'non_collection_profile_id',
            'owner_id',
          ],
          ...pagination,
          order,
        });

      const dataWithShifts = await Promise.all(
        response?.map(async (record) => {
          const shifts: any = await this.shiftsRepository.find({
            where: {
              shiftable_id: record.id,
              shiftable_type:
                PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS,
              is_archived: false,
            },
          });

          const shiftRolesPromises = shifts.map(async (shift: any) => {
            const shiftRoles = await this.shiftsRolesRepository.find({
              where: {
                shift_id: shift.id,
              },
              relations: ['role'],
              select: ['role_id', 'role', 'quantity'],
            });

            const totalQuantity = shiftRoles.reduce(
              (shiftTotal: any, shiftRole: any) => {
                return shiftTotal + shiftRole.quantity;
              },
              0
            );

            return {
              ...shift,
              totalQuantity,
            };
          });

          const shiftsData = await Promise.all(shiftRolesPromises);

          delete record.tenant_id;
          delete record.created_by;
          return { ...record, shifts: shiftsData };
        })
      );

      if (dataWithShifts?.length) {
        const eventIds = response?.map((item) => item.id);
        const shifts = await this.shiftsRepository
          .createQueryBuilder('shift')
          .select([
            'shift.shiftable_id',
            'MIN(shift.start_time) AS min_start_time',
            'MAX(shift.end_time) AS max_end_time',
          ])
          .where({
            shiftable_id: In(eventIds),
            shiftable_type: PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS,
            is_archived: false,
          })
          .groupBy('shift.shiftable_id')
          .getRawMany();

        eventWithShiftInfo = dataWithShifts?.map((event) => {
          const shiftInfo = shifts.find(
            (shift) => shift.shift_shiftable_id === event.id
          );

          const totalQuantity = event?.shifts.reduce(
            (shiftTotal: any, shiftRole: any) => {
              return shiftTotal + shiftRole.totalQuantity;
            },
            0
          );

          return {
            ...event,
            min_start_time: shiftInfo?.min_start_time,
            max_end_time: shiftInfo?.max_end_time,
            total_staff: totalQuantity,
          };
        });
      }

      if (sortBy == 'total_staff') {
        if (sortOrder == 'ASC') {
          eventWithShiftInfo = await eventWithShiftInfo
            .slice()
            .sort((a: any, b: any) => a.total_staff - b.total_staff);
        } else if (sortOrder == 'DESC') {
          eventWithShiftInfo = await eventWithShiftInfo
            .slice()
            .sort((a: any, b: any) => b.total_staff - a.total_staff);
        }
      }
      const data = eventWithShiftInfo ?? dataWithShifts;

      let updatedRecords = [];

      if (user) {
        const userBusinessUnits = await userBusinessUnitHierarchy(
          user?.id,
          this.userBusinessUnitsRepository,
          this.businessUnitsRepository,
          user?.role?.is_auto_created,
          user?.tenant?.id
        );

        const userBusinessUnitsIds = userBusinessUnits.map((units) => units.id);
        updatedRecords = data.map((record) => {
          const isWriteable =
            record?.collection_operation_id.length > 0
              ? record?.collection_operation_id.some((operation) =>
                  userBusinessUnitsIds.includes(operation.id)
                )
              : null;

          return {
            ...record,
            writeable: isWriteable,
          };
        });
      }
      return {
        status: HttpStatus.OK,
        message: 'Non Collection Events Fetched successfully',
        count: count,
        data: user ? updatedRecords : data,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findOne(id: any, user: any = null) {
    try {
      const nonCollectionEvent: any =
        await this.nonCollectionEventRepository.findOne({
          where: { id: id, is_archived: false },
          relations: [
            'created_by',
            'collection_operation_id',
            'owner_id',
            'non_collection_profile_id',
            'location_id',
            'status_id',
            'event_category_id',
            'event_subcategory_id',
          ],
        });

      if (!nonCollectionEvent) {
        resError(
          `Non-Collection Event Not Found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const shifts = await this.shiftsRepository
        .createQueryBuilder('shift')
        .select([
          'shift.shiftable_id',
          'MIN(shift.start_time) AS min_start_time',
          'MAX(shift.end_time) AS max_end_time',
        ])
        .where({
          shiftable_id: id,
          shiftable_type: PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS,
          is_archived: false,
        })
        .groupBy('shift.shiftable_id')
        .getRawOne();

      // const modifiedData = await getModifiedDataDetails(
      //   this.nonCollectionEventsHistoryRepository,
      //   id,
      //   this.userRepository
      // );
      // const modified_by = modifiedData['modified_by'];
      // const modified_at = modifiedData['modified_at'];

      if (nonCollectionEvent) {
        const modifiedData: any = await getModifiedDataDetails(
          this.nonCollectionEventsHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        nonCollectionEvent.modified_by = nonCollectionEvent.created_by;
        nonCollectionEvent.modified_at = nonCollectionEvent.created_at;
        nonCollectionEvent.created_at = modified_at
          ? modified_at
          : nonCollectionEvent.created_at;
        nonCollectionEvent.created_by = modified_by
          ? modified_by
          : nonCollectionEvent.created_by;
      }

      const data = {
        ...nonCollectionEvent,
        min_start_time: shifts?.min_start_time,
        max_end_time: shifts?.max_end_time,
      };
      let updatedRecord = {};

      if (user) {
        const userBusinessUnits = await userBusinessUnitHierarchy(
          user?.id,
          this.userBusinessUnitsRepository,
          this.businessUnitsRepository,
          user?.role?.is_auto_created,
          user?.tenant?.id
        );

        const userBusinessUnitsIds = userBusinessUnits.map((units) => units.id);

        const isWriteable =
          data?.collection_operation_id.length > 0
            ? data?.collection_operation_id.some((operation) =>
                userBusinessUnitsIds.includes(operation.id)
              )
            : null;
        updatedRecord = {
          ...data,
          writeable: isWriteable,
        };
      }

      return resSuccess(
        'Non-Collection Event fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        user ? updatedRecord : data
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findNCEShifts(id: any) {
    try {
      const shifts: any = await this.shiftsRepository.find({
        where: {
          shiftable_id: id,
          shiftable_type: PolymorphicType.OC_OPERATIONS_NON_COLLECTION_EVENTS,
          is_archived: false,
        },
      });

      if (!shifts) {
        resError(
          `Shifts Not Found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const promises = shifts.map(async (shift: any) => {
        shift.start_time = shift.start_time;
        shift.end_time = shift.end_time;
        shift.break_start_time = shift.break_start_time;
        shift.break_end_time = shift.break_end_time;

        const shiftDevices = await this.shiftsDevicesRepository.find({
          where: {
            shift_id: shift.id,
          },
          relations: ['device'],
          select: ['device_id', 'device'],
        });

        const shiftVehicles = await this.shiftsVehiclesRepository.find({
          where: {
            shift_id: shift.id,
          },
        });

        const vehicles: any = [];
        for (const vehicle of shiftVehicles) {
          const vehicleData = await this.vehiceRepository.findOne({
            where: {
              id: vehicle.vehicle_id,
            },
          });

          vehicles.push({
            vehicle_id: vehicleData?.id,
            vehicle: vehicleData,
          });
        }

        const shiftRoles = await this.shiftsRolesRepository.find({
          where: {
            shift_id: shift.id,
          },
          relations: ['role'],
          select: ['role_id', 'role', 'quantity'],
        });

        shift = {
          ...shift,
          shiftDevices,
          shiftVehicles: vehicles,
          shiftRoles,
        };
        return shift;
      });

      const shiftsWithData = await Promise.all(promises);
      return shiftsWithData;
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async findShifts(id: any) {
    try {
      const shifts = await this.findNCEShifts(id);

      return resSuccess(
        'NCE shifts fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        shifts
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async archive(id: any, user: any) {
    try {
      const nonCollectionEvent: any =
        await this.nonCollectionEventRepository.findOne({
          where: { id: id },
          relations: [
            'created_by',
            'collection_operation_id',
            'owner_id',
            'non_collection_profile_id',
            'tenant',
            'location_id',
            'status_id',
            'event_category_id',
            'event_subcategory_id',
          ],
        });

      if (!nonCollectionEvent) {
        resError(
          `Non-Collection Event not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (nonCollectionEvent.is_archived) {
        resError(
          `Non-Collection Event is already archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      await this.changeAuditsRepo.update(
        {
          auditable_id: id,
          auditable_type: OperationTypeEnum.NON_COLLECTION_EVENTS as any,
        },
        { is_archived: true }
      );

      nonCollectionEvent.is_archived = true;
      nonCollectionEvent.created_at = new Date();
      nonCollectionEvent.created_by = user;
      const archivedNCE = await this.nonCollectionEventRepository.save(
        nonCollectionEvent
      );

      return resSuccess(
        '`Non-Collection Event archived successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        null
      );
    } catch (error) {
      console.log('Error', error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAllWithDirections(
    user: any,
    collection_operations: any,
    date: any
  ) {
    try {
      if (date) {
        const events = await this.nonCollectionEventRepository.find({
          where: {
            date: date,
          },
          relations: ['location_id'],
        });

        const locationIds = events.map((item) => item.location_id);
        const uniqueIdsSet = new Set(locationIds.map((item) => item.id));
        const locationsIdsArray: any = Array.from(uniqueIdsSet);

        const locations = await this.locationRepository.find({
          where: {
            id: In(locationsIdsArray),
          },
        });

        return {
          status: HttpStatus.OK,
          response: 'CrmLocations Fetched',
          data: locations,
        };
      } else {
        let collection_operation_id: any;
        if (collection_operations) {
          collection_operation_id = await JSON.parse(collection_operations);
        }
        const matchingLocations = await this.locationRepository.find({
          relations: ['directions', 'directions.collection_operation_id'],
          where: {
            tenant: { id: user?.tenant?.id as bigint },
            is_archived: false,
            directions: {
              miles: MoreThan(0),
              minutes: MoreThan(0),
              is_archived: false,
              collection_operation_id: {
                id: In(collection_operation_id),
              },
            },
          },
          order: { name: 'ASC' },
        });

        if (!matchingLocations.length) {
          return {
            status: HttpStatus.OK,
            response: 'CrmLocations Fetched',
            data: [],
          };
        }

        const uniqueAllLocationsId = [
          ...new Set(matchingLocations?.map((item) => item?.id)),
        ];

        const events = await this.nonCollectionEventRepository.find({
          where: {
            location_id: {
              id: In(uniqueAllLocationsId),
            },
          },
          relations: ['location_id'],
        });

        const uniquesFilteredLocationIds = [
          ...new Set(events.map((item) => item?.location_id?.id)),
        ];
        const filteredLocations = matchingLocations.filter(
          (location) => !uniquesFilteredLocationIds.includes(location?.id)
        );

        return {
          status: HttpStatus.OK,
          response: 'CrmLocations Fetched',
          data: filteredLocations,
        };
      }
    } catch (error) {
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findEventWithLocation(id: any) {
    try {
      const nonCollectionEvent: any =
        await this.nonCollectionEventRepository.findOne({
          relations: [
            'created_by',
            'collection_operation_id',
            'owner_id',
            'non_collection_profile_id',
            'tenant',
            'location_id',
            'status_id',
            'event_category_id',
            'event_subcategory_id',
          ],
          where: { location_id: { id: id }, is_archived: false },
        });

      if (!nonCollectionEvent) {
        resError(
          `Non-Collection Event Not Found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (nonCollectionEvent) {
        const modifiedData: any = await getModifiedDataDetails(
          this.nonCollectionEventsHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        nonCollectionEvent.modified_by = nonCollectionEvent.created_by;
        nonCollectionEvent.modified_at = nonCollectionEvent.created_at;
        nonCollectionEvent.created_at = modified_at
          ? modified_at
          : nonCollectionEvent.created_at;
        nonCollectionEvent.created_by = modified_by
          ? modified_by
          : nonCollectionEvent.created_by;
      }

      return resSuccess(
        'Non-Collection Event fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        {
          ...nonCollectionEvent,
        }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async monitorShiftsChanges(existingShifts, updatedShiftsDto, user) {
    const changesArrayShifts = [];

    const shiftsIdsExisting = existingShifts
      ?.map((es) => Number(es.id))
      ?.sort();
    const shiftsIdsNew = updatedShiftsDto
      ?.map((element) => {
        return Number(element?.id);
      })
      ?.sort();

    if (!_.isEqual(shiftsIdsExisting, shiftsIdsNew)) {
      await this.compareShifts(
        shiftsIdsExisting,
        shiftsIdsNew,
        changesArrayShifts
      );

      updatedShiftsDto
        .filter((ans) => !ans?.id)
        .forEach((fans, i) => {
          changesArrayShifts.push({
            changes_from: null,
            changes_to: `Insert shift ${
              updatedShiftsDto?.length -
              shiftsIdsNew.filter((e) => !e)?.length +
              i +
              1
            }`,
            changes_field: `Event Shift `,
          });
        });
    }
    for (const [index, shift] of existingShifts.entries()) {
      const tempShift = updatedShiftsDto.find(
        (updatedShift) => Number(updatedShift?.id) === Number(shift?.id)
      );

      if (!tempShift) continue;

      const deviceIdsExisting = shift?.devices
        ?.map((element) => {
          return Number(element?.device_id);
        })
        ?.sort();
      const deviceIdsNew = tempShift?.devices_ids?.map(Number)?.sort();
      const vehiclesIdsExisting = shift?.vehicles
        ?.map((element) => {
          return Number(element?.vehicle_id);
        })
        ?.sort();
      const vehiclesIdsNew = tempShift?.vehicles_ids?.map(Number)?.sort();

      if (!_?.isEqual(deviceIdsExisting, deviceIdsNew)) {
        const { existingNames, newNames } = await this.compareDevicesVehicles(
          deviceIdsExisting,
          deviceIdsNew,
          user?.tenant?.id,
          this.deviceRepository
        );

        changesArrayShifts.push({
          changes_from: existingNames,
          changes_to: newNames,
          changes_field: `Shift (${index + 1}) Devices`,
        });
      }
      if (!_?.isEqual(vehiclesIdsExisting, vehiclesIdsNew)) {
        const { existingNames, newNames } = await this.compareDevicesVehicles(
          vehiclesIdsExisting,
          vehiclesIdsNew,
          user?.tenant?.id,
          this.vehiceRepository
        );

        changesArrayShifts.push({
          changes_from: existingNames,
          changes_to: newNames,
          changes_field: `Shift (${index + 1}) Vehicles`,
        });
      }
      await this.compareTimes(
        'Start Time',
        shift?.start_time,
        tempShift?.start_time,
        index,
        changesArrayShifts
      );
      await this.compareTimes(
        'End Time',
        shift.end_time,
        tempShift?.end_time,
        index,
        changesArrayShifts
      );

      const role = await this.shiftsRolesRepository.find({
        where: { shift_id: shift.id },
        relations: ['role'],
      });

      const roleChanges = [];
      const shiftRoles = role;

      const tempShiftRoles = this.aggregateRoleQuantities(
        tempShift?.shift_roles
      ) as any;

      for (let i = 0; i < shiftRoles.length || i < tempShiftRoles.length; i++) {
        const currentRole = shiftRoles[i];
        const tempRole = tempShiftRoles[i];

        const currentRoleId = currentRole?.role_id;
        const tempRoleId = tempRole?.role_id;

        const currentQuantity = Number(currentRole?.quantity);
        const tempQuantity = Number(tempRole?.qty);

        if (
          (currentRoleId && BigInt(currentRoleId)) !==
            (tempRoleId && BigInt(tempRoleId)) ||
          currentQuantity !== tempQuantity
        ) {
          const newRole = await this.contactsRolesRepository.findOne({
            where: { id: tempRoleId },
          });

          roleChanges.push({
            changes_from:
              currentRole?.role?.name && currentQuantity
                ? `${currentRole?.role?.name} (${currentQuantity})`
                : null,
            changes_to:
              newRole?.name && tempQuantity
                ? `${newRole?.name} (${tempQuantity})`
                : null,
            changes_field: `Shift (${index + 1}) Role ${i + 1} - Quantity`,
          });
        }
      }
      if (roleChanges?.length > 0) {
        changesArrayShifts.push(...roleChanges);
      }
    }

    return changesArrayShifts;
  }

  async compareDevicesVehicles(idsExisting, idsNew, tenant_id, repository) {
    const unionIds = _.union(idsExisting, idsNew)?.sort();
    const names = await repository.find({
      where: {
        tenant: { id: tenant_id },
        id: In(unionIds),
      },
    });

    const existingNames = names
      .filter((single) => idsExisting.includes(Number(single.id)))
      .map((single) => single.name)
      .join(', ');

    const newNames = names
      .filter((single) => idsNew.includes(Number(single.id)))
      .map((single) => single.name)
      .join(', ');

    return { existingNames, newNames };
  }

  async compareTimes(
    field,
    shiftValue,
    tempShiftValue,
    index,
    changesArrayShifts
  ) {
    const shiftDate = moment(shiftValue).format('hh:mm A z');
    const tempShiftDate = tempShiftValue
      ? moment(tempShiftValue).format('hh:mm A z')
      : null;

    if (shiftDate !== tempShiftDate) {
      changesArrayShifts.push({
        changes_from: shiftValue ? new Date(shiftValue) : null,
        changes_to: tempShiftValue ? new Date(tempShiftValue) : null,
        changes_field: `Shift (${index + 1}) ${field}`,
      });
    }
  }

  async compareShifts(shiftsIdsExisting, shiftsIdsNew, changesArrayShifts) {
    const deletedShifts = _.difference(shiftsIdsExisting, shiftsIdsNew);
    const deletedShiftsAll = await this.shiftsRepository.find({
      where: {
        id: In(deletedShifts),
      },
    });
    if (deletedShiftsAll?.length > 0) {
      deletedShiftsAll.forEach((dsa) => {
        changesArrayShifts.push({
          changes_from: null,
          changes_to: `Delete shift ${
            shiftsIdsExisting?.indexOf(Number(dsa?.id)) + 1
          }`,
          changes_field: `Event Shift `,
        });
      });
    }
  }
  async monitorGeneralChanges(
    nceBeforeUpdate,
    date,
    event_name,
    non_collection_profile_id,
    nonCollectionProfile,
    location_id,
    crmLocation,
    businessUnits,
    status_id,
    operationsStatus,
    owner_id,
    owner,
    event_subcategory_id,
    subCategory,
    event_category_id,
    category
  ) {
    const changesOccured = [];
    if (new Date(nceBeforeUpdate.date).getDate() !== new Date(date).getDate()) {
      changesOccured.push({
        changes_from: new Date(nceBeforeUpdate.date),
        changes_to: new Date(date),
        changes_field: `Event Date`,
      });
    }
    if (nceBeforeUpdate.event_name !== event_name) {
      changesOccured.push({
        changes_from: nceBeforeUpdate.event_name,
        changes_to: event_name,
        changes_field: `Event Name`,
      });
    }
    if (
      BigInt(nceBeforeUpdate.non_collection_profile_id.id) !==
      BigInt(non_collection_profile_id)
    ) {
      changesOccured.push({
        changes_from: nceBeforeUpdate.non_collection_profile_id.profile_name,
        changes_to: nonCollectionProfile.profile_name,
        changes_field: `Event NCP Name`,
      });
    }
    if (BigInt(nceBeforeUpdate.location_id.id) !== BigInt(location_id)) {
      changesOccured.push({
        changes_from: nceBeforeUpdate.location_id.name,
        changes_to: crmLocation.name,
        changes_field: `Event Location`,
      });
    }
    const existingBUIDs = nceBeforeUpdate?.collection_operation_id
      ?.map((co) => Number(co?.id))
      ?.sort();
    const newBUIDs = businessUnits?.map((co) => Number(co?.id))?.sort();

    if (!_?.isEqual(existingBUIDs, newBUIDs)) {
      changesOccured.push({
        changes_from: nceBeforeUpdate?.collection_operation_id
          ?.map((co) => co?.name)
          .join(', '),
        changes_to: businessUnits?.map((co) => co?.name).join(', '),
        changes_field: `Event Collection Operation`,
      });
    }

    if (BigInt(nceBeforeUpdate?.status_id?.id) !== BigInt(status_id)) {
      changesOccured.push({
        changes_from: nceBeforeUpdate.status_id.name,
        changes_to: operationsStatus.name,
        changes_field: `Event Status`,
      });
    }

    if (
      Number(nceBeforeUpdate?.event_category_id?.id) !==
      Number(event_category_id)
    ) {
      changesOccured.push({
        changes_from: nceBeforeUpdate?.event_category_id?.name || null,
        changes_to: category?.name || null,
        changes_field: `Event Category`,
      });
    }

    if (
      (Number(nceBeforeUpdate?.event_subcategory_id?.id) || 0) !==
      (Number(event_subcategory_id) || 0)
    ) {
      changesOccured.push({
        changes_from: nceBeforeUpdate?.event_subcategory_id?.name || null,
        changes_to: subCategory?.name || null,
        changes_field: `Event Subcategory`,
      });
    }

    if (BigInt(nceBeforeUpdate?.owner_id?.id) !== BigInt(owner_id)) {
      changesOccured.push({
        changes_from:
          nceBeforeUpdate?.owner_id?.first_name +
          ' ' +
          nceBeforeUpdate?.owner_id?.last_name,
        changes_to: owner.first_name + ' ' + owner.last_name,
        changes_field: `Event Owner`,
      });
    }
    return changesOccured;
  }
  aggregateRoleQuantities(input) {
    const result = {};

    for (const item of input) {
      const { role_id, qty } = item;

      if (!result[role_id]) {
        result[role_id] = { role_id, qty: 0 };
      }

      result[role_id].qty += qty;
    }

    return Object.values(result) || [];
  }
}
