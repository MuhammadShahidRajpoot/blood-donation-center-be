import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, EntityManager } from 'typeorm';
import { VehicleType } from '../entities/vehicle-type.entity';
import { VehicleTypeHistory } from '../entities/vehicle-type-history.entity';
import { VehicleTypeDto } from '../dto/vehicle-type.dto';
import { resError, resSuccess } from '../../../../../helpers/response';
import { ErrorConstants } from '../../../../../constants/error.constants';
import { User } from '../../../../user-administration/user/entity/user.entity';
import { SuccessConstants } from '../../../../../constants/success.constants';
import { GetAllVehicleTypesInterface } from '../interface/vehicle-type.interface';
import { getModifiedDataDetails } from '../../../../../../../common/utils/modified_by_detail';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';

@Injectable({ scope: Scope.REQUEST })
export class VehicleTypeService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(VehicleType)
    private readonly vehicleTypeRepository: Repository<VehicleType>,
    @InjectRepository(VehicleTypeHistory)
    private readonly vehicleTypeHistoryRepository: Repository<VehicleTypeHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager
  ) {}

  async create(createVehicleTypeDto: VehicleTypeDto) {
    try {
      const user = await this.userRepository.findOneBy({
        id: createVehicleTypeDto?.created_by,
      });
      if (!user) {
        return resError(
          `User not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      // Create a Vehicle Type instance
      const vehicleType = new VehicleType();
      // Set Vehicle Type properties from createVehicleType
      vehicleType.name = createVehicleTypeDto.name;
      vehicleType.description = createVehicleTypeDto.description;
      vehicleType.location_type_id = createVehicleTypeDto?.location_type_id;
      vehicleType.linkable = createVehicleTypeDto?.linkable;
      vehicleType.collection_vehicle = createVehicleTypeDto?.collection_vehicle;
      vehicleType.is_active = createVehicleTypeDto?.is_active;
      vehicleType.created_by = createVehicleTypeDto?.created_by;
      vehicleType.tenant_id = this.request?.user?.tenant?.id;

      // Save the Vehicle Type entity
      const savedVehicleType = await this.vehicleTypeRepository.save(
        vehicleType
      );
      return resSuccess(
        'Vehicle Type Created Successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedVehicleType
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAll(
    getAllVehicleTypesInterface: GetAllVehicleTypesInterface
  ): Promise<any> {
    try {
      const page =
        getAllVehicleTypesInterface?.page &&
        +getAllVehicleTypesInterface?.page >= 1
          ? +getAllVehicleTypesInterface?.page
          : 1;
      const limit: number = getAllVehicleTypesInterface?.limit
        ? +getAllVehicleTypesInterface?.limit
        : +process.env.PAGE_SIZE;

      const where = {};
      if (getAllVehicleTypesInterface?.name) {
        Object.assign(where, {
          name: ILike(`%${getAllVehicleTypesInterface?.name}%`),
        });
      }

      if (getAllVehicleTypesInterface?.location_type) {
        Object.assign(where, {
          location_type_id: getAllVehicleTypesInterface.location_type,
        });
      }

      if (getAllVehicleTypesInterface?.linkable) {
        Object.assign(where, {
          linkable: getAllVehicleTypesInterface.linkable,
        });
      }

      if (getAllVehicleTypesInterface?.status) {
        Object.assign(where, {
          is_active: getAllVehicleTypesInterface.status,
        });
      }

      Object.assign(where, {
        tenant: { id: this.request.user?.tenant?.id },
      });
      let orderObject: any = {
        id: 'DESC',
      };

      const sortKey = getAllVehicleTypesInterface.sortBy;
      let sortOrder;
      if (getAllVehicleTypesInterface.sortOrder) {
        sortOrder = getAllVehicleTypesInterface.sortOrder.toUpperCase();
      }
      if (sortKey) {
        if (sortKey === 'location_type_id') {
          sortOrder = sortOrder == 'ASC' ? 'DESC' : 'ASC';
          orderObject = { [sortKey]: sortOrder };
        } else {
          orderObject = { [sortKey]: sortOrder };
        }
      }

      let response = [];
      let count = 0;
      if (getAllVehicleTypesInterface?.fetchAll) {
        [response, count] = await this.vehicleTypeRepository.findAndCount({
          where: { ...where, is_archived: false },
          order: { ['name']: 'ASC' },
        });
      } else {
        [response, count] = await this.vehicleTypeRepository.findAndCount({
          where: { ...where, is_archived: false },
          take: limit,
          skip: (page - 1) * limit,
          order: { ...orderObject },
        });
      }

      return {
        status: HttpStatus.OK,
        response: 'Vehicle Types Fetched Successfully',
        count: count,
        data: response,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findOne(id: any): Promise<any> {
    try {
      const vehicleType: any = await this.vehicleTypeRepository.findOne({
        where: { id, is_archived: false },
        relations: ['created_by'],
      });

      if (!vehicleType) {
        throw new NotFoundException('Vehicle type not found');
      }
      if (vehicleType) {
        const modifiedData: any = await getModifiedDataDetails(
          this.vehicleTypeHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        vehicleType.modified_by = vehicleType.created_by;
        vehicleType.modified_at = vehicleType.created_at;
        vehicleType.created_at = modified_at
          ? modified_at
          : vehicleType.created_at;
        vehicleType.created_by = modified_by
          ? modified_by
          : vehicleType.created_by;
      }

      return resSuccess(
        'Vehicle Type Fetched Succesfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        { ...vehicleType }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(id: any, updateVehicleTypeDto: VehicleTypeDto): Promise<any> {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const vehicleType: any = await this.vehicleTypeRepository.findOne({
        where: {
          id,
          is_archived: false,
          tenant_id: this.request?.user?.tenant?.id,
        },
        relations: ['created_by'],
      });

      if (!vehicleType) {
        throw new NotFoundException('Vehicle type not found');
      }

      vehicleType.name = updateVehicleTypeDto.name;
      vehicleType.description = updateVehicleTypeDto.description;
      vehicleType.location_type_id = updateVehicleTypeDto.location_type_id;
      vehicleType.linkable = updateVehicleTypeDto.linkable;
      vehicleType.collection_vehicle = updateVehicleTypeDto.collection_vehicle;
      vehicleType.is_active = updateVehicleTypeDto.is_active;
      vehicleType.created_by = this.request?.user;
      vehicleType.created_at = new Date();
      delete vehicleType?.created_by?.tenant;
      // vehicleType.updated_by = updateVehicleTypeDto?.updated_by
      // Update the Vehicle Type entity
      const updatedVehicleType = await queryRunner.manager.save(vehicleType);
      await queryRunner.commitTransaction();

      return resSuccess(
        'Vehicle Type Updated Succesfuly',
        SuccessConstants.SUCCESS,
        HttpStatus.NO_CONTENT,
        updatedVehicleType
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async delete(id: any, user: any) {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const vehicleType: any = await this.vehicleTypeRepository.findOne({
        where: {
          id,
          is_archived: false,
          tenant: {
            id: user?.tenant?.id,
          },
        },
        relations: ['created_by', 'tenant'],
      });

      if (!vehicleType) {
        throw new NotFoundException('Vehicle type not found');
      }

      vehicleType.is_archived = true;
      vehicleType.created_at = new Date();
      vehicleType.created_by = this.request?.user;
      // Archive the Vehicle Type entity
      const archivedVehicleType = await queryRunner.manager.save(vehicleType);

      Object.assign(archivedVehicleType, {
        tenant_id: archivedVehicleType?.tenant?.id,
      });
      await queryRunner.commitTransaction();
      delete archivedVehicleType.created_by;
      return resSuccess(
        'Vehicle Type Archived Succesfuly',
        SuccessConstants.SUCCESS,
        HttpStatus.GONE,
        archivedVehicleType
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }
}
