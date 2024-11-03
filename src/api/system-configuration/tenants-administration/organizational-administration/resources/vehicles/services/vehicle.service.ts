import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  ILike,
  Repository,
  In,
  QueryRunner,
  LessThanOrEqual,
} from 'typeorm';
import { Vehicle } from '../entities/vehicle.entity';
import {
  GetAllVehiclesForDricveInterface,
  GetAllVehiclesInterface,
} from '../interface/vehicle.interface';
import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import * as dotenv from 'dotenv';
import { SuccessConstants } from '../../../../../constants/success.constants';
import { resError, resSuccess } from '../../../../../helpers/response';
import { ErrorConstants } from '../../../../../constants/error.constants';
import { User } from '../../../../user-administration/user/entity/user.entity';
import { VehicleDto } from '../dto/vehicle.dto';
import { VehicleMaintenanceDto } from '../dto/vehicle-maintenance.dto';
import { VehicleShareDto } from '../dto/vehicle-share.dto';
import { VehicleRetirementDto } from '../dto/vehicle-retirement.dto';
import { VehicleType } from '../../vehicle-type/entities/vehicle-type.entity';
import { VehicleHistory } from '../entities/vehicle-history.entity';
import { VehicleCertification } from '../entities/vehicle-certification.entity';
import { VehicleMaintenance } from '../entities/vehicle-maintenance.entity';
import { VehicleShare } from '../entities/vehicle-share.entity';
import { Certification } from '../../../../staffing-administration/certification/entity/certification.entity';
import { getModifiedDataDetails } from '../../../../../../../common/utils/modified_by_detail';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { LocationTypeEnum } from 'src/api/system-configuration/tenants-administration/staffing-administration/staff-setups/enum/type';
import { VehicleUnscheduleRetirementDto } from '../dto/vehicle-unschedule-retirement.dto';
dotenv.config();

