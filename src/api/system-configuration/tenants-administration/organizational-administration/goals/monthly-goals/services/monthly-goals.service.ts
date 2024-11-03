import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, In, Raw, Not, Between } from 'typeorm';
import {
  CreateMonthlyGoalsDto,
  UpdateMonthlyGoalsDto,
} from '../dto/create-monthly-goals.dto';
import { ErrorConstants } from '../../../../../constants/error.constants';
import { resError } from '../../../../../helpers/response';
import { User } from '../../../../user-administration/user/entity/user.entity';
import { ProcedureTypes } from '../../../products-procedures/procedure-types/entities/procedure-types.entity';
import {
  ClosedDateInterface,
  GetAllMonthlyGoalsInterface,
  getRecruitersAndDonorCenetrs,
} from '../interface/monthly-goals.interface';
import { MonthlyGoals } from '../entities/monthly-goals.entity';
import { MonthlyGoalsHistory } from '../entities/monthly-goals-history.entity';
import { OrderByConstants } from '../../../../../constants/order-by.constants';
import { BusinessUnits } from '../../../hierarchy/business-units/entities/business-units.entity';
import { Facility } from '../../../resources/facilities/entity/facility.entity';
import { Tenant } from '../../../../../platform-administration/tenant-onboarding/tenant/entities/tenant.entity';
import { HistoryService } from '../../../../../../common/services/history.service';
import { getModifiedDataDetails } from '../../../../../../../common/utils/modified_by_detail';
import { DailyGoalsAllocations } from '../../daily-goals-allocation/entities/daily-goals-allocation.entity';
import moment, { Moment } from 'moment';
import { DailyGoalsCalenders } from '../../daily-goals-calender/entity/daily-goals-calender.entity';
import { DailyGoalsCalendersHistory } from '../../daily-goals-calender/entity/daily-goals-calender-history.entity';
import { DailyGoalsCalenderService } from '../../daily-goals-calender/service/daily-goals-calender.service';
import { BusinessUnitsService } from '../../../hierarchy/business-units/services/business-units.service';
import { UserService } from 'src/api/system-configuration/tenants-administration/user-administration/user/services/user.services';
import { CloseDate } from 'src/api/system-configuration/tenants-administration/operations-administration/calendar/close-dates/entities/close-date.entity';
import { DailyGoalsCalenderFiltersInterface } from '../../daily-goals-calender/interface/daily-goals-calender.interface';
import { UpdateDailyGoalsCalendarDto } from '../../daily-goals-calender/dto/update-daily-goals-calendar.dto';
import { organizationalLevelWhere } from 'src/api/common/services/organization.service';

