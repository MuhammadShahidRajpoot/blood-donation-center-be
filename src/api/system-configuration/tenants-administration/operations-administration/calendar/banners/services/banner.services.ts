import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, ILike, In, Between } from 'typeorm';
import { Banner } from '../entities/banner.entity';
import { BannerHistory } from '../entities/banner-history.entity';
import {
  HttpStatus,
  Injectable,
  Inject,
  Scope,
  NotFoundException,
} from '@nestjs/common';
import * as dotenv from 'dotenv';
import { SuccessConstants } from '../../../../../constants/success.constants';
import { resError, resSuccess } from '../../../../../helpers/response';
import { ErrorConstants } from '../../../../../constants/error.constants';
import { User } from '../../../../user-administration/user/entity/user.entity';
import { BannerCollectionOperation } from '../entities/banner-collection-operations.entity';
import { BannerDto } from '../dto/banner.dto';
import { BannerInterface } from '../interface/banner.interface';
import { HistoryService } from 'src/api/common/services/history.service';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { UserRequest } from '../../../../../../../common/interface/request';
import { REQUEST } from '@nestjs/core';

dotenv.config();

@Injectable({ scope: Scope.REQUEST })
export class BannerService extends HistoryService<BannerHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(Banner)
    private readonly bannerRepository: Repository<Banner>,
    @InjectRepository(BannerCollectionOperation)
    private readonly bannerCollectionOperationRepository: Repository<BannerCollectionOperation>,
    @InjectRepository(BannerHistory)
    private readonly bannersHistory: Repository<BannerHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager
  ) {
    super(bannersHistory);
  }

  async create(user: User, createBannerDto: BannerDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const banner = new Banner();
      banner.title = createBannerDto?.title;
      banner.description = createBannerDto?.description;
      banner.start_date = createBannerDto?.start_date;
      banner.end_date = createBannerDto?.end_date;
      banner.created_by = user;
      banner.tenant_id = this.request?.user?.tenant?.id;
      const savedBanner: Banner = await queryRunner.manager.save(banner);

      const promises = [];
      for (const collectionOperations of createBannerDto.collection_operations) {
        const bannerCollectionOperation = new BannerCollectionOperation();
        bannerCollectionOperation.banner_id = savedBanner.id;
        bannerCollectionOperation.collection_operation_id =
          collectionOperations;
        bannerCollectionOperation.created_by = user;
        promises.push(queryRunner.manager.save(bannerCollectionOperation));
      }
      await Promise.all(promises);

      delete savedBanner?.created_by;
      await queryRunner.commitTransaction();
      return resSuccess(
        'Banner Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedBanner
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(params: BannerInterface) {
    try {
      const limit: number = params?.limit
        ? +params?.limit
        : +process.env.PAGE_SIZE;

      let page = params?.page ? +params?.page : 1;

      if (page < 1) {
        page = 1;
      }

      const { month, year }: any = params;

      let start_date: any;
      let end_date: any;
      const where = { tenant_id: this.request?.user?.tenant?.id };
      if (month && year) {
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);

        start_date = firstDay.toISOString().split('T')[0];
        end_date = lastDay.toISOString().split('T')[0];
      }

      if (params?.title) {
        Object.assign(where, {
          title: ILike(`%${params?.title}%`),
        });
      }

      if (params?.collection_operation) {
        const collectionOperations = params.collection_operation.split(',');
        let banner = [];
        const qb = this.bannerCollectionOperationRepository
          .createQueryBuilder('collectionOperation')
          .select('collectionOperation.banner_id', 'banner_id')
          .where(
            'collectionOperation.collection_operation_id IN (:...collectionOperations)',
            { collectionOperations }
          );

        const result = await qb.getRawMany();
        banner = result.map((row) => row.banner_id);

        Object.assign(where, {
          id: In(banner),
        });
      }
      const orderBy: { [key: string]: 'ASC' | 'DESC' } = {};
      const sortBy = params.sortBy;
      const sortOrder = params.sortOrder;
      if (sortBy) {
        orderBy[`banners.${sortBy}`] =
          sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      } else {
        // Default orderBy in case sortBy is not provided
        orderBy['banners.id'] = 'DESC';
      }
      let banners: any = [];
      if (params?.fetchAll) {
        banners = this.bannerRepository
          .createQueryBuilder('banners')
          .orderBy(orderBy)
          .where({ ...where, is_archived: false });
      } else {
        banners = this.bannerRepository
          .createQueryBuilder('banners')
          .take(limit)
          .skip((page - 1) * limit)
          .orderBy(orderBy)
          .where({ ...where, is_archived: false });
      }

      if (start_date && end_date) {
        banners.andWhere(
          '(banners.start_date BETWEEN :start_date AND :end_date OR banners.end_date BETWEEN :start_date AND :end_date)',
          { start_date, end_date }
        );
      }
      const [data, count] = await banners.getManyAndCount();
      const updatedBanners = [];

      for (const item of data) {
        const collectionOperations =
          await this.bannerCollectionOperationRepository
            .createQueryBuilder('collectionOperation')
            .where('collectionOperation.banner_id IN (:...ids)', {
              ids: [item.id],
            })
            .leftJoinAndSelect('collectionOperation.banner_id', 'banner_id')
            .leftJoinAndSelect(
              'collectionOperation.collection_operation_id',
              'collection_operation_id'
            )
            .orderBy(
              `ASCII(LOWER(SUBSTRING(collection_operation_id.name FROM 1 FOR 1)))`,
              params?.collection_operation_sort?.toUpperCase() === 'DESC'
                ? 'DESC'
                : 'ASC'
            )
            .getMany();
        updatedBanners.push({
          ...item,
          collectionOperations,
        });
      }
      return {
        status: HttpStatus.OK,
        message: 'Banners Fetched.',
        count: count,
        data: updatedBanners,
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
      const banner: any = await this.bannerRepository.findOne({
        where: {
          id: id,
          is_archived: false,
        },
        relations: ['created_by', 'tenant'],
      });
      if (!banner) {
        resError(
          `Banner not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const collectionOperations =
        await this.bannerCollectionOperationRepository.find({
          where: {
            banner_id: In([banner.id]),
          },
          relations: ['collection_operation_id'],
        });

      if (banner) {
        const modifiedData: any = await getModifiedDataDetails(
          this.bannersHistory,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        banner.modified_by = banner.created_by;
        banner.modified_at = banner.created_at;
        banner.created_at = modified_at ? modified_at : banner.created_at;
        banner.created_by = modified_by ? modified_by : banner.created_by;
      }

      delete banner?.tenant;
      return resSuccess(
        'Banner fetched.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        { banner, collectionOperations, tenant_id: banner.tenant_id }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(user: User, id: any, updateBannerDto: BannerDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const bannerData: any = await this.bannerRepository.findOne({
        where: {
          id,
          is_archived: false,
        },
        relations: ['created_by', 'tenant'],
      });
      if (!bannerData) {
        resError(
          `Banner not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const bannerUpdateObject = {
        title: updateBannerDto?.title ?? bannerData?.title,
        description: updateBannerDto?.description ?? bannerData?.description,
        start_date: updateBannerDto?.start_date ?? bannerData?.start_date,
        end_date: updateBannerDto?.end_date ?? bannerData?.end_date,
        created_at: new Date(),
        created_by: this.request?.user,
      };

      let updatedBanner: any = await queryRunner.manager.update(
        Banner,
        { id: bannerData.id },
        { ...bannerUpdateObject }
      );
      if (!updatedBanner.affected) {
        resError(
          `Banner update failed`,
          ErrorConstants.Error,
          HttpStatus.NOT_MODIFIED
        );
      }

      await this.bannerCollectionOperationRepository
        .createQueryBuilder('banner_collection_operations')
        .delete()
        .from(BannerCollectionOperation)
        .where('banner_id = :banner_id', { banner_id: bannerData.id })
        .execute();

      const promises = [];
      for (const collectionOperations of updateBannerDto.collection_operations) {
        const bannerCollectionOperation: any = new BannerCollectionOperation();
        bannerCollectionOperation.banner_id = bannerData.id;
        bannerCollectionOperation.collection_operation_id =
          collectionOperations;
        bannerCollectionOperation.tenant_id = Number(user.tenant.id);
        bannerCollectionOperation.created_by = user;
        bannerCollectionOperation.created_at = new Date();
        promises.push(queryRunner.manager.save(bannerCollectionOperation));
      }
      await Promise.all(promises);
      await queryRunner.commitTransaction();

      updatedBanner = await this.bannerRepository.findOne({
        where: {
          id: bannerData.id,
        },
      });

      const collectionOperations =
        await this.bannerCollectionOperationRepository.find({
          where: {
            banner_id: In([updatedBanner.id]),
          },
          relations: ['collection_operation_id'],
        });

      return resSuccess(
        'Banner Updated.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        {
          banner: updatedBanner,
          collectionOperations,
          tenant_id: bannerData.tenant_id,
        }
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async archive(user: User, id: any) {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const banner: any = await this.bannerRepository.findOne({
        where: { id, is_archived: false },
        relations: ['created_by', 'tenant'],
      });

      if (!banner) {
        throw new NotFoundException('Banner not found');
      }

      const collectionOperations: any =
        await this.bannerCollectionOperationRepository.find({
          where: {
            banner_id: In([banner.id]),
          },
          relations: ['collection_operation_id'],
        });

      banner.is_archived = true;
      banner.collectionOperations = collectionOperations;
      banner.created_at = new Date();
      banner.created_by = user;
      // Archive the Banner entity
      const archivedBanner = await queryRunner.manager.save(banner);
      await queryRunner.commitTransaction();

      return resSuccess(
        'Banner Archived.',
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
}
