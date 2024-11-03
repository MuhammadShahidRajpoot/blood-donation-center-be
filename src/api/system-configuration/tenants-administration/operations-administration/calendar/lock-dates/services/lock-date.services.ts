import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  Repository,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  LessThan,
} from 'typeorm';
import { LockDate } from '../entities/lock-date.entity';
import { LockDateHistory } from '../entities/lock-date-history.entity';
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
import { LockDateCollectionOperation } from '../entities/lock-date-collection-operations.entity';
import { LockDateDto } from '../dto/lock-date.dto';
import { LockDateInterface } from '../interface/lock-date.interface';
import { HistoryService } from 'src/api/common/services/history.service';
import { getModifiedDataDetails } from 'src/common/utils/modified_by_detail';
import { Tenant } from 'src/api/system-configuration/platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { UserRequest } from '../../../../../../../common/interface/request';
import { REQUEST } from '@nestjs/core';
dotenv.config();

@Injectable({ scope: Scope.REQUEST })
export class LockDateService extends HistoryService<LockDateHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(LockDate)
    private readonly lockDateRepository: Repository<LockDate>,
    @InjectRepository(LockDateHistory)
    private readonly lockDateHistory: Repository<LockDateHistory>,
    @InjectRepository(LockDateCollectionOperation)
    private readonly lockDateCollectionOperationRepository: Repository<LockDateCollectionOperation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly entityManager: EntityManager
  ) {
    super(lockDateHistory);
  }

  async create(user: User, createLockDateDto: LockDateDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const lockDate = new LockDate();
      lockDate.title = createLockDateDto?.title;
      lockDate.tenant_id = this.request?.user?.tenant?.id;
      lockDate.description = createLockDateDto?.description;
      lockDate.start_date = createLockDateDto?.start_date;
      lockDate.end_date = createLockDateDto?.end_date;
      lockDate.created_by = user;
      const savedLockDate: LockDate = await queryRunner.manager.save(lockDate);

      const promises = [];
      for (const collectionOperations of createLockDateDto.collection_operations) {
        const lockDateCollectionOperation = new LockDateCollectionOperation();
        lockDateCollectionOperation.lock_date_id = savedLockDate.id;
        lockDateCollectionOperation.collection_operation_id =
          collectionOperations;
        lockDateCollectionOperation.tenant_id = this.request?.user?.tenant?.id;
        lockDateCollectionOperation.created_by = user;
        promises.push(queryRunner.manager.save(lockDateCollectionOperation));
      }
      await Promise.all(promises);

      await queryRunner.commitTransaction();

      delete savedLockDate?.created_by;
      return resSuccess(
        'Lock Date Created.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedLockDate
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(params: LockDateInterface) {
    try {
      const limit: number = params?.limit
        ? +params?.limit
        : +process.env.PAGE_SIZE;

      let page = params?.page ? +params?.page : 1;

      if (page < 1) {
        page = 1;
      }

      const where = { tenant_id: this.request?.user?.tenant?.id };
      if (params?.title) {
        Object.assign(where, {
          title: ILike(`%${params?.title}%`),
        });
      }

      if (params?.locked_dates) {
        if (params.locked_dates === 'current') {
          Object.assign(where, {
            start_date: LessThanOrEqual(new Date().toLocaleDateString('en-US')),
            end_date: MoreThanOrEqual(new Date().toLocaleDateString('en-US')),
          });
        }

        if (params.locked_dates === 'past') {
          Object.assign(where, {
            end_date: LessThan(new Date().toLocaleDateString('en-US')),
          });
        }
      }

      if (params?.collection_operation) {
        const collectionOperations = params.collection_operation.split(',');
        let lock_dates = [];
        const qb = this.lockDateCollectionOperationRepository
          .createQueryBuilder('collectionOperation')
          .select('collectionOperation.lock_date_id', 'lock_date_id')
          .where(
            'collectionOperation.collection_operation_id IN (:...collectionOperations)',
            { collectionOperations }
          );

        const result = await qb.getRawMany();
        lock_dates = result.map((row) => row.lock_date_id);

        Object.assign(where, {
          id: In(lock_dates),
        });
      }

      const orderBy: { [key: string]: 'ASC' | 'DESC' } = {};
      const sortBy = params.sortBy;
      const sortOrder = params.sortOrder;
      if (sortBy) {
        orderBy[`lock_dates.${sortBy}`] =
          sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      } else {
        // Default orderBy in case sortBy is not provided
        orderBy['lock_dates.id'] = 'DESC';
      }

      let lockDates: any = [];
      if (params?.fetchAll) {
        lockDates = this.lockDateRepository
          .createQueryBuilder('lock_dates')
          .orderBy(orderBy)
          .where({ ...where, is_archived: false });
      } else {
        lockDates = this.lockDateRepository
          .createQueryBuilder('lock_dates')
          .take(limit)
          .skip((page - 1) * limit)
          .orderBy(orderBy)
          .where({ ...where, is_archived: false });
      }

      const [data, count] = await lockDates.getManyAndCount();

      const updatedLockdates = [];

      for (const item of data) {
        const collectionOperations =
          await this.lockDateCollectionOperationRepository
            .createQueryBuilder('collectionOperation')
            .where('collectionOperation.lock_date_id IN (:...ids)', {
              ids: [item.id],
            })
            .leftJoinAndSelect(
              'collectionOperation.lock_date_id',
              'lock_date_id'
            )
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

        updatedLockdates.push({
          ...item,
          collectionOperations,
        });
      }
      return {
        status: HttpStatus.OK,
        message: 'Lock Dates Fetched.',
        count: count,
        data: updatedLockdates,
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
      const lockDate: any = await this.lockDateRepository.findOne({
        where: {
          id: id,
          is_archived: false,
        },
        relations: ['created_by', 'tenant'],
      });
      if (!lockDate) {
        resError(
          `Lock Date not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const collectionOperations =
        await this.lockDateCollectionOperationRepository.find({
          where: {
            lock_date_id: In([lockDate.id]),
          },
          relations: ['collection_operation_id'],
        });
      if (lockDate) {
        const modifiedData: any = await getModifiedDataDetails(
          this.lockDateHistory,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        lockDate.modified_by = lockDate.created_by;
        lockDate.modified_at = lockDate.created_at;
        lockDate.created_at = modified_at ? modified_at : lockDate.created_at;
        lockDate.created_by = modified_by ? modified_by : lockDate.created_by;
      }

      delete lockDate?.tenant;
      return resSuccess(
        'Lock Date fetched.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        { lockDate, collectionOperations, tenant_id: lockDate.tenant_id }
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(user: User, id: any, updateLockDateDto: LockDateDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const lockDateData: any = await this.lockDateRepository.findOne({
        where: {
          id,
          is_archived: false,
        },
        relations: ['created_by', 'tenant'],
      });
      if (!lockDateData) {
        resError(
          `Lock Date not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const lockDateUpdateObject: any = {
        title: updateLockDateDto?.title ?? lockDateData?.title,
        description:
          updateLockDateDto?.description ?? lockDateData?.description,
        start_date: updateLockDateDto?.start_date ?? lockDateData?.start_date,
        end_date: updateLockDateDto?.end_date ?? lockDateData?.end_date,
        created_at: new Date(),
        created_by: this.request?.user,
      };
      let updatedLockDate: any = await queryRunner.manager.update(
        LockDate,
        { id: lockDateData.id },
        { ...lockDateUpdateObject }
      );
      if (!updatedLockDate.affected) {
        resError(
          `Lock Date update failed.`,
          ErrorConstants.Error,
          HttpStatus.NOT_MODIFIED
        );
      }

      await this.lockDateCollectionOperationRepository
        .createQueryBuilder('lock_date_collection_operations')
        .delete()
        .from(LockDateCollectionOperation)
        .where('lock_date_id = :lock_date_id', {
          lock_date_id: lockDateData.id,
        })
        .execute();

      const promises = [];
      for (const collectionOperations of updateLockDateDto.collection_operations) {
        const lockDateCollectionOperation: any =
          new LockDateCollectionOperation();
        lockDateCollectionOperation.lock_date_id = lockDateData.id;
        lockDateCollectionOperation.collection_operation_id =
          collectionOperations;
        lockDateCollectionOperation.created_by = user;
        lockDateCollectionOperation.created_at = new Date();
        promises.push(queryRunner.manager.save(lockDateCollectionOperation));
      }
      await Promise.all(promises);
      await queryRunner.commitTransaction();

      updatedLockDate = await this.lockDateRepository.findOne({
        where: {
          id: lockDateData.id,
        },
      });

      const collectionOperations =
        await this.lockDateCollectionOperationRepository.find({
          where: {
            lock_date_id: In([updatedLockDate.id]),
          },
          relations: ['collection_operation_id'],
        });

      return resSuccess(
        'Lock Date Updated.', // message
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        {
          lockDate: updatedLockDate,
          collectionOperations,
          tenant_id: lockDateData.tenant_id,
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

      const lockDate: any = await this.lockDateRepository.findOne({
        where: { id, is_archived: false },
        relations: ['created_by', 'tenant'],
      });

      if (!lockDate) {
        throw new NotFoundException('Lock Date not found');
      }

      const collectionOperations: any =
        await this.lockDateCollectionOperationRepository.find({
          where: {
            lock_date_id: In([lockDate.id]),
          },
          relations: ['collection_operation_id'],
        });

      lockDate.is_archived = true;
      lockDate.created_at = new Date();
      lockDate.created_by = this.request?.user;
      // Archive the Lock Date entity
      const archivedLockDate = await queryRunner.manager.save(lockDate);
      await queryRunner.commitTransaction();

      return resSuccess(
        'Lock Date Archived.',
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
