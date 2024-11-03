import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import { UserRequest } from 'src/common/interface/request';
import { KeyPerformanceIndicatorsFilter } from '../filters/filter-kpi';
import { PromotionsFilter } from '../filters/filter-promotions';
import { DriveScheduleFilter } from '../filters/filter-drive-schedule';
import { ForecastFilter } from '../filters/filter-forecast';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Equal, In, LessThan, MoreThan, Repository } from 'typeorm';
import { Drives } from '../../operations/drives/entities/drives.entity';
import { Sessions } from '../../operations/sessions/entities/sessions.entity';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { KeyPerformanceIndicatorsDto } from '../dto/key-performance-indicators.dto';
import { organizationalLevelWhere } from 'src/api/common/services/organization.service';
import { MonthlyGoals } from 'src/api/system-configuration/tenants-administration/organizational-administration/goals/monthly-goals/entities/monthly-goals.entity';
import { Shifts } from 'src/api/shifts/entities/shifts.entity';
import { DonorDonations } from 'src/api/crm/contacts/donor/donorDonationHistory/entities/donor-donations.entity';
import { DurationEnum } from '../enums/duration.enum';
import { PerformanceEnum } from '../enums/performance.enum';
import { PromotionEntity } from 'src/api/system-configuration/tenants-administration/operations-administration/marketing-equipment/promotions/entity/promotions.entity';
import { UpcomingPromotionsDto } from '../dto/upcoming-promotions.dto';
import { toLower } from 'lodash';
import { BookingRules } from 'src/api/system-configuration/tenants-administration/operations-administration/booking-drives/booking-rules/entities/booking-rules.entity';

@Injectable()
export class OperationDashboardService {
  constructor(
    @InjectRepository(Drives)
    private readonly drivesRepository: Repository<Drives>,
    @InjectRepository(Sessions)
    private readonly sessionsRepository: Repository<Sessions>,
    @InjectRepository(MonthlyGoals)
    private readonly monthlyGoalsRepository: Repository<MonthlyGoals>,
    @InjectRepository(Shifts)
    private readonly shiftsRepository: Repository<Shifts>,
    @InjectRepository(DonorDonations)
    private readonly donorDonationsRepository: Repository<DonorDonations>,
    @InjectRepository(PromotionEntity)
    private readonly promotionEntityRepository: Repository<PromotionEntity>,
    @InjectRepository(BookingRules)
    private readonly bookingRulesRepository: Repository<BookingRules>
  ) {}

  public async fetchKeyPerformanceIndicators(
    filter: KeyPerformanceIndicatorsFilter,
    req: UserRequest
  ) {
    try {
      this.HandleValidationForKPI(filter, req);

      const drives = await this.GetOperations(
        filter,
        req.user.tenant_id,
        'drives'
      );
      const driveIds = drives.map((x: any) => x.id) ?? [];

      const sessions = await this.GetOperations(
        filter,
        req.user.tenant_id,
        'sessions'
      );
      const sessionIds = sessions.map((x: any) => x.id) ?? [];

      const goal = await this.GetGoals(filter, req.user.tenant_id);

      const bookingRulesDefaultsExist = filter.view_as
        ? null
        : await this.bookingRulesRepository.findOne({
            where: {
              tenant_id: req.user.tenant_id,
            },
          });

      const scheduled = await this.GetScheduled(
        filter,
        req.user.tenant_id,
        driveIds,
        sessionIds,
        bookingRulesDefaultsExist
      );

      const actual = await this.GetActual(
        filter,
        req.user.tenant_id,
        driveIds,
        sessionIds
      );

      const oef = await this.GetOef(
        filter,
        req.user.tenant_id,
        driveIds,
        sessionIds,
        bookingRulesDefaultsExist
      );

      const ratePanel = await this.GetRatePanelValues(
        req.user.tenant_id,
        driveIds,
        sessionIds
      );

      const available_slots = await this.GetSlotsAvailable(
        req.user.tenant_id,
        driveIds,
        sessionIds
      );

      const response: KeyPerformanceIndicatorsDto = {
        drives: drives.length,
        sessions: sessions.length,
        goal: goal,
        scheduled: scheduled,
        actual: actual,
        oef: oef,
        total_donors: ratePanel.total_donors,
        deferrals: ratePanel.deferrals,
        qns: ratePanel.qns,
        walkout: ratePanel.walkout,
        first_time_donor: ratePanel.first_time_donors,
        total_appointments: ratePanel.total_appointments,
        slots_available: available_slots,
        tenant_id: req.user.tenant_id,
      };

      return resSuccess(
        `Operation Center Dashboard - Key Performance Indicators fetched successfully.`,
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        response
      );
    } catch (exception) {
      return resError(
        exception.message,
        ErrorConstants.Error,
        exception.status
      );
    }
  }

