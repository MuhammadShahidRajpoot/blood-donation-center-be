import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { FilterCriteria } from '../crm/Filters/entities/filter_criteria';
import seedFilters from './seed-staffing-management-staff-schedules.json';
import { Repository } from 'typeorm';

@Injectable()
export class StaffingManagementStaffSchedulesSeed implements Seeder {
  constructor(
    @InjectRepository(FilterCriteria)
    private readonly filterCriteriaRepository: Repository<FilterCriteria>
  ) {}

  async seed(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const staffSchedulesFilterDataFilePath = path.join(
      __dirname,
      './seed-staffing-management-staff-schedules.json'
    );
    const staffingManagementStaffSchedulesDataFile = fs.readFileSync(
      staffSchedulesFilterDataFilePath
    );
    const ocDrivesDataFile = fs.readFileSync(staffSchedulesFilterDataFilePath);
    const ocDrivesSeedData = JSON.parse(ocDrivesDataFile);
    try {
      //Seeding the filter data
      for (const data of ocDrivesSeedData) {
        const findFilterData = await this.filterCriteriaRepository.findOne({
          where: {
            display_order: data.display_order,
            application_code: data.application_code,
          },
        });
        console.log({ findFilterData });
        if (!findFilterData) {
          await this.filterCriteriaRepository.save(data);
        }
      }
      console.log('Staff Schedules Filter Seeder Completed');
    } catch (err) {
      console.log(err);
    }
  }

  async drop(): Promise<any> {
    try {
      await this.filterCriteriaRepository.query(
        `DELETE FROM public.filter_criteria`
      );
      await this.filterCriteriaRepository.query(
        `ALTER SEQUENCE public.filter_criteria_id_seq RESTART WITH 1`
      );
    } catch (e) {
      console.error('error seeding db : ', e);
    }
  }
}