@Injectable({ scope: Scope.REQUEST })
export class VehicleService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(VehicleType)
    private readonly vehicleTypeRepository: Repository<VehicleType>,
    @InjectRepository(VehicleCertification)
    private readonly vehicleCertificationRepository: Repository<VehicleCertification>,
    @InjectRepository(VehicleMaintenance)
    private readonly vehicleMaintenanceRepository: Repository<VehicleMaintenance>,
    @InjectRepository(VehicleShare)
    private readonly vehicleShareRepository: Repository<VehicleShare>,
    @InjectRepository(Certification)
    private readonly certificationRepository: Repository<Certification>,
    @InjectRepository(VehicleHistory)
    private readonly vehicleHistoryRepository: Repository<VehicleHistory>,
    private readonly entityManager: EntityManager
  ) {}

  async add_certifications(
    queryRunner: QueryRunner,
    vehicleCertifications: bigint[],
    vehicle_id: bigint,
    created_by: bigint
  ) {
    const certifications = [];
    const instances = await Promise.all(
      vehicleCertifications.map(async (certif_id) => {
        const vehicleCertification = new VehicleCertification();
        vehicleCertification.vehicle_id = vehicle_id;
        vehicleCertification.certification_id = certif_id;
        vehicleCertification.created_by = created_by;
        vehicleCertification.tenant_id = this?.request?.user?.tenant?.id;
        const certif = await this.certificationRepository.findOneBy({
          id: certif_id,
        });
        vehicleCertification.certification = certif;
        certif.assignments += 1;
        certifications.push(certif);
        return vehicleCertification;
      })
    );
    await queryRunner.manager.insert(VehicleCertification, instances);
    await queryRunner.manager.save(Certification, certifications);
  }

  async create(createVehicleDto: VehicleDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const user = await this.userRepository.findOneBy({
        id: createVehicleDto?.created_by,
      });
      if (!user) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const vehicleType = await this.vehicleTypeRepository.findOneBy({
        id: createVehicleDto?.vehicle_type_id,
      });
      if (!vehicleType) {
        return resError(
          `Vehicle Type not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const existingSameNameVehicle = await this.vehicleRepository.findOne({
        where: {
          name: ILike(createVehicleDto?.name.trim()),
          is_archived: false,
        },
      });

      if (existingSameNameVehicle) {
        return resError(
          `Vehicle Name Must Be Unique. Please try again.`,
          ErrorConstants.Error,
          HttpStatus.CONFLICT
        );
      }

      const vehicle = new Vehicle();
      vehicle.name = createVehicleDto?.name.trim();
      vehicle.short_name = createVehicleDto?.short_name;
      vehicle.vehicle_type_id = vehicleType;
      vehicle.collection_operation = createVehicleDto?.collection_operation_id;
      vehicle.description = createVehicleDto?.description;
      vehicle.is_active = createVehicleDto?.is_active ?? true;
      vehicle.created_by = createVehicleDto?.created_by;
      vehicle.tenant_id = this.request.user?.tenant?.id;
      vehicle.tenant_id = this.request.user?.tenant?.id;

      const savedVehicle: Vehicle = await queryRunner.manager.save(vehicle);

      await this.add_certifications(
        queryRunner,
        createVehicleDto.certifications,
        savedVehicle.id,
        createVehicleDto?.created_by
      );

      await queryRunner.commitTransaction();
      return resSuccess(
        'Vehicle Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedVehicle
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(params: GetAllVehiclesInterface) {
    const { sortBy, sortOrder } = params;
    try {
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
          is_active: params?.status,
        });
      }

      if (params?.vehicle_type) {
        Object.assign(where, {
          vehicle_type_id: params?.vehicle_type,
        });
      }

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

      Object.assign(where, {
        tenant: { id: this.request.user?.tenant?.id },
      });

      let vehicles: any = [];

      const orderBy: { [key: string]: 'ASC' | 'DESC' } = {};
      if (sortBy) {
        if (sortBy === 'vehicle_type_id') {
          orderBy['vehicle_type.name'] =
            sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        } else if (sortBy === 'collection_vehicle') {
          orderBy['vehicle_type.collection_vehicle'] =
            sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        } else if (sortBy === 'collection_operation_id') {
          orderBy['collection_operation.name'] =
            sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        } else {
          // Use the provided sortBy column from params
          orderBy[`vehicles.${sortBy}`] =
            sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        }
      } else {
        // Default orderBy in case sortBy is not provided
        orderBy['vehicles.id'] = 'DESC';
      }
      if (params?.fetchAll) {
        vehicles = this.vehicleRepository
          .createQueryBuilder('vehicles')
          .leftJoinAndSelect('vehicles.vehicle_type_id', 'vehicle_type')
          .leftJoinAndSelect(
            'vehicles.collection_operation_id',
            'collection_operation'
          )
          .orderBy(orderBy)
          .where({ ...where, is_archived: false });
      } else {
        vehicles = this.vehicleRepository
          .createQueryBuilder('vehicles')
          .leftJoinAndSelect('vehicles.vehicle_type_id', 'vehicle_type')
          .leftJoinAndSelect(
            'vehicles.collection_operation_id',
            'collection_operation'
          )
          .take(limit)
          .skip((page - 1) * limit)
          .orderBy(orderBy)
          .where({ ...where, is_archived: false });
      }

      let data;
      let count;

      [data, count] = await vehicles.getManyAndCount();

      if (count <= limit) {
        page = 1;
        vehicles = this.vehicleRepository
          .createQueryBuilder('vehicles')
          .leftJoinAndSelect('vehicles.vehicle_type_id', 'vehicle_type')
          .leftJoinAndSelect(
            'vehicles.collection_operation_id',
            'collection_operation'
          )
          .take(limit)
          .skip((page - 1) * limit)
          .orderBy(orderBy)
          .where({ ...where, is_archived: false });
        [data, count] = await vehicles.getManyAndCount();
      }

      const certifications = await this.vehicleCertificationRepository.find({
        where: {
          vehicle_id: In(data.map((vehicle) => vehicle.id)),
        },
        relations: ['vehicleId', 'certification', 'tenant'],
      });
      return {
        status: HttpStatus.OK,
        message: 'Vehicles Fetched..',
        count: count,
        data: { vehicles: data, certifications, tenant_id: data[0].tenant_id },
      };
    } catch (e) {
      console.log(e);
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAllForDrives(params: GetAllVehiclesForDricveInterface) {
    try {
      const where = {};

      if (params?.location_type) {
        Object.assign(where, {
          vehicle_type_id: { location_type_id: params?.location_type },
        });
      }

      if (params?.collection_operation) {
        Object.assign(where, {
          collection_operation_id: params?.collection_operation,
        });
      }

      Object.assign(where, {
        tenant: { id: this.request.user?.tenant?.id },
      });
      // const vehicles = this.vehicleRepository
      //   .createQueryBuilder('vehicles')
      //   .leftJoinAndSelect('vehicles.vehicle_type_id', 'vehicle_type')
      //   .leftJoinAndSelect(
      //     'vehicles.collection_operation_id',
      //     'collection_operation'
      //   )
      //   // .leftJoin('')
      //   .orderBy({ 'vehicles.id': 'DESC' })
      //   .where({ ...where, is_archived: false });

      // const response = await vehicles.getMany();

      // const result = await this.vehicleRepository.find({
      //   where: {
      //     is_archived: false,
      //     tenant: { id: this.request?.user?.tenant?.id },
      //     collection_operation: params.collection_operation,
      //     vehicle_type_id: {
      //       location_type_id: params?.location_type,
      //     },
      //     // shifts_vehicles: {
      //     //   is_archived: false,
      //     //   shift: {
      //     //     start_time: LessThanOrEqual(params?.start_time),
      //     //   },
      //     // },
      //   },
      //   relations: [
      //     'vehicle_type_id',
      //     'shifts_vehicles',
      //     'shifts_vehicles.shift',
      //   ],
      // });

      const result = await this.vehicleRepository
        .createQueryBuilder('vehicle')
        .where('vehicle.is_archived = false')
        .andWhere('vehicle.tenant = :tenantId', {
          tenantId: this.request?.user?.tenant?.id,
        })
        .andWhere('vehicle.collection_operation = :collectionOperation', {
          collectionOperation: params?.collection_operation,
        })
        .andWhere('vehicle_type_id.location_type_id = :locationType', {
          locationType: params?.location_type,
        })
        .andWhere('(sv.created_at IS NULL OR s.end_time <= :startTime)', {
          startTime: params?.start_time
            ? params?.start_time
            : '0000-00-00 00:00:00.000000+00:00',
        })
        .leftJoin('vehicle.vehicle_type_id', 'vehicle_type_id')
        .leftJoin('vehicle.shifts_vehicles', 'sv')
        .leftJoin('sv.shift', 's')
        .select(['vehicle', 'vehicle_type_id', 'sv', 's'])
        .getMany();
      // const query = this.vehicleRepository
      //   .createQueryBuilder('vehicle')
      //   .select(
      //     `(
      //         SELECT JSON_AGG(JSON_BUILD_OBJECT(
      //           'id', vehicle.id,
      //           'name', vehicle.name
      //         ))
      //         FROM vehicle
      //         WHERE vehicle.vehicle_type_id = vehicle_type.id
      //         AND vehicle.collection_operation = ${params?.collection_operation}
      //         AND vehicle_type.location_type_id = ${params?.location_type}
      //       ) AS "vehicle"`
      //   )
      //   .leftJoin('vehicle.vehicle_type_id', 'vehicle_type')
      //   .leftJoin('shifts_vehicles', 'sv', 'sv.vehicle_id = vehicle.id')
      //   .leftJoin('shifts', 's', 's.id = sv.shift_id')
      //   .where(
      //     `(
      //         vehicle.is_archived = false
      //         AND vehicle.tenant = ${this.request.user?.tenant?.id}
      //       AND (
      //           (sv.created_at IS NULL)
      //           OR (s.end_time < '${params?.start_time}')
      //         )
      //       )`
      //   )
      //   .orderBy('vehicle.id', 'DESC')
      //   .getQuery();

      // const response = await this.vehicleRepository.query(query);
      // const filteredResult = response?.filter((row) => row.vehicle !== null);
      return {
        status: HttpStatus.OK,
        message: 'Vehicles Fetched.',
        data: result,
      };
    } catch (e) {
      console.log(e);
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: any) {
    try {
      const vehicleData = await this.vehicleRepository.findOneBy({
        id: id,
        is_archived: false,
      });
      if (!vehicleData) {
        return resError(
          `Vehicle not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const vehicle: any = await this.vehicleRepository.findOne({
        where: {
          id,
        },
        relations: [
          'vehicle_type_id',
          'created_by',
          'collection_operation_id',
          'replace_vehicle_id',
        ],
      });

      const certifications = await this.vehicleCertificationRepository.find({
        where: {
          vehicle_id: In([vehicle.id]),
        },
        relations: ['certification'],
      });

      if (vehicle) {
        const modifiedData: any = await getModifiedDataDetails(
          this.vehicleHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        vehicle.modified_by = vehicle.created_by;
        vehicle.modified_at = vehicle.created_at;
        vehicle.created_at = modified_at ? modified_at : vehicle.created_at;
        vehicle.created_by = modified_by ? modified_by : vehicle.created_by;
      }

      return resSuccess(
        'Vehicle fetched.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        {
          vehicle,
          certifications,
          tenant_id: vehicle.tenant_id,
        }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(id: any, updateVehicleDto: VehicleDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const vehicleData: any = await this.vehicleRepository.findOne({
        where: {
          id,
          is_archived: false,
        },
        relations: [
          'vehicle_type_id',
          'created_by',
          'collection_operation_id',
          'tenant',
        ],
      });
      if (!vehicleData) {
        return resError(
          `Vehicle not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      if (updateVehicleDto.name && updateVehicleDto.name !== vehicleData.name) {
        const existingSameNameVehicle = await this.vehicleRepository.findOne({
          where: {
            name: updateVehicleDto.name.trim(),
            is_archived: false,
          },
        });

        if (existingSameNameVehicle) {
          return resError(
            `Vehicle Name Must Be Unique. Please try again.`,
            ErrorConstants.Error,
            HttpStatus.CONFLICT
          );
        }
      }
      const user = await this.userRepository.findOneBy({
        id: updateVehicleDto?.created_by,
      });
      if (!user) {
        return resError(
          `User not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const vehicleTypeData = await this.vehicleTypeRepository.findOneBy({
        id: updateVehicleDto?.vehicle_type_id,
      });
      if (!vehicleTypeData) {
        return resError(
          `Vehicle Type not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const vehicleUpdateObject = {
        name: updateVehicleDto?.name.trim() ?? vehicleData?.name.trim(),
        short_name: updateVehicleDto?.short_name ?? vehicleData?.short_name,
        vehicle_type_id:
          updateVehicleDto?.vehicle_type_id ?? vehicleData?.vehicle_type_id,
        collection_operation:
          updateVehicleDto?.collection_operation_id ??
          vehicleData?.collection_operation_id,
        description: updateVehicleDto?.description ?? vehicleData?.description,
        is_active: updateVehicleDto.hasOwnProperty('is_active')
          ? updateVehicleDto.is_active
          : vehicleData?.is_active,
        created_by: updateVehicleDto?.created_by ?? vehicleData?.created_by,
        created_at: new Date(),
      };

      let updatedVehicle: any = await queryRunner.manager.update(
        Vehicle,
        { id: vehicleData.id },
        { ...vehicleUpdateObject }
      );
      if (!updatedVehicle.affected) {
        return resError(
          `Vehicle update failed`,
          ErrorConstants.Error,
          HttpStatus.NOT_MODIFIED
        );
      }

      await this.vehicleCertificationRepository
        .createQueryBuilder('vehicle_certification')
        .delete()
        .from(VehicleCertification)
        .where('vehicle_id = :vehicle_id', { vehicle_id: vehicleData.id })
        .execute();

      const promises = [];
      for (const certification of updateVehicleDto.certifications) {
        if (certification !== null) {
          const vehicleCertification = new VehicleCertification();
          vehicleCertification.vehicle_id = vehicleData.id;
          vehicleCertification.certification_id = certification;
          vehicleCertification.created_by = updateVehicleDto?.created_by;
          vehicleCertification.tenant_id = this.request.user?.tenant?.id;

          promises.push(queryRunner.manager.save(vehicleCertification));
        }
      }
      await Promise.all(promises);
      await queryRunner.commitTransaction();

      updatedVehicle = await this.vehicleRepository.findOne({
        where: {
          id: vehicleData.id,
        },
        relations: ['vehicle_type_id', 'collection_operation_id'],
      });

      const certifications = await this.vehicleCertificationRepository.find({
        where: {
          vehicle_id: In([updatedVehicle.id]),
        },
        relations: ['certification'],
      });

      return resSuccess(
        'Vehicle Updated.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        {
          vehicle: updatedVehicle,
          certifications,
          tenant_id: vehicleData?.tenant?.id,
        }
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
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

      const vehicle: any = await this.vehicleRepository.findOne({
        where: {
          id,
          is_archived: false,
          tenant: {
            id: user?.tenant?.id,
          },
        },
        relations: [
          'vehicle_type_id',
          'created_by',
          'collection_operation_id',
          'tenant',
        ],
      });

      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }

      vehicle.is_archived = true;
      vehicle.created_at = new Date();
      vehicle.created_by = this.request?.user;
      // Archive the Vehicle  entity
      const archivedVehicle = await queryRunner.manager.save(vehicle);
      Object.assign(archivedVehicle, {
        tenant_id: archivedVehicle?.tenant?.id,
      });
      await queryRunner.commitTransaction();
      delete archivedVehicle.created_by;
      return resSuccess(
        'Vehicle Archived.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        archivedVehicle
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async scheduleMaintenance(
    id: any,
    vehicleMaintenanceDto: VehicleMaintenanceDto
  ) {
    try {
      const user = await this.userRepository.findOneBy({
        id: vehicleMaintenanceDto?.created_by,
      });
      if (!user) {
        return resError(
          `User not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const vehicleMaintenance = new VehicleMaintenance();
      vehicleMaintenance.vehicle_id = id;
      vehicleMaintenance.start_date_time =
        vehicleMaintenanceDto?.start_date_time;
      vehicleMaintenance.end_date_time = vehicleMaintenanceDto?.end_date_time;
      vehicleMaintenance.description = vehicleMaintenanceDto?.description;
      vehicleMaintenance.prevent_booking =
        vehicleMaintenanceDto?.prevent_booking ?? true;
      vehicleMaintenance.created_by = vehicleMaintenanceDto?.created_by;
      vehicleMaintenance.tenant_id = this?.request?.user?.tenant?.id;
      const savedVehicleMaintenance =
        await this.vehicleMaintenanceRepository.save(vehicleMaintenance);

      return resSuccess(
        'Vehicle Maintenance Scheduled.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedVehicleMaintenance
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async share(id: any, vehicleShareDto: VehicleShareDto) {
    try {
      const user = await this.userRepository.findOneBy({
        id: vehicleShareDto?.created_by,
      });
      if (!user) {
        return resError(
          `User not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const vehicleShare = new VehicleShare();
      vehicleShare.vehicle_id = id;
      vehicleShare.start_date = vehicleShareDto?.start_date;
      vehicleShare.end_date = vehicleShareDto?.end_date;
      vehicleShare.from = vehicleShareDto?.from;
      vehicleShare.to = vehicleShareDto?.to;
      vehicleShare.created_by = vehicleShareDto?.created_by;
      vehicleShare.tenant_id = this.request.user?.tenant?.id;
      const savedVehicleShare = await this.vehicleShareRepository.save(
        vehicleShare
      );

      return resSuccess(
        'Vehicle Sharing Scheduled.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedVehicleShare
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async scheduleRetirement(
    id: any,
    vehicleRetirementDto: VehicleRetirementDto
  ) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const vehicleData: any = await this.vehicleRepository.findOne({
        where: {
          id,
          is_archived: false,
        },
        relations: [
          'vehicle_type_id',
          'created_by',
          'collection_operation_id',
          'tenant',
        ],
      });
      if (!vehicleData) {
        return resError(
          `Vehicle not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const user = await this.userRepository.findOneBy({
        id: vehicleRetirementDto?.created_by,
      });
      if (!user) {
        return resError(
          `User not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const vehicleUpdateObject = {
        retire_on: vehicleRetirementDto?.retire_on ?? vehicleData?.retire_on,
        replace_vehicle_id:
          vehicleRetirementDto?.replace_vehicle_id ??
          vehicleData?.replace_vehicle_id,
        created_by: vehicleRetirementDto?.created_by ?? vehicleData?.created_by,
        created_at: new Date(),
      };
      let updatedVehicle: any = await queryRunner.manager.update(
        Vehicle,
        { id: vehicleData.id },
        { ...vehicleUpdateObject }
      );
      if (!updatedVehicle.affected) {
        return resError(
          `Vehicle retirement failed.`,
          ErrorConstants.Error,
          HttpStatus.NOT_MODIFIED
        );
      }

      await queryRunner.commitTransaction();

      updatedVehicle = await this.vehicleRepository.findOne({
        where: {
          id: vehicleData.id,
        },
        relations: ['vehicle_type_id', 'collection_operation_id'],
      });

      return resSuccess(
        'Vehicle Retirement Scheduled.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        updatedVehicle
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
    vehicleRetirementDto: VehicleUnscheduleRetirementDto
  ) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const vehicleData: any = await this.vehicleRepository.findOne({
        where: {
          id,
          is_archived: false,
        },
        relations: [
          'vehicle_type_id',
          'created_by',
          'collection_operation_id',
          'tenant',
        ],
      });
      if (!vehicleData) {
        return resError(
          `Vehicle not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const user = await this.userRepository.findOneBy({
        id: vehicleRetirementDto?.created_by,
      });
      if (!user) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const vehicleUpdateObject = {
        retire_on: null,
        replace_vehicle_id: null,
        created_by: vehicleRetirementDto?.created_by ?? vehicleData?.created_by,
        created_at: new Date(),
      };
      let updatedVehicle: any = await queryRunner.manager.update(
        Vehicle,
        { id: vehicleData.id },
        { ...vehicleUpdateObject }
      );
      if (!updatedVehicle.affected) {
        return resError(
          `Vehicle retirement failed.`,
          ErrorConstants.Error,
          HttpStatus.NOT_MODIFIED
        );
      }

      await queryRunner.commitTransaction();

      updatedVehicle = await this.vehicleRepository.findOne({
        where: {
          id: vehicleData.id,
        },
        relations: ['vehicle_type_id', 'collection_operation_id'],
      });

      return resSuccess(
        'Vehicle Retirement Scheduled.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        updatedVehicle
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async findVehicleMaintenances(id: any) {
    try {
      const vehicleData = await this.vehicleRepository.findOne({
        where: {
          id,
          is_archived: false,
        },
      });

      if (!vehicleData) {
        resError(
          `Vehicle not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const vehicleMaintenances = await this.vehicleMaintenanceRepository
        .createQueryBuilder('vm')
        .where({
          vehicle_id: { id: vehicleData.id, is_archived: false },
          tenant: this.request.user?.tenant,
        })
        .orderBy('vm.id', 'DESC')
        .execute();

      return resSuccess(
        'Vehicle Maintenances Fetched.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        vehicleMaintenances
      );
    } catch (e) {
      console.log(e);
      return resError(e.message, ErrorConstants.Error, e.status);
    }
  }

  async findVehicleSingleMaintenances(id: any, maintenanceId: any) {
    try {
      const vehicleMaintenances = await this.vehicleMaintenanceRepository
        .createQueryBuilder('vm')
        .where({
          id: maintenanceId,
          vehicle_id: { id: id, is_archived: false },
          tenant: this.request.user?.tenant,
        })
        .execute();

      if (!vehicleMaintenances) {
        resError(
          `Vehicle Maintenance not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      return resSuccess(
        'Vehicle Maintenance Fetched.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        vehicleMaintenances
      );
    } catch (e) {
      console.log(e);
      return resError(e.message, ErrorConstants.Error, e.status);
    }
  }

  async updateScheduleMaintenance(
    id: any,
    maintenanceId: any,
    vehicleMaintenanceDto: VehicleMaintenanceDto
  ) {
    try {
      const vehicle = await this.vehicleRepository.findOneBy({
        id: id,
        is_archived: false,
      });

      if (!vehicle) {
        return resError(
          `Vehicle not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const vehicleMaintenance: any =
        await this.vehicleMaintenanceRepository.findOneBy({
          id: maintenanceId,
        });

      if (vehicleMaintenance) {
        vehicleMaintenance.start_date_time =
          vehicleMaintenanceDto?.start_date_time;
        vehicleMaintenance.end_date_time = vehicleMaintenanceDto?.end_date_time;
        vehicleMaintenance.description = vehicleMaintenanceDto?.description;
        vehicleMaintenance.prevent_booking =
          vehicleMaintenanceDto?.prevent_booking ?? true;
        vehicleMaintenance.created_at = new Date();
        vehicleMaintenance.created_by = this.request?.user;

        const savedVehicleMaintenance =
          await this.vehicleMaintenanceRepository.save(vehicleMaintenance);

        return resSuccess(
          'Vehicle Maintenance updated.',
          SuccessConstants.SUCCESS,
          HttpStatus.CREATED,
          savedVehicleMaintenance
        );
      } else {
        return resError(
          `Vehicle Maintenance not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findVehicleShares(id: any) {
    try {
      const vehicleData = await this.vehicleRepository.findOne({
        where: {
          id,
          is_archived: false,
        },
      });

      if (!vehicleData) {
        resError(
          `Vehicle not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const vehicleShares = await this.vehicleShareRepository
        .createQueryBuilder('vs')
        .where({
          vehicle_id: { id: vehicleData.id, is_archived: false },
          tenant: this.request.user?.tenant,
        })
        .leftJoinAndSelect('vs.from', 'from')
        .leftJoinAndSelect('vs.to', 'to')
        .orderBy('vs.id', 'DESC')
        .execute();

      return resSuccess(
        'Vehicle Shares Fetched.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        vehicleShares
      );
    } catch (e) {
      console.log(e);
      return resError(e.message, ErrorConstants.Error, e.status);
    }
  }

  async findShare(id: any, shareId: any) {
    try {
      const vehicle = await this.vehicleRepository.findOneBy({
        id: id,
        is_archived: false,
      });
      if (!vehicle) {
        resError(
          `Vehicle not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const shareData = await this.vehicleShareRepository.find({
        where: {
          id: shareId,
          tenant: this.request.user?.tenant,
        },
        relations: ['from', 'to'],
      });
      if (!shareData) {
        resError(
          `Vehicle Share not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      return resSuccess(
        'Vehicle Share Fetched.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        shareData
      );
    } catch (e) {
      console.log(e);
      return resError(e.message, ErrorConstants.Error, e.status);
    }
  }

  async editShare(id: any, shareId: any, vehicleShareDto: VehicleShareDto) {
    try {
      const vehicle = await this.vehicleRepository.findOneBy({
        id: id,
        is_archived: false,
      });
      if (!vehicle) {
        resError(
          `Vehicle not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const vehicleShare: any = await this.vehicleShareRepository.findOneBy({
        id: shareId,
      });

      if (!vehicleShare) {
        resError(
          `Vehicle Share not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      vehicleShare.start_date = vehicleShareDto?.start_date;
      vehicleShare.end_date = vehicleShareDto?.end_date;
      vehicleShare.from = vehicleShareDto?.from;
      vehicleShare.to = vehicleShareDto?.to;
      vehicleShare.created_at = new Date();
      vehicleShare.created_by = this.request?.user;
      const savedVehicleShare = await this.vehicleShareRepository.save(
        vehicleShare
      );

      return resSuccess(
        'Vehicle Share Updated.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedVehicleShare
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
