import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, In, Not, LessThan } from 'typeorm';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';

import { UserRequest } from 'src/common/interface/request';
import { REQUEST } from '@nestjs/core';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { NotificationsDto } from '../dto/notifications.dto';
import { Notifications } from 'src/api/staffing-management/build-schedules/entities/notifications.entity';
import { PushNotifications } from '../entities/push-notifications.entity';
import { UserNotifications } from '../entities/user-notifications.entity';
import { TargetNotifications } from '../entities/target-notifications.entity';
import { query } from 'express';
import { NotificationsInterface } from '../interface/notification.interface';
import { NotificationsGateway } from './notifications.gateway';
import moment from 'moment';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    @Inject(REQUEST)
    private request: UserRequest,
    private readonly entityManager: EntityManager,
    @InjectRepository(PushNotifications)
    private readonly pushNotificationsRepository: Repository<PushNotifications>,

    @InjectRepository(UserNotifications)
    private readonly userNotificationsRepository: Repository<UserNotifications>,

    @InjectRepository(TargetNotifications)
    private readonly targetNotificationsRepository: Repository<TargetNotifications>
  ) {}

  async create(notificationsDto: NotificationsDto) {
    try {
      let notification = new PushNotifications();

      notification.title = notificationsDto.title;
      notification.content = notificationsDto.content;
      notification.module = notificationsDto.module;
      notification.actionable_link = notificationsDto.actionable_link;
      notification.is_archived = false;
      notification.created_by = this.request.user.id;
      notification.organizational_level = notificationsDto.organizational_level;
      notification.tenant_id = this.request.user.tenant.id;

      const savedNotification = await this.pushNotificationsRepository.save(
        notification
      );

      if (notificationsDto.user_id) {
        let userNotifications = new UserNotifications();
        userNotifications.user_id = notificationsDto.user_id;
        userNotifications.push_notification_id = savedNotification.id;
        userNotifications.is_read = false;
        userNotifications.tenant_id = this.request.user.tenant.id;
        await this.userNotificationsRepository.save(userNotifications);
      }

      if (notificationsDto.target_type_id && notificationsDto.target_type) {
        let targetNotifications = new TargetNotifications();
        targetNotifications.push_notification_id = savedNotification.id;
        targetNotifications.target_type_id = notificationsDto.target_type_id;
        targetNotifications.target_type = notificationsDto.target_type;
        targetNotifications.tenant_id = this.request.user.tenant.id;

        await this.targetNotificationsRepository.save(targetNotifications);
      }

      this.notificationsGateway.server.emit('notification', savedNotification);

      return resSuccess(
        'Notification Createds.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        savedNotification
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async findAll(req: UserRequest, notificationsInterface) {
    try {
      const {
        page = 1,
        limit = 20,
        isRead,
        sort_by = 'pu.id',
        sort_order = 'DESC',
        start_date = 'null',
        end_date = 'null',
      }: NotificationsInterface = notificationsInterface;

      let filterQuery = ` WHERE 1=1 `;

      if (isRead) {
        filterQuery += ` AND un.is_read = ${isRead} `;
      }

      if (start_date != 'null' && end_date != 'null') {
        const formattedStartDate = moment(start_date).format(
          'YYYY-MM-DD HH:mm:ss'
        );
        const formattedEndDate = moment(end_date).format('YYYY-MM-DD HH:mm:ss');
        filterQuery += ` AND pu.created_at BETWEEN '${formattedStartDate}' AND '${formattedEndDate}'`;
      }

      const rootQuery = `
          SELECT pu.*,  un.is_read FROM push_notifications pu
          JOIN user_notifications un on un.push_notification_id = pu.id  
          AND un.user_id = ${req.user.id} AND pu.tenant_id = un.tenant_id AND
          un.tenant_id = ${req.user.tenant.id}
      `;

      const pagingQuery = `
          ORDER BY
          ${sort_by} ${sort_order}
          OFFSET ${(page - 1) * limit}
          LIMIT ${limit}
      `;
      const dataQuery = `${rootQuery} ${filterQuery} ${pagingQuery} `;
      const countQuery = `SELECT COUNT(t.*) FROM (${rootQuery} ${filterQuery}) t`;

      let userNotifications = await this.pushNotificationsRepository.query(
        dataQuery
      );

      let totalCount = await this.pushNotificationsRepository.query(countQuery);

      return resSuccess(
        'Notification for User Fetched.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        userNotifications,
        totalCount
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async markAllAsRead(req: UserRequest) {
    try {
      await this.userNotificationsRepository.update(
        { tenant_id: req.user.tenant.id, user_id: req.user.id },
        { is_read: true }
      );

      this.notificationsGateway.server.emit('all_read_notification', {
        is_read: true,
      });
      return resSuccess(
        'All Notifications marked as Read',
        SuccessConstants.SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async markSingleNotificationAsRead(req: UserRequest, pushNotificationId) {
    try {
      await this.userNotificationsRepository.update(
        {
          tenant_id: req.user.tenant.id,
          push_notification_id: pushNotificationId,
        },
        { is_read: true }
      );

      this.notificationsGateway.server.emit('single_notification', true);

      return resSuccess(
        'Notification marked as Read',
        SuccessConstants.SUCCESS,
        HttpStatus.OK
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }
}