@Injectable()
export class MonthlyGoalsService extends HistoryService<MonthlyGoalsHistory> {
  constructor(
    @InjectRepository(ProcedureTypes)
    private readonly procedureTypesRepository: Repository<ProcedureTypes>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(MonthlyGoals)
    private readonly monthlyGoalsRepository: Repository<MonthlyGoals>,
    @InjectRepository(DailyGoalsAllocations)
    private readonly dailyGoalsAllocationRepository: Repository<DailyGoalsAllocations>,
    @InjectRepository(DailyGoalsCalenders)
    private readonly dailyGoalsCalenderRepository: Repository<DailyGoalsCalenders>,
    @InjectRepository(MonthlyGoalsHistory)
    private readonly monthlyGoalsHistoryRepository: Repository<MonthlyGoalsHistory>,
    @InjectRepository(BusinessUnits)
    private readonly businessUnitsRepository: Repository<BusinessUnits>,
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(CloseDate)
    private readonly closeDateRepository: Repository<CloseDate>,
    private readonly entityManager: EntityManager,
    private readonly dailyGoalsCalendarService: DailyGoalsCalenderService,
    private readonly usersService: UserService,
    private readonly businessUnitsService: BusinessUnitsService
  ) {
    super(monthlyGoalsHistoryRepository);
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

  /**
   * Calculate limit and skip
   * @param limit
   * @param page
   * @returns {skip, take}
   */
  pagination(limit: number, page: number) {
    page = page <= 0 ? 1 : page;
    const take: any = limit;
    const skip: any = (page - 1) * limit;

    return { skip, take };
  }

  /**
   * create new monthly goals
   * @param createMonthlyGoalsDto
   * @returns
   */
  async create(createMonthlyGoalsDto: CreateMonthlyGoalsDto) {
    try {
      const user = await this.entityExist(
        this.userRepository,
        { where: { id: createMonthlyGoalsDto?.created_by } },
        'User'
      );
      const recruiter = createMonthlyGoalsDto?.recruiter
        ? await this.entityExist(
            this.userRepository,
            { where: { id: createMonthlyGoalsDto?.recruiter } },
            'Recruiter'
          )
        : null;

      await this.entityExist(
        this.procedureTypesRepository,
        {
          where: {
            id: createMonthlyGoalsDto?.procedure_type,
            is_archive: false,
          },
        },
        'Procedure Types'
      );

      const businessUnits: any = await this.businessUnitsRepository.findBy({
        id: In(createMonthlyGoalsDto.collection_operation),
      });
      if (
        businessUnits &&
        businessUnits.length < createMonthlyGoalsDto.collection_operation.length
      ) {
        resError(
          `Some Collection Operations not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }
      const createMonthlyGoals = new MonthlyGoals();
      const keys = Object.keys(createMonthlyGoalsDto);

      const tenant = await this.entityExist(
        this.tenantRepository,
        {
          where: {
            id: createMonthlyGoalsDto?.tenant_id,
          },
        },
        'Tenant'
      );

      for (const key of keys) {
        createMonthlyGoals[key] = createMonthlyGoalsDto?.[key];
      }
      createMonthlyGoals.created_by = user;
      createMonthlyGoals.collection_operation = businessUnits;
      createMonthlyGoals.tenant_id = tenant?.id;
      createMonthlyGoals.recruiter = recruiter;
      // Save the Monthly Goals entity
      const savedMonthlyGoals = await this.monthlyGoalsRepository.save(
        createMonthlyGoals
      );

      for (let i = 0; i < businessUnits.length; i++) {
        const item = businessUnits[i];

        const dailyAllocation = await this.getDailyAllocationsList(
          createMonthlyGoalsDto
        );
        for (let i = 0; i < dailyAllocation.length; i++) {
          const allocation = dailyAllocation[i];
          // console.log(allocation);
          const nextAllocation = dailyAllocation[i + 1];
          const startOfAllocation = moment(allocation.effective_date).startOf(
            'month'
          );
          const endOfAllocation = nextAllocation
            ? moment(nextAllocation.effective_date).subtract(1, 'day')
            : moment(allocation.effective_date).endOf('year');

          const dailyGoalCalenderToDelete =
            await this.dailyGoalsCalenderRepository.find({
              relations: [
                'procedure_type',
                'collection_operation',
                'created_by',
                'tenant',
              ],
              where: {
                date: Between(
                  startOfAllocation.toDate(),
                  endOfAllocation.toDate()
                ),
                collection_operation: { id: item.id },
                procedure_type: { id: createMonthlyGoalsDto.procedure_type },
                is_archived: false,
              },
            });

          const ids = [];
          for (let i = 0; i < dailyGoalCalenderToDelete.length; i++) {
            const item = dailyGoalCalenderToDelete[i];
            ids.push(item.id);
          }
          await this.dailyGoalsCalenderRepository.update(
            { id: In(ids) },
            { is_archived: true }
          );

          const allMonthlyGoals = await this.getAllMonthlyGoalsForYear(
            createMonthlyGoalsDto.year,
            createMonthlyGoalsDto.procedure_type,
            createMonthlyGoalsDto.collection_operation
          );
          // console.log(allMonthlyGoals);
          // console.log({ startOfAllocation, endOfAllocation, allocation });
          let allocated = 0;
          while (startOfAllocation.isSameOrBefore(endOfAllocation)) {
            const startOfMonth = moment(startOfAllocation).startOf('month');
            const endOfMonth = moment(startOfAllocation).endOf('month');
            const monthly_value =
              allMonthlyGoals?.[0]?.[
                moment(startOfMonth).format('MMMM').toLowerCase()
              ];
            const closedDatesListForMonth: ClosedDateInterface[] =
              await this.getClosedDatesForMonth(
                createMonthlyGoalsDto.collection_operation?.[0],
                startOfMonth.toDate(),
                endOfMonth.toDate(),
                createMonthlyGoalsDto.tenant_id
              );
            // console.log({ closedDatesListForMonth });
            const dailyValues = await this.getDailyValues(
              monthly_value,
              allocation,
              startOfMonth,
              endOfMonth
            );
            // console.log({ dailyValues });
            const weekday = startOfAllocation.format('dddd');

            if (dailyValues[weekday.toLocaleLowerCase()] > 0) {
              if (
                !this.isClosed(
                  moment(startOfAllocation),
                  closedDatesListForMonth
                )
              ) {
                const dailyGoalsCalender = new DailyGoalsCalenders();
                dailyGoalsCalender.procedure_type_id =
                  createMonthlyGoalsDto.procedure_type;
                dailyGoalsCalender.date = startOfAllocation.toDate();
                dailyGoalsCalender.created_by = user;
                dailyGoalsCalender.goal_amount =
                  dailyValues[weekday.toLocaleLowerCase()];
                dailyGoalsCalender.collection_operation = item;
                dailyGoalsCalender.tenant_id = tenant?.id;
                await this.entityManager.save(dailyGoalsCalender);
                allocated += Math.round(
                  dailyValues[weekday.toLocaleLowerCase()]
                );
              }
            }
            if (startOfAllocation.isSame(endOfMonth.startOf('day'))) {
              const diffrence = allocated - monthly_value;
              await this.reAllocateValues(
                diffrence,
                startOfMonth,
                endOfMonth,
                item.id,
                createMonthlyGoalsDto.procedure_type,
                createMonthlyGoalsDto.tenant_id
              );
              allocated = 0;
            }
            startOfAllocation.add(1, 'day');
          }
        }
      }

      return {
        status: HttpStatus.CREATED,
        message: 'Monthly Goals Created Successfully',
        data: savedMonthlyGoals,
      };
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
    }
  }

  async reAllocateValues(
    diffrence,
    startOfMonth: Moment,
    endOfMonth: Moment,
    collection_operation_id,
    procedure_type,
    tenant_id
  ) {
    if (diffrence !== 0) {
      console.log(
        `There is diffrence that needs to be readjusted ${diffrence} for month ${startOfMonth} to ${endOfMonth}`
      );
      const findParams = new DailyGoalsCalenderFiltersInterface();
      findParams.collection_operation = collection_operation_id;
      findParams.month = moment(startOfMonth).month();
      findParams.procedure_type = procedure_type;
      findParams.year = moment(startOfMonth).year();
      findParams.tenant_id = tenant_id;
      const allDaysValues = await this.dailyGoalsCalendarService.findForMonth(
        findParams
      );
      const allocatedDaysData = {};
      allDaysValues?.data?.map((item) => {
        const key = new Date(item.date).getDate().toString();
        allocatedDaysData[key] = Math.round(item.goal_amount);
      });
      const redistributionDto = new UpdateDailyGoalsCalendarDto();
      redistributionDto.allocatedDiffrenceOver = 'month';
      redistributionDto.collectionOperation = collection_operation_id;
      redistributionDto.daysValues = { ...allocatedDaysData };
      redistributionDto.diffrence = diffrence;
      redistributionDto.isLocked = false;
      redistributionDto.month = moment(startOfMonth).month();
      redistributionDto.procedureType = procedure_type;
      redistributionDto.tenant_id = tenant_id;
      redistributionDto.year = moment(startOfMonth).year();
      const { data: redistributedValues } =
        await this.dailyGoalsCalendarService.getRedistributedValues(
          redistributionDto
        );
      // console.log('allocatedDaysData', allocatedDaysData);
      // console.log('Redistributed', redistributedValues);
      let payloadDays = allocatedDaysData;
      Object.keys(allocatedDaysData).forEach((key) => {
        payloadDays = {
          ...payloadDays,
          [key]:
            allocatedDaysData[key] +
            (allocatedDaysData[key] - redistributedValues[key]),
        };
      });
      // console.log({ payloadDays });
      redistributionDto.daysValues = payloadDays;
      await this.dailyGoalsCalendarService.update(redistributionDto);
    }
  }

  async getAllMonthlyGoalsForYear(
    year: number,
    procedure_type_id: bigint,
    collection_operation: number[]
  ) {
    // console.log({ year, procedure_type_id, collection_operation });
    const query = `
    SELECT 
      mg.year,
      SUM(mg.january) AS january,
      SUM(mg.february) AS february,
      SUM(mg.march) AS march,
      SUM(mg.april) AS april,
      SUM(mg.may) AS may,
      SUM(mg.june) AS june,
      SUM(mg.july) AS july,
      SUM(mg.august) AS august,
      SUM(mg.september) AS september,
      SUM(mg.october) AS october,
      SUM(mg.november) AS november,
      SUM(mg.december) AS december,
      SUM(mg.total_goal) AS total_goal
    FROM 
      monthly_goals mg
    LEFT JOIN 
      monthly_goals_collection_operations mgc ON mgc.monthly_goals_id = mg.id
    WHERE
      mg.year = ${year} AND
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

  async getDailyAllocationsList(
    createMonthlyGoalsDto: CreateMonthlyGoalsDto | UpdateMonthlyGoalsDto
  ) {
    const collection_operation = Array.isArray(
      createMonthlyGoalsDto.collection_operation
    )
      ? createMonthlyGoalsDto.collection_operation
      : [createMonthlyGoalsDto.collection_operation];

    const dailyAllocationQuery = `
    SELECT *
    FROM daily_goals_allocations dga
    JOIN daily_goals_collection_operations bg2 ON bg2.daily_goals_allocation_id = dga.id
    WHERE dga.year = '${createMonthlyGoalsDto.year}'
    AND dga.procedure_type_id = ${createMonthlyGoalsDto.procedure_type}
    AND dga.is_archived = false
    AND dga.tenant_id = ${createMonthlyGoalsDto.tenant_id}
    AND bg2.business_unit_id IN (
      SELECT id
      FROM business_units
      WHERE id In(${collection_operation})
    )
  `;
    const dailyAllocation = await this.entityManager.query(
      dailyAllocationQuery
    );
    // console.log(dailyAllocation, '--------1------');
    if (dailyAllocation.length > 0) {
      // console.log(
      //   '--------- Check if first Allocation is not start of the year --------------'
      // );
      const effectiveDateOfAllocation = moment(
        dailyAllocation?.[0].effective_date
      );
      const startOfYearOfEffectiveDateOfAllocation = moment(
        dailyAllocation?.[0].effective_date
      ).startOf('year');
      if (
        effectiveDateOfAllocation.isAfter(
          startOfYearOfEffectiveDateOfAllocation
        )
      ) {
        // console.log(
        //   '----- The allocation is after the start of the year so fetch previous effective date ----'
        // );
        // console.log(effectiveDateOfAllocation.format('YYYY-MM-DD'));
        const allocationQuery = `
        SELECT *
        FROM daily_goals_allocations dga
        JOIN daily_goals_collection_operations bg2 ON bg2.daily_goals_allocation_id = dga.id
        WHERE dga.effective_date < '${effectiveDateOfAllocation.format(
          'YYYY-MM-DD'
        )}'
        AND dga.procedure_type_id = ${createMonthlyGoalsDto.procedure_type}
        AND dga.is_archived = false
        AND dga.tenant_id = ${createMonthlyGoalsDto.tenant_id}
        AND bg2.business_unit_id IN (
          SELECT id
          FROM business_units
          WHERE id In(${collection_operation})
        )
      `;
        const previousDailyAllocation = await this.entityManager.query(
          allocationQuery
        );
        // console.log(previousDailyAllocation, '--------2------');
        dailyAllocation.unshift({
          ...previousDailyAllocation?.[0],
          effective_date: startOfYearOfEffectiveDateOfAllocation,
        });
      }
    } else if (dailyAllocation.length == 0) {
      // console.log('Get the previous allocations for this goal');
      const effectiveDate = moment(new Date(createMonthlyGoalsDto.year, 0, 1));
      // console.log(effectiveDate.format('YYYY-MM-DD'));
      const previousDailyAllocation = await this.dailyGoalsAllocationRepository
        .createQueryBuilder('dailyGoalsAllocation')
        .leftJoinAndSelect(
          'dailyGoalsAllocation.collection_operation',
          'collectionOperation'
        )
        .leftJoinAndSelect(
          'dailyGoalsAllocation.procedure_type',
          'procedure_type'
        )
        .where(`collectionOperation.id IN (${collection_operation.join(',')})`)
        .andWhere(
          `dailyGoalsAllocation.is_archived = false AND procedure_type.id =${createMonthlyGoalsDto.procedure_type}`
        )
        .andWhere(
          `dailyGoalsAllocation.tenant_id = ${createMonthlyGoalsDto.tenant_id} AND year < ${createMonthlyGoalsDto.year}`
        )
        .orderBy('year', 'DESC')
        .addOrderBy('month', 'DESC')
        .getOne();
      // console.log(previousDailyAllocation, '--------3------');
      dailyAllocation.unshift({
        ...previousDailyAllocation,
        effective_date: effectiveDate,
      });
    }
    return dailyAllocation;
  }
  /**
   * get all monthly goals records
   * @param getAllMonthlyGoalsInterface
   * @returns {monthlyGoals}
   */
  async findAll(getAllMonthlyGoalsInterface: GetAllMonthlyGoalsInterface) {
    try {
      const {
        limit = parseInt(process.env.PAGE_SIZE),
        page = 1,
        childSortBy,
        year,
        procedureType,
        organizational_levels,
        tenant_id,
      } = getAllMonthlyGoalsInterface;
      let { sortBy } = getAllMonthlyGoalsInterface;
      const { sortOrder = OrderByConstants.DESC } = getAllMonthlyGoalsInterface;
      const { skip, take } = this.pagination(limit, page);
      let addSortBy = null;
      let addSortBy2 = null;

      switch (sortBy) {
        case 'procedure_type':
          sortBy = `procedure_type.${childSortBy}}`;
          break;
        case 'collection_operation':
          sortBy = `collection_operation.${childSortBy}}`;
          break;
        case 'year':
          sortBy = `monthly_goals.year`;
          break;
        case 'owner':
          sortBy = `donor_center.${childSortBy}}`;
          addSortBy = `recruiter.first_name`;
          addSortBy2 = `recruiter.last_name`;
          break;
        case 'total_goal':
          sortBy = `monthly_goals.total_goal`;
          break;
        default:
          sortBy = `monthly_goals.id`;
          break;
      }

      const query = this.monthlyGoalsRepository
        .createQueryBuilder('monthly_goals')
        .leftJoinAndSelect('monthly_goals.donor_center', 'donor_center')
        .leftJoinAndSelect(
          'monthly_goals.collection_operation',
          'collection_operation'
        )
        .leftJoinAndSelect('monthly_goals.procedure_type', 'procedure_type')
        .leftJoinAndSelect('monthly_goals.recruiter', 'recruiter')
        .leftJoinAndSelect('monthly_goals.created_by', 'created_by')
        .where(`monthly_goals.is_archived = false`)
        .andWhere(`monthly_goals.tenant.id = ${tenant_id}`);

      if (year && year > 0) {
        query.andWhere(`year = ${year}`);
      }

      if (procedureType) {
        query.andWhere(`procedure_type.id = ${procedureType}`);
      }

      if (organizational_levels) {
        query.andWhere(
          organizationalLevelWhere(
            organizational_levels,
            'collection_operation.id',
            'recruiter.id',
            'donor_center.id'
          )
        );
      }

      query
        .skip(skip)
        .take(take)
        .orderBy(
          sortBy,
          sortOrder == 'ASC' ? OrderByConstants.ASC : OrderByConstants.DESC
        );

      if (addSortBy2) {
        query.addOrderBy(
          addSortBy,
          sortOrder == 'ASC' ? OrderByConstants.ASC : OrderByConstants.DESC
        );
        query.addOrderBy(
          addSortBy2,
          sortOrder == 'ASC' ? OrderByConstants.ASC : OrderByConstants.DESC
        );
      }

      const [data, count] = await query.getManyAndCount();

      return {
        status: HttpStatus.OK,
        message: 'Monthly Goals Fetched Successfully',
        count: count,
        data: data,
      };
    } catch (error) {
      console.log(error);
      return resError(
        `Internal Server Error`,
        ErrorConstants.Error,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   *
   * @param id
   * @returns {monthlyGoals}
   */
  async findOne(id: any) {
    const message = 'Monthly Goals';
    const query = {
      relations: [
        'donor_center',
        'collection_operation',
        'procedure_type',
        'recruiter',
        'created_by',
        'tenant',
      ],
      where: {
        id,
        is_archived: false,
      },
    };
    const monthlyGoals: any = await this.entityExist(
      this.monthlyGoalsRepository,
      query,
      message
    );

    if (monthlyGoals) {
      const modifiedData: any = await getModifiedDataDetails(
        this.monthlyGoalsHistoryRepository,
        id,
        this.userRepository
      );
      const modified_at = modifiedData?.created_at;
      const modified_by = modifiedData?.created_by;
      monthlyGoals.modified_by = monthlyGoals.created_by;
      monthlyGoals.modified_at = monthlyGoals.created_at;
      monthlyGoals.created_at = modified_at
        ? modified_at
        : monthlyGoals.created_at;
      monthlyGoals.created_by = modified_by
        ? modified_by
        : monthlyGoals.created_by;
    }
    return {
      status: HttpStatus.OK,
      message: `${message} Fetched Successfully`,
      data: { ...monthlyGoals },
    };
  }

  /**
   * update record
   * insert data in history table
   * @param id
   * @param updateMonthlyGoalsDto
   * @returns
   */
  async update(id: any, updateMonthlyGoalsDto: UpdateMonthlyGoalsDto) {
    try {
      const query = {
        relations: [
          'donor_center',
          'recruiter',
          'collection_operation',
          'procedure_type',
          'created_by',
          'tenant',
        ],
        where: {
          id,
          is_archived: false,
        },
      };
      const monthlyGoals: any = await this.entityExist(
        this.monthlyGoalsRepository,
        query,
        'Monthly Goals'
      );

      const tenant = await this.entityExist(
        this.tenantRepository,
        {
          where: {
            id: updateMonthlyGoalsDto?.tenant_id,
          },
        },
        'Tenant'
      );

      const recruiter = updateMonthlyGoalsDto?.recruiter
        ? await this.entityExist(
            this.userRepository,
            { where: { id: updateMonthlyGoalsDto?.recruiter } },
            'Recruiter'
          )
        : null;

      const user = await this.entityExist(
        this.userRepository,
        { where: { id: updateMonthlyGoalsDto?.created_by } },
        'User'
      );
      const procedure_type = await this.entityExist(
        this.procedureTypesRepository,
        {
          where: {
            id: updateMonthlyGoalsDto?.procedure_type,
            is_archive: false,
          },
        },
        'Procedure Types'
      );
      const businessUnits: any = await this.businessUnitsRepository.findBy({
        id: In(updateMonthlyGoalsDto.collection_operation),
      });
      if (
        businessUnits &&
        businessUnits.length < updateMonthlyGoalsDto.collection_operation.length
      ) {
        resError(
          `Some Collection Operations not found.`,
          ErrorConstants.Error,
          HttpStatus.NOT_FOUND
        );
      }

      Object.assign(monthlyGoals, updateMonthlyGoalsDto);
      monthlyGoals.recruiter = recruiter || null;
      monthlyGoals.collection_operation = businessUnits;
      monthlyGoals.procedure_type = procedure_type;
      monthlyGoals.created_by = user;
      monthlyGoals.donor_center = monthlyGoals?.donor_center || null;
      monthlyGoals.created_at = new Date();
      monthlyGoals.tenant_id = user?.tenant_id;
      await this.monthlyGoalsRepository.save(monthlyGoals);

      for (let i = 0; i < businessUnits.length; i++) {
        const item = businessUnits[i];

        const dailyAllocation = await this.getDailyAllocationsList(
          updateMonthlyGoalsDto
        );
        // console.log('Edit', { dailyAllocation });
        for (let i = 0; i < dailyAllocation.length; i++) {
          const allocation = dailyAllocation[i];
          const nextAllocation = dailyAllocation[i + 1];
          const startOfAllocation = moment(allocation.effective_date).startOf(
            'month'
          );
          const endOfAllocation = nextAllocation
            ? moment(nextAllocation.effective_date).endOf('month')
            : moment(allocation.effective_date).endOf('year');

          const dailyGoalCalenderToDelete =
            await this.dailyGoalsCalenderRepository.find({
              relations: [
                'procedure_type',
                'collection_operation',
                'created_by',
                'tenant',
              ],
              where: {
                date: Between(
                  startOfAllocation.toDate(),
                  endOfAllocation.toDate()
                ),
                collection_operation: { id: item.id },
                procedure_type: { id: updateMonthlyGoalsDto.procedure_type },
                is_archived: false,
              },
            });

          const ids = [];
          for (let i = 0; i < dailyGoalCalenderToDelete.length; i++) {
            const item = dailyGoalCalenderToDelete[i];
            ids.push(item.id);
          }
          await this.dailyGoalsCalenderRepository.update(
            { id: In(ids) },
            { is_archived: true }
          );

          const allMonthlyGoals = await this.getAllMonthlyGoalsForYear(
            updateMonthlyGoalsDto.year,
            updateMonthlyGoalsDto.procedure_type,
            updateMonthlyGoalsDto.collection_operation
          );
          let allocated = 0;
          while (startOfAllocation.isSameOrBefore(endOfAllocation)) {
            const startOfMonth = moment(startOfAllocation).startOf('month');
            const endOfMonth = moment(startOfAllocation).endOf('month');
            const monthly_value =
              allMonthlyGoals?.[0]?.[
                moment(startOfMonth).format('MMMM').toLowerCase()
              ];
            const closedDatesListForMonth: ClosedDateInterface[] =
              await this.getClosedDatesForMonth(
                updateMonthlyGoalsDto.collection_operation?.[0],
                startOfMonth.format('YYYY-MM-DD'),
                endOfMonth.format('YYYY-MM-DD'),
                updateMonthlyGoalsDto.tenant_id
              );
            console.log(closedDatesListForMonth);
            const dailyValues = await this.getDailyValues(
              monthly_value,
              allocation,
              startOfMonth,
              endOfMonth
            );
            const weekday = startOfAllocation.format('dddd');
            if (dailyValues[weekday.toLocaleLowerCase()] > 0) {
              if (
                !this.isClosed(
                  moment(startOfAllocation),
                  closedDatesListForMonth
                )
              ) {
                const dailyGoalsCalender = new DailyGoalsCalenders();
                dailyGoalsCalender.procedure_type_id =
                  updateMonthlyGoalsDto.procedure_type;
                dailyGoalsCalender.date = startOfAllocation.toDate();
                dailyGoalsCalender.created_by = user;
                dailyGoalsCalender.goal_amount =
                  dailyValues[weekday.toLocaleLowerCase()];
                dailyGoalsCalender.collection_operation = item;
                dailyGoalsCalender.tenant_id = tenant?.id;
                await this.entityManager.save(dailyGoalsCalender);
                allocated += Math.round(
                  dailyValues[weekday.toLocaleLowerCase()]
                );
              }
            }
            if (startOfAllocation.isSame(endOfMonth.startOf('day'))) {
              const diffrence = allocated - monthly_value;
              await this.reAllocateValues(
                diffrence,
                startOfMonth,
                endOfMonth,
                item.id,
                updateMonthlyGoalsDto.procedure_type,
                updateMonthlyGoalsDto.tenant_id
              );
              allocated = 0;
            }
            startOfAllocation.add(1, 'day');
          }
        }
      }

      return {
        status: HttpStatus.NO_CONTENT,
        message: 'Monthly Goals Updated Successfully',
        data: monthlyGoals,
      };
    } catch (error) {
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  /**
   *
   * @param id
   * @returns
   */
  async archive(id: any, user: any) {
    try {
      const query = {
        relations: [
          'donor_center',
          'collection_operation',
          'procedure_type',
          'created_by',
          'recruiter',
          'tenant',
        ],
        where: {
          id,
          is_archived: false,
        },
      };
      const { is_archived, ...monthlyGoals }: any = await this.entityExist(
        this.monthlyGoalsRepository,
        query,
        'Monthly Goals'
      );
      monthlyGoals['is_archived'] = !is_archived;
      monthlyGoals['created_at'] = new Date();
      monthlyGoals['created_by'] = user;
      monthlyGoals['tenant_id'] = user?.tenant?.id;
      const updatedMonthlyGoals = await this.monthlyGoalsRepository.save(
        monthlyGoals
      );

      return {
        status: HttpStatus.NO_CONTENT,
        message: 'Monthly Goals Archive Successfully',
        data: null,
      };
    } catch (error) {
      console.log({ error });
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getRecruitersAndDonorCenetrs(
    user,
    collectionOperations: getRecruitersAndDonorCenetrs
  ) {
    try {
      const { collectionOperation, procedure_type, year, tenant_id } =
        collectionOperations;

      const collectionOperationHeirarchy =
        await this.businessUnitsService.getUserCollectionOperations(
          user,
          user?.id
        );
      const collectionOperationHeirarchyIds = collectionOperationHeirarchy?.data
        ?.map((item) => {
          return item?.id;
        })
        .filter(Boolean);

      const existingGoals = await this.monthlyGoalsRepository.find({
        where: {
          collection_operation: {
            id: collectionOperation,
          },
          procedure_type: {
            id: procedure_type,
          },
          year: year,
          is_archived: false,
        },
        relations: ['recruiter', 'donor_center', 'tenant'],
      });

      const recruiterIds =
        existingGoals
          ?.map((item) => item?.recruiter?.id)
          .filter((item) => item !== undefined) || [];

      const donorCenterIds =
        existingGoals
          ?.map((item) => item?.donor_center?.id)
          .filter((item) => item !== undefined) || [];

      if (!collectionOperation) {
        resError(
          `Collection operation id missing.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const donorCenter = await this.facilityRepository.find({
        where: {
          tenant: { id: tenant_id },
          status: true,
          donor_center: true,
          is_archived: false,
          id: Not(In(donorCenterIds)),
          collection_operation: { id: collectionOperation },
        },
      });
      const recruiters = await this.getBusinessUnitRecruiters(
        user,
        collectionOperation,
        recruiterIds
      );
      return {
        status: HttpStatus.OK,
        message: 'Recruiters and Donor Centers found Successfully',
        data: {
          recruiters: recruiters,
          donorCenter: donorCenter,
          tenant_id: user?.tenant?.id,
        },
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async getBusinessUnitRecruiters(user = null, id = null, notInclude = []) {
    const userData: any = await this.userRepository.findOne({
      where: {
        id: user?.id,
      },
      relations: [
        'role',
        'tenant',
        'assigned_manager',
        'business_units',
        'business_units.business_unit_id',
        'hierarchy_level',
      ],
    });
    const where: any = { is_archived: false, is_active: true };
    const userBusinessUnitIds = userData?.business_units?.map(
      (bu) => bu.business_unit_id.id
    );

    let businessUnitId = id && id !== 'undefined' ? id : null;
    let businessUnitIds: any = [];

    if (businessUnitId) {
      businessUnitIds.push(businessUnitId);

      while (true) {
        const businessUnitData = await this.businessUnitsRepository.findOne({
          where: {
            ...where,
            tenant: { id: userData?.tenant?.id },
            id: businessUnitId,
          },
          relations: ['parent_level', 'tenant', 'organizational_level_id'],
        });
        if (businessUnitData && businessUnitData?.parent_level) {
          if (
            businessUnitData?.parent_level?.id !== userData?.business_unit?.id
          ) {
            businessUnitId = businessUnitData?.parent_level?.id;
            businessUnitIds.push(businessUnitId);
          } else {
            businessUnitIds.push(businessUnitData?.parent_level?.id);
            break;
          }
        } else {
          break;
        }
      }
    } else if (userBusinessUnitIds.length) {
      let parentBusinessUnits = userBusinessUnitIds;
      businessUnitIds = userBusinessUnitIds;

      while (true) {
        const businessUnitData = await this.businessUnitsRepository.find({
          where: {
            ...where,
            tenant: { id: userData?.tenant?.id },
            parent_level: In(parentBusinessUnits),
          },
          relations: ['parent_level', 'tenant', 'organizational_level_id'],
        });
        const businessUnitMappedIds = businessUnitData.map(
          (businessUnit) => businessUnit.id
        );
        if (
          businessUnitData.length &&
          !businessUnitMappedIds.some((bu) => businessUnitIds.includes(bu))
        ) {
          businessUnitIds = businessUnitIds.concat(businessUnitMappedIds);
          const collectionOperations = businessUnitData.map(
            (businessUnit) =>
              businessUnit.organizational_level_id.is_collection_operation
          );
          if (collectionOperations.includes(true)) {
            break;
          } else {
            parentBusinessUnits = businessUnitIds;
          }
        } else {
          break;
        }
      }
    }

    const recruiters: any = await this.userRepository.find({
      where: {
        ...where,
        id: Not(In(notInclude)),
        role: { is_recruiter: true },
        tenant: { id: userData?.tenant?.id },
        business_units: {
          business_unit_id: {
            id: In(businessUnitIds),
          },
        },
      },
      relations: [
        'role',
        'tenant',
        'assigned_manager',
        'business_units',
        'business_units.business_unit_id',
        'hierarchy_level',
      ],
    });
    return recruiters;
  }

  getNumberOfDaysBetweenDates = (currentDate, endDate, day) => {
    let numberOfDays = 0;
    while (currentDate <= endDate) {
      if (currentDate.getDay() === day) {
        numberOfDays += 1;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return numberOfDays;
  };

  isClosed = (
    currentDate: Moment,
    closedDatesListForMonth: ClosedDateInterface[]
  ) => {
    for (const element of closedDatesListForMonth) {
      if (
        currentDate.isSameOrAfter(element.start) &&
        currentDate.isSameOrBefore(element.end)
      )
        return true;
    }
    return false;
  };

  getClosedDatesForMonth = async (
    collection_operation_id,
    startDate,
    endDate,
    tenant_id
  ) => {
    const closedDates = await this.closeDateRepository
      .createQueryBuilder('closed_dates')
      .leftJoinAndSelect(
        'closed_dates.close_date_collection_operations',
        'close_date_collection_operations'
      )
      .where(
        `closed_dates.is_archived = false AND closed_dates.tenant_id = ${tenant_id}`
      )
      .andWhere(
        'close_date_collection_operations.collection_operation_id = :collection_operation_id',
        {
          collection_operation_id,
        }
      )
      .andWhere(
        '((closed_dates.start_date <= :endDate AND closed_dates.end_date >= :startDate) OR ' +
          '(closed_dates.start_date >= :startDate AND closed_dates.end_date <= :endDate))',
        {
          startDate,
          endDate,
        }
      )
      .getMany();

    return closedDates?.map((item) => {
      return {
        start: moment(item.start_date),
        end: moment(item.end_date),
      };
    });
  };

  getDailyValues = async (
    monthly_value,
    allocation,
    startOfMonth: Moment,
    endOfMonth: Moment
  ) => {
    return {
      sunday:
        (monthly_value * (allocation.sunday / 100)) /
        this.getNumberOfDaysBetweenDates(
          startOfMonth.toDate(),
          endOfMonth.toDate(),
          0
        ),
      monday:
        (monthly_value * (allocation.monday / 100)) /
        this.getNumberOfDaysBetweenDates(
          startOfMonth.toDate(),
          endOfMonth.toDate(),
          1
        ),
      tuesday:
        (monthly_value * (allocation.tuesday / 100)) /
        this.getNumberOfDaysBetweenDates(
          startOfMonth.toDate(),
          endOfMonth.toDate(),
          2
        ),
      wednesday:
        (monthly_value * (allocation.wednesday / 100)) /
        this.getNumberOfDaysBetweenDates(
          startOfMonth.toDate(),
          endOfMonth.toDate(),
          3
        ),
      thursday:
        (monthly_value * (allocation.thursday / 100)) /
        this.getNumberOfDaysBetweenDates(
          startOfMonth.toDate(),
          endOfMonth.toDate(),
          4
        ),
      friday:
        (monthly_value * (allocation.friday / 100)) /
        this.getNumberOfDaysBetweenDates(
          startOfMonth.toDate(),
          endOfMonth.toDate(),
          5
        ),
      saturday:
        (monthly_value * (allocation.saturday / 100)) /
        this.getNumberOfDaysBetweenDates(
          startOfMonth.toDate(),
          endOfMonth.toDate(),
          6
        ),
    };
  };
}
