import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository, Not, EntityManager } from 'typeorm';
import { User } from '../../../../system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import {
  resError,
  resSuccess,
} from '../../../../system-configuration/helpers/response';
import { SuccessConstants } from '../../../../system-configuration/constants/success.constants';
import { ErrorConstants } from '../../../../system-configuration/constants/error.constants';
import { CreateNCPBluePrintsDto } from '../dto/create-ncp-blueprints.dto';
import { CrmNonCollectionProfiles } from '../../entities/crm-non-collection-profiles.entity';
import { UpdateNCPBluePrintsDto } from '../dto/update-ncp-blueprints.dto';
import { HistoryService } from '../../../../common/services/history.service';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { NCPBluePrintsInterface } from '../interface/ncp-blueprints.interface';
import { CrmNcpBluePrints } from '../entities/ncp-blueprints.entity';
import { CrmLocations } from 'src/api/crm/locations/entities/crm-locations.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { ShiftsVehicles } from 'src/api/shifts/entities/shifts-vehicles.entity';
import { ShiftsDevices } from 'src/api/shifts/entities/shifts-devices.entity';
import { ShiftsRoles } from '../entities/shifts-roles.entity';
import { CrmNcpBluePrintsHistory } from '../entities/ncp-blueprints-history.entity';
import { ShiftsHistory } from 'src/api/shifts/entities/shifts-history.entity';
import { Device } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device.entity';
import { Vehicle } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle.entity';
import { ContactsRoles } from 'src/api/system-configuration/tenants-administration/crm-administration/contacts/role/entities/contacts-role.entity';
import { NCPBluePrintsInfoInterface } from '../../interface/ncp-blueprints-collection-operation-info';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { PolymorphicType } from 'src/api/common/enums/polymorphic-type.enum';