  private async GetRatePanelValues(
    tenantId: number,
    driveIds: [],
    sessionIds: []
  ): Promise<any> {
    const commonWhereProps = {
      is_archived: false,
      tenant_id: tenantId,
    };

    const query = this.shiftsRepository
      .createQueryBuilder('s')
      .innerJoin(
        'donation_summary',
        'ds',
        's.shiftable_id = ds.operation_id and s.shiftable_type = ds.operationable_type and s.id = ds.shift_id'
      )
      .select([
        `CAST(SUM(ds.deferrals) as int) as deferrals`,
        `CAST(SUM(ds.qns) as int) as qns`,
        `CAST(SUM(ds.walkout) as int) as walkout`,
        `CAST(SUM(ds.total_appointments) as int) as total_appointments`,
        `CAST(SUM(ds.ftd) as int) as first_time_donors`,
        `CAST(SUM(ds.registered) as int) as total_donors`,
      ])
      .where(commonWhereProps)
      .andWhere({
        shiftable_id: In(driveIds),
        shiftable_type: Equal('drives'),
      })
      .orWhere({
        shiftable_id: In(sessionIds),
        shiftable_type: Equal('sessions'),
      });

    const response = await query.getRawOne<any>();

    return response;
  }

  private async GetOef(
    filter: KeyPerformanceIndicatorsFilter,
    tenantId: number,
    driveIds: [],
    sessionIds: [],
    systemDefaults: any
  ): Promise<number> {
    const commonWhereProps = {
      is_archived: false,
      tenant_id: tenantId,
    };

    const query = this.shiftsRepository
      .createQueryBuilder('s')
      .innerJoin('shifts_projections_staff', 'sps', 's.id = sps.shift_id')
      .innerJoin('staff_config', 'sc', 'sps.staff_setup_id = sc.staff_setup_id')
      .select([
        `SUM(Extract(hour from (s.end_time - s.start_time))) as h`,
        `SUM(sc.qty) as s`,
      ])
      .where(commonWhereProps)
      .andWhere({
        shiftable_id: In(driveIds),
        shiftable_type: Equal('drives'),
      })
      .orWhere({
        shiftable_id: In(sessionIds),
        shiftable_type: Equal('sessions'),
      });

    //We choose the field based on the dropdown selection or default to system config value if one exists
    if (filter.view_as) {
      const selectedField =
        filter.view_as === 'products' ? 'product_yield' : 'procedure_type_qty';

      query.addSelect(`SUM(${selectedField}) as p`);
    } else if (systemDefaults) {
      query.innerJoin('booking_rules', 'br', `br.tenant_id = s.tenant_id`);

      query.addSelect(
        `CASE
          WHEN br.oef_block_on_product = true THEN SUM(sps.product_yield)
          ELSE SUM(sps.procedure_type_qty)
        END as p`
      );

      query.groupBy('br.oef_block_on_product');
    } else if (!systemDefaults && !filter.view_as) {
      //if a system default does not exist and no value is passed in the filter we default to products
      query.addSelect(`SUM(product_yield) as p`);
    }

    const response = await query.getRawOne();

    const oef = response
      ? response.p &&
        response.p > 0 &&
        response.h &&
        response.h > 0 &&
        response.s &&
        response.s > 0
        ? (response.p / response.h / response.s).toFixed(2)
        : 0
      : 0;

    return Number(oef);
  }

