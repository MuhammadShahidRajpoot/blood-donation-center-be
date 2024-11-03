import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Repository, Brackets, EntityManager } from 'typeorm';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AddResourceShareFullfilmentDto,
  CreateResourceSharingDto,
  ResourceFullfilmentDto,
} from '../dto/create-resource-sharing.dto';
import { UserRequest } from 'src/common/interface/request';
import { REQUEST } from '@nestjs/core';
import { ResourceSharings } from '../entities/resource-sharing.entity';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import moment from 'moment';
import { HistoryService } from 'src/api/common/services/history.service';
import { ResourceSharingsHistory } from '../entities/resource-sharing-history.entity';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { GetAllResourceSharingInterface } from '../interface/resource-sharing.interface';
import { Vehicle } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/vehicles/entities/vehicle.entity';
import { Device } from 'src/api/system-configuration/tenants-administration/organizational-administration/resources/device/entities/device.entity';
import { Staff } from 'src/api/crm/contacts/staff/entities/staff.entity';
import { ResourceSharingsFulfillment } from '../entities/resource-sharing-fullfilment.entity';
import { ResourceSharingsFulfillmentHistory } from '../entities/resource-sharing-fullfilment-history.entity';
import { resource_share_type_enum } from '../enum/resource-sharing.enum';

