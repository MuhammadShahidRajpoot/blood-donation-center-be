import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, ILike, In, Repository } from 'typeorm';
import { Device } from '../entities/device.entity';
import {
  GetAllDevicesInterface,
  GetDevicesForDriveInterface,
} from '../interface/device.interface';
import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { SuccessConstants } from '../../../../../constants/success.constants';
import { resError, resSuccess } from '../../../../../helpers/response';
import { ErrorConstants } from '../../../../../constants/error.constants';
import { User } from '../../../../user-administration/user/entity/user.entity';
import { CreateDeviceDto } from '../dto/create-device.dto';
import { DeviceType } from '../../device-type/entity/device-type.entity';
import { UpdateDeviceDto } from '../dto/update-device.dto';
import { DeviceHistory } from '../entities/device-history.entity';
import { DeviceMaintenanceDto } from '../dto/device-maintenance.dto';
import { DeviceMaintenance } from '../entities/device-maintenance.entity';
import { DeviceRetirementDto } from '../dto/device-retirement.dto';
import { DeviceShareDto } from '../dto/device-share.dto';
import { DeviceShare } from '../entities/device-share.entity';
import { getModifiedDataDetails } from '../../../../../../../common/utils/modified_by_detail';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { DeviceUnscheduleRetirementDto } from '../dto/device-unschedule-retirement.dto';
dotenv.config();