@Injectable()
export class NCPBluePrintsService extends HistoryService<CrmNcpBluePrintsHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CrmNcpBluePrints)
    private readonly bluePrintRepository: Repository<CrmNcpBluePrints>,
    @InjectRepository(CrmNcpBluePrintsHistory)
    private readonly bluePrintHistoryRepository: Repository<CrmNcpBluePrintsHistory>,
    @InjectRepository(CrmLocations)
    private readonly crmLocationsRepository: Repository<CrmLocations>,
    @InjectRepository(Shifts)
    private readonly shiftsRepository: Repository<Shifts>,
    @InjectRepository(ShiftsDevices)
    private readonly shiftsDevicesRepository: Repository<ShiftsDevices>,
    @InjectRepository(ShiftsVehicles)
    private readonly shiftsVehiclesRepository: Repository<ShiftsVehicles>,
    @InjectRepository(ShiftsRoles)
    private readonly shiftsRolesRepository: Repository<ShiftsRoles>,
    @InjectRepository(CrmNonCollectionProfiles)
    private readonly nonCollectionProfilesRepository: Repository<CrmNonCollectionProfiles>,
    @InjectRepository(ShiftsHistory)
    private readonly shiftsHistoryRepository: Repository<ShiftsHistory>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(Vehicle)
    private readonly vehiceRepository: Repository<Vehicle>,
    @InjectRepository(ContactsRoles)
    private readonly contactsRolesRepository: Repository<ContactsRoles>,
    private readonly entityManager: EntityManager
  ) {
    super(bluePrintHistoryRepository);
  }

  async create(
    ncpId: any,
    createNCPBluePrintsDto: CreateNCPBluePrintsDto,
    user: any
  ) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const {
        blueprint_name,
        location,
        additional_info,
        shift_schedule,
        is_active,
      }: any = createNCPBluePrintsDto;

      const nonCollectionProfile: any =
        await this.nonCollectionProfilesRepository.findOne({
          where: { id: ncpId, is_archived: false },
        });

      if (!nonCollectionProfile) {
        resError(
          `Non-Collection profile not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const bluePrint = await this.bluePrintRepository.findOne({
        where: {
          blueprint_name: blueprint_name,
        },
      });

      if (bluePrint) {
        resError(
          `Blueprint already exists.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const crmNcpBluePrints = new CrmNcpBluePrints();
      crmNcpBluePrints.created_by = user;
      crmNcpBluePrints.tenant_id = user.tenant;
      crmNcpBluePrints.blueprint_name = blueprint_name;
      crmNcpBluePrints.additional_info = additional_info;
      crmNcpBluePrints.crm_non_collection_profiles_id = ncpId;
      crmNcpBluePrints.location = location;
      crmNcpBluePrints.id_default = false;
      crmNcpBluePrints.is_archived = false;
      crmNcpBluePrints.is_active = is_active;

      const savedNonCollectionProfile = await queryRunner.manager.save(
        crmNcpBluePrints
      );

      for (const schedule of shift_schedule) {
        const shift = new Shifts();
        shift.shiftable_id = crmNcpBluePrints?.id;
        shift.shiftable_type =
          PolymorphicType.CRM_NON_COLLECTION_PROFILES_BLUEPRINTS;
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
              `Vehicle not found.`,
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
              `Device not found.`,
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
              function_id: roleObj?.function_id as any,
              is_archived: false,
            },
          });

          if (!role) {
            resError(
              `Role not found.`,
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
      delete savedNonCollectionProfile?.created_by;

      return resSuccess(
        'NCP blueprint created successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        { ...savedNonCollectionProfile, tenant_id: user?.tenant?.id }
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(ncpId: any, ncpBluePrintsInterface: NCPBluePrintsInterface) {
    try {
      let blueprintsWithShiftInfo = null;
      const { keyword, tenant_id, sortBy, sortOrder, is_active } =
        ncpBluePrintsInterface;
      let { page, limit } = ncpBluePrintsInterface;

      limit = limit ? +limit : +process.env.PAGE_SIZE;

      page = page ? +page : 1;

      let where: any = {
        crm_non_collection_profiles_id: { id: ncpId },
        is_archived: false,
        tenant: { id: tenant_id },
      };

      if (keyword) {
        where = {
          ...where,
          blueprint_name: ILike(`%${keyword}%`),
        };
      }

      if (
        is_active !== undefined &&
        is_active !== '' &&
        is_active !== 'undefined'
      ) {
        where = {
          ...where,
          is_active: is_active,
        };
      }
      let order: any;
      if (sortBy) {
        const orderDirection = sortOrder || 'DESC';
        if (sortBy == 'location') {
          order = { location: orderDirection };
        } else {
          const orderBy = sortBy;
          order = { [orderBy]: orderDirection };
        }
      }

      const [response, count] = await this.bluePrintRepository.findAndCount({
        where,
        relations: ['created_by', 'tenant', 'crm_non_collection_profiles_id'],
        take: limit,
        skip: (page - 1) * limit,
        order,
      });

      if (response?.length) {
        const bluePrintIds = response?.map((item) => item.id);

        const shifts = await this.shiftsRepository
          .createQueryBuilder('shift')
          .select([
            'shift.shiftable_id',
            'MIN(shift.start_time) AS min_start_time',
            'MAX(shift.end_time) AS max_end_time',
          ])
          .where({
            shiftable_id: In(bluePrintIds),
            shiftable_type:
              PolymorphicType.CRM_NON_COLLECTION_PROFILES_BLUEPRINTS,
            is_archived: false,
          })
          .groupBy('shift.shiftable_id')
          .getRawMany();

        blueprintsWithShiftInfo = response?.map((blueprint) => {
          const shiftInfo = shifts.find(
            (shift) => shift.shift_shiftable_id === blueprint.id
          );

          return {
            ...blueprint,
            min_start_time: shiftInfo?.min_start_time,
            max_end_time: shiftInfo?.max_end_time,
          };
        });
      }

      return {
        status: HttpStatus.OK,
        message: 'NCP Blue Prints Fetched successfully',
        count: count,
        data: blueprintsWithShiftInfo ?? response,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findOne(id: any) {
    try {
      const nonCollectionProfile: any = await this.bluePrintRepository.findOne({
        where: { id, is_archived: false },
        relations: ['created_by', 'tenant', 'crm_non_collection_profiles_id'],
      });

      if (!nonCollectionProfile) {
        resError(
          `Blueprint not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (nonCollectionProfile) {
        const modifiedData: any = await getModifiedDataDetails(
          this.bluePrintHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        nonCollectionProfile.modified_by = nonCollectionProfile.created_by;
        nonCollectionProfile.modified_at = nonCollectionProfile.created_at;
        nonCollectionProfile.created_at = modified_at
          ? modified_at
          : nonCollectionProfile.created_at;
        nonCollectionProfile.created_by = modified_by
          ? modified_by
          : nonCollectionProfile.created_by;
      }

      return resSuccess(
        'NCP blue print fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        {
          ...nonCollectionProfile,
        }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findShifts(id: any) {
    try {
      const shifts: any = await this.shiftsRepository.find({
        where: {
          shiftable_id: id,
          shiftable_type:
            PolymorphicType.CRM_NON_COLLECTION_PROFILES_BLUEPRINTS,
          is_archived: false,
        },
      });

      if (!shifts) {
        resError(
          `Shifts not found.`,
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
          relations: ['vehicle'],
          select: ['vehicle_id', 'vehicle'],
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

      return resSuccess(
        'NCP blue print shifts fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        shiftsWithData
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(
    bluePrintId: any,
    updateNCPBluePrintsDto: UpdateNCPBluePrintsDto,
    user: any
  ) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const {
        blueprint_name,
        location,
        additional_info,
        shift_schedule,
        is_active,
      }: any = updateNCPBluePrintsDto;

      const bluePrint = await this.bluePrintRepository.findOneBy({
        blueprint_name,
        id: Not(bluePrintId),
      });

      if (bluePrint) {
        resError(
          `Blueprint already exists.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const crmNcpBluePrints: any = await this.bluePrintRepository.findOne({
        where: { id: bluePrintId, is_archived: false },
        relations: ['created_by', 'tenant', 'crm_non_collection_profiles_id'],
      });

      crmNcpBluePrints.blueprint_name = blueprint_name;
      crmNcpBluePrints.additional_info = additional_info;
      crmNcpBluePrints.location = location;
      crmNcpBluePrints.is_active = is_active;
      crmNcpBluePrints.created_at = new Date();
      crmNcpBluePrints.created_by = this?.request?.user;

      const updatedNonCollectionProfile = await queryRunner.manager.save(
        crmNcpBluePrints
      );

      const existingShifts: any = await this.shiftsRepository.find({
        where: {
          shiftable_id: crmNcpBluePrints?.id,
          shiftable_type:
            PolymorphicType.CRM_NON_COLLECTION_PROFILES_BLUEPRINTS,
        },
      });

      if (!existingShifts.length) {
        throw new Error('Shifts not found for the given blueprint');
      }

      for (const shift of existingShifts) {
        await this.shiftsVehiclesRepository.delete({
          shift_id: shift?.id,
        });

        await this.shiftsDevicesRepository.delete({
          shift_id: shift?.id,
        });

        await this.shiftsRolesRepository.delete({
          shift_id: shift?.id,
        });

        await this.shiftsRepository.delete({
          id: shift?.id,
        });
      }

      for (const shiftSchedule of shift_schedule) {
        const shift = new Shifts();
        shift.shiftable_id = crmNcpBluePrints?.id;
        shift.shiftable_type =
          PolymorphicType.CRM_NON_COLLECTION_PROFILES_BLUEPRINTS;
        shift.start_time = shiftSchedule.start_time;
        shift.end_time = shiftSchedule.end_time;
        shift.break_start_time = shiftSchedule.break_start_time;
        shift.break_end_time = shiftSchedule.break_end_time;
        shift.created_at = new Date();
        shift.created_by = user;
        shift.tenant_id = user.tenant;

        const savedShift = await queryRunner.manager.save(shift);

        for (const vehicleId of shiftSchedule.vehicles_ids) {
          const vehicle = await this.vehiceRepository.findOne({
            where: {
              id: vehicleId as any,
              is_archived: false,
            },
          });

          if (!vehicle) {
            resError(
              `Vehicle not found.`,
              ErrorConstants.Error,
              HttpStatus.NOT_FOUND
            );
          }
          const shiftVehicle = new ShiftsVehicles();
          shiftVehicle.shift_id = savedShift?.id;
          shiftVehicle.vehicle_id = vehicleId;
          shiftVehicle.created_at = new Date();
          shiftVehicle.created_by = user;

          await queryRunner.manager.save(shiftVehicle);
        }

        for (const deviceId of shiftSchedule.devices_ids) {
          const device = await this.deviceRepository.findOne({
            where: {
              id: deviceId as any,
              is_archived: false,
            },
          });

          if (!device) {
            resError(
              `Device not found.`,
              ErrorConstants.Error,
              HttpStatus.NOT_FOUND
            );
          }

          const shiftDevice = new ShiftsDevices();
          shiftDevice.shift_id = savedShift?.id;
          shiftDevice.device_id = device?.id;
          shiftDevice.created_at = new Date();
          shiftDevice.created_by = user;

          await queryRunner.manager.save(shiftDevice);
        }

        const roleQuantities = {};

        for (const roleObj of shiftSchedule?.shift_roles) {
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
              is_archived: false,
              function_id: roleObj?.function_id as any,
            },
          });

          if (!role) {
            resError(
              `Role not found.`,
              ErrorConstants.Error,
              HttpStatus.NOT_FOUND
            );
          }
          const shiftRoles = new ShiftsRoles();
          shiftRoles.shift_id = savedShift?.id;
          shiftRoles.role_id = roleObj?.role_id;
          shiftRoles.quantity = roleObj?.qty;
          shiftRoles.created_at = new Date();
          shiftRoles.created_by = user;

          await queryRunner.manager.save(shiftRoles);
        }
      }

      await queryRunner.commitTransaction();

      return resSuccess(
        'NCP blueprint updated successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        {}
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async archive(id: any, req: any) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const crmNcpBluePrints: any = await this.bluePrintRepository.findOne({
        where: { id: id },
        relations: ['created_by', 'tenant', 'crm_non_collection_profiles_id'],
      });

      if (!crmNcpBluePrints) {
        resError(
          `NCP blue print not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (crmNcpBluePrints?.is_archived) {
        resError(
          `NCP blue print is already archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      crmNcpBluePrints.is_archived = true;
      crmNcpBluePrints.created_at = new Date();
      crmNcpBluePrints.created_by = this?.request?.user;
      const archivedBluePrint = await queryRunner.manager.save(
        crmNcpBluePrints
      );

      const existingShifts: any = await this.shiftsRepository.find({
        where: {
          shiftable_id: crmNcpBluePrints?.id,
          shiftable_type:
            PolymorphicType.CRM_NON_COLLECTION_PROFILES_BLUEPRINTS,
        },
      });

      for (const shift of existingShifts) {
        shift.is_archived = true;
        shift.created_at = new Date();
        shift.created_by = this?.request?.user;
        await this.shiftsRepository.save(shift);

        const shiftVehicles = await this.shiftsVehiclesRepository.find({
          where: {
            shift_id: shift?.id,
          },
        });

        if (shiftVehicles?.length) {
          for (const vehicle of shiftVehicles) {
            vehicle.is_archived = true;
            vehicle.created_at = new Date();
            vehicle.created_by = this?.request?.user;
            await queryRunner.manager.save(vehicle);
          }
        }

        const shiftDevices = await this.shiftsDevicesRepository.find({
          where: {
            shift_id: shift?.id,
          },
        });

        if (shiftDevices?.length) {
          for (const device of shiftDevices) {
            device.is_archived = true;
            device.created_at = new Date();
            device.created_by = this?.request?.user;
            await queryRunner.manager.save(device);
          }
        }

        const shiftRoles = await this.shiftsRolesRepository.find({
          where: {
            shift_id: shift?.id,
          },
        });

        if (shiftRoles?.length) {
          for (const role of shiftRoles) {
            role.is_archived = true;
            role.created_at = new Date();
            role.created_by = this?.request?.user;
            await queryRunner.manager.save(role);
          }
        }
      }

      await queryRunner.commitTransaction();
      return resSuccess(
        'NCP blue print archived successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        {}
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async makeDefault(id: any, req: any) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const crmNcpBluePrints: any = await this.bluePrintRepository.findOne({
        where: { id: id },
        relations: ['crm_non_collection_profiles_id'],
      });

      await this.bluePrintRepository.update(
        {
          crm_non_collection_profiles_id:
            crmNcpBluePrints?.crm_non_collection_profiles_id?.id,
        },
        { id_default: false }
      );

      if (!crmNcpBluePrints) {
        resError(
          `NCP blue print not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (crmNcpBluePrints?.is_archived) {
        resError(
          `NCP blue print is already archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      crmNcpBluePrints.id_default = true;
      crmNcpBluePrints.created_at = new Date();
      crmNcpBluePrints.created_by = this?.request?.user;
      await queryRunner.manager.save(crmNcpBluePrints);

      await queryRunner.commitTransaction();
      return resSuccess(
        'NCP blue print made default successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        null
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async getColectionOperationInfo(
    collection_oprations: any,
    ncpBpCollectionOperationInfo: NCPBluePrintsInfoInterface,
    req: any
  ) {
    try {
      const collectionOperationValues = collection_oprations
        .split(',')
        .map((item) => parseInt(item));
      const { vehicles, devices, roles } = ncpBpCollectionOperationInfo;
      let collection_operation_ids: any;

      if (collection_oprations) {
        collection_operation_ids = await JSON.parse(collection_oprations);
      }
      if (vehicles) {
        const vehiclesQuery: any = this.vehiceRepository
          .createQueryBuilder('vehicle')
          .select([
            'vehicle.id AS id',
            'vehicle.name AS name',
            'vehicle.short_name AS short_name',
            'vehicle.retire_on AS retire_on',
            'vm.start_date_time AS vm_start_date_time',
            'vm.end_date_time AS vm_end_date_time',
            'vm.prevent_booking AS vm_prevent_booking',
            'vehicle.tenant_id AS tenant_id', // Add tenant_id column in select
          ])
          .leftJoin('vehicle_maintenance', 'vm', 'vm.vehicle_id = vehicle.id')

          .where(
            `vehicle.is_archived = false AND vehicle.collection_operation_id IN (${
              collection_operation_ids?.length &&
              collection_operation_ids.join(',')
            })`
          )
          .distinct(true)
          .getQuery();

        const vehiclesData = await this.vehiceRepository.query(vehiclesQuery);

        return {
          status: HttpStatus.OK,
          message: 'Collection Operation Vehicles fetched Successfully',
          data: vehiclesData,
        };
      } else if (devices) {
        const where: any = {
          is_archived: false,
          status: true,
          collection_operation: In(collectionOperationValues),
        };
        const devicesQuery = await this.deviceRepository
          .createQueryBuilder('devices')
          .select([
            'devices.id AS id',
            'devices.status AS status',
            'devices.name AS name',
            'devices.short_name AS short_name',
            'devices.retire_on AS retire_on',
            'dm.start_date_time AS vm_start_date_time',
            'dm.end_date_time AS vm_end_date_time',
            'devices.tenant_id AS tenant_id', // Add tenant_id column in select
          ])
          .leftJoin('device_maintenance', 'dm', 'dm.device = devices.id')

          .where(
            `devices.is_archived = false AND devices.status = true AND devices.collection_operation IN (${
              collection_operation_ids?.length &&
              collection_operation_ids.join(',')
            })`
          )

          .getQuery();

        const devices = await this.vehiceRepository.query(devicesQuery);

        return {
          status: HttpStatus.OK,
          message: 'Collection Operation Devices  Fetched Successfully',
          data: devices,
        };
      } else if (roles) {
        // const role_id: any = 1;
        const roles = await this.contactsRolesRepository.find({
          where: {
            //function_id: role_id,
            is_archived: false,
            tenant: { id: req.user?.tenant?.id },
            status: true,
            staffable: true,
          },
        });

        return {
          status: HttpStatus.OK,
          message: 'Collection Operation Roles Fetched Successfully',
          data: roles,
        };
      }
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
