import { HttpStatus, Injectable, Inject, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  EntityManager,
  Not,
  ILike,
  In,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from 'typeorm';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
} from '../dto/create-promotion.dto';
import { ErrorConstants } from '../../../../../constants/error.constants';
import { resError, resSuccess } from '../../../../../helpers/response';
import { User } from '../../../../user-administration/user/entity/user.entity';
import { PromotionEntity } from '../entity/promotions.entity';
import { PromotionHistory } from '../entity/promotions-history.entity';

import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { BusinessUnits } from 'src/api/system-configuration/tenants-administration/organizational-administration/hierarchy/business-units/entities/business-units.entity';
import {
  GetAllPromotionsInterface,
  GetPromotionsForDriveInterface,
} from '../interface/promotions.interface';
import { HistoryService } from 'src/api/common/services/history.service';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { PromotionsCollectionOperation } from '../entity/promotions-collection-operations.entity';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import moment from 'moment';

@Injectable({ scope: Scope.REQUEST })
export class PromotionsService extends HistoryService<PromotionHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(PromotionEntity)
    private readonly promotionRepository: Repository<PromotionEntity>,
    @InjectRepository(PromotionHistory)
    private readonly promotionsHistory: Repository<PromotionHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PromotionsCollectionOperation)
    private readonly promotionsCollectionOperation: Repository<PromotionsCollectionOperation>,
    @InjectRepository(BusinessUnits)
    private readonly businessRepository: Repository<BusinessUnits>,
    private readonly entityManager: EntityManager
  ) {
    super(promotionsHistory);
  }
  /**
   * check entity exist in database
   * @param repository
   * @param query
   * @param entityName
   * @returns {object}
   */
  async entityExist<T>(
    repository: Repository<T>,
    query,
    entityName
  ): Promise<T> {
    const entityObj = await repository.findOne(query);
    if (!entityObj) {
      resError(
        `${entityName} not found.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }

    return entityObj;
  }

  async create(createPromotionDto: CreatePromotionDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    const user = await this.entityExist(
      this.userRepository,
      { where: { id: createPromotionDto?.created_by } },
      'User'
    );
    try {
      const promotionEntity = new PromotionEntity();
      promotionEntity.name = createPromotionDto.name;
      promotionEntity.description = createPromotionDto.description;
      promotionEntity.donor_message = createPromotionDto.donor_message;
      promotionEntity.status = createPromotionDto.status;
      promotionEntity.short_name = createPromotionDto.short_name;
      promotionEntity.created_by = user;
      promotionEntity.start_date = createPromotionDto.start_date;
      promotionEntity.end_date = createPromotionDto.end_date;
      promotionEntity.tenant_id = this.request.user?.tenant?.id;

      const savedpromotion = await queryRunner.manager.save(promotionEntity);
      for (const collectionOperations of createPromotionDto.collection_operations) {
        const promotionsCollectionOperation =
          new PromotionsCollectionOperation();
        promotionsCollectionOperation.promotion_id = savedpromotion.id;
        promotionsCollectionOperation.collection_operation_id =
          collectionOperations;
        promotionsCollectionOperation.created_by = user;
        promotionsCollectionOperation.tenant_id = this.request.user?.tenant?.id;
        await this.promotionsCollectionOperation.save(
          promotionsCollectionOperation
        );
      }
      delete savedpromotion.tenant;
      return {
        status: 'success',
        response: 'Promotion Created.',
        code: 201,
        data: {
          ...savedpromotion,
        },
      };
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAll(
    getAllPromotionsInterface: GetAllPromotionsInterface
  ): Promise<any> {
    try {
      const sortName = getAllPromotionsInterface?.sort_name;
      const sortOrder = getAllPromotionsInterface?.sort_order;
      const { month, year, fetchAll }: any = getAllPromotionsInterface;

      if ((sortName && !sortOrder) || (sortOrder && !sortName)) {
        return resError(
          `When selecting sort SortOrder & SortName is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const limit: number = getAllPromotionsInterface?.limit
        ? +getAllPromotionsInterface?.limit
        : +process.env.PAGE_SIZE;

      let page = getAllPromotionsInterface?.page
        ? +getAllPromotionsInterface?.page
        : 1;

      if (page < 1) {
        page = 1;
      }

      const where = {};
      if (getAllPromotionsInterface?.keyword) {
        Object.assign(where, {
          name: ILike(`%${getAllPromotionsInterface.keyword}%`),
        });
      }

      if (getAllPromotionsInterface?.status) {
        Object.assign(where, {
          status: getAllPromotionsInterface?.status,
        });
      }

      Object.assign(where, {
        is_archived: false,
      });

      Object.assign(where, {
        tenant: { id: this.request.user?.tenant?.id },
      });
      let start_date: any;
      let end_date: any;
      if (month && year) {
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);

        start_date = firstDay.toISOString().split('T')[0];
        end_date = lastDay.toISOString().split('T')[0];
      }

      if (getAllPromotionsInterface?.collection_operation) {
        const collection_items: any =
          getAllPromotionsInterface.collection_operation;
        const collectionOperations = collection_items.split(',');
        console.log('collectionOperations', collectionOperations);

        let teamIds = [];
        const qb = this.promotionsCollectionOperation
          .createQueryBuilder('collectionOperation')
          .select('collectionOperation.promotion_id', 'promotion_id')
          .where(
            'collectionOperation.collection_operation_id IN (:...collectionOperations)',
            { collectionOperations }
          );

        const result = await qb.getRawMany();
        teamIds = result.map((row) => row.promotion_id);
        Object.assign(where, {
          id: In(teamIds),
        });
      }
      const promotion = this.promotionRepository
        .createQueryBuilder('promotion_entity')
        .orderBy(`promotion_entity.${sortName}`, sortOrder as 'ASC' | 'DESC')
        .orderBy('promotion_entity.created_at', 'DESC')
        .take(limit)
        .skip((page - 1) * limit)
        .where(where);

      if (fetchAll !== 'true') {
        promotion.take(limit).skip((page - 1) * limit);
      }

      if (start_date && end_date) {
        promotion.andWhere(
          '(promotion_entity.start_date BETWEEN :start_date AND :end_date OR promotion_entity.end_date BETWEEN :start_date AND :end_date)',
          { start_date, end_date }
        );
      }
      if (sortName) {
        promotion.orderBy(
          `promotion_entity.${sortName}`,
          sortOrder as 'ASC' | 'DESC'
        );
      } else {
        promotion.orderBy(`promotion_entity.created_at`, 'DESC');
      }

      const countQuery = promotion;

      const data = await promotion.getMany();
      const count = await countQuery.getCount();
      const updatedPromotions = [];

      for (const item of data) {
        const collectionOperations = await this.promotionsCollectionOperation
          .createQueryBuilder('collectionOperation')
          .where('collectionOperation.promotion_id IN (:...ids)', {
            ids: [item.id],
          })
          .leftJoinAndSelect('collectionOperation.promotion_id', 'promotion_id')
          .leftJoinAndSelect(
            'collectionOperation.collection_operation_id',
            'collection_operation_id'
          )
          .orderBy(
            `ASCII(LOWER(SUBSTRING(collection_operation_id.name FROM 1 FOR 1)))`,
            getAllPromotionsInterface?.collection_operation_sort?.toUpperCase() ===
              'DESC'
              ? 'DESC'
              : 'ASC'
          )
          .getMany();

        updatedPromotions.push({
          ...item,
          collectionOperations,
        });
      }
      return {
        status: HttpStatus.OK,
        message: 'Promotions Fetched Succesfuly',
        count: count,
        data: updatedPromotions,
      };
    } catch (e) {
      console.log({ e });
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findAllForDrives(
    getPromotionsInterface: GetPromotionsForDriveInterface
  ): Promise<any> {
    try {
      const { collection_operation_id, date, status } = getPromotionsInterface;

      const checkDate = moment(new Date(date)).utc();
      checkDate.set('hour', 0);
      checkDate.set('minute', 0);
      checkDate.set('second', 0);

      if (
        collection_operation_id &&
        collection_operation_id !== undefined &&
        date &&
        status
      ) {
        let promotionsQuery = this.promotionRepository
          .createQueryBuilder('promotions')
          .leftJoinAndSelect(
            'promotions.promotions_collection_operations',
            'promotions_collection_operations'
          )
          .where(
            ':checkDate >= promotions.start_date AND :checkDate <= promotions.end_date',
            {
              checkDate: checkDate.toDate(),
            }
          )
          .andWhere(
            'promotions_collection_operations.collection_operation_id = :collection_operation_id',
            {
              collection_operation_id,
            }
          )
          .andWhere('promotions.tenant_id = :tenant_id', {
            tenant_id: this.request?.user?.tenant?.id,
          })
          .andWhere('promotions.is_archived = :is_archived', {
            is_archived: false,
          });

        if (status) {
          promotionsQuery = promotionsQuery.andWhere({
            status: true,
          });
        }
        const [data, count] = await promotionsQuery.getManyAndCount();

        const result = data?.map((item: any) => {
          return {
            ...item,
            promotions_collection_operations:
              item?.promotions_collection_operations?.map((pItem) => {
                return {
                  ...pItem,
                  tenant_id: this.request.user?.tenant?.id,
                };
              }),
          };
        });
        return {
          status: HttpStatus.OK,
          message: 'Promotions fetched.',
          count,
          data: result,
        };
      } else {
        return resError(
          `Collection operation id required`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
    } catch (e) {
      console.log(e);
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async update(id: any, updatePromotionDto: UpdatePromotionDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const promotion: any = await this.promotionRepository.findOneBy({
        id: id,
      });
      if (!promotion) {
        return resError(
          `Promotion not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const user = await this.userRepository.findOneBy({
        id: updatePromotionDto.created_by,
      });

      if (!user) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      promotion.userId = user.id;

      promotion.name = updatePromotionDto?.name ?? promotion.name;
      promotion.description =
        updatePromotionDto?.description ?? promotion.description;
      promotion.donor_message =
        updatePromotionDto?.donor_message ?? promotion.donor_message;
      promotion.status = updatePromotionDto?.status ?? promotion.status;
      promotion.short_name =
        updatePromotionDto?.short_name ?? promotion.short_name;
      promotion.start_date =
        updatePromotionDto?.start_date ?? promotion.start_date;
      promotion.end_date = updatePromotionDto?.end_date ?? promotion.end_date;
      promotion.created_at = new Date();
      promotion.created_by = user;
      await queryRunner.manager.save(promotion);
      await this.promotionsCollectionOperation
        .createQueryBuilder('promotions_collection_operations')
        .delete()
        .from(PromotionsCollectionOperation)
        .where('promotion_id = :promotion_id', {
          promotion_id: promotion.id,
        })
        .execute();
      const promises = [];
      for (const collectionOperations of updatePromotionDto.collection_operations) {
        const promotionCollectionOperation: any =
          new PromotionsCollectionOperation();
        promotionCollectionOperation.promotion_id = promotion.id;
        promotionCollectionOperation.collection_operation_id =
          collectionOperations;
        promotionCollectionOperation.tenant_id = this.request.user?.tenant?.id;
        promotionCollectionOperation.created_at = new Date();
        promotionCollectionOperation.created_by = user;
        promises.push(queryRunner.manager.save(promotionCollectionOperation));
      }
      await Promise.all(promises);
      await queryRunner.commitTransaction();

      return {
        status: 'success',
        response: 'Resource updated',
        status_code: HttpStatus.NO_CONTENT,
      };
    } catch (error) {
      console.log(error, 'errrrrr');
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findOne(id: any): Promise<any> {
    try {
      const promotion: any = await this.promotionRepository.findOne({
        where: { id: id },
        relations: ['created_by', 'tenant'],
      });

      if (!promotion) {
        return resError(
          `Promotion not found.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      if (promotion) {
        const modifiedData: any = await getModifiedDataDetails(
          this.promotionsHistory,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        promotion.modified_by = promotion.created_by;
        promotion.modified_at = promotion.created_at;
        promotion.created_at = modified_at ? modified_at : promotion.created_at;
        promotion.created_by = modified_by ? modified_by : promotion.created_by;
      }
      const collectionOperations =
        await this.promotionsCollectionOperation.find({
          where: {
            promotion_id: In([id]),
          },
          relations: ['collection_operation_id'],
        });
      return resSuccess(SuccessConstants.SUCCESS, '', HttpStatus.OK, {
        ...promotion,
        collectionOperations,
      });
    } catch (e) {
      console.log(e);

      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async archive(id: any, created_by: bigint) {
    try {
      const promotion = await this.promotionRepository.findOneBy({
        id: id,
      });

      if (!promotion) {
        return resError(
          `Promotion not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const collectionOperations: any =
        await this.promotionsCollectionOperation.find({
          where: {
            promotion_id: In([promotion.id]),
          },
          relations: ['collection_operation_id'],
        });
      const isArchive = !promotion.is_archived;

      const updatedRequest: any = {
        ...promotion,
        collectionOperations: collectionOperations,
        is_archived: isArchive,
        created_by: this.request?.user,
        created_at: new Date(),
      };

      await this.promotionRepository.save(updatedRequest);

      return {
        status: 'success',
        response: 'Promotion Archived',
        status_code: HttpStatus.NO_CONTENT,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
