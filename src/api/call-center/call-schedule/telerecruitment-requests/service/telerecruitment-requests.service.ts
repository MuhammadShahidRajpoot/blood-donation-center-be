import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { REQUEST } from '@nestjs/core';
import { UserRequest } from 'src/common/interface/request';
import { DataSource, Repository } from 'typeorm';
import { TelerecruitmentRequestsInterface } from '../interface/telerecruitment-requests.interface';
import {
  resError,
  resSuccess,
} from 'src/api/system-configuration/helpers/response';
import { SuccessConstants } from 'src/api/system-configuration/constants/success.constants';
import { ErrorConstants } from 'src/api/system-configuration/constants/error.constants';
import { TelerecruitmentRequests } from '../entities/telerecruitment-requests.entity';
import { filter } from 'lodash';

@Injectable()
export class TelerecruitmentRequestsService {
  constructor(
    @Inject(REQUEST)
    private request: UserRequest,
    @InjectDataSource() private dataSource: DataSource,

    @InjectRepository(TelerecruitmentRequests)
    private readonly telerecruitmentRepository: Repository<TelerecruitmentRequests>
  ) {}

  async findAll(
    telerecruitmentRequestsInterface: TelerecruitmentRequestsInterface
  ) {
    try {
      const {
        job_status,
        drive_status,
        start_date,
        end_date,
        collection_operation_id,
        page,
        limit,
        sort_by,
        sort_order,
        search,
        ids,
      }: TelerecruitmentRequestsInterface = telerecruitmentRequestsInterface;

      let filterQuery = `WHERE 1 = 1 `;

      if (search) {
        filterQuery += `AND ( tr.account_name ILIKE '%${search}%' )`;
      }

      if (drive_status) {
        filterQuery += ` AND tr.drive_status = '${drive_status}'`;
      }

      if (start_date && end_date) {
        filterQuery += ` AND tr.drive_date BETWEEN '${start_date}' AND '${end_date}' `;
      }

      if (collection_operation_id) {
        filterQuery += ` AND tr.collection_operation IN (${collection_operation_id})`;
      }

      if (job_status) {
        filterQuery += ` AND tr.job_status = '${job_status}'`;
      }

      if (ids) {
        filterQuery += ` AND tr.id IN (${ids}) `;
      }

      const rootQuery = `SELECT * FROM (
        SELECT d.id as id, 
          d.date as drive_date,
          a.name as account_name,
          l.name as location_name,
          s.start_time as start_time,
          s.end_time as end_time,
          CASE WHEN status.name = 'Confirmed' THEN 'confirmed' ELSE 'tentative' END as drive_status,
          CONCAT(CAST(d.oef_procedures AS REAL),'/',CAST(d.oef_products AS REAL)) as projection,	
          COALESCE(tr.job_status::text,'pending') as job_status,
          d.is_multi_day_drive,
          a.collection_operation,
          d.tenant_id,
          d.tele_recruitment
          
        FROM drives d
        JOIN accounts a on a.id = d.account_id AND a.tenant_id = d.tenant_id
        JOIN crm_locations l on l.id = d.location_id AND l.tenant_id = d.tenant_id
        JOIN shifts s on s.shiftable_id = d.id  AND s.shiftable_type ='drives' AND s.tenant_id = d.tenant_id
        LEFT JOIN shifts_projections_staff p on p.shift_id = s.id
        LEFT JOIN operations_status status ON d.operation_status_id = status.id AND d.tenant_id = status.tenant_id
        LEFT JOIN telerecruitment_requests tr ON tr.drive_id = d.id

        WHERE d.is_archived = FALSE AND d.is_blueprint = FALSE AND d.tele_recruitment = TRUE
          AND d.tenant_id = ${this?.request?.user?.tenant?.id} 
        ) tr
       `;

      const pagingQuery = `
      ORDER BY
      ${sort_by} ${sort_order}
  OFFSET ${(page - 1) * limit}
  LIMIT ${limit}
      `;

      const query = `${rootQuery} ${filterQuery} ${pagingQuery} `;
      const countQuery = `SELECT COUNT(t.*) FROM (${rootQuery} ${filterQuery}) t`;

      const telerecruitments = await this.telerecruitmentRepository.query(
        query
      );
      let totalCount = await this.telerecruitmentRepository.query(countQuery);
      const count = parseInt(totalCount[0].count);
      return resSuccess(
        'Telerecruitment requests Fetched.',
        SuccessConstants.SUCCESS,
        HttpStatus.OK,
        telerecruitments,
        count
      );
    } catch (error) {
      console.log(error);
      return resError(error.message, ErrorConstants.Error, error.status);
    }
  }

  async acceptOrDecline(driveId: bigint, isAccepted: boolean) {
    try {
      const exiting: any = await this.telerecruitmentRepository.findOne({
        where: {
          drive_id: driveId,
          tenant: {
            id: this?.request?.user?.tenant?.id,
          },
        },
        relations: ['tenant'],
      });
      let request = new TelerecruitmentRequests();

      if (exiting) {
        request = exiting;
      }

      request.is_accepted = isAccepted;
      request.is_declined = !isAccepted;
      request.job_status = isAccepted ? 'pending' : 'declined';
      request.created_at = new Date();
      request.created_by = this.request?.user;
      request.tenant_id = this?.request?.user?.tenant?.id;
      request.drive_id = driveId;
      request.is_created = false;

      const updatedRequest = await this.telerecruitmentRepository.save(request);

      delete updatedRequest.created_by.tenant;
      delete updatedRequest.created_by.role;

      return resSuccess(
        'Telerecruitment updated.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        updatedRequest
      );
    } catch (error) {
      return resError(
        'Error updating Telerecruitment',
        ErrorConstants.Error,
        400,
        error
      );
    }
  }

  async assignCallJobToRequest(driveId: bigint, callJobId: bigint) {
    try {
      const exiting: any = await this.telerecruitmentRepository.findOne({
        where: {
          drive_id: driveId,
          tenant: {
            id: this?.request?.user?.tenant?.id,
          },
        },
        relations: ['tenant'],
      });
      let request = new TelerecruitmentRequests();

      if (exiting) {
        request = exiting;
      }

      request.is_accepted = true;
      request.call_job_id = callJobId;
      request.is_declined = false;
      request.is_created = true;
      request.job_status = 'created';
      request.created_at = new Date();
      request.created_by = this.request?.user;
      request.tenant_id = this?.request?.user?.tenant?.id;
      request.drive_id = driveId;

      const updatedRequest = await this.telerecruitmentRepository.save(request);
      return resSuccess(
        'Telerecruitment updated.',
        SuccessConstants.SUCCESS,
        HttpStatus.CREATED,
        updatedRequest
      );
    } catch (error) {
      return resError(
        'Error updating Telerecruitment',
        ErrorConstants.Error,
        400,
        error
      );
    }
  }
}
