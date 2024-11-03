import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, Equal, Repository } from 'typeorm';
import { resError, resSuccess } from '../../../../../helpers/response';
import { ErrorConstants } from '../../../../../constants/error.constants';
import moment, { Moment } from 'moment';
import { DailyGoalsCalenders } from '../../daily-goals-calender/entity/daily-goals-calender.entity';
import { DailyGoalsCalenderFiltersInterface } from '../interface/daily-goals-calender.interface';
import { MonthlyGoals } from '../../monthly-goals/entities/monthly-goals.entity';
import { DailyGoalsAllocations } from '../../daily-goals-allocation/entities/daily-goals-allocation.entity';
import { UpdateDailyGoalsCalendarDto } from '../dto/update-daily-goals-calendar.dto';
import { HistoryService } from 'src/api/common/services/history.service';
import { DailyGoalsCalendersHistory } from '../entity/daily-goals-calender-history.entity';
import { CloseDate } from 'src/api/system-configuration/tenants-administration/operations-administration/calendar/close-dates/entities/close-date.entity';
import { ClosedDateInterface } from '../../monthly-goals/interface/monthly-goals.interface';

@Injectable()
export class DailyGoalsCalenderService extends HistoryService<DailyGoalsCalendersHistory> {
  constructor(
    @InjectRepository(DailyGoalsCalenders)
    private readonly dailyGoalsCalenderRepository: Repository<DailyGoalsCalenders>,
    @InjectRepository(DailyGoalsCalendersHistory)
    private readonly dailyGoalsCalenderHistoryRepository: Repository<DailyGoalsCalendersHistory>,
    @InjectRepository(MonthlyGoals)
    private readonly monthlyGoalsRepository: Repository<MonthlyGoals>,
    @InjectRepository(DailyGoalsAllocations)
    private readonly dailyGoalsAllocationRepository: Repository<DailyGoalsAllocations>,
    @InjectRepository(CloseDate)
    private readonly closeDateRepository: Repository<CloseDate>,
    private readonly entityManager: EntityManager
  ) {
    super(dailyGoalsCalenderHistoryRepository);
  }

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

  async allocationPercentagesForMonthByDate(daily_goal_allocation) {
    const allocationsList = [];
    for (let i = 0; i < daily_goal_allocation.length; i++) {
      const item = daily_goal_allocation[i];
      const nextItem =
        daily_goal_allocation[i + 1] ??
        moment(item.effective_date).endOf('month');
      allocationsList.push({
        start: moment(item.effective_date).startOf('day'),
        end: nextItem?.effective_date
          ? moment(nextItem.effective_date).startOf('day')
          : moment(item.effective_date).startOf('day').endOf('year'),
        sunday: item.sunday,
        monday: item.monday,
        tuesday: item.tuesday,
        wednesday: item.wednesday,
        thursday: item.thursday,
        friday: item.friday,
        saturday: item.saturday,
      });
    }
    return allocationsList;
  }

