import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { FilterCriteria } from '../crm/Filters/entities/filter_criteria';
import seedStaff from './seed-staffing-management-staff-list.json';
import { FilterSavedCriteria } from '../crm/Filters/entities/filter_saved_criteria';

@Injectable()
export class StaffingManagementStaffListSeed implements Seeder {
  constructor(
    @InjectRepository(FilterCriteria)
    private readonly filterCriteriaRepository: Repository<FilterCriteria>,
    @InjectRepository(FilterSavedCriteria)
    private readonly filterSavedCriteriaRepository: Repository<FilterSavedCriteria>
  ) {}

  async seed(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const staffLocationsFilePath = path.join(
      __dirname,
      './seed-staffing-management-staff-list.json'
    );
    const staffingManagementStaffListDataFile = fs.readFileSync(
      staffLocationsFilePath
    );
    const staffingManagementStaffListSeedData = JSON.parse(
      staffingManagementStaffListDataFile
    );
    try {
      for (const data of staffingManagementStaffListSeedData) {
        const findFilterData: any = await this.filterCriteriaRepository.findOne(
          {
            where: {
              display_order: data.display_order,
              application_code: data.application_code,
            },
          }
        );
        // Now when the seeder runs, it will update all the filters on each run
        if (findFilterData) {
          const toBeDeletedSavedCriterias =
            await this.filterSavedCriteriaRepository.findBy({
              filter_criteria_id: { id: findFilterData?.id },
            });
          if (toBeDeletedSavedCriterias?.length > 0) {
            const deletedSavedCriterias =
              await this.filterSavedCriteriaRepository.remove(
                toBeDeletedSavedCriterias
              );

            if (deletedSavedCriterias?.length > 0) {
              const deletedRow = await this.filterCriteriaRepository.remove(
                findFilterData
              );

              if (deletedRow) {
                await this.filterCriteriaRepository.save(data);
              }
            }
          } else {
            const deletedRow = await this.filterCriteriaRepository.remove(
              findFilterData
            );

            if (deletedRow) {
              await this.filterCriteriaRepository.save(data);
            }
          }
        } else {
          await this.filterCriteriaRepository.save(data);
        }
      }
      console.log('Staff List Seeder Completed');
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
    } catch (e) {
      console.error('error seeding db : ', e);
    }
  }
}
