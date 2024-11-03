import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateDailyGoalsAllocationDto } from '../dto/create-daily-goals-allocation.dto';
import { UpdateDailyGoalsAllocationDto } from '../dto/update-daily-goals-allocation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import moment, { Moment } from 'moment';
import { DailyGoalsAllocations } from '../entities/daily-goals-allocation.entity';
import { SuccessConstants } from '../../../../../constants/success.constants';
import { resError, resSuccess } from '../../../../../helpers/response';
import { ErrorConstants } from '../../../../../constants/error.constants';
import { ProcedureTypes } from '../../../products-procedures/procedure-types/entities/procedure-types.entity';
import { DailyGoalAllocationsFiltersInterface } from '../interface/daily-goals.interface';
import { DailyGoalsAllocationHistory } from '../entities/daily-goals-allocation-history.entity';
import { DailyGoalsCalenders } from '../../daily-goals-calender/entity/daily-goals-calender.entity';
import { User } from '../../../../user-administration/user/entity/user.entity';
import { BusinessUnits } from '../../../hierarchy/business-units/entities/business-units.entity';
import { Tenant } from '../../../../../platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { HistoryService } from '../../../../../../common/services/history.service';
import { MonthlyGoals } from '../../monthly-goals/entities/monthly-goals.entity';
import { getModifiedDataDetails } from '../../../../../../../common/utils/modified_by_detail';
import { isEmpty } from 'lodash';
import { DailyGoalsCalendersHistory } from '../../daily-goals-calender/entity/daily-goals-calender-history.entity';
import { DailyGoalsCalenderService } from '../../daily-goals-calender/service/daily-goals-calender.service';
import { CloseDate } from 'src/api/system-configuration/tenants-administration/operations-administration/calendar/close-dates/entities/close-date.entity';
import { ClosedDateInterface } from '../../monthly-goals/interface/monthly-goals.interface';
import { MonthlyGoalsService } from '../../monthly-goals/services/monthly-goals.service';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';

