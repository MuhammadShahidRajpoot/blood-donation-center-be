import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { DeviceType } from '../entity/device-type.entity';
import {
  GetAllDeviceTypesInterface,
  ArchiveDeviceTypeInterface,
} from '../interface/device-type.interface';
import { HttpStatus, Inject, Injectable, Scope } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { SuccessConstants } from '../../../../../constants/success.constants';
import { resError, resSuccess } from '../../../../../helpers/response';
import { ErrorConstants } from '../../../../../constants/error.constants';
import { User } from '../../../../user-administration/user/entity/user.entity';
import { CreateDeviceTypeDto } from '../dto/create-device-type.dto';
import { UpdateDeviceTypeDto } from '../dto/update-device-type.dto';
import { ProcedureTypes } from '../../../products-procedures/procedure-types/entities/procedure-types.entity';
import { DeviceTypeHistory } from '../entity/deviceTypeHistory';
import { getModifiedDataDetails } from '../../../../../../../common/utils/modified_by_detail';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
dotenv.config();

@Injectable({ scope: Scope.REQUEST })
export class DeviceTypeService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(DeviceType)
    private readonly deviceTypeRepository: Repository<DeviceType>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProcedureTypes)
    private readonly procedureTypesRepository: Repository<ProcedureTypes>,
    @InjectRepository(DeviceTypeHistory)
    private readonly deviceTypeHistoryRepository: Repository<DeviceTypeHistory>
  ) {}

  async addDeviceType(createDeviceTypeDto: CreateDeviceTypeDto) {
    try {
      const user = await this.userRepository.findOneBy({
        id: createDeviceTypeDto?.created_by,
      });
      if (!user) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const procedureType = await this.procedureTypesRepository.findOneBy({
        id: createDeviceTypeDto?.procedure_type,
      });
      if (!procedureType) {
        return resError(
          `Procedure type not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const deviceType = new DeviceType();
      deviceType.name = createDeviceTypeDto?.name;
      deviceType.procedure_type = createDeviceTypeDto?.procedure_type;
      deviceType.description = createDeviceTypeDto?.description;
      deviceType.status = createDeviceTypeDto?.status ?? true;
      deviceType.created_by = createDeviceTypeDto?.created_by;
      deviceType.tenant_id = this.request.user?.tenant?.id;
      const savedDeviceType = await this.deviceTypeRepository.save(deviceType);
      return resSuccess(
        'Device Type created successfully', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedDeviceType
      );
    } catch (error) {
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAll(getAllDeviceTypesInterface: GetAllDeviceTypesInterface) {
    try {
      const limit: number = getAllDeviceTypesInterface?.limit
        ? +getAllDeviceTypesInterface?.limit
        : +process.env.PAGE_SIZE;

      let page = getAllDeviceTypesInterface?.page
        ? +getAllDeviceTypesInterface?.page
        : 1;

      if (page < 1) {
        page = 1;
      }
      let orderObject: any = {
        id: 'DESC',
      };
      const where = { is_archive: false };
      if (getAllDeviceTypesInterface?.name) {
        Object.assign(where, {
          name: ILike(`%${getAllDeviceTypesInterface?.name}%`),
        });
      }
      if (getAllDeviceTypesInterface.hasOwnProperty('status')) {
        Object.assign(where, {
          status: getAllDeviceTypesInterface.status,
        });
      }

      if (getAllDeviceTypesInterface?.sortBy) {
        if (getAllDeviceTypesInterface?.sortBy === 'procedure_type') {
          const sortOrder = getAllDeviceTypesInterface.sortOrder ?? 'DESC';
          orderObject = {
            procedure_type: {
              name: sortOrder,
            },
          };
        } else {
          const sortKey = getAllDeviceTypesInterface.sortBy;
          const sortOrder = getAllDeviceTypesInterface.sortOrder ?? 'DESC';
          orderObject = { [sortKey]: sortOrder };
        }
      }

      Object.assign(where, {
        tenant: { id: this.request.user?.tenant?.id },
      });

      let response;
      let count;
      if (getAllDeviceTypesInterface?.fetchAll) {
        [response, count] = await this.deviceTypeRepository.findAndCount({
          where,
          relations: ['procedure_type', 'tenant'],
        });
      } else {
        [response, count] = await this.deviceTypeRepository.findAndCount({
          where,
          relations: ['procedure_type', 'tenant'],
          take: limit,
          skip: (page - 1) * limit,
          order: { ...orderObject },
        });
      }

      return {
        status: HttpStatus.OK,
        response: 'Device types fetched successfully',
        count: count,
        data: response,
      };
    } catch (error) {
      // return error
      return resError(
        error.message,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async find(id: any) {
    try {
      const deviceTypeData = await this.deviceTypeRepository.findOneBy({
        id: id,
      });
      if (!deviceTypeData) {
        return resError(
          `Device Type not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const deviceType: any = await this.deviceTypeRepository.findOne({
        where: {
          id: id,
        },
        relations: ['procedure_type', 'created_by'],
      });

      const getName = await this.userRepository.findOne({
        where: {
          id: deviceType?.created_by?.id,
        },
        relations: ['tenant'],
      });

      if (deviceType) {
        const modifiedData: any = await getModifiedDataDetails(
          this.deviceTypeHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        deviceType.modified_by = deviceType.created_by;
        deviceType.modified_at = deviceType.created_at;
        deviceType.created_at = modified_at
          ? modified_at
          : deviceType.created_at;
        deviceType.created_by = modified_by
          ? modified_by
          : deviceType.created_by;
      }

      return resSuccess(
        'Device Type fetch successfully', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        deviceType
      );
    } catch (error) {
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async updateDeviceType(updateDeviceTypeDto: UpdateDeviceTypeDto) {
    try {
      const deviceTypeData = await this.deviceTypeRepository.findOne({
        where: {
          id: updateDeviceTypeDto.id,
        },
        relations: ['procedure_type', 'created_by', 'tenant'],
      });
      if (!deviceTypeData) {
        return resError(
          `Device Type not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const user = await this.userRepository.findOneBy({
        id: updateDeviceTypeDto?.created_by,
      });
      if (!user) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const procedureType = await this.procedureTypesRepository.findOneBy({
        id: updateDeviceTypeDto?.procedure_type,
      });
      if (!procedureType) {
        return resError(
          `Procedure type not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const deviceTypeUpdateObject = {
        name: updateDeviceTypeDto?.name ?? deviceTypeData?.name,
        procedure_type: updateDeviceTypeDto?.procedure_type,
        description:
          updateDeviceTypeDto?.description ?? deviceTypeData?.description,
        status: updateDeviceTypeDto.hasOwnProperty('status')
          ? updateDeviceTypeDto.status
          : deviceTypeData?.status,
        created_by: updateDeviceTypeDto?.created_by,
        tenant: deviceTypeData?.tenant,
        created_at: new Date(),
        // updated_by: updateDeviceTypeDto?.updated_by
      };
      const updateDeviceType = await this.deviceTypeRepository.update(
        { id: deviceTypeData.id },
        { ...deviceTypeUpdateObject }
      );
      if (!updateDeviceType.affected) {
        return resError(
          `Device type update failed.`,
          ErrorConstants.Error,
          HttpStatus.NOT_MODIFIED
        );
      }

      const savedDeviceType = await this.deviceTypeRepository.findOne({
        where: {
          id: updateDeviceTypeDto.id,
        },
        relations: ['procedure_type'],
      });
      return resSuccess(
        'Device Type updated successfully', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedDeviceType
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
  async archiveDeviceType(
    archiveDeviceTypeInterface: ArchiveDeviceTypeInterface,
    updatedBy: any
  ) {
    try {
      const deviceTypeData = await this.deviceTypeRepository.findOne({
        where: { id: archiveDeviceTypeInterface?.id },
        relations: ['tenant'],
      });
      if (!deviceTypeData) {
        return resError(
          `Device Type not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const updateDeviceType = await this.deviceTypeRepository.update(
        { id: deviceTypeData.id },
        {
          is_archive: archiveDeviceTypeInterface.is_archive,
          created_at: new Date(),
          created_by: updatedBy,
        }
      );
      if (!updateDeviceType.affected) {
        return resError(
          `device type archived failed.`,
          ErrorConstants.Error,
          HttpStatus.NOT_MODIFIED
        );
      }

      const savedDeviceType = await this.deviceTypeRepository.findOne({
        where: {
          id: archiveDeviceTypeInterface.id,
        },
        relations: ['procedure_type'],
      });
      return resSuccess(
        'Device Type archived successfully', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        null
      );
    } catch (error) {
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