  private async GetSlotsAvailable(
    tenantId: number,
    driveIds: [],
    sessionIds: []
  ): Promise<any> {
    const commonWhereProps = {
      is_archived: false,
      tenant_id: tenantId,
    };

    const query = this.shiftsRepository
      .createQueryBuilder('s')
      .innerJoin('shifts_slots', 'ss', 's.id = ss.shift_id')
      .select([`CAST(COUNT(ss.id) as int) as count`])
      .where(commonWhereProps)
      .andWhere({
        shiftable_id: In(driveIds),
        shiftable_type: Equal('drives'),
      })
      .orWhere({
        shiftable_id: In(sessionIds),
        shiftable_type: Equal('sessions'),
      });

    const response = await query.getRawOne();

    return response ? Number(response.count) : 0;
  }

  private async GetActual(
    filter: KeyPerformanceIndicatorsFilter,
    tenantId: number,
    driveIds: [],
    sessionIds: []
  ): Promise<number> {
    const commonWhereProps = {
      is_archived: false,
      donation_date: Between<Date>(
        new Date(filter.start_date),
        new Date(filter.end_date)
      ),
    };

    const query = this.donorDonationsRepository
      .createQueryBuilder('dd')
      .innerJoin(
        'procedure_types',
        'pt',
        `dd.donation_type = pt.id AND pt.tenant_id = ${tenantId}`
      )
      .select('COUNT(pt.id)')
      .where(commonWhereProps)
      .andWhere({
        drive_id: In(driveIds),
      })
      .orWhere({
        sessions_id: In(sessionIds),
      });

    const response = await query.getRawOne();

    return response ? Number(response.count) : 0;
  }

  private async GetScheduled(
    filter: KeyPerformanceIndicatorsFilter,
    tenantId: number,
    driveIds: [],
    sessionIds: [],
    systemDefaults: any
  ): Promise<number> {
    const commonWhereProps = {
      is_archived: false,
      tenant_id: tenantId,
    };

    const query = this.shiftsRepository
      .createQueryBuilder('s')
      .innerJoin('shifts_projections_staff', 'sps', 's.id = sps.shift_id')
      .where(commonWhereProps)
      .andWhere({
        shiftable_id: In(driveIds),
        shiftable_type: Equal('drives'),
      })
      .orWhere({
        shiftable_id: In(sessionIds),
        shiftable_type: Equal('sessions'),
      });

    //We choose the field based on the dropdown selection or default to system config value if one exists
    if (filter.view_as) {
      const selectedField =
        filter.view_as === 'products' ? 'product_yield' : 'procedure_type_qty';

      query.select(`SUM(${selectedField})`);
    } else if (systemDefaults) {
      query.innerJoin('booking_rules', 'br', `br.tenant_id = s.tenant_id`);

      query.select(
        `CASE
          WHEN br.oef_block_on_product = true THEN SUM(sps.product_yield)
          ELSE SUM(sps.procedure_type_qty)
        END`
      );

      query.groupBy('br.oef_block_on_product');
    } else if (!systemDefaults && !filter.view_as) {
      //if a system default does not exist and no value is passed in the filter we default to products
      query.select(`SUM(product_yield)`);
    }

    const response = await query.getRawOne();

    return response ? Number(response.sum) : 0;
  }