@Injectable()
export class ResourceSharingService extends HistoryService<ResourceSharingsHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(ResourceSharings)
    private readonly resourceSharingRepository: Repository<ResourceSharings>,
    @InjectRepository(ResourceSharingsHistory)
    private readonly resourceSharingHistoryRepository: Repository<ResourceSharingsHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(ResourceSharingsFulfillment)
    private readonly saveFullfilmentRepo: Repository<ResourceSharingsFulfillment>,
    @InjectRepository(ResourceSharingsFulfillmentHistory)
    private readonly saveFullfilmentHistoryRepo: Repository<ResourceSharingsFulfillmentHistory>,

    private readonly entityManager: EntityManager
  ) {
    super(resourceSharingHistoryRepository);
  }
  async create(createResourceSharingDto: CreateResourceSharingDto) {
    try {
      const {
        start_date,
        end_date,
        share_type,
        quantity,
        description,
        is_active,
        from_collection_operation_id,
        to_collection_operation_id,
      } = createResourceSharingDto;

      const resourceSahring: any = new ResourceSharings();
      resourceSahring.description = description;
      resourceSahring.end_date = end_date;
      resourceSahring.start_date = start_date;
      resourceSahring.quantity = quantity;
      resourceSahring.share_type = share_type;
      resourceSahring.is_active = is_active;
      resourceSahring.from_collection_operation_id =
        from_collection_operation_id;
      resourceSahring.to_collection_operation_id = to_collection_operation_id;
      resourceSahring.tenant_id = this.request.user?.tenant;
      resourceSahring.created_by = this.request?.user;
      const savedData = await this.resourceSharingRepository.save(
        resourceSahring
      );

      return resSuccess(
        'Resource Share Created.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        {}
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(id: any, updateResourceShareDto: CreateResourceSharingDto) {
    try {
      const resourceShareData: any =
        await this.resourceSharingRepository.findOne({
          where: {
            id: id,
            is_archived: false,
          },
          relations: [
            'from_collection_operation_id',
            'to_collection_operation_id',
          ],
        });
      if (!resourceShareData) {
        resError(
          `Resource share data not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      resourceShareData.description =
        updateResourceShareDto.description ?? resourceShareData.description;
      resourceShareData.end_date =
        updateResourceShareDto.end_date ?? resourceShareData?.end_date;
      resourceShareData.start_date =
        updateResourceShareDto.start_date ?? resourceShareData?.start_date;
      resourceShareData.quantity =
        updateResourceShareDto.quantity ?? resourceShareData?.quantity;
      resourceShareData.share_type =
        updateResourceShareDto.share_type ?? resourceShareData?.share_type;
      resourceShareData.is_active = updateResourceShareDto.hasOwnProperty(
        'is_active'
      )
        ? updateResourceShareDto?.is_active
        : resourceShareData?.is_active;
      resourceShareData.from_collection_operation_id =
        updateResourceShareDto.from_collection_operation_id ??
        resourceShareData?.from_collection_operation_id;
      resourceShareData.to_collection_operation_id =
        updateResourceShareDto.to_collection_operation_id ??
        resourceShareData?.to_collection_operation_id;
      resourceShareData.created_at = new Date();
      resourceShareData.created_by = this.request?.user;
      const savedData = await this.resourceSharingRepository.save(
        resourceShareData
      );
      return resSuccess(
        'Resource Share updated.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        {}
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getSingleResourceShare(id: any) {
    try {
      const resourceData: any = await this.resourceSharingRepository.findOne({
        where: { id: id, is_archived: false },
        relations: [
          'created_by',
          'from_collection_operation_id',
          'to_collection_operation_id',
        ],
      });

      if (!resourceData) {
        resError(
          `Resource share data not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      let shareTypeData: any;
      if (resourceData?.share_type == resource_share_type_enum.VEHICLES) {
        shareTypeData = await this.vehicleRepository.find({
          where: {
            is_archived: false,
            tenant: { id: this.request.user.tenant.id },
            collection_operation:
              resourceData?.from_collection_operation_id?.id,
          },
          relations: ['collection_operation_id'],
        });
      } else if (resourceData?.share_type == resource_share_type_enum.STAFF) {
        shareTypeData = await this.staffRepository.find({
          where: {
            is_archived: false,
            tenant: { id: this.request.user.tenant.id },
            collection_operation_id: {
              id: resourceData?.from_collection_operation_id?.id,
            },
          },
          relations: ['collection_operation_id'],
        });
      } else if (resourceData?.share_type == resource_share_type_enum.DEVICES) {
        const where: any = {
          is_archived: false,
          tenant: { id: this.request.user.tenant.id },
          collection_operation: {
            id: resourceData?.from_collection_operation_id?.id as any,
          },
        };
        shareTypeData = await this.deviceRepository.find({
          where,
          relations: ['collection_operation'],
        });
      }
      let rowsData = 0;
      if (resourceData?.quantity < shareTypeData?.length) {
        rowsData = resourceData?.quantity;
      } else if (resourceData?.quantity > shareTypeData?.length) {
        rowsData = shareTypeData?.length;
      } else if (resourceData?.quantity == shareTypeData?.length) {
        rowsData = resourceData?.quantity;
      }

      if (resourceData) {
        const modifiedData: any = await getModifiedDataDetails(
          this.resourceSharingHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        resourceData.modified_by = resourceData.created_by;
        resourceData.modified_at = resourceData.created_at;
        resourceData.created_at = modified_at
          ? modified_at
          : resourceData.created_at;
        resourceData.created_by = modified_by
          ? modified_by
          : resourceData.created_by;
      }
      return resSuccess(
        'Resource share data successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        { ...resourceData, shareTypeData, rows: rowsData }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAll(params: GetAllResourceSharingInterface) {
    try {
      const limit: number = params?.limit
        ? +params?.limit
        : +process.env.PAGE_SIZE;
      let page = params?.page ? +params?.page : 1;

      if (page < 1) {
        page = 1;
      }
      const queryBuilder = this.resourceSharingRepository
        .createQueryBuilder('resourceSharing')
        .leftJoinAndSelect('resourceSharing.created_by', 'created_by')
        .leftJoinAndSelect(
          'resourceSharing.from_collection_operation_id',
          'from_collection_operation'
        )
        .leftJoinAndSelect(
          'resourceSharing.to_collection_operation_id',
          'to_collection_operation'
        )
        .where('resourceSharing.is_archived = :is_archived', {
          is_archived: false,
        })
        .andWhere('resourceSharing.tenant_id = :tenant_id', {
          tenant_id: this.request.user?.tenant?.id,
        });

      if (params?.keyword) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.orWhere('description ILIKE :keyword', {
              keyword: `%${params.keyword}%`,
            });
          })
        );
      }

      if (params?.collection_operation_id) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where(
              'from_collection_operation.id = :collection_operation_id',
              { collection_operation_id: params.collection_operation_id }
            ).orWhere('to_collection_operation.id = :collection_operation_id', {
              collection_operation_id: params.collection_operation_id,
            });
          })
        );
      }

      if (params?.share_type) {
        const shareTypes = Array.isArray(params.share_type)
          ? params.share_type
          : [params.share_type];
        queryBuilder.andWhere(
          'resourceSharing.share_type IN (:...shareTypes)',
          { shareTypes }
        );
      }

      if (params?.date_range) {
        let startDate: any;
        let endDate: any;

        const dateRange = params.date_range.split(',');

        if (dateRange?.[0]?.trim()) {
          const parsedStartDate = moment(dateRange[0]);
          if (parsedStartDate.isValid()) {
            startDate = parsedStartDate.format('YYYY-MM-DD');
          }
        }

        if (dateRange[1]) {
          endDate = moment(dateRange[1]).format('YYYY-MM-DD');
        }

        if (startDate !== undefined || endDate !== undefined) {
          if (startDate && endDate) {
            console.log('startDate && endDate', startDate, endDate);
            queryBuilder.andWhere(
              'resourceSharing.start_date BETWEEN :start AND :end',
              {
                start: startDate,
                end: endDate,
              }
            );
          } else if (startDate) {
            queryBuilder.andWhere('resourceSharing.start_date >= :start', {
              start: startDate,
            });
          } else if (endDate) {
            queryBuilder.andWhere('resourceSharing.end_date <= :end', {
              end: endDate,
            });
          }
        }
      }

      if (params?.sortBy && params?.sortOrder) {
        if (params.sortBy === 'from_collection_operation') {
          queryBuilder.orderBy(
            'from_collection_operation.name',
            params.sortOrder.toUpperCase() as 'ASC' | 'DESC'
          );
        } else if (params.sortBy === 'to_collection_operation') {
          queryBuilder.orderBy(
            'to_collection_operation.name',
            params.sortOrder.toUpperCase() as 'ASC' | 'DESC'
          );
        } else {
          queryBuilder.orderBy(
            `resourceSharing.${params.sortBy}`,
            params.sortOrder.toUpperCase() as 'ASC' | 'DESC'
          );
        }
      } else {
        queryBuilder.orderBy('resourceSharing.id', 'DESC');
      }

      let response;
      let count;

      if (params.fetchAll) {
        [response, count] = await queryBuilder.getManyAndCount();
      } else {
        [response, count] = await queryBuilder
          .take(limit)
          .skip((page - 1) * limit)
          .getManyAndCount();
      }

      return {
        status: HttpStatus.OK,
        message: 'Resource sharing fetched successfully',
        count: count,
        data: response,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async archiveResourceShare(id: any, user: any) {
    try {
      const resourceShareData: any =
        await this.resourceSharingRepository.findOne({
          where: {
            id: id,
            is_archived: false,
            tenant: {
              id: user?.tenant?.id,
            },
          },
          relations: [
            'from_collection_operation_id',
            'to_collection_operation_id',
            'tenant',
          ],
        });
      if (!resourceShareData) {
        resError(
          `Resource share data not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (resourceShareData.is_archived) {
        resError(
          `Resource share is already archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      resourceShareData.is_archived = true;
      resourceShareData.created_at = new Date();
      resourceShareData.created_by = user;
      const archivedResourceShare = await this.resourceSharingRepository.save(
        resourceShareData
      );

      return resSuccess(
        'Resoucre share archived successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        null
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async addResourceShareFullfilment(
    id: any,
    fullfilmentDto: AddResourceShareFullfilmentDto
  ) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const resourceShareData: any =
        await this.resourceSharingRepository.findOne({
          where: {
            id: id,
            is_archived: false,
          },
          relations: [
            'from_collection_operation_id',
            'to_collection_operation_id',
          ],
        });
      if (!resourceShareData) {
        resError(
          `Resource share data not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      if (
        !fullfilmentDto.fullfilment_data ||
        fullfilmentDto.fullfilment_data.length === 0
      ) {
        resError(
          `Resoucre share fullfilment data is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
      const resourceFullFillData: any = [];

      for (const fulfillmentData of fullfilmentDto.fullfilment_data) {
        if (!fulfillmentData?.resource_share_id) {
          resError(
            `Resource share id is required.`,
            ErrorConstants.Error,
            HttpStatus.BAD_REQUEST
          );
        }

        if (!fulfillmentData?.share_type_id) {
          resError(
            `Share type id is required.`,
            ErrorConstants.Error,
            HttpStatus.BAD_REQUEST
          );
        }

        const existingData = await this.saveFullfilmentRepo.findOne({
          where: {
            resource_share_id: fulfillmentData?.resource_share_id,
            share_type_id: fulfillmentData?.share_type_id,
            is_archived: false,
          },
        });

        if (!existingData) {
          const savedFullfilment = new ResourceSharingsFulfillment();
          savedFullfilment.resource_share_id =
            fulfillmentData?.resource_share_id;
          savedFullfilment.share_type_id = fulfillmentData?.share_type_id;
          savedFullfilment.created_by = this.request.user.id;
          resourceFullFillData.push({
            ...(await queryRunner.manager.save(savedFullfilment)),
            tenant_id: resourceShareData?.tenant_id,
          });
        }
      }
      for (const fulfillmentData of fullfilmentDto.remove_data) {
        if (!fulfillmentData?.resource_share_id) {
          resError(
            `Resource share id is required.`,
            ErrorConstants.Error,
            HttpStatus.BAD_REQUEST
          );
        }

        if (!fulfillmentData?.share_type_id) {
          resError(
            `Share type id is required.`,
            ErrorConstants.Error,
            HttpStatus.BAD_REQUEST
          );
        }

        const existingData: any = await this.saveFullfilmentRepo.findOne({
          where: {
            resource_share_id: fulfillmentData?.resource_share_id,
            share_type_id: fulfillmentData?.share_type_id,
            is_archived: false,
          },
        });

        if (existingData) {
          existingData.is_archived = true;
          existingData.created_at = new Date();
          existingData.created_by = this.request?.user;
          const archivedResourceFulfillment =
            await this.saveFullfilmentRepo.save(existingData);
        }
      }
      await queryRunner.commitTransaction();

      return resSuccess(
        'Resource Share fullfilment added.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        resourceFullFillData
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async archiveResourceFullfilment(
    id: any,
    resourceFullfilmentDto: ResourceFullfilmentDto
  ) {
    try {
      const resourceShareData: any =
        await this.resourceSharingRepository.findOne({
          where: {
            id: resourceFullfilmentDto.resource_share_id,
            is_archived: false,
          },
        });

      const fulfillmentData: any = await this.saveFullfilmentRepo.findOne({
        where: {
          resource_share_id: resourceFullfilmentDto.resource_share_id,
          share_type_id: resourceFullfilmentDto.share_type_id,
          is_archived: false,
        },
      });
      if (!fulfillmentData) {
        resError(
          `Resource share fulfillment data not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (fulfillmentData?.is_archived) {
        resError(
          `Resource share fulfillment data is already archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      if (fulfillmentData) {
        fulfillmentData.is_archived = true;
        fulfillmentData.created_at = new Date();
        fulfillmentData.created_by = this.request?.user;
        const archivedResourceFulfillment = await this.saveFullfilmentRepo.save(
          fulfillmentData
        );

        return resSuccess(
          'Resource share fulfillment data archived successfully',
          SuccessConstants.SUCCESS,
          HttpStatus.OK,
          {}
        );
      }
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getResourceShareFullfilment(id: any) {
    try {
      const resourceData: any = await this.resourceSharingRepository.findOne({
        where: { id: id, is_archived: false },
        relations: [
          'created_by',
          'from_collection_operation_id',
          'to_collection_operation_id',
        ],
      });

      if (!resourceData) {
        resError(
          `Resource share data not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const resourceShareFul: any[] = await this.saveFullfilmentRepo.find({
        where: { resource_share_id: id, is_archived: false },
        relations: ['created_by', 'resource_share'],
      });

      if (!resourceShareFul || resourceShareFul.length === 0) {
        resError(
          `Resource share fulfillment data not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const shareTypeData: any[] = [];

      for (const fulfillment of resourceShareFul) {
        if (resourceData?.share_type == resource_share_type_enum.VEHICLES) {
          shareTypeData.push(
            await this.vehicleRepository.find({
              where: {
                id: fulfillment?.share_type_id,
                is_archived: false,
                tenant: { id: this.request.user.tenant.id },
                collection_operation:
                  resourceData?.from_collection_operation_id?.id,
              },
              relations: ['collection_operation_id'],
            })
          );
        } else if (resourceData?.share_type == resource_share_type_enum.STAFF) {
          shareTypeData.push(
            await this.staffRepository.find({
              where: {
                id: fulfillment?.share_type_id,
                is_archived: false,
                tenant: { id: this.request.user.tenant.id },
                collection_operation_id: {
                  id: resourceData?.from_collection_operation_id?.id,
                },
              },
              relations: ['collection_operation_id'],
            })
          );
        } else if (
          resourceData?.share_type == resource_share_type_enum.DEVICES
        ) {
          const where: any = {
            id: fulfillment?.share_type_id,
            is_archived: false,
            tenant: { id: this.request.user.tenant.id },
            collection_operation: {
              id: resourceData?.from_collection_operation_id?.id as any,
            },
          };
          shareTypeData.push(
            await this.deviceRepository.find({
              where,
              relations: ['collection_operation'],
            })
          );
        }
      }
      const flatShareTypeData = shareTypeData.flat();

      return {
        status: HttpStatus.OK,
        message: 'Resource share fulfillment data fetched successfully',
        data: flatShareTypeData,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