@Injectable({ scope: Scope.REQUEST })
export class DeviceService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DeviceType)
    private readonly deviceTypeRepository: Repository<DeviceType>,
    @InjectRepository(DeviceHistory)
    private readonly deviceHistoryRepository: Repository<DeviceHistory>,
    @InjectRepository(DeviceMaintenance)
    private readonly deviceMaintenanceRepository: Repository<DeviceMaintenance>,
    @InjectRepository(DeviceShare)
    private readonly deviceShareRepository: Repository<DeviceShare>,
    private readonly entityManager: EntityManager
  ) {}

  async addDevice(createDeviceDto: CreateDeviceDto) {
    try {
      const user = await this.userRepository.findOneBy({
        id: createDeviceDto?.created_by,
      });
      if (!user) {
        resError(`User not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }
      const existingSameNameDevice = await this.deviceRepository.findOne({
        where: {
          name: ILike(createDeviceDto?.name.trim()),
          is_archived: false,
        },
      });

      if (existingSameNameDevice) {
        resError(
          `Device Name Must Be Unique. Please try again.`,
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }
      const deviceType = await this.deviceTypeRepository.findOneBy({
        id: createDeviceDto?.device_type_id,
      });
      if (!deviceType) {
        resError(
          `Device Type not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const device = new Device();
      device.name = createDeviceDto?.name.trim();
      device.short_name = createDeviceDto?.short_name;
      device.device_type = createDeviceDto.device_type_id;
      device.collection_operation = createDeviceDto.collection_operation_id;
      device.description = createDeviceDto?.description;
      device.status = createDeviceDto?.status ?? true;
      device.created_by = createDeviceDto?.created_by;
      device.tenant_id = this.request.user?.tenant?.id;
      const savedDevice = await this.deviceRepository.save(device);
      return resSuccess(
        'Device Created.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedDevice
      );
    } catch (error) {
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getDevices(params: GetAllDevicesInterface) {
    try {
      const { sortBy, sortOrder } = params;
      const limit: number = params?.limit
        ? +params?.limit
        : +process.env.PAGE_SIZE;

      let page = params?.page ? +params?.page : 1;

      if (page < 1) {
        page = 1;
      }

      const where = {};
      if (params?.name) {
        Object.assign(where, {
          name: ILike(`%${params?.name}%`),
        });
      }

      if (params?.status) {
        Object.assign(where, {
          status: params?.status,
        });
      }

      if (params?.device_type) {
        Object.assign(where, {
          device_type: params?.device_type,
        });
      }

      Object.assign(where, {
        is_archived: false,
      });

      Object.assign(where, {
        tenant: { id: this.request.user?.tenant?.id },
      });

      if (params?.collection_operation) {
        const collectionOperationValues = params?.collection_operation
          .split(',')
          .map((item) => item.trim());

        if (collectionOperationValues.length > 0) {
          // Use the array directly with In operator
          Object.assign(where, {
            collection_operation: In(collectionOperationValues),
          });
        } else {
          // Use the single value without wrapping it in an array
          Object.assign(where, {
            collection_operation: params?.collection_operation,
          });
        }
      }
      const orderBy: { [key: string]: 'ASC' | 'DESC' } = {};
      if (sortBy) {
        if (sortBy === 'device_type') {
          orderBy['device_type.name'] =
            sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        } else if (sortBy === 'collection_operation') {
          orderBy['collection_operation.name'] =
            sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        } else if (sortBy === 'retires_on') {
          orderBy['devices.retire_on'] =
            sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        } else {
          // Use the provided sortBy column from params
          orderBy[`devices.${sortBy}`] =
            sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        }
      } else {
        // Default orderBy in case sortBy is not provided
        orderBy['devices.id'] = 'DESC';
      }
      const devices = this.deviceRepository
        .createQueryBuilder('devices')
        .leftJoinAndSelect('devices.device_type', 'device_type')
        .leftJoinAndSelect(
          'devices.collection_operation',
          'collection_operation'
        )
        .take(limit)
        .skip((page - 1) * limit)
        .orderBy(orderBy)
        .where(where);

      const [data, count] = await devices.getManyAndCount();
      return {
        status: HttpStatus.OK,
        response: 'Devices Fetched Succesfuly',
        count: count,
        data: data,
      };
    } catch (e) {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getDevicesByCollectionOperation(params: GetDevicesForDriveInterface) {
    try {
      const where = { collection_operation: params.collection_operation };

      Object.assign(where, {
        status: true,
      });

      Object.assign(where, {
        is_archived: false,
      });

      Object.assign(where, {
        tenant: { id: this.request.user?.tenant?.id },
      });

      const devices = this.deviceRepository
        .createQueryBuilder('devices')
        .leftJoinAndSelect('devices.device_type', 'device_type')
        .leftJoinAndSelect(
          'devices.collection_operation',
          'collection_operation'
        )
        .orderBy({ 'devices.id': 'DESC' })
        .where(where);

      const response = await devices.getMany();
      return {
        status: HttpStatus.OK,
        response: 'Devices Fetched Succesfuly',
        data: response,
      };
    } catch (e) {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getDevice(id: any) {
    try {
      const deviceData = await this.deviceRepository.findOneBy({
        id: id,
      });
      if (!deviceData) {
        resError(
          `Device not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const device: any = await this.deviceRepository.findOne({
        where: {
          id,
        },
        relations: ['device_type', 'created_by', 'collection_operation'],
      });

      if (device) {
        const modifiedData: any = await getModifiedDataDetails(
          this.deviceHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        device.modified_by = device.created_by;
        device.modified_at = device.created_at;
        device.created_at = modified_at ? modified_at : device.created_at;
        device.created_by = modified_by ? modified_by : device.created_by;
      }

      return resSuccess(
        'Device fetched.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        { ...device }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async updateDevice(updateDeviceDto: UpdateDeviceDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const deviceData = await this.deviceRepository.findOne({
        where: { id: updateDeviceDto?.id, is_archived: false },
        relations: [
          'created_by',
          'device_type',
          'collection_operation',
          'tenant',
        ],
      });

      if (!deviceData) {
        resError(
          `Device Type not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      if (updateDeviceDto.name && updateDeviceDto.name !== deviceData.name) {
        const existingSameNameDevice = await this.deviceRepository.findOne({
          where: {
            name: ILike(updateDeviceDto?.name.trim()),
            is_archived: false,
          },
        });

        if (existingSameNameDevice) {
          resError(
            `Device Name Must Be Unique. Please try again.`,
            ErrorConstants.Error,
            HttpStatus.CONFLICT
          );
        }
      }
      const user = await this.userRepository.findOneBy({
        id: updateDeviceDto?.created_by,
      });
      if (!user) {
        resError(`User not found`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }
      const deviceTypeData = await this.deviceTypeRepository.findOneBy({
        id: updateDeviceDto?.device_type_id,
      });
      if (!deviceTypeData) {
        resError(
          `Device type not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const deviceUpdateObject = {
        name: updateDeviceDto?.name.trim() ?? deviceData?.name.trim(),
        short_name: updateDeviceDto?.short_name ?? deviceData?.short_name,
        device_type: updateDeviceDto?.device_type_id ?? deviceData?.device_type,
        description: updateDeviceDto?.description ?? deviceData?.description,
        collection_operation:
          updateDeviceDto.collection_operation_id ??
          deviceData?.collection_operation,
        status: updateDeviceDto.hasOwnProperty('status')
          ? updateDeviceDto.status
          : deviceData?.status,
        // created_by: updateDeviceDto?.created_by ?? deviceData?.created_by,
        tenant: this.request.user?.tenant,
        created_at: new Date(),
        created_by: this.request?.user,
        //  updated_by: updateDeviceDto?.updated_by
      };
      const updateDevice = await queryRunner.manager.update(
        Device,
        { id: deviceData.id },
        { ...deviceUpdateObject }
      );
      if (!updateDevice.affected) {
        resError(
          `Device update failed.`,
          ErrorConstants.Error,
          HttpStatus.NOT_MODIFIED
        );
      }
      const savedDevice = await this.deviceRepository.findOne({
        where: {
          id: updateDeviceDto.id,
        },
        relations: ['device_type'],
      });
      await queryRunner.commitTransaction();
      return resSuccess(
        'Device Updated.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedDevice
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async updateDeviceHistory(queryRunner, data: any, action: string) {
    const DeviceC = new DeviceHistory();
    DeviceC.id = BigInt(data?.id);
    DeviceC.name = data.name;
    DeviceC.short_name = data.short_name;
    DeviceC.description = data.description;
    DeviceC.device_type = BigInt(data?.device_type?.id) || null;
    DeviceC.replace_device = data?.replace_device_id
      ? BigInt(data?.replace_device_id)
      : null;
    DeviceC.collection_operation = data?.collection_operation?.id
      ? BigInt(data?.collection_operation?.id)
      : null;
    DeviceC.retire_on = data.retire_on;
    DeviceC.status = data?.status;
    DeviceC.created_by = BigInt(data?.created_by);
    DeviceC.history_reason = 'C';
    DeviceC.tenant_id = data?.tenant_id;
    await queryRunner.manager.save(DeviceC);
    if (action === 'D') {
      const DeviceD = new DeviceHistory();
      DeviceD.id = BigInt(data?.id);
      DeviceD.name = data.name;
      DeviceD.short_name = data.short_name;
      DeviceD.description = data.description;
      DeviceD.device_type = BigInt(data?.device_type?.id) || null;
      DeviceD.replace_device = data?.replace_device_id
        ? BigInt(data?.replace_device_id)
        : null;
      DeviceD.collection_operation = data?.collection_operation?.id
        ? BigInt(data?.collection_operation?.id)
        : null;
      DeviceD.retire_on = data.retire_on;
      DeviceD.status = data?.status;
      DeviceD.created_by = BigInt(data?.created_by);
      DeviceD.history_reason = 'D';
      DeviceC.tenant_id = data?.tenant_id;
      await queryRunner.manager.save(DeviceD);
    }
  }
  async remove(id: any, user: any): Promise<any> {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const device: any = await this.deviceRepository.findOne({
        where: {
          id,
          is_archived: false,
          tenant: {
            id: user?.tenant?.id,
          },
        },
        relations: [
          'created_by',
          'device_type',
          'collection_operation',
          'tenant',
        ],
      });

      if (!device) {
        resError(
          `Device not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      device.is_archived = true;
      (device.created_at = new Date()),
        (device.created_by = this.request?.user);
      // Archive the Device entity
      const archivedDevice = await queryRunner.manager.save(device);

      Object.assign(archivedDevice, {
        tenant_id: archivedDevice?.tenant?.id,
      });

      await queryRunner.commitTransaction();
      delete archivedDevice.created_by;
      return resSuccess(
        'Device Archived',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        archivedDevice
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async scheduleMaintenance(id: any, maintenanceDTO: DeviceMaintenanceDto) {
    try {
      const user = await this.userRepository.findOneBy({
        id: this.request.user?.id,
      });
      if (!user) {
        resError(`User not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }

      const maintenance = new DeviceMaintenance();
      maintenance.device = id;
      maintenance.start_date_time = maintenanceDTO?.start_date_time;
      maintenance.end_date_time = maintenanceDTO?.end_date_time;
      maintenance.description = maintenanceDTO?.description;
      maintenance.reduce_slots = maintenanceDTO?.reduce_slots ?? true;
      maintenance.created_by = this.request.user?.id;
      maintenance.tenant_id = this.request.user?.tenant?.id;
      const savedMaintenance = await this.deviceMaintenanceRepository.save(
        maintenance
      );

      return resSuccess(
        'Device Maintenance Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedMaintenance
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findMaintenances(id: any) {
    try {
      const device = await this.deviceRepository.findOne({
        where: {
          id,
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

      const maintenances = await this.deviceMaintenanceRepository
        .createQueryBuilder('dm')
        .select([
          'dm.id AS dm_id',
          'dm.start_date_time AS dm_start_date_time',
          'dm.end_date_time AS dm_end_date_time',
          'dm.description AS dm_description',
          'dm.reduce_slots AS dm_reduce_slots',
          'dm.created_at AS dm_created_at',
          'dm.tenant_id AS tenant_id',
          'dm.device AS dm_device',
          'dm.created_by AS dm_created_by',
        ])
        .where('device = :device_id', { device_id: device.id })
        .orderBy('dm.id', 'DESC')
        .execute();

      return resSuccess(
        'Device Maintenances Fetched',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        maintenances
      );
    } catch (e) {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async scheduleRetirement(id: any, retirementDto: DeviceRetirementDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const deviceData = await this.deviceRepository.findOne({
        where: {
          id,
          is_archived: false,
        },
        relations: [
          'device_type',
          'created_by',
          'replace_device',
          'collection_operation',
          'tenant',
        ],
      });
      if (!deviceData) {
        resError(
          `Device not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const user = await this.userRepository.findOneBy({
        id: retirementDto?.created_by,
      });
      if (!user) {
        resError(`User not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }

      const updateObject: any = {
        retire_on: retirementDto?.retire_on ?? deviceData?.retire_on,
        replace_device:
          retirementDto?.replace_device_id ?? deviceData?.replace_device,
        created_by: retirementDto?.created_by ?? deviceData?.created_by,
        tenant: this?.request?.user?.tenant,
        created_at: new Date(),
      };
      let updatedDevice: any = await queryRunner.manager.update(
        Device,
        { id: deviceData.id },
        { ...updateObject }
      );
      if (!updatedDevice.affected) {
        resError(
          `Device retirement failed.`,
          ErrorConstants.Error,
          HttpStatus.NOT_MODIFIED
        );
      }

      await queryRunner.commitTransaction();

      updatedDevice = await this.deviceRepository.findOne({
        where: {
          id: deviceData.id,
        },
        relations: ['device_type', 'replace_device'],
      });

      return resSuccess(
        'Device Updated.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        updatedDevice
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }
  async unScheduleRetirement(
    id: any,
    retirementDto: DeviceUnscheduleRetirementDto
  ) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const deviceData = await this.deviceRepository.findOne({
        where: {
          id,
          is_archived: false,
        },
        relations: [
          'device_type',
          'created_by',
          'replace_device',
          'collection_operation',
          'tenant',
        ],
      });
      if (!deviceData) {
        resError(
          `Device not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const user = await this.userRepository.findOneBy({
        id: retirementDto?.created_by,
      });
      if (!user) {
        resError(`User not found`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }

      const updateObject: any = {
        retire_on: null,
        replace_device: null,
        created_by: retirementDto?.created_by ?? deviceData?.created_by,
        tenant: this?.request?.user?.tenant,
        created_at: new Date(),
      };
      let updatedDevice: any = await queryRunner.manager.update(
        Device,
        { id: deviceData.id },
        { ...updateObject }
      );
      if (!updatedDevice.affected) {
        resError(
          `Device unschedule retirement failed.`,
          ErrorConstants.Error,
          HttpStatus.NOT_MODIFIED
        );
      }

      await queryRunner.commitTransaction();

      updatedDevice = await this.deviceRepository.findOne({
        where: {
          id: deviceData.id,
        },
        relations: ['device_type', 'replace_device'],
      });

      return resSuccess(
        'Device Updated.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        updatedDevice
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }
  async share(id: any, shareDto: DeviceShareDto) {
    try {
      const user = await this.userRepository.findOneBy({
        id: shareDto?.created_by,
      });
      if (!user) {
        resError(`User not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }

      const deviceShare = new DeviceShare();
      deviceShare.device = id;
      deviceShare.start_date = shareDto?.start_date;
      deviceShare.end_date = shareDto?.end_date;
      deviceShare.from = shareDto?.from;
      deviceShare.to = shareDto?.to;
      deviceShare.created_by = shareDto?.created_by;
      deviceShare.tenant_id = this.request.user?.tenant?.id;
      const saveddeviceShare = await this.deviceShareRepository.save(
        deviceShare
      );

      return resSuccess(
        'Device Share Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        saveddeviceShare
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findShares(id: any) {
    try {
      const deviceData = await this.deviceRepository.findOne({
        where: {
          id,
          is_archived: false,
        },
      });

      if (!deviceData) {
        resError(
          `Device not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const shares = await this.deviceShareRepository
        .createQueryBuilder('ds')
        .select([
          'ds.created_at AS ds_created_at',
          'ds.created_by AS ds_created_by',
          'ds.device AS ds_device',
          'ds.end_date AS ds_end_date',
          'ds.from AS ds_from',
          'ds.id AS ds_id',
          'ds.share_type AS ds_share_type',
          'ds.start_date AS ds_start_date',
          'ds.tenant_id AS tenant_id',
          'ds.to AS ds_to',
        ])
        .leftJoinAndSelect('ds.from', 'from')
        .leftJoinAndSelect('ds.to', 'to')
        .where('device = :device_id', { device_id: deviceData.id })
        .orderBy('ds.id', 'DESC')
        .execute();

      return resSuccess(
        'Device Shares Fetched.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        shares
      );
    } catch (e) {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findShare(id: any, shareId: any) {
    try {
      const device = await this.deviceRepository.findOneBy({
        id: id,
        is_archived: false,
      });
      if (!device) {
        resError(
          `Device not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const shareData = await this.deviceShareRepository.find({
        where: {
          id: shareId,
          tenant: { id: this.request.user?.tenant.id },
        },
        relations: ['from', 'to'],
      });
      if (!shareData) {
        resError(
          `Device Share not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      return resSuccess(
        'Device Share Fetched.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        shareData
      );
    } catch (e) {
      console.log(e);
      return resError(e.message, ErrorConstants.Error, e.status);
    }
  }

  async updateShare(id: any, shareId: any, deviceShareDto: DeviceShareDto) {
    try {
      const user = await this.userRepository.findOneBy({
        id: this.request.user?.id,
      });
      if (!user) {
        resError(`User not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }

      const device = await this.deviceRepository.findOneBy({
        id: id,
        is_archived: false,
      });
      if (!device) {
        resError(
          `Device not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const deviceShare: any = await this.deviceShareRepository.findOneBy({
        id: shareId,
      });

      if (!deviceShare) {
        resError(
          `Device Share not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      deviceShare.start_date = deviceShareDto?.start_date;
      deviceShare.end_date = deviceShareDto?.end_date;
      deviceShare.from = deviceShareDto?.from;
      deviceShare.to = deviceShareDto?.to;
      deviceShare.created_at = new Date();
      deviceShare.created_by = this.request?.user;
      const savedDeviceShare = await this.deviceShareRepository.save(
        deviceShare
      );
      delete savedDeviceShare?.created_by?.tenant;
      return resSuccess(
        'Vehicle Share Updated.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedDeviceShare
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findDeviceSingleMaintenances(id: any, maintenanceId: any) {
    try {
      const device = await this.deviceRepository.findOneBy({
        id: id,
        is_archived: false,
      });
      if (!device) {
        resError(
          `Device not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const deviceMaintenances = await this.deviceMaintenanceRepository.find({
        where: {
          id: maintenanceId,
          tenant: { id: this.request.user?.tenant.id },
        },
      });
      if (!deviceMaintenances) {
        resError(
          `Device Maintenance not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      return resSuccess(
        'Device Maintenance Fetched.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        deviceMaintenances
      );
    } catch (e) {
      console.log(e);
      return resError(e.message, ErrorConstants.Error, e.status);
    }
  }

  async updateScheduleMaintenance(
    id: any,
    maintenanceId: any,
    deviceMaintenanceDto: DeviceMaintenanceDto
  ) {
    try {
      const device = await this.deviceRepository.findOneBy({
        id: id,
        is_archived: false,
      });

      if (!device) {
        return resError(
          `Device not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const deviceMaintenance: any =
        await this.deviceMaintenanceRepository.findOneBy({
          id: maintenanceId,
          tenant: { id: this.request.user?.tenant.id },
        });

      if (deviceMaintenance) {
        deviceMaintenance.start_date_time =
          deviceMaintenanceDto?.start_date_time;
        deviceMaintenance.end_date_time = deviceMaintenanceDto?.end_date_time;
        deviceMaintenance.description = deviceMaintenanceDto?.description;
        deviceMaintenance.reduce_slots =
          deviceMaintenanceDto?.reduce_slots ?? true;
        deviceMaintenance.created_by = this.request?.user;
        deviceMaintenance.created_at = new Date();

        const savedDeviceMaintenance =
          await this.deviceMaintenanceRepository.save(deviceMaintenance);

        delete savedDeviceMaintenance?.created_by?.tenant;
        return resSuccess(
          'Device Maintenance updated.',
          SuccessConstants.SUCCESS,
          HttpStatus.CREATED,
          savedDeviceMaintenance
        );
      } else {
        return resError(
          `Device Maintenance not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