  async findAll(
    dailyGoalsCalenderFiltersInterface: DailyGoalsCalenderFiltersInterface
  ) {
    try {
      const {
        count,
        data,
        monthly_value,
        daily_percentages,
        closedDatesListForMonth,
      } = await this.findForMonth(dailyGoalsCalenderFiltersInterface);

      return {
        status: HttpStatus.OK,
        message: 'Daily Goals Calender Fetched Succesfuly',
        count: count,
        data,
        monthly_value,
        daily_percentages,
        closedDatesListForMonth,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findForMonth(
    dailyGoalsCalenderFiltersInterface: DailyGoalsCalenderFiltersInterface
  ) {
    const { collection_operation, procedure_type, year, tenant_id } =
      dailyGoalsCalenderFiltersInterface;
    let { month } = dailyGoalsCalenderFiltersInterface;

    month++;

    const where = { is_archived: false, tenant: { id: tenant_id } };

    if (month && year) {
      const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD').startOf(
        'day'
      );
      const endDate = moment(startDate).endOf('month');

      Object.assign(where, {
        date: Between(startDate.toDate(), endDate.toDate()),
      });
    }

    const query = `SELECT * FROM monthly_goals mg
      JOIN monthly_goals_collection_operations mgc ON mgc.monthly_goals_id = mg.id
      where
      year=${year} AND
      is_archived=${false} AND
      procedure_type=${procedure_type} AND
      business_unit_id =(${collection_operation}) AND
      tenant_id =(${tenant_id})
      `;

    const monthly_goal = await this.monthlyGoalsRepository.query(query);

    if (monthly_goal.length === 0) {
      resError(
        `Calendar does not exists.`,
        ErrorConstants.Error,
        HttpStatus.NOT_FOUND
      );
    }

    const monthly_value = monthly_goal?.reduce(
      (partialSum, item) =>
        partialSum +
        item[
          moment(`${year}-${month}-01`, 'YYYY-MM-DD')
            .format('MMMM')
            .toLocaleLowerCase()
        ],
      0
    );
    if (collection_operation) {
      Object.assign(where, {
        collection_operation: {
          id: collection_operation,
        },
      });
    }

    if (procedure_type) {
      Object.assign(where, {
        procedure_type: {
          id: procedure_type,
        },
      });
    }

    const [response, count] =
      await this.dailyGoalsCalenderRepository.findAndCount({
        where,
        relations: ['collection_operation', 'procedure_type'],
        order: { date: 'ASC' },
      });

    const daily_goal_allocation =
      await this.dailyGoalsAllocationRepository.find({
        where: {
          procedure_type: {
            id: procedure_type,
          },
          collection_operation: {
            id: collection_operation,
          },
          year,
          tenant: { id: tenant_id },
        },
        order: { effective_date: 'ASC' },
      });

    const dailyPercentagesWithInRange =
      await this.allocationPercentagesForMonthByDate(daily_goal_allocation);

    const startOfMonth = moment(`${year}-${month}-01`).startOf('month');
    const endOfMonth = moment(`${year}-${month}-01`).endOf('month');
    const closedDatesListForMonth: ClosedDateInterface[] =
      await this.getClosedDatesForMonth(
        collection_operation,
        startOfMonth.toDate(),
        endOfMonth.toDate(),
        tenant_id
      );

    return {
      count: count,
      data: response,
      monthly_value,
      daily_percentages: dailyPercentagesWithInRange,
      closedDatesListForMonth,
    };
  }

  async getValuesInWeek(daysValues, start, end, closedDatesListForMonth) {
    let valuesForWeek = {};
    while (start.toDate() <= end.toDate()) {
      const day = parseInt(moment(start).format('DD'));
      if (
        daysValues[day] &&
        !this.isClosed(moment(start), closedDatesListForMonth)
      )
        valuesForWeek = { ...valuesForWeek, [day]: daysValues[day] };
      start.add(1, 'day');
    }
    return valuesForWeek;
  }

  getPercentageByDate(dailyValues, day, date) {
    // console.log('=====', { day, date, dailyValues });
    for (let i = 0; i < dailyValues.length; i++) {
      const item = dailyValues[i];
      const startDate = parseInt(item.start.format('DD'));
      // const startDay = item.start.format("dddd").toLocaleLowerCase();
      const endDate = parseInt(item.end.format('DD'));
      // console.log({ startDate, endDate });
      // console.log({ item });
      if (date >= startDate && date <= endDate) {
        // console.log(item[day]);
        return item[day];
      }
    }
  }

  getNumberOfDaysBetweenDates = (currentDate, endDate) => {
    let numberOfDays = 0;
    while (currentDate <= endDate) {
      numberOfDays += 1;
      currentDate.add(1, 'day');
    }
    return numberOfDays;
  };

  getPerDayValue = async (
    weeks,
    daysValues,
    collectionOperation,
    procedureType,
    startOfMonth,
    endOfMonth,
    queryRunner,
    tenant_id,
    closedDatesListForMonth
  ) => {
    const updatedItems = [];
    const otherItems = [];
    let diffrenceToAllocateToOthers = 0;
    for (let i = 0; i < weeks.length; i++) {
      const currentWeek = weeks[i];
      const weekItems = await this.getValuesInWeek(
        daysValues,
        moment(currentWeek.start),
        moment(currentWeek.end),
        closedDatesListForMonth
      );
      const dailyGoalCalendarItems =
        await this.dailyGoalsCalenderRepository.find({
          select: ['id', 'date', 'goal_amount', 'tenant_id'],
          where: {
            collection_operation: {
              id: collectionOperation,
            },
            procedure_type: { id: procedureType },
            date: Between(
              currentWeek.start.format('yyyy-MM-DD'),
              currentWeek.end.format('yyyy-MM-DD')
            ),
            is_archived: false,
            tenant: { id: tenant_id },
          },
        });
      for (let i = 0; i < dailyGoalCalendarItems.length; i++) {
        const item = dailyGoalCalendarItems[i];
        const itemDate = parseInt(moment(item.date).format('DD'));
        if (
          weekItems[itemDate.toString()] &&
          item.goal_amount !== weekItems[itemDate.toString()]
        ) {
          diffrenceToAllocateToOthers =
            item.goal_amount - weekItems[itemDate.toString()];
          item.goal_amount = weekItems[itemDate.toString()];
          await queryRunner.manager.save(item);
          updatedItems.push(item);
        } else {
          otherItems.push(item);
        }
      }
    }

    const perDayValue =
      diffrenceToAllocateToOthers /
      (this.getNumberOfDaysBetweenDates(startOfMonth, endOfMonth) -
        updatedItems.length);
    return perDayValue;
  };

  async update(updateCalendarDTO: UpdateDailyGoalsCalendarDto) {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      //   const startOfMonth = moment(
      //     new Date(updateCalendarDTO.year, updateCalendarDTO.month, 1)
      //   ).startOf('month');
      //   const query = `SELECT * FROM monthly_goals mg
      // JOIN monthly_goals_collection_operations mgc ON mgc.monthly_goals_id = mg.id
      // where
      // year=${updateCalendarDTO.year} AND
      // is_archived=${false} AND
      // procedure_type=${updateCalendarDTO.procedureType} AND
      // business_unit_id = (${updateCalendarDTO.collectionOperation})
      // `;
      //   const monthly_goal = await this.monthlyGoalsRepository.query(query);
      //   if (monthly_goal.length === 0) {
      //     throw new HttpException(
      //       `Month goal for year does not exists.`,
      //       HttpStatus.NOT_FOUND
      //     );
      //   }
      //   const endOfMonth = moment(
      //     new Date(updateCalendarDTO.year, updateCalendarDTO.month, 1)
      //   ).endOf('month');
      //   // console.log({
      //   //   procedure_type: {
      //   //     id: updateCalendarDTO.procedureType,
      //   //   },
      //   //   collection_operation: {
      //   //     id: updateCalendarDTO.collectionOperation,
      //   //   },
      //   //   effective_date: Between(
      //   //     new Date(startOfMonth.toDate()),
      //   //     new Date(endOfMonth.toDate())
      //   //   ),
      //   //   tenant: { id: updateCalendarDTO.tenant_id },
      //   // });

      //   const startOfYear = moment(startOfMonth).startOf('year');
      //   const daily_goal_allocation =
      //     await this.dailyGoalsAllocationRepository.find({
      //       where: {
      //         procedure_type: {
      //           id: updateCalendarDTO.procedureType,
      //         },
      //         collection_operation: {
      //           id: updateCalendarDTO.collectionOperation,
      //         },
      //         effective_date: Between(
      //           new Date(startOfYear.toDate()),
      //           new Date(endOfMonth.toDate())
      //         ),
      //         tenant: { id: updateCalendarDTO.tenant_id },
      //       },
      //       order: { effective_date: 'DESC' },
      //       take: 2,
      //     });

      //   // console.log({ daily_goal_allocation });
      //   const dailyValueForEachDay =
      //     await this.allocationPercentagesForMonthByDates(
      //       daily_goal_allocation
      //     );

      //   // console.log({ dailyValueForEachDay });
      //   if (
      //     updateCalendarDTO.allocatedDiffrenceOver === 'week' &&
      //     (updateCalendarDTO.diffrence > 1 || updateCalendarDTO.diffrence < -1)
      //   ) {
      //     // console.log('Allocation Over week');
      //     const weeks = [];
      //     let startOfWeek = moment(
      //       new Date(updateCalendarDTO.year, updateCalendarDTO.month, 1)
      //     ).startOf('month');
      //     while (startOfWeek.toDate() < endOfMonth.toDate()) {
      //       const endOfWeek = moment(startOfWeek).endOf('week');
      //       weeks.push({ start: moment(startOfWeek), end: moment(endOfWeek) });
      //       startOfWeek = endOfWeek;
      //       startOfWeek.add(1, 'day');
      //     }

      //     for (let i = 0; i < weeks.length; i++) {
      //       const currentWeek = weeks[i];
      //       // console.log({ currentWeek });

      //       const weekItems = await this.getValuesInWeek(
      //         updateCalendarDTO.daysValues,
      //         moment(currentWeek.start),
      //         moment(currentWeek.end)
      //       );

      //       // console.log({ weekItems });

      //       const dailyGoalCalendarItems =
      //         await this.dailyGoalsCalenderRepository.find({
      //           select: ['id', 'date', 'goal_amount'],
      //           where: {
      //             collection_operation: {
      //               id: updateCalendarDTO.collectionOperation,
      //             },
      //             procedure_type_id: { id: updateCalendarDTO.procedureType },
      //             date: Between(
      //               currentWeek.start.format('yyyy-MM-DD'),
      //               currentWeek.end.format('yyyy-MM-DD')
      //             ),
      //             is_archived: false,
      //             tenant: { id: updateCalendarDTO.tenant_id },
      //           },
      //         });

      //       const updatedItems = [];
      //       const otherItems = [];
      //       let allocatedPercentage = 0;
      //       let diffrenceToAllocateToOthers = 0;
      //       for (let i = 0; i < dailyGoalCalendarItems.length; i++) {
      //         const item = dailyGoalCalendarItems[i];
      //         const itemDate = parseInt(moment(item.date).format('DD'));
      //         if (
      //           weekItems[itemDate.toString()] &&
      //           item.goal_amount !== Math.round(weekItems[itemDate.toString()])
      //         ) {
      //           diffrenceToAllocateToOthers =
      //             item.goal_amount - Math.round(weekItems[itemDate.toString()]);

      //           updatedItems.push(item);
      //           item.goal_amount = Math.round(weekItems[itemDate.toString()]);
      //           await queryRunner.manager.save(item);
      //         } else {
      //           otherItems.push(item);
      //           const itemDate = parseInt(moment(item.date).format('DD'));
      //           const itemDay = moment(item.date)
      //             .format('dddd')
      //             .toLocaleLowerCase();
      //           allocatedPercentage += this.getPercentageByDate(
      //             dailyValueForEachDay,
      //             itemDay,
      //             itemDate
      //           );
      //         }
      //       }
      //       const remainingPercentage = 100 - allocatedPercentage;

      //       // console.log({ updatedItems });
      //       // console.log({
      //       //   otherItems,
      //       //   allocatedPercentage,
      //       //   remainingPercentage,
      //       //   diffrenceToAllocateToOthers,
      //       // });

      //       for (const item of otherItems) {
      //         // console.log("item", item);

      //         const itemDate = parseInt(moment(item.date).format('DD'));
      //         const itemDay = moment(item.date)
      //           .format('dddd')
      //           .toLocaleLowerCase();
      //         const allocatedPercentageForDay = this.getPercentageByDate(
      //           dailyValueForEachDay,
      //           itemDay,
      //           itemDate
      //         );
      //         // console.log({
      //         //   dailyValueForEachDay,
      //         //   itemDate,
      //         //   itemDay,
      //         //   allocatedPercentageForDay,
      //         // });

      //         // console.log({ allocatedPercentageForDay });
      //         // console.log({
      //         //   allocatedPercentageForDay,
      //         //   allocatedPercentage,
      //         //   remainingPercentage,
      //         // });
      //         const proportionateAllocation =
      //           (allocatedPercentageForDay / allocatedPercentage) *
      //           (remainingPercentage / 100);
      //         // console.log({ proportionateAllocation });
      //         // console.log(proportionateAllocation + allocatedPercentageForDay);
      //         // console.log(
      //         //   proportionateAllocation + allocatedPercentageForDay / 100
      //         // );
      //         // console.log(
      //         //   (proportionateAllocation + allocatedPercentageForDay / 100) *
      //         //     diffrenceToAllocateToOthers
      //         // );
      //         // console.log({ proportionateAllocation });
      //         const toAddAmount =
      //           (proportionateAllocation + allocatedPercentageForDay / 100) *
      //           diffrenceToAllocateToOthers;
      //         // console.log('----- Goal', item.goal_amount, 'To Add', toAddAmount);
      //         if (item.goal_amount + toAddAmount >= 0) {
      //           item.goal_amount = Math.round(item.goal_amount + toAddAmount);

      //           await queryRunner.manager.save(item);
      //         } else {
      //           throw new HttpException(
      //             'Can not allocate diffrence over week',
      //             HttpStatus.CONFLICT
      //           );
      //         }
      //       }
      //     }
      //   }
      //   if (
      //     updateCalendarDTO.allocatedDiffrenceOver === 'month' &&
      //     (updateCalendarDTO.diffrence > 1 || updateCalendarDTO.diffrence < -1)
      //   ) {
      //     let correctStartDateForAllocation, correctEndDateForAllocation;
      //     const startOfMonth = moment(
      //       new Date(updateCalendarDTO.year, updateCalendarDTO.month, 1)
      //     ).startOf('month');

      //     const endOfMonth = moment(
      //       new Date(updateCalendarDTO.year, updateCalendarDTO.month, 1)
      //     ).endOf('month');

      //     const i = moment(
      //       new Date(updateCalendarDTO.year, updateCalendarDTO.month, 1)
      //     ).endOf('month');

      //     const weeks = [];
      //     let startOfWeek = moment(
      //       new Date(updateCalendarDTO.year, updateCalendarDTO.month, 1)
      //     ).startOf('month');
      //     while (startOfWeek.toDate() < endOfMonth.toDate()) {
      //       const endOfWeek = moment(startOfWeek).endOf('week');
      //       weeks.push({ start: moment(startOfWeek), end: moment(endOfWeek) });
      //       startOfWeek = endOfWeek;
      //       startOfWeek.add(1, 'day');
      //     }
      //     const updatedItems = [];

      //     for (let i = 0; i < weeks.length; i++) {
      //       const currentWeek = weeks[i];
      //       const weekItems = await this.getValuesInWeek(
      //         updateCalendarDTO.daysValues,
      //         moment(currentWeek.start),
      //         moment(currentWeek.end)
      //       );
      //       const dailyGoalCalendarItems =
      //         await this.dailyGoalsCalenderRepository.find({
      //           where: {
      //             collection_operation: {
      //               id: updateCalendarDTO.collectionOperation,
      //             },
      //             procedure_type_id: { id: updateCalendarDTO.procedureType },
      //             date: Between(
      //               currentWeek.start.format('yyyy-MM-DD'),
      //               currentWeek.end.format('yyyy-MM-DD')
      //             ),
      //             is_archived: false,
      //             tenant: { id: updateCalendarDTO.tenant_id },
      //           },
      //         });

      //       for (let i = 0; i < dailyGoalCalendarItems.length; i++) {
      //         const item = dailyGoalCalendarItems[i];
      //         const itemDate = parseInt(moment(item.date).format('DD'));
      //         if (
      //           weekItems[itemDate.toString()] &&
      //           item.goal_amount !== Math.round(weekItems[itemDate.toString()])
      //         ) {
      //           updatedItems.push(item);
      //           item.goal_amount = Math.round(weekItems[itemDate.toString()]);
      //           await queryRunner.manager.save(item);
      //         }
      //       }
      //     }

      //     // console.log({updatedItems});
      //     const updatedItemDates = updatedItems.map((item) =>
      //       moment(item.date)
      //     );
      //     // console.log({ updatedItemDates });
      //     let breakParent = false;
      //     // console.log({ dailyValueForEachDay });
      //     let sumOfAllocationDaysPercentage = 0;
      //     for (; i >= startOfMonth && !breakParent; i.subtract(1, 'day')) {
      //       let diffrenceForIteration = updateCalendarDTO.diffrence;
      //       // console.log('=====>', { i });
      //       sumOfAllocationDaysPercentage = 0;
      //       for (let j = moment(startOfMonth); j <= i; j.add(1, 'day')) {
      //         // console.log(
      //         //   'Filtered',
      //         //   updatedItemDates.filter((item) => {
      //         //     console.log(
      //         //       item.toString(),
      //         //       j.toString(),
      //         //       item.toString() === j.toString()
      //         //     );
      //         //   })
      //         // );
      //         if (
      //           updatedItemDates.filter(
      //             (item) => item.toString() === j.toString()
      //           ).length === 0
      //         ) {
      //           const itemDate = parseInt(moment(j).format('DD'));
      //           const itemDay = moment(j).format('dddd').toLocaleLowerCase();

      //           const dailyPercentageForDay = this.getPercentageByDate(
      //             dailyValueForEachDay,
      //             itemDay,
      //             itemDate
      //           );
      //           sumOfAllocationDaysPercentage += dailyPercentageForDay;
      //         }
      //       }

      //       // console.log({ sumOfAllocationDaysPercentage });
      //       for (let j = moment(startOfMonth); j <= i; j.add(1, 'day')) {
      //         if (
      //           updatedItemDates.filter(
      //             (item) => item.toString() === j.toString()
      //           ).length === 0
      //         ) {
      //           const itemDate = parseInt(moment(j).format('DD'));
      //           const itemDay = moment(j).format('dddd').toLocaleLowerCase();

      //           const dailyPercentageForDay = this.getPercentageByDate(
      //             dailyValueForEachDay,
      //             itemDay,
      //             itemDate
      //           );
      //           const percentageForAllocation =
      //             (dailyPercentageForDay / sumOfAllocationDaysPercentage) * 100;
      //           const goalDiffrenceToAdd = Math.round(
      //             (percentageForAllocation / 100) * updateCalendarDTO.diffrence
      //           );
      //           if (goalDiffrenceToAdd > 0)
      //             diffrenceForIteration -= goalDiffrenceToAdd;

      //           // console.log({
      //           //   percentageForAllocation,
      //           //   goalDiffrenceToAdd,
      //           //   diffrenceForIteration,
      //           // });
      //           if (diffrenceForIteration === 1) {
      //             correctEndDateForAllocation = moment(j);
      //             correctStartDateForAllocation = moment(startOfMonth);
      //             // console.log(
      //             //   'Result',
      //             //   sumOfAllocationDaysPercentage,
      //             //   correctStartDateForAllocation,
      //             //   correctEndDateForAllocation
      //             // );
      //             breakParent = true;
      //             break;
      //           }
      //         }
      //       }
      //     }

      //     for (
      //       let i = correctStartDateForAllocation;
      //       i <= correctEndDateForAllocation;
      //       i.add(1, 'day')
      //     ) {
      //       let diffrenceForIteration = updateCalendarDTO.diffrence;

      //       if (
      //         updatedItemDates.filter(
      //           (item) => item.toString() === i.toString()
      //         ).length === 0
      //       ) {
      //         const itemDate = parseInt(moment(i).format('DD'));
      //         const itemDay = moment(i).format('dddd').toLocaleLowerCase();

      //         const dailyPercentageForDay = this.getPercentageByDate(
      //           dailyValueForEachDay,
      //           itemDay,
      //           itemDate
      //         );
      //         const percentageForAllocation =
      //           (dailyPercentageForDay / sumOfAllocationDaysPercentage) * 100;
      //         const goalDiffrenceToAdd = Math.round(
      //           (percentageForAllocation / 100) * updateCalendarDTO.diffrence
      //         );
      //         if (goalDiffrenceToAdd > 0) {
      //           diffrenceForIteration -= goalDiffrenceToAdd;
      //           const dailyItemToUpdate =
      //             await this.dailyGoalsCalenderRepository.findOne({
      //               where: {
      //                 collection_operation: {
      //                   id: updateCalendarDTO.collectionOperation,
      //                 },
      //                 procedure_type_id: {
      //                   id: updateCalendarDTO.procedureType,
      //                 },
      //                 date: Equal(i.toDate()),
      //                 is_archived: false,
      //                 tenant: { id: updateCalendarDTO.tenant_id },
      //               },
      //             });
      //           // console.log(dailyItemToUpdate);
      //           dailyItemToUpdate.goal_amount =
      //             dailyItemToUpdate.goal_amount + goalDiffrenceToAdd;
      //           await queryRunner.manager.save(dailyItemToUpdate);
      //         }
      //       }
      //     }
      //   }
      //   await queryRunner.commitTransaction();

      //   await this.dailyGoalsCalenderRepository.update(
      //     {
      //       collection_operation: {
      //         id: updateCalendarDTO.collectionOperation,
      //       },
      //       procedure_type_id: { id: updateCalendarDTO.procedureType },
      //       date: Between(
      //         new Date(
      //           moment(
      //             new Date(updateCalendarDTO.year, updateCalendarDTO.month, 1)
      //           )
      //             .startOf('month')
      //             .format('yyyy-MM-DD')
      //         ),
      //         new Date(
      //           moment(
      //             new Date(updateCalendarDTO.year, updateCalendarDTO.month, 1)
      //           )
      //             .endOf('month')
      //             .format('yyyy-MM-DD')
      //         )
      //       ),
      //       is_archived: false,
      //       tenant: { id: updateCalendarDTO.tenant_id },
      //     },
      //     {
      //       is_locked: updateCalendarDTO.isLocked,
      //     }
      //   );
      // } else {
      const start = moment(
        new Date(updateCalendarDTO.year, updateCalendarDTO.month, 1)
      ).startOf('month');
      const end = moment(
        new Date(updateCalendarDTO.year, updateCalendarDTO.month, 1)
      ).endOf('month');
      const dailyGoalCalendarItems =
        await this.dailyGoalsCalenderRepository.find({
          where: {
            collection_operation: {
              id: updateCalendarDTO.collectionOperation,
            },
            procedure_type: { id: updateCalendarDTO.procedureType },
            date: Between(start.toDate(), end.toDate()),
            is_archived: false,
            tenant: { id: updateCalendarDTO.tenant_id },
          },
          relations: ['collection_operation', 'procedure_type', 'created_by'],
        });
      for (let i = 0; i < dailyGoalCalendarItems.length; i++) {
        const item: any = dailyGoalCalendarItems[i];
        const itemDate = parseInt(moment(item.date).format('DD'));
        if (
          Math.round(item.goal_amount) !==
          updateCalendarDTO.daysValues[itemDate]
        ) {
          item.goal_amount = updateCalendarDTO.daysValues[itemDate];
          item.is_locked = updateCalendarDTO.isLocked;
          item.manual_updated = updateCalendarDTO.manual_updated;
          item.created_at = new Date();
          await queryRunner.manager.save(item);
        } else {
          item.created_at = new Date();
          item.is_locked = updateCalendarDTO.isLocked;
          item.manual_updated = updateCalendarDTO.manual_updated;
          await queryRunner.manager.save(item);
        }
      }
      await queryRunner.commitTransaction();
      return resSuccess('Daily goals calendar updated.', 'success', 200, {});
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
      await queryRunner.release();
    }
  }

  async getRedistributedValues(updateCalendarDTO: UpdateDailyGoalsCalendarDto) {
    const { collectionOperation, daysValues: redistrubutesValues } =
      updateCalendarDTO;
    try {
      const startOfMonth = moment(
        new Date(updateCalendarDTO.year, updateCalendarDTO.month, 1)
      ).startOf('month');

      const query = `SELECT * FROM monthly_goals mg
      JOIN monthly_goals_collection_operations mgc ON mgc.monthly_goals_id = mg.id
      where
      year=${updateCalendarDTO.year} AND
      is_archived=${false} AND
      procedure_type=${updateCalendarDTO.procedureType} AND
      business_unit_id = (${updateCalendarDTO.collectionOperation})
      `;

      const monthly_goal = await this.monthlyGoalsRepository.query(query);
      const monthly_value =
        monthly_goal?.[0]?.[moment(startOfMonth).format('MMMM').toLowerCase()];
      const endOfMonth = moment(
        new Date(updateCalendarDTO.year, updateCalendarDTO.month, 1)
      ).endOf('month');
      // console.log(updateCalendarDTO.diffrence);
      console.log(
        `From ${startOfMonth.format('MM-DD-yyyy')} to ${endOfMonth.format(
          'MM-DD-yyyy'
        )} with Monthly Goal of ${monthly_value} and diffrence ${
          updateCalendarDTO.diffrence
        }`
      );
      const dailyValueForEachDay = await this.getDailyAllocationForMonth(
        updateCalendarDTO.month,
        updateCalendarDTO.year,
        updateCalendarDTO.procedureType,
        updateCalendarDTO.collectionOperation,
        updateCalendarDTO.tenant_id
      );

      console.log(
        `${startOfMonth.format('MM-DD-YYYY')} to ${endOfMonth.format(
          'MM-DD-YYYY'
        )}`
      );

      if (updateCalendarDTO.allocatedDiffrenceOver === 'week') {
        console.log('Allocation Over week');
        const weeks = [];
        let startOfWeek = moment(
          new Date(updateCalendarDTO.year, updateCalendarDTO.month, 1)
        ).startOf('month');
        while (startOfWeek.toDate() < endOfMonth.toDate()) {
          const endOfWeek = moment(startOfWeek).endOf('week');
          if (endOfWeek.isSameOrBefore(endOfMonth)) {
            weeks.push({ start: moment(startOfWeek), end: moment(endOfWeek) });
          } else {
            weeks.push({ start: moment(startOfWeek), end: moment(endOfMonth) });
          }
          startOfWeek = endOfWeek;
          startOfWeek.add(1, 'day');
        }
        for (let i = 0; i < weeks.length; i++) {
          const currentWeek = weeks[i];
          console.log(
            `Iterating for week of ${currentWeek.start.format(
              'MM-DD-yyyy'
            )} to ${currentWeek.end.format('MM-DD-yyyy')}`
          );
          const closedDatesListForMonth: ClosedDateInterface[] =
            await this.getClosedDatesForMonth(
              collectionOperation,
              startOfMonth,
              endOfMonth,
              updateCalendarDTO.tenant_id
            );
          console.log('1', closedDatesListForMonth);
          const weekItems = await this.getValuesInWeek(
            updateCalendarDTO.daysValues,
            moment(currentWeek.start),
            moment(currentWeek.end),
            closedDatesListForMonth
          );

          const dailyGoalCalendarItems =
            await this.dailyGoalsCalenderRepository.find({
              select: ['id', 'date', 'goal_amount', 'tenant_id'],
              where: {
                collection_operation: {
                  id: updateCalendarDTO.collectionOperation,
                },
                procedure_type: { id: updateCalendarDTO.procedureType },
                date: Between(
                  currentWeek.start.format('yyyy-MM-DD'),
                  currentWeek.end.format('yyyy-MM-DD')
                ),
                is_archived: false,
                tenant: { id: updateCalendarDTO.tenant_id },
              },
            });

          const otherItems = [];
          let allocatedPercentage = 0;
          let diffrenceToAllocateToOthers = 0;
          for (let i = 0; i < dailyGoalCalendarItems.length; i++) {
            const item = dailyGoalCalendarItems[i];
            const itemDate = parseInt(moment(item.date).format('DD'));
            if (
              weekItems[itemDate.toString()] &&
              Math.round(item.goal_amount) !==
                Math.round(weekItems[itemDate.toString()])
            ) {
              console.log(
                `User updated the item on date ${itemDate} from ${
                  item.goal_amount
                } to ${weekItems[itemDate.toString()]}`
              );
              diffrenceToAllocateToOthers =
                item.goal_amount - Math.round(weekItems[itemDate.toString()]);
              redistrubutesValues[itemDate.toString()] = Math.round(
                weekItems[itemDate.toString()]
              );
            } else {
              otherItems.push(item);
              const itemDate = parseInt(moment(item.date).format('DD'));
              const itemDay = moment(item.date)
                .format('dddd')
                .toLocaleLowerCase();
              allocatedPercentage += dailyValueForEachDay[itemDay];
            }
          }
          const remainingPercentage = 100 - allocatedPercentage;

          console.log(
            `Remaining allocation percentage over week ${allocatedPercentage} to be distributed based on daily alloaction percentage`
          );
          for (const item of otherItems) {
            const itemDate = parseInt(moment(item.date).format('DD'));
            const itemDay = moment(item.date)
              .format('dddd')
              .toLocaleLowerCase();
            const allocatedPercentageForDay = dailyValueForEachDay[itemDay];
            console.log(
              `Allocated Percentage for ${itemDate} ${itemDay} is ${allocatedPercentageForDay}`
            );
            const proportionateAllocation =
              (allocatedPercentageForDay / allocatedPercentage) *
              (remainingPercentage / 100);
            const toAddAmount =
              (proportionateAllocation + allocatedPercentageForDay / 100) *
              diffrenceToAllocateToOthers;
            console.log(
              `Adding ${toAddAmount} to ${
                item.goal_amount
              } now becomes ${Math.round(
                item.goal_amount + toAddAmount
              )} on date  ${itemDate} ${itemDay}`
            );
            redistrubutesValues[itemDate.toString()] = Math.round(
              item.goal_amount + toAddAmount
            );
          }
        }
      }
      if (updateCalendarDTO.allocatedDiffrenceOver === 'month') {
        // console.log('Allocate over month');
        let correctStartDateForAllocation, correctEndDateForAllocation;
        // const startOfMonth = moment(
        //   new Date(updateCalendarDTO.year, updateCalendarDTO.month, 1)
        // ).startOf('month');

        // console.log(
        //   `Allocation Over month for dates ${startOfMonth.format(
        //     'MM-DD-YYYY'
        //   )} to ${endOfMonth.format('MM-DD-YYYY')}`
        // );

        const weeks = [];
        let startOfWeek = moment(
          new Date(updateCalendarDTO.year, updateCalendarDTO.month, 1)
        ).startOf('month');
        const closedDatesListForMonth: ClosedDateInterface[] =
          await this.getClosedDatesForMonth(
            collectionOperation,
            startOfMonth.toDate(),
            endOfMonth.toDate(),
            updateCalendarDTO.tenant_id
          );

        while (startOfWeek.toDate() < endOfMonth.toDate()) {
          const endOfWeek = moment(startOfWeek).endOf('week');
          if (endOfWeek.isSameOrBefore(endOfMonth)) {
            weeks.push({ start: moment(startOfWeek), end: moment(endOfWeek) });
          } else {
            weeks.push({ start: moment(startOfWeek), end: moment(endOfMonth) });
          }
          startOfWeek = endOfWeek;
          startOfWeek.add(1, 'day');
        }
        const updatedItems = [];

        for (let i = 0; i < weeks.length; i++) {
          const currentWeek = weeks[i];
          // console.log(
          //   `Iterating for week of ${currentWeek.start.format(
          //     'MM-DD-yyyy'
          //   )} to ${currentWeek.end.format('MM-DD-yyyy')}`
          // );
          const weekItems = await this.getValuesInWeek(
            updateCalendarDTO.daysValues,
            moment(currentWeek.start),
            moment(currentWeek.end),
            closedDatesListForMonth
          );
          const dailyGoalCalendarItems =
            await this.dailyGoalsCalenderRepository.find({
              where: {
                collection_operation: {
                  id: updateCalendarDTO.collectionOperation,
                },
                procedure_type: { id: updateCalendarDTO.procedureType },
                date: Between(
                  currentWeek.start.format('yyyy-MM-DD'),
                  currentWeek.end.format('yyyy-MM-DD')
                ),
                is_archived: false,
                tenant: { id: updateCalendarDTO.tenant_id },
              },
            });

          for (let i = 0; i < dailyGoalCalendarItems.length; i++) {
            const item = dailyGoalCalendarItems[i];
            const itemDate = parseInt(moment(item.date).format('DD'));
            if (
              !this.isClosed(moment(item.date), closedDatesListForMonth) &&
              weekItems[itemDate.toString()] &&
              Math.round(item.goal_amount) !==
                Math.round(weekItems[itemDate.toString()])
            ) {
              console.log(
                `User updated the item on date ${itemDate} from ${
                  item.goal_amount
                } to ${weekItems[itemDate.toString()]}`
              );
              updatedItems.push(item);
              redistrubutesValues[itemDate.toString()] = Math.round(
                weekItems[itemDate.toString()]
              );
            }
          }
        }
        const updatedItemDates = updatedItems.map((item) => moment(item.date));
        let breakParent = false;
        let sumOfAllocationDaysPercentage = 0;
        let diffrenceRemaining = 0;
        for (
          const i = moment(endOfMonth);
          i >= startOfMonth && !breakParent;
          i.subtract(1, 'day')
        ) {
          let diffrenceForIteration = updateCalendarDTO.diffrence;
          // console.log(
          //   `Try to allocate the diffrenece ${
          //     updateCalendarDTO.diffrence
          //   } from ${i.format('MM-DD-YYYY')} to ${startOfMonth.format(
          //     'MM-DD-YYYY'
          //   )}`
          // );
          sumOfAllocationDaysPercentage = 0;
          for (let j = moment(startOfMonth); j <= i; j.add(1, 'day')) {
            if (
              updatedItemDates.filter(
                (item) => item.toString() === j.toString()
              ).length === 0
            ) {
              if (!this.isClosed(j, closedDatesListForMonth)) {
                const itemDate = parseInt(moment(j).format('DD'));
                const itemDay = moment(j).format('dddd').toLocaleLowerCase();

                const dailyPercentageForDay = dailyValueForEachDay[itemDay];
                sumOfAllocationDaysPercentage += dailyPercentageForDay;
              }
            }
          }
          // console.log(
          //   `Sum of Allocation percentages from ${startOfMonth.format(
          //     'MM-DD-YYYY'
          //   )} to ${i.format('MM-DD-YYYY')}is ${sumOfAllocationDaysPercentage}`
          // );
          for (let j = moment(startOfMonth); j <= i; j.add(1, 'day')) {
            if (
              updatedItemDates.filter(
                (item) => item.toString() === j.toString()
              ).length === 0
            ) {
              if (!this.isClosed(j, closedDatesListForMonth)) {
                const itemDate = parseInt(moment(j).format('DD'));
                const itemDay = moment(j).format('dddd').toLocaleLowerCase();

                const dailyPercentageForDay = dailyValueForEachDay[itemDay];
                const percentageForAllocation =
                  (dailyPercentageForDay / sumOfAllocationDaysPercentage) * 100;
                const goalDiffrenceToAdd = Math.round(
                  (percentageForAllocation / 100) * updateCalendarDTO.diffrence
                );
                // console.log(`Goal diffrence to Add ${goalDiffrenceToAdd}`);
                // if (goalDiffrenceToAdd < 0)
                //   diffrenceForIteration -= goalDiffrenceToAdd;
                // else if (goalDiffrenceToAdd > 0)
                diffrenceForIteration -= goalDiffrenceToAdd;
                // console.log(
                //   `Diffrence for Iteration is ${diffrenceForIteration}`
                // );
                if (
                  diffrenceForIteration === 1 ||
                  diffrenceForIteration === -1 ||
                  diffrenceForIteration === 0
                ) {
                  diffrenceRemaining = diffrenceForIteration;
                  correctEndDateForAllocation = moment(j);
                  correctStartDateForAllocation = moment(startOfMonth);
                  // console.log(
                  //   'Result',
                  //   sumOfAllocationDaysPercentage,
                  //   correctStartDateForAllocation,
                  //   correctEndDateForAllocation
                  // );
                  breakParent = true;
                  break;
                }
              }
            }
          }
        }

        if (correctStartDateForAllocation && correctEndDateForAllocation)
          console.log(
            `Allocation dates are from ${correctStartDateForAllocation.format(
              'MM-DD-YYYY'
            )} to ${correctEndDateForAllocation.format('MM-DD-YYYY')}`
          );
        for (
          let i = moment(correctStartDateForAllocation);
          i <= correctEndDateForAllocation;
          i.add(1, 'day')
        ) {
          // console.log(
          //   `Is Date ${moment(i).format(
          //     'MM-DD-YYYY'
          //   )}  closed =  ${this.isClosed(moment(i), closedDatesListForMonth)}`
          // );
          if (!this.isClosed(moment(i), closedDatesListForMonth)) {
            let diffrenceForIteration = updateCalendarDTO.diffrence;

            if (
              updatedItemDates.filter(
                (item) => item.toString() === i.toString()
              ).length === 0
            ) {
              const itemDate = parseInt(moment(i).format('DD'));
              const itemDay = moment(i).format('dddd').toLocaleLowerCase();

              const dailyPercentageForDay = dailyValueForEachDay[itemDay];
              const percentageForAllocation =
                (dailyPercentageForDay / sumOfAllocationDaysPercentage) * 100;
              const goalDiffrenceToAdd = Math.round(
                (percentageForAllocation / 100) * updateCalendarDTO.diffrence
              );
              // console.log(`Adding ${goalDiffrenceToAdd} to ${itemDate}`);
              diffrenceForIteration -= goalDiffrenceToAdd;
              const dailyItemToUpdate =
                await this.dailyGoalsCalenderRepository.findOne({
                  where: {
                    collection_operation: {
                      id: updateCalendarDTO.collectionOperation,
                    },
                    procedure_type: {
                      id: updateCalendarDTO.procedureType,
                    },
                    date: Equal(i.toDate()),
                    is_archived: false,
                    tenant: { id: updateCalendarDTO.tenant_id },
                  },
                });
              // console.log(dailyItemToUpdate);
              if (dailyItemToUpdate)
                redistrubutesValues[itemDate.toString()] = Math.round(
                  dailyItemToUpdate.goal_amount + goalDiffrenceToAdd
                );
              // dailyItemToUpdate.goal_amount =
              //   dailyItemToUpdate.goal_amount + goalDiffrenceToAdd;
              // await queryRunner.manager.save(dailyItemToUpdate);
            }
          }
        }
        // console.log(`Diffrence remaining ${diffrenceRemaining}`);
        if (diffrenceRemaining !== 0) {
          let isAllocated = false;
          const nextDates = moment(correctEndDateForAllocation).add(1, 'day');
          // console.log(
          //   `End Of Month ${moment(endOfMonth).format('MM-DD-YYYY')}`
          // );
          // console.log(`NextDates ${moment(nextDates).format('MM-DD-YYYY')}`);
          // console.log(`Try to allocate minute diffrence in next Days`);
          while (nextDates <= endOfMonth) {
            // console.log(
            //   `Try to allocate on ${moment(nextDates).format('MM-DD-YYYY')}`
            // );
            const itemDate = parseInt(moment(nextDates).format('DD'));
            if (!this.isClosed(nextDates, closedDatesListForMonth)) {
              // console.log(`${itemDate} is not closed Asjust it`);
              const dailyItemToUpdate =
                await this.dailyGoalsCalenderRepository.findOne({
                  where: {
                    collection_operation: {
                      id: updateCalendarDTO.collectionOperation,
                    },
                    procedure_type: {
                      id: updateCalendarDTO.procedureType,
                    },
                    date: Equal(nextDates.toDate()),
                    is_archived: false,
                    tenant: { id: updateCalendarDTO.tenant_id },
                  },
                });
              if (dailyItemToUpdate) {
                redistrubutesValues[itemDate.toString()] = Math.round(
                  dailyItemToUpdate.goal_amount + diffrenceRemaining
                );
                isAllocated = true;
                break;
              }
            }
            nextDates.add(1, 'day');
          }
          const previousDates = moment(correctStartDateForAllocation);
          if (!isAllocated) {
            // console.log(`Try to allocate minute diffrence in previous Days`);
            // console.log(
            //   `Start Of Month ${moment(startOfMonth).format('MM-DD-YYYY')}`
            // );
            // console.log(
            //   `Previous ${moment(previousDates).format('MM-DD-YYYY')}`
            // );
            while (previousDates > startOfMonth) {
              const itemDate = parseInt(moment(previousDates).format('DD'));
              if (!this.isClosed(nextDates, closedDatesListForMonth)) {
                // console.log(`${itemDate} is not closed Asjust it`);
                const dailyItemToUpdate =
                  await this.dailyGoalsCalenderRepository.findOne({
                    where: {
                      collection_operation: {
                        id: updateCalendarDTO.collectionOperation,
                      },
                      procedure_type: {
                        id: updateCalendarDTO.procedureType,
                      },
                      date: Equal(previousDates.toDate()),
                      is_archived: false,
                      tenant: { id: updateCalendarDTO.tenant_id },
                    },
                  });
                if (dailyItemToUpdate) {
                  redistrubutesValues[itemDate.toString()] = Math.round(
                    dailyItemToUpdate.goal_amount + diffrenceRemaining
                  );
                  isAllocated = true;
                  break;
                }
              }
              previousDates.subtract(1, 'day');
            }
          }
          if (!isAllocated) {
            // console.log(
            //   `Try to allocate minute diffrence in previous adjustments as no day is available`
            // );

            for (
              let i = correctStartDateForAllocation;
              i <= correctEndDateForAllocation;
              i.add(1, 'day')
            ) {
              const itemDate = parseInt(moment(i).format('DD'));
              if (!this.isClosed(moment(i), closedDatesListForMonth)) {
                // console.log(`${itemDate} is not closed Asjust it`);
                const dailyItemToUpdate =
                  await this.dailyGoalsCalenderRepository.findOne({
                    where: {
                      collection_operation: {
                        id: updateCalendarDTO.collectionOperation,
                      },
                      procedure_type: {
                        id: updateCalendarDTO.procedureType,
                      },
                      date: Equal(i.toDate()),
                      is_archived: false,
                      tenant: { id: updateCalendarDTO.tenant_id },
                    },
                  });
                if (
                  dailyItemToUpdate &&
                  updatedItemDates.filter((item) => item.isSame(i)).length == 0
                ) {
                  // console.log('Adjusting');
                  redistrubutesValues[itemDate.toString()] = Math.round(
                    redistrubutesValues[itemDate.toString()] +
                      diffrenceRemaining
                  );
                  break;
                }
              }
            }
          }
        }
      }

      // console.log({ redistrubutesValues });
      return resSuccess(
        'Daily goals calendar updated distributon.',
        'success',
        200,
        redistrubutesValues
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
    }
  }

  async getRedistributedItems(updateCalendarDTO: UpdateDailyGoalsCalendarDto) {
    const {
      collectionOperation,
      procedureType,
      year,
      month,
      tenant_id,
      daysValues,
    } = updateCalendarDTO;
    let { daysValues: redistrubutesValues } = updateCalendarDTO;
    try {
      const startOfMonth = moment(new Date(year, month, 1)).startOf('month');
      const endOfMonth = moment(new Date(year, month, 1)).endOf('month');
      const monthly_goal = await this.getAllMonthlyGoalsForYear(
        year,
        procedureType,
        collectionOperation
      );
      const monthly_value =
        monthly_goal?.[0]?.[moment(startOfMonth).format('MMMM').toLowerCase()];

      const closedDatesListForMonth: ClosedDateInterface[] =
        await this.getClosedDatesForMonth(
          collectionOperation,
          startOfMonth.toDate(),
          endOfMonth.toDate(),
          updateCalendarDTO.tenant_id
        );
      const dailyAllocation = await this.getDailyAllocationForMonth(
        month,
        year,
        procedureType,
        collectionOperation,
        tenant_id
      );
      if (updateCalendarDTO.allocatedDiffrenceOver === 'month') {
        const updatedItems = [];
        let updatedItemsGoalSum = 0;
        const dailyGoalCalendarItems =
          await this.dailyGoalsCalenderRepository.find({
            where: {
              collection_operation: {
                id: collectionOperation,
              },
              procedure_type: { id: procedureType },
              date: Between(startOfMonth.toDate(), endOfMonth.toDate()),
              is_archived: false,
              tenant: { id: tenant_id },
            },
          });

        for (let i = 0; i < dailyGoalCalendarItems.length; i++) {
          const item = dailyGoalCalendarItems[i];
          const itemDate = parseInt(moment(item.date).format('DD'));
          if (
            !this.isClosed(moment(item.date), closedDatesListForMonth) && [
              itemDate.toString(),
            ] &&
            Math.round(item.goal_amount) !==
              Math.round(daysValues[itemDate.toString()])
          ) {
            updatedItems.push(item);
            updatedItemsGoalSum += daysValues[itemDate.toString()];
          }
        }
        const updatedItemDates = updatedItems.map((item) => moment(item.date));

        const toReallocateGoal = monthly_value - updatedItemsGoalSum;
        console.log({ toReallocateGoal });
        let reallocateDiffrence = 0;

        let sumOfAllocationDaysPercentage = 0;

        const startMonth = moment(startOfMonth);
        const endMonth = moment(endOfMonth);
        while (startMonth.isSameOrBefore(endMonth)) {
          const itemDay = startMonth.format('dddd').toLocaleLowerCase();
          if (
            updatedItemDates.filter((item) => item.isSame(startMonth)).length ==
              0 &&
            !this.isClosed(moment(startMonth), closedDatesListForMonth)
          )
            sumOfAllocationDaysPercentage += dailyAllocation[itemDay];
          startMonth.add(1, 'day');
        }

        while (startOfMonth.isSameOrBefore(endOfMonth)) {
          const itemDate = parseInt(startOfMonth.format('DD'));
          const itemDay = startOfMonth.format('dddd').toLocaleLowerCase();
          if (
            updatedItemDates.filter((item) => item.isSame(startOfMonth))
              .length == 0 &&
            !this.isClosed(moment(startOfMonth), closedDatesListForMonth)
          ) {
            const dailyPercentageForDay = dailyAllocation[itemDay];
            const percentageForAllocation =
              dailyPercentageForDay / sumOfAllocationDaysPercentage;
            const goalDiffrenceToAdd = Math.round(
              percentageForAllocation * toReallocateGoal
            );
            redistrubutesValues[itemDate.toString()] = goalDiffrenceToAdd;
            reallocateDiffrence += goalDiffrenceToAdd;
          }
          startOfMonth.add(1, 'day');
        }

        // console.log({
        //   monthly_value,
        //   updatedItemsGoalSum,
        //   reallocateDiffrence,
        // });
        redistrubutesValues = await this.getRedistributedMonth(
          collectionOperation,
          redistrubutesValues,
          year,
          month,
          procedureType,
          monthly_value - updatedItemsGoalSum - reallocateDiffrence,
          tenant_id,
          dailyAllocation,
          updatedItemDates
        );
      }

      if (updateCalendarDTO.allocatedDiffrenceOver === 'week') {
        // console.log('Allocation Over week');
        const weeks = [];
        let startOfWeek = moment(
          new Date(updateCalendarDTO.year, updateCalendarDTO.month, 1)
        ).startOf('month');
        while (startOfWeek.toDate() < endOfMonth.toDate()) {
          const endOfWeek = moment(startOfWeek).endOf('week');
          if (endOfWeek.isSameOrBefore(endOfMonth)) {
            weeks.push({ start: moment(startOfWeek), end: moment(endOfWeek) });
          } else {
            weeks.push({ start: moment(startOfWeek), end: moment(endOfMonth) });
          }
          startOfWeek = endOfWeek;
          startOfWeek.add(1, 'day');
        }

        for (let i = 0; i < weeks.length; i++) {
          const currentWeek = weeks[i];
          // console.log(
          //   `Iterating for week of ${currentWeek.start.format(
          //     'MM-DD-yyyy'
          //   )} to ${currentWeek.end.format('MM-DD-yyyy')}`
          // );
          const weekItems = await this.getValuesInWeek(
            updateCalendarDTO.daysValues,
            moment(currentWeek.start),
            moment(currentWeek.end),
            closedDatesListForMonth
          );
          // console.log({ weekItems });
          const dailyGoalCalendarItems =
            await this.dailyGoalsCalenderRepository.find({
              select: ['id', 'date', 'goal_amount'],
              where: {
                collection_operation: {
                  id: updateCalendarDTO.collectionOperation,
                },
                procedure_type: { id: updateCalendarDTO.procedureType },
                date: Between(
                  currentWeek.start.format('yyyy-MM-DD'),
                  currentWeek.end.format('yyyy-MM-DD')
                ),
                is_archived: false,
                tenant: { id: updateCalendarDTO.tenant_id },
              },
            });

          const otherItems = [];
          let allocatedPercentage = 0;
          let diffrenceToAllocateToOthers = 0;
          for (let i = 0; i < dailyGoalCalendarItems.length; i++) {
            const item = dailyGoalCalendarItems[i];
            const itemDate = parseInt(moment(item.date).format('DD'));
            if (
              weekItems[itemDate.toString()] &&
              Math.round(item.goal_amount) !==
                Math.round(weekItems[itemDate.toString()])
            ) {
              // console.log(
              //   `User updated the item on date ${itemDate} from ${
              //     item.goal_amount
              //   } to ${weekItems[itemDate.toString()]}`
              // );
              diffrenceToAllocateToOthers =
                item.goal_amount - Math.round(weekItems[itemDate.toString()]);
              redistrubutesValues[itemDate.toString()] = Math.round(
                weekItems[itemDate.toString()]
              );
            } else {
              otherItems.push(item);
              const itemDate = parseInt(moment(item.date).format('DD'));
              const itemDay = moment(item.date)
                .format('dddd')
                .toLocaleLowerCase();
              allocatedPercentage += dailyAllocation[itemDay];
            }
          }
          const remainingPercentage = 100 - allocatedPercentage;

          // console.log(
          //   `Remaining allocation percentage over week ${allocatedPercentage} to be distributed based on daily alloaction percentage`
          // );
          // console.log({ otherItems });
          for (const item of otherItems) {
            const itemDate = parseInt(moment(item.date).format('DD'));
            const itemDay = moment(item.date)
              .format('dddd')
              .toLocaleLowerCase();
            const allocatedPercentageForDay = dailyAllocation[itemDay];
            // console.log(
            //   `Allocated Percentage for ${itemDate} ${itemDay} is ${allocatedPercentageForDay}`
            // );
            const proportionateAllocation =
              (allocatedPercentageForDay / allocatedPercentage) *
              (remainingPercentage / 100);
            const toAddAmount =
              (proportionateAllocation + allocatedPercentageForDay / 100) *
              diffrenceToAllocateToOthers;
            // console.log(
            //   `Adding ${toAddAmount} to ${
            //     item.goal_amount
            //   } now becomes ${Math.round(
            //     item.goal_amount + toAddAmount
            //   )} on date  ${itemDate} ${itemDay}`
            // );
            redistrubutesValues[itemDate.toString()] = Math.round(
              item.goal_amount + toAddAmount
            );
          }
        }
      }
      return resSuccess(
        'Daily goals calendar updated distributon.',
        'success',
        200,
        redistrubutesValues
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    } finally {
    }
  }

  async getRedistributedMonth(
    collectionOperation,
    redistrubutesValues,
    year,
    month,
    procedureType,
    diffrence,
    tenant_id,
    dailyAllocation,
    updatedItemDates
  ) {
    // console.log(`--------- ${diffrence}`);
    const startOfMonth = moment(new Date(year, month, 1)).startOf('month');
    const endOfMonth = moment(new Date(year, month, 1)).endOf('month');
    // console.log(
    //   `${startOfMonth.format('MM-DD-YYYY')} to ${endOfMonth.format(
    //     'MM-DD-YYYY'
    //   )}`
    // );

    let correctStartDateForAllocation, correctEndDateForAllocation;
    const weeks = [];
    let startOfWeek = moment(new Date(year, month, 1)).startOf('month');
    while (startOfWeek.toDate() < endOfMonth.toDate()) {
      const endOfWeek = moment(startOfWeek).endOf('week');
      if (endOfWeek.isSameOrBefore(endOfMonth)) {
        weeks.push({ start: moment(startOfWeek), end: moment(endOfWeek) });
      } else {
        weeks.push({ start: moment(startOfWeek), end: moment(endOfMonth) });
      }
      startOfWeek = endOfWeek;
      startOfWeek.add(1, 'day');
    }
    // console.log({ weeks });
    const closedDatesListForMonth: ClosedDateInterface[] =
      await this.getClosedDatesForMonth(
        collectionOperation,
        startOfMonth.toDate(),
        endOfMonth.toDate(),
        tenant_id
      );
    // console.log({ closedDatesListForMonth });
    let breakParent = false;
    let sumOfAllocationDaysPercentage = 0;
    let diffrenceRemaining = 0;
    for (
      const i = moment(endOfMonth);
      i >= startOfMonth && !breakParent;
      i.subtract(1, 'day')
    ) {
      let diffrenceForIteration = diffrence;
      sumOfAllocationDaysPercentage = 0;
      for (let j = moment(startOfMonth); j <= i; j.add(1, 'day')) {
        if (!this.isClosed(j, closedDatesListForMonth)) {
          const itemDate = parseInt(moment(j).format('DD'));
          const itemDay = moment(j).format('dddd').toLocaleLowerCase();

          const dailyPercentageForDay = dailyAllocation[itemDay];
          sumOfAllocationDaysPercentage += dailyPercentageForDay;
        }
      }
      for (let j = moment(startOfMonth); j <= i; j.add(1, 'day')) {
        // console.log(
        //   'Length Updated',
        //   updatedItemDates?.filter((item) => item.isSame(j)).length,
        //   j
        // );
        if (updatedItemDates?.filter((item) => item.isSame(j)).length == 0)
          if (!this.isClosed(j, closedDatesListForMonth)) {
            const itemDate = parseInt(moment(j).format('DD'));
            const itemDay = moment(j).format('dddd').toLocaleLowerCase();

            const dailyPercentageForDay = dailyAllocation[itemDay];
            const percentageForAllocation =
              (dailyPercentageForDay / sumOfAllocationDaysPercentage) * 100;
            const goalDiffrenceToAdd = Math.round(
              (percentageForAllocation / 100) * diffrence
            );
            // console.log(`Goal diffrence to Add ${goalDiffrenceToAdd}`);
            // if (goalDiffrenceToAdd < 0)
            //   diffrenceForIteration -= goalDiffrenceToAdd;
            // else if (goalDiffrenceToAdd > 0)
            diffrenceForIteration -= goalDiffrenceToAdd;
            // console.log(
            //   `Diffrence for Iteration is ${diffrenceForIteration}`
            // );
            if (
              diffrenceForIteration === 1 ||
              diffrenceForIteration === -1 ||
              diffrenceForIteration === 0
            ) {
              diffrenceRemaining = diffrenceForIteration;
              correctEndDateForAllocation = moment(j);
              correctStartDateForAllocation = moment(startOfMonth);
              // console.log(
              //   'Result',
              //   sumOfAllocationDaysPercentage,
              //   correctStartDateForAllocation,
              //   correctEndDateForAllocation
              // );
              breakParent = true;
              break;
            }
          }
      }
    }
    // console.log({
    //   correctStartDateForAllocation,
    //   correctEndDateForAllocation,
    // });
    if (correctStartDateForAllocation && correctEndDateForAllocation)
      console.log(
        `Allocation dates are from ${correctStartDateForAllocation.format(
          'MM-DD-YYYY'
        )} to ${correctEndDateForAllocation.format('MM-DD-YYYY')}`
      );
    for (
      let i = moment(correctStartDateForAllocation);
      i <= correctEndDateForAllocation;
      i.add(1, 'day')
    ) {
      // console.log(
      //   `Is Date ${moment(i).format(
      //     'MM-DD-YYYY'
      //   )}  closed =  ${this.isClosed(moment(i), closedDatesListForMonth)}`
      // );
      if (updatedItemDates?.filter((item) => item.isSame(i)).length == 0)
        if (!this.isClosed(moment(i), closedDatesListForMonth)) {
          let diffrenceForIteration = diffrence;

          const itemDate = parseInt(moment(i).format('DD'));
          const itemDay = moment(i).format('dddd').toLocaleLowerCase();

          const dailyPercentageForDay = dailyAllocation[itemDay];
          const percentageForAllocation =
            (dailyPercentageForDay / sumOfAllocationDaysPercentage) * 100;
          const goalDiffrenceToAdd = Math.round(
            (percentageForAllocation / 100) * diffrence
          );
          // console.log(`Adding ${goalDiffrenceToAdd} to ${itemDate}`);
          diffrenceForIteration -= goalDiffrenceToAdd;
          const dailyItemToUpdate =
            await this.dailyGoalsCalenderRepository.findOne({
              where: {
                collection_operation: {
                  id: collectionOperation,
                },
                procedure_type: {
                  id: procedureType,
                },
                date: Equal(i.toDate()),
                is_archived: false,
                tenant: { id: tenant_id },
              },
            });
          // console.log(dailyItemToUpdate);
          if (redistrubutesValues[itemDate])
            redistrubutesValues[itemDate.toString()] = Math.round(
              redistrubutesValues[itemDate] + goalDiffrenceToAdd
            );
          // dailyItemToUpdate.goal_amount =
          //   dailyItemToUpdate.goal_amount + goalDiffrenceToAdd;
          // await queryRunner.manager.save(dailyItemToUpdate);
        }
    }

    console.log(`Diffrence remaining ${diffrenceRemaining}`);
    if (diffrenceRemaining !== 0) {
      let isAllocated = false;
      const nextDates = moment(correctEndDateForAllocation).add(1, 'day');
      // console.log(
      //   `End Of Month ${moment(endOfMonth).format('MM-DD-YYYY')}`
      // );
      console.log(`NextDates ${moment(nextDates).format('MM-DD-YYYY')}`);
      console.log(`Try to allocate minute diffrence in next Days`);
      while (nextDates <= endOfMonth) {
        // console.log(
        //   `Try to allocate on ${moment(nextDates).format('MM-DD-YYYY')}`
        // );
        const itemDate = parseInt(moment(nextDates).format('DD'));
        if (!this.isClosed(nextDates, closedDatesListForMonth)) {
          // console.log(`${itemDate} is not closed Asjust it`);
          const dailyItemToUpdate =
            await this.dailyGoalsCalenderRepository.findOne({
              where: {
                collection_operation: {
                  id: collectionOperation,
                },
                procedure_type: {
                  id: procedureType,
                },
                date: Equal(nextDates.toDate()),
                is_archived: false,
                tenant: { id: tenant_id },
              },
            });
          if (redistrubutesValues[itemDate]) {
            redistrubutesValues[itemDate.toString()] = Math.round(
              redistrubutesValues[itemDate] + diffrenceRemaining
            );
            isAllocated = true;
            break;
          }
        }
        nextDates.add(1, 'day');
      }
      const previousDates = moment(correctStartDateForAllocation);
      if (!isAllocated) {
        // console.log(`Try to allocate minute diffrence in previous Days`);
        // console.log(
        //   `Start Of Month ${moment(startOfMonth).format('MM-DD-YYYY')}`
        // );
        // console.log(
        //   `Previous ${moment(previousDates).format('MM-DD-YYYY')}`
        // );
        while (previousDates > startOfMonth) {
          const itemDate = parseInt(moment(previousDates).format('DD'));
          if (!this.isClosed(nextDates, closedDatesListForMonth)) {
            // console.log(`${itemDate} is not closed Asjust it`);
            const dailyItemToUpdate =
              await this.dailyGoalsCalenderRepository.findOne({
                where: {
                  collection_operation: {
                    id: collectionOperation,
                  },
                  procedure_type: {
                    id: procedureType,
                  },
                  date: Equal(previousDates.toDate()),
                  is_archived: false,
                  tenant: { id: tenant_id },
                },
              });
            if (redistrubutesValues[itemDate]) {
              redistrubutesValues[itemDate.toString()] = Math.round(
                redistrubutesValues[itemDate] + diffrenceRemaining
              );
              isAllocated = true;
              break;
            }
          }
          previousDates.subtract(1, 'day');
        }
      }
      if (!isAllocated) {
        // console.log(
        //   `Try to allocate minute diffrence in previous adjustments as no day is available`
        // );
        for (
          let i = correctStartDateForAllocation;
          i <= correctEndDateForAllocation;
          i.add(1, 'day')
        ) {
          const itemDate = parseInt(moment(i).format('DD'));
          if (updatedItemDates?.filter((item) => item.isSame(i)).length == 0)
            if (!this.isClosed(moment(i), closedDatesListForMonth)) {
              // console.log(`${itemDate} is not closed Asjust it`);
              if (redistrubutesValues[itemDate.toString()]) {
                // console.log('Adjusting');
                redistrubutesValues[itemDate.toString()] = Math.round(
                  redistrubutesValues[itemDate.toString()] + diffrenceRemaining
                );
                break;
              }
            }
        }
      }
    }
    return redistrubutesValues;
  }

  async getAllMonthlyGoalsForYear(
    year: number,
    procedure_type_id: bigint,
    collection_operation
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
      mgc.business_unit_id = (${collection_operation})
    GROUP BY
      mg.year
    ORDER BY mg.year
  `;

    const monthly_goal = await this.monthlyGoalsRepository.query(query);
    return monthly_goal;
  }

  getNumberOfDaysIndexBetweenDates = (
    currentDate,
    endDate,
    day,
    updatedItemDates
  ) => {
    let numberOfDays = 0;
    while (currentDate <= endDate) {
      if (
        currentDate.getDay() === day &&
        updatedItemDates.filter((item) => item.isSame(moment(currentDate)))
          .length == 0
      ) {
        numberOfDays += 1;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return numberOfDays;
  };

  getDailyValueOnWeekday = async (
    monthly_value,
    allocation,
    startOfMonth: Moment,
    endOfMonth: Moment,
    updatedItemDates
  ) => {
    return {
      sunday:
        (monthly_value * (allocation.sunday / 100)) /
        this.getNumberOfDaysIndexBetweenDates(
          startOfMonth.toDate(),
          endOfMonth.toDate(),
          0,
          updatedItemDates
        ),
      monday:
        (monthly_value * (allocation.monday / 100)) /
        this.getNumberOfDaysIndexBetweenDates(
          startOfMonth.toDate(),
          endOfMonth.toDate(),
          1,
          updatedItemDates
        ),
      tuesday:
        (monthly_value * (allocation.tuesday / 100)) /
        this.getNumberOfDaysIndexBetweenDates(
          startOfMonth.toDate(),
          endOfMonth.toDate(),
          2,
          updatedItemDates
        ),
      wednesday:
        (monthly_value * (allocation.wednesday / 100)) /
        this.getNumberOfDaysIndexBetweenDates(
          startOfMonth.toDate(),
          endOfMonth.toDate(),
          3,
          updatedItemDates
        ),
      thursday:
        (monthly_value * (allocation.thursday / 100)) /
        this.getNumberOfDaysIndexBetweenDates(
          startOfMonth.toDate(),
          endOfMonth.toDate(),
          4,
          updatedItemDates
        ),
      friday:
        (monthly_value * (allocation.friday / 100)) /
        this.getNumberOfDaysIndexBetweenDates(
          startOfMonth.toDate(),
          endOfMonth.toDate(),
          5,
          updatedItemDates
        ),
      saturday:
        (monthly_value * (allocation.saturday / 100)) /
        this.getNumberOfDaysIndexBetweenDates(
          startOfMonth.toDate(),
          endOfMonth.toDate(),
          6,
          updatedItemDates
        ),
    };
  };

  async getDailyAllocationForMonth(
    month,
    year,
    procedure_type,
    collection_operation_id,
    tenant_id
  ) {
    const collection_operation = Array.isArray(collection_operation_id)
      ? collection_operation_id
      : [collection_operation_id];

    let daily_goal_allocation = await this.dailyGoalsAllocationRepository
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
        `dailyGoalsAllocation.is_archived = false AND procedure_type.id =${procedure_type}`
      )
      .andWhere(
        `dailyGoalsAllocation.tenant_id = ${tenant_id} AND month = ${month} AND year = ${year}`
      )
      .orderBy('year', 'DESC')
      .addOrderBy('month', 'DESC')
      .getOne();

    if (!daily_goal_allocation) {
      daily_goal_allocation = await this.dailyGoalsAllocationRepository
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
          `dailyGoalsAllocation.is_archived = false AND procedure_type.id =${procedure_type}`
        )
        .andWhere(
          `dailyGoalsAllocation.tenant_id = ${tenant_id} AND month < ${month} AND year = ${year}`
        )
        .orderBy('year', 'DESC')
        .addOrderBy('month', 'DESC')
        .getOne();

      if (!daily_goal_allocation) {
        daily_goal_allocation = await this.dailyGoalsAllocationRepository
          .createQueryBuilder('dailyGoalsAllocation')
          .leftJoinAndSelect(
            'dailyGoalsAllocation.collection_operation',
            'collectionOperation'
          )
          .leftJoinAndSelect(
            'dailyGoalsAllocation.procedure_type',
            'procedure_type'
          )
          .where(
            `collectionOperation.id IN (${collection_operation.join(',')})`
          )
          .andWhere(
            `dailyGoalsAllocation.is_archived = false AND procedure_type.id =${procedure_type}`
          )
          .andWhere(
            `dailyGoalsAllocation.tenant_id = ${tenant_id} AND year < ${year}`
          )
          .orderBy('year', 'DESC')
          .addOrderBy('month', 'DESC')
          .getOne();
      }
    }
    return daily_goal_allocation;
  }

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
        'close_date_collection_operations.collection_operation_id IN (:collection_operation_id)',
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
}
