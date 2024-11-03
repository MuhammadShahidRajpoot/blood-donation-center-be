import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { FilterSavedCriteria } from '../crm/Filters/entities/filter_saved_criteria';
import { FilterCriteria } from '../crm/Filters/entities/filter_criteria';
import { FilterSaved } from '../crm/Filters/entities/filter_saved';
import seedCrm from './seed-crm-location.json';

@Injectable()
export class CrmLocationsSeed implements Seeder {
  constructor(
    @InjectRepository(FilterCriteria)
    private readonly filterCriteriaRepository: Repository<FilterCriteria>
  ) {}

  async seed(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const filePath = path.join(__dirname, './seed-crm-location.json');
    const dataFile = fs.readFileSync(filePath);
    const seedData = JSON.parse(dataFile);
    const crmLocationsFilePath = path.join(
      __dirname,
      './seed-crm-location.json'
    );
    const crmLocationsDataFile = fs.readFileSync(crmLocationsFilePath);
    const crmLocationsSeedData = JSON.parse(crmLocationsDataFile);
    try {
      // await this.filterCriteriaRepository.query(
      //   `DELETE FROM public.filter_criteria`
      // );

      // // Reset primary key sequence
      // await this.filterCriteriaRepository.query(
      //   `ALTER SEQUENCE public.filter_criteria_id_seq RESTART WITH 1`
      // );

      //   await this.filterCriteriaRepository.query(
      //     `DELETE FROM public.permissions`
      //   );

      //   // Reset primary key sequence
      //   await this.filterCriteriaRepository.query(
      //     `ALTER SEQUENCE public.permissions_id_seq RESTART WITH 1`
      //   );
      //   await this.filterCriteriaRepository.query(`DELETE FROM public.modules`);

      // Reset primary key sequence
      //   await this.filterCriteriaRepository.query(
      //     `ALTER SEQUENCE public.modules_id_seq RESTART WITH 1`
      //   );
      //   await this.filterCriteriaRepository.query(
      //     `DELETE FROM public.applications`
      //   );

      // Reset primary key sequence
      //   await this.filterCriteriaRepository.query(
      //     `ALTER SEQUENCE public.applications_id_seq RESTART WITH 1`
      //   );
      for (const data of crmLocationsSeedData) {
        const findFilterData = await this.filterCriteriaRepository.findOne({
          where: {
            display_order: data.display_order,
            application_code: data.application_code,
          },
        });
        if (findFilterData) {
          if (
            (data.name === 'center_code' ||
              data.name === 'group_code' ||
              data.name === 'city' ||
              data.name === 'state' ||
              data.name === 'county' ||
              data.name === 'assertions') &&
            findFilterData.criteria_type !== 'Multi_Value'
          ) {
            findFilterData.criteria_type = data.criteria_type;
            await this.filterCriteriaRepository.save(findFilterData);
          }
          if (
            data.name === 'county' &&
            (data.application_code === 'crm_volunteer' ||
              data.application_code === 'crm_locations') &&
            findFilterData.name === 'country' &&
            findFilterData.display_name === 'Country'
          ) {
            findFilterData.criteria_type = data.criteria_type;
            findFilterData.display_name = data.display_name;
            findFilterData.name = data.name;
            await this.filterCriteriaRepository.save(findFilterData);
          }

          if (data.name === 'blood_type') {
            findFilterData.name = 'blood_group';
            findFilterData.display_name = 'Blood Group';
            findFilterData.criteria_type = 'Multi_Value';
            await this.filterCriteriaRepository.save(findFilterData);
          }
        } else {
          await this.filterCriteriaRepository.save(data);
        }
      }
      console.log('Location Seeder Completed');
    } catch (err) {
      console.log(err);
    }
  }

  async drop(): Promise<any> {
    try {
      await this.filterCriteriaRepository.query(
        `DELETE FROM public.filter_criteria`
      );

      // Reset primary key sequence
      await this.filterCriteriaRepository.query(
        `ALTER SEQUENCE public.filter_criteria_id_seq RESTART WITH 1`
      );
      //   await this.applicationRepository.query(`DELETE FROM public.modules`);

      //   // Reset primary key sequence
      //   await this.applicationRepository.query(
      //     `ALTER SEQUENCE public.modules_id_seq RESTART WITH 1`
      //   );
      //   await this.applicationRepository.query(`DELETE FROM public.applications`);

      //   // Reset primary key sequence
      //   await this.applicationRepository.query(
      //     `ALTER SEQUENCE public.applications_id_seq RESTART WITH 1`
      //   );
    } catch (e) {
      console.error('error seeding db : ', e);
    }
  }
}