@Injectable()
export class DailyGoalsAllocationService extends HistoryService<DailyGoalsAllocationHistory> {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(BusinessUnits)
    private readonly businessUnitsRepository: Repository<BusinessUnits>,
    @InjectRepository(DailyGoalsAllocations)
    private readonly dailyGoalAllocationsRepository: Repository<DailyGoalsAllocations>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProcedureTypes)
    private readonly procedureTypesRepository: Repository<ProcedureTypes>,
    @InjectRepository(DailyGoalsAllocationHistory)
    private readonly dailyGoalAllocationsHistoryRepository: Repository<DailyGoalsAllocationHistory>,
    @InjectRepository(DailyGoalsCalenders)
    private readonly dailyGoalsCalenderRepository: Repository<DailyGoalsCalenders>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(MonthlyGoals)
    private readonly monthlyGoalsRepository: Repository<MonthlyGoals>,
    @InjectRepository(CloseDate)
    private readonly closeDateRepository: Repository<CloseDate>,
    private readonly dailyGoalsCalendarService: DailyGoalsCalenderService,
    private readonly monthlyGoalsService: MonthlyGoalsService
  ) {
    super(dailyGoalAllocationsHistoryRepository);
  }

  async create(createDailyGoalsAllocationDto: CreateDailyGoalsAllocationDto) {
    try {
      const {
        procedure_type_id,
        collection_operation,
        month,
        year,
        created_by,
        sunday,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        tenant_id,
      } = createDailyGoalsAllocationDto;

      const totalPercentage =
        +sunday +
        +monday +
        +tuesday +
        +wednesday +
        +thursday +
        +friday +
        +saturday;

      if (totalPercentage > 100) {
        resError(
          `Sum of daily goals exceed the limit`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const user = await this.userRepository.findOneBy({
        id: created_by,
      });
      if (!user) {
        resError(`User not found.`, ErrorConstants.Error, HttpStatus.NOT_FOUND);
      }

      const procedureType = await this.procedureTypesRepository.findOneBy({
        id: procedure_type_id,
      });
      if (!procedureType) {
        resError(
          `Procedure Type not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
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

      const businessUnits: any = await this.businessUnitsRepository.findBy({
        id: In(collection_operation),
      });
      if (businessUnits && businessUnits.length < collection_operation.length) {
        resError(
          `Some Collection Operations not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const effectiveDate = moment(new Date(year, month, 1));
      const daily_goal_allocation = await this.dailyGoalAllocationsRepository
        .createQueryBuilder('dailyGoalsAllocation')
        .leftJoinAndSelect(
          'dailyGoalsAllocation.collection_operation',
          'collectionOperation'
        )
        .where('collectionOperation.id IN (:...collectionOperationIds)', {
          collectionOperationIds: collection_operation,
        })
        .andWhere('dailyGoalsAllocation.effective_date = :effectiveDate', {
          effectiveDate: effectiveDate.toDate(),
        })
        .andWhere('dailyGoalsAllocation.is_archived = :isArchived', {
          isArchived: false,
        })
        .getMany();

      if (daily_goal_allocation.length > 0) {
        resError(
          `Daily Allocation with Effective Date and Collection Operation Already exists.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const findDate = moment(effectiveDate);
      findDate.set('h', 0);
      findDate.set('m', 0);
      findDate.set('s', 0);
      const dailyAllocationsList = await this.dailyGoalAllocationsRepository
        .createQueryBuilder('dailyGoalsAllocation')
        .leftJoinAndSelect(
          'dailyGoalsAllocation.collection_operation',
          'collectionOperation'
        )
        .where('collectionOperation.id IN (:...collectionOperationIds)', {
          collectionOperationIds: collection_operation,
        })
        .andWhere('dailyGoalsAllocation.effective_date > :effectiveDate', {
          effectiveDate: findDate.toDate(),
        })
        .andWhere('dailyGoalsAllocation.is_archived = :isArchived', {
          isArchived: false,
        })
        .limit(1)
        .getMany();

      console.log({ dailyAllocationsList });
      let endDate = null;
      // console.log({ endDate }, 'Yearly End');
      if (dailyAllocationsList.length) {
        endDate = moment(dailyAllocationsList?.[0]?.effective_date);
        endDate.set('h', 0);
        endDate.set('m', 0);
        endDate.set('s', 0);
        // console.log({ endDate }, 'Next Effective Start');
      }

      const dailyGoalAllocations = new DailyGoalsAllocations();

      dailyGoalAllocations.procedure_type = procedureType;
      dailyGoalAllocations.effective_date = effectiveDate.toDate();
      dailyGoalAllocations.created_by = user;
      dailyGoalAllocations.month = month;
      dailyGoalAllocations.year = year;
      dailyGoalAllocations.sunday = sunday ?? 0;
      dailyGoalAllocations.monday = monday ?? 0;
      dailyGoalAllocations.tuesday = tuesday ?? 0;
      dailyGoalAllocations.wednesday = wednesday ?? 0;
      dailyGoalAllocations.thursday = thursday ?? 0;
      dailyGoalAllocations.friday = friday ?? 0;
      dailyGoalAllocations.saturday = saturday ?? 0;
      dailyGoalAllocations.collection_operation = businessUnits;
      dailyGoalAllocations.tenant_id = tenant?.id;

      const savedDailyGoal = await this.dailyGoalAllocationsRepository.save(
        dailyGoalAllocations
      );

      if (!endDate) {
        console.log(
          `It doesn't have an End run for all monthly goals after year ${parseInt(
            effectiveDate.format('yyyy')
          )}`
        );
        const allMonthlyGoals = await this.getAllMonthlyGoalsAfterYear(
          parseInt(effectiveDate.format('yyyy')),
          createDailyGoalsAllocationDto.procedure_type_id,
          createDailyGoalsAllocationDto.collection_operation
        );
        for (const monthly_goal of allMonthlyGoals) {
          console.log(`Running for year ${monthly_goal?.year}`);
          for (let i = 0; i < businessUnits.length; i++) {
            const coEffectiveDate =
              monthly_goal?.year == createDailyGoalsAllocationDto.year
                ? moment(effectiveDate)
                : moment(new Date(monthly_goal?.year, 0, 1));
            endDate = moment(coEffectiveDate).endOf('year');

            const item = businessUnits[i];
            await this.processDailyGoalsCalendar(
              coEffectiveDate,
              endDate,
              item,
              monthly_goal,
              procedureType,
              tenant,
              createDailyGoalsAllocationDto,
              user
            );
          }
        }
      } else {
        console.log(
          `It has an End run upto ${endDate} starting from ${effectiveDate}`
        );
        const goalEndDate = endDate;
        const allMonthlyGoals = await this.getAllMonthlyGoalsBetweenYears(
          parseInt(effectiveDate.format('yyyy')),
          parseInt(endDate.format('yyyy')),
          createDailyGoalsAllocationDto.procedure_type_id,
          createDailyGoalsAllocationDto.collection_operation
        );
        // console.log({ allMonthlyGoals });
        for (const monthly_goal of allMonthlyGoals) {
          console.log(`Running for year ${monthly_goal?.year}`);
          for (let i = 0; i < businessUnits.length; i++) {
            const coEffectiveDate =
              monthly_goal?.year == createDailyGoalsAllocationDto.year
                ? moment(effectiveDate)
                : moment(new Date(monthly_goal?.year, 0, 1));
            endDate =
              monthly_goal?.year == moment(goalEndDate).format('YYYY')
                ? moment(goalEndDate)
                : moment(coEffectiveDate).endOf('year');
            const item = businessUnits[i];
            await this.processDailyGoalsCalendar(
              coEffectiveDate,
              endDate,
              item,
              monthly_goal,
              procedureType,
              tenant,
              createDailyGoalsAllocationDto,
              user
            );
          }
        }
      }

      delete savedDailyGoal.procedure_type;
      delete savedDailyGoal.created_by;

      return resSuccess(
        'Daily Goal Allocation Created Successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedDailyGoal
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAll(
    dailyGoalAllocationsFiltersInterface: DailyGoalAllocationsFiltersInterface
  ) {
    try {
      const {
        collection_operation,
        procedure_type,
        selected_date,
        tenant_id,
        sortBy,
        sortOrder,
        childSortBy,
      } = dailyGoalAllocationsFiltersInterface;
      let { page, limit } = dailyGoalAllocationsFiltersInterface;

      limit = limit ? +limit : +process.env.PAGE_SIZE;

      page = page ? +page : 1;
      const order = {};
      if (!isEmpty(sortBy))
        switch (sortBy) {
          case 'procedure_type':
            Object.assign(order, {
              procedure_type: {
                [childSortBy]: sortOrder,
              },
            });
            break;
          case 'collection_operation':
            Object.assign(order, {
              collection_operation: {
                [childSortBy]: sortOrder,
              },
            });
            break;
          default:
            Object.assign(order, {
              [sortBy]: sortOrder,
            });
            break;
        }

      const where = { is_archived: false };
      if (selected_date) {
        const startDate = moment(new Date(selected_date)).startOf('day');
        const endDate = moment(new Date(selected_date)).endOf('day');

        // console.log({ startDate, endDate });

        Object.assign(where, {
          effective_date: Between(startDate, endDate),
        });
      }

      const collectionOperationIds = collection_operation
        ? Array.isArray(collection_operation)
          ? collection_operation
          : [collection_operation]
        : [];

      if (collectionOperationIds && collectionOperationIds?.length > 0) {
        Object.assign(where, {
          collection_operation: {
            id: In(collectionOperationIds),
          },
        });
      }

      Object.assign(where, {
        tenant: { id: tenant_id },
      });

      if (procedure_type) {
        Object.assign(where, {
          procedure_type: {
            id: procedure_type,
          },
        });
      }

      const [response, count] =
        await this.dailyGoalAllocationsRepository.findAndCount({
          where,
          relations: [
            'procedure_type',
            'created_by',
            'collection_operation',
            'tenant',
          ],
          take: limit,
          skip: (page - 1) * limit,
          order: order,
        });

      return {
        status: HttpStatus.OK,
        message: 'Daily Goals Fetched Succesfuly',
        count: count,
        data: response,
      };
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findOne(id: any) {
    try {
      const dailyGoalsAllocation: any =
        await this.dailyGoalAllocationsRepository.findOne({
          where: { id: id },
          relations: [
            'procedure_type',
            'created_by',
            'collection_operation',
            'tenant',
          ],
        });

      if (!dailyGoalsAllocation) {
        return resError(
          `Daily goal allocation not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (dailyGoalsAllocation?.is_archived) {
        return resError(
          `Daily goal allocation is archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (dailyGoalsAllocation) {
        const modifiedData: any = await getModifiedDataDetails(
          this.dailyGoalAllocationsHistoryRepository,
          id,
          this.userRepository
        );
        const modified_at = modifiedData?.created_at;
        const modified_by = modifiedData?.created_by;
        dailyGoalsAllocation.modified_by = dailyGoalsAllocation.created_by;
        dailyGoalsAllocation.modified_at = dailyGoalsAllocation.created_at;
        dailyGoalsAllocation.created_at = modified_at
          ? modified_at
          : dailyGoalsAllocation.created_at;
        dailyGoalsAllocation.created_by = modified_by
          ? modified_by
          : dailyGoalsAllocation.created_by;
      }
      return resSuccess(
        'Daily goal allocation fetched successfully.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        dailyGoalsAllocation
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async update(
    id: any,
    updateDailyGoalsAllocationDto: UpdateDailyGoalsAllocationDto
  ) {
    try {
      const dailyGoalsAllocation: any =
        await this.dailyGoalAllocationsRepository.findOne({
          relations: ['created_by', 'procedure_type', 'tenant'],
          where: { id: id },
        });

      const dailGoalAllocationBeforeUpdate = { ...dailyGoalsAllocation };
      const originalDate = moment(dailyGoalsAllocation.effective_date);
      if (!dailyGoalsAllocation) {
        return resError(
          `Daily goal allocation not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (dailyGoalsAllocation?.is_archived) {
        return resError(
          `Daily goal allocation is archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      const {
        procedure_type_id,
        collection_operation,
        month,
        year,
        created_by,
        sunday,
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        updated_by,
        tenant_id,
      } = updateDailyGoalsAllocationDto;

      const totalPercentageNew =
        sunday ||
        0 + monday ||
        0 + tuesday ||
        0 + wednesday ||
        0 + thursday ||
        0 + friday ||
        0 + saturday;

      if (totalPercentageNew > 100) {
        return resError(
          `Sum of daily goals exceed the limit`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      let user;
      if (created_by) {
        user = await this.userRepository.findOneBy({
          id: created_by,
        });
        if (!user) {
          return resError(
            `User not found.`,
            ErrorConstants.Error,
            HttpStatus.NOT_FOUND
          );
        }
        dailyGoalsAllocation.created_by = user;
      }

      let procedureType;
      if (procedure_type_id) {
        procedureType = await this.procedureTypesRepository.findOneBy({
          id: procedure_type_id,
        });

        if (!procedureType) {
          return resError(
            `Procedure Type not found.`,
            ErrorConstants.Error,
            HttpStatus.NOT_FOUND
          );
        }

        dailyGoalsAllocation.procedure_type = procedureType;
      }

      const tenant = await this.tenantRepository.findOneBy({
        id: tenant_id,
      });
      if (!tenant) {
        return resError(
          `Tenant not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      if (year && month >= 0) {
        dailyGoalsAllocation.effective_date = moment(
          new Date(year, month, 1)
        ).toDate();
        dailyGoalsAllocation.month = month;
        dailyGoalsAllocation.year = year;
      }

      const effectiveDate = moment(new Date(year, month, 1));

      const updatedDate = dailyGoalsAllocation.effective_date;
      dailyGoalsAllocation.sunday = sunday ?? dailyGoalsAllocation.sunday;
      dailyGoalsAllocation.monday = monday ?? dailyGoalsAllocation.monday;
      dailyGoalsAllocation.tuesday = tuesday ?? dailyGoalsAllocation.tuesday;
      dailyGoalsAllocation.wednesday =
        wednesday ?? dailyGoalsAllocation.wednesday;
      dailyGoalsAllocation.thursday = thursday ?? dailyGoalsAllocation.thursday;
      dailyGoalsAllocation.friday = friday ?? dailyGoalsAllocation.friday;
      dailyGoalsAllocation.saturday = saturday ?? dailyGoalsAllocation.saturday;
      dailyGoalsAllocation.created_at = new Date();
      dailyGoalsAllocation.created_by = this.request?.user;
      const findDate = moment(effectiveDate);
      findDate.set('h', 0);
      findDate.set('m', 0);
      findDate.set('s', 0);
      const dailyAllocationsList = await this.dailyGoalAllocationsRepository
        .createQueryBuilder('dailyGoalsAllocation')
        .leftJoinAndSelect(
          'dailyGoalsAllocation.collection_operation',
          'collectionOperation'
        )
        .where('collectionOperation.id IN (:...collectionOperationIds)', {
          collectionOperationIds: collection_operation,
        })
        .andWhere('dailyGoalsAllocation.effective_date > :effectiveDate', {
          effectiveDate: findDate.toDate(),
        })
        .andWhere('dailyGoalsAllocation.is_archived = :isArchived', {
          isArchived: false,
        })
        .limit(1)
        .getMany();

      let endDate = null;
      // console.log({ endDate }, 'Yearly End');
      if (dailyAllocationsList.length) {
        endDate = moment(dailyAllocationsList?.[0]?.effective_date);
        endDate.set('h', 0);
        endDate.set('m', 0);
        endDate.set('s', 0);
        // console.log({ endDate }, 'Next Effective Start');
      }
      let businessUnits = [];
      if (collection_operation) {
        businessUnits = await this.businessUnitsRepository.findBy({
          id: In(collection_operation),
        });

        if (
          businessUnits &&
          businessUnits.length < collection_operation.length
        ) {
          return resError(
            `Some Collection Operations not found.`,
            ErrorConstants.Error,
            HttpStatus.NOT_FOUND
          );
        }

        dailyGoalsAllocation.collection_operation = businessUnits;
      }

      const savedDailyGoal = await this.dailyGoalAllocationsRepository.save(
        dailyGoalsAllocation
      );

      if (!endDate) {
        console.log(
          `It doesn't have an End run for all monthly goals after year ${parseInt(
            effectiveDate.format('yyyy')
          )}`
        );
        const allMonthlyGoals = await this.getAllMonthlyGoalsAfterYear(
          parseInt(effectiveDate.format('yyyy')),
          updateDailyGoalsAllocationDto.procedure_type_id,
          updateDailyGoalsAllocationDto.collection_operation
        );
        for (const monthly_goal of allMonthlyGoals) {
          console.log(`Running for year ${monthly_goal?.year}`);
          for (let i = 0; i < businessUnits.length; i++) {
            const coEffectiveDate =
              monthly_goal?.year == updateDailyGoalsAllocationDto.year
                ? moment(effectiveDate)
                : moment(new Date(monthly_goal?.year, 0, 1));
            endDate = moment(coEffectiveDate).endOf('year');

            const item = businessUnits[i];
            await this.removePreviousAllocation(
              moment(originalDate),
              moment(updatedDate),
              updateDailyGoalsAllocationDto,
              item
            );
            await this.processDailyGoalsCalendar(
              coEffectiveDate,
              endDate,
              item,
              monthly_goal,
              procedureType,
              tenant,
              updateDailyGoalsAllocationDto,
              user
            );
          }
        }
      } else {
        console.log(
          `It has an End run upto ${endDate} starting from ${effectiveDate}`
        );
        const goalEndDate = endDate;
        const allMonthlyGoals = await this.getAllMonthlyGoalsBetweenYears(
          parseInt(effectiveDate.format('yyyy')),
          parseInt(endDate.format('yyyy')),
          updateDailyGoalsAllocationDto.procedure_type_id,
          updateDailyGoalsAllocationDto.collection_operation
        );
        // console.log({ allMonthlyGoals });
        for (const monthly_goal of allMonthlyGoals) {
          console.log(`Running for year ${monthly_goal?.year}`);
          for (let i = 0; i < businessUnits.length; i++) {
            const coEffectiveDate =
              monthly_goal?.year == updateDailyGoalsAllocationDto.year
                ? moment(effectiveDate)
                : moment(new Date(monthly_goal?.year, 0, 1));
            endDate =
              monthly_goal?.year == moment(goalEndDate).format('YYYY')
                ? moment(goalEndDate)
                : moment(coEffectiveDate).endOf('year');
            const item = businessUnits[i];
            await this.removePreviousAllocation(
              moment(originalDate),
              moment(updatedDate),
              updateDailyGoalsAllocationDto,
              item
            );
            await this.processDailyGoalsCalendar(
              coEffectiveDate,
              endDate,
              item,
              monthly_goal,
              procedureType,
              tenant,
              updateDailyGoalsAllocationDto,
              user
            );
          }
        }
      }

      delete savedDailyGoal?.procedure_type;
      delete savedDailyGoal?.created_by;

      return resSuccess(
        'Daily Goal Allocation Updated Successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        savedDailyGoal
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async archiveDailyGoal(id: any, user: any) {
    try {
      const dailyGoalToUpdate: any =
        await this.dailyGoalAllocationsRepository.findOne({
          where: {
            id: id,
            tenant: {
              id: user?.tenant?.id,
            },
          },
          relations: ['tenant'],
        });

      if (!dailyGoalToUpdate) {
        return resError(
          `Daily goals allocation not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      if (dailyGoalToUpdate.is_archived) {
        return resError(
          `Daily goals allocation is already archived.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      dailyGoalToUpdate.is_archived = true;
      dailyGoalToUpdate.created_at = new Date();
      dailyGoalToUpdate.created_by = this.request?.user;
      const archivedDailyGoal = await this.dailyGoalAllocationsRepository.save(
        dailyGoalToUpdate
      );

      const roleArchived = await this.dailyGoalAllocationsRepository.findOne({
        relations: ['created_by', 'procedure_type', 'tenant'],
        where: { id: id },
      });

      return resSuccess(
        'Daily goals allocation Archived successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        null
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getAllMonthlyGoalsAfterYear(
    year: number,
    procedure_type_id: bigint,
    collection_operation: number[]
  ) {
    const query = `
    SELECT 
      mg.year,
      SUM(mg.january) AS january_sum,
      SUM(mg.february) AS february_sum,
      SUM(mg.march) AS march_sum,
      SUM(mg.april) AS april_sum,
      SUM(mg.may) AS may_sum,
      SUM(mg.june) AS june_sum,
      SUM(mg.july) AS july_sum,
      SUM(mg.august) AS august_sum,
      SUM(mg.september) AS september_sum,
      SUM(mg.october) AS october_sum,
      SUM(mg.november) AS november_sum,
      SUM(mg.december) AS december_sum,
      SUM(mg.total_goal) AS total_goal_sum
    FROM 
      monthly_goals mg
    LEFT JOIN 
      monthly_goals_collection_operations mgc ON mgc.monthly_goals_id = mg.id
    WHERE
      mg.year >= ${year} AND
      mg.is_archived = ${false} AND
      mg.procedure_type = ${procedure_type_id} AND
      mgc.business_unit_id IN (${collection_operation})
    GROUP BY
      mg.year
    ORDER BY mg.year
  `;

    const monthly_goal = await this.monthlyGoalsRepository.query(query);
    return monthly_goal;
  }

  async getAllMonthlyGoalsBetweenYears(
    startYear: number,
    endYear: number,
    procedure_type_id: bigint,
    collection_operation: number[]
  ) {
    const query = `
    SELECT 
      mg.year,
      SUM(mg.january) AS january_sum,
      SUM(mg.february) AS february_sum,
      SUM(mg.march) AS march_sum,
      SUM(mg.april) AS april_sum,
      SUM(mg.may) AS may_sum,
      SUM(mg.june) AS june_sum,
      SUM(mg.july) AS july_sum,
      SUM(mg.august) AS august_sum,
      SUM(mg.september) AS september_sum,
      SUM(mg.october) AS october_sum,
      SUM(mg.november) AS november_sum,
      SUM(mg.december) AS december_sum,
      SUM(mg.total_goal) AS total_goal_sum
    FROM 
      monthly_goals mg
    LEFT JOIN 
      monthly_goals_collection_operations mgc ON mgc.monthly_goals_id = mg.id
    WHERE
      mg.year >= ${startYear} AND
      mg.year <= ${endYear} AND
      mg.is_archived = ${false} AND
      mg.procedure_type = ${procedure_type_id} AND
      mgc.business_unit_id IN (${collection_operation})
    GROUP BY
      mg.year
    ORDER BY mg.year
  `;

    const monthly_goal = await this.monthlyGoalsRepository.query(query);
    return monthly_goal;
  }

  isInNonUpdateRange(date: Moment, nonUpdateItemDates) {
    for (const dateRange of nonUpdateItemDates) {
      if (
        date.isSameOrAfter(dateRange.start) &&
        date.isSameOrBefore(dateRange.end)
      )
        return true;
    }
    return false;
  }

  async generateCalendarGoals(
    coEffectiveDate: Moment,
    endDate: Moment,
    monthly_goal,
    createDailyGoalsAllocationDto: CreateDailyGoalsAllocationDto,
    procedureType: ProcedureTypes,
    user: User,
    item: BusinessUnits,
    tenant: Tenant,
    nonUpdateItemDates
  ) {
    let allocated = 0;
    while (coEffectiveDate.isSameOrBefore(endDate)) {
      if (!this.isInNonUpdateRange(coEffectiveDate, nonUpdateItemDates)) {
        const monthly_value =
          monthly_goal?.[
            `${coEffectiveDate.format('MMMM').toLocaleLowerCase()}_sum`
          ];
        // console.log(
        //   `Value for month of ${coEffectiveDate.format(
        //     'MMMM'
        //   )} is ${monthly_value} for date${coEffectiveDate.format(
        //     'DD'
        //   )} and year ${coEffectiveDate.format('YYYY')}`
        // );
        const startOfMonth = moment(coEffectiveDate).startOf('month');
        const endOfMonth = moment(coEffectiveDate).endOf('month');
        const closedDatesListForMonth: ClosedDateInterface[] =
          await this.monthlyGoalsService.getClosedDatesForMonth(
            item.id,
            startOfMonth.toDate(),
            endOfMonth.toDate(),
            tenant.id
          );
        const dailyValues = await this.monthlyGoalsService.getDailyValues(
          monthly_value,
          createDailyGoalsAllocationDto,
          startOfMonth,
          endOfMonth
        );

        // console.log({ dailyValues });
        const weekday = coEffectiveDate.format('dddd');
        if (dailyValues[weekday.toLocaleLowerCase()] > 0) {
          if (
            !this.monthlyGoalsService.isClosed(
              moment(coEffectiveDate),
              closedDatesListForMonth
            )
          ) {
            const dailyGoalsCalender = new DailyGoalsCalenders();
            dailyGoalsCalender.procedure_type = procedureType;
            dailyGoalsCalender.date = coEffectiveDate.toDate();
            dailyGoalsCalender.created_by = user;
            dailyGoalsCalender.goal_amount =
              dailyValues[weekday.toLocaleLowerCase()];
            dailyGoalsCalender.collection_operation = item;
            dailyGoalsCalender.tenant_id = tenant?.id;
            await this.dailyGoalsCalenderRepository.save(dailyGoalsCalender);
            allocated += Math.round(dailyValues[weekday.toLocaleLowerCase()]);
          }
        }
        if (coEffectiveDate.isSame(endOfMonth.startOf('day'))) {
          const diffrence = allocated - monthly_value;
          await this.monthlyGoalsService.reAllocateValues(
            diffrence,
            startOfMonth,
            endOfMonth,
            item.id,
            procedureType.id,
            tenant.id
          );
          allocated = 0;
        }
      }
      coEffectiveDate.add(1, 'day');
    }
  }

  // Function to handle processing of daily goals calendar
  async processDailyGoalsCalendar(
    coEffectiveDate,
    endDate,
    item,
    monthly_goal,
    procedureType,
    tenant,
    createDailyGoalsAllocationDto,
    user
  ) {
    const dailyGoalCalenderToDelete =
      await this.dailyGoalsCalenderRepository.find({
        relations: [
          'procedure_type',
          'collection_operation',
          'created_by',
          'tenant',
        ],
        where: {
          date: Between(coEffectiveDate.toDate(), endDate.toDate()),
          collection_operation: { id: item.id },
          procedure_type: { id: procedureType.id },
          is_archived: false,
        },
      });

    const ids = [];
    const nonUpdateItemDates = [];
    for (let i = 0; i < dailyGoalCalenderToDelete.length; i++) {
      const item = dailyGoalCalenderToDelete[i];
      if (item && !item.manual_updated) {
        ids.push(item.id);
        // const calendarHistory = new DailyGoalsCalendersHistory();
        // Object.assign(calendarHistory, item);
        // calendarHistory.collection_operation = item?.collection_operation?.id;
        // calendarHistory.procedure_type = item?.procedure_type?.id;
        // calendarHistory.created_by = item?.created_by?.id;
        // calendarHistory.tenant_id = item?.tenant?.id;
        // calendarHistory.manual_updated = item?.manual_updated;
        // calendarHistory.history_reason = 'D';
        // await this.dailyGoalsCalendarService.createHistory(calendarHistory);
      } else {
        const date = moment(item.date);
        if (!this.isInNonUpdateRange(date, nonUpdateItemDates))
          nonUpdateItemDates.push({
            start: moment(item.date).startOf('month'),
            end: moment(item.date).endOf('month'),
          });
      }
    }
    // console.log({ ids });
    console.log({ nonUpdateItemDates });
    await this.dailyGoalsCalenderRepository.update(
      { id: In(ids) },
      { is_archived: true }
    );

    console.log(`Effective Date Start ${coEffectiveDate} and End ${endDate}`);

    await this.generateCalendarGoals(
      coEffectiveDate,
      endDate,
      monthly_goal,
      createDailyGoalsAllocationDto,
      procedureType,
      user,
      item,
      tenant,
      nonUpdateItemDates
    );
  }

  async removePreviousAllocation(
    original,
    updated,
    dto: UpdateDailyGoalsAllocationDto,
    collectionOperation
  ) {
    console.log('removePreviousAllocation');
    console.log(original);
    console.log(updated);
    const start = moment(original);
    const end = moment(updated);

    while (start.isBefore(end)) {
      const item: any = await this.dailyGoalsCalenderRepository.findOne({
        where: {
          date: start.toDate(),
          is_archived: false,
          procedure_type_id: dto.procedure_type_id,
          collection_operation: {
            id: collectionOperation.id,
          },
        },
        relations: [
          'created_by',
          'procedure_type',
          'collection_operation',
          'tenant',
        ],
      });
      if (item && !item.manual_updated) {
        item.is_archived = true;
        item.created_at = new Date();
        item.created_by = this.request?.user;
        await this.dailyGoalsCalenderRepository.save(item);
      }
      start.add(1, 'day');
    }
  }
}
