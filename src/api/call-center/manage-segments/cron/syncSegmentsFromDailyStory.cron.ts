import { Injectable } from '@nestjs/common';

import { Cron, CronExpression } from '@nestjs/schedule';
import { ManageSegmentsService } from '../services/manage-segments.service';
import moment from 'moment';

@Injectable()
export class DailyStoryDataSync {
  constructor(private readonly manageSegmentsService: ManageSegmentsService) {}
  @Cron(CronExpression.EVERY_HOUR)
  async triggerDailyStorySegmentsSync() {
    console.log(
      'CRON: Daily Story Segments Sync  - Job Started _______________________________',
      moment().format()
    );
    this.manageSegmentsService.updateSegmentsFromDailyStory();
  }
}
