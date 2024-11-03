import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateActivityLogDto } from '../dto/create-recent-activity.dto';
import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DonorsActivities } from '../entities/recent-activity.entity';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import moment from 'moment';

@Injectable()
export class ActivityLogService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectRepository(DonorsActivities)
    private readonly donorActivityRepository: Repository<DonorsActivities>
  ) {}

  async createDonorActivity(createDonorActivityDto: CreateActivityLogDto) {
    try {
      const { resource_id, resource_type, reference, title, activity, date } =
        createDonorActivityDto;

      if (!resource_id) {
        return resError(
          `Resource ID is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      if (!resource_type) {
        return resError(
          `Resource Type is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      if (!title) {
        return resError(
          `Title is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      if (!activity) {
        return resError(
          `Activity is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      if (!date) {
        return resError(
          `Activity date time is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }

      const donorActivity = new DonorsActivities();
      donorActivity.resource_id = resource_id;
      donorActivity.resource_type = resource_type;
      donorActivity.activity = activity;
      donorActivity.title = title;
      // donorActivity.user_id = user_id;
      donorActivity.tenant_id = this.request.user?.tenant;
      donorActivity.created_by = this.request?.user;
      donorActivity.activity_at = moment(date, 'MM/DD/YYYY HH:mm:ss').toDate();
      donorActivity.reference = reference;
      const savedActivity = await this.donorActivityRepository.save(
        donorActivity
      );

      return resSuccess(
        'Donor activity created successfully',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        null
      );
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAllDonorActivities(getAllDonorActivitiesInterface: any) {
    try {
      if (!getAllDonorActivitiesInterface?.resourceId) {
        return resError(
          `Resource ID is required.`,
          ErrorConstants.Error,
          HttpStatus.BAD_REQUEST
        );
      }
      const order: any = { id: 'DESC' };
      const where: any = {
        resource_id: getAllDonorActivitiesInterface?.resourceId,
      };
      const [response, count] = await this.donorActivityRepository.findAndCount(
        {
          where,
          order,
        }
      );
      return {
        status: HttpStatus.OK,
        message: 'Donor Activities fetched successfully',
        count: count,
        data: response,
      };
    } catch (error) {
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
