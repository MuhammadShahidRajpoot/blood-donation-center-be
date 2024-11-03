import {
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  ILike,
  In,
  LessThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { User } from '../../../../user-administration/user/entity/user.entity';
import { PromotionalItems } from '../entities/promotional-item.entity';
import { SuccessConstants } from '../../../../../constants/success.constants';
import { ErrorConstants } from '../../../../../constants/error.constants';
import { UpdatePromotionalItemDto } from '../dto/update-promotional-item.dto';
import { PromotionalItemsHistory } from '../entities/promotional-item-history.entity';
import { PromotionalItemCollectionOperationHistory } from '../entities/promotional-item-collection-operations-history.entity';
import { PromotionalItemCollectionOperation } from '../entities/promotional-item-collection-operations.entity';
import {
  GetAllPromotionalItemCOInterface,
  GetAllPromotionalItemInterface,
} from '../interface/promotional-item.interface';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { CreatePromotionalItemDto } from '../dto/create-promotional-item.dto';
import { HistoryService } from 'src/api/common/services/history.service';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import moment from 'moment';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';

@Injectable()
export class PromotionalItemService extends HistoryService<PromotionalItemsHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(PromotionalItems)
    private readonly promotionalItemRepository: Repository<PromotionalItems>,
    @InjectRepository(PromotionalItemCollectionOperation)
    private readonly promotionalItemCollectionOperation: Repository<PromotionalItemCollectionOperation>,
    @InjectRepository(PromotionalItemCollectionOperationHistory)
    private readonly promotionalItemCollectionOperationHistoryRepository: Repository<PromotionalItemCollectionOperationHistory>,
    @InjectRepository(BusinessUnits)
    private readonly businessUnitsRepository: Repository<BusinessUnits>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(PromotionalItemsHistory)
    private readonly promotionalItemsHistory: Repository<PromotionalItemsHistory>
  ) {
    super(promotionalItemsHistory);
  }

  async create(createPromotionalItemDto: CreatePromotionalItemDto) {
    try {
      const {
        name,
        short_name,
        promotion_id,
        description,
        collection_operations,
        status,
        retire_on,
        created_by,
        tenant_id,
      } = createPromotionalItemDto;
      const user = await this.userRepository.findOneBy({
        id: created_by,
      });

      if (!user) {
        resError(`User not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }

      const tenant = await this.tenantRepository.findOneBy({
        id: tenant_id,
      });
      if (!tenant) {
        resError(
          `Tenant not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const businessUnits: any = await this.businessUnitsRepository.findOneBy({
        id: In(collection_operations),
      });

      if (
        businessUnits &&
        businessUnits.length < collection_operations.length
      ) {
        resError(
          `Some Collection Operations not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const promotionalItems = new PromotionalItems();

      promotionalItems.created_by = user;
      promotionalItems.tenant_id = tenant?.id;
      promotionalItems.name = name;
      promotionalItems.short_name = short_name;
      promotionalItems.promotion_id = promotion_id;
      promotionalItems.description = description;
      promotionalItems.status = status;
      promotionalItems.is_archived = false;
      promotionalItems.retire_on = retire_on;

      const savedPromotionalItem = await this.promotionalItemRepository.save(
        promotionalItems
      );
      for (const collectionOperations of collection_operations) {
        const promotionalItemCollectionOperation =
          new PromotionalItemCollectionOperation();
        promotionalItemCollectionOperation.promotional_item_id =
          savedPromotionalItem.id;
        promotionalItemCollectionOperation.collection_operation_id =
          collectionOperations;
        promotionalItemCollectionOperation.created_by = user;
        await this.promotionalItemCollectionOperation.save(
          promotionalItemCollectionOperation
        );
      }

      delete savedPromotionalItem.created_by;

      return resSuccess(
        'Promotional Item Created Successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedPromotionalItem
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAll(params: GetAllPromotionalItemInterface) {
    try {
      const limit: number =
        params?.limit && params?.limit !== undefined
          ? +params?.limit
          : +process.env.PAGE_SIZE ?? 10;

      const page = params?.page ? +params?.page : 1;

      const where = {};
      if (params?.keyword) {
        Object.assign(where, {
          name: ILike(`%${params?.keyword}%`),
        });
      }
      const promotional_items: any = await this.promotionalItemRepository.find({
        where: {
          retire_on: LessThan(new Date()),
          status: true,
        },
      });
      for (const promotional_item of promotional_items) {
        const updatedRequest = {
          ...promotional_item,
          status: false,
        };
        await this.promotionalItemRepository.save(updatedRequest);
      }
      if (params?.collection_operation) {
        const collection_items: any = params.collection_operation;
        const collectionOperationIds = collection_items
          ? Array.isArray(collection_items)
            ? collection_items
            : [collection_items]
          : [];
        let teamIds = [];
        const qb = this.promotionalItemCollectionOperation
          .createQueryBuilder('collectionOperation')
          .select(
            'collectionOperation.promotional_item_id',
            'promotional_item_id'
          )
          .where(
            'collectionOperation.collection_operation_id IN (:...collectionOperationIds)',
            { collectionOperationIds }
          );

        const result = await qb.getRawMany();
        teamIds = result.map((row) => row.promotional_item_id);
        Object.assign(where, {
          id: In(teamIds),
        });
      }
      if (params?.status) {
        Object.assign(where, {
          status: params?.status,
        });
      }
      Object.assign(where, {
        tenant: { id: params.tenantId },
      });
      let promotionalItems: any = [];

      const orderBy: { [key: string]: 'ASC' | 'DESC' } = {};
      const sortBy = params.sortBy;
      const sortOrder = params.sortOrder;
      if (sortBy) {
        if (sortBy === 'promotion') {
          orderBy['promotion_entity.name'] =
            sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        } else {
          // Use the provided sortBy column from params
          orderBy[`promotional_items.${sortBy}`] =
            sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        }
      } else {
        // Default orderBy in case sortBy is not provided
        orderBy['promotional_items.id'] = 'DESC';
      }
      if (params?.fetchAll) {
        promotionalItems = this.promotionalItemRepository
          .createQueryBuilder('promotional_items')
          .orderBy(orderBy)
          .where({ ...where, is_archived: false });
      } else {
        promotionalItems = this.promotionalItemRepository
          .createQueryBuilder('promotional_items')
          .innerJoinAndSelect(
            'promotional_items.promotion_id',
            'promotion_entity'
          )
          .take(limit)
          .skip((page - 1) * limit)
          .orderBy(orderBy)
          .where({ ...where, is_archived: false });
      }

      const [data, total] = await promotionalItems.getManyAndCount();
      const updatedPromotionalItems = [];

      for (const item of data) {
        const collectionOperations =
          await this.promotionalItemCollectionOperation
            .createQueryBuilder('promotionalItemCollectionOperation')
            .where(
              'promotionalItemCollectionOperation.promotional_item_id IN (:...ids)',
              {
                ids: [item.id],
              }
            )
            .leftJoinAndSelect(
              'promotionalItemCollectionOperation.collection_operation',
              'collection_operation'
            )
            .leftJoinAndSelect(
              'promotionalItemCollectionOperation.promotional_item',
              'promotional_item'
            )
            .orderBy(
              `ASCII(LOWER(SUBSTRING(collection_operation.name FROM 1 FOR 1)))`,
              params?.collection_operation_sort?.toUpperCase() === 'DESC'
                ? 'DESC'
                : 'ASC'
            )
            .getMany();
        updatedPromotionalItems.push({
          ...item,
          collectionOperations,
        });
      }

      return {
        status: SuccessConstants.SUCCESS,
        response: '',
        code: HttpStatus.OK,
        total_promotional_item_count: total,
        data: updatedPromotionalItems,
      };
    } catch (error) {
      console.log({ error });

      return {
        status: error.status,
        message: error.message,
        status_code: ErrorConstants.Error,
        data: null,
      };
    }
  }

  async findOne(id: any) {
    try {
      const promotionalItemIn: any =
        await this.promotionalItemRepository.findOne({
          where: { id: id, is_archived: false },
          relations: ['promotion_id', 'created_by'],
        });
      if (!promotionalItemIn) {
        resError(
          `Promotional Item not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const collectionOperations =
        await this.promotionalItemCollectionOperation.find({
          where: {
            promotional_item_id: id,
            is_archived: false,
          },
          relations: {
            collection_operation: true,
            promotional_item: true,
          },
        });

      if (promotionalItemIn) {
        const modifiedData: any = await getModifiedDataDetails(
          this.promotionalItemsHistory,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        promotionalItemIn.modified_by = promotionalItemIn.created_by;
        promotionalItemIn.modified_at = promotionalItemIn.created_at;
        promotionalItemIn.created_at = modified_at
          ? modified_at
          : promotionalItemIn.created_at;
        promotionalItemIn.created_by = modified_by
          ? modified_by
          : promotionalItemIn.created_by;
      }
      return resSuccess(SuccessConstants.SUCCESS, '', HttpStatus.OK, {
        ...promotionalItemIn,
        collectionOperations,
      });
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(id: any, updatePromotionalItemDto: UpdatePromotionalItemDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const PromotionalItem: any = await this.promotionalItemRepository.findOne(
        {
          where: { id },
          relations: ['created_by', 'tenant', 'promotion_id'],
        }
      );
      if (!PromotionalItem) {
        resError(
          `Promotional Item not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (PromotionalItem.is_archived) {
        resError(
          `Promotional Item is archived and cannot be updated.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const oldCollectionOperations: any =
        await this.promotionalItemCollectionOperationHistoryRepository.find({
          where: {
            promotional_item_id: In([PromotionalItem.id]),
          },
          relations: ['collection_operation_id'],
        });

      const user = await this.userRepository.findOneBy({
        id: updatePromotionalItemDto.created_by,
      });

      if (!user) {
        resError(`User not found`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }

      const PromotionalItemUpdateObject: any = {
        name: updatePromotionalItemDto?.name ?? PromotionalItem?.name,
        short_name:
          updatePromotionalItemDto?.short_name ?? PromotionalItem?.short_name,
        promotion_id:
          updatePromotionalItemDto?.promotion_id ??
          PromotionalItem?.promotion_id,
        description:
          updatePromotionalItemDto?.description ?? PromotionalItem?.description,
        status: updatePromotionalItemDto?.status ?? PromotionalItem?.status,
        retire_on: updatePromotionalItemDto?.retire_on,
        created_at: new Date(),
        created_by: this.request?.user,
      };

      let updatedPromotionalItem: any = await queryRunner.manager.update(
        PromotionalItems,
        { id: PromotionalItem.id },
        { ...PromotionalItemUpdateObject }
      );

      if (!updatedPromotionalItem.affected) {
        resError(
          `Promtional Item update failed.`,
          ErrorConstants.Error,
          HttpStatus.NOT_MODIFIED
        );
      }

      await this.promotionalItemCollectionOperationHistoryRepository
        .createQueryBuilder('collection_operation_promotional_item_history')
        .delete()
        .from(PromotionalItemCollectionOperation)
        .where('promotional_item_id = :promotional_item_id', {
          promotional_item_id: PromotionalItem.id,
        })
        .execute();

      const promises = [];
      for (const collectionOperations of updatePromotionalItemDto.collection_operation) {
        const promotionalItemCollectionOperation =
          new PromotionalItemCollectionOperation();
        promotionalItemCollectionOperation.promotional_item_id =
          PromotionalItem.id;
        promotionalItemCollectionOperation.collection_operation_id =
          collectionOperations;
        promotionalItemCollectionOperation.tenant_id =
          PromotionalItem.tenant.id;
        promotionalItemCollectionOperation.created_by = user;
        promises.push(
          queryRunner.manager.save(promotionalItemCollectionOperation)
        );
      }
      await Promise.all(promises);
      await queryRunner.commitTransaction();

      updatedPromotionalItem = await this.promotionalItemRepository.findOne({
        where: {
          id: PromotionalItem.id,
        },
      });
      return resSuccess(
        SuccessConstants.SUCCESS,
        '',
        HttpStatus.NO_CONTENT,
        updatedPromotionalItem
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async archive(user: any, id: any) {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const promotionalItem: any = await this.promotionalItemRepository.findOne(
        {
          where: {
            id,
            is_archived: false,
            tenant: {
              id: user?.tenant?.id,
            },
          },
          relations: ['created_by', 'promotion_id', 'tenant'],
        }
      );

      if (!promotionalItem) {
        throw new NotFoundException('promotionalItem not found');
      }

      const collectionOperations: any =
        await this.promotionalItemCollectionOperationHistoryRepository.find({
          where: {
            promotional_item_id: In([promotionalItem.id]),
          },
          relations: ['collection_operation_id'],
        });

      promotionalItem.is_archived = true;
      promotionalItem.collectionOperations = collectionOperations;
      // Archive the promotionalItem entity
      const archivedPromotionalItem = await queryRunner.manager.save(
        promotionalItem
      );

      promotionalItem.is_archived = true;
      promotionalItem.created_by = user.id;
      promotionalItem.created_at = new Date();
      await this.promotionalItemRepository.save(promotionalItem);

      await queryRunner.commitTransaction();

      return resSuccess(
        'promotionalItem Archived.',
        SuccessConstants.SUCCESS,
        HttpStatus.GONE,
        null
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      // return error
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async findAllByCollectionOperation(
    getAllMarketingMaterialCOInterface: GetAllPromotionalItemCOInterface
  ) {
    try {
      const response = await this.promotionalItemRepository
        .createQueryBuilder('promotional_item')
        .leftJoinAndSelect(
          'promotional_item.promotionalItem_collection_operations',
          'promotionalItem_collection_operations'
        )
        .where(
          `promotional_item.is_archived = :is_archived AND promotional_item.status = :status AND promotional_item.tenant.id = :tenant_id
           AND promotionalItem_collection_operations.collection_operation_id =:collection_operation_id AND (promotional_item.retire_on >= TO_TIMESTAMP(:date) OR promotional_item.retire_on IS NULL)
          `,
          {
            is_archived: false,
            status: true,
            tenant_id: getAllMarketingMaterialCOInterface.tenantId,
            date: moment(getAllMarketingMaterialCOInterface.driveDate).unix(),
            collection_operation_id:
              getAllMarketingMaterialCOInterface?.collectionOperationId,
          }
        )
        .getMany();
      return {
        status: SuccessConstants.SUCCESS,
        message: 'Promotional Items Fetched successfully',
        status_code: HttpStatus.OK,
        data: response,
      };
    } catch (error) {
      return {
        status: error.status,
        message: error.message,
        status_code: ErrorConstants.Error,
        data: null,
      };
    }
  }
}
