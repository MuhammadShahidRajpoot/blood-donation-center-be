import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { FilterCriteria } from '../crm/Filters/entities/filter_criteria';
import './seed-schedule-details-notes-filters.json';
import { Repository } from 'typeorm';

@Injectable()
export class StaffingManagemenetDetailsNotesFilters implements Seeder {
  constructor(
    @InjectRepository(FilterCriteria)
    private readonly filterCriteriaRepository: Repository<FilterCriteria>
  ) {}

  async seed(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const scheduleDetailsNotesFiltersFilePath = path.join(
      __dirname,
      './seed-schedule-details-notes-filters.json'
    );

    const scheduleDetailsNotesDataFile = fs.readFileSync(
      scheduleDetailsNotesFiltersFilePath
    );

    const scheduleDetailsNotesFiltersData = JSON.parse(
      scheduleDetailsNotesDataFile
    );

    try {
      //Seeding the filter data
      for (const data of scheduleDetailsNotesFiltersData) {
        const findFilterData = await this.filterCriteriaRepository.findOne({
          where: {
            display_order: data.display_order,
            application_code: data.application_code,
          },
        });
        if (!findFilterData) {
          await this.filterCriteriaRepository.save(data);
        }
      }
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
