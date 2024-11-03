import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import moment from 'moment';
import { BookingRules } from '../entities/booking-rules.entity';

@Injectable()
export class BookingRulesCron {
  constructor(
    @InjectRepository(BookingRules)
    private readonly bookingRulesRepository: Repository<BookingRules>,
    private readonly entityManager: EntityManager
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async trigerBookingRulesEffectiveDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const time_zone = `${year}-${month}-${day}`;
    const queryRunner = this.entityManager.connection.createQueryRunner();
    console.log(date);
    try {
      console.log(
        'Booking Rules CRON Job Started _______________________________',
        moment().format()
      );
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const bookingData: any = await this.bookingRulesRepository.find({
        select: [
          'id',
          'schedule_lock_lead_time',
          'schedule_lock_lead_time_eff_date',
          'current_lock_lead_time_eff_date',
          'current_lock_lead_time',
        ],
      });

      const updatePromises = [];
      let i = 0;
      for (i = 0; i < bookingData?.length; i++) {
        const currentSchTime = bookingData[i]?.schedule_lock_lead_time;
        const currentDateObj = new Date(
          bookingData[i]?.current_lock_lead_time_eff_date
        );

        const schedule_date = bookingData[i]?.schedule_lock_lead_time_eff_date;
        const schedule_year = new Date(schedule_date).getFullYear();
        const schedule_month = new Date(schedule_date).getMonth();
        const schedule_day = new Date(schedule_date).getDate();

        const db_schedule_date = `${schedule_year}-${schedule_month}-${schedule_day}`;
        if (db_schedule_date == time_zone) {
          updatePromises.push(
            queryRunner.manager.update(
              BookingRules,
              { id: bookingData[i]?.id },
              {
                current_lock_lead_time_eff_date: schedule_date,
                schedule_lock_lead_time_eff_date: null,
                current_lock_lead_time: currentSchTime
                  ? currentSchTime
                  : bookingData[i]?.current_lock_lead_time,
                schedule_lock_lead_time: null,
              }
            )
          );
        }
      }
      await Promise.all(updatePromises);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.log(error);
    } finally {
      await queryRunner.release();
    }
  }
}
