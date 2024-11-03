import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Seeder } from 'nestjs-seeder';
import { Repository } from 'typeorm';
import { ScheduleJobDetails } from '../scheduler/entities/schedule_job_details.entity';
import './seed-schedule-job-details.json';

@Injectable()
export class ScheduleJobDetailsSeed implements Seeder {
  constructor(
    @InjectRepository(ScheduleJobDetails)
    private readonly scheduleJobsRepository: Repository<ScheduleJobDetails>
  ) {}

  async seed(): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs');
    const filePath = path.join(__dirname, './seed-schedule-job-details.json');
    const dataFile = fs.readFileSync(filePath);
    const parsedData = JSON.parse(dataFile);

    try {
      console.log('Schedule Job Details Seeder Started');

      for (const job of parsedData) {
        const isExists = await this.scheduleJobsRepository.findOne({
          where: {
            job_title: job.title,
          },
        });

        if (!isExists) {
          const item = new ScheduleJobDetails();
          item.job_title = job.title;
          item.job_description = job.description;
          item.is_active = true;
          await this.scheduleJobsRepository.save(item);
        }
      }
      console.log('Schedule Job Details Seeder Completed');
    } catch (err) {
      console.log(err);
    }
  }

  async drop(): Promise<any> {
    try {
    } catch (e) {
      console.error('Error seeding db for Schedule Job Details : ', e);
    }
  }
}