  private async GetOperations(
    filter: KeyPerformanceIndicatorsFilter,
    tenantId: number,
    type: string
  ) {
    const query = this.getOperationRepository(type)
      .createQueryBuilder(type)
      .innerJoin(
        'operations_status',
        'os',
        `${type}.operation_status_id = os.id`
      )
      .select([`${type}.id as id`, `os.name as operation_status`])
      .where({
        date: Between<Date>(
          new Date(filter.start_date),
          new Date(filter.end_date)
        ),
        is_archived: false,
        tenant_id: tenantId,
      })
      .andWhere(`os.name IN ('Confirmed', 'Completed', 'Tentative')`);

    if (type == 'drives' && filter?.organizational_level) {
      query.innerJoin('accounts', 'acc', 'drives.account_id = acc.id');

      query.andWhere(
        organizationalLevelWhere(
          filter.organizational_level,
          'acc.collection_operation',
          'drives.recruiter_id'
        )
      );
    } else if (type == 'sessions' && filter?.organizational_level) {
      query.andWhere(
        organizationalLevelWhere(
          filter.organizational_level,
          'sessions.collection_operation_id',
          null,
          'sessions.donor_center_id'
        )
      );
    }

    return await query.execute();
  }

  private async GetGoals(
    filter: KeyPerformanceIndicatorsFilter,
    tenantId: number
  ): Promise<number> {
    const query = this.monthlyGoalsRepository
      .createQueryBuilder('mg')
      .innerJoin(
        'monthly_goals_collection_operations',
        'mgco',
        'mg.id = mgco.monthly_goals_id'
      )
      .select([
        'mg.year as year',
        'SUM(mg.january) AS jan',
        'SUM(mg.february) AS feb',
        'SUM(mg.march) AS mar',
        'SUM(mg.april) AS apr',
        'SUM(mg.may) AS may',
        'SUM(mg.june) AS jun',
        'SUM(mg.july) AS jul',
        'SUM(mg.august) AS aug',
        'SUM(mg.september) AS sep',
        'SUM(mg.october) AS oct',
        'SUM(mg.november) AS nov',
        'SUM(mg.december) AS dec',
      ])
      .where({
        year: Between<number>(
          new Date(filter.start_date).getFullYear(),
          new Date(filter.end_date).getFullYear()
        ),
        is_archived: false,
        tenant_id: tenantId,
      })
      .groupBy('mg.year')
      .orderBy('mg.year');

    if (filter.organizational_level) {
      query.andWhere(
        organizationalLevelWhere(
          filter.organizational_level,
          null,
          'mg.recruiter',
          'mg.donor_center'
        )
      );
    }
    const data = await query.getRawOne();

    let sumOfSelectedMonths = 0;

    if (data) {
      const selectedMonths = this.GetMonthsBetween(
        new Date(filter.start_date),
        new Date(filter.end_date)
      );

      selectedMonths.forEach((month) => {
        const lowercasMonth = month.toLowerCase();
        if (data?.hasOwnProperty(lowercasMonth)) {
          sumOfSelectedMonths += Number(data[lowercasMonth]);
        }
      });
    }
    return sumOfSelectedMonths;
  }

  private GetMonthsBetween(startDate: Date, endDate: Date): string[] {
    const months = [];

    if (startDate > endDate) {
      [startDate, endDate] = [endDate, startDate];
    }

    for (
      let month = startDate.getMonth();
      month <= endDate.getMonth();
      month++
    ) {
      months.push(
        new Date(2024, month, 1).toLocaleString('default', { month: 'short' })
      );
    }

    return months;
  }

  private getOperationRepository(operation: string) {
    return operation == 'drives'
      ? this.drivesRepository
      : this.sessionsRepository;
  }

  private HandleValidationForKPI(
    keyPerformanceIndicatorsFilter: KeyPerformanceIndicatorsFilter,
    req: UserRequest
  ) {
    if (
      !keyPerformanceIndicatorsFilter.start_date ||
      !keyPerformanceIndicatorsFilter.end_date
    ) {
      throw new BadRequestException('Start/End Date is required.');
    }
    if (!req || !req.user?.tenant_id) {
      throw new InternalServerErrorException('Tenant Id could not be fetched.');
    }
  }

