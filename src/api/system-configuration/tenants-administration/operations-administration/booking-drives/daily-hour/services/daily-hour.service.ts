import { Inject, Injectable, Scope, HttpStatus } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  EntityManager,
  In,
  IsNull,
  MoreThanOrEqual,
} from 'typeorm';
import moment from 'moment';
import { DailyHour } from '../entities/daily-hour.entity';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { User } from 'src/api/system-configuration/tenants-administration/user-administration/user/entity/user.entity';
import { DailyHourDto, UpdateDailyHourDto } from '../dto/daily-hour.dto';
import {
  DailyHourInterface,
  GetByCollectionOperationInterface,
} from '../interface/dailyhour.interface';
import { BusinessUnits } from '../../../../organizational-administration/hierarchy/business-units/entities/business-units.entity';
import { DailyHourHistory } from '../entities/daily-hour-history.entity';
import { getModifiedDataDetails } from '../../../../../../../common/utils/modified_by_detail';
import { UserRequest } from '../../../../../../../common/interface/request';

@Injectable({ scope: Scope.REQUEST })
export class DailyHourService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(DailyHour)
    private readonly dailyHourRepository: Repository<DailyHour>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(BusinessUnits)
    private readonly businessUnitsRepository: Repository<BusinessUnits>,
    @InjectRepository(DailyHourHistory)
    private readonly dailyHourHistoryRepository: Repository<DailyHourHistory>,
    private readonly entityManager: EntityManager
  ) {}

  async create(dailyHourDto: DailyHourDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const user = await this.userRepository.findOneBy({
        id: dailyHourDto?.created_by,
      });
      if (!user) {
        return resError(
          `User not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const { data, collection_operation } = dailyHourDto;
      const businessUnits: any = await this.businessUnitsRepository.findBy({
        id: In(collection_operation),
      });
      if (businessUnits && businessUnits.length < collection_operation.length) {
        return resError(
          `Some Collection Operations not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const saveDailyHour = [];
      for (const businessUnit of businessUnits) {
        const dailyHour: any = new DailyHour();
        dailyHour.mon_earliest_depart_time = data.mon_earliest_depart_time;
        dailyHour.mon_latest_return_time = data.mon_latest_return_time;
        dailyHour.tue_earliest_depart_time = data.tue_earliest_depart_time;
        dailyHour.tue_latest_return_time = data.tue_latest_return_time;
        dailyHour.wed_earliest_depart_time = data.wed_earliest_depart_time;
        dailyHour.wed_latest_return_time = data.wed_latest_return_time;
        dailyHour.thu_earliest_depart_time = data.thu_earliest_depart_time;
        dailyHour.thu_latest_return_time = data.thu_latest_return_time;
        dailyHour.fri_earliest_depart_time = data.fri_earliest_depart_time;
        dailyHour.fri_latest_return_time = data.fri_latest_return_time;
        dailyHour.sat_earliest_depart_time = data.sat_earliest_depart_time;
        dailyHour.sat_latest_return_time = data.sat_latest_return_time;
        dailyHour.sun_earliest_depart_time = data.sun_earliest_depart_time;
        dailyHour.sun_latest_return_time = data.sun_latest_return_time;
        dailyHour.is_current = true;
        dailyHour.effective_date = new Date();
        dailyHour.created_by = user;
        dailyHour.tenant_id = this.request?.user?.tenant?.id;
        dailyHour.collection_operation = [businessUnit];
        const res = await queryRunner.manager.save(dailyHour);
        saveDailyHour.push(res);
      }

      await queryRunner.commitTransaction();
      return {
        status: 'success',
        response: 'Daily Hour Created Successfully',
        status_code: 201,
        data: saveDailyHour,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async getAll(dailyHourInterface: DailyHourInterface): Promise<any> {
    try {
      const sortBy = dailyHourInterface?.sortBy;
      const sortOrder = dailyHourInterface?.sortOrder;

      if ((sortBy && !sortOrder) || (sortOrder && !sortBy)) {
        return resError(
          `When selecting sort SortBy & sortOrder is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
      const limit: number = dailyHourInterface?.limit
        ? +dailyHourInterface.limit
        : +process.env.PAGE_SIZE;
      const page = dailyHourInterface?.page ? +dailyHourInterface.page : 1;
      const order = this.constructOrder(sortBy, sortOrder);
      const queryBuilder =
        this.dailyHourRepository.createQueryBuilder('dailyHour');
      this.buildWhereClause(dailyHourInterface, queryBuilder);
      const [response, count] = await queryBuilder
        .take(limit)
        .skip((page - 1) * limit)
        .orderBy(order)
        .getManyAndCount();
      return {
        status: HttpStatus.OK,
        response: 'Daily Hour Fetched Successfully',
        count: count,
        data: response,
      };
    } catch (error) {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getByCollectionOperationId(
    dailyHourInterface: GetByCollectionOperationInterface
  ): Promise<any> {
    try {
      console.log(new Date('10-21-2023'));
      const response = await this.dailyHourRepository
        .createQueryBuilder('daily_hours')
        .leftJoinAndSelect(
          'daily_hours.collection_operation',
          'collection_operation'
        )
        .where('collection_operation.id = :collection_operation_id', {
          collection_operation_id: dailyHourInterface.collectionOperation,
        })
        .andWhere(
          '(:checkDate BETWEEN daily_hours.effective_date AND daily_hours.end_date OR (daily_hours.effective_date < :driveDate AND daily_hours.end_date is null))',
          {
            checkDate: moment(dailyHourInterface.driveDate).format(
              'YYYY-MM-DD'
            ),
            driveDate: moment(dailyHourInterface.driveDate).format(
              'YYYY-MM-DD'
            ),
          }
        )
        .getMany();
      return {
        status: HttpStatus.OK,
        response: 'Daily Hour Fetched Successfully',
        data: response,
      };
    } catch (error) {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async findOne(id: any): Promise<any> {
    try {
      const dailyHour: any = await this.dailyHourRepository.findOne({
        where: { id: id, is_archived: false },
        relations: ['created_by', 'collection_operation', 'tenant'],
      });
      if (!dailyHour) {
        return resError(
          `Daily Hour not found`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
      let currentDailyHour;
      if (dailyHour.effective_date) {
        const originalDate = new Date(dailyHour.effective_date);
        originalDate.setDate(originalDate.getDate() - 1);

        const formattedDate = originalDate.toISOString().split('T')[0];
        currentDailyHour = await this.dailyHourRepository.findOne({
          where: {
            end_date: new Date(formattedDate),
            collection_operation: {
              id: dailyHour.collection_operation[0].id,
            },
            is_archived: false,
          },
        });
      }
      if (dailyHour) {
        const modifiedData: any = await getModifiedDataDetails(
          this.dailyHourHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        dailyHour.modified_by = dailyHour.created_by;
        dailyHour.modified_at = dailyHour.created_at;
        dailyHour.created_at = modified_at ? modified_at : dailyHour.created_at;
        dailyHour.created_by = modified_by ? modified_by : dailyHour.created_by;
      }

      return {
        status: HttpStatus.OK,
        message: 'Daily Hour Fetched Succesfuly',
        data: { ...dailyHour },
        currentData: currentDailyHour,
      };
    } catch {
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private buildWhereClause(
    dailyHourInterface: DailyHourInterface,
    queryBuilder: any
  ) {
    const currentDate = new Date();
    queryBuilder
      .leftJoinAndSelect(
        'dailyHour.collection_operation',
        'collection_operation'
      )
      .where('dailyHour.tenant_id = :tenantId', {
        tenantId: this.request?.user?.tenant?.id,
      })
      .andWhere('dailyHour.is_archived = false');

    if (dailyHourInterface?.collectionOperation) {
      const collectionOperations = dailyHourInterface.collectionOperation
        .split(',')
        .map((op) => op.trim());
      queryBuilder.andWhere(
        'collection_operation.id IN (:...collectionOperations)',
        {
          collectionOperations,
        }
      );
    }
    if (dailyHourInterface?.keyword) {
      const collectionOperations = dailyHourInterface.keyword.trim();
      queryBuilder.andWhere(
        'collection_operation.name ILIKE :collectionOperation',
        {
          collectionOperation: `%${collectionOperations}%`,
        }
      );
    }

    if (dailyHourInterface?.display) {
      if (dailyHourInterface.display === 'Current') {
        queryBuilder.andWhere('dailyHour.effective_date <= :currentDate', {
          currentDate,
        });
        queryBuilder.andWhere(
          '(dailyHour.end_date > :currentDate OR dailyHour.end_date IS NULL)'
        );
      } else if (dailyHourInterface.display === 'Past') {
        queryBuilder.andWhere('dailyHour.end_date < :currentDate', {
          currentDate,
        });
      } else if (dailyHourInterface.display === 'Scheduled') {
        queryBuilder.andWhere('dailyHour.effective_date > :currentDate', {
          currentDate,
        });
      }
    }
  }

  async update(id: any, updateDailyHourDto: UpdateDailyHourDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const dailyHour: any = await this.dailyHourRepository.findOne({
        where: { id, is_archived: false },
        relations: ['created_by', 'collection_operation'],
      });
      const shallowCopyDailyHour = { ...dailyHour };
      if (!dailyHour) {
        return resError(
          `Daily Hour not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const user = await this.userRepository.findOneBy({
        id: updateDailyHourDto?.created_by,
      });

      if (!user) {
        return resError(
          `User not found`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const {
        data,
        effective_date,
        end_date,
        isScheduled = false,
      } = updateDailyHourDto;
      if (isScheduled && effective_date) {
        const overlappingRecord = await this.dailyHourRepository.findOne({
          relations: ['collection_operation'],
          where: {
            effective_date: MoreThanOrEqual(moment(effective_date).toDate()),
            end_date: IsNull(),
            is_archived: false,
            collection_operation: {
              id: dailyHour.collection_operation[0].id,
            },
          },
        });
        if (overlappingRecord) {
          return resError(
            `${overlappingRecord?.collection_operation.map(
              (e) => e.name
            )} Effective date  overlap with existing record.`,
            ErrorConstants.Error,
            HttpStatus.BAD_REQUEST
          );
        }
        if (
          updateDailyHourDto.copy_collection_operations &&
          updateDailyHourDto.copy_collection_operations.length
        ) {
          const businessUnitIds = updateDailyHourDto.copy_collection_operations;

          const allOverlapingRecords = await this.dailyHourRepository.find({
            relations: ['collection_operation'],
            where: {
              collection_operation: {
                id: In(businessUnitIds),
              },
              end_date: IsNull(),
              is_archived: false,
              effective_date: MoreThanOrEqual(moment(effective_date).toDate()),
            },
          });
          const collectionNames = allOverlapingRecords
            ?.map((d) => d.collection_operation)
            .flat()
            .map((d) => d.name);
          if (allOverlapingRecords?.length > 0 && collectionNames?.length > 0) {
            return resError(
              `${collectionNames.map(
                (name) => name
              )} Effective date overlap with their current records.`,
              ErrorConstants.Error,
              HttpStatus.BAD_REQUEST
            );
          }
        }
        const scheduleDailyHour: any = new DailyHour();
        scheduleDailyHour.mon_earliest_depart_time =
          data.mon_earliest_depart_time;
        scheduleDailyHour.mon_latest_return_time = data.mon_latest_return_time;
        scheduleDailyHour.tue_earliest_depart_time =
          data.tue_earliest_depart_time;
        scheduleDailyHour.tue_latest_return_time = data.tue_latest_return_time;
        scheduleDailyHour.wed_earliest_depart_time =
          data.wed_earliest_depart_time;
        scheduleDailyHour.wed_latest_return_time = data.wed_latest_return_time;
        scheduleDailyHour.thu_earliest_depart_time =
          data.thu_earliest_depart_time;
        scheduleDailyHour.thu_latest_return_time = data.thu_latest_return_time;
        scheduleDailyHour.fri_earliest_depart_time =
          data.fri_earliest_depart_time;
        scheduleDailyHour.fri_latest_return_time = data.fri_latest_return_time;
        scheduleDailyHour.sat_earliest_depart_time =
          data.sat_earliest_depart_time;
        scheduleDailyHour.sat_latest_return_time = data.sat_latest_return_time;
        scheduleDailyHour.sun_earliest_depart_time =
          data.sun_earliest_depart_time;
        scheduleDailyHour.sun_latest_return_time = data.sun_latest_return_time;
        scheduleDailyHour.effective_date = effective_date;
        scheduleDailyHour.created_by = user;
        scheduleDailyHour.collection_operation = dailyHour.collection_operation;
        scheduleDailyHour.tenant_id = this.request?.user?.tenant?.id;
        scheduleDailyHour.end_date = new Date(end_date);
        scheduleDailyHour.effective_date = new Date(effective_date);
        scheduleDailyHour.created_at = new Date();
        await this.dailyHourRepository.save(scheduleDailyHour);
        const formattedDate = moment(effective_date)
          // .subtract(1, 'days')
          .toDate();
        dailyHour.end_date = new Date(end_date);
        if (dailyHour.is_current) {
          dailyHour.is_current = false;
        }
        await this.dailyHourRepository.save(dailyHour);
      }
      let updatedDailyHour;
      if (!isScheduled) {
        dailyHour.mon_earliest_depart_time = data.mon_earliest_depart_time;
        dailyHour.mon_latest_return_time = data.mon_latest_return_time;
        dailyHour.tue_earliest_depart_time = data.tue_earliest_depart_time;
        dailyHour.tue_latest_return_time = data.tue_latest_return_time;
        dailyHour.wed_earliest_depart_time = data.wed_earliest_depart_time;
        dailyHour.wed_latest_return_time = data.wed_latest_return_time;
        dailyHour.thu_earliest_depart_time = data.thu_earliest_depart_time;
        dailyHour.thu_latest_return_time = data.thu_latest_return_time;
        dailyHour.fri_earliest_depart_time = data.fri_earliest_depart_time;
        dailyHour.fri_latest_return_time = data.fri_latest_return_time;
        dailyHour.sat_earliest_depart_time = data.sat_earliest_depart_time;
        dailyHour.sat_latest_return_time = data.sat_latest_return_time;
        dailyHour.sun_earliest_depart_time = data.sun_earliest_depart_time;
        dailyHour.sun_latest_return_time = data.sun_latest_return_time;
        dailyHour.effective_date = new Date(effective_date);
        dailyHour.created_at = new Date();
        dailyHour.end_date = new Date(end_date);
        dailyHour.created_by = this.request?.user;
        updatedDailyHour = await this.dailyHourRepository.save(dailyHour);
      }

      if (
        updateDailyHourDto.copy_collection_operations &&
        updateDailyHourDto.copy_collection_operations.length
      ) {
        const idsToUpdate = updateDailyHourDto.copy_collection_operations;
        const businessUnits: any = await this.businessUnitsRepository.findBy({
          id: In(idsToUpdate),
        });

        if (
          businessUnits &&
          businessUnits.length <
            updateDailyHourDto.copy_collection_operations.length
        ) {
          return resError(
            `Some Collection Operations not found.`,
            ErrorConstants.Error,
            HttpStatus.NOT_FOUND
          );
        }

        for (const businessUnit of businessUnits) {
          const dailyHour: any = await this.dailyHourRepository.findOne({
            where: {
              collection_operation: {
                id: businessUnit.id,
              },
              end_date: IsNull(),
              is_archived: false,
            },
            relations: ['collection_operation'],
          });
          if (dailyHour) {
            if (isScheduled && dailyHour.effective_date && !end_date) {
              const scheduleDailyHour: any = new DailyHour();
              scheduleDailyHour.mon_earliest_depart_time =
                data.mon_earliest_depart_time;
              scheduleDailyHour.mon_latest_return_time =
                data.mon_latest_return_time;
              scheduleDailyHour.tue_earliest_depart_time =
                data.tue_earliest_depart_time;
              scheduleDailyHour.tue_latest_return_time =
                data.tue_latest_return_time;
              scheduleDailyHour.wed_earliest_depart_time =
                data.wed_earliest_depart_time;
              scheduleDailyHour.wed_latest_return_time =
                data.wed_latest_return_time;
              scheduleDailyHour.thu_earliest_depart_time =
                data.thu_earliest_depart_time;
              scheduleDailyHour.thu_latest_return_time =
                data.thu_latest_return_time;
              scheduleDailyHour.fri_earliest_depart_time =
                data.fri_earliest_depart_time;
              scheduleDailyHour.fri_latest_return_time =
                data.fri_latest_return_time;
              scheduleDailyHour.sat_earliest_depart_time =
                data.sat_earliest_depart_time;
              scheduleDailyHour.sat_latest_return_time =
                data.sat_latest_return_time;
              scheduleDailyHour.sun_earliest_depart_time =
                data.sun_earliest_depart_time;
              scheduleDailyHour.sun_latest_return_time =
                data.sun_latest_return_time;
              scheduleDailyHour.effective_date = effective_date;
              scheduleDailyHour.created_by = user;
              scheduleDailyHour.collection_operation =
                dailyHour.collection_operation;
              scheduleDailyHour.tenant_id = this.request?.user?.tenant?.id;
              scheduleDailyHour.effective_date = new Date(effective_date);
              scheduleDailyHour.end_date = new Date(end_date);
              scheduleDailyHour.created_at = new Date();
              await this.dailyHourRepository.save(scheduleDailyHour);
              const formattedDate = moment(effective_date)
                // .subtract(1, 'days')
                .toDate();
              dailyHour.end_date = new Date(end_date);
              if (dailyHour.is_current) {
                dailyHour.is_current = false;
              }
              await this.dailyHourRepository.save(dailyHour);
            }
            dailyHour.mon_earliest_depart_time = data.mon_earliest_depart_time;
            dailyHour.mon_latest_return_time = data.mon_latest_return_time;
            dailyHour.tue_earliest_depart_time = data.tue_earliest_depart_time;
            dailyHour.tue_latest_return_time = data.tue_latest_return_time;
            dailyHour.wed_earliest_depart_time = data.wed_earliest_depart_time;
            dailyHour.wed_latest_return_time = data.wed_latest_return_time;
            dailyHour.thu_earliest_depart_time = data.thu_earliest_depart_time;
            dailyHour.thu_latest_return_time = data.thu_latest_return_time;
            dailyHour.fri_earliest_depart_time = data.fri_earliest_depart_time;
            dailyHour.fri_latest_return_time = data.fri_latest_return_time;
            dailyHour.sat_earliest_depart_time = data.sat_earliest_depart_time;
            dailyHour.sat_latest_return_time = data.sat_latest_return_time;
            dailyHour.sun_earliest_depart_time = data.sun_earliest_depart_time;
            dailyHour.sun_latest_return_time = data.sun_latest_return_time;
            dailyHour.end_date = new Date(end_date);
            dailyHour.effective_date = new Date(effective_date);
            dailyHour.created_at = new Date();
            dailyHour.created_by = user;
            await this.dailyHourRepository.save(dailyHour);
          } else {
            const newDailyHour: any = new DailyHour();
            newDailyHour.effective_date = effective_date;
            newDailyHour.mon_earliest_depart_time =
              data.mon_earliest_depart_time;
            newDailyHour.mon_latest_return_time = data.mon_latest_return_time;
            newDailyHour.tue_earliest_depart_time =
              data.tue_earliest_depart_time;
            newDailyHour.tue_latest_return_time = data.tue_latest_return_time;
            newDailyHour.wed_earliest_depart_time =
              data.wed_earliest_depart_time;
            newDailyHour.wed_latest_return_time = data.wed_latest_return_time;
            newDailyHour.thu_earliest_depart_time =
              data.thu_earliest_depart_time;
            newDailyHour.thu_latest_return_time = data.thu_latest_return_time;
            newDailyHour.fri_earliest_depart_time =
              data.fri_earliest_depart_time;
            newDailyHour.fri_latest_return_time = data.fri_latest_return_time;
            newDailyHour.sat_earliest_depart_time =
              data.sat_earliest_depart_time;
            newDailyHour.sat_latest_return_time = data.sat_latest_return_time;
            newDailyHour.sun_earliest_depart_time =
              data.sun_earliest_depart_time;
            newDailyHour.sun_latest_return_time = data.sun_latest_return_time;
            newDailyHour.created_by = user;
            newDailyHour.tenant_id = this.request?.user?.tenant?.id;
            newDailyHour.effective_date = new Date(effective_date);
            newDailyHour.collection_operation = [businessUnit];
            newDailyHour.end_date = new Date(end_date);
            newDailyHour.created_at = new Date();
            await this.dailyHourRepository.save(newDailyHour);
          }
        }
      }

      await queryRunner.commitTransaction();
      return {
        status: 'Success',
        response: 'Resource updated',
        status_code: HttpStatus.NO_CONTENT,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  private constructOrder(
    sortBy: string,
    sortOrder: string | undefined
  ): Record<string, 'ASC' | 'DESC'> {
    if (sortBy === 'name' && sortOrder) {
      return {
        'collection_operation.name': sortOrder.toUpperCase() as 'ASC' | 'DESC',
      };
    } else if (sortOrder) {
      return {
        [`dailyHour.${sortBy}`]: sortOrder.toUpperCase() as 'ASC' | 'DESC',
      };
    } else {
      return { 'dailyHour.id': 'DESC' };
    }
  }

  async deleteDailyHour(id: any, user: any) {
    const dailyHour: any = await this.dailyHourRepository.findOne({
      where: {
        id,
        tenant: {
          id: user.tenant.id,
        },
      },
      relations: ['tenant'],
    });

    if (!dailyHour) {
      return resError('Daily Hour not found', ErrorConstants.Error, 404);
    }

    const queryRunner = this.entityManager.connection.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      dailyHour.is_archived = true;
      dailyHour.created_at = new Date();
      dailyHour.created_by = this.request?.user;
      const archivedDailyHour = await this.dailyHourRepository.save(dailyHour);

      await queryRunner.commitTransaction();

      return resSuccess(
        'Daily Hour Archived Successfully',
        'success',
        204,
        archivedDailyHour
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      resError('Internel Server Error', ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }
}
