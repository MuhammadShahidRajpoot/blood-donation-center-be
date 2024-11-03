import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import './seed-oc-approvals.json';
import { FilterCriteria } from '../crm/Filters/entities/filter_criteria';

@Injectable()
export class OcApprovalsSeed implements Seeder {
  constructor(
    @InjectRepository(FilterCriteria)
    private readonly filterCriteriaRepository: Repository<FilterCriteria>
  ) {}

  async seed(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const ocNceFilePath = path.join(__dirname, './seed-oc-approvals.json');
    const crmAccountsDataFile = fs.readFileSync(ocNceFilePath);
    const ocNceData = JSON.parse(crmAccountsDataFile);
    try {
      for (const data of ocNceData) {
        const existingRecord = await this.filterCriteriaRepository.findOne({
          where: {
            display_order: data.display_order,
            application_code: data.application_code,
          },
        });

        if (existingRecord) {
          if (
            (data.name === 'request_date' || data.name === 'operation_date') &&
            existingRecord.criteria_type !== 'Date_Range'
          ) {
            existingRecord.criteria_type = 'Date_Range';
            await this.filterCriteriaRepository.save(existingRecord);
          }
        } else {
          await this.filterCriteriaRepository.save(data);
        }
      }
      console.log('Oc Approvals Filter Seeder Completed');
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
        `ALTER SEQUENCE public.filter_criteria_id_seq RESTART WITH 12`
      );
    } catch (e) {
      console.error('error seeding db : ', e);
    }
  }
}