  //The performance of this method can be a lot more optimised, it was just done at a short notice so there was no time for refactoring
  async fetchBloodTypes(
    filter: KeyPerformanceIndicatorsFilter,
    req: UserRequest
  ) {
    try {
      this.HandleValidationForKPI(filter, req);

      const drives = await this.GetOperations(
        filter,
        req.user.tenant_id,
        'drives'
      );
      const driveIds = drives.map((x: any) => x.id) ?? [];

      const sessions = await this.GetOperations(
        filter,
        req.user.tenant_id,
        'sessions'
      );
      const sessionIds = sessions.map((x: any) => x.id) ?? [];

      const commonWhereProps = {
        is_archived: false,
        tenant_id: req.user.tenant_id,
      };

      //We filter operations by procedure_type
      const query = this.shiftsRepository
        .createQueryBuilder('s')
        .innerJoin('shifts_projections_staff', 'sps', 's.id = sps.shift_id')
        .innerJoin('procedure_types', 'pt', 'sps.procedure_type_id = pt.id')
        .select([
          's.shiftable_id as operation_id',
          's.shiftable_type as operation_type',
          's.tenant_id as tenant_id',
        ])
        .where(commonWhereProps)
        .andWhere({
          shiftable_id: In(driveIds),
          shiftable_type: Equal('drives'),
        })
        .orWhere({
          shiftable_id: In(sessionIds),
          shiftable_type: Equal('sessions'),
        });

      if (filter?.procedures?.length > 0)
        query.andWhere(`pt.id IN(${filter.procedures})`);

      const operations = await query.getRawMany();

      //We then divide drives and sessions and query the donor donations table
      const filteredDriveIds = operations
        .filter((x: any) => x.operation_type == 'drives')
        .map((y) => y.operation_id);

      const filteredSessionIds = operations
        .filter((x: any) => x.operation_type == 'sessions')
        .map((y) => y.operation_id);

      const donorsQuery = this.donorDonationsRepository
        .createQueryBuilder('dd')
        .innerJoin('donors', 'd', 'dd.donor_id = d.id')
        .innerJoin('blood_groups', 'bg', 'd.blood_group_id = bg.id')
        .select([
          'bg.name as name',
          'CAST(COUNT(d.blood_group_id) as int) as total',
        ])
        .groupBy('d.blood_group_id, bg.name')
        .where({
          sessions_id: In(filteredSessionIds),
        })
        .orWhere({
          drive_id: In(filteredDriveIds),
        });

      const response = await donorsQuery.getRawMany();

      const formattedResponse = this.formatBloodTypes(
        response,
        req.user.tenant_id
      );

      return resSuccess(
        `Operation Center Dashboard - Blood Types fetched successfully.`,
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        formattedResponse
      );
    } catch (exception) {
      return resError(
        exception.message,
        ErrorConstants.Error,
        exception.status
      );
    }
  }

  private formatBloodTypes(data: any[], tenant_id: number) {
    return {
      o_positive:
        data.find((x) => toLower(x.name) == toLower('O positive'))?.total ?? 0,
      o_negative:
        data.find((x) => toLower(x.name) == toLower('O Negative'))?.total ?? 0,
      b_positive:
        data.find((x) => toLower(x.name) == toLower('B Positive'))?.total ?? 0,
      b_negative:
        data.find((x) => toLower(x.name) == toLower('B Negative'))?.total ?? 0,
      a_positive:
        data.find((x) => toLower(x.name) == toLower('A positive'))?.total ?? 0,
      a_negative:
        data.find((x) => toLower(x.name) == toLower('A negative'))?.total ?? 0,
      ab_positive:
        data.find((x) => toLower(x.name) == toLower('AB positive'))?.total ?? 0,
      ab_negative:
        data.find((x) => toLower(x.name) == toLower('AB negative'))?.total ?? 0,
      unknown:
        data.find((x) => toLower(x.name) == toLower('Unknown'))?.total ?? 0,
      tenant_id: tenant_id,
    };
  }

  async fetchDriveSchedule(
    driveScheduleFilter: DriveScheduleFilter,
    tenant_id: any
  ) {
    let groupBy =
      ' d.id, d.oef_products, d.oef_procedures, d.date, acc.name, cl.name, acc.id, sh.start_time, sh.end_time, sps.product_yield, sps.procedure_type_qty, br.oef_block_on_product, d.created_by';
    try {
      let query = this.drivesRepository
        .createQueryBuilder('d')
        .innerJoin('accounts', 'acc', 'acc.id = d.account_id')
        .innerJoin('crm_locations', 'cl', 'cl.id = d.location_id')
        .innerJoin(
          'shifts',
          'sh',
          `sh.shiftable_id = d.id and sh.shiftable_type = 'drives'`
        )
        .innerJoin('shifts_projections_staff', 'sps', 'sh.id = sps.shift_id')
        .innerJoin('booking_rules', 'br', 'br.tenant_id = d.tenant_id')
        .select([
          'd.id as id',
          'd.date as date',
          'acc.name as account',
          'acc.id as account_id',
          'cl.name as location',
          'sh.start_time as shift_start_time',
          'sh.end_time as shift_end_time',
          'br.oef_block_on_product as oef_block_on_product',
          'd.oef_products as oef_products',
          'd.oef_procedures as oef_procedures',
          'sps.product_yield as product_yield',
          'sps.procedure_type_qty as procedure_type_qty',
          'd.created_by as created_by',
          '0 as projection',
          'd.tenant_id as tenant_id',
        ])
        .where(
          `d.is_archived = false and d.is_active = true and d.tenant_id = ${tenant_id}`
        );

      if (driveScheduleFilter?.organizational_level) {
        query.andWhere(
          organizationalLevelWhere(
            driveScheduleFilter.organizational_level,
            'acc.collection_operation',
            'd.recruiter_id'
          )
        );
      }

      if (driveScheduleFilter?.status.length > 0) {
        query = query.andWhere(
          `d.operation_status_id in (${driveScheduleFilter.status})`
        );
      }
      if (driveScheduleFilter?.duration) {
        const dateRange = this.getDateRangeByDurationEnum(
          driveScheduleFilter.duration
        );
        query = query.andWhere(
          `d.date between '${dateRange.from}' and '${dateRange.to}'`
        );
      }
      if (driveScheduleFilter?.performance) {
        switch (+driveScheduleFilter.performance) {
          case PerformanceEnum.LOW_OEF:
            query = query
              .innerJoin(
                'industry_categories',
                'ic',
                'ic.id = acc.industry_category'
              )
              .addSelect('ic.minimum_oef as minimum_oef');
            groupBy += ',ic.minimum_oef';
            break;
          case PerformanceEnum.HIGH_OEF:
            query = query
              .innerJoin(
                'industry_categories',
                'ic',
                'ic.id = acc.industry_category'
              )
              .addSelect('ic.maximum_oef as maximum_oef');
            groupBy += ', ic.maximum_oef';
            break;
          case PerformanceEnum.LOW_PROJECTION:
          case PerformanceEnum.HIGH_PROJECTION:
            query = query.addSelect(
              `(select count(dd.id) from donors_donations as dd inner join procedure_types as pt on pt.id = dd.donation_type where dd.drive_id = d.id)`,
              'actual'
            );
            break;
          case PerformanceEnum.LOW_PA:
            query = query
              .innerJoin(
                'performance_rules',
                'pr',
                'pr.tenant_id = d.tenant_id'
              )
              .addSelect(
                `(select count(dd.id) from donors_donations as dd inner join procedure_types as pt on pt.id = dd.donation_type where dd.drive_id = d.id)`,
                'actual'
              )
              .addSelect(
                'pr.projection_accuracy_minimum',
                'projection_accuracy_minimum'
              );
            groupBy += ' , pr.projection_accuracy_minimum';
            break;
        }
      }

      if (
        driveScheduleFilter.sortName &&
        driveScheduleFilter.sortOrder &&
        driveScheduleFilter.sortName !== 'projection' &&
        driveScheduleFilter.sortName !== 'shift_start_time'
      ) {
        query.orderBy(
          driveScheduleFilter.sortName,
          driveScheduleFilter.sortOrder
        );
      }

      const result = await query.groupBy(groupBy).getRawMany();

      const formattedResults = [];

      result.forEach((item) => {
        if (!formattedResults.some((s) => s.id == item.id)) {
          const records = result.filter((r) => r.id == item.id);

          // sum all product yields or procedure type qty for same operation and shift Id!
          records.forEach((record) => {
            item.projection += item.oef_block_on_product
              ? record.product_yield
              : record.procedure_type_qty;
          });

          // if filter is not selected
          if (!driveScheduleFilter.performance) {
            formattedResults.push(item);
          } else if (
            +driveScheduleFilter.performance == PerformanceEnum.LOW_OEF &&
            item.minimum_oef >
              (item.oef_block_on_product
                ? item.oef_products
                : item.oef_procedures)
          ) {
            formattedResults.push(item);
          } else if (
            +driveScheduleFilter.performance == PerformanceEnum.HIGH_OEF &&
            item.maximum_oef <
              (item.oef_block_on_product
                ? item.oef_products
                : item.oef_procedures)
          ) {
            formattedResults.push(item);
          } else if (
            +driveScheduleFilter.performance ==
              PerformanceEnum.LOW_PROJECTION &&
            ((+item.actual != 0 && item.projection / item.actual <= 0.25) ||
              (+item.actual == 0 && item.projection <= 0.25))
          ) {
            formattedResults.push(item);
          } else if (
            +driveScheduleFilter.performance ==
              PerformanceEnum.HIGH_PROJECTION &&
            ((+item.actual != 0 && item.projection / item.actual >= 0.75) ||
              (+item.actual == 0 && item.projection >= 0.75))
          ) {
            formattedResults.push(item);
          } else if (
            +driveScheduleFilter.performance == PerformanceEnum.LOW_PA &&
            ((+item.projection != 0 &&
              item.actual / item.projection <=
                item.projection_accuracy_minimum) ||
              (+item.projection == 0 &&
                item.actual <= item.projection_accuracy_minimum))
          ) {
            formattedResults.push(item);
          }
        }
      });

      if (
        driveScheduleFilter.sortName &&
        driveScheduleFilter.sortOrder &&
        driveScheduleFilter.sortName === 'projection'
      ) {
        if (driveScheduleFilter.sortOrder === 'DESC') {
          formattedResults.sort((a, b) => b.projection - a.projection);
        } else {
          formattedResults.sort((a, b) => a.projection - b.projection);
        }
      } else if (
        driveScheduleFilter.sortName &&
        driveScheduleFilter.sortOrder &&
        driveScheduleFilter.sortName === 'shift_start_time'
      ) {
        if (driveScheduleFilter.sortOrder === 'DESC') {
          formattedResults.sort(
            (a, b) =>
              b.shift_start_time.getHours() * 60 +
              b.shift_start_time.getMinutes() -
              (a.shift_start_time.getHours() * 60 +
                a.shift_start_time.getMinutes())
          );
        } else {
          // ASC
          formattedResults.sort(
            (a, b) =>
              a.shift_start_time.getHours() * 60 +
              a.shift_start_time.getMinutes() -
              (b.shift_start_time.getHours() * 60 +
                b.shift_start_time.getMinutes())
          );
        }
      }

      return resSuccess(
        `Operation Center Dashboard - Drives Schedules Fetched Successfully.`,
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        formattedResults,
        formattedResults.length
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  public getDateRangeByDurationEnum(duration) {
    const today = new Date();
    const month = today.getMonth() + 1;
    switch (+duration) {
      case DurationEnum.THIS_MONTH:
        const firstDayInMonth = new Date(today.getFullYear(), month - 1, 1);
        const lastDayOfMonth = new Date(today.getFullYear(), month, 0);
        return {
          from: firstDayInMonth.toISOString().split('T')[0],
          to: lastDayOfMonth.toISOString().split('T')[0],
        };
      case DurationEnum.NEXT_MONTH:
        const firstDayInNextMonth = new Date(today.getFullYear(), month, 1);
        const lastDayOfNextMonth = new Date(today.getFullYear(), month + 1, 0);
        return {
          from: firstDayInNextMonth.toISOString().split('T')[0],
          to: lastDayOfNextMonth.toISOString().split('T')[0],
        };
      case DurationEnum.THIS_QUARTER:
        if (month >= 1 && month <= 3) {
          return {
            from: new Date(today.getFullYear(), 0, 1)
              .toISOString()
              .split('T')[0],
            to: new Date(today.getFullYear(), 3, 0).toISOString().split('T')[0],
          };
        } else if (month >= 4 && month <= 6) {
          return {
            from: new Date(today.getFullYear(), 3, 1)
              .toISOString()
              .split('T')[0],
            to: new Date(today.getFullYear(), 6, 0).toISOString().split('T')[0],
          };
        } else if (month >= 7 && month <= 9) {
          return {
            from: new Date(today.getFullYear(), 6, 1)
              .toISOString()
              .split('T')[0],
            to: new Date(today.getFullYear(), 9, 0).toISOString().split('T')[0],
          };
        } else {
          return {
            from: new Date(today.getFullYear(), 9, 1)
              .toISOString()
              .split('T')[0],
            to: new Date(today.getFullYear(), 12, 0)
              .toISOString()
              .split('T')[0],
          };
        }
      case DurationEnum.NEXT_QUARTER:
        if (month >= 1 && month <= 3) {
          return {
            from: new Date(today.getFullYear(), 3, 1)
              .toISOString()
              .split('T')[0],
            to: new Date(today.getFullYear(), 6, 0).toISOString().split('T')[0],
          };
        } else if (month >= 4 && month <= 6) {
          return {
            from: new Date(today.getFullYear(), 6, 1)
              .toISOString()
              .split('T')[0],
            to: new Date(today.getFullYear(), 9, 0).toISOString().split('T')[0],
          };
        } else if (month >= 7 && month <= 9) {
          return {
            from: new Date(today.getFullYear(), 9, 1)
              .toISOString()
              .split('T')[0],
            to: new Date(today.getFullYear(), 12, 0)
              .toISOString()
              .split('T')[0],
          };
        } else {
          return {
            from: new Date(today.getFullYear() + 1, 0, 1)
              .toISOString()
              .split('T')[0],
            to: new Date(today.getFullYear(), 3, 0).toISOString().split('T')[0],
          };
        }
    }
  }

  async fetchPromotions(filter: PromotionsFilter, req: UserRequest) {
    try {
      if (!req || !req.user?.tenant_id) {
        throw new InternalServerErrorException(
          'Tenant Id could not be fetched.'
        );
      }
      const { from, to } = this.getDateRangeByDurationEnum(filter.duration);

      const query = this.promotionEntityRepository
        .createQueryBuilder('pe')
        .select([
          'cast(pe.id as int) as id',
          'pe.name as name',
          'pe.description as description',
          'pe.start_date as start_date',
          'pe.end_date as end_date',
          'cast(pe.created_by as int) as created_by',
          'pe.created_at as created_at',
          'pe.tenant_id as tenant_id',
        ])
        .distinct(true)
        .where(
          `pe.start_date >= '${from}' and pe.end_date <= '${to}' and pe.tenant_id = ${req.user.tenant_id} and pe.is_archived = false`
        );

      if (filter.sortName && filter.sortOrder) {
        query.orderBy(filter.sortName, filter.sortOrder);
      }

      const response = await query.getRawMany<UpcomingPromotionsDto>();

      return resSuccess(
        `Operation Center Dashboard - Upcoming Promotions fetched successfully.`,
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        response
      );
    } catch (exception) {
      return resError(
        exception.message,
        ErrorConstants.Error,
        exception.status
      );
    }
  }

  async fetchForecast(forecastFilter: ForecastFilter, req: UserRequest) {
    throw new NotImplementedException(
      'This functionality is not yet implemented'
    );
  }
}
